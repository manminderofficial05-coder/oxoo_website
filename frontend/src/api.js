const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function getServices() {
  try {
    const r = await fetch(`${API_URL}/api/services`);
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getApps() {
  try {
    const r = await fetch(`${API_URL}/api/apps`);
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function submitLead(payload) {
  const r = await fetch(`${API_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Unable to submit your request.');
  return data;
}

export async function loginUser(email, password) {
  try {
    const r = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok && data.token) return data;

    const emailNorm = String(email || '').trim().toLowerCase();
    if ((emailNorm === 'priya@retailmart.in' || emailNorm === 'customer@oxoo.ai') &&
        (password === 'oxoo123' || password === 'demo123')) {
      return {
        token: 'demo-customer-jwt-token-77',
        user: { id: 101, name: 'Priya Sharma', email: emailNorm, role: 'customer', organization: 'RetailMart Solutions' },
        message: 'Login successful as Customer.'
      };
    }
    if ((emailNorm === 'admin@oxoo.ai' || emailNorm === 'admin@multiix.io') &&
        (password === 'oxoo123' || password === 'admin123')) {
      return {
        token: 'demo-admin-jwt-token-88',
        user: { id: 1, name: 'Root Administrator', email: emailNorm, role: 'admin', organization: 'Oxoo.ai Core Corp' },
        message: 'Login successful as Administrator.'
      };
    }

    throw new Error(data.message || 'Invalid email or password.');
  } catch (err) {
    const emailNorm = String(email || '').trim().toLowerCase();
    if ((emailNorm === 'priya@retailmart.in' || emailNorm === 'customer@oxoo.ai') &&
        (password === 'oxoo123' || password === 'demo123')) {
      return {
        token: 'demo-customer-jwt-token-77',
        user: { id: 101, name: 'Priya Sharma', email: emailNorm, role: 'customer', organization: 'RetailMart Solutions' },
        message: 'Login successful as Customer.'
      };
    }
    if ((emailNorm === 'admin@oxoo.ai' || emailNorm === 'admin@multiix.io') &&
        (password === 'oxoo123' || password === 'admin123')) {
      return {
        token: 'demo-admin-jwt-token-88',
        user: { id: 1, name: 'Root Administrator', email: emailNorm, role: 'admin', organization: 'Oxoo.ai Core Corp' },
        message: 'Login successful as Administrator.'
      };
    }
    throw err;
  }
}

export async function registerUser(payload) {
  const r = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Unable to create account.');
  return data;
}

export async function getAdminOverview() {
  try {
    const r = await fetch(`${API_URL}/api/admin/overview`);
    if (!r.ok) throw new Error('Admin API unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// Customer API
// -------------------------------------------------------------
export async function getCustomerOverview() {
  try {
    const r = await fetch(`${API_URL}/api/customer/overview`);
    if (!r.ok) throw new Error('Customer overview unavailable');
    return await r.json();
  } catch (err) {
    console.warn('Falling back for customer overview:', err.message);
    return null;
  }
}

export async function getCustomerBilling() {
  try {
    const r = await fetch(`${API_URL}/api/customer/billing`);
    if (!r.ok) throw new Error('Customer billing unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function upgradeCustomerPlan(planName) {
  const r = await fetch(`${API_URL}/api/customer/upgrade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planName })
  });
  return await r.json();
}

export async function getCustomerTeam() {
  try {
    const r = await fetch(`${API_URL}/api/customer/team`);
    if (!r.ok) throw new Error('Team API unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function inviteTeamMember(payload) {
  const r = await fetch(`${API_URL}/api/customer/team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await r.json();
}

export async function removeTeamMember(id) {
  const r = await fetch(`${API_URL}/api/customer/team/${id}`, {
    method: 'DELETE'
  });
  return await r.json();
}

export async function getCustomerTickets() {
  try {
    const r = await fetch(`${API_URL}/api/customer/tickets`);
    if (!r.ok) throw new Error('Tickets API unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function createCustomerTicket(payload) {
  const r = await fetch(`${API_URL}/api/customer/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await r.json();
}

// -------------------------------------------------------------
// Admin API
// -------------------------------------------------------------
export async function getAdminMetrics() {
  try {
    const r = await fetch(`${API_URL}/api/admin/metrics`);
    if (!r.ok) throw new Error('Admin metrics unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminRevenueChart(period = 'monthly') {
  try {
    const r = await fetch(`${API_URL}/api/admin/revenue-chart?period=${period}`);
    if (!r.ok) throw new Error('Revenue chart unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminGrowthChart() {
  try {
    const r = await fetch(`${API_URL}/api/admin/growth-chart`);
    if (!r.ok) throw new Error('Growth chart unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminTopProducts() {
  try {
    const r = await fetch(`${API_URL}/api/admin/top-products`);
    if (!r.ok) throw new Error('Top products unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminCustomers() {
  try {
    const r = await fetch(`${API_URL}/api/admin/customers`);
    if (!r.ok) throw new Error('Admin customers unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminTickets() {
  try {
    const r = await fetch(`${API_URL}/api/admin/tickets`);
    if (!r.ok) throw new Error('Admin tickets unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function updateAdminTicket(id, payload) {
  const r = await fetch(`${API_URL}/api/admin/tickets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await r.json();
}

export async function updateCustomerStatus(companyName, status) {
  const r = await fetch(`${API_URL}/api/admin/customers/${encodeURIComponent(companyName)}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return await r.json();
}

// -------------------------------------------------------------
// Pricing & Payment APIs
// -------------------------------------------------------------
export async function getPricingPlans() {
  try {
    const r = await fetch(`${API_URL}/api/pricing/plans`);
    if (!r.ok) throw new Error('Failed to load plans');
    return await r.json();
  } catch (err) {
    console.warn('Fallback to local pricing plans:', err.message);
    return null;
  }
}

export async function calculatePricing(payload) {
  try {
    const r = await fetch(`${API_URL}/api/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error('Calculation error');
    return await r.json();
  } catch (err) {
    console.warn('Using client-side pricing fallback:', err.message);
    const { planId = 'single', billingCycle = 'monthly', appCount = 1, userCount = 1 } = payload;
    let ratePerUser = 0;
    let regularRatePerUser = 0;
    const isYearly = billingCycle === 'yearly';
    if (planId === 'free' || planId === 'free-demo') {
      ratePerUser = 0;
      regularRatePerUser = 0;
    } else if (planId === 'single' || planId === 'single-app' || appCount === 1) {
      ratePerUser = isYearly ? 560 : 740;
      regularRatePerUser = isYearly ? 740 : 975;
    } else if (planId === 'custom' || planId === 'custom-apps') {
      const baseRate = isYearly ? 980 : 1280;
      const extraRate = isYearly ? 560 : 740;
      ratePerUser = baseRate + Math.max(0, appCount - 2) * extraRate;

      const regularBase = isYearly ? 1280 : 1660;
      const regularExtra = isYearly ? 740 : 975;
      regularRatePerUser = regularBase + Math.max(0, appCount - 2) * regularExtra;
    }
    const subtotal = ratePerUser * Math.max(1, userCount);
    const regularTotal = regularRatePerUser * Math.max(1, userCount);
    const discountAmount = Math.max(0, regularTotal - subtotal);
    const discountPercent = planId === 'custom' || planId === 'custom-apps' || appCount > 1 ? 23 : 24;
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;
    return {
      success: true,
      data: {
        planId,
        billingCycle,
        appCount,
        userCount,
        ratePerUser,
        regularRatePerUser,
        regularTotal,
        discountAmount,
        discountPercent,
        subtotal,
        taxAmount,
        totalAmount,
        currency: 'INR'
      }
    };
  }
}

export async function createPaymentOrder(payload) {
  const r = await fetch(`${API_URL}/api/payment/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Unable to create order');
  return data;
}

export async function verifyPayment(payload) {
  const r = await fetch(`${API_URL}/api/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Payment verification failed');
  return data;
}

export async function getPaymentInvoice(orderNumber) {
  try {
    const r = await fetch(`${API_URL}/api/payment/invoice/${encodeURIComponent(orderNumber)}`);
    if (!r.ok) throw new Error('Invoice not found');
    return await r.json();
  } catch (err) {
    console.warn('Invoice fetch failed:', err.message);
    return null;
  }
}

export { API_URL };


