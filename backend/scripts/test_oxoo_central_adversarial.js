require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const crypto = require('crypto');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000/api/v1/oxoo';

// Helper for PKCE
function base64url(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function runAdversarialTests() {
  console.log('================================================================');
  console.log('   OXOO CENTRAL AUTHORITATIVE CONTROL PLANE ADVERSARIAL TESTS   ');
  console.log('================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failedCount++;
    }
  }

  try {
    // TEST 1: OIDC DISCOVERY
    console.log('--- TEST 1: OIDC Discovery Endpoint ---');
    const discRes = await fetch(`${BASE_URL}/.well-known/openid-configuration`);
    const discData = await discRes.json();
    assert(discRes.status === 200, 'Discovery returns HTTP 200');
    assert(discData.authorization_endpoint.includes('/oauth/authorize'), 'Valid authorization_endpoint');
    assert(discData.token_endpoint.includes('/oauth/token'), 'Valid token_endpoint');
    assert(discData.code_challenge_methods_supported.includes('S256'), 'Enforces S256 PKCE');

    // TEST 2: PRODUCT REGISTRY
    console.log('\n--- TEST 2: Product Registry ---');
    const prodRes = await fetch(`${BASE_URL}/products`);
    const prodData = await prodRes.json();
    assert(prodRes.status === 200, 'Product registry returns HTTP 200');
    assert(prodData.products.length >= 6, `At least 6 products registered (found ${prodData.products.length})`);
    const hrmsProd = prodData.products.find(p => p.product_code === 'hrms');
    assert(hrmsProd && hrmsProd.oidc_client_id === 'oxoo-oidc-hrms', 'HRMS registered with oxoo-oidc-hrms');

    // Fetch test entities from Database
    const orgs = await pool.query('SELECT oxoo_organization_uuid, name FROM organizations WHERE oxoo_organization_uuid IS NOT NULL LIMIT 2');
    const users = await pool.query('SELECT oxoo_user_uuid, email, identity_status, role FROM users WHERE oxoo_user_uuid IS NOT NULL');

    const customerUser = users.rows.find(u => u.role !== 'super_admin' && u.role !== 'admin' && !u.email.endsWith('@primepro.ai') && !u.email.includes('admin')) || users.rows[0];
    const superAdminUser = users.rows.find(u => u.role === 'super_admin' || u.email.endsWith('@primepro.ai'));
    const testOrg1 = orgs.rows[0];
    const testOrg2 = orgs.rows[1] || orgs.rows[0];

    console.log('\nTest Fixtures:');
    console.log(`- Customer User: ${customerUser.email} (${customerUser.oxoo_user_uuid})`);
    if (superAdminUser) console.log(`- SuperAdmin User: ${superAdminUser.email} (${superAdminUser.oxoo_user_uuid})`);
    console.log(`- Test Org 1: ${testOrg1.name} (${testOrg1.oxoo_organization_uuid})`);
    console.log(`- Test Org 2: ${testOrg2.name} (${testOrg2.oxoo_organization_uuid})`);

    // Reset customer to unverified 'pending' state for testing
    await pool.query(`
      UPDATE users SET identity_status = 'pending', email_verified_at = NULL, phone_verified_at = NULL
      WHERE oxoo_user_uuid = $1
    `, [customerUser.oxoo_user_uuid]);
    await pool.query(`
      UPDATE oxoo_identity_profiles SET identity_status = 'pending', email_verified_at = NULL, phone_verified_at = NULL
      WHERE oxoo_user_uuid = $1
    `, [customerUser.oxoo_user_uuid]);

    // TEST 3: FAIL-CLOSED ON UNVERIFIED IDENTITY
    console.log('\n--- TEST 3: Fail-Closed On Unverified Identity ---');
    const unverifiedCheck = await fetch(`${BASE_URL}/entitlements/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oxoo_organization_uuid: testOrg1.oxoo_organization_uuid,
        oxoo_user_uuid: customerUser.oxoo_user_uuid,
        product_code: 'crm'
      })
    });
    const unverifiedData = await unverifiedCheck.json();
    assert(unverifiedCheck.status === 403, 'Unverified identity returns HTTP 403');
    assert(unverifiedData.allowed === false, 'Access is strictly denied (allowed: false)');
    assert(unverifiedData.error_code === 'CONTACT_UNVERIFIED', 'Error code is CONTACT_UNVERIFIED');

    // TEST 4: CONTROLLED OTP VERIFICATION
    console.log('\n--- TEST 4: Controlled OTP Verification ---');
    const otpReq = await fetch(`${BASE_URL}/identity/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oxoo_user_uuid: customerUser.oxoo_user_uuid,
        type: 'email'
      })
    });
    const otpReqData = await otpReq.json();
    assert(otpReq.status === 200, 'OTP request returns HTTP 200');
    assert(!!otpReqData.dev_hint, 'Received test OTP code');

    const otpCode = otpReqData.dev_hint ? otpReqData.dev_hint.replace('Code: ', '').trim() : '123456';

    // Test with invalid OTP first
    const badOtp = await fetch(`${BASE_URL}/identity/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oxoo_user_uuid: customerUser.oxoo_user_uuid,
        type: 'email',
        otp: '000000'
      })
    });
    assert(badOtp.status === 400, 'Invalid OTP rejected with HTTP 400');

    // Test with valid OTP
    const goodOtp = await fetch(`${BASE_URL}/identity/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oxoo_user_uuid: customerUser.oxoo_user_uuid,
        type: 'email',
        otp: otpCode
      })
    });
    const goodOtpData = await goodOtp.json();
    assert(goodOtp.status === 200, 'Valid OTP accepted with HTTP 200');
    assert(goodOtpData.verified === true, 'Verification status marked verified: true');
    assert(goodOtpData.identity_status === 'active', 'Identity status transitioned to active');

    // TEST 5: AUTHORITATIVE ENTITLEMENT EVALUATION
    console.log('\n--- TEST 5: Authoritative Entitlement Evaluation After Verification ---');
    // Ensure Org 1 has crm entitlement
    await pool.query(`
      INSERT INTO oxoo_product_entitlements (oxoo_organization_uuid, product_code, status, starts_at, ends_at)
      VALUES ($1, 'crm', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days')
      ON CONFLICT (oxoo_organization_uuid, product_code) DO UPDATE SET status = 'active', ends_at = NOW() + INTERVAL '30 days';
    `, [testOrg1.oxoo_organization_uuid]);

    const activeCheck = await fetch(`${BASE_URL}/entitlements/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oxoo_organization_uuid: testOrg1.oxoo_organization_uuid,
        oxoo_user_uuid: customerUser.oxoo_user_uuid,
        product_code: 'crm'
      })
    });
    const activeData = await activeCheck.json();
    assert(activeCheck.status === 200, 'Active entitlement check returns HTTP 200');
    assert(activeData.allowed === true, 'Entitlement access allowed: true');
    assert(activeData.status === 'active', 'Entitlement status confirmed active');

    // TEST 6: CROSS-TENANT DENIAL (ADVERSARIAL ISOLATION)
    console.log('\n--- TEST 6: Cross-Tenant Isolation Denial ---');
    const crossTenantCheck = await fetch(`${BASE_URL}/entitlements/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oxoo_organization_uuid: '00000000-0000-0000-0000-000000000000', // Non-existent foreign tenant
        oxoo_user_uuid: customerUser.oxoo_user_uuid,
        product_code: 'crm'
      })
    });
    const crossTenantData = await crossTenantCheck.json();
    assert(crossTenantCheck.status === 403, 'Foreign tenant denied with HTTP 403');
    assert(crossTenantData.allowed === false, 'Cross-tenant access blocked');
    assert(crossTenantData.error_code === 'ORGANIZATION_NOT_FOUND', 'Correct error code ORGANIZATION_NOT_FOUND');

    // TEST 7: AUDITABLE SUSPENSION (NON-DESTRUCTIVE)
    console.log('\n--- TEST 7: Auditable Suspension (Data Retention Assured) ---');
    const suspendRes = await fetch(`${BASE_URL}/entitlements/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oxoo_organization_uuid: testOrg1.oxoo_organization_uuid,
        product_code: 'crm',
        reason: 'Payment defaulted beyond 14-day grace window'
      })
    });
    const suspendData = await suspendRes.json();
    assert(suspendRes.status === 200, 'Suspension executed with HTTP 200');
    assert(suspendData.entitlement.status === 'suspended', 'Entitlement marked suspended');
    assert(!!suspendData.data_retention_guarantee, 'Zero-data-deletion policy confirmed');

    // Check entitlement post-suspension
    const suspendedCheck = await fetch(`${BASE_URL}/entitlements/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oxoo_organization_uuid: testOrg1.oxoo_organization_uuid,
        oxoo_user_uuid: customerUser.oxoo_user_uuid,
        product_code: 'crm'
      })
    });
    const suspendedData = await suspendedCheck.json();
    assert(suspendedCheck.status === 403, 'Suspended entitlement check fails closed with HTTP 403');
    assert(suspendedData.allowed === false, 'Access blocked for suspended entitlement');
    assert(suspendedData.error_code === 'ENTITLEMENT_SUSPENDED', 'Error code is ENTITLEMENT_SUSPENDED');

    // Verify database records still exist (Zero Data Loss)
    const dbCustomerCheck = await pool.query('SELECT count(*) FROM customers');
    const dbUserCheck = await pool.query('SELECT count(*) FROM users');
    assert(parseInt(dbCustomerCheck.rows[0].count, 10) > 0, 'Customers records remain intact');
    assert(parseInt(dbUserCheck.rows[0].count, 10) > 0, 'User records remain intact');

    // TEST 8: REACTIVATION
    console.log('\n--- TEST 8: Reactivation ---');
    const reactivateRes = await fetch(`${BASE_URL}/entitlements/reactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oxoo_organization_uuid: testOrg1.oxoo_organization_uuid,
        product_code: 'crm'
      })
    });
    const reactivateData = await reactivateRes.json();
    assert(reactivateRes.status === 200, 'Reactivation returns HTTP 200');
    assert(reactivateData.entitlement.status === 'active', 'Entitlement status restored to active');

    // TEST 9: PKCE AUTHORIZATION CODE FLOW & REPLAY PROTECTION
    console.log('\n--- TEST 9: PKCE Authorization Code Flow & Replay Protection ---');
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());

    const authRes = await fetch(`${BASE_URL}/oauth/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: 'oxoo-oidc-crm',
        redirect_uri: 'http://localhost:5173/demo/sales',
        response_type: 'code',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'openid profile email oxoo:entitlements',
        state: 'nonce_test_state_12345',
        oxoo_user_uuid: customerUser.oxoo_user_uuid
      })
    });
    const authData = await authRes.json();
    assert(authRes.status === 200, 'Authorization code issued with HTTP 200');
    assert(!!authData.code, 'Auth code present in response');

    // Exchange code for tokens
    const tokenRes = await fetch(`${BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: 'oxoo-oidc-crm',
        code: authData.code,
        code_verifier: codeVerifier,
        redirect_uri: 'http://localhost:5173/demo/sales'
      })
    });
    const tokenData = await tokenRes.json();
    assert(tokenRes.status === 200, 'Token exchanged with HTTP 200');
    assert(!!tokenData.access_token, 'Received access_token');
    assert(!!tokenData.id_token, 'Received id_token');

    // REPLAY ATTACK TEST: Try exchanging the same code again
    const replayRes = await fetch(`${BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: 'oxoo-oidc-crm',
        code: authData.code,
        code_verifier: codeVerifier,
        redirect_uri: 'http://localhost:5173/demo/sales'
      })
    });
    assert(replayRes.status === 400, 'Replay attack strictly blocked with HTTP 400');

    // TEST 10: USERINFO WITH CANONICAL CLAIMS
    console.log('\n--- TEST 10: UserInfo Endpoint ---');
    const userinfoRes = await fetch(`${BASE_URL}/oauth/userinfo`, {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    const userinfoData = await userinfoRes.json();
    assert(userinfoRes.status === 200, 'UserInfo returns HTTP 200');
    assert(userinfoData.oxoo_user_uuid === customerUser.oxoo_user_uuid, 'Canonical oxoo_user_uuid returned in claims');
    assert(userinfoData.email_verified === true, 'email_verified true in claims');

    // TEST 11: AUDIT LOGS IN oxoo_identity_link_events
    console.log('\n--- TEST 11: Audit Logs Verification ---');
    const auditRes = await pool.query(`
      SELECT count(*) as count FROM oxoo_identity_link_events
      WHERE created_at >= NOW() - INTERVAL '15 minutes';
    `);
    const count = parseInt(auditRes.rows[0].count, 10);
    assert(count >= 5, `Audit events captured in oxoo_identity_link_events (count: ${count})`);

    console.log('\n================================================================');
    console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
    console.log('================================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAdversarialTests();
