const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { query } = require('./db');
const { sendOtpEmail } = require('./emailService');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'oxoo-super-secret-jwt-key-2026';
const ISSUER = process.env.PrimePro_CENTRAL_ISSUER || 'http://localhost:5000/api/v1/oxoo';

// In-memory store for PKCE auth codes and OTP challenges (with expiration)
const authCodesStore = new Map(); // code -> { clientId, userUuid, orgUuid, codeChallenge, redirectUri, scope, expiresAt }
const otpStore = new Map(); // `${userUuid}:${type}` -> { otp, expiresAt, attempts }

// Helper for phone normalization (E.164)
function normalizePhone(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (!cleaned) return null;
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
}

// Audit helper for PrimePro Identity Link Events
async function logLinkEvent({
  productCode = 'oxoo_central',
  eventType,
  userUuid = null,
  orgUuid = null,
  productUserId = null,
  productTenantId = null,
  correlationId = null,
  outcome = 'success',
  details = {}
}) {
  try {
    await query(`
      INSERT INTO public.oxoo_identity_link_events (
        product_code, event_type, oxoo_user_uuid, oxoo_organization_uuid,
        product_user_id, product_tenant_id, correlation_id, outcome, details, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW());
    `, [
      productCode,
      eventType,
      userUuid,
      orgUuid,
      productUserId,
      productTenantId,
      correlationId || `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      outcome,
      JSON.stringify(details)
    ]);
  } catch (err) {
    console.error('Failed to log identity link event:', err.message);
  }
}

// -------------------------------------------------------------
// 1. OIDC DISCOVERY & METADATA
// -------------------------------------------------------------
router.get('/.well-known/openid-configuration', (req, res) => {
  res.json({
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/oauth/authorize`,
    token_endpoint: `${ISSUER}/oauth/token`,
    userinfo_endpoint: `${ISSUER}/oauth/userinfo`,
    jwks_uri: `${ISSUER}/.well-known/jwks.json`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['HS256'],
    scopes_supported: [
      'openid',
      'profile',
      'email',
      'phone',
      'oxoo:tenant',
      'oxoo:entitlements'
    ],
    claims_supported: [
      'sub',
      'iss',
      'aud',
      'oxoo_user_uuid',
      'oxoo_organization_uuid',
      'name',
      'email',
      'email_verified',
      'phone',
      'phone_verified',
      'identity_status',
      'entitlements',
      'roles'
    ],
    service_documentation: 'https://docs.primepro.ai/central-control-plane',
    central_authority: 'PrimePro.ai Authoritative Control Plane'
  });
});

