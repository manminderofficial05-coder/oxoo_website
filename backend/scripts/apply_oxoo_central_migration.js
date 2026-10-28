require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applyMigration() {
  const client = await pool.connect();
  try {
    console.log('Connecting to Neon PostgreSQL to apply 001_oxoo_central_additive_integration.sql...');
    
    const sqlPath = path.join(__dirname, '../../OXOO_FINAL_CENTRALIZATION_DELIVERY/01_OXOO_CENTRAL/001_oxoo_central_additive_integration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Beginning transaction...');
    await client.query(sql);
    console.log('Migration script executed successfully!');

    // Verification check
    const tablesRes = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema='public' AND table_name LIKE 'oxoo_%'
      ORDER BY table_name;
    `);
    console.log('Created Oxoo Central tables:', tablesRes.rows.map(r => r.table_name));

    const userCols = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name LIKE 'oxoo_%' OR column_name IN ('phone', 'email_verified_at', 'phone_verified_at', 'identity_status');
    `);
    console.log('Added Users columns:', userCols.rows);

    const orgCols = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'organizations' AND column_name LIKE 'oxoo_%';
    `);
    console.log('Added Organizations columns:', orgCols.rows);

    // Verify existing users and organizations have received valid UUIDs
    const userSample = await client.query(`SELECT id, name, email, oxoo_user_uuid, identity_status FROM users;`);
    console.log('Users with canonical UUIDs:', userSample.rows);

    const orgSample = await client.query(`SELECT id, name, oxoo_organization_uuid FROM organizations;`);
    console.log('Organizations with canonical UUIDs:', orgSample.rows);

  } catch (err) {
    console.error('Error applying migration:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration();
