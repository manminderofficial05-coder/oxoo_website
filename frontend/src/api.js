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
  const r = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || 'Invalid login credentials.');
  return data;
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

export { API_URL };