// -------------------------------------------------------------
// 2. PRODUCT REGISTRY
// -------------------------------------------------------------
router.get('/products', async (_req, res) => {
  try {
    const prods = await query(`
      SELECT product_code, display_name, base_url, oidc_client_id, enabled
      FROM public.oxoo_product_registry
      WHERE enabled = true
      ORDER BY product_code ASC;
    `);
    res.json({ products: prods.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve product registry', message: err.message });
  }
});

// -------------------------------------------------------------
// 3. OIDC / PKCE AUTHORIZATION CODE FLOW
// -------------------------------------------------------------
router.post('/oauth/authorize', async (req, res) => {
  const {
    client_id,
    redirect_uri,
    response_type = 'code',
    code_challenge,
    code_challenge_method = 'S256',
    scope = 'openid profile email oxoo:entitlements',
    state,
    oxoo_user_uuid,
    user_email
  } = req.body;

  if (response_type !== 'code') {
    return res.status(400).json({ error: 'unsupported_response_type', message: 'Only response_type=code is supported.' });
  }

  if (!code_challenge || code_challenge_method !== 'S256') {
    return res.status(400).json({ error: 'invalid_request', message: 'PKCE S256 code_challenge is mandatory.' });
  }

  // Validate client_id against oxoo_product_registry
  const prodCheck = await query(
    'SELECT product_code, display_name, base_url FROM public.oxoo_product_registry WHERE oidc_client_id = $1 AND enabled = true',
    [client_id]
  );
  if (prodCheck.rows.length === 0) {
    await logLinkEvent({
      eventType: 'oauth_authorize_denied',
      outcome: 'denied',
      details: { reason: 'unknown_client_id', client_id }
    });
    return res.status(400).json({ error: 'unauthorized_client', message: 'Unknown or disabled client_id.' });
  }
  const product = prodCheck.rows[0];

  // Resolve user
  let userRes;
  if (oxoo_user_uuid) {
    userRes = await query(`
      SELECT u.id, u.name, u.email, u.role, u.oxoo_user_uuid, u.identity_status, u.organization,
             p.email_verified_at, p.phone_verified_at
      FROM users u
      LEFT JOIN oxoo_identity_profiles p ON p.oxoo_user_uuid = u.oxoo_user_uuid
      WHERE u.oxoo_user_uuid = $1
    `, [oxoo_user_uuid]);
  } else if (user_email) {
    userRes = await query(`
      SELECT u.id, u.name, u.email, u.role, u.oxoo_user_uuid, u.identity_status, u.organization,
             p.email_verified_at, p.phone_verified_at
      FROM users u
      LEFT JOIN oxoo_identity_profiles p ON p.oxoo_user_uuid = u.oxoo_user_uuid
      WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
    `, [user_email]);
  }

  if (!userRes || userRes.rows.length === 0) {
    return res.status(404).json({ error: 'user_not_found', message: 'No valid user found for authorization.' });
  }

  const user = userRes.rows[0];

  // Resolve user's organization
  let orgRes = await query(`
    SELECT id, oxoo_organization_uuid, name, status 
    FROM organizations 
    WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) OR id::text = $1
    LIMIT 1;
  `, [user.organization || '']);

  let orgUuid = orgRes.rows[0]?.oxoo_organization_uuid || null;
  if (!orgUuid) {
    // Check if user is PrimePro internal staff
    if (user.role === 'super_admin' || (user.email && user.email.endsWith('@primepro.ai'))) {
      const pOrg = await query(`SELECT oxoo_organization_uuid FROM organizations WHERE name LIKE '%PrimePro%' LIMIT 1;`);
      orgUuid = pOrg.rows[0]?.oxoo_organization_uuid || null;
    }
  }

  // Generate 5-minute single-use auth code
  const code = `oxoo_auth_${crypto.randomBytes(24).toString('hex')}`;
  const expiresAt = Date.now() + 5 * 60 * 1000;

  authCodesStore.set(code, {
    clientId: client_id,
    productCode: product.product_code,
    userUuid: user.oxoo_user_uuid,
    orgUuid: orgUuid,
    codeChallenge: code_challenge,
    redirectUri: redirect_uri,
    scope,
    state,
    expiresAt
  });

  await logLinkEvent({
    productCode: product.product_code,
    eventType: 'oauth_code_issued',
    userUuid: user.oxoo_user_uuid,
    orgUuid: orgUuid,
    correlationId: state,
    outcome: 'success',
    details: { client_id, scope }
  });

  res.json({
    code,
    state,
    expires_in: 300,
    redirect_uri: redirect_uri || product.base_url
  });
});

// Exchange Authorization Code with PKCE for Token
router.post('/oauth/token', async (req, res) => {
  const {
    grant_type = 'authorization_code',
    client_id,
    code,
    code_verifier,
    redirect_uri
  } = req.body;

  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ error: 'unsupported_grant_type', message: 'Only authorization_code grant is supported.' });
  }

  if (!code || !authCodesStore.has(code)) {
    return res.status(400).json({ error: 'invalid_grant', message: 'Authorization code is invalid or has already been used (replay protected).' });
  }

  const storedCode = authCodesStore.get(code);
  // Replay protection: immediately burn the code
  authCodesStore.delete(code);

  if (Date.now() > storedCode.expiresAt) {
    return res.status(400).json({ error: 'invalid_grant', message: 'Authorization code has expired.' });
  }

  if (storedCode.clientId !== client_id) {
    return res.status(400).json({ error: 'invalid_grant', message: 'Client ID mismatch.' });
  }

  // Validate PKCE code_verifier
  if (!code_verifier) {
    return res.status(400).json({ error: 'invalid_request', message: 'PKCE code_verifier required.' });
  }
  const computedChallenge = crypto
    .createHash('sha256')
    .update(code_verifier)
    .digest('base64url');

  if (computedChallenge !== storedCode.codeChallenge) {
    await logLinkEvent({
      productCode: storedCode.productCode,
      eventType: 'oauth_token_denied',
      outcome: 'denied',
      details: { reason: 'pkce_verification_failed' }
    });
    return res.status(400).json({ error: 'invalid_grant', message: 'PKCE code_verifier verification failed.' });
  }

  // Fetch fresh user and profile details
  const userRes = await query(`
    SELECT u.id, u.name, u.email, u.phone, u.role, u.oxoo_user_uuid, u.identity_status,
           p.normalized_email, p.normalized_phone, p.email_verified_at, p.phone_verified_at,
           p.identity_status as profile_status
    FROM users u
    LEFT JOIN oxoo_identity_profiles p ON p.oxoo_user_uuid = u.oxoo_user_uuid
    WHERE u.oxoo_user_uuid = $1
  `, [storedCode.userUuid]);

  if (userRes.rows.length === 0) {
    return res.status(404).json({ error: 'user_not_found', message: 'User not found.' });
  }
  const user = userRes.rows[0];

  // Fetch active entitlements for this organization
  let entitlements = [];
  if (storedCode.orgUuid) {
    const entRes = await query(`
      SELECT product_code, status, starts_at, ends_at, limits
      FROM oxoo_product_entitlements
      WHERE oxoo_organization_uuid = $1 AND status IN ('active', 'trialing', 'grace')
    `, [storedCode.orgUuid]);
    entitlements = entRes.rows;
  }

  const payload = {
    sub: user.oxoo_user_uuid,
    iss: ISSUER,
    aud: client_id,
    oxoo_user_uuid: user.oxoo_user_uuid,
    oxoo_organization_uuid: storedCode.orgUuid,
    name: user.name,
    email: user.email,
    email_verified: !!user.email_verified_at,
    phone: user.phone,
    phone_verified: !!user.phone_verified_at,
    identity_status: user.identity_status || user.profile_status || 'pending',
    product_code: storedCode.productCode,
    entitlements: entitlements.map(e => e.product_code),
    role: user.role
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  const idToken = jwt.sign({
    ...payload,
    at_hash: crypto.createHash('sha256').update(accessToken).digest('hex').slice(0, 16)
  }, JWT_SECRET, { expiresIn: '1h' });

  await logLinkEvent({
    productCode: storedCode.productCode,
    eventType: 'oauth_token_issued',
    userUuid: user.oxoo_user_uuid,
    orgUuid: storedCode.orgUuid,
    outcome: 'success',
    details: { client_id, scopes: storedCode.scope }
  });

  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    id_token: idToken,
    scope: storedCode.scope
  });
});

