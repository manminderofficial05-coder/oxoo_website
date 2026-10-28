require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runDriftAnalysis() {
  try {
    console.log('--- 1. TABLES IN DATABASE ---');
    const tablesRes = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('Total tables:', tables.length);
    console.log(tables);

    console.log('\n--- 2. OXOO CENTRAL OBJECTS CHECK ---');
    const oxooTables = tables.filter(t => t.startsWith('oxoo_'));
    console.log('Existing oxoo_* tables:', oxooTables);

    const userCols = await pool.query(
      "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
    );
    console.log('users columns:', userCols.rows.map(r => `${r.column_name} (${r.data_type})`));

    const orgCols = await pool.query(
      "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'organizations' ORDER BY ordinal_position"
    );
    console.log('organizations columns:', orgCols.rows.map(r => `${r.column_name} (${r.data_type})`));

    console.log('\n--- 3. BILLING CYCLES IN SUBSCRIPTIONS ---');
    const cycles = await pool.query(
      'SELECT billing_cycle, count(*) as count FROM public.subscriptions GROUP BY billing_cycle ORDER BY count DESC'
    );
    console.log('Subscriptions billing_cycle distribution:', cycles.rows);

    console.log('\n--- 4. USER IDENTITIES & VERIFICATION AUDIT ---');
    const userSample = await pool.query(
      'SELECT id, name, email, role, organization, active, created_at FROM users LIMIT 10'
    );
    console.log('Users sample (first 10):', userSample.rows);

    const teamSample = await pool.query(
      'SELECT * FROM team_members LIMIT 10'
    );
    console.log('Team members sample:', teamSample.rows);

    const orgSample = await pool.query('SELECT * FROM organizations LIMIT 10');
    console.log('Organizations sample:', orgSample.rows);

    const userCount = await pool.query('SELECT count(*) FROM users');
    const orgCount = await pool.query('SELECT count(*) FROM organizations');
    const subCount = await pool.query('SELECT count(*) FROM subscriptions');
    const custCount = await pool.query('SELECT count(*) FROM customers');
    console.log('Counts:', {
      users: userCount.rows[0].count,
      organizations: orgCount.rows[0].count,
      subscriptions: subCount.rows[0].count,
      customers: custCount.rows[0].count
    });

    console.log('\n--- 5. PRODUCTS IN REPOSITORY ---');
    const productsRes = await pool.query('SELECT id, name, slug, status FROM products');
    console.log('Products:', productsRes.rows);

    console.log('\n--- 6. SUBSCRIPTIONS DETAIL ---');
    const subCols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'subscriptions' ORDER BY ordinal_position"
    );
    console.log('subscriptions columns:', subCols.rows.map(r => r.column_name));

    const subsRes = await pool.query('SELECT * FROM subscriptions LIMIT 10');
    console.log('\n--- 7. CUSTOMERS DETAIL ---');
    const custCols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customers' ORDER BY ordinal_position"
    );
    console.log('customers columns:', custCols.rows.map(r => r.column_name));

    const custsRes = await pool.query('SELECT * FROM customers LIMIT 10');
    console.log('Customers rows:', custsRes.rows);

  } catch (err) {
    console.error('Error during drift analysis:', err);
  } finally {
    await pool.end();
  }
}

runDriftAnalysis();
