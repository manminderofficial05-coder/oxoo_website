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
        subtotal INT NOT NULL,
        tax_amount INT DEFAULT 0,
        discount_amount INT DEFAULT 0,
        total_amount INT NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        payment_method VARCHAR(50) DEFAULT 'Razorpay',
        payment_id VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Created',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

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