// UserInfo Endpoint
router.get('/oauth/userinfo', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized', message: 'Bearer token required.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const userRes = await query(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.oxoo_user_uuid, u.identity_status,
             p.normalized_email, p.normalized_phone, p.email_verified_at, p.phone_verified_at,
             p.identity_status as profile_status
      FROM users u
      LEFT JOIN oxoo_identity_profiles p ON p.oxoo_user_uuid = u.oxoo_user_uuid
      WHERE u.oxoo_user_uuid = $1
    `, [decoded.oxoo_user_uuid || decoded.sub]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'user_not_found', message: 'User does not exist.' });
    }

    const u = userRes.rows[0];
    res.json({
      sub: u.oxoo_user_uuid,
      oxoo_user_uuid: u.oxoo_user_uuid,
      oxoo_organization_uuid: decoded.oxoo_organization_uuid,
      name: u.name,
      email: u.email,
      email_verified: !!u.email_verified_at,
      email_verified_at: u.email_verified_at,
      phone: u.phone,
      phone_verified: !!u.phone_verified_at,
      phone_verified_at: u.phone_verified_at,
      identity_status: u.identity_status || u.profile_status,
      role: u.role,
      entitlements: decoded.entitlements || []
    });
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token', message: err.message });
  }
});

// -------------------------------------------------------------
// 4. AUTHORITATIVE SERVER-SIDE ENTITLEMENT EVALUATION (FAIL-CLOSED)
// -------------------------------------------------------------
router.post('/entitlements/check', async (req, res) => {
  const { oxoo_organization_uuid, oxoo_user_uuid, product_code } = req.body;

  if (!oxoo_organization_uuid || !product_code) {
    return res.status(400).json({
      allowed: false,
      error_code: 'BAD_REQUEST',
      reason: 'Missing oxoo_organization_uuid or product_code.'
    });
  }

  // 1. Check Product in Registry
  const prodRes = await query(
    'SELECT product_code, display_name, enabled FROM oxoo_product_registry WHERE product_code = $1',
    [product_code]
  );
  if (prodRes.rows.length === 0 || !prodRes.rows[0].enabled) {
    await logLinkEvent({
      productCode: product_code,
      eventType: 'entitlement_check',
      userUuid: oxoo_user_uuid,
      orgUuid: oxoo_organization_uuid,
      outcome: 'denied',
      details: { reason: 'product_disabled_or_unregistered' }
    });
    return res.status(403).json({
      allowed: false,
      error_code: 'PRODUCT_UNAVAILABLE',
      reason: `Product '${product_code}' is not registered or disabled in PrimePro Central.`
    });
  }

  // 2. Check User Identity Verification Status (if user is provided)
  let user = null;
  if (oxoo_user_uuid) {
    const userRes = await query(`
      SELECT u.id, u.name, u.email, u.role, u.oxoo_user_uuid, u.identity_status,
             p.email_verified_at, p.phone_verified_at
      FROM users u
      LEFT JOIN oxoo_identity_profiles p ON p.oxoo_user_uuid = u.oxoo_user_uuid
      WHERE u.oxoo_user_uuid = $1
    `, [oxoo_user_uuid]);

    if (userRes.rows.length === 0) {
      await logLinkEvent({
        productCode: product_code,
        eventType: 'entitlement_check',
        userUuid: oxoo_user_uuid,
        orgUuid: oxoo_organization_uuid,
        outcome: 'denied',
        details: { reason: 'user_not_found' }
      });
      return res.status(403).json({
        allowed: false,
        error_code: 'USER_NOT_FOUND',
        reason: 'The specified identity does not exist in PrimePro Central.'
      });
    }
    user = userRes.rows[0];

    // Check identity status
    if (user.identity_status === 'locked' || user.identity_status === 'disabled') {
      await logLinkEvent({
        productCode: product_code,
        eventType: 'entitlement_check',
        userUuid: oxoo_user_uuid,
        orgUuid: oxoo_organization_uuid,
        outcome: 'denied',
        details: { reason: 'identity_locked_or_disabled', status: user.identity_status }
      });
      return res.status(403).json({
        allowed: false,
        error_code: 'IDENTITY_LOCKED',
        reason: `Identity is currently ${user.identity_status}. Access denied.`
      });
    }

    // Fail-closed verification rule: Must be active and have verified contacts (unless superadmin)
    const isSuperAdmin = user.role === 'super_admin' || (user.email && user.email.endsWith('@primepro.ai'));
    if (!isSuperAdmin) {
      if (user.identity_status === 'pending' || !user.email_verified_at) {
        await logLinkEvent({
          productCode: product_code,
          eventType: 'entitlement_check',
          userUuid: oxoo_user_uuid,
          orgUuid: oxoo_organization_uuid,
          outcome: 'denied',
          details: { reason: 'unverified_identity', email_verified: !!user.email_verified_at }
        });
        return res.status(403).json({
          allowed: false,
          error_code: 'CONTACT_UNVERIFIED',
          reason: 'Access denied: Identity email/phone verification has not been completed. OTP verification required.'
        });
      }
    }
  }

  // 3. Check Organization Status
  const orgRes = await query(
    'SELECT id, name, status, oxoo_organization_uuid FROM organizations WHERE oxoo_organization_uuid = $1',
    [oxoo_organization_uuid]
  );
  if (orgRes.rows.length === 0) {
    await logLinkEvent({
      productCode: product_code,
      eventType: 'entitlement_check',
      userUuid: oxoo_user_uuid,
      orgUuid: oxoo_organization_uuid,
      outcome: 'denied',
      details: { reason: 'organization_not_found' }
    });
    return res.status(403).json({
      allowed: false,
      error_code: 'ORGANIZATION_NOT_FOUND',
      reason: 'The specified organization tenant does not exist in PrimePro Central.'
    });
  }
  const org = orgRes.rows[0];
  if (org.status && org.status.toLowerCase() === 'suspended') {
    await logLinkEvent({
      productCode: product_code,
      eventType: 'entitlement_check',
      userUuid: oxoo_user_uuid,
      orgUuid: oxoo_organization_uuid,
      outcome: 'denied',
      details: { reason: 'organization_suspended' }
    });
    return res.status(403).json({
      allowed: false,
      error_code: 'ORGANIZATION_SUSPENDED',
      reason: 'Organization account is suspended due to billing or compliance policy. Data is retained.'
    });
  }

  // 4. Check Product Entitlement in oxoo_product_entitlements
  const entRes = await query(`
    SELECT id, oxoo_organization_uuid, product_code, status, starts_at, ends_at,
           suspended_at, suspension_reason, limits, metadata
    FROM oxoo_product_entitlements
    WHERE oxoo_organization_uuid = $1 AND product_code = $2;
  `, [oxoo_organization_uuid, product_code]);

  if (entRes.rows.length === 0) {
    await logLinkEvent({
      productCode: product_code,
      eventType: 'entitlement_check',
      userUuid: oxoo_user_uuid,
      orgUuid: oxoo_organization_uuid,
      outcome: 'denied',
      details: { reason: 'no_entitlement_record' }
    });
    return res.status(403).json({
      allowed: false,
      error_code: 'NO_ENTITLEMENT',
      reason: `No entitlement record found for product '${product_code}' under organization '${org.name}'.`
    });
  }

  const ent = entRes.rows[0];
  const now = new Date();

  // Fail-closed checks on entitlement status
  if (ent.status === 'suspended') {
    await logLinkEvent({
      productCode: product_code,
      eventType: 'entitlement_check',
      userUuid: oxoo_user_uuid,
      orgUuid: oxoo_organization_uuid,
      outcome: 'denied',
      details: { reason: 'entitlement_suspended', suspension_reason: ent.suspension_reason }
    });
    return res.status(403).json({
      allowed: false,
      error_code: 'ENTITLEMENT_SUSPENDED',
      reason: `Entitlement to '${product_code}' is suspended: ${ent.suspension_reason || 'Non-payment policy'}. Business data retained.`,
      suspended_at: ent.suspended_at
    });
  }

  if (ent.status === 'expired' || ent.status === 'cancelled') {
    await logLinkEvent({
      productCode: product_code,
      eventType: 'entitlement_check',
      userUuid: oxoo_user_uuid,
      orgUuid: oxoo_organization_uuid,
      outcome: 'denied',
      details: { reason: 'entitlement_expired', status: ent.status }
    });
    return res.status(403).json({
      allowed: false,
      error_code: 'ENTITLEMENT_EXPIRED',
      reason: `Entitlement to '${product_code}' has expired or been cancelled.`,
      ends_at: ent.ends_at
    });
  }

  // Check validity dates
  if (ent.ends_at && new Date(ent.ends_at) < now && ent.status !== 'grace') {
    await logLinkEvent({
      productCode: product_code,
      eventType: 'entitlement_check',
      userUuid: oxoo_user_uuid,
      orgUuid: oxoo_organization_uuid,
      outcome: 'denied',
      details: { reason: 'entitlement_period_ended', ends_at: ent.ends_at }
    });
    return res.status(403).json({
      allowed: false,
      error_code: 'ENTITLEMENT_PERIOD_ENDED',
      reason: `Entitlement period ended on ${ent.ends_at.toISOString()}. Renewal required.`,
      ends_at: ent.ends_at
    });
  }

  // ALL CHECKS PASSED -> ACCESS GRANTED
  await logLinkEvent({
    productCode: product_code,
    eventType: 'entitlement_check',
    userUuid: oxoo_user_uuid,
    orgUuid: oxoo_organization_uuid,
    outcome: 'success',
    details: { status: ent.status, ends_at: ent.ends_at }
  });

  return res.json({
    allowed: true,
    status: ent.status,
    product_code: ent.product_code,
    oxoo_organization_uuid: ent.oxoo_organization_uuid,
    oxoo_user_uuid: oxoo_user_uuid || null,
    limits: ent.limits || {},
    ends_at: ent.ends_at,
    evaluated_at: now.toISOString()
  });
});

// Also provide GET /entitlements/check with query params
router.get('/entitlements/check', async (req, res) => {
  const { oxoo_organization_uuid, oxoo_user_uuid, product_code } = req.query;
  req.body = { oxoo_organization_uuid, oxoo_user_uuid, product_code };
  // Delegate to POST handler
  return router.handle(req, res);
});

// -------------------------------------------------------------
// 5. CONTROLLED OTP VERIFICATION (EMAIL & PHONE)
// -------------------------------------------------------------
router.post('/identity/request-otp', async (req, res) => {
  const { oxoo_user_uuid, type = 'email' } = req.body;

  if (!oxoo_user_uuid || !['email', 'phone'].includes(type)) {
    return res.status(400).json({ error: 'invalid_request', message: 'oxoo_user_uuid and valid type (email|phone) required.' });
  }

  const userRes = await query(`
    SELECT id, name, email, phone, oxoo_user_uuid FROM users WHERE oxoo_user_uuid = $1
  `, [oxoo_user_uuid]);

  if (userRes.rows.length === 0) {
    return res.status(404).json({ error: 'user_not_found', message: 'User not found.' });
  }

  const user = userRes.rows[0];
  const target = type === 'email' ? user.email : user.phone;
  if (!target) {
    return res.status(400).json({ error: 'missing_contact', message: `No ${type} registered for this user.` });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const key = `${oxoo_user_uuid}:${type}`;
  otpStore.set(key, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0
  });

  if (type === 'email') {
    try {
      await sendOtpEmail(target, otp);
    } catch (e) {
      console.log(`[OTP Email Fallback] OTP for ${target} is ${otp}`);
    }
  } else {
    console.log(`[OTP SMS Service] Simulated SMS to ${target}: Your PrimePro verification code is ${otp}`);
  }

  res.json({
    message: `Verification code sent to your ${type}.`,
    type,
    expires_in: 600,
    dev_hint: process.env.NODE_ENV !== 'production' ? `Code: ${otp}` : undefined
  });
});

router.post('/identity/verify-otp', async (req, res) => {
  const { oxoo_user_uuid, type = 'email', otp } = req.body;

  if (!oxoo_user_uuid || !otp) {
    return res.status(400).json({ error: 'invalid_request', message: 'oxoo_user_uuid and otp required.' });
  }

  const key = `${oxoo_user_uuid}:${type}`;
  const stored = otpStore.get(key);

  if (!stored) {
    return res.status(400).json({ error: 'invalid_otp', message: 'No active OTP request found or code expired.' });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return res.status(400).json({ error: 'otp_expired', message: 'OTP has expired. Please request a new one.' });
  }

  if (stored.otp !== String(otp).trim()) {
    stored.attempts = (stored.attempts || 0) + 1;
    if (stored.attempts >= 5) {
      otpStore.delete(key);
      return res.status(400).json({ error: 'too_many_attempts', message: 'Too many invalid attempts. Code invalidated.' });
    }
    return res.status(400).json({ error: 'invalid_otp', message: 'Incorrect OTP code.' });
  }

  // OTP is verified! Clean up
  otpStore.delete(key);
  const now = new Date();

  // Update verified timestamp on oxoo_identity_profiles and users
  const isEmail = type === 'email';
  await query(`
    UPDATE oxoo_identity_profiles SET
      email_verified_at = CASE WHEN $1 = true THEN $2 ELSE email_verified_at END,
      phone_verified_at = CASE WHEN $1 = false THEN $2 ELSE phone_verified_at END,
      updated_at = NOW()
    WHERE oxoo_user_uuid = $3;
  `, [isEmail, now, oxoo_user_uuid]);

  await query(`
    UPDATE users SET
      email_verified_at = CASE WHEN $1 = true THEN $2 ELSE email_verified_at END,
      phone_verified_at = CASE WHEN $1 = false THEN $2 ELSE phone_verified_at END,
      updated_at = NOW()
    WHERE oxoo_user_uuid = $3;
  `, [isEmail, now, oxoo_user_uuid]);

  // Check if both email and phone are now verified, or if email verification is sufficient to activate
  const profRes = await query(`
    SELECT email_verified_at, phone_verified_at, identity_status
    FROM oxoo_identity_profiles WHERE oxoo_user_uuid = $1
  `, [oxoo_user_uuid]);

  let updatedStatus = 'pending';
  if (profRes.rows.length > 0) {
    const prof = profRes.rows[0];
    if (prof.email_verified_at) {
      updatedStatus = 'active';
      await query(`
        UPDATE oxoo_identity_profiles SET identity_status = 'active', updated_at = NOW() WHERE oxoo_user_uuid = $1;
      `, [oxoo_user_uuid]);
      await query(`
        UPDATE users SET identity_status = 'active', updated_at = NOW() WHERE oxoo_user_uuid = $1;
      `, [oxoo_user_uuid]);
    }
  }

  await logLinkEvent({
    eventType: `identity_${type}_verified`,
    userUuid: oxoo_user_uuid,
    outcome: 'success',
    details: { type, verified_at: now, identity_status: updatedStatus }
  });

  res.json({
    message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully!`,
    verified: true,
    identity_status: updatedStatus,
    verified_at: now.toISOString()
  });
});

