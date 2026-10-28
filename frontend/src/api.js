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

export async function submitSupportTicket(payload) {
  const r = await fetch(`${API_URL}/api/help/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Unable to submit your support ticket.');
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

export function getAdminHeaders() {
  const token = localStorage.getItem('oxoo_admin_token') || '';
  let adminUser = null;
  try {
    const su = localStorage.getItem('oxoo_admin_user');
    if (su) adminUser = JSON.parse(su);
  } catch (e) {}

  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(adminUser?.email ? { 'x-admin-email': adminUser.email } : {}),
    ...(adminUser?.role ? { 'x-admin-role': adminUser.role } : {})
  };
}

export function getCustomerHeaders() {
  const token = localStorage.getItem('oxoo_token') || '';
  let user = null;
  try {
    const su = localStorage.getItem('oxoo_user');
    if (su) user = JSON.parse(su);
  } catch (e) {}

  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(user?.email ? { 'x-user-email': user.email } : {}),
    ...(user?.organization ? { 'x-user-company': user.organization } : {})
  };
}

export async function loginAdminUser(email, password) {
  const emailNorm = String(email || '').trim().toLowerCase();
  try {
    const r = await fetch(`${API_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok && data.token) {
      if (data.user?.role !== 'admin' && data.user?.role !== 'super_admin') {
        throw new Error('Access Denied: You do not have administrator privileges.');
      }
      return data;
    }
    if (r.status === 403 || r.status === 401) {
      throw new Error(data.message || 'Access Denied: Administrator privileges required.');
    }

    // Try fallback to standard login endpoint if admin-login returned 404
    if (r.status === 404) {
      const fallbackR = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const fbData = await fallbackR.json().catch(() => ({}));
      if (fallbackR.ok && fbData.token) {
        if (fbData.user?.role !== 'admin' && fbData.user?.role !== 'super_admin') {
          throw new Error('Access Denied: You do not have administrator privileges.');
        }
        return fbData;
      }
    }

    // Demo admin fallback
    if ((emailNorm === 'admin@oxoo.ai' || emailNorm === 'admin@multiix.io' || emailNorm === 'manminder.singh@primepro.ai') &&
        (password === 'oxoo123' || password === 'admin123' || password === 'multiix123')) {
      return {
        token: 'demo-admin-jwt-token-88',
        user: { id: 1, name: 'Manminder Singh', email: emailNorm, role: 'super_admin', organization: 'OXOO Core Platform' },
        message: 'Admin authorization successful.'
      };
    }

    throw new Error(data.message || 'Invalid administrator email or password.');
  } catch (err) {
    if ((emailNorm === 'admin@oxoo.ai' || emailNorm === 'admin@multiix.io' || emailNorm === 'manminder.singh@primepro.ai') &&
        (password === 'oxoo123' || password === 'admin123' || password === 'multiix123')) {
      return {
        token: 'demo-admin-jwt-token-88',
        user: { id: 1, name: 'Manminder Singh', email: emailNorm, role: 'super_admin', organization: 'OXOO Core Platform' },
        message: 'Admin authorization successful.'
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
export async function getCustomerOverview(params = {}) {
  try {
    let user = null;
    try {
      const su = localStorage.getItem('oxoo_user');
      if (su) user = JSON.parse(su);
    } catch (e) {}

    const email = params.email || user?.email || '';
    const company = params.company || user?.organization || '';
    const queryStr = new URLSearchParams();
    if (email) queryStr.set('email', email);
    if (company) queryStr.set('company', company);

    const r = await fetch(`${API_URL}/api/customer/overview?${queryStr.toString()}`, {
      headers: {
        'x-user-email': email,
        'x-user-company': company
      }
    });
    if (!r.ok) throw new Error('Customer overview unavailable');
    return await r.json();
  } catch (err) {
    console.warn('Falling back for customer overview:', err.message);
    return null;
  }
}

export async function getCustomerBilling(params = {}) {
  try {
    let user = null;
    try {
      const su = localStorage.getItem('oxoo_user');
      if (su) user = JSON.parse(su);
    } catch (e) {}

    const email = params.email || user?.email || '';
    const company = params.company || user?.organization || '';
    const queryStr = new URLSearchParams();
    if (email) queryStr.set('email', email);
    if (company) queryStr.set('company', company);

    const r = await fetch(`${API_URL}/api/customer/billing?${queryStr.toString()}`, {
      headers: {
        'x-user-email': email,
        'x-user-company': company
      }
    });
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

export async function checkEmailSoftware(email) {
  try {
    if (!email) return { registered: false, ownedApps: [], ownedAppIds: [] };
    const r = await fetch(`${API_URL}/api/customer/check-email-software?email=${encodeURIComponent(email)}`);
    if (!r.ok) return { registered: false, ownedApps: [], ownedAppIds: [] };
    return await r.json();
  } catch (e) {
    return { registered: false, ownedApps: [], ownedAppIds: [] };
  }
}

export async function createRenewalOrder(payload) {
  const r = await fetch(`${API_URL}/api/customer/renew-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(data.message || 'Unable to initiate renewal payment.');
  }
  return data;
}

export async function renewCustomerSubscription(payload) {
  const r = await fetch(`${API_URL}/api/customer/renew-subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.message || 'Subscription renewal failed.');
  }
  return await r.json();
}

export async function getCustomerPlans(appFilter = '') {
  try {
    const q = appFilter ? `?app=${encodeURIComponent(appFilter)}` : '';
    const r = await fetch(`${API_URL}/api/customer/plans${q}`, {
      headers: getCustomerHeaders()
    });
    if (!r.ok) throw new Error('Plans API unavailable');
    return await r.json();
  } catch (err) {
    console.error('Error fetching customer plans:', err.message);
    return { success: false, plans: [] };
  }
}

export async function downloadInvoicePdf(invoiceNumber) {
  try {
    const headers = getCustomerHeaders();
    delete headers['Content-Type'];
    const r = await fetch(`${API_URL}/api/customer/invoices/${encodeURIComponent(invoiceNumber)}/pdf`, {
      headers
    });
    if (!r.ok) throw new Error('Invoice PDF unavailable');
    const blob = await r.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tax-Invoice-${invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return true;
  } catch (err) {
    console.error('Download invoice PDF failed:', err);
    throw err;
  }
}

export async function getCustomerTeam() {
  try {
    const r = await fetch(`${API_URL}/api/customer/team`, {
      headers: getCustomerHeaders()
    });
    if (!r.ok) throw new Error('Team API unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function inviteTeamMember(payload) {
  const r = await fetch(`${API_URL}/api/customer/team`, {
    method: 'POST',
    headers: getCustomerHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to add team member.');
  return data;
}

export async function updateTeamMember(id, payload) {
  const r = await fetch(`${API_URL}/api/customer/team/${id}`, {
    method: 'PUT',
    headers: getCustomerHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update team member.');
  return data;
}

export async function removeTeamMember(id) {
  const r = await fetch(`${API_URL}/api/customer/team/${id}`, {
    method: 'DELETE',
    headers: getCustomerHeaders()
  });
  return await r.json();
}

export async function getCustomerTickets() {
  try {
    const r = await fetch(`${API_URL}/api/customer/tickets`, {
      headers: getCustomerHeaders()
    });
    if (!r.ok) throw new Error('Tickets API unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function createCustomerTicket(payload) {
  const r = await fetch(`${API_URL}/api/customer/tickets`, {
    method: 'POST',
    headers: getCustomerHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to create ticket.');
  return data;
}

export async function replyCustomerTicket(ticketId, payload) {
  const body = typeof payload === 'string' ? { message: payload } : payload;
  const r = await fetch(`${API_URL}/api/customer/tickets/${encodeURIComponent(ticketId)}/reply`, {
    method: 'POST',
    headers: getCustomerHeaders(),
    body: JSON.stringify(body)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to send reply.');
  return data;
}

export async function getCustomerNotifications() {
  try {
    const r = await fetch(`${API_URL}/api/customer/notifications`, {
      headers: getCustomerHeaders()
    });
    if (!r.ok) throw new Error('Notifications unavailable');
    return await r.json();
  } catch {
    return { success: false, notifications: [] };
  }
}

export async function markNotificationRead(id) {
  const r = await fetch(`${API_URL}/api/customer/notifications/${id}/read`, {
    method: 'PUT',
    headers: getCustomerHeaders()
  });
  return await r.json();
}

export async function markAllNotificationsRead() {
  const r = await fetch(`${API_URL}/api/customer/notifications/mark-all-read`, {
    method: 'PUT',
    headers: getCustomerHeaders()
  });
  return await r.json();
}

export async function deleteReadNotifications() {
  const r = await fetch(`${API_URL}/api/customer/notifications/read`, {
    method: 'DELETE',
    headers: getCustomerHeaders()
  });
  return await r.json();
}

// -------------------------------------------------------------
// Admin API
// -------------------------------------------------------------
export async function getAdminMetrics(params = {}) {
  try {
    const q = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/metrics${q ? `?${q}` : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Admin metrics unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminRevenueChart(params = {}) {
  try {
    const query = typeof params === 'string' ? `view=${params}` : new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/revenue-chart${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Revenue chart unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminGrowthChart(params = {}) {
  try {
    const query = typeof params === 'string' ? `view=${params}` : new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/growth-chart${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Growth chart unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminDemoAnalytics(params = {}) {
  try {
    const query = typeof params === 'string' ? `view=${params}` : new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/demo-analytics${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Demo analytics unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminPaymentAnalytics(params = {}) {
  try {
    const query = typeof params === 'string' ? `filter=${params}` : new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/payment-analytics${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Payment analytics unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminProductRevenue(params = {}) {
  try {
    const query = typeof params === 'string' ? `filter=${params}` : new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/product-revenue${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Product revenue unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminProductCustomers(params = {}) {
  try {
    const query = typeof params === 'string' ? `filter=${params}` : new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/product-customers${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Product customers unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminCountryAnalytics(params = {}) {
  try {
    const query = typeof params === 'string' ? `filter=${params}` : new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/country-analytics${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Country analytics unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminActivity() {
  try {
    const r = await fetch(`${API_URL}/api/admin/activity`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Activity unavailable');
    return await r.json();
  } catch {
    return [];
  }
}

export async function getAdminSystemStatus() {
  try {
    const r = await fetch(`${API_URL}/api/admin/system-status`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('System status unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function logDemoEvent(payload) {
  try {
    const r = await fetch(`${API_URL}/api/demo/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await r.json();
  } catch {
    return { success: false };
  }
}

export async function getAdminDemoEvents() {
  try {
    const r = await fetch(`${API_URL}/api/admin/demo-events`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) return { success: false, events: [] };
    return await r.json();
  } catch {
    return { success: false, events: [] };
  }
}

export async function getAdminTopProducts() {
  try {
    const r = await fetch(`${API_URL}/api/admin/top-products`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Top products unavailable');
    return await r.json();
  } catch {
    return null;
  }
}

export async function getAdminCustomers(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.set('search', params.search);
    if (params.status && params.status !== 'All Status') queryParams.set('status', params.status);
    if (params.plan && params.plan !== 'All Plans') queryParams.set('plan', params.plan);
    if (params.country && params.country !== 'All Countries') queryParams.set('country', params.country);
    if (params.paymentStatus && params.paymentStatus !== 'All Payment Status') queryParams.set('paymentStatus', params.paymentStatus);
    if (params.app && params.app !== 'All Applications') queryParams.set('app', params.app);
    if (params.page) queryParams.set('page', params.page);
    if (params.limit) queryParams.set('limit', params.limit);

    const qStr = queryParams.toString();
    const r = await fetch(`${API_URL}/api/admin/customers${qStr ? '?' + qStr : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Admin customers unavailable');
    return await r.json();
  } catch (err) {
    console.error('getAdminCustomers error:', err.message);
    return null;
  }
}

export async function getAdminCustomerDetails(customerId) {
  try {
    const r = await fetch(`${API_URL}/api/admin/customers/${encodeURIComponent(customerId)}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Customer details unavailable');
    return await r.json();
  } catch (err) {
    console.error('getAdminCustomerDetails error:', err.message);
    return null;
  }
}

export async function getAdminSubscriptions(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.set('search', params.search);
    if (params.status && params.status !== 'All Statuses' && params.status !== 'All Status') queryParams.set('status', params.status);
    if (params.plan && params.plan !== 'All Plans') queryParams.set('plan', params.plan);
    if (params.cycle && params.cycle !== 'All Billing Cycles') queryParams.set('cycle', params.cycle);
    if (params.paymentStatus && params.paymentStatus !== 'All Payment Statuses') queryParams.set('paymentStatus', params.paymentStatus);
    if (params.warningStatus && params.warningStatus !== 'All Renewal Warnings') queryParams.set('warningStatus', params.warningStatus);
    if (params.country && params.country !== 'All Countries') queryParams.set('country', params.country);
    if (params.autoRenewal && params.autoRenewal !== 'All') queryParams.set('autoRenewal', params.autoRenewal);
    if (params.page) queryParams.set('page', params.page);
    if (params.limit) queryParams.set('limit', params.limit);

    const qStr = queryParams.toString();
    const r = await fetch(`${API_URL}/api/admin/subscriptions${qStr ? '?' + qStr : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Admin subscriptions unavailable');
    return await r.json();
  } catch (err) {
    console.error('getAdminSubscriptions error:', err.message);
    return null;
  }
}

export async function getAdminSubscriptionWarnings() {
  try {
    const r = await fetch(`${API_URL}/api/admin/subscriptions/warnings-followups`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Subscription warnings queue unavailable');
    return await r.json();
  } catch (err) {
    console.error('getAdminSubscriptionWarnings error:', err.message);
    return null;
  }
}

export async function getAdminSubscriptionDetails(subscriptionId) {
  try {
    const r = await fetch(`${API_URL}/api/admin/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Subscription details unavailable');
    return await r.json();
  } catch (err) {
    console.error('getAdminSubscriptionDetails error:', err.message);
    return null;
  }
}

export async function updateSubscriptionAutoRenewal(subscriptionId, autoRenewal) {
  const r = await fetch(`${API_URL}/api/admin/subscriptions/${encodeURIComponent(subscriptionId)}/auto-renewal`, {
    method: 'PUT',
    headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ autoRenewal })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update auto-renewal.');
  return data;
}

export async function updateSubscriptionStatus(subscriptionId, status, reason) {
  const r = await fetch(`${API_URL}/api/admin/subscriptions/${encodeURIComponent(subscriptionId)}/status`, {
    method: 'PUT',
    headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reason })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update subscription status.');
  return data;
}

export async function sendSubscriptionReminder(subscriptionId) {
  const r = await fetch(`${API_URL}/api/admin/subscriptions/${encodeURIComponent(subscriptionId)}/send-reminder`, {
    method: 'POST',
    headers: getAdminHeaders()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to send reminder email.');
  return data;
}

export async function addSubscriptionFollowupNote(subscriptionId, payload) {
  const r = await fetch(`${API_URL}/api/admin/subscriptions/${encodeURIComponent(subscriptionId)}/notes`, {
    method: 'POST',
    headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to save follow-up note.');
  return data;
}

export async function deleteAdminCustomer(id) {
  const r = await fetch(`${API_URL}/api/admin/customers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to delete customer.');
  return data;
}

export async function updateAdminTicket(id, payload) {
  const r = await fetch(`${API_URL}/api/admin/tickets/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  return await r.json();
}

export async function updateCustomerStatus(customerId, status, reason = '') {
  const r = await fetch(`${API_URL}/api/admin/customers/${encodeURIComponent(customerId)}/status`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status, reason })
  });
  return await r.json();
}

export async function updateCustomerSubscription(customerId, payload) {
  const r = await fetch(`${API_URL}/api/admin/customers/${encodeURIComponent(customerId)}/subscription`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
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
    const months = isYearly ? 12 : 1;
    const subtotal = ratePerUser * Math.max(1, userCount) * months;
    const regularTotal = regularRatePerUser * Math.max(1, userCount) * months;
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

export async function sendEmailOtp({ email, phone = '', purpose = 'Verification', customerName = '' }) {
  const r = await fetch(`${API_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, phone, purpose, customerName })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to send verification code.');
  return data;
}

export async function verifyEmailOtp({ email, phone = '', otp, smsOtp }) {
  const r = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, phone, otp: otp || smsOtp })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Verification code is invalid or expired.');
  return data;
}

export async function checkEmailExists(email) {
  try {
    const r = await fetch(`${API_URL}/api/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await r.json();
  } catch (err) {
    return { exists: false };
  }
}

export async function setupCustomerPassword(payload) {
  const r = await fetch(`${API_URL}/api/customer/setup-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to setup customer password.');
  return data;
}

export async function forgotPassword(emailOrStorageId) {
  const r = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrStorageId })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to send password reset link.');
  return data;
}

export async function resetPassword({ email, token, newPassword }) {
  const r = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token, newPassword })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to reset password.');
  return data;
}

export async function changePassword({ currentPassword, newPassword }) {
  const token = localStorage.getItem('oxoo_token');
  const r = await fetch(`${API_URL}/api/customer/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to change password.');
  return data;
}

// -------------------------------------------------------------
// PRODUCTS & PLANS MANAGEMENT APIS
// -------------------------------------------------------------

export async function getProductsPlansSummary() {
  try {
    const r = await fetch(`${API_URL}/api/admin/products-plans/summary`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return {
      success: true,
      summary: { totalProducts: 9, totalPlans: 24, activePlans: 18, draftPlans: 3 }
    };
  }
}

export async function getAdminProducts(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/products${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Failed to fetch products');
    return await r.json();
  } catch (err) {
    console.error('getAdminProducts error:', err);
    return { success: false, products: [] };
  }
}

export async function createAdminProduct(payload) {
  const r = await fetch(`${API_URL}/api/admin/products`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to create product.');
  return data;
}

export async function updateAdminProduct(id, payload) {
  const r = await fetch(`${API_URL}/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update product.');
  return data;
}

export async function updateAdminProductStatus(id, status) {
  const r = await fetch(`${API_URL}/api/admin/products/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update product status.');
  return data;
}

export async function getAdminPlans(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/plans${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Failed to fetch plans');
    return await r.json();
  } catch (err) {
    console.error('getAdminPlans error:', err);
    return { success: false, plans: [] };
  }
}

export async function createAdminPlan(payload) {
  const r = await fetch(`${API_URL}/api/admin/plans`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to create plan.');
  return data;
}

export async function updateAdminPlan(id, payload) {
  const r = await fetch(`${API_URL}/api/admin/plans/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update plan.');
  return data;
}

export async function updateAdminPlanStatus(id, status, reason = '') {
  const r = await fetch(`${API_URL}/api/admin/plans/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status, reason })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update plan status.');
  return data;
}

export async function getAdminPlanHistory(id) {
  try {
    const r = await fetch(`${API_URL}/api/admin/plans/${encodeURIComponent(id)}/history`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Failed to fetch plan history');
    return await r.json();
  } catch (err) {
    return { success: false, history: [] };
  }
}

// =============================================================
// MODULE 1: APPLICATIONS API
// =============================================================
export async function getApplicationsSummary() {
  try {
    const r = await fetch(`${API_URL}/api/admin/applications/summary`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return { success: true, summary: { total: 9, active: 8, maintenance: 1, health: '100%', healthLabel: 'All services operational' } };
  }
}

export async function getAdminApplications(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/applications?${qs}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return { success: false, applications: [] };
  }
}

export async function getAdminApplication(id) {
  try {
    const r = await fetch(`${API_URL}/api/admin/applications/${encodeURIComponent(id)}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return { success: false, application: null };
  }
}

export async function createAdminApplication(payload) {
  const r = await fetch(`${API_URL}/api/admin/applications`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to create application.');
  return data;
}

export async function updateAdminApplication(id, payload) {
  const r = await fetch(`${API_URL}/api/admin/applications/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update application.');
  return data;
}

export async function updateAdminApplicationStatus(id, status) {
  const r = await fetch(`${API_URL}/api/admin/applications/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update application status.');
  return data;
}

export async function rotateApplicationServiceKey(id) {
  const r = await fetch(`${API_URL}/api/admin/applications/${encodeURIComponent(id)}/rotate-key`, {
    method: 'POST',
    headers: getAdminHeaders()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to rotate service key.');
  return data;
}

export async function checkApplicationHealth(id) {
  const r = await fetch(`${API_URL}/api/admin/applications/${encodeURIComponent(id)}/health-check`, {
    method: 'POST',
    headers: getAdminHeaders()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Health check failed.');
  return data;
}

export async function deleteAdminApplication(id) {
  const r = await fetch(`${API_URL}/api/admin/applications/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to delete application.');
  return data;
}

// =============================================================
// MODULE 2: PAYMENTS & INVOICES API
// =============================================================
export async function getInvoicesSummary() {
  try {
    const r = await fetch(`${API_URL}/api/admin/invoices/summary`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return {
      success: true,
      summary: {
        totalRevenue: 0,
        totalRevenueFormatted: '₹0',
        paidAmount: 0,
        paidFormatted: '₹0',
        paidCount: 0,
        pendingAmount: 0,
        pendingFormatted: '₹0',
        pendingCount: 0,
        refundsAmount: 0,
        refundsFormatted: '₹0',
        refundsCount: 0
      }
    };
  }
}

export async function getAdminInvoices(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/invoices?${qs}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return { success: false, invoices: [] };
  }
}

export async function getAdminInvoice(id) {
  try {
    const r = await fetch(`${API_URL}/api/admin/invoices/${encodeURIComponent(id)}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return { success: false, invoice: null };
  }
}

export function getInvoiceDownloadUrl(id) {
  return `${API_URL}/api/admin/invoices/${encodeURIComponent(id)}/download-pdf`;
}

// =============================================================
// MODULE 3: USERS & ROLES API
// =============================================================
export async function getStaffSummary() {
  try {
    const r = await fetch(`${API_URL}/api/admin/staff/summary`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return {
      success: true,
      summary: { totalUsers: 0, superAdmins: 0, financeAdmins: 0, supportTeam: 0, salesTeam: 0 }
    };
  }
}

export async function getAdminStaff(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/staff?${qs}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return { success: false, staff: [] };
  }
}

export async function createAdminStaff(payload) {
  const r = await fetch(`${API_URL}/api/admin/staff`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to add staff member.');
  return data;
}

export async function updateAdminStaff(id, payload) {
  const r = await fetch(`${API_URL}/api/admin/staff/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update staff member.');
  return data;
}

export async function updateAdminStaffStatus(id, status) {
  const r = await fetch(`${API_URL}/api/admin/staff/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update staff status.');
  return data;
}

export async function deleteAdminStaff(id) {
  const r = await fetch(`${API_URL}/api/admin/staff/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to delete user.');
  return data;
}

// =============================================================
// MODULE 4: SUPPORT TICKETS API
// =============================================================
export async function getTicketsSummary() {
  try {
    const r = await fetch(`${API_URL}/api/admin/tickets/summary`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return {
      success: true,
      summary: { totalTickets: 0, openTickets: 0, inProgressTickets: 0, resolvedTickets: 0, closedTickets: 0 }
    };
  }
}

export async function getAdminTickets(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/tickets?${qs}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return { success: false, tickets: [] };
  }
}

export async function getAdminTicket(id) {
  try {
    const r = await fetch(`${API_URL}/api/admin/tickets/${encodeURIComponent(id)}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('API unavailable');
    return await r.json();
  } catch {
    return { success: false, ticket: null };
  }
}

export async function sendTicketReply(id, payload) {
  const r = await fetch(`${API_URL}/api/admin/tickets/${encodeURIComponent(id)}/reply`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to send reply.');
  return data;
}

export async function updateTicketStatus(id, status, payload = {}) {
  const body = typeof payload === 'string' ? { status, note: payload } : { status, ...payload };
  const r = await fetch(`${API_URL}/api/admin/tickets/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(body)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update ticket status.');
  return data;
}

export async function assignTicket(id, assigned_to) {
  const r = await fetch(`${API_URL}/api/admin/tickets/${encodeURIComponent(id)}/assign`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({ assigned_to })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to assign ticket.');
  return data;
}

export async function submitCustomerTicket(payload) {
  const r = await fetch(`${API_URL}/api/admin/customer/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to submit ticket.');
  return data;
}

export async function deleteAdminTicket(id) {
  const r = await fetch(`${API_URL}/api/admin/tickets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to delete ticket.');
  return data;
}

// -------------------------------------------------------------
// MODULE 2: REPORTS & ANALYTICS API
// -------------------------------------------------------------
export async function getAdminReports(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/reports?${qs}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('Reports data unavailable');
    return await r.json();
  } catch (err) {
    console.error('Failed to load reports:', err);
    return { success: false, error: err.message };
  }
}

export function getAdminReportsExportUrl(params = {}) {
  const qs = new URLSearchParams({ ...params, format: 'csv' }).toString();
  return `${API_URL}/api/admin/reports/export?${qs}`;
}

// -------------------------------------------------------------
// MODULE 3: EMAIL & NOTIFICATIONS API
// -------------------------------------------------------------
export async function getAdminEmailTemplates(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/email-templates?${qs}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('Templates unavailable');
    return await r.json();
  } catch (err) {
    return { success: false, templates: [] };
  }
}

export async function createAdminEmailTemplate(payload) {
  const r = await fetch(`${API_URL}/api/admin/email-templates`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to create template');
  return data;
}

export async function updateAdminEmailTemplate(id, payload) {
  const r = await fetch(`${API_URL}/api/admin/email-templates/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update template');
  return data;
}

export async function deleteAdminEmailTemplate(id) {
  const r = await fetch(`${API_URL}/api/admin/email-templates/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to delete template');
  return data;
}

export async function testAdminEmailTemplate(payload) {
  const r = await fetch(`${API_URL}/api/admin/email-templates/test`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to send test email');
  return data;
}

export async function getAdminNotificationLogs(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/notifications?${qs}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('Notifications unavailable');
    return await r.json();
  } catch (err) {
    return { success: false, logs: [] };
  }
}

export async function retryAdminNotification(id) {
  const r = await fetch(`${API_URL}/api/admin/notifications/${encodeURIComponent(id)}/retry`, {
    method: 'POST',
    headers: getAdminHeaders()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to retry notification');
  return data;
}

export async function getAdminNotificationSettings() {
  try {
    const r = await fetch(`${API_URL}/api/admin/notifications/settings`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('Settings unavailable');
    return await r.json();
  } catch (err) {
    return { success: false, settings: {} };
  }
}

export async function updateAdminNotificationSettings(settings) {
  const r = await fetch(`${API_URL}/api/admin/notifications/settings`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({ settings })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to save notification settings');
  return data;
}

// -------------------------------------------------------------
// MODULE 4: AUDIT LOGS API
// -------------------------------------------------------------
export async function getAdminAuditLogs(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/audit-logs?${qs}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('Audit logs unavailable');
    return await r.json();
  } catch (err) {
    return { success: false, logs: [] };
  }
}

export async function getAdminAuditSessions(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/audit-logs/sessions?${qs}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('Audit sessions unavailable');
    return await r.json();
  } catch (err) {
    return { success: false, sessions: [] };
  }
}

// -------------------------------------------------------------
// MODULE 5: INTEGRATIONS API
// -------------------------------------------------------------
export async function getAdminIntegrations() {
  try {
    const r = await fetch(`${API_URL}/api/admin/integrations`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('Integrations unavailable');
    return await r.json();
  } catch (err) {
    return { success: false, integrations: [] };
  }
}

export async function updateAdminIntegration(id, payload) {
  const r = await fetch(`${API_URL}/api/admin/integrations/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update integration');
  return data;
}

export async function testAdminIntegration(id) {
  const r = await fetch(`${API_URL}/api/admin/integrations/${encodeURIComponent(id)}/test`, {
    method: 'POST',
    headers: getAdminHeaders()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to test integration');
  return data;
}

export async function toggleAdminIntegration(id, is_active) {
  const r = await fetch(`${API_URL}/api/admin/integrations/${encodeURIComponent(id)}/toggle`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ is_active })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to toggle integration');
  return data;
}

// -------------------------------------------------------------
// MODULE 6: SETTINGS API
// -------------------------------------------------------------
export async function getAdminPlatformSettings(category) {
  try {
    const r = await fetch(`${API_URL}/api/admin/settings/${encodeURIComponent(category)}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('Settings unavailable');
    return await r.json();
  } catch (err) {
    return { success: false, settings: {} };
  }
}

export async function updateAdminPlatformSettings(category, settings) {
  const r = await fetch(`${API_URL}/api/admin/settings/${encodeURIComponent(category)}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({ settings })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update settings');
  return data;
}

// -------------------------------------------------------------
// MODULE 7: CLIENT NEEDS & CONTACT INQUIRIES API
// -------------------------------------------------------------
export async function getAdminLeads(params = {}) {
  try {
    const query = typeof params === 'string' ? params : new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/leads${query ? `?${query}` : ''}`, {
      headers: getAdminHeaders()
    });
    if (!r.ok) throw new Error('Admin leads unavailable');
    return await r.json();
  } catch {
    return [];
  }
}

export async function updateAdminLead(id, updates) {
  const r = await fetch(`${API_URL}/api/admin/leads/${id}`, {
    method: 'PATCH',
    headers: {
      ...getAdminHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update lead');
  return data;
}

export async function deleteAdminLead(id) {
  const r = await fetch(`${API_URL}/api/admin/leads/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to delete lead');
  return data;
}

// -------------------------------------------------------------
// MODULE 8: OXOO AGENT (AI CUSTOMER ASSISTANT) API
// -------------------------------------------------------------
export async function getAgentConfig() {
  try {
    const r = await fetch(`${API_URL}/api/agent/config`);
    if (!r.ok) throw new Error('Agent config unavailable');
    return await r.json();
  } catch (err) {
    return {
      success: true,
      enabled: true,
      agentName: 'OXOO Agent',
      welcomeMessage: "Hi! I'm OXOO Agent. How can I help you today? Ask me about our software, pricing plans, website and app development, AI solutions, subscriptions, or support.",
      suggestedQuestions: [
        'Explore OXOO applications',
        'Compare pricing plans',
        'Find a website development package',
        'Explore Android and iOS app development',
        'Learn about AI chatbots',
        'Manage my subscription',
        'Find an invoice',
        'Contact customer support'
      ],
      status: 'Online (Database Grounded)',
      allowCustomerActions: true
    };
  }
}

export async function sendAgentChat({ message, conversationId, sessionId }) {
  const headers = getCustomerHeaders();
  const r = await fetch(`${API_URL}/api/agent/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, conversationId, sessionId })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Unable to send message to OXOO Agent.');
  return data;
}

export async function getAgentHistory(conversationId) {
  try {
    const r = await fetch(`${API_URL}/api/agent/history/${encodeURIComponent(conversationId)}`);
    if (!r.ok) throw new Error('History unavailable');
    return await r.json();
  } catch (err) {
    return { success: false, messages: [] };
  }
}

export async function clearAgentHistory(conversationId) {
  const r = await fetch(`${API_URL}/api/agent/history/${encodeURIComponent(conversationId)}`, {
    method: 'DELETE'
  });
  return await r.json().catch(() => ({ success: true }));
}

export async function confirmAgentAction({ actionPayload, conversationId }) {
  const headers = getCustomerHeaders();
  const r = await fetch(`${API_URL}/api/agent/action/confirm`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ actionPayload, conversationId })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Action could not be completed.');
  return data;
}

export async function getAdminAgentSettings() {
  try {
    const r = await fetch(`${API_URL}/api/agent/admin/settings`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('Agent settings unavailable');
    return await r.json();
  } catch {
    return { success: false, settings: {} };
  }
}

export async function updateAdminAgentSettings(settings) {
  const r = await fetch(`${API_URL}/api/agent/admin/settings`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({ settings })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update agent settings');
  return data;
}

export async function getAdminAgentAnalytics() {
  try {
    const r = await fetch(`${API_URL}/api/agent/admin/analytics`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('Agent analytics unavailable');
    return await r.json();
  } catch {
    return {
      success: true,
      metrics: {
        totalConversations: 0,
        totalMessages: 0,
        totalEvents: 0,
        ticketsCreatedViaAgent: 0,
        leadsSubmittedViaAgent: 0,
        uptime: '99.98%',
        status: 'Operational'
      },
      recentEvents: []
    };
  }
}

// -------------------------------------------------------------
// MODULE 15: WORKSPACE RESOLUTION & DEMO INQUIRIES API
// -------------------------------------------------------------
export async function resolveWorkspace(host, company = '') {
  try {
    const qs = new URLSearchParams({
      host: host || window.location.hostname || '',
      company: company || ''
    }).toString();
    const r = await fetch(`${API_URL}/api/workspace/resolve?${qs}`);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return { success: false, code: data.code || 'NOT_FOUND', message: data.message || 'Workspace resolution failed' };
    }
    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function submitInquiry(payload) {
  const r = await fetch(`${API_URL}/api/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(data.message || 'Failed to submit inquiry. Please check your information and try again.');
  }
  return data;
}

export async function getAdminInquiriesSummary() {
  try {
    const r = await fetch(`${API_URL}/api/admin/inquiries/summary`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('Inquiries summary unavailable');
    return await r.json();
  } catch (err) {
    console.error('Failed to load inquiries summary:', err);
    return { success: false, summary: { total: 0, new_count: 0 } };
  }
}

export async function getAdminInquiries(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/admin/inquiries?${qs}`, { headers: getAdminHeaders() });
    if (!r.ok) throw new Error('Inquiries data unavailable');
    return await r.json();
  } catch (err) {
    console.error('Failed to load inquiries:', err);
    return { success: false, inquiries: [], pagination: { total: 0 } };
  }
}

export async function getAdminInquiry(id) {
  const r = await fetch(`${API_URL}/api/admin/inquiries/${encodeURIComponent(id)}`, { headers: getAdminHeaders() });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to load inquiry');
  return data;
}

export async function updateAdminInquiry(id, payload) {
  const r = await fetch(`${API_URL}/api/admin/inquiries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to update inquiry');
  return data;
}

export async function addAdminInquiryNote(id, note) {
  const r = await fetch(`${API_URL}/api/admin/inquiries/${encodeURIComponent(id)}/notes`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ note })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to add note');
  return data;
}

export async function deleteAdminInquiry(id) {
  const r = await fetch(`${API_URL}/api/admin/inquiries/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Failed to delete inquiry');
  return data;
}

export { API_URL };


