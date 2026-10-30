require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('--- Starting PrimePro Master Migrations ---');
    await client.query('BEGIN');

    // 1. Create demo_inquiries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS demo_inquiries (
        id SERIAL PRIMARY KEY,
        inquiry_ref VARCHAR(50) UNIQUE NOT NULL,
        contact_person VARCHAR(150) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        product_name VARCHAR(150) DEFAULT '',
        selected_plan VARCHAR(100) DEFAULT '',
        message TEXT DEFAULT '',
        status VARCHAR(50) DEFAULT 'New',
        assigned_to VARCHAR(150) DEFAULT 'Unassigned',
        internal_notes TEXT DEFAULT '',
        followup_history JSONB DEFAULT '[]'::jsonb,
        audit_trail JSONB DEFAULT '[]'::jsonb,
        is_staging_test BOOLEAN DEFAULT false,
        ip_address VARCHAR(100) DEFAULT '127.0.0.1',
        user_agent TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_demo_inquiries_ref ON demo_inquiries(inquiry_ref);
      CREATE INDEX IF NOT EXISTS idx_demo_inquiries_category ON demo_inquiries(category);
      CREATE INDEX IF NOT EXISTS idx_demo_inquiries_status ON demo_inquiries(status);
      CREATE INDEX IF NOT EXISTS idx_demo_inquiries_email ON demo_inquiries(email);
    `);
    console.log('✓ Table demo_inquiries created/verified');

    // 2. Enhance support_tickets with attachment columns & acknowledgement tracking
    await client.query(`
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS ack_email_sent_at TIMESTAMPTZ;
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'customer_portal';
    `);
    console.log('✓ Table support_tickets enhanced');

    // 3. Create ticket_attachments table for secure file metadata & tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_attachments (
        id SERIAL PRIMARY KEY,
        attachment_id VARCHAR(50) UNIQUE NOT NULL,
        ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
        ticket_number VARCHAR(50),
        file_name VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        storage_path TEXT NOT NULL,
        uploaded_by_email VARCHAR(255) NOT NULL,
        uploaded_by_role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_attachments_id ON ticket_attachments(attachment_id);
    `);
    console.log('✓ Table ticket_attachments created/verified');

    // 4. Enhance organizations and customers with workspace subdomain
    await client.query(`
      ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subdomain VARCHAR(100);
      ALTER TABLE organizations ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS subdomain VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS workspace_domain VARCHAR(255);
    `);
    console.log('✓ Subdomain fields added to organizations & customers');

    // Update existing customers/organizations with default subdomains
    await client.query(`
      UPDATE customers SET subdomain = 'innovatech', workspace_domain = 'innovatech.oxoo.ai'
      WHERE email = 'realcustomer_1793100958507@innovatech.io' AND (subdomain IS NULL OR subdomain = '');

      UPDATE organizations SET subdomain = 'innovatech', custom_domain = 'innovatech.oxoo.ai'
      WHERE id = 1 AND (subdomain IS NULL OR subdomain = '');
    `);

    // Ensure demo organizations exist for abc and maan
    await client.query(`
      INSERT INTO organizations (name, plan, active_apps, member_count, status, subdomain, custom_domain)
      VALUES 
        ('Maan Corp', 'Enterprise Plan', '["Finance", "HRMS", "CRM", "Inventory", "AI Sales Agent", "PrimePro Main Website"]'::jsonb, 15, 'Active', 'maan', 'maan.oxoo.ai'),
        ('ABC Enterprises', 'Business Plan', '["Finance", "HRMS", "CRM"]'::jsonb, 8, 'Active', 'abc', 'abc.oxoo.ai')
      ON CONFLICT DO NOTHING;
    `);

    // Ensure corresponding customers exist
    await client.query(`
      INSERT INTO customers (
        customer_id, company_name, contact_person, email, phone, plan,
        account_status, subscription_status, payment_status, selected_apps, amount, billing_cycle,
        subdomain, workspace_domain
      ) VALUES
        (
          'CST-MAAN-01', 'Maan Corp', 'Manminder Singh', 'admin@maan.oxoo.ai', '+91 98765 00001', 'Enterprise Plan',
          'Active', 'Active', 'Paid', '["Finance", "HRMS", "CRM", "Inventory", "AI Sales Agent", "PrimePro Main Website"]'::jsonb, 49999.00, 'yearly',
          'maan', 'maan.oxoo.ai'
        ),
        (
          'CST-ABC-01', 'ABC Enterprises', 'Alex Brown', 'alex@abc.oxoo.ai', '+91 98765 00002', 'Business Plan',
          'Active', 'Active', 'Paid', '["Finance", "HRMS", "CRM"]'::jsonb, 24999.00, 'yearly',
          'abc', 'abc.oxoo.ai'
        )
      ON CONFLICT (customer_id) DO UPDATE SET
        company_name = EXCLUDED.company_name,
        selected_apps = EXCLUDED.selected_apps,
        subdomain = EXCLUDED.subdomain,
        workspace_domain = EXCLUDED.workspace_domain;
    `);
    console.log('✓ Demo organizations and customers created for maan.oxoo.ai and abc.oxoo.ai');

    // 5. Create provisioning_jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS provisioning_jobs (
        id SERIAL PRIMARY KEY,
        job_id VARCHAR(50) UNIQUE NOT NULL,
        customer_id VARCHAR(50),
        company_name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(100) NOT NULL,
        app_slug VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Completed', -- Pending, Provisioning, Completed, Failed
        target_url TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_prov_subdomain ON provisioning_jobs(subdomain);
    `);
    console.log('✓ Table provisioning_jobs created/verified');

    // 6. Ensure the 6 core applications are in platform_applications with accurate URLs
    const coreApps = [
      {
        id: 'APP-HRMS',
        name: 'HRMS / Employee360',
        slug: 'hrms',
        category: 'Human Resources',
        icon: 'Users',
        icon_bg: '#7c3aed',
        short_description: 'Complete HR, attendance, payroll and workforce management.',
        detailed_description: 'Employee360 workforce suite with leave management, biometric clock-in, and payroll automation.',
        main_url: '/demo/hrms',
        status: 'Active',
        health_status: 'Operational'
      },
      {
        id: 'APP-FIN',
        name: 'PrimePro Finance',
        slug: 'finance',
        category: 'Finance',
        icon: 'CreditCard',
        icon_bg: '#059669',
        short_description: 'Enterprise accounting, GST invoicing and ledgers.',
        detailed_description: 'Automated bookkeeping, GST invoicing, balance sheet reconciliation and cash flow analytics.',
        main_url: '/demo/finance',
        status: 'Active',
        health_status: 'Operational'
      },
      {
        id: 'APP-CRM',
        name: 'PrimePro CRM & Sales',
        slug: 'crm',
        category: 'Sales',
        icon: 'TrendingUp',
        icon_bg: '#ea580c',
        short_description: 'Visual sales pipelines, deals closing and customer intelligence.',
        detailed_description: 'LeadConnect visual sales pipeline, automated call dialer, customer conversion tracking.',
        main_url: '/demo/sales',
        status: 'Active',
        health_status: 'Operational'
      },
      {
        id: 'APP-INVENTORY',
        name: 'PrimePro Inventory & SCM',
        slug: 'inventory',
        category: 'Inventory',
        icon: 'Package',
        icon_bg: '#0d9488',
        short_description: 'Multi-warehouse stock, supply chain and automated replenishment.',
        detailed_description: 'FlowStock inventory operations, barcode scanner, multi-warehouse tracking and logistics.',
        main_url: '/demo/supply-chain',
        status: 'Active',
        health_status: 'Operational'
      },
      {
        id: 'APP-AI',
        name: 'AI Sales Agent & Studio',
        slug: 'ai-sales-agent',
        category: 'AI',
        icon: 'Sparkles',
        icon_bg: '#9333ea',
        short_description: 'Autonomous AI sales co-pilot, voice agents and CRM automation.',
        detailed_description: 'Voice AI dialers, conversational sequence automation and smart lead qualification.',
        main_url: '/demo/ai',
        status: 'Active',
        health_status: 'Operational'
      },
      {
        id: 'APP-WEB',
        name: 'PrimePro Main Website & Studio',
        slug: 'website',
        category: 'Websites',
        icon: 'Globe',
        icon_bg: '#4f46e5',
        short_description: 'Digital studio, website builder and eCommerce storefronts.',
        detailed_description: 'High-speed drag-and-drop website editor, eCommerce studio and custom client portals.',
        main_url: '/demo/website',
        status: 'Active',
        health_status: 'Operational'
      }
    ];

    for (const app of coreApps) {
      await client.query(`
        INSERT INTO platform_applications (
          app_id, name, slug, category, icon, icon_bg, short_description, detailed_description,
          main_url, employee_url, admin_url, customer_dashboard_url, logout_url, health_url,
          app_type, access_mode, auth_method, service_key, access_protection, warning_page_url,
          subscription_required, status, health_status, health_response_ms, allowed_domains, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, '/employee', '/admin', '/customer', '/logout', '/health',
          'Cloud Web App', 'SSO Protected', 'PrimePro OAuth2 / JWT', 'sk_live_9f8d7e6c5b4a3e2d', true, 'https://oxoo.in/access-denied',
          'Business Plan', $10, $11, 24, '["*.oxoo.ai", "*.oxoo.in", "localhost"]'::jsonb, NOW()
        )
        ON CONFLICT (app_id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          category = EXCLUDED.category,
          main_url = EXCLUDED.main_url,
          status = EXCLUDED.status,
          health_status = EXCLUDED.health_status,
          updated_at = NOW();
      `, [
        app.id, app.name, app.slug, app.category, app.icon, app.icon_bg,
        app.short_description, app.detailed_description, app.main_url, app.status, app.health_status
      ]);
    }
    console.log('✓ 6 core applications updated in platform_applications');

    // 7. Seed clearly labelled staging-only test inquiries for tomorrow's demonstration
    const inqCountRes = await client.query('SELECT count(*) FROM demo_inquiries');
    if (parseInt(inqCountRes.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO demo_inquiries (
          inquiry_ref, contact_person, company_name, email, phone, category,
          product_name, selected_plan, message, status, assigned_to, internal_notes,
          followup_history, audit_trail, is_staging_test, created_at
        ) VALUES
          (
            'INQ-2026-1001', 'Karan Varma', '[STAGING TEST] Apex Retailers', 'karan@apexretail.in', '+91 98201 11223', 'Website & Apps',
            'PrimePro Website Builder Studio', 'Growth Plan', 'Looking to build a multi-page corporate website and client portal with custom domain.',
            'New', 'Unassigned', 'Initial lead from Website Demo.',
            '[{"date": "2026-10-27T10:00:00Z", "note": "Inquiry submitted through Website Demo"}]'::jsonb,
            '[{"action": "Inquiry Created", "timestamp": "2026-10-27T10:00:00Z", "actor": "System"}]'::jsonb,
            true, NOW() - INTERVAL '3 hours'
          ),
          (
            'INQ-2026-1002', 'Meera Nair', '[STAGING TEST] Zen MultiVendor', 'meera@zenmarket.com', '+91 99100 44556', 'Marketplace',
            'Marketplace & Storefront Suite', 'Business Pro Plan', 'Evaluating marketplace platform for 50+ vendors with split payment gateway.',
            'Contacted', 'Amit Verma', 'Called customer; discussed vendor commission models. Follow-up scheduled.',
            '[{"date": "2026-10-27T11:30:00Z", "note": "Spoke with Meera regarding vendor management requirements."}]'::jsonb,
            '[{"action": "Status changed to Contacted", "timestamp": "2026-10-27T11:30:00Z", "actor": "Amit Verma"}]'::jsonb,
            true, NOW() - INTERVAL '6 hours'
          ),
          (
            'INQ-2026-1003', 'Rohan Gupta', '[STAGING TEST] Swift Logistics', 'rohan@swiftlog.in', '+91 97112 88990', 'WhatsApp AI Chat',
            'WhatsApp Chat AI & Commerce', 'Enterprise Tier', 'Need automated WhatsApp order notifications, catalog browsing, and support bot.',
            'Qualified', 'Priya Mehta', 'High-intent client. Demo scheduled for Friday 3 PM.',
            '[{"date": "2026-10-27T14:15:00Z", "note": "Client requested proposal for 25 WhatsApp business channels."}]'::jsonb,
            '[{"action": "Status changed to Qualified", "timestamp": "2026-10-27T14:15:00Z", "actor": "Priya Mehta"}]'::jsonb,
            true, NOW() - INTERVAL '1 day'
          );
      `);
      console.log('✓ Staging test inquiries seeded for demonstration');
    }

    await client.query('COMMIT');
    console.log('--- Migrations Completed Successfully! ---');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(e => {
  console.error(e);
  process.exit(1);
});