// -------------------------------------------------------------
// 6. AUDITABLE SUSPENSION & REACTIVATION (NON-DESTRUCTIVE)
// -------------------------------------------------------------
router.post('/entitlements/suspend', async (req, res) => {
  const { oxoo_organization_uuid, product_code, reason = 'Non-payment after grace period' } = req.body;

  if (!oxoo_organization_uuid || !product_code) {
    return res.status(400).json({ error: 'invalid_request', message: 'oxoo_organization_uuid and product_code required.' });
  }

  const now = new Date();
  const updateRes = await query(`
    UPDATE oxoo_product_entitlements SET
      status = 'suspended',
      suspended_at = $1,
      suspension_reason = $2,
      updated_at = NOW()
    WHERE oxoo_organization_uuid = $3 AND product_code = $4
    RETURNING id, oxoo_organization_uuid, product_code, status, suspended_at, suspension_reason;
  `, [now, reason, oxoo_organization_uuid, product_code]);

  if (updateRes.rows.length === 0) {
    return res.status(404).json({ error: 'entitlement_not_found', message: 'No entitlement record found to suspend.' });
  }

  await logLinkEvent({
    productCode: product_code,
    eventType: 'entitlement_suspended',
    orgUuid: oxoo_organization_uuid,
    outcome: 'success',
    details: { reason, suspended_at: now, data_retention: 'RETAINED_ALL_BUSINESS_DATA' }
  });

  res.json({
    message: `Entitlement to ${product_code} suspended successfully. All tenant data is strictly preserved.`,
    entitlement: updateRes.rows[0],
    data_retention_guarantee: 'Zero data deleted. Operational database records preserved.'
  });
});

