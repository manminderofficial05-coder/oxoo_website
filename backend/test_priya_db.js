const { pool } = require('./src/db');

async function main() {
  const u = await pool.query("SELECT id, name, email, organization, role FROM users WHERE LOWER(email) LIKE '%priya%'");
  console.log('Users:', u.rows);

  const tm = await pool.query("SELECT id, name, email, company_name FROM team_members WHERE LOWER(email) LIKE '%priya%'");
  console.log('Team members:', tm.rows);

  const c = await pool.query("SELECT id, name, email, company_name FROM customers WHERE LOWER(email) LIKE '%priya%'");
  console.log('Customers:', c.rows);

  const org = await pool.query("SELECT id, name FROM organizations");
  console.log('Organizations:', org.rows);

  await pool.end();
}

main().catch(console.error);

