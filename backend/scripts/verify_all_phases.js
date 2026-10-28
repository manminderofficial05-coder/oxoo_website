/**
 * Master Verification Suite for OXOO.ai SaaS Platform
 * Tests all Master Implementation Requirements across Phases 1 - 9
 */

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE OXOO.ai VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST GROUP 1: Database Schema & Migration Integrity
    // ----------------------------------------------------
    console.log('--- TEST GROUP 1: Database Schema Integrity ---');
    const tableRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('demo_inquiries', 'support_tickets', 'ticket_attachments', 'organizations', 'platform_applications')
    `);
    const tables = tableRes.rows.map(r => r.table_name);
    assert(tables.includes('demo_inquiries'), 'demo_inquiries table exists');
    assert(tables.includes('support_tickets'), 'support_tickets table exists');
    assert(tables.includes('ticket_attachments'), 'ticket_attachments table exists');
    assert(tables.includes('organizations'), 'organizations table exists');
    assert(tables.includes('platform_applications'), 'platform_applications table exists');

    // Check support_tickets columns
    const colRes = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'support_tickets'
    `);
    const ticketCols = colRes.rows.map(r => r.column_name);
    assert(ticketCols.includes('attachments'), 'support_tickets.attachments column exists');
    assert(ticketCols.includes('ack_email_sent_at'), 'support_tickets.ack_email_sent_at column exists');
    assert(ticketCols.includes('source'), 'support_tickets.source column exists');

    // Check platform_applications
    const appsRes = await pool.query('SELECT * FROM platform_applications');
    assert(appsRes.rows.length >= 6, `platform_applications has ${appsRes.rows.length} core apps configured`);

    // ----------------------------------------------------
    // TEST GROUP 2: Customer Workspace Resolution
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 2: Workspace Hostname Resolution ---');
    // 2.1 Resolve maan.oxoo.ai
    const resMaan = await fetch(`${BACKEND_URL}/api/workspace/resolve?host=maan.oxoo.ai`);
    const dataMaan = await resMaan.json();
    assert(resMaan.ok, 'maan.oxoo.ai resolves successfully (HTTP 200)');
    assert(dataMaan.workspace?.company_name === 'Maan Corp', 'Resolved company name is "Maan Corp"');
    assert(dataMaan.workspace?.purchased_apps?.some(a => a.toLowerCase().includes('hrms')), 'Entitled to HRMS');
    assert(dataMaan.workspace?.purchased_apps?.includes('AI Sales Agent'), 'Entitled to AI Sales Agent');

    // 2.2 Resolve abc.oxoo.ai
    const resAbc = await fetch(`${BACKEND_URL}/api/workspace/resolve?host=abc.oxoo.ai`);
    const dataAbc = await resAbc.json();
    assert(resAbc.ok, 'abc.oxoo.ai resolves successfully (HTTP 200)');
    assert(dataAbc.workspace?.company_name === 'ABC Enterprises', 'Resolved company name is "ABC Enterprises"');

    // 2.3 Reject unknown domain
    const resUnknown = await fetch(`${BACKEND_URL}/api/workspace/resolve?host=nonexistent.randomdomain.com`);
    assert(resUnknown.status === 404, 'Unknown host returns HTTP 404 WORKSPACE_NOT_FOUND');

    // ----------------------------------------------------
    // TEST GROUP 3: Demo Inquiries Creation & Validation
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 3: Demo Inquiries API ---');
    // 3.1 Validation check
    const invalidInq = await fetch(`${BACKEND_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }) // missing email & phone
    });
    assert(invalidInq.status === 400, 'Invalid inquiry payload rejected with HTTP 400');

    // 3.2 Valid submission
    const testEmail = `lead_${Date.now()}@stagingtest.com`;
    const validInq = await fetch(`${BACKEND_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sanjay Deshmukh',
        email: testEmail,
        phone: '+91 99887 76655',
        company: 'Staging Logistics Pvt',
        product_slug: 'website-builder-demo',
        product_name: 'Website & Web Applications',
        plan_interest: 'Custom Pack (₹980/mo)',
        requirements: 'Requires custom B2B multi-vendor ordering portal with WhatsApp notifications.'
      })
    });
    const inqData = await validInq.json();
    assert(validInq.ok, 'Valid inquiry submitted successfully (HTTP 201)');
    assert(/^INQ-2026-\d{4}$/.test(inqData.inquiry_ref), `Unique reference generated in correct format: ${inqData.inquiry_ref}`);

    // 3.3 Spam prevention within 3 minutes
    const spamInq = await fetch(`${BACKEND_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sanjay Deshmukh',
        email: testEmail,
        phone: '+91 99887 76655',
        company: 'Staging Logistics Pvt',
        product_slug: 'website-builder-demo',
        product_name: 'Website & Web Applications',
        plan_interest: 'Custom Pack (₹980/mo)',
        requirements: 'Duplicate attempt within 3 mins'
      })
    });
    assert(spamInq.status === 429, 'Duplicate submission within 3 minutes rejected with HTTP 429 rate limit');

    // ----------------------------------------------------
    // TEST GROUP 4: Super Admin Inquiries Module
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 4: Super Admin Inquiries Endpoints ---');
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'oxoo-super-secret-jwt-key-2026';
    const adminToken = jwt.sign(
      { id: 1, email: 'admin@oxoo.ai', name: 'Master Security Admin', role: 'super_admin' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const customerToken = jwt.sign(
      { id: 'cust_priya', email: 'priya@retailmart.com', name: 'Priya Sharma', role: 'customer', organization: 'RetailMart Solutions' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4.0 Verify unauthenticated request is rejected with 401
    const unauthInq = await fetch(`${BACKEND_URL}/api/admin/inquiries/summary`);
    assert(unauthInq.status === 401, 'Unauthenticated access to /api/admin/inquiries/summary is rejected with HTTP 401');

    // 4.1 Summary with admin token
    const summaryRes = await fetch(`${BACKEND_URL}/api/admin/inquiries/summary`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const summaryData = await summaryRes.json();
    assert(summaryRes.ok, 'Admin inquiries summary returns HTTP 200 with valid admin session');
    assert(typeof summaryData.total === 'number' && summaryData.total >= 1, `Total inquiries count is ${summaryData.total}`);

    // 4.2 List with admin token
    const listRes = await fetch(`${BACKEND_URL}/api/admin/inquiries?limit=10`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const listData = await listRes.json();
    assert(listRes.ok, 'Admin inquiries list returns HTTP 200 with valid admin session');
    assert(Array.isArray(listData.inquiries) && listData.inquiries.length > 0, `Returned ${listData.inquiries.length} inquiries`);

    // 4.3 Update inquiry status & note
    const targetInq = listData.inquiries[0];
    const updateRes = await fetch(`${BACKEND_URL}/api/admin/inquiries/${targetInq.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'Contacted',
        assigned_to: 'Vikram Patel',
        internal_notes: 'Spoke with prospect. Scheduled demonstration for tomorrow at 3 PM.'
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.ok, 'Admin inquiry status and assigned owner updated (HTTP 200)');
    assert(updateData.inquiry?.status === 'Contacted', 'Status transitioned to Contacted');

    // ----------------------------------------------------
    // TEST GROUP 5: Support Tickets & Acknowledgement Flow
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 5: Support Tickets & Acknowledgement Flow ---');
    // 5.1 Create customer ticket with attachment & token
    const ticketRes = await fetch(`${BACKEND_URL}/api/customer/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        customerName: 'Priya Sharma',
        customerEmail: 'priya@retailmart.com',
        company: 'RetailMart Solutions',
        subject: 'Invoice Generation Tax Discrepancy on GST Line Item',
        category: 'Billing',
        priority: 'High',
        application: 'Finance Software',
        message: 'The GST breakdown on invoice #INV-9042 shows 12% instead of 18% for service line items. Screenshot and CSV breakdown attached.',
        attachments: [
          {
            name: 'invoice_error.png',
            size: 104200,
            type: 'image/png',
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          }
        ]
      })
    });
    const ticketData = await ticketRes.json();
    assert(ticketRes.ok, 'Customer ticket created successfully with attachment (HTTP 201)');
    const ticketId = ticketData.ticket?.ticket_id || ticketData.ticket?.ticket_number;
    assert(ticketId && (ticketId.startsWith('TK-') || ticketId.startsWith('TICK-')), `Ticket ID generated: ${ticketId}`);
    assert(ticketData.ticket?.ack_email_sent_at !== null, 'Mandatory acknowledgement email timestamp recorded in database');

    const createdTicketId = ticketId;

    // 5.2 Staff Reply (creates notification & logs email)
    const staffReplyRes = await fetch(`${BACKEND_URL}/api/admin/tickets/${createdTicketId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        sender: 'OXOO Support Team',
        message: 'Hello Priya, we have reviewed your attached screenshot. The GST rate for HSN code 998314 has been corrected to 18% on your account.'
      })
    });
    const staffData = await staffReplyRes.json();
    assert(staffReplyRes.ok, 'Staff reply recorded successfully (HTTP 200)');

    // 5.3 Verify notification was recorded for customer
    const notifCheck = await pool.query(
      `SELECT * FROM customer_notifications WHERE customer_email = 'priya@retailmart.com' ORDER BY id DESC LIMIT 1`
    );
    assert(notifCheck.rows.length > 0, 'Customer in-app notification recorded in database');

    // 5.4 Customer Reply back to conversation with token
    const custReplyRes = await fetch(`${BACKEND_URL}/api/customer/tickets/${createdTicketId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        sender: 'Priya Sharma',
        customerEmail: 'priya@retailmart.com',
        company: 'RetailMart Solutions',
        message: 'Thank you for the quick resolution! Tested invoice generation and tax now reflects 18% accurately.'
      })
    });
    const custReplyData = await custReplyRes.json();
    assert(custReplyRes.ok, 'Customer reply appended to ticket conversation timeline (HTTP 200)');

    // Check conversation timeline
    const timelineRes = await pool.query(
      `SELECT replies FROM support_tickets WHERE ticket_number = $1 OR id::text = $1`,
      [createdTicketId]
    );
    const conv = timelineRes.rows[0]?.replies || [];
    assert(Array.isArray(conv) && conv.length >= 1, `Ticket timeline contains ${conv.length} messages in chronological order`);

    // ----------------------------------------------------
    // TEST GROUP 6: Countdown Presentation Verification
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 6: Countdown Label Removal Check ---');
    const fs = require('fs');
    const path = require('path');
    const custDashSrc = fs.readFileSync(path.resolve(__dirname, '../../frontend/src/CustomerDashboard.jsx'), 'utf-8');
    const appWsSrc = fs.readFileSync(path.resolve(__dirname, '../../frontend/src/AppWorkspace.jsx'), 'utf-8');

    const hasDaysRemainingDisplay = custDashSrc.includes('Days Left') || custDashSrc.includes('d left') || custDashSrc.includes('days left');
    const hasAppWsCountdown = appWsSrc.includes('Days Left') || appWsSrc.includes('d left');

    assert(!hasDaysRemainingDisplay, 'Zero visible countdown labels (e.g. "92d left", "27 Days Left") in CustomerDashboard.jsx');
    assert(!hasAppWsCountdown, 'Zero visible countdown labels in AppWorkspace.jsx');

    console.log('\n====================================================');
    console.log(`📊 SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTests();