router.post('/entitlements/reactivate', async (req, res) => {
  const { oxoo_organization_uuid, product_code, new_ends_at } = req.body;

  if (!oxoo_organization_uuid || !product_code) {
    return res.status(400).json({ error: 'invalid_request', message: 'oxoo_organization_uuid and product_code required.' });
  }

  const updateRes = await query(`
    UPDATE oxoo_product_entitlements SET
      status = 'active',
      suspended_at = NULL,
      suspension_reason = NULL,
      ends_at = COALESCE($1::timestamptz, ends_at),
      updated_at = NOW()
    WHERE oxoo_organization_uuid = $2 AND product_code = $3
    RETURNING id, oxoo_organization_uuid, product_code, status, starts_at, ends_at;
  `, [new_ends_at || null, oxoo_organization_uuid, product_code]);

  if (updateRes.rows.length === 0) {
    return res.status(404).json({ error: 'entitlement_not_found', message: 'No entitlement record found to reactivate.' });
  }

  await logLinkEvent({
    productCode: product_code,
    eventType: 'entitlement_reactivated',
    orgUuid: oxoo_organization_uuid,
    outcome: 'success',
    details: { reactivated_at: new Date() }
  });

  res.json({
    message: `Entitlement to ${product_code} reactivated successfully.`,
    entitlement: updateRes.rows[0]
  });
});

