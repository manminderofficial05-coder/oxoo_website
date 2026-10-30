require('dotenv').config();
const { pool, query, initDb } = require('../src/db');
const bcrypt = require('bcryptjs');

async function runNeonMigration() {
  console.log('\n======================================================');
  console.log('🚀 MULTIIX / PrimePro — NEON POSTGRESQL MIGRATION');
  console.log('======================================================\n');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not set in backend/.env');
    process.exit(1);
  }

  // Obfuscate password in log
  const safeConnStr = connectionString.replace(/:\/\/[^:]+:([^@]+)@/, '://***:***@');
  console.log(`Connecting to Neon database: ${safeConnStr}`);

  try {
    // 1. Run core schema initialization & table creation
    console.log('\nStep 1: Initializing tables, extensions, and schema migrations...');
    await initDb();
    console.log('✓ Core schema and tables successfully initialized.');

    // 2. Ensure multiple administrative staff exist in platform_staff for RBAC
    console.log('\nStep 2: Checking and provisioning multiple administrator accounts in platform_staff...');
    
    const adminStaff = [
      {
        name: 'Manminder Singh',
        email: 'manminder.singh@primepro.ai',
        phone: '+91 98765 43210',
        role: 'Super Admin',
        department: 'Administration',
        status: 'Active',
        access_level: 'Full Platform',
        permissions: ['*']
      },
      {
        name: 'Vikram Malhotra',
        email: 'vikram.admin@oxoo.in',
        phone: '+91 98765 43214',
        role: 'Super Admin',
        department: 'Administration',
        status: 'Active',
        access_level: 'Full Platform',
        permissions: ['*']
      },
      {
        name: 'Rohit Sharma',
        email: 'rohit.finance@oxoo.in',
        phone: '+91 98765 43211',
        role: 'Finance Admin',
        department: 'Finance',
        status: 'Active',
        access_level: 'Module Specific',
        permissions: ['subscriptions.read', 'payments.read', 'invoices.read', 'invoices.download', 'reports.finance.read']
      },
      {
        name: 'Neha Singhal',
        email: 'neha.finance@oxoo.in',
        phone: '+91 98765 43215',
        role: 'Finance Admin',
        department: 'Finance',
        status: 'Active',
        access_level: 'Module Specific',
        permissions: ['subscriptions.read', 'payments.read', 'invoices.read', 'invoices.download']
      },
      {
        name: 'Priya Mehta',
        email: 'priya.support@oxoo.in',
        phone: '+91 98765 43212',
        role: 'Support Staff',
        department: 'Support',
        status: 'Active',
        access_level: 'Module Specific',
        permissions: ['customers.read', 'subscriptions.read', 'support_tickets.read', 'support_tickets.reply', 'support_tickets.resolve']
      },
      {
        name: 'Deepak Joshi',
        email: 'deepak.support@oxoo.in',
        phone: '+91 98765 43218',
        role: 'Support Staff',
        department: 'Support',
        status: 'Active',
        access_level: 'Module Specific',
        permissions: ['support_tickets.read', 'support_tickets.reply']
      },
      {
        name: 'Amit Kumar',
        email: 'amit.sales@oxoo.in',
        phone: '+91 98765 43213',
        role: 'Sales Staff',
        department: 'Sales',
        status: 'Active',
        access_level: 'Read Only',
        permissions: ['customers.read', 'subscriptions.read', 'products.read', 'reports.sales.read']
      }
    ];

    for (const staff of adminStaff) {
      await query(`
        INSERT INTO platform_staff (name, email, phone, role, department, status, access_level, permissions, joined_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (email) DO UPDATE
        SET name = EXCLUDED.name,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            access_level = EXCLUDED.access_level,
            permissions = EXCLUDED.permissions,
            status = 'Active';
      `, [
        staff.name,
        staff.email,
        staff.phone,
        staff.role,
        staff.department,
        staff.status,
        staff.access_level,
        JSON.stringify(staff.permissions)
      ]);
    }
    console.log(`✓ Provisioned ${adminStaff.length} platform administrator accounts across Super Admin, Finance Admin, Support Staff, and Sales Staff.`);

    // 3. Ensure Root Admin Login User in users table
    console.log('\nStep 3: Ensuring Root Admin authentication credentials in users table...');
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('admin123', salt);
    
    await query(`
      INSERT INTO users (name, email, password, role, organization, active)
      VALUES 
        ('Manminder Singh', 'manminder.singh@primepro.ai', $1, 'super_admin', 'PrimePro.ai Core Corp', true),
        ('Root Administrator', 'admin@primepro.ai', $1, 'admin', 'PrimePro.ai Core Corp', true)
      ON CONFLICT (email) DO UPDATE
      SET password = EXCLUDED.password,
          role = EXCLUDED.role,
          active = true;
    `, [hashedPass]);
    console.log('✓ Created/updated Root Admin users (manminder.singh@primepro.ai, admin@primepro.ai).');

    // 4. Verify Database Tables & Row Counts
    console.log('\nStep 4: Verifying migrated database tables and row counts in Neon...');
    const tableListQuery = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name ASC;
    `);

    console.log('\n--- Migrated Tables in Neon PostgreSQL ---');
    for (const row of tableListQuery.rows) {
      try {
        const countRes = await query(`SELECT COUNT(*)::int as count FROM "${row.table_name}"`);
        console.log(`  • ${row.table_name.padEnd(30)} : ${countRes.rows[0].count} records`);
      } catch (e) {
        console.log(`  • ${row.table_name.padEnd(30)} : ready`);
      }
    }

    // 5. Insert migration audit event
    await query(`
      INSERT INTO audit_logs (action, target, user_name, ip, details)
      VALUES ('Neon Migration Executed', 'Neon PostgreSQL Cluster', 'Migration Script', '127.0.0.1', $1);
    `, [JSON.stringify({ timestamp: new Date().toISOString(), status: 'Migration Completed Successfully' })]);

    console.log('\n======================================================');
    console.log('🎉 NEON POSTGRESQL MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Neon Migration Failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runNeonMigration();
