require('dotenv').config();
const dns = require('dns');
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {}

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_CYBcrl9som7F@ep-restless-paper-b5ssp7vy-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err?.message || err);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('Executed query', { text: text.slice(0, 80), duration, rows: res.rowCount });
  return res;
}

async function initDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to Neon PostgreSQL and ensuring database schema...');

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        organization VARCHAR(255) DEFAULT 'Oxoo.ai Tenant',
        active BOOLEAN DEFAULT true,
        avatar VARCHAR(255) DEFAULT '',
        last_login TIMESTAMPTZ DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Leads Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        company VARCHAR(160) DEFAULT '',
        service VARCHAR(160) DEFAULT '',
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'New',
        source VARCHAR(50) DEFAULT 'website',
        assigned_to VARCHAR(120) DEFAULT '',
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Categories Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL UNIQUE,
        description TEXT DEFAULT '',
        color VARCHAR(50) DEFAULT 'green',
        icon VARCHAR(100) DEFAULT 'BriefcaseBusiness',
        services JSONB DEFAULT '[]'::jsonb,
        sort_order INT DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. Services Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT DEFAULT '',
        color VARCHAR(50) DEFAULT 'green',
        icon VARCHAR(100) DEFAULT 'BriefcaseBusiness',
        featured BOOLEAN DEFAULT false,
        features JSONB DEFAULT '[]'::jsonb,
        sort_order INT DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. Applications Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(100) PRIMARY KEY,
        slug VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        concept TEXT DEFAULT '',
        main_color VARCHAR(50) DEFAULT '#2563eb',
        bg_color VARCHAR(50) DEFAULT '#eff6ff',
        icon_src VARCHAR(255) NOT NULL,
        svg_src VARCHAR(255) DEFAULT '',
        tagline VARCHAR(255) DEFAULT '',
        description TEXT DEFAULT '',
        features JSONB DEFAULT '[]'::jsonb,
        enabled BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 6. Audit Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(255) NOT NULL,
        target VARCHAR(255) DEFAULT '',
        user_name VARCHAR(120) DEFAULT 'system',
        ip VARCHAR(100) DEFAULT '127.0.0.1',
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 7. Organizations Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        plan VARCHAR(50) DEFAULT 'Business Pro',
        active_apps JSONB DEFAULT '["accounting", "invoicing", "expenses", "hrms", "website"]'::jsonb,
        member_count INT DEFAULT 12,
        status VARCHAR(50) DEFAULT 'Active',
        next_billing TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '57 days'),
        mrr INT DEFAULT 48200,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 8. Subscriptions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        org_id INT,
        company_name VARCHAR(255) NOT NULL,
        plan VARCHAR(100) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        billing_cycle VARCHAR(20) DEFAULT 'monthly',
        status VARCHAR(50) DEFAULT 'Active',
        start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
        renewal_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
        active_apps JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 9. Invoices Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(100) NOT NULL UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        plan VARCHAR(100) DEFAULT 'Business Pro',
        amount NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status VARCHAR(50) DEFAULT 'Paid',
        invoice_date TIMESTAMPTZ DEFAULT NOW(),
        due_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '15 days',
        pdf_url VARCHAR(255) DEFAULT '',
        items JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 10. Support Tickets Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        ticket_number VARCHAR(50) NOT NULL UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        user_name VARCHAR(120) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        priority VARCHAR(20) DEFAULT 'Medium',
        status VARCHAR(50) DEFAULT 'Open',
        replies JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 11. Team Members Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Member',
        status VARCHAR(50) DEFAULT 'Active',
        apps_access JSONB DEFAULT '["all"]'::jsonb,
        last_active TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 12. Products and Plans Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products_plans (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        monthly_price INT NOT NULL,
        annual_price INT NOT NULL,
        revenue INT DEFAULT 0,
        revenue_percent INT DEFAULT 0,
        active_subscriptions INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Operational',
        features JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 13. Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(100) NOT NULL UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        customer_name VARCHAR(150),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        plan_name VARCHAR(100) NOT NULL,
        selected_apps JSONB DEFAULT '[]'::jsonb,
        user_count INT DEFAULT 1,
        billing_cycle VARCHAR(20) DEFAULT 'monthly',
        subtotal NUMERIC(12, 2) NOT NULL,
        tax_amount NUMERIC(12, 2) DEFAULT 0,
        discount_amount NUMERIC(12, 2) DEFAULT 0,
        total_amount NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        payment_method VARCHAR(50) DEFAULT 'Razorpay',
        payment_id VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Created',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 14. Demo Events Table (Real Demo Login and Session Activity)
    await client.query(`
      CREATE TABLE IF NOT EXISTS demo_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) DEFAULT 'login',
        session_id VARCHAR(100),
        user_name VARCHAR(150) DEFAULT '',
        user_email VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) DEFAULT '',
        app_slug VARCHAR(100) DEFAULT 'accounting',
        duration_seconds INT DEFAULT 300,
        ip VARCHAR(100) DEFAULT '127.0.0.1',
        user_agent TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_demo_events_created_at ON demo_events (created_at);
      CREATE INDEX IF NOT EXISTS idx_demo_events_user_email ON demo_events (user_email);
    `);

    // 15. Customers Table (First-class customer records with normalized identity & unique constraints)
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        customer_id VARCHAR(50) NOT NULL UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NOT NULL,
        country VARCHAR(100) DEFAULT 'India',
        country_code VARCHAR(10) DEFAULT '+91',
        industry VARCHAR(120) DEFAULT 'Information Technology',
        website VARCHAR(255) DEFAULT '',
        registered_address TEXT DEFAULT '',
        plan VARCHAR(100) DEFAULT 'Business Plan',
        account_status VARCHAR(50) DEFAULT 'Active',
        subscription_status VARCHAR(50) DEFAULT 'Active',
        payment_status VARCHAR(50) DEFAULT 'Paid',
        joined_date TIMESTAMPTZ DEFAULT NOW(),
        renewal_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
        last_login TIMESTAMPTZ DEFAULT NOW(),
        email_verified BOOLEAN DEFAULT true,
        phone_verified BOOLEAN DEFAULT true,
        auto_renewal BOOLEAN DEFAULT true,
        selected_apps JSONB DEFAULT '["Finance", "HRMS", "Marketing"]'::jsonb,
        amount NUMERIC(12, 2) DEFAULT 24999.00,
        billing_cycle VARCHAR(20) DEFAULT 'yearly',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (LOWER(TRIM(email)));
      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);
      CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers (customer_id);
    `);

    // 17. Customer In-App Notifications Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_notifications (
        id SERIAL PRIMARY KEY,
        customer_id VARCHAR(50),
        company_name VARCHAR(255),
        customer_email VARCHAR(255),
        user_email VARCHAR(255),
        category VARCHAR(50) DEFAULT 'system',
        type VARCHAR(50) DEFAULT 'system',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        is_read BOOLEAN DEFAULT false,
        related_type VARCHAR(50),
        related_id VARCHAR(100),
        action_url VARCHAR(255),
        link VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_customer_notif_email ON customer_notifications (LOWER(TRIM(user_email)));
      CREATE INDEX IF NOT EXISTS idx_customer_notif_cust_email ON customer_notifications (LOWER(TRIM(customer_email)));
      CREATE INDEX IF NOT EXISTS idx_customer_notif_company ON customer_notifications (LOWER(TRIM(company_name)));
    `);

    // Schema Migrations: Ensure numeric columns and credential/storage columns
    try {
      await client.query(`
        ALTER TABLE subscriptions ALTER COLUMN amount TYPE NUMERIC(12, 2);
        ALTER TABLE invoices ALTER COLUMN amount TYPE NUMERIC(12, 2);
        ALTER TABLE organizations ALTER COLUMN mrr TYPE NUMERIC(12, 2);
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS storage_id VARCHAR(50);
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS purchased_apps JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE customer_notifications ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
        ALTER TABLE customer_notifications ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
        ALTER TABLE customer_notifications ADD COLUMN IF NOT EXISTS type VARCHAR(50);
        ALTER TABLE customer_notifications ADD COLUMN IF NOT EXISTS link VARCHAR(255);
        ALTER TABLE customer_notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
        ALTER TABLE customer_notifications ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'system';
        ALTER TABLE orders ALTER COLUMN subtotal TYPE NUMERIC(12, 2);
        ALTER TABLE orders ALTER COLUMN tax_amount TYPE NUMERIC(12, 2);
        ALTER TABLE orders ALTER COLUMN discount_amount TYPE NUMERIC(12, 2);
        ALTER TABLE orders ALTER COLUMN total_amount TYPE NUMERIC(12, 2);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_id VARCHAR(100);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS storage_id VARCHAR(100);

        -- Subscriptions Enhanced Lifecycle Columns
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(50);
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Paid';
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT true;
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS warning_date TIMESTAMPTZ;
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS renewal_warning_status VARCHAR(50) DEFAULT 'Scheduled';
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS followup_status VARCHAR(50) DEFAULT 'Not Contacted';
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(120) DEFAULT 'Amit Verma';
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_email_sent TIMESTAMPTZ;
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS next_scheduled_email TIMESTAMPTZ;
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_call_date TIMESTAMPTZ;
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reminders_paused BOOLEAN DEFAULT false;
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Kolkata';

        CREATE UNIQUE INDEX IF NOT EXISTS idx_subs_subscription_id ON subscriptions (subscription_id);
        CREATE INDEX IF NOT EXISTS idx_subs_customer_id ON subscriptions (customer_id);

        -- Subscription Reminders Tracking Table
        CREATE TABLE IF NOT EXISTS subscription_reminders (
          id SERIAL PRIMARY KEY,
          subscription_id VARCHAR(50) NOT NULL,
          customer_id VARCHAR(50),
          company_name VARCHAR(255),
          recipient_email VARCHAR(255) NOT NULL,
          email_type VARCHAR(50) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'Sent',
          idempotency_key VARCHAR(120) UNIQUE,
          scheduled_at TIMESTAMPTZ DEFAULT NOW(),
          sent_at TIMESTAMPTZ DEFAULT NOW(),
          retry_count INT DEFAULT 0,
          failure_reason TEXT DEFAULT '',
          details JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_sub_reminders_sub_id ON subscription_reminders (subscription_id);

        -- Support & Sales Follow-up Notes Table
        CREATE TABLE IF NOT EXISTS subscription_followup_notes (
          id SERIAL PRIMARY KEY,
          subscription_id VARCHAR(50) NOT NULL,
          author_name VARCHAR(120) DEFAULT 'Admin',
          call_date TIMESTAMPTZ DEFAULT NOW(),
          status VARCHAR(50) DEFAULT 'Contacted',
          promised_payment_date DATE,
          next_followup_date DATE,
          note TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_sub_notes_sub_id ON subscription_followup_notes (subscription_id);
      `);
      console.log('PostgreSQL subscription & lifecycle migrations applied successfully.');

      // Oxoo Central Authoritative Control Plane Additive Migration
      await client.query(`
        CREATE EXTENSION IF NOT EXISTS pgcrypto;

        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS oxoo_user_uuid uuid;
        UPDATE public.users SET oxoo_user_uuid = gen_random_uuid() WHERE oxoo_user_uuid IS NULL;
        ALTER TABLE public.users ALTER COLUMN oxoo_user_uuid SET DEFAULT gen_random_uuid();
        ALTER TABLE public.users ALTER COLUMN oxoo_user_uuid SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS users_oxoo_user_uuid_uq ON public.users(oxoo_user_uuid);

        ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS oxoo_organization_uuid uuid;
        UPDATE public.organizations SET oxoo_organization_uuid = gen_random_uuid() WHERE oxoo_organization_uuid IS NULL;
        ALTER TABLE public.organizations ALTER COLUMN oxoo_organization_uuid SET DEFAULT gen_random_uuid();
        ALTER TABLE public.organizations ALTER COLUMN oxoo_organization_uuid SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS organizations_oxoo_org_uuid_uq ON public.organizations(oxoo_organization_uuid);

        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone varchar(50);
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS identity_status varchar(20) NOT NULL DEFAULT 'pending';
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

        CREATE TABLE IF NOT EXISTS public.oxoo_identity_profiles (
          oxoo_user_uuid uuid PRIMARY KEY REFERENCES public.users(oxoo_user_uuid) ON DELETE RESTRICT,
          normalized_email text NOT NULL,
          normalized_phone text,
          email_verified_at timestamptz,
          phone_verified_at timestamptz,
          identity_status text NOT NULL DEFAULT 'pending'
            CHECK (identity_status IN ('pending','active','locked','disabled')),
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          CONSTRAINT oxoo_identity_email_format_chk CHECK (position('@' in normalized_email) > 1)
        );
        CREATE UNIQUE INDEX IF NOT EXISTS oxoo_identity_email_uq
          ON public.oxoo_identity_profiles (lower(normalized_email));
        CREATE UNIQUE INDEX IF NOT EXISTS oxoo_identity_phone_uq
          ON public.oxoo_identity_profiles (normalized_phone)
          WHERE normalized_phone IS NOT NULL;

        CREATE TABLE IF NOT EXISTS public.oxoo_product_entitlements (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          oxoo_organization_uuid uuid NOT NULL
            REFERENCES public.organizations(oxoo_organization_uuid) ON DELETE RESTRICT,
          product_code text NOT NULL,
          subscription_id integer REFERENCES public.subscriptions(id) ON DELETE SET NULL,
          status text NOT NULL DEFAULT 'pending'
            CHECK (status IN ('pending','trialing','active','grace','suspended','expired','cancelled')),
          starts_at timestamptz,
          ends_at timestamptz,
          suspended_at timestamptz,
          suspension_reason text,
          limits jsonb NOT NULL DEFAULT '{}'::jsonb,
          metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          CONSTRAINT oxoo_product_entitlement_org_product_uq UNIQUE (oxoo_organization_uuid, product_code)
        );
        CREATE INDEX IF NOT EXISTS oxoo_product_entitlements_status_idx
          ON public.oxoo_product_entitlements(status, ends_at);
        CREATE INDEX IF NOT EXISTS oxoo_product_entitlements_subscription_idx
          ON public.oxoo_product_entitlements(subscription_id);

        CREATE TABLE IF NOT EXISTS public.oxoo_product_registry (
          product_code text PRIMARY KEY,
          display_name text NOT NULL,
          base_url text NOT NULL,
          oidc_client_id text NOT NULL UNIQUE,
          enabled boolean NOT NULL DEFAULT true,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS public.oxoo_identity_link_events (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          product_code text NOT NULL,
          event_type text NOT NULL,
          oxoo_user_uuid uuid REFERENCES public.users(oxoo_user_uuid) ON DELETE SET NULL,
          oxoo_organization_uuid uuid REFERENCES public.organizations(oxoo_organization_uuid) ON DELETE SET NULL,
          product_user_id text,
          product_tenant_id text,
          correlation_id text,
          outcome text NOT NULL CHECK (outcome IN ('success','denied','error')),
          details jsonb NOT NULL DEFAULT '{}'::jsonb,
          created_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS oxoo_identity_link_events_created_idx
          ON public.oxoo_identity_link_events(created_at DESC);
        CREATE INDEX IF NOT EXISTS oxoo_identity_link_events_tenant_idx
          ON public.oxoo_identity_link_events(oxoo_organization_uuid, product_code, created_at DESC);
      `);
      console.log('PostgreSQL Oxoo Central authoritative control plane migrations applied successfully.');
    } catch (migErr) {
      console.log('Migration check note:', migErr.message);
    }

    // Demo & test data auto-seeding is disabled by default to ensure real, authentic operational data.
    const SHOULD_SEED_DEMO = process.env.AUTO_SEED_DEMO_DATA === 'true';
    if (SHOULD_SEED_DEMO) {
      // Seed initial demo events from leads if demo_events is empty
      try {
        const demoCnt = await client.query('SELECT COUNT(*) FROM demo_events');
        if (parseInt(demoCnt.rows[0]?.count, 10) === 0) {
        console.log('Populating demo_events from existing leads...');
        await client.query(`
          INSERT INTO demo_events (event_type, session_id, user_name, user_email, company_name, app_slug, duration_seconds, created_at)
          SELECT 
            'login',
            CONCAT('sess_', MD5(CONCAT(id::text, email, created_at::text))),
            COALESCE(name, 'Demo User'),
            COALESCE(email, 'user@oxoo.ai'),
            COALESCE(company, 'demo.oxoo'),
            COALESCE(NULLIF(service, ''), 'accounting'),
            FLOOR(180 + (RANDOM() * 600))::int,
            created_at
          FROM leads
          WHERE email IS NOT NULL AND email != '';
        `);

        // Also add additional distributed demo logins for 2026 analytics
        await client.query(`
          INSERT INTO demo_events (event_type, session_id, user_name, user_email, company_name, app_slug, duration_seconds, created_at)
          VALUES
            ('login', 'sess_demo_101', 'Rahul Kumar', 'rahul.kumar@xyz.com', 'techsol.oxoo', 'finance', 540, NOW() - INTERVAL '28 minutes'),
            ('login', 'sess_demo_102', 'Anita Deshmukh', 'anita.d@globalbiz.in', 'globalbiz.oxoo', 'hrms', 610, NOW() - INTERVAL '4 hours'),
            ('login', 'sess_demo_103', 'Vikram Malhotra', 'vikram@apexretail.com', 'apexretail.oxoo', 'sales', 480, NOW() - INTERVAL '7 hours'),
            ('login', 'sess_demo_104', 'Sneha Patel', 'sneha@innovatetech.io', 'innovate.oxoo', 'websites', 720, NOW() - INTERVAL '1 day'),
            ('login', 'sess_demo_105', 'Amit Roy', 'amit@zenithenterprises.com', 'zenith.oxoo', 'inventory', 430, NOW() - INTERVAL '2 days'),
            ('login', 'sess_demo_106', 'Pooja Verma', 'pooja@cloudnine.in', 'cloudnine.oxoo', 'marketing', 390, NOW() - INTERVAL '3 days'),
            ('login', 'sess_demo_107', 'Karan Johal', 'karan@logixflow.com', 'logixflow.oxoo', 'finance', 850, NOW() - INTERVAL '4 days');
        `);
      }
    } catch (e) {
      console.log('Demo events seed note:', e.message);
    }

    // Seed initial support tickets if table is empty
    try {
      const ticketCnt = await client.query('SELECT COUNT(*) FROM support_tickets');
      if (parseInt(ticketCnt.rows[0]?.count, 10) === 0) {
        await client.query(`
          INSERT INTO support_tickets (ticket_number, company_name, user_name, user_email, subject, description, priority, status, created_at)
          VALUES 
            ('TK-2026-4582', 'Tech Solutions Pvt. Ltd.', 'Rohan Mehta', 'rohan@techsolutions.com', 'Custom SMTP integration setup request', 'Need assistance connecting custom company SMTP relay.', 'Medium', 'Open', NOW() - INTERVAL '2 hours'),
            ('TK-2026-4579', 'Apex Retail Mart', 'Sunita Rao', 'sunita@apexretail.com', 'GST invoice format customization', 'Looking to add custom GSTIN notes on monthly PDF invoices.', 'Low', 'In Progress', NOW() - INTERVAL '1 day'),
            ('TK-2026-4560', 'Innovatech Labs', 'Devendra Singh', 'dev@innovatech.io', 'API Webhook retry policy', 'Clarification on webhook response timeouts.', 'High', 'Resolved', NOW() - INTERVAL '3 days');
        `);
      }
    } catch (e) {
      console.log('Ticket seed note:', e.message);
    }

    // Seed initial products_plans if table is empty
    try {
      const prodCnt = await client.query('SELECT COUNT(*) FROM products_plans');
      if (parseInt(prodCnt.rows[0]?.count, 10) === 0) {
        await client.query(`
          INSERT INTO products_plans (product_name, category, monthly_price, annual_price, revenue, revenue_percent, active_subscriptions, status, features)
          VALUES
            ('OXOO Business Suite', 'Suite', 740, 560, 48200, 49, 14, 'Operational', '["All Core Apps", "Standard Support"]'::jsonb),
            ('OXOO Finance Pro', 'Finance', 740, 560, 24800, 25, 8, 'Operational', '["Accounting", "Invoicing", "Expenses"]'::jsonb),
            ('OXOO HRMS Pro', 'Human Resources', 740, 560, 15600, 16, 5, 'Operational', '["Employee Management", "Payroll", "Attendance"]'::jsonb),
            ('OXOO Website & Commerce', 'Websites', 740, 560, 9500, 10, 3, 'Operational', '["Storefront", "CMS", "SEO Tools"]'::jsonb);
        `);
      }
    } catch (e) {
      console.log('Products seed note:', e.message);
    }

    // Seed initial clean customers if customers table has < 10 rows
    try {
      const custCnt = await client.query('SELECT COUNT(*) FROM customers');
      if (parseInt(custCnt.rows[0]?.count, 10) < 10) {
        console.log('Seeding initial customers matching live SaaS admin directory...');
        const initialCustomers = [
          {
            id: 'CST-0001',
            company: 'Tech Solutions Pvt. Ltd.',
            contact: 'Rahul Kumar',
            email: 'rahul@techsol.com',
            phone: '+91 98765 43210',
            country: 'India',
            country_code: '+91',
            industry: 'Information Technology',
            website: 'www.techsol.com',
            address: 'B-12, Sector 62, Noida, Uttar Pradesh 201301, India',
            plan: 'Business Plan',
            account_status: 'Active',
            subscription_status: 'Active',
            payment_status: 'Paid',
            joined: '2026-10-12T10:24:00Z',
            renewal: '2027-10-12T10:24:00Z',
            last_login: '2026-10-18T16:12:00Z',
            amount: 24999.00,
            billing: 'yearly',
            apps: ['Finance', 'HRMS', 'Marketing']
          },
          {
            id: 'CST-0002',
            company: 'Global Trade Inc.',
            contact: 'Sarah Williams',
            email: 'sarah@globaltrade.com',
            phone: '+1 415 555 8742',
            country: 'USA',
            country_code: '+1',
            industry: 'Import & Export',
            website: 'www.globaltrade.com',
            address: '500 Howard Street, Suite 400, San Francisco, CA 94105, USA',
            plan: 'Enterprise Plan',
            account_status: 'Active',
            subscription_status: 'Trialing',
            payment_status: 'Paid',
            joined: '2026-10-08T09:15:00Z',
            renewal: '2026-11-08T09:15:00Z',
            last_login: '2026-10-24T11:30:00Z',
            amount: 48999.00,
            billing: 'yearly',
            apps: ['Finance', 'HRMS', 'Supply Chain', 'AI Studio']
          },
          {
            id: 'CST-0003',
            company: 'Skyline Marketing',
            contact: 'Amit Shah',
            email: 'amit@skylinemkt.com',
            phone: '+91 99887 77665',
            country: 'India',
            country_code: '+91',
            industry: 'Digital Advertising',
            website: 'www.skylinemkt.com',
            address: 'Plot 45, Udyog Vihar Phase 4, Gurugram, Haryana 122016, India',
            plan: 'Standard Plan',
            account_status: 'Suspended',
            subscription_status: 'Past Due',
            payment_status: 'Pending',
            joined: '2026-10-05T14:20:00Z',
            renewal: '2026-10-05T14:20:00Z',
            last_login: '2026-10-14T08:45:00Z',
            amount: 14999.00,
            billing: 'yearly',
            apps: ['Marketing', 'Websites']
          },
          {
            id: 'CST-0004',
            company: 'NextGen HR',
            contact: 'Priya Mehta',
            email: 'priya@nextgenhr.com',
            phone: '+91 91234 56789',
            country: 'India',
            country_code: '+91',
            industry: 'Recruitment & HR',
            website: 'www.nextgenhr.com',
            address: 'Level 6, Raheja Towers, MG Road, Bengaluru, Karnataka 560001, India',
            plan: 'HRMS Plan',
            account_status: 'Active',
            subscription_status: 'Active',
            payment_status: 'Paid',
            joined: '2026-09-21T11:10:00Z',
            renewal: '2027-09-21T11:10:00Z',
            last_login: '2026-10-25T15:00:00Z',
            amount: 18999.00,
            billing: 'yearly',
            apps: ['HRMS']
          },
          {
            id: 'CST-0005',
            company: 'Brightway Retail',
            contact: 'James Carter',
            email: 'james@brightway.com',
            phone: '+44 7700 900123',
            country: 'UK',
            country_code: '+44',
            industry: 'Retail & E-commerce',
            website: 'www.brightway.com',
            address: '25 Cannon Street, London, EC4M 5SB, United Kingdom',
            plan: 'Finance Plan',
            account_status: 'Active',
            subscription_status: 'Active',
            payment_status: 'Paid',
            joined: '2026-09-10T16:45:00Z',
            renewal: '2027-09-10T16:45:00Z',
            last_login: '2026-10-22T09:18:00Z',
            amount: 21999.00,
            billing: 'yearly',
            apps: ['Finance', 'Invoicing']
          },
          {
            id: 'CST-0006',
            company: 'Green Earth Ltd.',
            contact: 'Kavita Rao',
            email: 'kavita@greenearth.in',
            phone: '+91 88990 11223',
            country: 'India',
            country_code: '+91',
            industry: 'Renewable Energy',
            website: 'www.greenearth.in',
            address: 'Survey No 88, Baner Road, Pune, Maharashtra 411045, India',
            plan: 'Custom Plan',
            account_status: 'Inactive',
            subscription_status: 'Cancelled',
            payment_status: 'Refunded',
            joined: '2026-09-01T12:00:00Z',
            renewal: '2026-09-01T12:00:00Z',
            last_login: '2026-09-15T18:22:00Z',
            amount: 32500.00,
            billing: 'yearly',
            apps: ['Finance', 'Supply Chain']
          },
          {
            id: 'CST-0007',
            company: 'FutureGen Tech',
            contact: 'Daniel Lee',
            email: 'daniel@futuregen.com',
            phone: '+65 8123 6632',
            country: 'Singapore',
            country_code: '+65',
            industry: 'Software Engineering',
            website: 'www.futuregen.com',
            address: '1 Marina Boulevard, #28-00, One Marina Boulevard, 018989 Singapore',
            plan: 'Standard Plan',
            account_status: 'Active',
            subscription_status: 'Active',
            payment_status: 'Paid',
            joined: '2026-08-28T08:30:00Z',
            renewal: '2027-08-28T08:30:00Z',
            last_login: '2026-10-26T07:14:00Z',
            amount: 14999.00,
            billing: 'yearly',
            apps: ['Finance', 'HRMS']
          },
          {
            id: 'CST-0008',
            company: 'Vision Connect',
            contact: 'Neha Gupta',
            email: 'neha@visionconnect.in',
            phone: '+91 77665 55443',
            country: 'India',
            country_code: '+91',
            industry: 'Telecommunications',
            website: 'www.visionconnect.in',
            address: 'Tower B, Cyber City, DLF Phase 2, Gurugram 122002, India',
            plan: 'Marketing Plan',
            account_status: 'Active',
            subscription_status: 'Trialing',
            payment_status: 'Paid',
            joined: '2026-08-15T10:00:00Z',
            renewal: '2026-11-15T10:00:00Z',
            last_login: '2026-10-23T14:19:00Z',
            amount: 12999.00,
            billing: 'yearly',
            apps: ['Marketing', 'Websites']
          },
          {
            id: 'CST-0009',
            company: 'BlueOcean LLC',
            contact: 'Michael Brown',
            email: 'michael@blueocean.com',
            phone: '+1 646 555 0099',
            country: 'USA',
            country_code: '+1',
            industry: 'Financial Services',
            website: 'www.blueocean.com',
            address: '120 Broadway, 35th Floor, New York, NY 10271, USA',
            plan: 'Enterprise Plan',
            account_status: 'Suspended',
            subscription_status: 'Past Due',
            payment_status: 'Failed',
            joined: '2026-08-02T13:40:00Z',
            renewal: '2026-08-02T13:40:00Z',
            last_login: '2026-08-20T11:15:00Z',
            amount: 48999.00,
            billing: 'yearly',
            apps: ['Finance', 'HRMS', 'AI Studio']
          },
          {
            id: 'CST-0010',
            company: 'Creative Minds',
            contact: 'Sneha Patel',
            email: 'sneha@creativeminds.in',
            phone: '+91 99882 33445',
            country: 'India',
            country_code: '+91',
            industry: 'Design & Media',
            website: 'www.creativeminds.in',
            address: '14/B, Linking Road, Bandra West, Mumbai, Maharashtra 400050, India',
            plan: 'Standard Plan',
            account_status: 'Active',
            subscription_status: 'Active',
            payment_status: 'Paid',
            joined: '2026-07-20T15:20:00Z',
            renewal: '2027-07-20T15:20:00Z',
            last_login: '2026-10-25T17:40:00Z',
            amount: 14999.00,
            billing: 'yearly',
            apps: ['Marketing', 'Websites']
          }
        ];

        for (const c of initialCustomers) {
          await client.query(`
            INSERT INTO customers (
              customer_id, company_name, contact_person, email, phone, country, country_code,
              industry, website, registered_address, plan, account_status, subscription_status,
              payment_status, joined_date, renewal_date, last_login, amount, billing_cycle, selected_apps
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            ON CONFLICT (customer_id) DO UPDATE
            SET company_name = EXCLUDED.company_name,
                contact_person = EXCLUDED.contact_person,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                country = EXCLUDED.country,
                plan = EXCLUDED.plan,
                account_status = EXCLUDED.account_status,
                subscription_status = EXCLUDED.subscription_status,
                payment_status = EXCLUDED.payment_status,
                amount = EXCLUDED.amount,
                billing_cycle = EXCLUDED.billing_cycle,
                selected_apps = EXCLUDED.selected_apps,
                updated_at = NOW();
          `, [
            c.id, c.company, c.contact, c.email, c.phone, c.country, c.country_code,
            c.industry, c.website, c.address, c.plan, c.account_status, c.subscription_status,
            c.payment_status, c.joined, c.renewal, c.last_login, c.amount, c.billing, JSON.stringify(c.apps)
          ]);
        }

        // Also ensure orders table records exist for CST-0001
        await client.query(`
          INSERT INTO invoices (invoice_number, company_name, plan, amount, currency, status, invoice_date, due_date)
          VALUES ('INV-2026-1024', 'Tech Solutions Pvt. Ltd.', 'Business Plan', 24999.00, 'INR', 'Paid', NOW() - INTERVAL '14 days', NOW() + INTERVAL '16 days')
          ON CONFLICT (invoice_number) DO NOTHING;
        `);
      }
    } catch (custSeedErr) {
      console.log('Customer seed note:', custSeedErr.message);
    }

    // Seed initial clean subscriptions matching the live SaaS mockup
    try {
      const subsToSeed = [
        {
          subscription_id: 'SUB-2026-001',
          customer_id: 'CST-0001',
          company_name: 'Tech Solutions Pvt. Ltd.',
          plan: 'Business Plan',
          amount: 24999.00,
          currency: 'INR',
          billing_cycle: 'Yearly',
          status: 'Active',
          payment_status: 'Paid',
          start_date: '2025-11-01T10:30:00Z',
          renewal_date: '2026-11-01T10:30:00Z',
          warning_date: '2026-10-27T10:30:00Z',
          auto_renewal: true,
          renewal_warning_status: 'Warning Sent',
          followup_status: 'Not Contacted',
          assigned_to: 'Amit Verma',
          last_email_sent: '2026-10-26T10:15:00Z',
          next_scheduled_email: '2026-10-26T20:15:00Z',
          active_apps: ['Finance', 'HRMS', 'Marketing']
        },
        {
          subscription_id: 'SUB-2026-002',
          customer_id: 'CST-0002',
          company_name: 'Global Trade Inc.',
          plan: 'Enterprise Plan',
          amount: 49999.00,
          currency: 'INR',
          billing_cycle: 'Yearly',
          status: 'Trialing',
          payment_status: 'Paid',
          start_date: '2025-11-12T09:00:00Z',
          renewal_date: '2026-11-12T09:00:00Z',
          warning_date: '2026-11-07T09:00:00Z',
          auto_renewal: true,
          renewal_warning_status: 'Scheduled',
          followup_status: 'Not Contacted',
          assigned_to: 'Amit Verma',
          last_email_sent: null,
          next_scheduled_email: '2026-11-07T09:00:00Z',
          active_apps: ['Finance', 'HRMS', 'Sales Software', 'AI Studio']
        },
        {
          subscription_id: 'SUB-2026-003',
          customer_id: 'CST-0003',
          company_name: 'Skyline Marketing',
          plan: 'Standard Plan',
          amount: 7999.00,
          currency: 'INR',
          billing_cycle: 'Monthly',
          status: 'Past Due',
          payment_status: 'Failed',
          start_date: '2026-09-20T11:00:00Z',
          renewal_date: '2026-10-20T11:00:00Z',
          warning_date: '2026-10-15T11:00:00Z',
          auto_renewal: false,
          renewal_warning_status: 'Overdue',
          followup_status: 'Escalated',
          assigned_to: 'Rajesh Singh',
          last_email_sent: '2026-10-24T11:30:00Z',
          next_scheduled_email: null,
          active_apps: ['Marketing', 'Websites']
        },
        {
          subscription_id: 'SUB-2026-004',
          customer_id: 'CST-0004',
          company_name: 'NextGen HR',
          plan: 'HRMS Plan',
          amount: 12999.00,
          currency: 'INR',
          billing_cycle: 'Yearly',
          status: 'Active',
          payment_status: 'Paid',
          start_date: '2025-11-25T14:00:00Z',
          renewal_date: '2026-11-25T14:00:00Z',
          warning_date: '2026-11-20T14:00:00Z',
          auto_renewal: true,
          renewal_warning_status: 'Scheduled',
          followup_status: 'Not Contacted',
          assigned_to: 'Amit Verma',
          last_email_sent: null,
          next_scheduled_email: '2026-11-20T14:00:00Z',
          active_apps: ['HRMS']
        },
        {
          subscription_id: 'SUB-2026-005',
          customer_id: 'CST-0005',
          company_name: 'Brightway Retail',
          plan: 'Finance Plan',
          amount: 18999.00,
          currency: 'INR',
          billing_cycle: 'Yearly',
          status: 'Suspended',
          payment_status: 'Pending',
          start_date: '2025-10-18T10:00:00Z',
          renewal_date: '2026-10-18T10:00:00Z',
          warning_date: '2026-10-13T10:00:00Z',
          auto_renewal: false,
          renewal_warning_status: 'Overdue',
          followup_status: 'Awaiting Payment',
          assigned_to: 'Pooja Mehta',
          last_email_sent: '2026-10-25T16:10:00Z',
          next_scheduled_email: null,
          active_apps: ['Finance', 'Invoicing']
        },
        {
          subscription_id: 'SUB-2026-006',
          customer_id: 'CST-0006',
          company_name: 'Green Earth Ltd.',
          plan: 'Custom Plan',
          amount: 27500.00,
          currency: 'INR',
          billing_cycle: 'Monthly',
          status: 'Active',
          payment_status: 'Paid',
          start_date: '2026-10-03T09:20:00Z',
          renewal_date: '2026-11-03T09:20:00Z',
          warning_date: '2026-10-29T09:20:00Z',
          auto_renewal: true,
          renewal_warning_status: 'Warning Sent',
          followup_status: 'Call Scheduled',
          assigned_to: 'Neha Sharma',
          last_email_sent: '2026-10-26T09:20:00Z',
          next_scheduled_email: '2026-10-26T19:20:00Z',
          active_apps: ['Finance', 'Supply Chain']
        },
        {
          subscription_id: 'SUB-2026-007',
          customer_id: 'CST-0007',
          company_name: 'FutureGen Tech',
          plan: 'Standard Plan',
          amount: 9999.00,
          currency: 'INR',
          billing_cycle: 'Monthly',
          status: 'Active',
          payment_status: 'Paid',
          start_date: '2026-10-10T11:15:00Z',
          renewal_date: '2026-12-10T11:15:00Z',
          warning_date: '2026-12-05T11:15:00Z',
          auto_renewal: true,
          renewal_warning_status: 'Scheduled',
          followup_status: 'Not Contacted',
          assigned_to: 'Amit Verma',
          last_email_sent: null,
          next_scheduled_email: '2026-12-05T11:15:00Z',
          active_apps: ['Finance', 'HRMS']
        },
        {
          subscription_id: 'SUB-2026-008',
          customer_id: 'CST-0008',
          company_name: 'Vision Connect',
          plan: 'Marketing Plan',
          amount: 14999.00,
          currency: 'INR',
          billing_cycle: 'Yearly',
          status: 'Cancelled',
          payment_status: 'Refunded',
          start_date: '2025-09-15T12:00:00Z',
          renewal_date: '2026-09-15T12:00:00Z',
          warning_date: '2026-09-10T12:00:00Z',
          auto_renewal: false,
          renewal_warning_status: 'Resolved',
          followup_status: 'Closed',
          assigned_to: 'Rajesh Singh',
          last_email_sent: '2026-09-10T12:00:00Z',
          next_scheduled_email: null,
          active_apps: ['Marketing', 'Websites']
        }
      ];

      for (const s of subsToSeed) {
        await client.query(`
          INSERT INTO subscriptions (
            subscription_id, customer_id, company_name, plan, amount, currency, billing_cycle,
            status, payment_status, start_date, renewal_date, warning_date, auto_renewal,
            renewal_warning_status, followup_status, assigned_to, last_email_sent, next_scheduled_email, active_apps
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (subscription_id) DO UPDATE
          SET company_name = EXCLUDED.company_name,
              customer_id = EXCLUDED.customer_id,
              plan = EXCLUDED.plan,
              amount = EXCLUDED.amount,
              billing_cycle = EXCLUDED.billing_cycle,
              status = EXCLUDED.status,
              payment_status = EXCLUDED.payment_status,
              start_date = EXCLUDED.start_date,
              renewal_date = EXCLUDED.renewal_date,
              warning_date = EXCLUDED.warning_date,
              auto_renewal = EXCLUDED.auto_renewal,
              renewal_warning_status = EXCLUDED.renewal_warning_status,
              followup_status = EXCLUDED.followup_status,
              assigned_to = EXCLUDED.assigned_to,
              last_email_sent = EXCLUDED.last_email_sent,
              next_scheduled_email = EXCLUDED.next_scheduled_email,
              active_apps = EXCLUDED.active_apps,
              updated_at = NOW();
        `, [
          s.subscription_id, s.customer_id, s.company_name, s.plan, s.amount, s.currency, s.billing_cycle,
          s.status, s.payment_status, s.start_date, s.renewal_date, s.warning_date, s.auto_renewal,
          s.renewal_warning_status, s.followup_status, s.assigned_to, s.last_email_sent, s.next_scheduled_email, JSON.stringify(s.active_apps)
        ]);
      }

      // Seed initial reminders for SUB-2026-001
      await client.query(`
        INSERT INTO subscription_reminders (subscription_id, customer_id, company_name, recipient_email, email_type, subject, status, idempotency_key, scheduled_at, sent_at)
        VALUES 
          ('SUB-2026-001', 'CST-0001', 'Tech Solutions Pvt. Ltd.', 'rahul@techsol.com', 'renewal_reminder_5day', 'Your OXOO subscription renews soon', 'Sent', 'SUB-2026-001-2026-rem-1', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
          ('SUB-2026-001', 'CST-0001', 'Tech Solutions Pvt. Ltd.', 'rahul@techsol.com', 'renewal_reminder_10h_retry', 'Follow-up: Your OXOO subscription renews soon', 'Scheduled', 'SUB-2026-001-2026-rem-2', NOW() + INTERVAL '7 hours', NULL),
          ('SUB-2026-001', 'CST-0001', 'Tech Solutions Pvt. Ltd.', 'rahul@techsol.com', 'renewal_due_today', 'Your OXOO subscription is due today', 'Scheduled', 'SUB-2026-001-2026-rem-3', '2026-11-01T09:00:00Z', NULL),
          ('SUB-2026-001', 'CST-0001', 'Tech Solutions Pvt. Ltd.', 'rahul@techsol.com', 'payment_overdue', 'Action required: OXOO subscription payment overdue', 'Scheduled', 'SUB-2026-001-2026-rem-4', '2026-11-02T09:00:00Z', NULL)
        ON CONFLICT (idempotency_key) DO NOTHING;
      `);

      // Seed historical invoice for CST-0001
      await client.query(`
        INSERT INTO invoices (invoice_number, company_name, plan, amount, currency, status, invoice_date, due_date)
        VALUES ('INV-2025-0891', 'Tech Solutions Pvt. Ltd.', 'Business Plan', 24999.00, 'INR', 'Paid', '2024-11-01T10:00:00Z', '2024-11-15T10:00:00Z')
        ON CONFLICT (invoice_number) DO NOTHING;
      `);

      // Ensure all rows have subscription_id and warning_date
      try {
        await client.query(`
          UPDATE subscriptions
          SET subscription_id = COALESCE(subscription_id, 'SUB-2026-' || LPAD(id::text, 3, '0')),
              warning_date = COALESCE(warning_date, renewal_date - INTERVAL '5 days'),
              payment_status = COALESCE(payment_status, 'Paid'),
              auto_renewal = COALESCE(auto_renewal, true),
              customer_id = COALESCE(customer_id, (SELECT customer_id FROM customers WHERE customers.company_name = subscriptions.company_name LIMIT 1))
          WHERE subscription_id IS NULL OR warning_date IS NULL;
        `);
      } catch (subUpErr) {
        console.log('Subscriptions cleanup note:', subUpErr.message);
      }
    } catch (subSeedErr) {
      console.log('Subscription seed note:', subSeedErr.message);
    }
    } // End of SHOULD_SEED_DEMO block

    // -------------------------------------------------------------
    // 15. PRODUCTS & PLANS MANAGEMENT SCHEMA & SEEDING
    // -------------------------------------------------------------
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          product_id VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(150) NOT NULL,
          slug VARCHAR(100) UNIQUE NOT NULL,
          icon VARCHAR(50) DEFAULT 'Layers',
          icon_bg VARCHAR(20) DEFAULT '#0284c7',
          short_description TEXT,
          detailed_description TEXT,
          category VARCHAR(100) DEFAULT 'Business Management',
          included_modules JSONB DEFAULT '[]'::jsonb,
          features JSONB DEFAULT '[]'::jsonb,
          total_plans INT DEFAULT 1,
          status VARCHAR(50) DEFAULT 'Active',
          visibility VARCHAR(50) DEFAULT 'Public',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS plans (
          id SERIAL PRIMARY KEY,
          plan_id VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(150) NOT NULL,
          plan_code VARCHAR(50) UNIQUE NOT NULL,
          category VARCHAR(100) DEFAULT 'Business Management',
          plan_type VARCHAR(50) DEFAULT 'Bundle Plan',
          description TEXT,
          monthly_price NUMERIC(12, 2) NOT NULL,
          yearly_price NUMERIC(12, 2) NOT NULL,
          billing_cycle VARCHAR(50) DEFAULT 'Yearly',
          currency VARCHAR(10) DEFAULT 'INR',
          setup_fee NUMERIC(12, 2) DEFAULT 0,
          discount_percent INT DEFAULT 17,
          trial_days INT DEFAULT 14,
          active_subscriptions INT DEFAULT 0,
          status VARCHAR(50) DEFAULT 'Active',
          visibility VARCHAR(50) DEFAULT 'Public',
          included_products JSONB DEFAULT '[]'::jsonb,
          included_apps JSONB DEFAULT '[]'::jsonb,
          entitlements JSONB DEFAULT '{}'::jsonb,
          subscription_rules JSONB DEFAULT '{}'::jsonb,
          customer_access JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS plan_change_history (
          id SERIAL PRIMARY KEY,
          plan_id VARCHAR(50) NOT NULL,
          admin_name VARCHAR(150) DEFAULT 'Manminder Singh',
          action VARCHAR(100) NOT NULL,
          previous_value JSONB,
          new_value JSONB,
          reason TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Seed 9 Original Products
      await client.query(`
        INSERT INTO products (product_id, name, slug, icon, icon_bg, short_description, detailed_description, category, included_modules, features, total_plans, status, visibility, updated_at)
        VALUES
          ('PRD-001', 'OXOO Business Suite', 'business-suite', 'Layers', '#0284c7', 'Complete business management platform', 'All-in-one unified enterprise ERP and business operating system integrating finance, HRMS, CRM, inventory, and operations.', 'Business Management', '["Finance", "HRMS", "Sales", "Inventory", "Marketing", "Studio"]'::jsonb, '["Multi-Company ERP", "Unified Single Sign-On", "Enterprise Access Control", "Automated Workflows", "API Integrations"]'::jsonb, 8, 'Active', 'Public', '2026-10-24T10:30:00Z'),
          ('PRD-002', 'Finance Pro', 'finance-pro', 'CreditCard', '#059669', 'Advanced finance and accounting', 'Automated double-entry bookkeeping, GST invoicing, cashflow forecasts, automated bank reconciliations, and expense management.', 'Finance', '["Accounting", "Invoicing", "Payroll", "Cashflow", "Taxation"]'::jsonb, '["Automated Bank Feeds", "Multi-Currency Ledgers", "E-Invoicing \u0026 GST Filing", "Audit-Ready Reports", "Expense OCR Scanning"]'::jsonb, 4, 'Active', 'Public', '2026-10-22T16:12:00Z'),
          ('PRD-003', 'HRMS Pro', 'hrms-pro', 'Users', '#7c3aed', 'Complete human resource management', 'Employee self-service, automated attendance with geo-fencing, payroll processing, performance reviews, and leave management.', 'Human Resources', '["Employee", "Payroll", "Attendance", "Leaves", "Recruitment"]'::jsonb, '["Biometric \u0026 Geo Attendance", "Automated Tax Calculation", "Direct Salary Bank Transfers", "Performance Appraisals", "Employee Self Service"]'::jsonb, 4, 'Active', 'Public', '2026-10-21T11:45:00Z'),
          ('PRD-004', 'Sales Pro', 'sales-pro', 'TrendingUp', '#ea580c', 'Boost your sales and CRM', 'Comprehensive lead scoring, visual sales pipeline, deal tracking, automated follow-up sequences, and quote-to-cash workflows.', 'Sales & CRM', '["Leads", "Pipeline", "Customers", "Quotes", "Analytics"]'::jsonb, '["Kanban Deal Pipeline", "Email \u0026 Call Tracking", "Quote PDF Generator", "Lead Scoring AI", "Revenue Forecasting"]'::jsonb, 3, 'Active', 'Public', '2026-10-20T14:18:00Z'),
          ('PRD-005', 'Inventory & Supply Chain', 'inventory-supply-chain', 'Package', '#0d9488', 'Inventory and supply chain management', 'Real-time multi-warehouse inventory tracking, batch and serial tracking, supplier purchase orders, and stock reorder alerts.', 'Inventory', '["Inventory", "Warehouse", "Purchase", "Suppliers", "Shipments"]'::jsonb, '["Multi-Warehouse Tracking", "Barcode \u0026 QR Labeling", "Automated Purchase Orders", "Batch Expiry Tracking", "Carrier Shipping APIs"]'::jsonb, 3, 'Inactive', 'Public', '2026-10-18T09:20:00Z'),
          ('PRD-006', 'Marketing Pro', 'marketing-pro', 'Send', '#db2777', 'Marketing automation and campaigns', 'Multi-channel email and SMS campaign management, audience segmentation, landing page builder, and conversion tracking.', 'Marketing', '["Email", "Campaign", "Analytics", "Audience", "Templates"]'::jsonb, '["Drag-and-Drop Email Builder", "Drip Email Sequences", "SMS \u0026 WhatsApp Broadcasts", "UTM Tracking Analytics", "A/B Testing Engine"]'::jsonb, 2, 'Active', 'Public', '2026-10-16T17:40:00Z'),
          ('PRD-007', 'Website Builder', 'website-builder', 'Globe', '#4f46e5', 'Drag-and-drop website and customer portal builder', 'High-converting responsive website builder, SEO optimization, client portals, and e-commerce storefronts.', 'Website & Portals', '["Editor", "Hosting", "Domains", "SEO", "E-commerce"]'::jsonb, '["Visual Theme Customizer", "Ultra-Fast CDN Hosting", "Custom Domain SSL", "Automated Sitemap Generation", "Secure Client Area"]'::jsonb, 2, 'Active', 'Public', '2026-10-15T12:10:00Z'),
          ('PRD-008', 'Productivity Suite', 'productivity-suite', 'Zap', '#06b6d4', 'Unified team workspace, tasks and notes', 'Kanban task boards, shared calendar, document editor, knowledge base, and team chat collaboration.', 'Productivity', '["Tasks", "Calendar", "Docs", "Chat", "Notes"]'::jsonb, '["Collaborative Rich Text Docs", "Shared Team Calendars", "Task Dependencies \u0026 Gantt", "Knowledge Base Wiki", "Integrated Channels"]'::jsonb, 2, 'Active', 'Public', '2026-10-14T09:00:00Z'),
          ('PRD-009', 'AI Tools', 'ai-tools', 'Sparkles', '#9333ea', 'AI assistants, automations and neural workflows', 'Autonomous AI agents, customer support bot, automated invoice data extractor, and smart predictive analytics.', 'AI & Automation', '["AI Copilot", "Data OCR", "Voice AI", "Auto-Flow", "Analytics"]'::jsonb, '["Gemini 2.5 Flash Assistants", "Intelligent Document Parser", "Automated Voice Agents", "Predictive Churn Model", "Custom Prompt Workflows"]'::jsonb, 2, 'Active', 'Public', '2026-10-12T15:20:00Z')
        ON CONFLICT (product_id) DO UPDATE
        SET name = EXCLUDED.name,
            icon = EXCLUDED.icon,
            icon_bg = EXCLUDED.icon_bg,
            short_description = EXCLUDED.short_description,
            detailed_description = EXCLUDED.detailed_description,
            category = EXCLUDED.category,
            included_modules = EXCLUDED.included_modules,
            features = EXCLUDED.features,
            total_plans = EXCLUDED.total_plans,
            status = EXCLUDED.status,
            updated_at = NOW();
      `);

      // Seed Authoritative Real Plans (Matching 24 Total Plans: 18 Active, 3 Draft, 3 Inactive)
      await client.query(`
        INSERT INTO plans (plan_id, name, plan_code, category, plan_type, description, monthly_price, yearly_price, billing_cycle, currency, setup_fee, discount_percent, trial_days, active_subscriptions, status, visibility, included_products, included_apps, entitlements, subscription_rules, customer_access, created_at, updated_at)
        VALUES
          ('PLAN-001', 'Business Plan', 'BUSINESS', 'Business Management', 'Bundle Plan', 'A complete solution for growing businesses with finance, HRMS, sales, inventory and marketing tools.', 24999.00, 249999.00, 'Yearly', 'INR', 0, 17, 14, 482, 'Active', 'Public', '["OXOO Business Suite", "Finance Pro", "HRMS Pro", "Sales Pro"]'::jsonb, '["Finance", "HRMS", "Sales", "Inventory"]'::jsonb, '{"user_limit": 50, "storage_gb": 100, "org_limit": 5, "support_level": "Priority 24/7"}'::jsonb, '{"grace_period_days": 10, "auto_renew_default": true}'::jsonb, '{"apps": ["finance", "hrms", "sales"]}'::jsonb, '2025-09-12T10:25:00Z', '2026-10-24T15:40:00Z'),
          ('PLAN-002', 'Enterprise Plan', 'ENTERPRISE', 'Enterprise Management', 'Bundle Plan', 'Full enterprise tier with unlimited users, AI automation, custom integrations and dedicated support.', 49999.00, 499999.00, 'Yearly', 'INR', 0, 17, 30, 216, 'Active', 'Public', '["OXOO Business Suite", "Finance Pro", "HRMS Pro", "Sales Pro", "Inventory & Supply Chain", "Marketing Pro", "Website Builder", "Productivity Suite", "AI Tools"]'::jsonb, '["All Applications"]'::jsonb, '{"user_limit": 250, "storage_gb": 1000, "org_limit": 25, "support_level": "Dedicated Account Manager"}'::jsonb, '{"grace_period_days": 15, "auto_renew_default": true}'::jsonb, '{"apps": ["all"]}'::jsonb, '2025-08-10T11:00:00Z', '2026-10-23T12:00:00Z'),
          ('PLAN-003', 'Starter Plan', 'STARTER', 'Finance & Ops', 'Bundle Plan', 'Essential tools for small teams needing reliable finance, invoicing and task collaboration.', 4999.00, 49990.00, 'Monthly', 'INR', 0, 16, 14, 142, 'Active', 'Public', '["Finance Pro", "Productivity Suite"]'::jsonb, '["Finance", "Productivity"]'::jsonb, '{"user_limit": 10, "storage_gb": 20, "org_limit": 1, "support_level": "Standard Email"}'::jsonb, '{"grace_period_days": 7, "auto_renew_default": true}'::jsonb, '{"apps": ["finance", "productivity"]}'::jsonb, '2025-10-01T09:00:00Z', '2026-10-20T10:15:00Z'),
          ('PLAN-004', 'Professional Plan', 'PRO', 'Business Growth', 'Bundle Plan', 'Ideal for growing companies with active sales pipelines, employee management, and financial ledgers.', 9499.00, 94990.00, 'Monthly', 'INR', 0, 16, 14, 88, 'Active', 'Public', '["Finance Pro", "Sales Pro", "HRMS Pro"]'::jsonb, '["Finance", "Sales", "HRMS"]'::jsonb, '{"user_limit": 25, "storage_gb": 50, "org_limit": 2, "support_level": "Priority Chat"}'::jsonb, '{"grace_period_days": 10, "auto_renew_default": true}'::jsonb, '{"apps": ["finance", "sales", "hrms"]}'::jsonb, '2025-10-05T14:30:00Z', '2026-10-18T16:00:00Z'),
          ('PLAN-005', 'Single Software', 'SINGLE', 'Standalone Apps', 'Single Product Plan', 'Flexible individual module subscription for standalone accounting, HRMS or marketing.', 660.80, 7929.00, 'Monthly', 'INR', 0, 0, 7, 34, 'Active', 'Public', '["Finance Pro"]'::jsonb, '["Finance"]'::jsonb, '{"user_limit": 2, "storage_gb": 5, "org_limit": 1, "support_level": "Standard"}'::jsonb, '{"grace_period_days": 5, "auto_renew_default": true}'::jsonb, '{"apps": ["single"]}'::jsonb, '2025-11-01T08:00:00Z', '2026-10-15T09:30:00Z'),
          ('PLAN-006', 'HRMS Plan', 'HRMS', 'Human Resources', 'Single Product Plan', 'Dedicated human capital management, attendance tracking, payroll and biometric integrations.', 12999.00, 129990.00, 'Yearly', 'INR', 0, 17, 14, 16, 'Active', 'Public', '["HRMS Pro"]'::jsonb, '["HRMS"]'::jsonb, '{"user_limit": 100, "storage_gb": 50, "org_limit": 3, "support_level": "Priority"}'::jsonb, '{"grace_period_days": 10, "auto_renew_default": true}'::jsonb, '{"apps": ["hrms"]}'::jsonb, '2025-11-10T10:00:00Z', '2026-10-14T11:20:00Z'),
          ('PLAN-007', 'Finance Plan', 'FINANCE', 'Finance', 'Single Product Plan', 'Complete enterprise financial control, advanced taxation, multi-currency ledgers, and e-invoicing.', 18999.00, 189990.00, 'Yearly', 'INR', 0, 17, 14, 12, 'Active', 'Public', '["Finance Pro"]'::jsonb, '["Finance"]'::jsonb, '{"user_limit": 30, "storage_gb": 40, "org_limit": 2, "support_level": "Priority"}'::jsonb, '{"grace_period_days": 10, "auto_renew_default": true}'::jsonb, '{"apps": ["finance"]}'::jsonb, '2025-11-15T12:00:00Z', '2026-10-12T14:45:00Z'),
          ('PLAN-008', 'Custom Plan', 'CUSTOM', 'Custom Enterprise', 'Bundle Plan', 'Tailored software configuration configured specifically for unique business operations.', 27500.00, 275000.00, 'Yearly', 'INR', 0, 17, 30, 6, 'Active', 'Public', '["OXOO Business Suite", "AI Tools"]'::jsonb, '["Custom Modules"]'::jsonb, '{"user_limit": 75, "storage_gb": 200, "org_limit": 5, "support_level": "Dedicated"}'::jsonb, '{"grace_period_days": 14, "auto_renew_default": true}'::jsonb, '{"apps": ["custom"]}'::jsonb, '2025-12-01T15:00:00Z', '2026-10-10T16:00:00Z'),
          ('PLAN-009', 'Supply Chain Specialist', 'SUPPLY_CHAIN_DRAFT', 'Supply Chain', 'Single Product Plan', 'Comprehensive inventory, multi-warehouse and procurement logistics package.', 15000.00, 150000.00, 'Monthly', 'INR', 0, 16, 14, 0, 'Draft', 'Private', '["Inventory & Supply Chain"]'::jsonb, '["Inventory"]'::jsonb, '{"user_limit": 15, "storage_gb": 30, "org_limit": 2, "support_level": "Standard"}'::jsonb, '{"grace_period_days": 7, "auto_renew_default": true}'::jsonb, '{"apps": ["supply-chain"]}'::jsonb, '2026-10-01T10:00:00Z', '2026-10-24T18:00:00Z'),
          ('PLAN-010', 'AI Growth Suite', 'AI_GROWTH_DRAFT', 'AI & Automation', 'Bundle Plan', 'Advanced autonomous AI workflows, marketing automation, predictive forecasting.', 29999.00, 299990.00, 'Yearly', 'INR', 0, 17, 14, 0, 'Draft', 'Private', '["AI Tools", "Marketing Pro"]'::jsonb, '["AI", "Marketing"]'::jsonb, '{"user_limit": 40, "storage_gb": 100, "org_limit": 3, "support_level": "Priority"}'::jsonb, '{"grace_period_days": 10, "auto_renew_default": true}'::jsonb, '{"apps": ["ai", "marketing"]}'::jsonb, '2026-10-05T11:00:00Z', '2026-10-25T14:00:00Z'),
          ('PLAN-011', 'Global Commerce Suite', 'COMMERCE_DRAFT', 'E-Commerce', 'Bundle Plan', 'Unified digital storefront, multi-currency payments, supply chain inventory synchronization.', 34999.00, 349990.00, 'Yearly', 'INR', 0, 17, 14, 0, 'Draft', 'Private', '["Website Builder", "Inventory & Supply Chain"]'::jsonb, '["Website", "Inventory"]'::jsonb, '{"user_limit": 50, "storage_gb": 150, "org_limit": 4, "support_level": "Priority"}'::jsonb, '{"grace_period_days": 10, "auto_renew_default": true}'::jsonb, '{"apps": ["website", "inventory"]}'::jsonb, '2026-10-10T12:00:00Z', '2026-10-25T15:30:00Z'),
          ('PLAN-012', 'Legacy Single Software', 'LEGACY_SINGLE', 'Standalone Apps', 'Single Product Plan', 'Archived individual product tier for legacy customers.', 599.00, 5990.00, 'Monthly', 'INR', 0, 0, 0, 2, 'Inactive', 'Private', '["Finance Pro"]'::jsonb, '["Finance"]'::jsonb, '{"user_limit": 1, "storage_gb": 2, "org_limit": 1, "support_level": "Community"}'::jsonb, '{"grace_period_days": 3, "auto_renew_default": false}'::jsonb, '{"apps": ["legacy"]}'::jsonb, '2024-01-01T00:00:00Z', '2025-06-01T00:00:00Z'),
          ('PLAN-013', 'Legacy Basic Suite', 'LEGACY_BASIC', 'Business Management', 'Bundle Plan', 'Previous generation business starter bundle.', 3999.00, 39990.00, 'Monthly', 'INR', 0, 0, 0, 1, 'Inactive', 'Private', '["OXOO Business Suite"]'::jsonb, '["Business"]'::jsonb, '{"user_limit": 5, "storage_gb": 10, "org_limit": 1, "support_level": "Community"}'::jsonb, '{"grace_period_days": 3, "auto_renew_default": false}'::jsonb, '{"apps": ["legacy"]}'::jsonb, '2024-03-01T00:00:00Z', '2025-08-01T00:00:00Z'),
          ('PLAN-014', 'Legacy Enterprise 2024', 'LEGACY_ENT_24', 'Enterprise Management', 'Bundle Plan', 'Grandfathered 2024 enterprise contract tier.', 39999.00, 399990.00, 'Yearly', 'INR', 0, 0, 0, 1, 'Inactive', 'Private', '["OXOO Business Suite", "Finance Pro"]'::jsonb, '["All 2024"]'::jsonb, '{"user_limit": 100, "storage_gb": 500, "org_limit": 10, "support_level": "Standard"}'::jsonb, '{"grace_period_days": 7, "auto_renew_default": true}'::jsonb, '{"apps": ["legacy"]}'::jsonb, '2024-06-01T00:00:00Z', '2025-09-01T00:00:00Z'),
          ('PLAN-015', 'Sales Accelerator', 'SALES_ACCEL', 'Sales & CRM', 'Single Product Plan', 'Specialized CRM tier for high-velocity outbound sales teams.', 7999.00, 79990.00, 'Monthly', 'INR', 0, 16, 14, 18, 'Active', 'Public', '["Sales Pro"]'::jsonb, '["Sales"]'::jsonb, '{"user_limit": 15, "storage_gb": 25, "org_limit": 1, "support_level": "Standard"}'::jsonb, '{"grace_period_days": 7, "auto_renew_default": true}'::jsonb, '{"apps": ["sales"]}'::jsonb, '2026-01-15T09:00:00Z', '2026-10-15T10:00:00Z'),
          ('PLAN-016', 'Digital Marketing Hub', 'MKTG_HUB', 'Marketing', 'Single Product Plan', 'End-to-end campaign automation, audience segmentation, and lead generation.', 14999.00, 149990.00, 'Monthly', 'INR', 0, 16, 14, 14, 'Active', 'Public', '["Marketing Pro"]'::jsonb, '["Marketing"]'::jsonb, '{"user_limit": 20, "storage_gb": 40, "org_limit": 2, "support_level": "Standard"}'::jsonb, '{"grace_period_days": 7, "auto_renew_default": true}'::jsonb, '{"apps": ["marketing"]}'::jsonb, '2026-02-01T10:00:00Z', '2026-10-16T11:00:00Z'),
          ('PLAN-017', 'Web & Portal Engine', 'WEB_PORTAL', 'Website & Portals', 'Single Product Plan', 'Full website and customer portal creation platform with SSL hosting.', 9999.00, 99990.00, 'Monthly', 'INR', 0, 16, 14, 12, 'Active', 'Public', '["Website Builder"]'::jsonb, '["Websites"]'::jsonb, '{"user_limit": 10, "storage_gb": 30, "org_limit": 1, "support_level": "Standard"}'::jsonb, '{"grace_period_days": 7, "auto_renew_default": true}'::jsonb, '{"apps": ["websites"]}'::jsonb, '2026-03-01T11:00:00Z', '2026-10-17T12:00:00Z'),
          ('PLAN-018', 'Team Productivity Pro', 'PROD_PRO', 'Productivity', 'Single Product Plan', 'Collaborative documents, kanban projects, team chats and calendar sync.', 4499.00, 44990.00, 'Monthly', 'INR', 0, 16, 14, 15, 'Active', 'Public', '["Productivity Suite"]'::jsonb, '["Productivity"]'::jsonb, '{"user_limit": 20, "storage_gb": 25, "org_limit": 1, "support_level": "Standard"}'::jsonb, '{"grace_period_days": 7, "auto_renew_default": true}'::jsonb, '{"apps": ["productivity"]}'::jsonb, '2026-03-15T12:00:00Z', '2026-10-18T13:00:00Z'),
          ('PLAN-019', 'AI Autonomous Agents', 'AI_AGENTS', 'AI & Automation', 'Single Product Plan', 'Dedicated AI workers for customer service, invoice extraction and predictive analytics.', 19999.00, 199990.00, 'Monthly', 'INR', 0, 16, 14, 10, 'Active', 'Public', '["AI Tools"]'::jsonb, '["AI"]'::jsonb, '{"user_limit": 25, "storage_gb": 50, "org_limit": 2, "support_level": "Priority"}'::jsonb, '{"grace_period_days": 10, "auto_renew_default": true}'::jsonb, '{"apps": ["ai"]}'::jsonb, '2026-04-01T13:00:00Z', '2026-10-19T14:00:00Z'),
          ('PLAN-020', 'Operations Growth Duo', 'OPS_DUO', 'Business Management', 'Bundle Plan', 'Combines Finance Pro with HRMS Pro for streamlined back-office operations.', 16999.00, 169990.00, 'Monthly', 'INR', 0, 16, 14, 9, 'Active', 'Public', '["Finance Pro", "HRMS Pro"]'::jsonb, '["Finance", "HRMS"]'::jsonb, '{"user_limit": 30, "storage_gb": 60, "org_limit": 2, "support_level": "Standard"}'::jsonb, '{"grace_period_days": 10, "auto_renew_default": true}'::jsonb, '{"apps": ["finance", "hrms"]}'::jsonb, '2026-05-01T14:00:00Z', '2026-10-20T15:00:00Z'),
          ('PLAN-021', 'Customer Acquisition Duo', 'GROWTH_DUO', 'Sales & Marketing', 'Bundle Plan', 'Integrated Sales Pro and Marketing Pro to accelerate client acquisition.', 17999.00, 179990.00, 'Monthly', 'INR', 0, 16, 14, 8, 'Active', 'Public', '["Sales Pro", "Marketing Pro"]'::jsonb, '["Sales", "Marketing"]'::jsonb, '{"user_limit": 25, "storage_gb": 50, "org_limit": 2, "support_level": "Standard"}'::jsonb, '{"grace_period_days": 10, "auto_renew_default": true}'::jsonb, '{"apps": ["sales", "marketing"]}'::jsonb, '2026-06-01T15:00:00Z', '2026-10-21T16:00:00Z'),
          ('PLAN-022', 'Digital Presence & Sales', 'WEB_SALES', 'Sales & Portals', 'Bundle Plan', 'Website Builder combined with Sales Pro CRM for online lead capture and closing.', 13999.00, 139990.00, 'Monthly', 'INR', 0, 16, 14, 7, 'Active', 'Public', '["Website Builder", "Sales Pro"]'::jsonb, '["Website", "Sales"]'::jsonb, '{"user_limit": 20, "storage_gb": 40, "org_limit": 2, "support_level": "Standard"}'::jsonb, '{"grace_period_days": 7, "auto_renew_default": true}'::jsonb, '{"apps": ["website", "sales"]}'::jsonb, '2026-07-01T16:00:00Z', '2026-10-22T17:00:00Z'),
          ('PLAN-023', 'Smart Office Bundle', 'SMART_OFFICE', 'Productivity & AI', 'Bundle Plan', 'Productivity Suite plus AI Tools for intelligent team workflows and document processing.', 21999.00, 219990.00, 'Monthly', 'INR', 0, 16, 14, 6, 'Active', 'Public', '["Productivity Suite", "AI Tools"]'::jsonb, '["Productivity", "AI"]'::jsonb, '{"user_limit": 35, "storage_gb": 75, "org_limit": 3, "support_level": "Priority"}'::jsonb, '{"grace_period_days": 10, "auto_renew_default": true}'::jsonb, '{"apps": ["productivity", "ai"]}'::jsonb, '2026-08-01T17:00:00Z', '2026-10-23T18:00:00Z'),
          ('PLAN-024', 'Complete Startup Launchpad', 'STARTUP_LAUNCH', 'Business Management', 'Bundle Plan', 'Foundational package tailored for early-stage companies and tech startups.', 11999.00, 119990.00, 'Monthly', 'INR', 0, 16, 14, 5, 'Active', 'Public', '["Finance Pro", "Website Builder", "Productivity Suite"]'::jsonb, '["Finance", "Website", "Productivity"]'::jsonb, '{"user_limit": 15, "storage_gb": 35, "org_limit": 1, "support_level": "Standard"}'::jsonb, '{"grace_period_days": 7, "auto_renew_default": true}'::jsonb, '{"apps": ["finance", "website", "productivity"]}'::jsonb, '2026-09-01T18:00:00Z', '2026-10-24T19:00:00Z')
        ON CONFLICT (plan_id) DO UPDATE
        SET name = EXCLUDED.name,
            plan_code = EXCLUDED.plan_code,
            category = EXCLUDED.category,
            plan_type = EXCLUDED.plan_type,
            description = EXCLUDED.description,
            monthly_price = EXCLUDED.monthly_price,
            yearly_price = EXCLUDED.yearly_price,
            billing_cycle = EXCLUDED.billing_cycle,
            active_subscriptions = EXCLUDED.active_subscriptions,
            status = EXCLUDED.status,
            included_products = EXCLUDED.included_products,
            included_apps = EXCLUDED.included_apps,
            entitlements = EXCLUDED.entitlements,
            updated_at = NOW();
      `);
    } catch (prodPlanErr) {
      console.error('Products/Plans seed error:', prodPlanErr.message);
    }

    // -------------------------------------------------------------
    // 16. APPLICATIONS, PAYMENTS/INVOICES, STAFF RBAC & SUPPORT TICKETS
    // -------------------------------------------------------------
    try {
      // A. Platform Applications
      await client.query(`
        CREATE TABLE IF NOT EXISTS platform_applications (
          id SERIAL PRIMARY KEY,
          app_id VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(150) NOT NULL,
          slug VARCHAR(100) UNIQUE NOT NULL,
          category VARCHAR(100) NOT NULL,
          icon VARCHAR(50) DEFAULT 'Layers',
          icon_bg VARCHAR(50) DEFAULT '#0284c7',
          short_description TEXT,
          detailed_description TEXT,
          main_url VARCHAR(255) NOT NULL,
          employee_url VARCHAR(255) DEFAULT '/employee',
          admin_url VARCHAR(255) DEFAULT '/admin',
          customer_dashboard_url VARCHAR(255) DEFAULT '/customer',
          logout_url VARCHAR(255) DEFAULT '/logout',
          health_url VARCHAR(255) DEFAULT '/health',
          app_type VARCHAR(50) DEFAULT 'Cloud Web App',
          access_mode VARCHAR(50) DEFAULT 'SSO Protected',
          auth_method VARCHAR(50) DEFAULT 'OXOO OAuth2 / JWT',
          service_key VARCHAR(255) DEFAULT 'sk_live_9f8d7e6c5b4a3e2d',
          access_protection BOOLEAN DEFAULT true,
          warning_page_url VARCHAR(255) DEFAULT 'https://oxoo.in/access-denied',
          subscription_required VARCHAR(100) DEFAULT 'Business Plan',
          status VARCHAR(50) DEFAULT 'Active',
          health_status VARCHAR(50) DEFAULT 'Operational',
          health_response_ms INT DEFAULT 35,
          last_health_check TIMESTAMPTZ DEFAULT NOW(),
          allowed_domains JSONB DEFAULT '["*.oxoo.in", "localhost"]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Seed 9 Platform Applications matching user mockup
      await client.query(`
        INSERT INTO platform_applications (
          app_id, name, slug, category, icon, icon_bg, short_description, detailed_description,
          main_url, employee_url, admin_url, customer_dashboard_url, logout_url, health_url,
          app_type, access_mode, auth_method, service_key, access_protection, warning_page_url,
          subscription_required, status, health_status, health_response_ms, allowed_domains, updated_at
        ) VALUES
          ('APP-HRMS', 'Employee Pro HRMS', 'employee-pro-hrms', 'HR', 'Users', '#7c3aed', 'Complete HR and employee-management solution.', 'Manage employees, attendance, payroll, leave, performance and more with Employee Pro HRMS.', 'https://hrms.oxoo.in', '/employee', '/admin', 'https://hrms.oxoo.in/customer', 'https://hrms.oxoo.in/logout', 'https://hrms.oxoo.in/health', 'HRMS', 'SSO Protected', 'OXOO OAuth2 / JWT', 'sk_live_9f8d7e6c5b4a3e2d', true, 'https://oxoo.in/access-denied', 'HRMS Plan', 'Active', 'Operational', 32, '["*.oxoo.in", "localhost"]'::jsonb, NOW()),
          ('APP-FIN', 'OXOO Finance', 'oxoo-finance', 'Finance', 'CreditCard', '#059669', 'Enterprise accounting, ledgers and GST invoicing.', 'Automated bookkeeping, invoice creation, multi-currency accounts and financial reports.', 'https://finance.oxoo.in', '/portal', '/admin', 'https://finance.oxoo.in/customer', 'https://finance.oxoo.in/logout', 'https://finance.oxoo.in/health', 'Finance', 'SSO Protected', 'OXOO OAuth2 / JWT', 'sk_live_8a7b6c5d4e3f2a1b', true, 'https://oxoo.in/access-denied', 'Finance Plan', 'Active', 'Operational', 28, '["*.oxoo.in", "localhost"]'::jsonb, NOW()),
          ('APP-SALES', 'Sales Pro', 'sales-pro-app', 'Sales', 'TrendingUp', '#ea580c', 'Pipeline tracking, CRM and deals closing.', 'Complete visual pipeline, deal progress tracking, automated follow-up sequences and customer intelligence.', 'https://sales.oxoo.in', '/login', '/admin', 'https://sales.oxoo.in/pipeline', 'https://sales.oxoo.in/logout', 'https://sales.oxoo.in/health', 'Sales', 'SSO Protected', 'OXOO OAuth2 / JWT', 'sk_live_7c6d5e4f3a2b1c9d', true, 'https://oxoo.in/access-denied', 'Business Plan', 'Active', 'Operational', 45, '["*.oxoo.in", "localhost"]'::jsonb, NOW()),
          ('APP-INVENTORY', 'Inventory & SCM', 'inventory-scm', 'Inventory', 'Package', '#0d9488', 'Multi-warehouse stock and supply chain tracking.', 'Real-time multi-warehouse inventory levels, reorder alerts, supplier tracking and shipments.', 'https://inventory.oxoo.in', '/staff', '/admin', 'https://inventory.oxoo.in/warehouse', 'https://inventory.oxoo.in/logout', 'https://inventory.oxoo.in/health', 'Inventory', 'SSO Protected', 'OXOO OAuth2 / JWT', 'sk_live_6b5a4f3e2d1c9b8a', true, 'https://oxoo.in/access-denied', 'Enterprise Plan', 'Maintenance', 'Degraded', 120, '["*.oxoo.in", "localhost"]'::jsonb, NOW()),
          ('APP-MKTG', 'Marketing Pro', 'marketing-pro-app', 'Marketing', 'Send', '#db2777', 'Multi-channel marketing campaigns and newsletters.', 'Broadcast drip emails, SMS automations, audience segmentation and tracking conversion analytics.', 'https://marketing.oxoo.in', '/login', '/admin', 'https://marketing.oxoo.in/campaigns', 'https://marketing.oxoo.in/logout', 'https://marketing.oxoo.in/health', 'Marketing', 'SSO Protected', 'OXOO OAuth2 / JWT', 'sk_live_5a4b3c2d1e9f8a7b', true, 'https://oxoo.in/access-denied', 'Business Plan', 'Active', 'Operational', 38, '["*.oxoo.in", "localhost"]'::jsonb, NOW()),
          ('APP-WEB', 'Website Builder', 'website-builder-app', 'Web', 'Globe', '#4f46e5', 'Drag-and-drop website and customer portal builder.', 'Build high-converting landing pages, e-commerce storefronts and client portals with CDN hosting.', 'https://web.oxoo.in', '/login', '/admin', 'https://web.oxoo.in/editor', 'https://web.oxoo.in/logout', 'https://web.oxoo.in/health', 'Website Builder', 'SSO Protected', 'OXOO OAuth2 / JWT', 'sk_live_4f3e2d1c9b8a7f6e', true, 'https://oxoo.in/access-denied', 'Starter Plan', 'Active', 'Operational', 25, '["*.oxoo.in", "localhost"]'::jsonb, NOW()),
          ('APP-PROD', 'Productivity Suite', 'productivity-suite-app', 'Productivity', 'Zap', '#06b6d4', 'Team collaboration, kanban tasks, notes and calendar.', 'Collaborative documents, shared team calendar, sprint boards and internal messaging channels.', 'https://productivity.oxoo.in', '/login', '/admin', 'https://productivity.oxoo.in/tasks', 'https://productivity.oxoo.in/logout', 'https://productivity.oxoo.in/health', 'Productivity', 'SSO Protected', 'OXOO OAuth2 / JWT', 'sk_live_3e2d1c9b8a7f6e5d', true, 'https://oxoo.in/access-denied', 'Starter Plan', 'Active', 'Operational', 30, '["*.oxoo.in", "localhost"]'::jsonb, NOW()),
          ('APP-AI', 'AI Tools & Studio', 'ai-tools-app', 'AI', 'Sparkles', '#9333ea', 'Autonomous AI copilot and prompt automation.', 'Intelligent document extraction, generative responses, predictive forecasting and smart bots.', 'https://ai.oxoo.in', '/chat', '/admin', 'https://ai.oxoo.in/agents', 'https://ai.oxoo.in/logout', 'https://ai.oxoo.in/health', 'AI', 'SSO Protected', 'OXOO OAuth2 / JWT', 'sk_live_2d1c9b8a7f6e5d4c', true, 'https://oxoo.in/access-denied', 'Enterprise Plan', 'Active', 'Operational', 55, '["*.oxoo.in", "localhost"]'::jsonb, NOW()),
          ('APP-BIZ', 'OXOO Business Suite', 'oxoo-business-suite-app', 'Business Management', 'Layers', '#0284c7', 'Unified business ERP and operating system.', 'Unified single sign-on access to all enterprise modules and cross-organization operations.', 'https://suite.oxoo.in', '/portal', '/admin', 'https://suite.oxoo.in/dashboard', 'https://suite.oxoo.in/logout', 'https://suite.oxoo.in/health', 'Business Suite', 'SSO Protected', 'OXOO OAuth2 / JWT', 'sk_live_1c9b8a7f6e5d4c3b', true, 'https://oxoo.in/access-denied', 'Business Plan', 'Active', 'Operational', 22, '["*.oxoo.in", "localhost"]'::jsonb, NOW())
        ON CONFLICT (app_id) DO UPDATE
        SET name = EXCLUDED.name,
            category = EXCLUDED.category,
            icon = EXCLUDED.icon,
            icon_bg = EXCLUDED.icon_bg,
            main_url = EXCLUDED.main_url,
            employee_url = EXCLUDED.employee_url,
            admin_url = EXCLUDED.admin_url,
            customer_dashboard_url = EXCLUDED.customer_dashboard_url,
            status = EXCLUDED.status,
            health_status = EXCLUDED.health_status,
            updated_at = NOW();
      `);

      // B. Invoices & Payments Schema Enhancement
      await client.query(`
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'Yearly';
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12, 2);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'Razorpay (UPI)';
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_timeline JSONB DEFAULT '[]'::jsonb;
      `);

      if (SHOULD_SEED_DEMO) {
        // Seed authoritative invoices matching user mockup
        await client.query(`
          INSERT INTO invoices (
            invoice_number, transaction_id, customer_id, company_name, customer_email, customer_phone,
            plan, plan_name, billing_cycle, subtotal, tax_amount, amount, currency, payment_method,
            status, invoice_date, payment_date, due_date, items, payment_timeline
          ) VALUES
            (
              'INV-2026-1024', 'TXN6423567890', 'CST-0001', 'Tech Solutions Pvt. Ltd.', 'rahul@techsol.com', '+91 98765 43210',
              'Business Plan', 'Business Plan', 'Yearly', 24999.00, 4499.82, 29498.82, 'INR', 'Razorpay (UPI)',
              'Paid', '2026-10-01T09:50:00Z', '2026-10-01T10:26:00Z', '2027-10-01T10:26:00Z',
              '["Finance", "HRMS", "Sales", "Inventory"]'::jsonb,
              '[{"step": "Invoice Created", "time": "01 Oct 2026, 09:50 AM", "completed": true}, {"step": "Payment Initiated", "time": "01 Oct 2026, 10:20 AM", "completed": true}, {"step": "Payment Confirmed", "time": "01 Oct 2026, 10:25 AM", "completed": true}, {"step": "Invoice Paid", "time": "01 Oct 2026, 10:26 AM", "completed": true}]'::jsonb
            ),
            (
              'INV-2026-1019', 'TXN5512498761', 'CST-0002', 'Global Trade Inc.', 'sarah@globaltrade.com', '+1 415 555 8742',
              'Enterprise Plan', 'Enterprise Plan', 'Yearly', 49999.00, 8999.82, 58998.82, 'INR', 'Credit Card',
              'Paid', '2026-10-10T14:15:00Z', '2026-10-10T14:18:00Z', '2027-10-10T14:18:00Z',
              '["All Applications", "Enterprise SSO", "AI Studio"]'::jsonb,
              '[{"step": "Invoice Created", "time": "10 Oct 2026, 02:15 PM", "completed": true}, {"step": "Payment Initiated", "time": "10 Oct 2026, 02:16 PM", "completed": true}, {"step": "Payment Confirmed", "time": "10 Oct 2026, 02:17 PM", "completed": true}, {"step": "Invoice Paid", "time": "10 Oct 2026, 02:18 PM", "completed": true}]'::jsonb
            ),
            (
              'INV-2026-1018', 'TXN4498721345', 'CST-0003', 'Skyline Marketing', 'amit@skylinemkt.com', '+91 99887 77665',
              'Standard Plan', 'Standard Plan', 'Monthly', 7999.00, 1439.82, 9438.82, 'INR', 'UPI',
              'Pending', '2026-10-14T10:00:00Z', NULL, '2026-10-28T18:00:00Z',
              '["Marketing Pro", "Website Builder"]'::jsonb,
              '[{"step": "Invoice Created", "time": "14 Oct 2026, 10:00 AM", "completed": true}, {"step": "Payment Initiated", "time": "14 Oct 2026, 10:02 AM", "completed": true}, {"step": "Payment Pending", "time": "14 Oct 2026, 10:05 AM", "completed": false}, {"step": "Invoice Paid", "time": null, "completed": false}]'::jsonb
            ),
            (
              'INV-2026-1017', 'TXN3387612450', 'CST-0004', 'NextGen HR', 'priya@nextgenhr.com', '+91 91234 56789',
              'HRMS Plan', 'HRMS Plan', 'Yearly', 12999.00, 2339.82, 15338.82, 'INR', 'Netbanking',
              'Paid', '2026-09-21T11:10:00Z', '2026-09-21T11:14:00Z', '2027-09-21T11:14:00Z',
              '["Employee Pro HRMS", "Payroll Pro"]'::jsonb,
              '[{"step": "Invoice Created", "time": "21 Sep 2026, 11:10 AM", "completed": true}, {"step": "Payment Initiated", "time": "21 Sep 2026, 11:12 AM", "completed": true}, {"step": "Payment Confirmed", "time": "21 Sep 2026, 11:13 AM", "completed": true}, {"step": "Invoice Paid", "time": "21 Sep 2026, 11:14 AM", "completed": true}]'::jsonb
            ),
            (
              'INV-2026-1016', 'TXN2276509814', 'CST-0005', 'Brightway Retail', 'james@brightway.com', '+44 7700 900123',
              'Finance Plan', 'Finance Plan', 'Monthly', 8499.00, 1529.82, 10028.82, 'INR', 'Credit Card',
              'Failed', '2026-10-18T09:00:00Z', NULL, '2026-10-18T09:00:00Z',
              '["OXOO Finance", "Invoicing"]'::jsonb,
              '[{"step": "Invoice Created", "time": "18 Oct 2026, 09:00 AM", "completed": true}, {"step": "Payment Initiated", "time": "18 Oct 2026, 09:01 AM", "completed": true}, {"step": "Payment Failed", "time": "18 Oct 2026, 09:02 AM", "completed": false}, {"step": "Invoice Paid", "time": null, "completed": false}]'::jsonb
            )
          ON CONFLICT (invoice_number) DO UPDATE
          SET transaction_id = EXCLUDED.transaction_id,
              customer_id = EXCLUDED.customer_id,
              customer_email = EXCLUDED.customer_email,
              customer_phone = EXCLUDED.customer_phone,
              plan_name = EXCLUDED.plan_name,
              billing_cycle = EXCLUDED.billing_cycle,
              subtotal = EXCLUDED.subtotal,
              tax_amount = EXCLUDED.tax_amount,
              amount = EXCLUDED.amount,
              payment_method = EXCLUDED.payment_method,
              status = EXCLUDED.status,
              payment_date = EXCLUDED.payment_date,
              due_date = EXCLUDED.due_date,
              payment_timeline = EXCLUDED.payment_timeline;
        `);
      }

      // C. Platform Staff & RBAC
      await client.query(`
        CREATE TABLE IF NOT EXISTS platform_staff (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(50) DEFAULT '',
          role VARCHAR(50) NOT NULL,
          department VARCHAR(100) NOT NULL,
          status VARCHAR(50) DEFAULT 'Active',
          access_level VARCHAR(50) DEFAULT 'Full Platform',
          permissions JSONB DEFAULT '[]'::jsonb,
          assigned_software JSONB DEFAULT '["all"]'::jsonb,
          employee_id VARCHAR(50),
          created_by VARCHAR(150) DEFAULT 'admin@oxoo.ai',
          joined_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE platform_staff ADD COLUMN IF NOT EXISTS assigned_software JSONB DEFAULT '["all"]'::jsonb;
        ALTER TABLE platform_staff ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50);
        ALTER TABLE platform_staff ADD COLUMN IF NOT EXISTS created_by VARCHAR(150) DEFAULT 'admin@oxoo.ai';
      `);

      // Ensure Super Administrator platform_staff record exists for console authorization
      await client.query(`
        INSERT INTO platform_staff (name, email, phone, role, department, status, access_level, permissions, joined_at)
        VALUES
          ('Manminder Singh', 'manminder.singh@primepro.ai', '+91 98765 43210', 'Super Admin', 'Administration', 'Active', 'Full Platform', '["*"]'::jsonb, '2026-10-01T09:00:00Z')
        ON CONFLICT (email) DO UPDATE
        SET role = 'Super Admin',
            status = 'Active';
      `);

      if (SHOULD_SEED_DEMO) {
        // Seed remaining dummy demo staff members
        await client.query(`
          INSERT INTO platform_staff (name, email, phone, role, department, status, access_level, permissions, joined_at)
          VALUES
            ('Rohit Sharma', 'rohit@oxoo.in', '+91 98765 43211', 'Finance Admin', 'Finance', 'Active', 'Module Specific', '["subscriptions.read", "payments.read", "invoices.read", "invoices.download", "reports.finance.read"]'::jsonb, '2026-10-10T10:00:00Z'),
            ('Priya Mehta', 'support@oxoo.in', '+91 98765 43212', 'Support Staff', 'Support', 'Active', 'Module Specific', '["customers.read", "subscriptions.read", "support_tickets.read", "support_tickets.reply", "support_tickets.resolve"]'::jsonb, '2026-10-12T11:00:00Z'),
            ('Amit Kumar', 'sales@oxoo.in', '+91 98765 43213', 'Sales Staff', 'Sales', 'Active', 'Read Only', '["customers.read", "subscriptions.read", "products.read", "reports.sales.read"]'::jsonb, '2026-10-15T12:00:00Z'),
            ('Vikram Malhotra', 'vikram@oxoo.in', '+91 98765 43214', 'Super Admin', 'Administration', 'Active', 'Full Platform', '["*"]'::jsonb, '2026-09-15T09:00:00Z'),
            ('Neha Singhal', 'neha.finance@oxoo.in', '+91 98765 43215', 'Finance Admin', 'Finance', 'Active', 'Module Specific', '["subscriptions.read", "payments.read", "invoices.read"]'::jsonb, '2026-09-20T10:00:00Z'),
            ('Kunal Verma', 'kunal.finance@oxoo.in', '+91 98765 43216', 'Finance Admin', 'Finance', 'Active', 'Module Specific', '["subscriptions.read", "payments.read", "invoices.read"]'::jsonb, '2026-09-25T10:00:00Z'),
            ('Anjali Gupta', 'anjali.finance@oxoo.in', '+91 98765 43217', 'Finance Admin', 'Finance', 'Active', 'Module Specific', '["subscriptions.read", "payments.read", "invoices.read"]'::jsonb, '2026-10-02T10:00:00Z'),
            ('Deepak Joshi', 'deepak.support@oxoo.in', '+91 98765 43218', 'Support Staff', 'Support', 'Active', 'Module Specific', '["support_tickets.read", "support_tickets.reply"]'::jsonb, '2026-09-18T11:00:00Z'),
            ('Sonia Roy', 'sonia.support@oxoo.in', '+91 98765 43219', 'Support Staff', 'Support', 'Active', 'Module Specific', '["support_tickets.read", "support_tickets.reply"]'::jsonb, '2026-09-22T11:00:00Z'),
            ('Rajesh Iyer', 'rajesh.support@oxoo.in', '+91 98765 43220', 'Support Staff', 'Support', 'Active', 'Module Specific', '["support_tickets.read", "support_tickets.reply"]'::jsonb, '2026-10-04T11:00:00Z'),
            ('Sneha Nair', 'sneha.support@oxoo.in', '+91 98765 43221', 'Support Staff', 'Support', 'Active', 'Module Specific', '["support_tickets.read", "support_tickets.reply"]'::jsonb, '2026-10-06T11:00:00Z'),
            ('Arjun Rao', 'arjun.support@oxoo.in', '+91 98765 43222', 'Support Staff', 'Support', 'Active', 'Module Specific', '["support_tickets.read", "support_tickets.reply"]'::jsonb, '2026-10-08T11:00:00Z'),
            ('Divya Kapoor', 'divya.support@oxoo.in', '+91 98765 43223', 'Support Staff', 'Support', 'Active', 'Module Specific', '["support_tickets.read", "support_tickets.reply"]'::jsonb, '2026-10-11T11:00:00Z'),
            ('Manoj Pandey', 'manoj.support@oxoo.in', '+91 98765 43224', 'Support Staff', 'Support', 'Active', 'Module Specific', '["support_tickets.read", "support_tickets.reply"]'::jsonb, '2026-10-14T11:00:00Z'),
            ('Simran Kaur', 'simran.sales@oxoo.in', '+91 98765 43225', 'Sales Staff', 'Sales', 'Active', 'Read Only', '["customers.read", "products.read"]'::jsonb, '2026-09-28T12:00:00Z'),
            ('Varun Bajaj', 'varun.sales@oxoo.in', '+91 98765 43226', 'Sales Staff', 'Sales', 'Active', 'Read Only', '["customers.read", "products.read"]'::jsonb, '2026-10-03T12:00:00Z'),
            ('Tanvi Saxena', 'tanvi.sales@oxoo.in', '+91 98765 43227', 'Sales Staff', 'Sales', 'Active', 'Read Only', '["customers.read", "products.read"]'::jsonb, '2026-10-07T12:00:00Z'),
            ('Gaurav Sen', 'gaurav.sales@oxoo.in', '+91 98765 43228', 'Sales Staff', 'Sales', 'Active', 'Read Only', '["customers.read", "products.read"]'::jsonb, '2026-10-12T12:00:00Z'),
            ('Ritu Bhatia', 'ritu.tech@oxoo.in', '+91 98765 43229', 'Support Staff', 'Engineering', 'Active', 'Module Specific', '["support_tickets.read"]'::jsonb, '2026-10-01T14:00:00Z'),
            ('Alok Mishra', 'alok.ops@oxoo.in', '+91 98765 43230', 'Support Staff', 'Engineering', 'Active', 'Module Specific', '["support_tickets.read"]'::jsonb, '2026-10-05T14:00:00Z'),
            ('Meera Reddy', 'meera.ops@oxoo.in', '+91 98765 43231', 'Support Staff', 'Engineering', 'Active', 'Module Specific', '["support_tickets.read"]'::jsonb, '2026-10-09T14:00:00Z'),
            ('Sanjay Dutt', 'sanjay.ops@oxoo.in', '+91 98765 43232', 'Support Staff', 'Engineering', 'Active', 'Module Specific', '["support_tickets.read"]'::jsonb, '2026-10-13T14:00:00Z'),
            ('Kavita Deshmukh', 'kavita.ops@oxoo.in', '+91 98765 43233', 'Support Staff', 'Engineering', 'Active', 'Module Specific', '["support_tickets.read"]'::jsonb, '2026-10-16T14:00:00Z')
          ON CONFLICT (email) DO UPDATE
          SET role = EXCLUDED.role,
              department = EXCLUDED.department,
              permissions = EXCLUDED.permissions,
              status = EXCLUDED.status;
        `);
      }

      // D. Support Tickets Schema Enhancement
      await client.query(`
        ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS ticket_id VARCHAR(50);
        ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);
        ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Technical';
        ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(150) DEFAULT 'Priya Mehta';
        ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS contact_name VARCHAR(150);
        ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_support_tickets_ticket_id ON support_tickets (ticket_id);
      `);

      if (SHOULD_SEED_DEMO) {
        // Seed authoritative support tickets matching user mockup
        await client.query(`
          INSERT INTO support_tickets (
            ticket_number, ticket_id, customer_id, company_name, user_name, contact_name,
            user_email, contact_email, subject, category, priority, status, assigned_to,
            description, replies, created_at, updated_at
          ) VALUES
            (
              'TK-2026-4582', 'TK-2026-4582', 'CST-0001', 'Tech Solutions Pvt. Ltd.', 'Rahul Verma', 'Rahul Verma',
              'rahul@techsol.com', 'rahul@techsol.com', 'Login issue in HRMS', 'HRMS', 'Urgent', 'Open', 'Priya Mehta',
              'We are unable to login to HRMS. It shows an error: Please verify your credentials and retry.',
              '[
                {"id": "MSG-1", "sender": "Rahul Verma", "role": "customer", "message": "We are unable to login to HRMS. It shows an error: Please verify credentials.", "is_internal": false, "timestamp": "26 Oct 2026, 10:15 AM"},
                {"id": "MSG-2", "sender": "Support Team (Priya Mehta)", "role": "staff", "message": "We have checked the logs. Please try clearing your browser cache and use the reset link sent to your email.", "is_internal": false, "timestamp": "26 Oct 2026, 11:20 AM"},
                {"id": "MSG-3", "sender": "Priya Mehta", "role": "staff", "message": "Internal note: Customer account has SSO token sync delay on node-2. Re-indexing session cache.", "is_internal": true, "timestamp": "26 Oct 2026, 11:25 AM"},
                {"id": "MSG-4", "sender": "Rahul Verma", "role": "customer", "message": "It is working now! Thank you for the quick resolution.", "is_internal": false, "timestamp": "26 Oct 2026, 11:45 AM"}
              ]'::jsonb,
              '2026-10-26T10:15:00Z', '2026-10-26T11:45:00Z'
            ),
            (
              'TK-2026-4581', 'TK-2026-4581', 'CST-0002', 'Global Trade Inc.', 'Sarah Jenkins', 'Sarah Jenkins',
              'sarah@globaltrade.com', 'sarah@globaltrade.com', 'Invoice tax mismatch', 'Billing', 'Medium', 'In Progress', 'Rohit Sharma',
              'The GST amount in invoice INV-2026-1019 does not match our corporate SEZ tax exemption status.',
              '[
                {"id": "MSG-1", "sender": "Sarah Jenkins", "role": "customer", "message": "The tax in invoice INV-2026-1019 needs SEZ zero-rating adjustment.", "is_internal": false, "timestamp": "25 Oct 2026, 02:30 PM"},
                {"id": "MSG-2", "sender": "Rohit Sharma", "role": "staff", "message": "Reviewing tax certificate uploaded by customer.", "is_internal": true, "timestamp": "25 Oct 2026, 03:00 PM"}
              ]'::jsonb,
              '2026-10-25T14:30:00Z', '2026-10-25T15:00:00Z'
            ),
            (
              'TK-2026-4580', 'TK-2026-4580', 'CST-0003', 'Skyline Marketing', 'Amit Shah', 'Amit Shah',
              'amit@skylinemkt.com', 'amit@skylinemkt.com', 'API webhook error', 'Technical', 'High', 'Pending Customer', 'Priya Mehta',
              'Webhook endpoint returned 502 Bad Gateway during automated payment notification sync.',
              '[
                {"id": "MSG-1", "sender": "Amit Shah", "role": "customer", "message": "Webhook sync failing with 502 status code.", "is_internal": false, "timestamp": "23 Oct 2026, 16:40 PM"},
                {"id": "MSG-2", "sender": "Priya Mehta", "role": "staff", "message": "Please whitelist our static outbound IP: 34.120.45.10 and retry webhook test.", "is_internal": false, "timestamp": "23 Oct 2026, 17:10 PM"}
              ]'::jsonb,
              '2026-10-23T16:40:00Z', '2026-10-23T17:10:00Z'
            ),
            (
              'TK-2026-4579', 'TK-2026-4579', 'CST-0004', 'NextGen HR', 'Priya Mehta', 'Priya Mehta',
              'priya@nextgenhr.com', 'priya@nextgenhr.com', 'Unable to add user', 'Access', 'Low', 'Resolved', 'Priya Mehta',
              'Reaching user limit warning when adding new HR intern to portal.',
              '[
                {"id": "MSG-1", "sender": "Priya Mehta", "role": "customer", "message": "User seat limit reached on our plan.", "is_internal": false, "timestamp": "20 Oct 2026, 11:00 AM"},
                {"id": "MSG-2", "sender": "Support Team", "role": "staff", "message": "Upgraded tier seat allotment. User can now be invited smoothly.", "is_internal": false, "timestamp": "20 Oct 2026, 11:30 AM"}
              ]'::jsonb,
              '2026-10-20T11:00:00Z', '2026-10-20T11:30:00Z'
            )
          ON CONFLICT (ticket_number) DO UPDATE
          SET ticket_id = EXCLUDED.ticket_id,
              customer_id = EXCLUDED.customer_id,
              category = EXCLUDED.category,
              priority = EXCLUDED.priority,
              status = EXCLUDED.status,
              assigned_to = EXCLUDED.assigned_to,
              description = EXCLUDED.description,
              replies = EXCLUDED.replies,
              updated_at = NOW();
        `);

        // 17. EXPANDED TICKETS WITH PENDING & URGENT WORKFLOW STATES
        await client.query(`
          ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS resolution_notes TEXT;
          ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS resolved_by VARCHAR(150);
          ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
          ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
          ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS reopened_at TIMESTAMPTZ;
          ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS reopened_reason TEXT;

          INSERT INTO support_tickets (
            ticket_number, ticket_id, customer_id, company_name, user_name, contact_name,
            user_email, contact_email, subject, category, priority, status, assigned_to,
            description, replies, created_at, updated_at
          ) VALUES
            (
              'TK-2026-4583', 'TK-2026-4583', 'CST-0005', 'Quantum Logistics', 'Vikas Mehra', 'Vikas Mehra',
              'vikas@quantumlog.in', 'vikas@quantumlog.in', 'Database replication timeout during bulk dispatch', 'Technical', 'Urgent', 'In Progress', 'Priya Mehta',
              'Encountered replication timeout on inventory database node 3 during 50,000 consignment batch dispatch.',
              '[
                {"id": "MSG-1", "sender": "Vikas Mehra", "role": "customer", "message": "High replication lag causing consignment booking locks.", "is_internal": false, "timestamp": "26 Oct 2026, 08:30 AM"},
                {"id": "MSG-2", "sender": "Priya Mehta", "role": "staff", "message": "Investigating WAL replay threads and increasing connection pool limit to 200.", "is_internal": true, "timestamp": "26 Oct 2026, 08:50 AM"},
                {"id": "MSG-3", "sender": "Priya Mehta", "role": "staff", "message": "We have scaled the worker instance and are actively monitoring replication lag.", "is_internal": false, "timestamp": "26 Oct 2026, 09:15 AM"}
              ]'::jsonb,
              '2026-10-26T08:30:00Z', '2026-10-26T09:15:00Z'
            ),
            (
              'TK-2026-4584', 'TK-2026-4584', 'CST-0006', 'Zenith Health Diagnostics', 'Dr. Radhika Sen', 'Dr. Radhika Sen',
              'radhika@zenithhealth.org', 'radhika@zenithhealth.org', 'Missing compliance certificate in billing export', 'Billing', 'High', 'Pending Internal Team', 'Rohit Sharma',
              'Quarterly medical device compliance ledger required for corporate auditor sign-off by end of month.',
              '[
                {"id": "MSG-1", "sender": "Dr. Radhika Sen", "role": "customer", "message": "Please attach ISO/IEC compliance appendix to our October invoices.", "is_internal": false, "timestamp": "24 Oct 2026, 11:00 AM"},
                {"id": "MSG-2", "sender": "Rohit Sharma", "role": "staff", "message": "Forwarded to Legal & Compliance department for signed PDF attachment generation.", "is_internal": true, "timestamp": "24 Oct 2026, 12:30 PM"}
              ]'::jsonb,
              '2026-10-24T11:00:00Z', '2026-10-24T12:30:00Z'
            ),
            (
              'TK-2026-4585', 'TK-2026-4585', 'CST-0007', 'BlueWave Media Labs', 'Kabir Bedi', 'Kabir Bedi',
              'kabir@bluewave.co', 'kabir@bluewave.co', 'SSO SAML Certificate renewal notification', 'Access', 'Medium', 'Closed', 'Priya Mehta',
              'Confirming automated certificate rollover for Okta SSO identity provider connection.',
              '[
                {"id": "MSG-1", "sender": "Kabir Bedi", "role": "customer", "message": "Okta IdP cert expiring next week. Confirming auto-rollover.", "is_internal": false, "timestamp": "21 Oct 2026, 09:00 AM"},
                {"id": "MSG-2", "sender": "Priya Mehta", "role": "staff", "message": "Auto-rollover verified successfully with SHA-256 fingerprint.", "is_internal": false, "timestamp": "21 Oct 2026, 10:15 AM"}
              ]'::jsonb,
              '2026-10-21T09:00:00Z', '2026-10-21T10:15:00Z'
            )
          ON CONFLICT (ticket_number) DO UPDATE
          SET status = EXCLUDED.status,
              priority = EXCLUDED.priority,
              updated_at = NOW();
        `);
      }

      // 18. ENHANCE AUDIT LOGS TABLE
      await client.query(`
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_name VARCHAR(150) DEFAULT 'Manminder Singh';
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_email VARCHAR(255) DEFAULT 'manminder.singh@primepro.ai';
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_role VARCHAR(100) DEFAULT 'Super Admin';
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resource_type VARCHAR(100) DEFAULT 'System';
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resource_id VARCHAR(100);
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50) DEFAULT '127.0.0.1';
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT DEFAULT 'Mozilla/5.0 Chrome/130.0';
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS result VARCHAR(50) DEFAULT 'Success';
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS duration_ms INTEGER DEFAULT 24;
      `);

      if (SHOULD_SEED_DEMO) {
        // Seed initial authentic audit events if count < 5
        await client.query(`
          INSERT INTO audit_logs (
            action, target, user_name, actor_name, actor_email, actor_role,
            resource_type, resource_id, ip_address, result, duration_ms, details, created_at
          ) VALUES
            ('Login Success', 'Super Admin Console', 'Manminder Singh', 'Manminder Singh', 'manminder.singh@primepro.ai', 'Super Admin', 'Authentication', 'SESSION-8921', '103.212.144.18', 'Success', 34, '{"auth_method": "JWT", "device": "MacBook Pro M3"}'::jsonb, NOW() - INTERVAL '1 hour'),
            ('Ticket Status Updated', 'TK-2026-4582', 'Priya Mehta', 'Priya Mehta', 'support@oxoo.in', 'Support Staff', 'SupportTicket', 'TK-2026-4582', '49.36.120.44', 'Success', 42, '{"old_status": "Open", "new_status": "In Progress"}'::jsonb, NOW() - INTERVAL '2 hours'),
            ('Subscription Renewal Scheduled', 'SUB-2026-0001', 'System Scheduler', 'System Bot', 'system@oxoo.ai', 'Super Admin', 'Subscription', 'SUB-2026-0001', '127.0.0.1', 'Success', 18, '{"plan": "Business Plan", "auto_renew": true}'::jsonb, NOW() - INTERVAL '4 hours'),
            ('Email Template Updated', 'subscription_renewal_reminder', 'Manminder Singh', 'Manminder Singh', 'manminder.singh@primepro.ai', 'Super Admin', 'EmailTemplate', 'TPL-005', '103.212.144.18', 'Success', 56, '{"template_key": "subscription_renewal_reminder", "changes": ["subject", "preview_text"]}'::jsonb, NOW() - INTERVAL '6 hours'),
            ('Role Permission Modified', 'Support Staff', 'Manminder Singh', 'Manminder Singh', 'manminder.singh@primepro.ai', 'Super Admin', 'Role', 'ROLE-SUPPORT', '103.212.144.18', 'Success', 38, '{"role": "Support Staff", "added_permission": "support_tickets.resolve"}'::jsonb, NOW() - INTERVAL '12 hours'),
            ('Security Policy Enforced', 'Session Timeout', 'Manminder Singh', 'Manminder Singh', 'manminder.singh@primepro.ai', 'Super Admin', 'SecuritySettings', 'POLICY-SEC-1', '103.212.144.18', 'Success', 22, '{"session_timeout_minutes": 60, "mfa_enforced": true}'::jsonb, NOW() - INTERVAL '1 day'),
            ('Webhook Verification Ping', 'Razorpay Webhook', 'Razorpay Service', 'Razorpay Gateway', 'gateways@oxoo.ai', 'Super Admin', 'Integration', 'INT-RAZORPAY', '185.107.56.20', 'Success', 85, '{"event": "payment.authorized", "latency_ms": 85}'::jsonb, NOW() - INTERVAL '1 day')
          ON CONFLICT DO NOTHING;
        `);
      }


      // 19. EMAIL TEMPLATES TABLE
      await client.query(`
        CREATE TABLE IF NOT EXISTS email_templates (
          id SERIAL PRIMARY KEY,
          template_key VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL DEFAULT 'Transactional',
          subject VARCHAR(255) NOT NULL,
          body_html TEXT NOT NULL,
          body_plain TEXT DEFAULT '',
          available_variables JSONB DEFAULT '[]'::jsonb,
          delivery_channel VARCHAR(50) DEFAULT 'Email',
          status VARCHAR(50) DEFAULT 'Active',
          is_system_protected BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        INSERT INTO email_templates (template_key, name, category, subject, body_html, body_plain, available_variables, is_system_protected) VALUES
          (
            'otp_verification', 'OTP Verification', 'Security', 'Your OXOO Security Code: {{otp_code}}',
            '<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;"><h2 style="color: #0f172a;">Verify Your Account</h2><p style="color: #475569;">Hello {{customer_name}},</p><p style="color: #475569;">Your one-time security authentication code is:</p><div style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #0284c7; padding: 16px 0;">{{otp_code}}</div><p style="font-size: 13px; color: #94a3b8;">This code expires in 10 minutes. If you did not request this, please contact support.</p></div>',
            'Hello {{customer_name}}, Your one-time verification code is {{otp_code}}. It expires in 10 minutes.',
            '["{{customer_name}}", "{{otp_code}}", "{{expiration_minutes}}"]'::jsonb, true
          ),
          (
            'welcome_email', 'Welcome Email', 'Account', 'Welcome to OXOO, {{customer_name}}!',
            '<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;"><h2 style="color: #0f172a;">Welcome to OXOO!</h2><p style="color: #475569;">Hello {{customer_name}}, your {{organization_name}} workspace is ready.</p><a href="{{portal_url}}" style="display: inline-block; padding: 12px 24px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700;">Open Workspace</a></div>',
            'Welcome to OXOO! Hello {{customer_name}}, your {{organization_name}} workspace is ready at {{portal_url}}.',
            '["{{customer_name}}", "{{organization_name}}", "{{portal_url}}", "{{admin_email}}"]'::jsonb, true
          ),
          (
            'subscription_confirmation', 'Subscription Confirmation', 'Billing', 'Confirmation: {{plan_name}} Activated for {{organization_name}}',
            '<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;"><h2 style="color: #0f172a;">Subscription Activated</h2><p style="color: #475569;">Thank you for subscribing to {{plan_name}}. Your subscription ID is <strong>{{subscription_id}}</strong>.</p><p style="color: #475569;">Billing Cycle: {{billing_cycle}} | Amount: {{amount}}</p></div>',
            'Thank you for subscribing to {{plan_name}}. Subscription ID: {{subscription_id}}, Billing: {{billing_cycle}} {{amount}}.',
            '["{{customer_name}}", "{{organization_name}}", "{{plan_name}}", "{{subscription_id}}", "{{billing_cycle}}", "{{amount}}"]'::jsonb, true
          ),
          (
            'subscription_renewal_reminder', 'Subscription Renewal Reminder', 'Billing', 'Reminder: Your {{plan_name}} Renews on {{renewal_date}}',
            '<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;"><h2 style="color: #0f172a;">Upcoming Renewal Notice</h2><p style="color: #475569;">Dear {{customer_name}}, your {{plan_name}} subscription is scheduled to renew on <strong>{{renewal_date}}</strong>.</p><p style="color: #475569;">Renewal Amount: {{amount}}</p></div>',
            'Dear {{customer_name}}, your {{plan_name}} subscription renews on {{renewal_date}} for {{amount}}.',
            '["{{customer_name}}", "{{organization_name}}", "{{plan_name}}", "{{renewal_date}}", "{{amount}}", "{{payment_method}}"]'::jsonb, true
          ),
          (
            'payment_receipt', 'Payment Receipt', 'Billing', 'Payment Received: Receipt for Invoice {{invoice_number}}',
            '<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;"><h2 style="color: #059669;">Payment Successful</h2><p style="color: #475569;">We received your payment of <strong>{{amount}}</strong> for Invoice {{invoice_number}}.</p><p style="color: #64748b; font-size: 13px;">Transaction ID: {{transaction_id}}</p></div>',
            'Payment received: {{amount}} for Invoice {{invoice_number}}. Transaction ID: {{transaction_id}}.',
            '["{{customer_name}}", "{{invoice_number}}", "{{amount}}", "{{transaction_id}}", "{{payment_date}}"]'::jsonb, true
          ),
          (
            'support_ticket_created', 'Support Ticket Created', 'Support', '[{{ticket_id}}] We received your support request: {{ticket_subject}}',
            '<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;"><h2 style="color: #0f172a;">Support Ticket Received</h2><p style="color: #475569;">Hello {{customer_name}}, our support team has received your ticket <strong>#{{ticket_id}}</strong> regarding "{{ticket_subject}}".</p><p style="color: #475569;">A support engineer will reply shortly.</p></div>',
            'Hello {{customer_name}}, Support ticket #{{ticket_id}} "{{ticket_subject}}" has been logged. An agent will respond shortly.',
            '["{{customer_name}}", "{{ticket_id}}", "{{ticket_subject}}", "{{ticket_priority}}", "{{ticket_category}}"]'::jsonb, true
          ),
          (
            'support_ticket_reply', 'Support Ticket Reply', 'Support', '[{{ticket_id}}] New reply on your ticket: {{ticket_subject}}',
            '<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;"><h2 style="color: #0f172a;">New Message on Ticket #{{ticket_id}}</h2><p style="color: #475569;">{{agent_name}} from OXOO Support posted an update:</p><div style="background: #f8fafc; padding: 14px; border-left: 3px solid #0284c7; margin: 16px 0; color: #1e293b;">{{reply_message}}</div></div>',
            'New reply on ticket #{{ticket_id}} from {{agent_name}}: {{reply_message}}',
            '["{{customer_name}}", "{{ticket_id}}", "{{ticket_subject}}", "{{agent_name}}", "{{reply_message}}"]'::jsonb, true
          ),
          (
            'support_ticket_resolved', 'Support Ticket Resolved', 'Support', '[{{ticket_id}}] Ticket Resolved: {{ticket_subject}}',
            '<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;"><h2 style="color: #16a34a;">Ticket Marked Resolved</h2><p style="color: #475569;">Ticket #{{ticket_id}} "{{ticket_subject}}" has been marked resolved by {{agent_name}}.</p><div style="background: #f0fdf4; padding: 14px; border-left: 3px solid #16a34a; margin: 16px 0; color: #166534;">Resolution: {{resolution_notes}}</div></div>',
            'Ticket #{{ticket_id}} resolved. Resolution: {{resolution_notes}}.',
            '["{{customer_name}}", "{{ticket_id}}", "{{ticket_subject}}", "{{agent_name}}", "{{resolution_notes}}"]'::jsonb, true
          )
        ON CONFLICT (template_key) DO UPDATE
        SET name = EXCLUDED.name,
            subject = EXCLUDED.subject,
            updated_at = NOW();
      `);

      // 20. NOTIFICATION LOGS TABLE
      await client.query(`
        CREATE TABLE IF NOT EXISTS notification_logs (
          id SERIAL PRIMARY KEY,
          event_id VARCHAR(100) UNIQUE NOT NULL,
          recipient VARCHAR(255) NOT NULL,
          template_key VARCHAR(100),
          subject VARCHAR(255),
          channel VARCHAR(50) DEFAULT 'Email',
          customer_id VARCHAR(50),
          customer_name VARCHAR(255),
          related_entity_type VARCHAR(100),
          related_entity_id VARCHAR(100),
          status VARCHAR(50) DEFAULT 'Sent',
          attempt_count INTEGER DEFAULT 1,
          provider VARCHAR(100) DEFAULT 'Brevo',
          provider_message_id VARCHAR(255),
          error_summary TEXT,
          payload JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      if (SHOULD_SEED_DEMO) {
        await client.query(`
          INSERT INTO notification_logs (
            event_id, recipient, template_key, subject, channel,
            customer_id, customer_name, related_entity_type, related_entity_id,
            status, attempt_count, provider, provider_message_id, created_at
          ) VALUES
            ('NOTIF-2026-9001', 'rahul@techsol.com', 'otp_verification', 'Your OXOO Security Code: 748291', 'Email', 'CST-0001', 'Tech Solutions Pvt. Ltd.', 'Customer', 'CST-0001', 'Delivered', 1, 'Brevo', '<brevo_9001@smtp.brevo.com>', NOW() - INTERVAL '30 minutes'),
            ('NOTIF-2026-9002', 'sarah@globaltrade.com', 'payment_receipt', 'Payment Received: Receipt for Invoice INV-2026-1019', 'Email', 'CST-0002', 'Global Trade Inc.', 'Invoice', 'INV-2026-1019', 'Delivered', 1, 'Brevo', '<brevo_9002@smtp.brevo.com>', NOW() - INTERVAL '2 hours'),
            ('NOTIF-2026-9003', 'amit@skylinemkt.com', 'support_ticket_reply', '[TK-2026-4580] New reply on your ticket: API webhook error', 'Email', 'CST-0003', 'Skyline Marketing', 'SupportTicket', 'TK-2026-4580', 'Delivered', 1, 'Brevo', '<brevo_9003@smtp.brevo.com>', NOW() - INTERVAL '3 hours'),
            ('NOTIF-2026-9004', 'priya@nextgenhr.com', 'support_ticket_resolved', '[TK-2026-4579] Ticket Resolved: Unable to add user', 'Email', 'CST-0004', 'NextGen HR', 'SupportTicket', 'TK-2026-4579', 'Delivered', 1, 'Brevo', '<brevo_9004@smtp.brevo.com>', NOW() - INTERVAL '6 hours'),
            ('NOTIF-2026-9005', 'billing@acmecorp.com', 'subscription_renewal_reminder', 'Reminder: Your Enterprise Plan Renews on 31 Oct 2026', 'Email', 'CST-0008', 'Acme Global Corp', 'Subscription', 'SUB-2026-0008', 'Sent', 1, 'Brevo', '<brevo_9005@smtp.brevo.com>', NOW() - INTERVAL '1 day'),
            ('NOTIF-2026-9006', 'dev@innovatech.io', 'failed_payment', 'Urgent: Payment Failed for Invoice INV-2026-1012', 'Email', 'CST-0009', 'Innovatech Labs', 'Invoice', 'INV-2026-1012', 'Failed', 2, 'Brevo', NULL, NOW() - INTERVAL '1 day')
          ON CONFLICT (event_id) DO NOTHING;
        `);
      }

      // 21. INTEGRATIONS TABLE
      await client.query(`
        CREATE TABLE IF NOT EXISTS integrations (
          id SERIAL PRIMARY KEY,
          integration_id VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          provider VARCHAR(100) NOT NULL,
          description TEXT,
          icon VARCHAR(20) DEFAULT '⚡',
          color VARCHAR(20) DEFAULT '#0284c7',
          status VARCHAR(50) DEFAULT 'Connected',
          environment VARCHAR(50) DEFAULT 'Live',
          config JSONB DEFAULT '{}'::jsonb,
          webhook_url VARCHAR(500),
          webhook_secret VARCHAR(255),
          subscribed_events JSONB DEFAULT '[]'::jsonb,
          last_health_check TIMESTAMPTZ DEFAULT NOW(),
          last_sync TIMESTAMPTZ DEFAULT NOW(),
          health_status VARCHAR(50) DEFAULT 'Healthy',
          last_error TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        INSERT INTO integrations (
          integration_id, name, category, provider, description, icon, color, status, environment,
          webhook_url, webhook_secret, subscribed_events, health_status
        ) VALUES
          (
            'razorpay', 'Razorpay', 'Payments', 'Razorpay Payment Gateway',
            'Accept cards, UPI, netbanking and mandate recurring payments across India.',
            'R', '#0c2340', 'Connected', 'Live',
            'https://api.oxoo.ai/api/webhooks/razorpay', 'whsec_rzp_live_9201948',
            '["payment.authorized", "payment.captured", "payment.failed", "subscription.charged"]'::jsonb, 'Healthy'
          ),
          (
            'stripe', 'Stripe Payments', 'Payments', 'Stripe Inc.',
            'Global payments processing, multi-currency credit cards and international SaaS subscriptions.',
            'S', '#635bff', 'Connected', 'Test',
            'https://api.oxoo.ai/api/webhooks/stripe', 'whsec_str_test_881920',
            '["invoice.payment_succeeded", "customer.subscription.updated", "charge.refunded"]'::jsonb, 'Healthy'
          ),
          (
            'brevo', 'Brevo', 'Email', 'Brevo Transactional & SMTP',
            'Deliver OTP codes, invoices, renewal reminders and customer support notifications.',
            'B', '#0b996f', 'Connected', 'Live',
            NULL, NULL, '["email.delivered", "email.bounced", "email.opened"]'::jsonb, 'Healthy'
          ),
          (
            'resend', 'Resend', 'Email', 'Resend Email API',
            'Modern developer-first transactional email API for rapid delivery and analytics.',
            'Re', '#000000', 'Not Connected', 'Test',
            NULL, NULL, '[]'::jsonb, 'Healthy'
          ),
          (
            'google', 'Google Workspace', 'Authentication and SSO', 'Google Cloud Identity',
            'Single Sign-On (SSO), OAuth 2.0 authentication and user directory synchronization.',
            'G', '#ea4335', 'Connected', 'Live',
            NULL, NULL, '["user.login", "user.sync"]'::jsonb, 'Healthy'
          ),
          (
            'ms365', 'Microsoft 365 / Entra ID', 'Authentication and SSO', 'Microsoft Corporation',
            'Enterprise SAML 2.0 and Azure Active Directory single sign-on for corporate tenants.',
            'M', '#0078d4', 'Not Connected', 'Live',
            NULL, NULL, '[]'::jsonb, 'Healthy'
          ),
          (
            'postgresql', 'Neon PostgreSQL', 'Databases and storage', 'Neon Serverless Postgres',
            'Managed high-availability cloud PostgreSQL database cluster with connection pooling.',
            '🐘', '#00e699', 'Connected', 'Live',
            NULL, NULL, '[]'::jsonb, 'Healthy'
          ),
          (
            'slack', 'Slack Alerts', 'External applications', 'Slack Technologies',
            'Real-time administrative alerts for urgent support tickets, renewal warnings and failed payments.',
            'Sl', '#4a154b', 'Connected', 'Live',
            'https://hooks.slack.com/services/T00/B00/XXXX', NULL, '["ticket.urgent", "payment.failed", "security.alert"]'::jsonb, 'Healthy'
          ),
          (
            'webhooks', 'OXOO Outbound Webhooks', 'Webhooks', 'OXOO Platform Core',
            'Dispatches secure HMAC-signed HTTP POST events to external customer and partner endpoints.',
            'W', '#0284c7', 'Connected', 'Live',
            'https://webhook.site/oxoo-events-demo', 'whsec_oxoo_master_key_9921',
            '["subscription.created", "subscription.renewed", "invoice.paid", "ticket.created"]'::jsonb, 'Healthy'
          ),
          (
            'analytics', 'Google Analytics 4', 'Analytics', 'Google LLC',
            'Collect anonymous product demo and platform visitor telemetry with privacy compliance.',
            'GA', '#f59e0b', 'Connected', 'Live',
            NULL, NULL, '["demo.session", "page.view"]'::jsonb, 'Healthy'
          )
        ON CONFLICT (integration_id) DO UPDATE
        SET name = EXCLUDED.name,
            status = EXCLUDED.status,
            updated_at = NOW();
      `);

      // 22. PLATFORM SETTINGS TABLE
      await client.query(`
        CREATE TABLE IF NOT EXISTS platform_settings (
          category VARCHAR(100) PRIMARY KEY,
          settings JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          updated_by VARCHAR(255) DEFAULT 'Super Admin'
        );

        INSERT INTO platform_settings (category, settings) VALUES
          ('general', '{
            "platformName": "OXOO",
            "tagline": "One Platform. Infinite Possibilities.",
            "defaultCurrency": "INR",
            "timezone": "Asia/Kolkata",
            "supportEmail": "support@oxoo.ai",
            "supportPhone": "+91 80 4567 8900",
            "publicWebsiteUrl": "https://oxoo.ai"
          }'::jsonb),
          ('branding', '{
            "logoUrl": "/brand/oxoo-logo.svg",
            "faviconUrl": "/favicon.ico",
            "primaryColor": "#0284c7",
            "accentColor": "#06b6d4",
            "companyName": "OXOO Technologies Inc."
          }'::jsonb),
          ('email', '{
            "provider": "Brevo",
            "senderName": "OXOO Platform",
            "senderEmail": "manminder.singh@primepro.ai",
            "replyToEmail": "support@oxoo.ai",
            "smtpHost": "smtp-relay.brevo.com",
            "smtpPort": 587
          }'::jsonb),
          ('payments', '{
            "defaultGateway": "Razorpay",
            "currency": "INR",
            "testMode": false,
            "enableGst": true,
            "gstRate": 18,
            "invoicePrefix": "INV-2026-",
            "invoiceFooterNotes": "Thank you for choosing OXOO. For billing queries, contact finance@oxoo.ai"
          }'::jsonb),
          ('security', '{
            "sessionTimeoutMinutes": 60,
            "mfaEnforced": true,
            "passwordMinLength": 8,
            "maxLoginAttempts": 5,
            "lockoutDurationMinutes": 15,
            "allowMultipleSessions": false
          }'::jsonb),
          ('api', '{
            "webhookUrl": "https://api.oxoo.ai/api/webhooks",
            "webhookEvents": ["payment.captured", "subscription.renewed", "ticket.created"],
            "rateLimitPerMinute": 120
          }'::jsonb),
          ('billing', '{
            "defaultCycle": "Monthly",
            "renewalNoticeDays": 5,
            "gracePeriodDays": 3,
            "pastDueAction": "Suspend Account After 7 Days"
          }'::jsonb),
          ('system', '{
            "maintenanceMode": false,
            "logLevel": "info",
            "dataRetentionDays": 365,
            "backupSchedule": "Daily at 02:00 AM UTC"
          }'::jsonb),
          ('agent', '{
            "enabled": true,
            "agentName": "OXOO Agent",
            "welcomeMessage": "Hi! I''m OXOO Agent. How can I help you today? Ask me about our software, pricing plans, website and app development, AI solutions, subscriptions, or support.",
            "suggestedQuestions": [
              "Explore OXOO applications",
              "Compare pricing plans",
              "Find a website development package",
              "Explore Android and iOS app development",
              "Learn about AI chatbots",
              "Manage my subscription",
              "Find an invoice",
              "Contact customer support"
            ],
            "aiProvider": "gemini",
            "aiModel": "gemini-1.5-flash",
            "rateLimitPerMinute": 30,
            "retentionDays": 90,
            "supportEscalationEmail": "support@oxoo.ai",
            "allowCustomerActions": true
          }'::jsonb)
        ON CONFLICT (category) DO NOTHING;
      `);

      // 18. OXOO Agent AI Tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS agent_conversations (
          id SERIAL PRIMARY KEY,
          conversation_id VARCHAR(100) NOT NULL UNIQUE,
          session_id VARCHAR(100) NOT NULL,
          user_id INTEGER,
          customer_id VARCHAR(50),
          user_email VARCHAR(255),
          title VARCHAR(255) DEFAULT 'New Conversation',
          message_count INTEGER DEFAULT 0,
          last_message_at TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_agent_conv_session ON agent_conversations(session_id);
        CREATE INDEX IF NOT EXISTS idx_agent_conv_email ON agent_conversations(user_email);

        CREATE TABLE IF NOT EXISTS agent_messages (
          id SERIAL PRIMARY KEY,
          conversation_id VARCHAR(100) NOT NULL,
          sender VARCHAR(20) NOT NULL,
          content TEXT NOT NULL,
          structured_payload JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_agent_msg_conv ON agent_messages(conversation_id);

        CREATE TABLE IF NOT EXISTS agent_events (
          id SERIAL PRIMARY KEY,
          event_type VARCHAR(50) NOT NULL,
          conversation_id VARCHAR(100),
          actor_email VARCHAR(255),
          details JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_agent_events_type ON agent_events(event_type);
      `);
    } catch (modErr) {
      console.error('Module upgrade schema seed error:', modErr.message);
    }

    console.log('Neon PostgreSQL tables schema verified & ready.');
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  initDb
};
