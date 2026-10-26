require('dotenv').config();
const { query, pool } = require('./src/db.js');

async function seedModules() {
  console.log('Seeding and verifying Modules 1-4 records in Neon PostgreSQL...');

  // 1. Check support tickets count
  const tRes = await query(`SELECT count(*) as count FROM support_tickets`);
  const currentCount = parseInt(tRes.rows[0].count, 10);
  console.log(`Current support tickets: ${currentCount}`);

  if (currentCount < 128) {
    const companies = [
      'Tech Solutions Pvt. Ltd.',
      'Global Trade Inc.',
      'Skyline Marketing',
      'NextGen HR',
      'Brightway Retail',
      'Green Earth Ltd.',
      'CloudScale IO',
      'Zenith Logistics'
    ];
    const categories = ['HRMS', 'Billing', 'Technical', 'Access', 'General', 'Security'];
    const priorities = ['Urgent', 'High', 'Medium', 'Low'];
    const agents = ['Priya Mehta', 'Rohit Sharma', 'Deepak Joshi', 'Sonia Roy', 'Rajesh Iyer', 'Sneha Nair'];

    // We want: Open: 18, In Progress: 26, Resolved: 72, Closed: 12
    for (let i = currentCount + 1; i <= 128; i++) {
      const ticketId = `TK-2026-${String(4580 - i).padStart(4, '0')}`;
      const comp = companies[i % companies.length];
      const cat = categories[i % categories.length];
      const prio = priorities[i % priorities.length];
      const ag = agents[i % agents.length];

      let status = 'Open';
      if (i <= 18) {
        status = 'Open';
      } else if (i <= 44) {
        status = 'In Progress';
      } else if (i <= 116) {
        status = 'Resolved';
      } else {
        status = 'Closed';
      }

      const daysAgo = i % 25;

      await query(
        `INSERT INTO support_tickets (
          ticket_number, ticket_id, customer_id, company_name, user_name, contact_name,
          user_email, contact_email, subject, category, priority, status, assigned_to,
          description, replies, created_at, updated_at
        ) VALUES ($1, $1, $2, $3, $4, $4, $5, $5, $6, $7, $8, $9, $10, $11, $12, NOW() - ($13 || ' days')::INTERVAL, NOW() - ($13 || ' days')::INTERVAL)
        ON CONFLICT (ticket_number) DO NOTHING`,
        [
          ticketId,
          `CST-000${(i % 6) + 1}`,
          comp,
          'Customer Admin',
          `contact@${comp.toLowerCase().replace(/[^a-z]/g, '')}.com`,
          `Operational assistance with ${cat} configuration`,
          cat,
          prio,
          status,
          ag,
          `Customer reported inquiry regarding ${cat} operational rules and synchronization.`,
          JSON.stringify([
            {
              id: 'MSG-INIT',
              sender: 'Customer Admin',
              role: 'customer',
              message: `Hello, we need assistance configuring our ${cat} settings.`,
              is_internal: false,
              timestamp: 'Recently'
            },
            {
              id: 'MSG-RESP',
              sender: ag,
              role: 'staff',
              message: `Our technical team has analyzed your account and applied the recommended settings.`,
              is_internal: false,
              timestamp: 'Recently'
            }
          ]),
          daysAgo
        ]
      );
    }
  }

  // 2. Summary counts check
  const [appCount, invCount, staffCount, ticketCounts] = await Promise.all([
    query(`SELECT count(*) as count, count(*) FILTER (WHERE status = 'Active') as active, count(*) FILTER (WHERE status = 'Maintenance') as maint FROM platform_applications`),
    query(`SELECT count(*) as count, sum(amount) FILTER (WHERE status = 'Paid') as paid_rev, sum(amount) FILTER (WHERE status = 'Pending') as pending_rev, sum(amount) FILTER (WHERE status = 'Refunded') as refund_rev FROM invoices`),
    query(`SELECT count(*) as count, count(*) FILTER (WHERE role = 'Super Admin') as sa, count(*) FILTER (WHERE role = 'Finance Admin') as fa, count(*) FILTER (WHERE role = 'Support Staff') as su, count(*) FILTER (WHERE role = 'Sales Staff') as sa_staff FROM platform_staff`),
    query(`SELECT count(*) as count, count(*) FILTER (WHERE status = 'Open') as open, count(*) FILTER (WHERE status = 'In Progress') as in_prog, count(*) FILTER (WHERE status = 'Resolved') as resolved FROM support_tickets`)
  ]);

  console.log('✓ Applications summary:', appCount.rows[0]);
  console.log('✓ Invoices summary:', invCount.rows[0]);
  console.log('✓ Staff summary:', staffCount.rows[0]);
  console.log('✓ Support tickets summary:', ticketCounts.rows[0]);

  await pool.end();
}

seedModules().catch(err => {
  console.error('Seed error:', err);
  pool.end();
});
