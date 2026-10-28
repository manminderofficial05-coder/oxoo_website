/**
 * OXOO.ai — Tab-Isolated Authentication Storage Helper
 * 
 * Enforces strict per-tab session isolation using sessionStorage.
 * In compliance with browser security specifications:
 * - Sessions are isolated to the specific active browser tab.
 * - Copying a dashboard URL and pasting it into another tab or window
 *   creates an empty sessionStorage context, preventing direct access
 *   and requiring the user to authenticate on that tab.
 * - Sessions cleanly survive page reloads and refreshes within the same tab.
 */

// Initial cleanup: ensure legacy tokens in localStorage do not leak across tabs
try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('oxoo_token');
    localStorage.removeItem('oxoo_user');
    localStorage.removeItem('oxoo_admin_token');
    localStorage.removeItem('oxoo_admin_user');
  }
} catch (e) {}

export const authStorage = {
  // -------------------------------------------------------------
  // Customer Session Handlers (Tab-Isolated)
  // -------------------------------------------------------------
  getCustomerToken: () => {
    try {
      return sessionStorage.getItem('oxoo_token') || '';
    } catch (e) {
      return '';
    }
  },

  getCustomerUser: () => {
    try {
      const raw = sessionStorage.getItem('oxoo_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  setCustomerSession: (token, user) => {
    try {
      if (token) sessionStorage.setItem('oxoo_token', token);
      if (user) {
        const str = typeof user === 'string' ? user : JSON.stringify(user);
        sessionStorage.setItem('oxoo_user', str);
      }
      // Purge any localStorage remnants
      localStorage.removeItem('oxoo_token');
      localStorage.removeItem('oxoo_user');
    } catch (e) {}
  },

  clearCustomerSession: () => {
    try {
      sessionStorage.removeItem('oxoo_token');
      sessionStorage.removeItem('oxoo_user');
      localStorage.removeItem('oxoo_token');
      localStorage.removeItem('oxoo_user');
    } catch (e) {}
  },

  // -------------------------------------------------------------
  // Admin Session Handlers (Tab-Isolated)
  // -------------------------------------------------------------
  getAdminToken: () => {
    try {
      return sessionStorage.getItem('oxoo_admin_token') || '';
    } catch (e) {
      return '';
    }
  },

  getAdminUser: () => {
    try {
      const raw = sessionStorage.getItem('oxoo_admin_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  setAdminSession: (token, user) => {
    try {
      if (token) sessionStorage.setItem('oxoo_admin_token', token);
      if (user) {
        const str = typeof user === 'string' ? user : JSON.stringify(user);
        sessionStorage.setItem('oxoo_admin_user', str);
      }
      // Purge any localStorage remnants
      localStorage.removeItem('oxoo_admin_token');
      localStorage.removeItem('oxoo_admin_user');
    } catch (e) {}
  },

  clearAdminSession: () => {
    try {
      sessionStorage.removeItem('oxoo_admin_token');
      sessionStorage.removeItem('oxoo_admin_user');
      localStorage.removeItem('oxoo_admin_token');
      localStorage.removeItem('oxoo_admin_user');
    } catch (e) {}
  },

  // -------------------------------------------------------------
  // Global Clear (Used on Logout)
  // -------------------------------------------------------------
  clearAll: () => {
    try {
      sessionStorage.removeItem('oxoo_token');
      sessionStorage.removeItem('oxoo_user');
      sessionStorage.removeItem('oxoo_admin_token');
      sessionStorage.removeItem('oxoo_admin_user');
      localStorage.removeItem('oxoo_token');
      localStorage.removeItem('oxoo_user');
      localStorage.removeItem('oxoo_admin_token');
      localStorage.removeItem('oxoo_admin_user');
    } catch (e) {}
  }
};

export default authStorage;
