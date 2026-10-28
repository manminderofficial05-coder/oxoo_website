require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper for phone normalization (E.164)
function normalizePhone(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (!cleaned) return null;
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
}

async function runBackfill() {
  const client = await pool.connect();
  try {
    console.log('=== STARTING OXOO CENTRAL CONTROLLED BACKFILL ===');
    await client.query('BEGIN');

    // 1. POPULATE OXOO PRODUCT REGISTRY
    console.log('\n1. Seeding oxoo_product_registry...');
    const products = [
      {
        product_code: 'hrms',
        display_name: 'Employee360 HRMS',
        base_url: 'http://localhost:5173/demo/hrms',
        oidc_client_id: 'oxoo-oidc-hrms'
      },
      {
        product_code: 'finance',
        display_name: 'Invoice360 & Finance',
        base_url: 'http://localhost:5173/demo/finance',
        oidc_client_id: 'oxoo-oidc-finance'
      },
      {
        product_code: 'crm',
        display_name: 'SalesWorks360 CRM',
        base_url: 'http://localhost:5173/demo/sales',
        oidc_client_id: 'oxoo-oidc-crm'
      },
      {
        product_code: 'inventory',
        display_name: 'SupplyChain360',
        base_url: 'http://localhost:5173/demo/supply-chain',
        oidc_client_id: 'oxoo-oidc-inventory'
      },
      {
        product_code: 'ai_sales',
        display_name: 'AI Sales Agent Studio',
        base_url: 'http://localhost:5173/demo/ai',
        oidc_client_id: 'oxoo-oidc-aisales'
      },
      {
        product_code: 'website_builder',
        display_name: 'OXOO Website Builder & Applications',
        base_url: 'http://localhost:5173/demo/website-demo',
        oidc_client_id: 'oxoo-oidc-website'
      }
    ];

    for (const p of products) {
      await client.query(`
        INSERT INTO public.oxoo_product_registry (product_code, display_name, base_url, oidc_client_id, enabled, updated_at)
        VALUES ($1, $2, $3, $4, true, NOW())
        ON CONFLICT (product_code) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          base_url = EXCLUDED.base_url,
          oidc_client_id = EXCLUDED.oidc_client_id,
          enabled = true,
          updated_at = NOW();
      `, [p.product_code, p.display_name, p.base_url, p.oidc_client_id]);
    }
    console.log(`Registered ${products.length} products in oxoo_product_registry.`);

    // 2. SEPARATE PRIMEPRO INTERNAL ORGANIZATION FROM CUSTOMERS
    console.log('\n2. Ensuring dedicated PrimePro Internal Organization...');
    let primeProOrg = await client.query(`
      SELECT id, oxoo_organization_uuid FROM organizations WHERE name = 'PrimePro Core Operations' OR name = 'Oxoo.ai Core Corp' LIMIT 1
    `);
    let primeProOrgUuid;
    if (primeProOrg.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO organizations (name, plan, status, member_count, mrr, subdomain, custom_domain)
        VALUES ('PrimePro Core Operations', 'Internal Platform', 'Active', 5, 0.00, 'primepro', 'primepro.oxoo.ai')
        RETURNING oxoo_organization_uuid;
      `);
      primeProOrgUuid = ins.rows[0].oxoo_organization_uuid;
    } else {
      primeProOrgUuid = primeProOrg.rows[0].oxoo_organization_uuid;
    }
    console.log('PrimePro Internal Organization UUID:', primeProOrgUuid);

    // 3. CONTROLLED BACKFILL OF IDENTITY PROFILES
    console.log('\n3. Backfilling oxoo_identity_profiles with controlled verification...');
    const usersRes = await client.query(`
      SELECT id, name, email, phone, role, organization, oxoo_user_uuid, identity_status 
      FROM users
    `);

    for (const u of usersRes.rows) {
      const normEmail = u.email ? u.email.trim().toLowerCase() : null;
      if (!normEmail || !normEmail.includes('@')) {
        console.warn(`Skipping user ID ${u.id} due to invalid email: ${u.email}`);
        continue;
      }
      const normPhone = normalizePhone(u.phone);

      // Controlled verification logic:
      // PrimePro internal staff and Root Administrator have verified administrative identity.
      // Customer users remain 'pending' until explicitly verified via OTP challenge.
      const isInternalStaff = normEmail.endsWith('@primepro.ai') || normEmail === 'admin@oxoo.ai' || u.role === 'super_admin';
      const identityStatus = isInternalStaff ? 'active' : 'pending';
      const emailVerifiedAt = isInternalStaff ? new Date() : null;
      const phoneVerifiedAt = (isInternalStaff && normPhone) ? new Date() : null;

      await client.query(`
        INSERT INTO public.oxoo_identity_profiles (
          oxoo_user_uuid, normalized_email, normalized_phone,
          email_verified_at, phone_verified_at, identity_status, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (oxoo_user_uuid) DO UPDATE SET
          normalized_email = EXCLUDED.normalized_email,
          normalized_phone = EXCLUDED.normalized_phone,
          email_verified_at = COALESCE(oxoo_identity_profiles.email_verified_at, EXCLUDED.email_verified_at),
          phone_verified_at = COALESCE(oxoo_identity_profiles.phone_verified_at, EXCLUDED.phone_verified_at),
          identity_status = CASE 
            WHEN oxoo_identity_profiles.identity_status = 'active' THEN 'active'
            ELSE EXCLUDED.identity_status
          END,
          updated_at = NOW();
      `, [u.oxoo_user_uuid, normEmail, normPhone, emailVerifiedAt, phoneVerifiedAt, identityStatus]);

      // Update users table contact and status mirrors
      await client.query(`
        UPDATE users SET
          phone = COALESCE(phone, $1),
          email_verified_at = COALESCE(email_verified_at, $2),
          phone_verified_at = COALESCE(phone_verified_at, $3),
          identity_status = $4,
          updated_at = NOW()
        WHERE oxoo_user_uuid = $5;
      `, [normPhone, emailVerifiedAt, phoneVerifiedAt, identityStatus, u.oxoo_user_uuid]);

      console.log(`Identity profile backfilled: ${normEmail} -> status: ${identityStatus} (Internal: ${isInternalStaff})`);
    }

    // 4. MAP SUBSCRIPTIONS & POPULATE PRODUCT ENTITLEMENTS
    console.log('\n4. Authoritative entitlement backfill from active subscriptions...');
    
    // First, map or create organizations for subscriptions that lack org_id
    const subsRes = await client.query(`SELECT * FROM subscriptions WHERE status = 'Active' OR status = 'Trialing'`);
    
    for (const sub of subsRes.rows) {
      let orgUuid = null;
      if (sub.org_id) {
        const orgCheck = await client.query('SELECT oxoo_organization_uuid FROM organizations WHERE id = $1', [sub.org_id]);
        if (orgCheck.rows.length > 0) orgUuid = orgCheck.rows[0].oxoo_organization_uuid;
      }

      if (!orgUuid && sub.company_name) {
        // Try matching by company name
        const matchOrg = await client.query(
          'SELECT oxoo_organization_uuid, id FROM organizations WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) LIMIT 1',
          [sub.company_name]
        );
        if (matchOrg.rows.length > 0) {
          orgUuid = matchOrg.rows[0].oxoo_organization_uuid;
          await client.query('UPDATE subscriptions SET org_id = $1 WHERE id = $2', [matchOrg.rows[0].id, sub.id]);
        } else {
          // Create organization record to ensure referential integrity
          const cleanSubdomain = sub.company_name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'tenant';
          const newOrg = await client.query(`
            INSERT INTO organizations (name, plan, status, member_count, mrr, subdomain, custom_domain)
            VALUES ($1, $2, 'Active', 5, $3, $4, $5)
            RETURNING oxoo_organization_uuid, id;
          `, [sub.company_name, sub.plan || 'Standard Pack', sub.amount || 0.00, cleanSubdomain, `${cleanSubdomain}.oxoo.ai`]);
          orgUuid = newOrg.rows[0].oxoo_organization_uuid;
          await client.query('UPDATE subscriptions SET org_id = $1 WHERE id = $2', [newOrg.rows[0].id, sub.id]);
          console.log(`Created organization for subscription: ${sub.company_name} -> UUID: ${orgUuid}`);
        }
      }

      if (!orgUuid) {
        console.warn(`Could not determine organization for subscription ID ${sub.id}`);
        continue;
      }

      // Determine product codes from plan and active_apps
      const productCodesToGrant = new Set();
      const planName = (sub.plan || '').toLowerCase();
      
      if (planName.includes('enterprise') || planName.includes('business suite')) {
        ['hrms', 'finance', 'crm', 'inventory', 'ai_sales', 'website_builder'].forEach(p => productCodesToGrant.add(p));
      } else if (planName.includes('business')) {
        ['hrms', 'finance', 'crm'].forEach(p => productCodesToGrant.add(p));
      } else if (planName.includes('standard') || planName.includes('starter')) {
        ['hrms', 'crm'].forEach(p => productCodesToGrant.add(p));
      } else {
        // Single Software or specific active_apps
        const apps = Array.isArray(sub.active_apps) ? sub.active_apps : [];
        apps.forEach(a => {
          const appStr = String(a).toLowerCase();
          if (appStr.includes('sales') || appStr.includes('crm')) productCodesToGrant.add('crm');
          if (appStr.includes('finance') || appStr.includes('accounting') || appStr.includes('invoice')) productCodesToGrant.add('finance');
          if (appStr.includes('hrms') || appStr.includes('employee')) productCodesToGrant.add('hrms');
          if (appStr.includes('inventory') || appStr.includes('supply')) productCodesToGrant.add('inventory');
          if (appStr.includes('ai')) productCodesToGrant.add('ai_sales');
        });
        if (productCodesToGrant.size === 0) {
          productCodesToGrant.add('crm'); // Default single app granted
        }
      }

      const startsAt = sub.start_date || new Date();
      const endsAt = sub.renewal_date || new Date(Date.now() + 30 * 24 * 3600 * 1000);
      const subStatus = (sub.status || '').toLowerCase() === 'active' ? 'active' : 'trialing';

      for (const prodCode of productCodesToGrant) {
        await client.query(`
          INSERT INTO public.oxoo_product_entitlements (
            oxoo_organization_uuid, product_code, subscription_id,
            status, starts_at, ends_at, limits, metadata, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (oxoo_organization_uuid, product_code) DO UPDATE SET
            subscription_id = EXCLUDED.subscription_id,
            status = EXCLUDED.status,
            starts_at = EXCLUDED.starts_at,
            ends_at = EXCLUDED.ends_at,
            updated_at = NOW();
        `, [
          orgUuid,
          prodCode,
          sub.id,
          subStatus,
          startsAt,
          endsAt,
          JSON.stringify({ max_users: 25, storage_gb: 50 }),
          JSON.stringify({ source: 'subscription_backfill', sub_id: sub.id, plan: sub.plan })
        ]);

        // Record audit link event
        await client.query(`
          INSERT INTO public.oxoo_identity_link_events (
            product_code, event_type, oxoo_organization_uuid, correlation_id, outcome, details
          )
          VALUES ($1, 'entitlement_backfilled', $2, $3, 'success', $4);
        `, [
          prodCode,
          orgUuid,
          `backfill_sub_${sub.id}`,
          JSON.stringify({ plan: sub.plan, starts_at: startsAt, ends_at: endsAt })
        ]);

        console.log(`Entitlement granted: Org ${orgUuid} -> Product ${prodCode} (${subStatus})`);
      }
    }

    await client.query('COMMIT');
    console.log('\n=== OXOO CENTRAL BACKFILL COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during backfill, transaction rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runBackfill();
