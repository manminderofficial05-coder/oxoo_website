require('dotenv').config();
const dns = require('dns');
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {}

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../src/db');

const BASE_URL = 'http://127.0.0.1:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'oxoo-super-secret-jwt-key-2026';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function recordTest(category, name, passed, details = '') {
  if (passed) {
    results.passed++;
    console.log(`  [PASS] ${name}`);
  } else {
    results.failed++;
    console.error(`  [FAIL] ${name} - Details: ${details}`);
  }
  results.tests.push({ category, name, passed, details });
}

async function runTests() {
  console.log('================================================================');
  console.log('OXOO.ai — Phase 1 Critical Security Remediation Regression Suite');
  console.log('================================================================\n');

  // Verify server readiness
  let serverReady = false;
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) {
        serverReady = true;
        console.log('✓ Target server verified healthy on port 5000.\n');
        break;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  if (!serverReady) {
    console.error('Fatal: Server on port 5000 is not responding.');
    process.exit(1);
  }

  // Generate tokens for tests
  const customerTokenTenantA = jwt.sign(
    { id: 'test_cust_a', email: 'alice@tenant-a.com', name: 'Alice Tenant A', role: 'customer', organization: 'Tenant Alpha Corp' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const customerTokenTenantB = jwt.sign(
    { id: 'test_cust_b', email: 'bob@tenant-b.com', name: 'Bob Tenant B', role: 'customer', organization: 'Tenant Beta Ltd' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const adminToken = jwt.sign(
    { id: 1, email: 'admin@oxoo.ai', name: 'Master Security Admin', role: 'super_admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // --------------------------------------------------------------------------
  // GROUP 1: Phase 1A — Customer Authentication & Tenant Isolation
  // --------------------------------------------------------------------------
  console.log('--- GROUP 1: Phase 1A — Customer Authentication & Tenant Isolation ---');

  // Test 1A-1: Unauthenticated /api/customer/overview
  try {
    const res = await fetch(`${BASE_URL}/api/customer/overview`);
    recordTest('Phase 1A', 'Reject unauthenticated /api/customer/overview with HTTP 401', res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1A', 'Reject unauthenticated /api/customer/overview with HTTP 401', false, e.message);
  }

  // Test 1A-2: Unauthenticated /api/customer/billing
  try {
    const res = await fetch(`${BASE_URL}/api/customer/billing`);
    recordTest('Phase 1A', 'Reject unauthenticated /api/customer/billing with HTTP 401', res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1A', 'Reject unauthenticated /api/customer/billing with HTTP 401', false, e.message);
  }

  // Test 1A-3: Spoofed headers without token
  try {
    const res = await fetch(`${BASE_URL}/api/customer/overview`, {
      headers: {
        'x-user-company': 'TechSol Enterprises',
        'x-user-email': 'priya.sharma@techsol.com'
      }
    });
    recordTest('Phase 1A', 'Reject spoofed headers (x-user-company/email) without token with HTTP 401', res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1A', 'Reject spoofed headers without token with HTTP 401', false, e.message);
  }

  // Test 1A-4: Valid customer token -> HTTP 200 with caller data
  try {
    const res = await fetch(`${BASE_URL}/api/customer/overview`, {
      headers: {
        'Authorization': `Bearer ${customerTokenTenantA}`
      }
    });
    const data = await res.json();
    const passed = res.status === 200 && data.company === 'Tenant Alpha Corp';
    recordTest('Phase 1A', 'Allow valid customer token and resolve caller organization (Tenant Alpha Corp)', passed, `Status: ${res.status}, Company: ${data.company}`);
  } catch (e) {
    recordTest('Phase 1A', 'Allow valid customer token and resolve caller organization', false, e.message);
  }

  // Test 1A-5: Cross-tenant access attempt (Token for Tenant A requesting Tenant B) -> HTTP 403
  try {
    const res = await fetch(`${BASE_URL}/api/customer/overview`, {
      headers: {
        'Authorization': `Bearer ${customerTokenTenantA}`,
        'x-user-company': 'Tenant Beta Ltd'
      }
    });
    recordTest('Phase 1A', 'Reject cross-tenant access attempt (Tenant A token accessing Tenant B) with HTTP 403', res.status === 403, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1A', 'Reject cross-tenant access attempt with HTTP 403', false, e.message);
  }

  // Test 1A-6: Unauthenticated customer endpoints (team, tickets, notifications)
  for (const endpoint of ['/api/customer/team', '/api/customer/tickets', '/api/customer/notifications']) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      recordTest('Phase 1A', `Reject unauthenticated ${endpoint} with HTTP 401`, res.status === 401, `Status: ${res.status}`);
    } catch (e) {
      recordTest('Phase 1A', `Reject unauthenticated ${endpoint} with HTTP 401`, false, e.message);
    }
  }

  // --------------------------------------------------------------------------
  // GROUP 2: Phase 1B — Remove Admin Authentication Backdoors
  // --------------------------------------------------------------------------
  console.log('\n--- GROUP 2: Phase 1B — Remove Admin Authentication Backdoors ---');

  // Test 1B-1: Static backdoor token on /api/admin/overview
  try {
    const res = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: { 'Authorization': 'Bearer demo-admin-jwt-token-88' }
    });
    recordTest('Phase 1B', 'Reject static backdoor token (demo-admin-jwt-token-88) on /api/admin/overview with HTTP 401', res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1B', 'Reject static backdoor token on /api/admin/overview', false, e.message);
  }

  // Test 1B-2: Static backdoor token on /api/agent/admin/settings
  try {
    const res = await fetch(`${BASE_URL}/api/agent/admin/settings`, {
      headers: { 'Authorization': 'Bearer demo-admin-jwt-token-88' }
    });
    recordTest('Phase 1B', 'Reject static backdoor token on /api/agent/admin/settings with HTTP 401', res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1B', 'Reject static backdoor token on /api/agent/admin/settings', false, e.message);
  }

  // Test 1B-3: Insecure adminKey === JWT_SECRET comparison
  try {
    const res = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: { 'x-admin-key': JWT_SECRET }
    });
    recordTest('Phase 1B', 'Reject insecure x-admin-key === JWT_SECRET backdoor with HTTP 401', res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1B', 'Reject insecure x-admin-key === JWT_SECRET backdoor', false, e.message);
  }

  // Test 1B-4: Customer token attempting admin route -> HTTP 403
  try {
    const res = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: { 'Authorization': `Bearer ${customerTokenTenantA}` }
    });
    recordTest('Phase 1B', 'Reject non-admin customer token on admin route with HTTP 403', res.status === 403, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1B', 'Reject non-admin customer token on admin route', false, e.message);
  }

  // Test 1B-5: Authorized administrator token -> HTTP 200
  try {
    const res = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    recordTest('Phase 1B', 'Allow cryptographically signed administrator token on /api/admin/overview with HTTP 200', res.status === 200, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1B', 'Allow cryptographically signed administrator token', false, e.message);
  }

  // --------------------------------------------------------------------------
  // GROUP 3: Phase 1C — Protect All Administrative Routes
  // --------------------------------------------------------------------------
  console.log('\n--- GROUP 3: Phase 1C — Protect All Administrative Routes ---');

  const adminRoutesToCheck = [
    '/api/admin/invoices',
    '/api/admin/staff',
    '/api/admin/applications',
    '/api/admin/tickets',
    '/api/admin/inquiries/summary',
    '/api/admin/roles'
  ];

  // Test 1C: Unauthenticated access to admin module routes
  for (const route of adminRoutesToCheck) {
    try {
      const res = await fetch(`${BASE_URL}${route}`);
      recordTest('Phase 1C', `Reject unauthenticated ${route} with HTTP 401`, res.status === 401, `Status: ${res.status}`);
    } catch (e) {
      recordTest('Phase 1C', `Reject unauthenticated ${route} with HTTP 401`, false, e.message);
    }
  }

  // Test 1C: Authenticated admin access to admin module routes
  for (const route of ['/api/admin/invoices', '/api/admin/staff', '/api/admin/applications']) {
    try {
      const res = await fetch(`${BASE_URL}${route}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      recordTest('Phase 1C', `Allow authenticated administrator on ${route} with HTTP 200`, res.status === 200, `Status: ${res.status}`);
    } catch (e) {
      recordTest('Phase 1C', `Allow authenticated administrator on ${route}`, false, e.message);
    }
  }

  // --------------------------------------------------------------------------
  // GROUP 4: Phase 1D — Secure Payment Verification
  // --------------------------------------------------------------------------
  console.log('\n--- GROUP 4: Phase 1D — Secure Payment Verification ---');

  // Test 1D-1: Missing orderNumber -> HTTP 400
  try {
    const res = await fetch(`${BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    recordTest('Phase 1D', 'Reject payment verification missing orderNumber with HTTP 400', res.status === 400, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1D', 'Reject payment verification missing orderNumber', false, e.message);
  }

  // Test 1D-2: Non-existent orderNumber -> HTTP 404
  try {
    const res = await fetch(`${BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber: 'OXOO-NONEXISTENT-999999' })
    });
    recordTest('Phase 1D', 'Reject payment verification for non-existent order with HTTP 404', res.status === 404, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1D', 'Reject payment verification for non-existent order', false, e.message);
  }

  // Setup test order in database
  const testOrderNumber = `OXOO-TEST-${Date.now()}`;
  const testOrderId = `order_test_${Date.now()}`;
  const testPaymentId = `pay_test_${Date.now()}`;
  await query(
    `INSERT INTO orders (order_number, company_name, customer_name, customer_email, plan_name, selected_apps, user_count, billing_cycle, subtotal, tax_amount, total_amount, currency, status, payment_id)
     VALUES ($1, 'Security Test Org', 'Tester', 'test@security.org', 'Single App', '["Sales Software"]', 1, 'monthly', 500, 60, 560, 'INR', 'Created', $2)`,
    [testOrderNumber, testOrderId]
  );

  // Test 1D-3: Missing Razorpay signature -> HTTP 400
  try {
    const res = await fetch(`${BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: testOrderNumber,
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId
      })
    });
    recordTest('Phase 1D', 'Reject payment verification with missing signature with HTTP 400', res.status === 400, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1D', 'Reject payment verification with missing signature', false, e.message);
  }

  // Test 1D-4: Forged/invalid Razorpay signature -> HTTP 400
  try {
    const res = await fetch(`${BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: testOrderNumber,
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: 'forged_invalid_signature_hex_1234567890abcdef'
      })
    });
    recordTest('Phase 1D', 'Reject payment verification with forged signature with HTTP 400', res.status === 400, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1D', 'Reject payment verification with forged signature', false, e.message);
  }

  // Test 1D-5: Valid cryptographic signature -> HTTP 200
  const validSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest('hex');

  try {
    const res = await fetch(`${BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: testOrderNumber,
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature,
        totalAmount: 1, // Client tries to spoof amount to 1 rupee
        companyName: 'Spoofed Org' // Client tries to spoof company
      })
    });
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.amountPaid === 560;
    recordTest('Phase 1D', 'Accept valid signature and verify DB-grounded amount (560) ignoring spoofed amount (1)', passed, `Status: ${res.status}, Amount: ${data.amountPaid}`);
  } catch (e) {
    recordTest('Phase 1D', 'Accept valid signature and verify DB-grounded amount', false, e.message);
  }

  // Test 1D-6: Duplicate/replayed payment verification (Idempotency) -> HTTP 200 idempotent: true
  try {
    const res = await fetch(`${BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: testOrderNumber,
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature
      })
    });
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.idempotent === true;
    recordTest('Phase 1D', 'Enforce idempotent payment verification without duplicate mutations', passed, `Status: ${res.status}, Idempotent: ${data.idempotent}`);
  } catch (e) {
    recordTest('Phase 1D', 'Enforce idempotent payment verification', false, e.message);
  }

  // Cleanup test order
  await query(`DELETE FROM orders WHERE order_number = $1`, [testOrderNumber]);
  await query(`DELETE FROM subscriptions WHERE company_name = 'Security Test Org'`);
  await query(`DELETE FROM invoices WHERE company_name = 'Security Test Org'`);

  // --------------------------------------------------------------------------
  // GROUP 5: Phase 1E — Protect Support Attachments
  // --------------------------------------------------------------------------
  console.log('\n--- GROUP 5: Phase 1E — Protect Support Attachments ---');

  // Insert a test attachment belonging to Tenant Alpha Corp
  const testAttachmentId = `att_test_${Date.now()}`;
  const testTicketNumber = `TK-TEST-${Date.now()}`;

  await query(
    `INSERT INTO support_tickets (ticket_number, company_name, user_name, user_email, subject, description, priority, status)
     VALUES ($1, 'Tenant Alpha Corp', 'Alice Customer', 'alice@tenant-a.com', 'Test Subject', 'Test Description', 'Medium', 'Open')`,
    [testTicketNumber]
  );

  await query(
    `INSERT INTO ticket_attachments (attachment_id, ticket_number, file_name, file_size, mime_type, storage_path, uploaded_by_email, uploaded_by_role)
     VALUES ($1, $2, 'confidential_report.pdf', 1024, 'application/pdf', 'data:application/pdf;base64,VGVzdCBGaWxl', 'alice@tenant-a.com', 'customer')`,
    [testAttachmentId, testTicketNumber]
  );

  // Test 1E-1: Unauthenticated attachment download -> HTTP 401
  try {
    const res = await fetch(`${BASE_URL}/api/tickets/attachments/${testAttachmentId}`);
    recordTest('Phase 1E', 'Reject unauthenticated attachment download with HTTP 401', res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1E', 'Reject unauthenticated attachment download', false, e.message);
  }

  // Test 1E-2: Cross-tenant attachment download (Tenant B token accessing Tenant A ticket attachment) -> HTTP 403
  try {
    const res = await fetch(`${BASE_URL}/api/tickets/attachments/${testAttachmentId}`, {
      headers: { 'Authorization': `Bearer ${customerTokenTenantB}` }
    });
    recordTest('Phase 1E', 'Reject cross-tenant attachment access (Tenant B accessing Tenant A attachment) with HTTP 403', res.status === 403, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1E', 'Reject cross-tenant attachment access with HTTP 403', false, e.message);
  }

  // Test 1E-3: Legitimate tenant owner download -> HTTP 200 with secure headers
  try {
    const res = await fetch(`${BASE_URL}/api/tickets/attachments/${testAttachmentId}`, {
      headers: { 'Authorization': `Bearer ${customerTokenTenantA}` }
    });
    const nosniff = res.headers.get('x-content-type-options');
    const csp = res.headers.get('content-security-policy');
    const passed = res.status === 200 && nosniff === 'nosniff' && csp === "default-src 'none'";
    recordTest('Phase 1E', 'Allow legitimate tenant attachment download with security headers (nosniff, CSP)', passed, `Status: ${res.status}, nosniff: ${nosniff}, csp: ${csp}`);
  } catch (e) {
    recordTest('Phase 1E', 'Allow legitimate tenant attachment download with security headers', false, e.message);
  }

  // Test 1E-4: Admin attachment download -> HTTP 200
  try {
    const res = await fetch(`${BASE_URL}/api/tickets/attachments/${testAttachmentId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    recordTest('Phase 1E', 'Allow administrator attachment download with HTTP 200', res.status === 200, `Status: ${res.status}`);
  } catch (e) {
    recordTest('Phase 1E', 'Allow administrator attachment download', false, e.message);
  }

  // Cleanup test tickets & attachments
  await query(`DELETE FROM ticket_attachments WHERE attachment_id = $1`, [testAttachmentId]);
  await query(`DELETE FROM support_tickets WHERE ticket_number = $1`, [testTicketNumber]);

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`REGRESSION TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('================================================================');

  if (results.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
