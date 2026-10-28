require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const custs = await pool.query("SELECT id, customer_id, company_name, email, plan, selected_apps, account_status FROM customers");
    console.log('CUSTOMERS:', custs.rows);

    const apps = await pool.query("SELECT app_id, name, slug, category, status, main_url FROM platform_applications ORDER BY id");
    console.log('PLATFORM_APPS:', apps.rows);

    const plans = await pool.query("SELECT plan_id, name, plan_code, monthly_price, yearly_price, included_products, included_apps FROM plans LIMIT 10");
    console.log('PLANS_SAMPLE:', plans.rows);

    const tickets = await pool.query("SELECT id, ticket_number, company_name, user_name, user_email, subject, status, category, priority, replies FROM support_tickets ORDER BY id DESC LIMIT 3");
    console.log('TICKETS_SAMPLE:', tickets.rows);
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

main();
