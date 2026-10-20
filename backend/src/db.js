require('dotenv').config();
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
  console.error('Unexpected error on idle PostgreSQL client:', err);
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
        amount INT NOT NULL,
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
        amount INT NOT NULL,
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

    // ---------------------------------------------------------
    // Automatic Seed if empty
    // ---------------------------------------------------------
    const orgCount = await client.query('SELECT COUNT(*) FROM organizations');
    if (parseInt(orgCount.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO organizations (name, plan, active_apps, member_count, status, mrr) VALUES
        ('ABC Technologies', 'Business Pro', '["accounting", "invoicing", "expenses", "hrms", "website"]', 12, 'Active', 48200),
        ('Apex Logistics Ltd', 'Business Pro', '["accounting", "invoicing", "expenses", "hrms", "fleet"]', 24, 'Active', 48200),
        ('Metro Retailers', 'Growth', '["pos", "inventory", "accounting"]', 8, 'Active', 25000),
        ('BlueSky Cloud Corp', 'Business Pro', '["accounting", "hrms", "projects", "crm", "website"]', 45, 'Active', 124000),
        ('GreenLeaf Organics', 'Starter', '["pos", "website"]', 4, 'Trial', 32600),
        ('NovaTech Solutions', 'Growth', '["accounting", "crm", "hrms"]', 16, 'Active', 78400)
      `);
    }

    const subCount = await client.query('SELECT COUNT(*) FROM subscriptions');
    if (parseInt(subCount.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO subscriptions (company_name, plan, amount, status, start_date, renewal_date, active_apps) VALUES
        ('ABC Technologies', 'Business Pro', 48200, 'Active', NOW() - INTERVAL '30 days', '2026-12-12', '["accounting", "invoicing", "expenses", "hrms", "website"]'),
        ('Apex Logistics Ltd', 'Business Pro', 48200, 'Active', NOW() - INTERVAL '60 days', '2026-10-12', '["accounting", "invoicing", "expenses", "hrms"]'),
        ('Metro Retailers', 'Growth', 25000, 'Active', NOW() - INTERVAL '45 days', '2026-10-11', '["pos", "inventory", "accounting"]'),
        ('BlueSky Cloud Corp', 'Business Pro', 124000, 'Active', NOW() - INTERVAL '90 days', '2026-10-10', '["accounting", "hrms", "projects", "crm"]'),
        ('GreenLeaf Organics', 'Starter', 32600, 'Trial', NOW() - INTERVAL '7 days', '2026-10-09', '["pos", "website"]'),
        ('NovaTech Solutions', 'Growth', 78400, 'Active', NOW() - INTERVAL '20 days', '2026-10-08', '["accounting", "crm", "hrms"]')
      `);
    }

    const invCount = await client.query('SELECT COUNT(*) FROM invoices');
    if (parseInt(invCount.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO invoices (invoice_number, company_name, plan, amount, status, invoice_date) VALUES
        ('INV-2026-081', 'Apex Logistics Ltd', 'Business Pro', 48200, 'Paid', NOW() - INTERVAL '2 hours'),
        ('INV-2026-080', 'Metro Retailers', 'Growth', 25000, 'Paid', NOW() - INTERVAL '1 day'),
        ('INV-2026-079', 'BlueSky Cloud Corp', 'Business Pro', 124000, 'Paid', NOW() - INTERVAL '2 days'),
        ('INV-2026-078', 'ABC Technologies', 'Business Pro', 48200, 'Paid', NOW() - INTERVAL '3 days'),
        ('INV-2026-077', 'GreenLeaf Organics', 'Starter', 32600, 'Pending', NOW() - INTERVAL '5 days'),
        ('INV-2026-076', 'NovaTech Solutions', 'Growth', 78400, 'Paid', NOW() - INTERVAL '8 days')
      `);
    }

    const ticketCount = await client.query('SELECT COUNT(*) FROM support_tickets');
    if (parseInt(ticketCount.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO support_tickets (ticket_number, company_name, user_name, user_email, subject, description, priority, status, created_at) VALUES
        ('#1245', 'ABC Technologies', 'Alex Johnson', 'alex@abctech.com', 'Login issue', 'Intermittent session timeouts during peak team usage.', 'Medium', 'Resolved', NOW() - INTERVAL '2 hours'),
        ('#1244', 'Metro Retailers', 'Priya Sharma', 'priya@metroretail.com', 'Payment failed', 'Subscription payment gateway webhook returned error 402.', 'High', 'Open', NOW() - INTERVAL '4 hours'),
        ('#1243', 'BlueSky Cloud Corp', 'Dev Joshi', 'dev@bluesky.com', 'Feature request', 'Requesting bulk CSV exporter for HRMS employee timesheets.', 'Low', 'In Progress', NOW() - INTERVAL '1 day'),
        ('#1242', 'GreenLeaf Organics', 'Sunil Kumar', 'sunil@greenleaf.com', 'Integration error', 'Shopify webhooks not syncing product quantities into Inventory.', 'High', 'Open', NOW() - INTERVAL '2 days'),
        ('#1241', 'NovaTech Solutions', 'Anita Desai', 'anita@novatech.com', 'Account setup help', 'Need assistance configuring multi-currency GST compliance.', 'Low', 'Resolved', NOW() - INTERVAL '3 days')
      `);
    }

    const teamCount = await client.query('SELECT COUNT(*) FROM team_members');
    if (parseInt(teamCount.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO team_members (company_name, name, email, role, status, apps_access) VALUES
        ('ABC Technologies', 'Alex Johnson', 'alex@abctech.com', 'Organization Admin', 'Active', '["all"]'),
        ('ABC Technologies', 'Sarah Miller', 'sarah.m@abctech.com', 'Finance Lead', 'Active', '["accounting", "invoicing", "expenses"]'),
        ('ABC Technologies', 'David Chen', 'david.c@abctech.com', 'HR Director', 'Active', '["hrms"]'),
        ('ABC Technologies', 'Elena Rostova', 'elena.r@abctech.com', 'Web Developer', 'Active', '["website"]'),
        ('ABC Technologies', 'Vikram Patel', 'vikram.p@abctech.com', 'Operations Manager', 'Active', '["accounting", "hrms"]'),
        ('ABC Technologies', 'Maria Garcia', 'maria.g@abctech.com', 'Staff Accountant', 'Active', '["accounting", "invoicing"]'),
        ('ABC Technologies', 'James Wilson', 'james.w@abctech.com', 'Marketing Associate', 'Active', '["website"]'),
        ('ABC Technologies', 'Priya Rao', 'priya.r@abctech.com', 'HR Specialist', 'Active', '["hrms"]'),
        ('ABC Technologies', 'Thomas Wright', 'thomas.w@abctech.com', 'Billing Specialist', 'Active', '["invoicing", "expenses"]'),
        ('ABC Technologies', 'Aisha Khan', 'aisha.k@abctech.com', 'Project Coordinator', 'Active', '["website"]'),
        ('ABC Technologies', 'Robert Taylor', 'robert.t@abctech.com', 'Customer Support', 'Active', '["all"]'),
        ('ABC Technologies', 'Siddharth Iyer', 'sid.i@abctech.com', 'Security Auditor', 'Active', '["all"]')
      `);
    }

    const prodCount = await client.query('SELECT COUNT(*) FROM products_plans');
    if (parseInt(prodCount.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO products_plans (product_name, category, monthly_price, annual_price, revenue, revenue_percent, active_subscriptions, status) VALUES
        ('Finance Suite', 'Finance', 48200, 482000, 1840000, 38, 412, 'Operational'),
        ('HRMS', 'Human Resources', 28000, 280000, 1260000, 26, 290, 'Operational'),
        ('Website Builder', 'Websites', 18000, 180000, 820000, 17, 215, 'Operational'),
        ('Marketing Suite', 'Marketing', 22000, 220000, 610000, 12, 140, 'Operational'),
        ('Productivity Suite', 'Productivity', 12000, 120000, 370000, 7, 98, 'Operational')
      `);
    }

    console.log('Neon PostgreSQL tables and seed data verified & ready.');
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  initDb
};
