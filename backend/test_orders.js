const { pool } = require('./src/db');
async function test() {
  const o = await pool.query("SELECT id, order_id, customer_email, company_name, plan_name FROM orders ORDER BY id DESC LIMIT 5");
  console.log('Orders:', o.rows);
  await pool.end();
}
test().catch(console.error);

