require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const res = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    console.log('TABLES_IN_DB:', res.rows.map(r => r.table_name));

    // Also check counts of customers, support_tickets, platform_applications, etc.
    const counts = {};
    for (const t of ['customers', 'support_tickets', 'platform_applications', 'plans', 'products', 'organizations']) {
      try {
        const c = await pool.query(`SELECT count(*) FROM ${t}`);
        counts[t] = parseInt(c.rows[0].count, 10);
      } catch (err) {
        counts[t] = `error: ${err.message}`;
      }
    }
    console.log('COUNTS:', counts);
  } catch (err) {
    console.error('DB ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

main();