// -------------------------------------------------------------
// 7. TENANT & CANONICAL RESOLUTION
// -------------------------------------------------------------
router.get('/tenants/resolve', async (req, res) => {
  const { oxoo_organization_uuid, subdomain } = req.query;

  if (!oxoo_organization_uuid && !subdomain) {
    return res.status(400).json({ error: 'invalid_request', message: 'oxoo_organization_uuid or subdomain required.' });
  }

  let orgRes;
  if (oxoo_organization_uuid) {
    orgRes = await query(`
      SELECT id, name, plan, status, subdomain, custom_domain, oxoo_organization_uuid, created_at
      FROM organizations
      WHERE oxoo_organization_uuid = $1;
    `, [oxoo_organization_uuid]);
  } else {
    orgRes = await query(`
      SELECT id, name, plan, status, subdomain, custom_domain, oxoo_organization_uuid, created_at
      FROM organizations
      WHERE LOWER(subdomain) = LOWER($1) OR LOWER(custom_domain) = LOWER($1);
    `, [subdomain]);
  }

  if (orgRes.rows.length === 0) {
    return res.status(404).json({ error: 'organization_not_found', message: 'Organization not found.' });
  }

  const org = orgRes.rows[0];

  // Retrieve active product entitlements
  const entRes = await query(`
    SELECT e.product_code, r.display_name, r.base_url, e.status, e.starts_at, e.ends_at, e.limits
    FROM oxoo_product_entitlements e
    JOIN oxoo_product_registry r ON r.product_code = e.product_code
    WHERE e.oxoo_organization_uuid = $1
    ORDER BY e.product_code ASC;
  `, [org.oxoo_organization_uuid]);

  res.json({
    organization: org,
    entitlements: entRes.rows,
    is_internal_primepro: org.name.includes('PrimePro') || org.name.includes('PrimePro.ai Core')
  });
});

module.exports = router;
