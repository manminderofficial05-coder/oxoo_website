require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function normalizeAndApplyBillingConstraint() {
  const client = await pool.connect();
  try {
    console.log('=== NORMALIZING BILLING CYCLES AND APPLYING CHECK CONSTRAINT ===');
    await client.query('BEGIN');

    // 1. Check existing values
    const beforeCheck = await client.query(`
      SELECT billing_cycle, count(*) FROM public.subscriptions GROUP BY 1
    `);
    console.log('Current billing_cycle distribution:', beforeCheck.rows);

    // 2. Normalize any legacy casing or variations
    await client.query(`
      UPDATE public.subscriptions
      SET billing_cycle = CASE
        WHEN LOWER(TRIM(billing_cycle)) IN ('month', 'monthly', 'mo') THEN 'monthly'
        WHEN LOWER(TRIM(billing_cycle)) IN ('quarter', 'quarterly', 'qtr') THEN 'quarterly'
        WHEN LOWER(TRIM(billing_cycle)) IN ('half_year', 'half_yearly', 'six_months', '6_months') THEN 'six_months'
        WHEN LOWER(TRIM(billing_cycle)) IN ('year', 'yearly', 'annual', 'annually', 'yr') THEN 'yearly'
        WHEN LOWER(TRIM(billing_cycle)) IN ('one_time', 'lifetime', 'onetime') THEN 'one_time'
        ELSE 'monthly'
      END
      WHERE billing_cycle IS NOT NULL;
    `);

    // 3. Add constraint if not exists
    const conCheck = await client.query(`
      SELECT conname FROM pg_constraint WHERE conname = 'subscriptions_billing_cycle_chk';
    `);

    if (conCheck.rows.length === 0) {
      console.log('Adding subscriptions_billing_cycle_chk constraint...');
      await client.query(`
        ALTER TABLE public.subscriptions
        ADD CONSTRAINT subscriptions_billing_cycle_chk
        CHECK (billing_cycle IN ('monthly', 'quarterly', 'six_months', 'yearly', 'one_time'));
      `);
      console.log('Constraint subscriptions_billing_cycle_chk added successfully.');
    } else {
      console.log('Constraint subscriptions_billing_cycle_chk already present.');
    }

    const afterCheck = await client.query(`
      SELECT billing_cycle, count(*) FROM public.subscriptions GROUP BY 1
    `);
    console.log('Normalized billing_cycle distribution:', afterCheck.rows);

    await client.query('COMMIT');
    console.log('=== BILLING CONSTRAINT COMPLETE ===');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error applying billing constraint:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

normalizeAndApplyBillingConstraint();
