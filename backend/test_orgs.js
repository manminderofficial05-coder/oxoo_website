
const { pool } = require('./src/db');
async function test() {
  const orgs = await pool.query('SELECT * FROM organizations');
  console.log('Orgs:', orgs.rows);
  const users = await pool.query('SELECT * FROM users LIMIT 5');
  console.log('Users:', users.rows);
  await pool.end();
}
test().catch(console.error);
