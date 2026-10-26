import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Layers, CreditCard, Users, HelpCircle, Settings,
  Search, Bell, ChevronDown, Check, ArrowRight, ExternalLink,
  Crown, BarChart2, FileText, Receipt, UserCheck, Globe, Megaphone,
  CheckCircle2, AlertCircle, Plus, Download, X, Shield, Lock,
  Mail, Phone, Clock, MessageSquare, RefreshCw, Filter, Sparkles,
  Laptop, Cpu, LogOut, Building, Trash2, UserPlus, Send, Calendar,
  Smartphone, ChevronRight, MoreHorizontal, Eye, ShieldCheck, CheckSquare,
  FileSpreadsheet, Upload, History, AlertTriangle
} from 'lucide-react';
import {
  getCustomerOverview, getCustomerBilling, upgradeCustomerPlan,
  getCustomerTeam, inviteTeamMember, removeTeamMember,
  getCustomerTickets, createCustomerTicket, changePassword
} from './api';
import './dashboards.css';

// Live Customer Brand Logo Preview Badge
function CustomerBrandBadge({ companyName }) {
  const cleanName = (companyName || 'RetailMart Solutions').replace(/\.(oxoo|com|ai)$/i, '').trim();
  const initial = cleanName.charAt(0).toUpperCase() || 'R';
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 12px',
      background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(56, 189, 248, 0.14) 100%)',
      border: '1px solid rgba(56, 189, 248, 0.4)',
      borderRadius: '20px'
    }}>
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
      }}>
        {initial}
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
        {cleanName}.oxoo
      </span>
    </div>
  );
}

export default function CustomerDashboard() {
  const navigate = useNavigate();

  // Navigation tabs:
  // 'dashboard' | 'apps' | 'billing' | 'team' | 'support' | 'reports' | 'notifications' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sub-tabs
  const [settingsSubTab, setSettingsSubTab] = useState('account'); // 'account' | 'security' | 'preferences'
  const [billingSubTab, setBillingSubTab] = useState('invoices'); // 'invoices' | 'payment_history' | 'subscription_details'
  const [ticketFilter, setTicketFilter] = useState('all'); // 'all' | 'open' | 'in_progress' | 'resolved' | 'closed'
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'payments' | 'team' | 'support' | 'system'
  const [appStatusFilter, setAppStatusFilter] = useState('all'); // 'all' | 'active' | 'not_purchased'
  const [appCategoryFilter, setAppCategoryFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState('all');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');

  // Modals & Popovers
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [changePwdModalOpen, setChangePwdModalOpen] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Password & Security State
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [twoFaEnabled, setTwoFaEnabled] = useState(true);

  // Settings & Preferences State
  const [prefAccountUpdates, setPrefAccountUpdates] = useState(true);
  const [prefProductUpdates, setPrefProductUpdates] = useState(true);
  const [prefMarketing, setPrefMarketing] = useState(false);
  const [prefLanguage, setPrefLanguage] = useState('English');
  const [prefTimezone, setPrefTimezone] = useState('(GMT+05:30) Asia/Kolkata');
  const [prefCurrency, setPrefCurrency] = useState('INR (₹)');
  const [prefDateFormat, setPrefDateFormat] = useState('DD/MM/YYYY');
  const [prefNumberFormat, setPrefNumberFormat] = useState('1,234.56');
  const [prefDefaultApp, setPrefDefaultApp] = useState('Sales Software');
  const [prefDashboardLayout, setPrefDashboardLayout] = useState('Standard');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: 'Priya Sharma',
    email: 'priya@retailmart.com',
    phone: '+91 98765 43210',
    company: 'RetailMart Solutions',
    website: 'https://retailmart.com',
    country: 'India'
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Invite Form State
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'Member',
    access: 'All Applications'
  });

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Technical',
    priority: 'Normal',
    application: 'Sales Software',
    description: '',
    attachment: null
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Canonical Records matching User Specifications
  const defaultInvoices = [
    { id: '1', invoice_number: 'INV-2026-06114197', date: '21 Oct 2026', plan: 'Single Software', amount: '₹660.8', status: 'Paid' },
    { id: '2', invoice_number: 'INV-2026-27619112', date: '01 Oct 2026', plan: 'Single Software', amount: '₹7,929.6', status: 'Paid' },
    { id: '3', invoice_number: 'INV-2025-10482021', date: '21 Sep 2026', plan: 'Single Software', amount: '₹660.8', status: 'Paid' },
    { id: '4', invoice_number: 'INV-2025-08746100', date: '21 Aug 2026', plan: 'Single Software', amount: '₹660.8', status: 'Paid' }
  ];

  const defaultTeamMembers = [
    { id: '1', name: 'Priya Sharma (You)', email: 'priya@retailmart.com', role: 'Owner', status: 'Active', joined: '01 Oct 2026' },
    { id: '2', name: 'Rahul Mehta', email: 'rahul@retailmart.com', role: 'Admin', status: 'Active', joined: '12 Oct 2026' },
    { id: '3', name: 'Sneha Gupta', email: 'sneha@retailmart.com', role: 'Member', status: 'Active', joined: '15 Oct 2026' },
    { id: '4', name: 'Amit Verma', email: 'amit@retailmart.com', role: 'Member', status: 'Pending', joined: '22 Oct 2026' }
  ];

  const defaultTickets = [
    { id: '1', number: 'OXOO-1283', subject: 'Login issue in Sales App', category: 'Technical', status: 'Open', created: '23 Oct 2026' },
    { id: '2', number: 'OXOO-1282', subject: 'Invoice not generating', category: 'Billing', status: 'In Progress', created: '21 Oct 2026' },
    { id: '3', number: 'OXOO-1256', subject: 'Request for new user', category: 'Account', status: 'Resolved', created: '17 Oct 2026' },
    { id: '4', number: 'OXOO-1234', subject: 'Feature request: Reports', category: 'Feature Request', status: 'Closed', created: '12 Oct 2026' }
  ];

  const defaultNotifications = [
    { id: '1', title: 'Payment Received', desc: 'Your payment of ₹660.8 was successful.', date: '21 Oct 2026, 12:16 PM', category: 'payments', read: false },
    { id: '2', title: 'New Team Member', desc: 'Rahul Mehta has been added to your team.', date: '20 Oct 2026, 11:42 AM', category: 'team', read: false },
    { id: '3', title: 'Support Ticket Updated', desc: 'Ticket #OXOO-1282 status changed to In Progress.', date: '20 Oct 2026, 10:15 AM', category: 'support', read: false },
    { id: '4', title: 'Application Access', desc: 'You have been granted access to Sales Software.', date: '20 Oct 2026, 09:45 AM', category: 'system', read: false },
    { id: '5', title: 'Invoice Generated', desc: 'New invoice INV-2026-06114197 has been generated.', date: '20 Oct 2026, 09:30 AM', category: 'payments', read: false }
  ];

  // Base software directory catalog across all OXOO multi-app offerings
  const BASE_DIRECTORY_APPS = [
    {
      id: 'sales',
      name: 'Sales Software',
      desc: 'Business management & sales tracking',
      color: 'blue'
    },
    {
      id: 'hrms',
      name: 'HRMS',
      desc: 'Employee management system',
      color: 'purple'
    },
    {
      id: 'finance',
      name: 'Finance',
      desc: 'Accounting, invoicing & reports',
      color: 'green'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      desc: 'Email campaigns & marketing tools',
      color: 'orange'
    }
  ];

  // Helper to accurately match an app against a customer's purchased app entitlements
  const isAppPurchased = (appId, appName, purchasedList = [], planName = '') => {
    const plan = String(planName || '').toLowerCase();
    // Enterprise / Unlimited plans unlock all software
    if (plan.includes('enterprise') || plan.includes('all apps') || plan.includes('unlimited')) {
      return true;
    }
    if (!Array.isArray(purchasedList) || purchasedList.length === 0) return false;

    const idLower = String(appId || '').toLowerCase().trim();
    const nameLower = String(appName || '').toLowerCase().trim();

    return purchasedList.some(item => {
      if (!item) return false;
      const str = (typeof item === 'string' ? item : (item.name || item.id || '')).toLowerCase().trim();
      if (!str) return false;

      if (str === idLower || str === nameLower) return true;
      if (idLower === 'finance' && (str.includes('finance') || str.includes('account'))) return true;
      if (idLower === 'sales' && str.includes('sale')) return true;
      if (idLower === 'hrms' && (str.includes('hrms') || str.includes('hr') || str.includes('human'))) return true;
      if (idLower === 'marketing' && str.includes('market')) return true;
      if (nameLower.includes(str) || str.includes(nameLower)) return true;
      return false;
    });
  };

  // User purchased apps state
  const [userPurchasedApps, setUserPurchasedApps] = useState(() => {
    try {
      const su = localStorage.getItem('oxoo_user');
      if (su) {
        const u = JSON.parse(su);
        if (u.purchasedApps && u.purchasedApps.length > 0) return u.purchasedApps;
        if (u.apps && u.apps.length > 0) return u.apps;
        if (u.active_apps && u.active_apps.length > 0) return u.active_apps;
      }
      const lo = localStorage.getItem('oxoo_last_order');
      if (lo) {
        const o = JSON.parse(lo);
        if (o.apps && o.apps.length > 0) return o.apps;
        if (o.purchasedApps && o.purchasedApps.length > 0) return o.purchasedApps;
      }
    } catch (e) {}
    return ['Finance Software'];
  });

  // Overview Data
  const [overview, setOverview] = useState({
    customerName: 'Customer',
    company: 'RetailMart Solutions',
    email: 'customer@oxoo.ai',
    avatar: 'C',
    currentPlan: 'Single Software',
    nextBillingDate: '30 Days',
    nextBillingExact: '30 Nov 2026',
    monthlyPrice: '₹660.8 / month',
    cardEnding: '4242',
    cardExpiry: '12/2028',
    activeAppsCount: 1,
    teamMembersCount: 1,
    monthlyUsage: 1420,
    openTicketsCount: 0,
    storageId: 'STG-08643413'
  });

  // Dynamically compute allDirectoryApps: ONLY purchased software is Active / Entitled (unlocked)
  // All unpurchased software is Not Purchased / Locked
  const allDirectoryApps = BASE_DIRECTORY_APPS.map(app => {
    const entitled = isAppPurchased(app.id, app.name, userPurchasedApps, overview.currentPlan);
    return {
      ...app,
      status: entitled ? 'Active' : 'Not Purchased',
      entitled: Boolean(entitled),
      purchasedDate: entitled ? (app.id === 'finance' ? '21 Oct 2026' : (app.id === 'sales' ? '01 Oct 2026' : '12 Sep 2026')) : null
    };
  });

  const [teamMembers, setTeamMembers] = useState(defaultTeamMembers);
  const [tickets, setTickets] = useState(defaultTickets);
  const [notifications, setNotifications] = useState(defaultNotifications);

  // Sync with local session or customized demo logo and fetch real backend overview
  useEffect(() => {
    async function hydrateCustomer() {
      try {
        let storedUser = null;
        try {
          const su = localStorage.getItem('oxoo_user');
          if (su) storedUser = JSON.parse(su);
        } catch (e) {}

        const customCompany = localStorage.getItem('oxoo_demo_company') || localStorage.getItem('oxoo_company_name');

        let effectiveName = storedUser?.name || 'Customer';
        let effectiveComp = customCompany || storedUser?.organization || storedUser?.company || 'My Organization';
        let effectiveEmail = storedUser?.email || 'customer@oxoo.ai';
        let effectivePlan = storedUser?.plan || 'Single Software';

        // Extract apps from stored user or last order or recent customers
        let appsList = storedUser?.purchasedApps || storedUser?.apps || storedUser?.active_apps || [];

        if (!appsList || appsList.length === 0) {
          try {
            const lo = localStorage.getItem('oxoo_last_order');
            if (lo) {
              const parsed = JSON.parse(lo);
              if (parsed.apps && parsed.apps.length > 0) appsList = parsed.apps;
              else if (parsed.purchasedApps && parsed.purchasedApps.length > 0) appsList = parsed.purchasedApps;
            }
          } catch (e) {}
        }

        if (!appsList || appsList.length === 0) {
          try {
            const rc = localStorage.getItem('oxoo_recent_customers');
            if (rc) {
              const list = JSON.parse(rc);
              const match = list.find(c =>
                (effectiveComp && c.company && c.company.toLowerCase() === effectiveComp.toLowerCase()) ||
                (effectiveEmail && c.email && c.email.toLowerCase() === effectiveEmail.toLowerCase())
              );
              if (match && match.apps && match.apps.length > 0) {
                appsList = match.apps;
              }
            }
          } catch (e) {}
        }

        // Fallback default: if user email is Priya Sharma, default to Sales Software, otherwise Finance Software
        if (!appsList || appsList.length === 0) {
          if (effectiveEmail.toLowerCase().includes('priya')) {
            appsList = ['Sales Software'];
          } else {
            appsList = ['Finance Software'];
          }
        }

        setUserPurchasedApps(appsList);

        setOverview(prev => ({
          ...prev,
          customerName: effectiveName,
          company: effectiveComp,
          email: effectiveEmail,
          avatar: effectiveName.charAt(0).toUpperCase() || 'C',
          currentPlan: effectivePlan,
          activeAppsCount: appsList.length
        }));

        setProfileData(prev => ({
          ...prev,
          name: effectiveName,
          email: effectiveEmail,
          company: effectiveComp
        }));

        // Fetch fresh overview from backend API
        try {
          const apiData = await getCustomerOverview({ email: effectiveEmail, company: effectiveComp });
          if (apiData) {
            if (apiData.purchasedApps && apiData.purchasedApps.length > 0) {
              setUserPurchasedApps(apiData.purchasedApps);
            }
            setOverview(prev => ({
              ...prev,
              customerName: apiData.customerName || prev.customerName,
              company: apiData.company || prev.company,
              email: apiData.email || prev.email,
              avatar: apiData.avatar || prev.avatar,
              currentPlan: apiData.currentPlan || prev.currentPlan,
              storageId: apiData.storageId || prev.storageId,
              nextBillingDate: apiData.nextBillingDate || prev.nextBillingDate,
              activeAppsCount: (apiData.purchasedApps && apiData.purchasedApps.length > 0) ? apiData.purchasedApps.length : (appsList.length || 1),
              monthlyPrice: apiData.mrr ? `₹${Number(apiData.mrr).toLocaleString('en-IN')}` : prev.monthlyPrice,
              openTicketsCount: typeof apiData.openTicketsCount === 'number' ? apiData.openTicketsCount : prev.openTicketsCount,
              teamMembersCount: typeof apiData.teamMembersCount === 'number' ? apiData.teamMembersCount : prev.teamMembersCount
            }));
          }
        } catch (apiErr) {
          console.warn('Backend customer overview call skipped:', apiErr.message);
        }
      } catch (e) {
        console.error('Error hydrating customer data', e);
      }
    }

    hydrateCustomer();

    const handleAuthChange = () => hydrateCustomer();
    window.addEventListener('oxoo_auth_change', handleAuthChange);
    return () => window.removeEventListener('oxoo_auth_change', handleAuthChange);
  }, []);

  // Shared secret service key matching Oxoo Finance & other software
  const OXOO_FINANCE_SERVICE_KEY = "OXOO-FIN-2026-SECURE-KEY";

  // App Launch Handler: Passes Finance Service Key and automatically detects as Admin to open Admin Dashboard without login
  const handleOpenApp = (app) => {
    if (!app.entitled) {
      showToast(`${app.name} is not included in your current subscription plan.`);
      return;
    }

    const companySlug = overview.company || 'RetailMart Solutions';
    const cleanCompName = companySlug.replace(/\.(oxoo|com|ai)$/i, '');

    // Unified SSO & Service Key parameters:
    // Automatically detected by destination software as Admin, immediately opening Admin Dashboard without login
    const ssoParams = new URLSearchParams({
      service_key: OXOO_FINANCE_SERVICE_KEY,
      user: overview.email || '',
      email: overview.email || '',
      name: overview.customerName || 'Customer Admin',
      company: companySlug,
      company_name: cleanCompName,
      storage_id: overview.storageId || 'STG-08643413',
      role: 'admin',
      user_type: 'admin',
      is_admin: 'true',
      auth_role: 'admin',
      auto_login: 'true',
      login_type: 'admin',
      view: 'admin',
      target: 'admin-dashboard',
      redirect: 'dashboard',
      plan: overview.currentPlan || 'Standard Pack',
      app: app.id
    });

    // 1. Finance Software (Opens Oxoo Finance directly into Admin Dashboard)
    if (app.id === 'finance') {
      const financeUrl = `https://oxoo-finance.onrender.com/#/admin?${ssoParams.toString()}`;
      window.open(financeUrl, '_blank');
      return;
    }

    // 2. HRMS Software (Opens Oxoo Finance Employee Login)
    if (app.id === 'hrms') {
      window.open('https://oxoo-finance.onrender.com/', '_blank');
      return;
    }

    // 3. Inventory / Supply Chain Suite
    if (app.id === 'inventory' || app.id === 'supply-chain') {
      const invUrl = `/demo/supply-chain?${ssoParams.toString()}`;
      window.open(invUrl, '_blank');
      return;
    }

    // 4. Sales Suite
    if (app.id === 'sales') {
      const salesUrl = `/demo/sales?${ssoParams.toString()}`;
      window.open(salesUrl, '_blank');
      return;
    }

    // 5. Marketing & AI Suite
    if (app.id === 'marketing') {
      const mktUrl = `/demo/ai?${ssoParams.toString()}`;
      window.open(mktUrl, '_blank');
      return;
    }

    // Fallback for any other custom multi-app module:
    const customUrl = `/apps/${app.id}?${ssoParams.toString()}`;
    window.open(customUrl, '_blank');
  };

  // Sparkline mini SVG helper
  const renderSparkline = (color = '#10b981', points = '0,20 20,18 40,22 60,10 80,6') => (
    <svg className="oxoo-metric-sparkline" viewBox="0 0 80 30" fill="none">
      <path
        d={`M ${points}`}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="80" cy={points.split(' ').pop().split(',')[1]} r="3" fill={color} />
    </svg>
  );

  return (
    <div className="oxoo-dashboard-layout">
      {/* ---------------------------------------------------------
          1. SIDEBAR (Dark Navy, OXOO Brand Logo, 8 Navigation Items)
          --------------------------------------------------------- */}
      <aside className={`oxoo-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="oxoo-sidebar-top">
          {/* Logo & Tagline */}
          <Link to="/" className="oxoo-brand-container">
            <div className="oxoo-brand-logo-wrap">
              <img
                src="/oxoo-logo-white.png"
                alt="OXOO"
                className="oxoo-brand-logo-img"
              />
            </div>
            <span className="oxoo-tagline-text">One Platform. Infinite Possibilities.</span>
          </Link>

          {/* Navigation Menu */}
          <nav className="oxoo-nav-menu">
            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard className="oxoo-nav-icon" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'apps' ? 'active' : ''}`}
              onClick={() => setActiveTab('apps')}
            >
              <Layers className="oxoo-nav-icon" />
              <span>My Applications</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'billing' ? 'active' : ''}`}
              onClick={() => setActiveTab('billing')}
            >
              <CreditCard className="oxoo-nav-icon" />
              <span>Billing & Subscriptions</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => setActiveTab('team')}
            >
              <Users className="oxoo-nav-icon" />
              <span>Team Management</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => setActiveTab('support')}
            >
              <HelpCircle className="oxoo-nav-icon" />
              <span>Support</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <BarChart2 className="oxoo-nav-icon" />
              <span>Reports & Analytics</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="oxoo-nav-icon" />
              <span>Notifications</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="oxoo-nav-icon" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Profile Card */}
        <div className="oxoo-sidebar-bottom">
          <div className="oxoo-fluid-waves-art" />
          <div
            className="oxoo-sidebar-profile"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="oxoo-profile-avatar-circle">
              {overview.avatar || 'P'}
            </div>
            <div className="oxoo-profile-meta">
              <span className="oxoo-profile-name">{overview.customerName || 'Priya Sharma'}</span>
              <span className="oxoo-profile-sub">{overview.company || 'RetailMart Solutions'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------------
          2. MAIN VIEWPORT (Header & Dynamic Sections)
          --------------------------------------------------------- */}
      <div className="oxoo-main-viewport">
        {/* Top Bar Header */}
        <header className="oxoo-top-header">
          <div className="oxoo-header-left">
            <div className="oxoo-search-box">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                className="oxoo-search-input"
                placeholder="Search apps, features, help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="oxoo-header-right">
            {/* Live Customer Logo Preview */}
            <CustomerBrandBadge companyName={overview.company} />

            {/* Customer Portal Pill Badge */}
            <div className="oxoo-portal-badge-pill">
              <ShieldCheck size={14} />
              <span>Customer Portal</span>
            </div>

            {/* Notifications Bell */}
            <button
              type="button"
              className="oxoo-header-icon-btn"
              onClick={() => setActiveTab('notifications')}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="oxoo-badge-dot" />
            </button>

            {/* Help Center Icon */}
            <button
              type="button"
              className="oxoo-header-icon-btn"
              onClick={() => setActiveTab('support')}
              aria-label="Help Center"
              title="Help Center"
            >
              <HelpCircle size={18} />
            </button>

            {/* User Profile Dropdown Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="oxoo-user-dropdown-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="oxoo-profile-avatar-circle" style={{ width: '34px', height: '34px' }}>
                  {overview.avatar || 'P'}
                </div>
                <div className="oxoo-user-info-text">
                  <span className="oxoo-user-name">{overview.customerName || 'Priya Sharma'}</span>
                  <span className="oxoo-user-org">{overview.company || 'RetailMart Solutions'}</span>
                </div>
                <ChevronDown size={14} color="#64748b" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '52px',
                      width: '240px',
                      background: '#ffffff',
                      borderRadius: '14px',
                      boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
                      border: '1px solid #e2e8f0',
                      padding: '8px',
                      zIndex: 200
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{overview.customerName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{overview.email}</div>
                    </div>
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => { setActiveTab('settings'); setSettingsSubTab('account'); setUserMenuOpen(false); }}
                    >
                      Account Profile
                    </button>
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => { setActiveTab('billing'); setUserMenuOpen(false); }}
                    >
                      Billing & Subscriptions
                    </button>
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#dc2626', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => {
                        localStorage.removeItem('oxoo_token');
                        localStorage.removeItem('oxoo_user');
                        window.dispatchEvent(new Event('oxoo_auth_change'));
                        setUserMenuOpen(false);
                        navigate('/login');
                      }}
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Global Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed',
                top: '24px',
                right: '32px',
                background: '#0f172a',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} color="#34d399" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="oxoo-content-canvas">
          {/* =========================================================
              VIEW 1: DASHBOARD OVERVIEW
              ========================================================= */}
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <div className="oxoo-welcome-row">
                <div>
                  <h1 className="oxoo-welcome-title">
                    Welcome back, {overview.customerName.split(' ')[0]}!
                  </h1>
                  <p className="oxoo-welcome-subtitle">
                    Manage your business with OXOO. Access all your purchased apps in one place.
                  </p>
                </div>

                {/* Current Plan Card */}
                <div className="oxoo-plan-card">
                  <div className="oxoo-crown-badge">
                    <Crown size={22} />
                  </div>
                  <div className="oxoo-plan-details">
                    <span className="oxoo-plan-label">Current Plan</span>
                    <span className="oxoo-plan-name">{overview.currentPlan}</span>
                    <span className="oxoo-plan-billing-date">Next billing: {overview.nextBillingDate}</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Statistics (4 Summary Cards) */}
              <div className="oxoo-summary-grid">
                {/* 1. Active Apps */}
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap blue">
                      <LayoutDashboard size={20} />
                    </div>
                    <span className="oxoo-metric-badge green">+100%</span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Active Apps</span>
                      <span className="oxoo-metric-value">{overview.activeAppsCount}</span>
                      <span className="oxoo-metric-subtitle">of {overview.activeAppsCount || 1} purchased</span>
                    </div>
                    {renderSparkline('#10b981', '0,24 20,20 40,16 60,12 80,6')}
                  </div>
                </div>

                {/* 2. Team Members */}
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap blue">
                      <Users size={20} />
                    </div>
                    <span className="oxoo-metric-badge green">+0%</span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Team Members</span>
                      <span className="oxoo-metric-value">{overview.teamMembersCount}</span>
                      <span className="oxoo-metric-subtitle">active user</span>
                    </div>
                    {renderSparkline('#10b981', '0,20 20,20 40,20 60,20 80,20')}
                  </div>
                </div>

                {/* 3. Monthly Usage */}
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap blue">
                      <BarChart2 size={20} />
                    </div>
                    <span className="oxoo-metric-badge green">+12%</span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Monthly Usage</span>
                      <span className="oxoo-metric-value">{overview.monthlyUsage.toLocaleString('en-IN')}</span>
                      <span className="oxoo-metric-subtitle">total transactions</span>
                    </div>
                    {renderSparkline('#06b6d4', '0,24 20,22 40,15 60,18 80,8')}
                  </div>
                </div>

                {/* 4. Open Support Tickets */}
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap purple">
                      <MessageSquare size={20} />
                    </div>
                    <span className="oxoo-metric-badge red">+0%</span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Open Support Tickets</span>
                      <span className="oxoo-metric-value">{overview.openTicketsCount}</span>
                      <span className="oxoo-metric-subtitle">awaiting response</span>
                    </div>
                    {renderSparkline('#ef4444', '0,20 20,20 40,20 60,20 80,20')}
                  </div>
                </div>
              </div>

              {/* 2-Column: My Applications & Recent Activity */}
              <div className="oxoo-apps-activity-row">
                {/* Left Column: My Applications */}
                <div className="oxoo-section-card">
                  <div className="oxoo-section-header">
                    <h2 className="oxoo-section-title">My Applications</h2>
                    <span className="oxoo-view-all-link" onClick={() => setActiveTab('apps')}>
                      View All Apps <ArrowRight size={13} />
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                    {allDirectoryApps.filter(app => app.entitled).length > 0 ? (
                      allDirectoryApps.filter(app => app.entitled).map((app) => (
                        <div key={app.id} className="oxoo-app-tile" style={{ padding: '20px 16px' }}>
                          <div className={`oxoo-app-icon-box ${app.color === 'blue' ? 'gradient-blue' : ''}`} style={{
                            background: app.color === 'blue' ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' :
                              app.color === 'purple' ? '#f3e8ff' :
                              app.color === 'green' ? '#ecfdf5' : '#fff7ed',
                            color: app.color === 'blue' ? '#ffffff' :
                              app.color === 'purple' ? '#8b5cf6' :
                              app.color === 'green' ? '#10b981' : '#f97316'
                          }}>
                            {app.id === 'sales' && <Layers size={26} />}
                            {app.id === 'hrms' && <Users size={26} />}
                            {app.id === 'finance' && <BarChart2 size={26} />}
                            {app.id === 'marketing' && <Megaphone size={26} />}
                          </div>
                          <span className="oxoo-app-name" style={{ fontSize: '15px' }}>{app.name}</span>
                          <span className="oxoo-status-pill active">
                            <span className="oxoo-status-dot" /> Active
                          </span>
                          <button
                            type="button"
                            className="oxoo-app-action-btn open"
                            onClick={() => handleOpenApp(app)}
                          >
                            Open App →
                          </button>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px', gridColumn: '1 / -1' }}>
                        No active applications yet.{' '}
                        <span onClick={() => setActiveTab('apps')} style={{ color: '#0284c7', cursor: 'pointer', fontWeight: 600 }}>
                          Browse Directory →
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Recent Activity */}
                <div className="oxoo-section-card">
                  <div className="oxoo-section-header">
                    <h2 className="oxoo-section-title">Recent Activity</h2>
                    <span className="oxoo-view-all-link" onClick={() => setActiveTab('billing')}>
                      View All
                    </span>
                  </div>

                  <div className="oxoo-activity-list">
                    <div className="oxoo-activity-item">
                      <div className="oxoo-activity-icon-circle green" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <Check size={16} />
                      </div>
                      <div className="oxoo-activity-content">
                        <span className="oxoo-activity-title">Payment Received (INV-2026-06114197)</span>
                        <span className="oxoo-activity-desc">Single Software — ₹660.8</span>
                      </div>
                      <span className="oxoo-activity-time">21/10/2026</span>
                    </div>

                    <div className="oxoo-activity-item">
                      <div className="oxoo-activity-icon-circle green" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <Check size={16} />
                      </div>
                      <div className="oxoo-activity-content">
                        <span className="oxoo-activity-title">Payment Received (INV-2026-27619112)</span>
                        <span className="oxoo-activity-desc">Single Software — ₹7,929.6</span>
                      </div>
                      <span className="oxoo-activity-time">21/10/2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              VIEW 2: MY APPLICATIONS
              ========================================================= */}
          {activeTab === 'apps' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header" style={{ marginBottom: '16px' }}>
                <div>
                  <h2 className="oxoo-section-title">My Applications</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Access and manage all your purchased applications.
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-controls-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-table-search-box">
                    <Search size={15} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="oxoo-select-filter"
                    value={appStatusFilter}
                    onChange={(e) => setAppStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="not_purchased">Not Purchased</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => navigate('/choose-apps')}
                >
                  <Plus size={14} style={{ marginRight: '4px' }} /> Explore More Apps
                </button>
              </div>

              {/* Application Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px', marginTop: '16px' }}>
                {allDirectoryApps
                  .filter(app => {
                    const matchQuery = app.name.toLowerCase().includes(appSearch.toLowerCase()) || app.desc.toLowerCase().includes(appSearch.toLowerCase());
                    const matchStatus = appStatusFilter === 'all' ||
                      (appStatusFilter === 'active' && app.entitled) ||
                      (appStatusFilter === 'not_purchased' && !app.entitled);
                    return matchQuery && matchStatus;
                  })
                  .map((app) => (
                    <div key={app.id} className="oxoo-app-tile" style={{ padding: '24px 20px', textAlign: 'center' }}>
                      <div className={`oxoo-app-icon-box ${app.color === 'blue' ? 'gradient-blue' : ''}`} style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        margin: '0 auto 14px',
                        background: app.color === 'blue' ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' :
                          app.color === 'purple' ? '#f3e8ff' :
                          app.color === 'green' ? '#ecfdf5' : '#fff7ed',
                        color: app.color === 'blue' ? '#ffffff' :
                          app.color === 'purple' ? '#8b5cf6' :
                          app.color === 'green' ? '#10b981' : '#f97316'
                      }}>
                        {app.id === 'sales' && <Layers size={28} />}
                        {app.id === 'hrms' && <Users size={28} />}
                        {app.id === 'finance' && <BarChart2 size={28} />}
                        {app.id === 'marketing' && <Megaphone size={28} />}
                      </div>

                      <h3 className="oxoo-app-name" style={{ fontSize: '16px', marginBottom: '4px' }}>{app.name}</h3>
                      <p style={{ fontSize: '12.5px', color: '#64748b', minHeight: '36px', margin: '0 0 12px' }}>
                        {app.desc}
                      </p>

                      <div style={{ marginBottom: '16px' }}>
                        {app.entitled ? (
                          <span className="oxoo-status-pill active">
                            <span className="oxoo-status-dot" /> Active
                          </span>
                        ) : (
                          <span className="oxoo-status-pill not-purchased" style={{ background: '#fef3c7', color: '#d97706' }}>
                            <span className="oxoo-status-dot" style={{ background: '#d97706' }} /> Not Purchased
                          </span>
                        )}
                        {app.purchasedDate && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                            Purchased on: {app.purchasedDate}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`oxoo-app-action-btn ${app.entitled ? 'open' : 'view-plans'}`}
                        onClick={() => handleOpenApp(app)}
                      >
                        {app.entitled ? 'Open App →' : 'View Plans →'}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 3: BILLING & SUBSCRIPTIONS
              ========================================================= */}
          {activeTab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div className="oxoo-section-card">
                <div className="oxoo-section-header" style={{ marginBottom: '16px' }}>
                  <div>
                    <h2 className="oxoo-section-title">Billing & Subscriptions</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Manage your plans, payment methods and invoices.
                    </p>
                  </div>
                </div>

                {/* Subscription Summary Card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="oxoo-crown-badge">
                      <Crown size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Single Software</span>
                        <span className="oxoo-status-pill active" style={{ margin: 0, padding: '2px 8px', fontSize: '10px' }}>Active</span>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#0284c7', margin: '2px 0' }}>₹660.8 / month</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Next billing date: 30 Nov 2026</div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <CreditCard size={20} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>Visa •••• 4242</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Expiry: 12/2028</div>
                      </div>
                      <span
                        style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, cursor: 'pointer', marginLeft: '6px' }}
                        onClick={() => showToast('Payment method update dialog initiated.')}
                      >
                        Update
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-tabs: Invoices | Payment History | Subscription Details */}
                <div className="oxoo-settings-subnav" style={{ marginBottom: '16px' }}>
                  <button
                    type="button"
                    className={`oxoo-settings-tab-btn ${billingSubTab === 'invoices' ? 'active' : ''}`}
                    onClick={() => setBillingSubTab('invoices')}
                  >
                    Invoices
                  </button>
                  <button
                    type="button"
                    className={`oxoo-settings-tab-btn ${billingSubTab === 'payment_history' ? 'active' : ''}`}
                    onClick={() => setBillingSubTab('payment_history')}
                  >
                    Payment History
                  </button>
                  <button
                    type="button"
                    className={`oxoo-settings-tab-btn ${billingSubTab === 'subscription_details' ? 'active' : ''}`}
                    onClick={() => setBillingSubTab('subscription_details')}
                  >
                    Subscription Details
                  </button>
                </div>

                {/* Invoices Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table className="oxoo-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Plan</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defaultInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="oxoo-table-company">{inv.invoice_number}</td>
                          <td>{inv.date}</td>
                          <td>{inv.plan}</td>
                          <td className="oxoo-table-amount">{inv.amount}</td>
                          <td>
                            <span className="oxoo-status-tag active">{inv.status}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#f0f9ff',
                                color: '#0284c7',
                                border: '1px solid #bae6fd',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              onClick={() => showToast(`Invoice ${inv.invoice_number} downloaded successfully.`)}
                            >
                              <Download size={13} /> Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 4: TEAM MANAGEMENT
              ========================================================= */}
          {activeTab === 'team' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header" style={{ marginBottom: '16px' }}>
                <div>
                  <h2 className="oxoo-section-title">Team Management</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Manage your team members and their access to applications.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setInviteModalOpen(true)}
                >
                  <UserPlus size={14} style={{ marginRight: '6px' }} /> + Invite Member
                </button>
              </div>

              {/* 4 Summary Cards */}
              <div className="oxoo-team-stats-row">
                <div className="oxoo-team-stat-pill">
                  <div className="oxoo-team-stat-icon blue">
                    <Users size={18} />
                  </div>
                  <div className="oxoo-team-stat-meta">
                    <span className="oxoo-team-stat-label">Total Members</span>
                    <span className="oxoo-team-stat-val">1</span>
                  </div>
                </div>

                <div className="oxoo-team-stat-pill">
                  <div className="oxoo-team-stat-icon green">
                    <UserCheck size={18} />
                  </div>
                  <div className="oxoo-team-stat-meta">
                    <span className="oxoo-team-stat-label">Active</span>
                    <span className="oxoo-team-stat-val">1</span>
                  </div>
                </div>

                <div className="oxoo-team-stat-pill">
                  <div className="oxoo-team-stat-icon yellow">
                    <Clock size={18} />
                  </div>
                  <div className="oxoo-team-stat-meta">
                    <span className="oxoo-team-stat-label">Pending</span>
                    <span className="oxoo-team-stat-val">0</span>
                  </div>
                </div>

                <div className="oxoo-team-stat-pill">
                  <div className="oxoo-team-stat-icon purple">
                    <Mail size={18} />
                  </div>
                  <div className="oxoo-team-stat-meta">
                    <span className="oxoo-team-stat-label">Invites</span>
                    <span className="oxoo-team-stat-val">0</span>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-controls-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-table-search-box">
                    <Search size={15} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="oxoo-select-filter"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                    <option value="Billing Manager">Billing Manager</option>
                  </select>
                </div>
              </div>

              {/* Team Members Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers
                      .filter(m => {
                        const matchQuery = m.name.toLowerCase().includes(teamSearch.toLowerCase()) || m.email.toLowerCase().includes(teamSearch.toLowerCase());
                        const matchRole = roleFilter === 'all' || m.role.toLowerCase() === roleFilter.toLowerCase();
                        return matchQuery && matchRole;
                      })
                      .map((member) => (
                        <tr key={member.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="oxoo-profile-avatar-circle" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                                {member.name.charAt(0)}
                              </div>
                              <strong>{member.name}</strong>
                            </div>
                          </td>
                          <td style={{ color: '#475569' }}>{member.email}</td>
                          <td>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: member.role === 'Owner' ? '#0369a1' : member.role === 'Admin' ? '#1d4ed8' : '#475569',
                              background: member.role === 'Owner' ? '#e0f2fe' : member.role === 'Admin' ? '#dbeafe' : '#f1f5f9',
                              padding: '3px 10px',
                              borderRadius: '6px'
                            }}>
                              {member.role}
                            </span>
                          </td>
                          <td>
                            <span className={`oxoo-status-tag ${member.status === 'Active' ? 'active' : 'pending'}`} style={{
                              background: member.status === 'Active' ? '#ecfdf5' : '#fef3c7',
                              color: member.status === 'Active' ? '#059669' : '#d97706'
                            }}>
                              {member.status}
                            </span>
                          </td>
                          <td style={{ color: '#64748b' }}>{member.joined}</td>
                          <td>
                            <button
                              type="button"
                              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                              onClick={() => showToast(`Options for ${member.name}`)}
                            >
                              <MoreHorizontal size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="oxoo-pagination-bar">
                <span>Showing 1-4 of 4 members</span>
                <div className="oxoo-pagination-buttons">
                  <button type="button" className="oxoo-page-btn">&lt;</button>
                  <button type="button" className="oxoo-page-btn active">1</button>
                  <button type="button" className="oxoo-page-btn">&gt;</button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 5: SUPPORT CENTER / TICKETS
              ========================================================= */}
          {activeTab === 'support' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header" style={{ marginBottom: '16px' }}>
                <div>
                  <h2 className="oxoo-section-title">Support Center</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Raise and manage your support tickets.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setTicketModalOpen(true)}
                >
                  <Plus size={14} style={{ marginRight: '6px' }} /> + Create Ticket
                </button>
              </div>

              {/* Ticket Status Tabs */}
              <div className="oxoo-filter-pills-bar">
                <button
                  type="button"
                  className={`oxoo-filter-pill-btn ${ticketFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setTicketFilter('all')}
                >
                  All Tickets
                </button>
                <button
                  type="button"
                  className={`oxoo-filter-pill-btn ${ticketFilter === 'open' ? 'active' : ''}`}
                  onClick={() => setTicketFilter('open')}
                >
                  Open <span className="oxoo-filter-count-badge">1</span>
                </button>
                <button
                  type="button"
                  className={`oxoo-filter-pill-btn ${ticketFilter === 'in_progress' ? 'active' : ''}`}
                  onClick={() => setTicketFilter('in_progress')}
                >
                  In Progress <span className="oxoo-filter-count-badge">1</span>
                </button>
                <button
                  type="button"
                  className={`oxoo-filter-pill-btn ${ticketFilter === 'resolved' ? 'active' : ''}`}
                  onClick={() => setTicketFilter('resolved')}
                >
                  Resolved <span className="oxoo-filter-count-badge">2</span>
                </button>
                <button
                  type="button"
                  className={`oxoo-filter-pill-btn ${ticketFilter === 'closed' ? 'active' : ''}`}
                  onClick={() => setTicketFilter('closed')}
                >
                  Closed <span className="oxoo-filter-count-badge">1</span>
                </button>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-controls-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-table-search-box">
                    <Search size={15} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="oxoo-select-filter"
                    value={ticketCategoryFilter}
                    onChange={(e) => setTicketCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Account">Account</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>

              {/* Support Tickets Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th>Ticket #</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets
                      .filter(t => {
                        const matchQuery = t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) || t.number.toLowerCase().includes(ticketSearch.toLowerCase());
                        const matchStatus = ticketFilter === 'all' ||
                          (ticketFilter === 'open' && t.status === 'Open') ||
                          (ticketFilter === 'in_progress' && t.status === 'In Progress') ||
                          (ticketFilter === 'resolved' && t.status === 'Resolved') ||
                          (ticketFilter === 'closed' && t.status === 'Closed');
                        const matchCat = ticketCategoryFilter === 'all' || t.category === ticketCategoryFilter;
                        return matchQuery && matchStatus && matchCat;
                      })
                      .map((t) => (
                        <tr key={t.id}>
                          <td className="oxoo-table-company">{t.number}</td>
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>{t.subject}</td>
                          <td>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{t.category}</span>
                          </td>
                          <td>
                            <span className="oxoo-status-tag" style={{
                              background: t.status === 'Open' ? '#fee2e2' :
                                t.status === 'In Progress' ? '#fef3c7' :
                                t.status === 'Resolved' ? '#ecfdf5' : '#f1f5f9',
                              color: t.status === 'Open' ? '#dc2626' :
                                t.status === 'In Progress' ? '#d97706' :
                                t.status === 'Resolved' ? '#059669' : '#64748b'
                            }}>
                              {t.status}
                            </span>
                          </td>
                          <td style={{ color: '#64748b' }}>{t.created}</td>
                          <td>
                            <button
                              type="button"
                              style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: '6px' }}
                              onClick={() => showToast(`Viewing ticket conversation: ${t.number}`)}
                            >
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="oxoo-pagination-bar">
                <span>Showing 1-4 of 4 tickets</span>
                <div className="oxoo-pagination-buttons">
                  <button type="button" className="oxoo-page-btn">&lt;</button>
                  <button type="button" className="oxoo-page-btn active">1</button>
                  <button type="button" className="oxoo-page-btn">&gt;</button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 6: REPORTS & USAGE ANALYTICS
              ========================================================= */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div className="oxoo-section-card">
                <div className="oxoo-section-header" style={{ marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 className="oxoo-section-title">Reports & Usage Analytics</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Track your application usage and business insights.
                    </p>
                  </div>
                  {/* Date Filter & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="oxoo-date-badge-btn"
                      onClick={() => showToast('Date range: 01 Oct 2026 – 31 Oct 2026')}
                    >
                      <Calendar size={14} color="#0284c7" />
                      <span>01 Oct 2026 – 31 Oct 2026</span>
                    </button>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Exporting analytics report...')}
                    >
                      Export Report
                    </button>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Downloading CSV report...')}
                    >
                      Download CSV
                    </button>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Downloading PDF report...')}
                    >
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* Usage Statistics (4 KPI Cards) */}
                <div className="oxoo-summary-grid" style={{ marginBottom: '24px' }}>
                  <div className="oxoo-metric-card">
                    <div className="oxoo-metric-top-row">
                      <span className="oxoo-metric-label">Total Transactions</span>
                      <span className="oxoo-metric-badge green">+14%</span>
                    </div>
                    <div className="oxoo-metric-bottom-row">
                      <span className="oxoo-metric-value" style={{ fontSize: '26px' }}>1,420</span>
                    </div>
                  </div>

                  <div className="oxoo-metric-card">
                    <div className="oxoo-metric-top-row">
                      <span className="oxoo-metric-label">Active Users</span>
                      <span className="oxoo-metric-badge green">+25%</span>
                    </div>
                    <div className="oxoo-metric-bottom-row">
                      <span className="oxoo-metric-value" style={{ fontSize: '26px' }}>4</span>
                    </div>
                  </div>

                  <div className="oxoo-metric-card">
                    <div className="oxoo-metric-top-row">
                      <span className="oxoo-metric-label">API Calls</span>
                      <span className="oxoo-metric-badge green">+18%</span>
                    </div>
                    <div className="oxoo-metric-bottom-row">
                      <span className="oxoo-metric-value" style={{ fontSize: '26px' }}>8,240</span>
                    </div>
                  </div>

                  <div className="oxoo-metric-card">
                    <div className="oxoo-metric-top-row">
                      <span className="oxoo-metric-label">Storage Used</span>
                      <span className="oxoo-metric-badge green">+5%</span>
                    </div>
                    <div className="oxoo-metric-bottom-row">
                      <span className="oxoo-metric-value" style={{ fontSize: '26px' }}>2.4 GB</span>
                    </div>
                  </div>
                </div>

                {/* 2-Column: Usage Trend Chart + Top Features */}
                <div className="oxoo-analytics-grid">
                  {/* Usage Trend Chart */}
                  <div className="oxoo-usage-chart-wrap">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Usage Trend Chart</h3>
                      <div className="oxoo-chart-legend">
                        <div className="oxoo-legend-item">
                          <span className="oxoo-legend-color" style={{ background: '#0284c7' }} />
                          <span>Transactions</span>
                        </div>
                        <div className="oxoo-legend-item">
                          <span className="oxoo-legend-color" style={{ background: '#06b6d4' }} />
                          <span>Active Users</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '230px', position: 'relative' }}>
                      <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="160" x2="600" y2="160" stroke="#f1f5f9" strokeWidth="1" />

                        <polygon
                          fill="url(#blueGrad)"
                          points="30,150 110,130 190,140 280,90 380,105 480,50 560,30 560,190 30,190"
                        />

                        {/* Transactions (Blue) */}
                        <polyline
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="30,150 110,130 190,140 280,90 380,105 480,50 560,30"
                        />
                        {[[30,150],[110,130],[190,140],[280,90],[380,105],[480,50],[560,30]].map(([cx, cy], i) => (
                          <circle key={i} cx={cx} cy={cy} r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                        ))}

                        {/* Active Users (Cyan) */}
                        <polyline
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="30,170 110,165 190,160 280,145 380,140 480,120 560,110"
                        />
                        {[[30,170],[110,165],[190,160],[280,145],[380,140],[480,120],[560,110]].map(([cx, cy], i) => (
                          <circle key={i} cx={cx} cy={cy} r="3" fill="#ffffff" stroke="#06b6d4" strokeWidth="2" />
                        ))}
                      </svg>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                      <span>01 Oct</span>
                      <span>05 Oct</span>
                      <span>10 Oct</span>
                      <span>15 Oct</span>
                      <span>20 Oct</span>
                      <span>25 Oct</span>
                      <span>31 Oct</span>
                    </div>
                  </div>

                  {/* Top Features */}
                  <div className="oxoo-usage-chart-wrap">
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
                      Top Features
                    </h3>
                    <div className="oxoo-features-list">
                      {[
                        { name: 'Transactions', pct: 38 },
                        { name: 'Reporting', pct: 22 },
                        { name: 'User Management', pct: 18 },
                        { name: 'API Access', pct: 12 },
                        { name: 'Data Export', pct: 10 }
                      ].map((feat) => (
                        <div key={feat.name} className="oxoo-feature-item">
                          <div className="oxoo-feature-meta">
                            <span>{feat.name}</span>
                            <span>{feat.pct}%</span>
                          </div>
                          <div className="oxoo-feature-bar-bg">
                            <div className="oxoo-feature-bar-fill" style={{ width: `${feat.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 8: NOTIFICATIONS & ACTIVITY
              ========================================================= */}
          {activeTab === 'notifications' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header" style={{ marginBottom: '16px' }}>
                <div>
                  <h2 className="oxoo-section-title">Notifications & Activity</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Stay updated with important updates and activities.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => {
                      setNotifications(notifications.map(n => ({ ...n, read: true })));
                      showToast('All notifications marked as read.');
                    }}
                  >
                    Mark all as read
                  </button>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => {
                      setNotifications(notifications.filter(n => !n.read));
                      showToast('Read notifications cleared.');
                    }}
                  >
                    Clear Read Notifications
                  </button>
                </div>
              </div>

              {/* Filters: All, Payments, Team, Support, System */}
              <div className="oxoo-filter-pills-bar">
                {['all', 'payments', 'team', 'support', 'system'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`oxoo-filter-pill-btn ${notifFilter === f ? 'active' : ''}`}
                    onClick={() => setNotifFilter(f)}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Activity Feed */}
              <div className="oxoo-notifications-feed">
                {notifications
                  .filter(n => notifFilter === 'all' || n.category === notifFilter)
                  .map((notif) => (
                    <div key={notif.id} className="oxoo-notification-card">
                      <div className="oxoo-notification-icon" style={{
                        background: notif.category === 'payments' ? '#ecfdf5' :
                          notif.category === 'team' ? '#eff6ff' :
                          notif.category === 'support' ? '#fef3c7' : '#f3e8ff',
                        color: notif.category === 'payments' ? '#10b981' :
                          notif.category === 'team' ? '#0284c7' :
                          notif.category === 'support' ? '#d97706' : '#8b5cf6'
                      }}>
                        {notif.category === 'payments' && <CreditCard size={18} />}
                        {notif.category === 'team' && <UserPlus size={18} />}
                        {notif.category === 'support' && <MessageSquare size={18} />}
                        {notif.category === 'system' && <Layers size={18} />}
                      </div>

                      <div className="oxoo-notification-content">
                        <span className="oxoo-notification-title">{notif.title}</span>
                        <span className="oxoo-notification-desc">{notif.desc}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          Date: {notif.date}
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          style={{ background: '#f1f5f9', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                          onClick={() => {
                            setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
                            showToast('Marked as read');
                          }}
                        >
                          Mark as Read
                        </button>
                        <button
                          type="button"
                          style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, color: '#0284c7', cursor: 'pointer' }}
                          onClick={() => showToast(`Viewing details: ${notif.title}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 7, 9, 10: SETTINGS (ACCOUNT PROFILE, SECURITY, PREFERENCES)
              ========================================================= */}
          {activeTab === 'settings' && (
            <div className="oxoo-section-card" style={{ maxWidth: '900px' }}>
              {/* Settings Sub-Navigation Header */}
              <div className="oxoo-settings-subnav">
                <button
                  type="button"
                  className={`oxoo-settings-tab-btn ${settingsSubTab === 'account' ? 'active' : ''}`}
                  onClick={() => setSettingsSubTab('account')}
                >
                  Account Profile
                </button>
                <button
                  type="button"
                  className={`oxoo-settings-tab-btn ${settingsSubTab === 'security' ? 'active' : ''}`}
                  onClick={() => setSettingsSubTab('security')}
                >
                  Security & Login
                </button>
                <button
                  type="button"
                  className={`oxoo-settings-tab-btn ${settingsSubTab === 'preferences' ? 'active' : ''}`}
                  onClick={() => setSettingsSubTab('preferences')}
                >
                  Settings & Preferences
                </button>
              </div>

              {/* -------------------------------------------------------
                  VIEW 7: ACCOUNT PROFILE
                  ------------------------------------------------------- */}
              {settingsSubTab === 'account' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 className="oxoo-section-title">Account Profile</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Manage your personal and company information.
                    </p>
                  </div>

                  {/* Profile Details Header Card */}
                  <div className="oxoo-profile-summary-header">
                    <div className="oxoo-profile-avatar-big">
                      {profileData.name.charAt(0) || 'P'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
                        {profileData.name}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#0284c7', fontWeight: 600 }}>
                        Account Role: Owner
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Company: {profileData.company}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Select new profile photo dialog')}
                    >
                      Change Profile Photo
                    </button>
                  </div>

                  {/* Personal Information Form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!profileData.name.trim()) {
                      showToast('Please enter your full name.');
                      return;
                    }
                    if (!profileData.email.includes('@')) {
                      showToast('Please enter a valid email address.');
                      return;
                    }
                    if (!profileData.phone.trim()) {
                      showToast('Please enter a valid phone number.');
                      return;
                    }

                    setOverview(prev => ({
                      ...prev,
                      customerName: profileData.name,
                      company: profileData.company,
                      email: profileData.email,
                      avatar: profileData.name.charAt(0).toUpperCase()
                    }));
                    showToast('Profile updated successfully.');
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Full Name</label>
                        <input
                          type="text"
                          className="oxoo-form-input"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        />
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Email Address</label>
                        <input
                          type="email"
                          className="oxoo-form-input"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Phone Number</label>
                        <input
                          type="text"
                          className="oxoo-form-input"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Company Name</label>
                        <input
                          type="text"
                          className="oxoo-form-input"
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Company Website</label>
                        <input
                          type="text"
                          className="oxoo-form-input"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        />
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Country</label>
                        <input
                          type="text"
                          className="oxoo-form-input"
                          value={profileData.country}
                          onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button type="submit" className="oxoo-upgrade-btn">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => {
                          setProfileData({
                            name: overview.customerName,
                            email: overview.email,
                            phone: '+91 98765 43210',
                            company: overview.company,
                            website: 'https://retailmart.com',
                            country: 'India'
                          });
                          showToast('Changes cancelled');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* -------------------------------------------------------
                  VIEW 9: SECURITY & LOGIN
                  ------------------------------------------------------- */}
              {settingsSubTab === 'security' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 className="oxoo-section-title">Security & Login</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Manage your account security settings.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Password Row */}
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <Lock size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Password</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Update your password regularly.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => setChangePwdModalOpen(true)}
                      >
                        Change Password
                      </button>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <Shield size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Two-Factor Authentication</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Add an extra layer of security.</div>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: twoFaEnabled ? '#10b981' : '#64748b' }}>
                            Status: {twoFaEnabled ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                      </div>
                      <label className="oxoo-switch-toggle" title="Enable Two-Factor Authentication">
                        <input
                          type="checkbox"
                          checked={twoFaEnabled}
                          onChange={(e) => {
                            setTwoFaEnabled(e.target.checked);
                            showToast(e.target.checked ? 'Two-factor authentication enabled.' : 'Two-factor authentication disabled.');
                          }}
                        />
                        <span className="oxoo-slider" />
                      </label>
                    </div>

                    {/* Authenticator App */}
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <Smartphone size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Authenticator App</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Secure your account using an authenticator application.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => showToast('Authenticator setup QR code generated')}
                      >
                        Configure
                      </button>
                    </div>

                    {/* SMS Authentication */}
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <MessageSquare size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>SMS Authentication</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Receive verification codes by SMS.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => showToast('SMS verification configuration initiated')}
                      >
                        Configure
                      </button>
                    </div>

                    {/* Active Sessions */}
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <Laptop size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Active Sessions</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Manage your active login sessions.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => setSessionsModalOpen(true)}
                      >
                        View Sessions
                      </button>
                    </div>
                  </div>

                  {/* Security Actions Bar */}
                  <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Signed out of current device.')}
                    >
                      Sign Out of This Device
                    </button>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      onClick={() => showToast('Your session has been revoked from all other devices.')}
                    >
                      Sign Out of All Devices
                    </button>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Reviewing login history: Last login today from India (IP: 103.21.24.5)')}
                    >
                      Review Login History
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------
                  VIEW 10: SETTINGS & PREFERENCES
                  ------------------------------------------------------- */}
              {settingsSubTab === 'preferences' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 className="oxoo-section-title">Settings & Preferences</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Customize your experience and preferences.
                    </p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    showToast('Preferences saved successfully.');
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* General Preferences */}
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>
                      General Preferences
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Language</label>
                        <select
                          className="oxoo-form-select"
                          value={prefLanguage}
                          onChange={(e) => setPrefLanguage(e.target.value)}
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi (हिंदी)</option>
                          <option value="Spanish">Spanish (Español)</option>
                          <option value="French">French (Français)</option>
                        </select>
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Timezone</label>
                        <select
                          className="oxoo-form-select"
                          value={prefTimezone}
                          onChange={(e) => setPrefTimezone(e.target.value)}
                        >
                          <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                          <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                          <option value="(GMT-05:00) America/New_York">(GMT-05:00) America/New_York</option>
                          <option value="(GMT+04:00) Asia/Dubai">(GMT+04:00) Asia/Dubai</option>
                        </select>
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Currency</label>
                        <select
                          className="oxoo-form-select"
                          value={prefCurrency}
                          onChange={(e) => setPrefCurrency(e.target.value)}
                        >
                          <option value="INR (₹)">INR (₹)</option>
                          <option value="USD ($)">USD ($)</option>
                          <option value="EUR (€)">EUR (€)</option>
                          <option value="AED (د.إ)">AED (د.إ)</option>
                        </select>
                      </div>
                    </div>

                    {/* Email Notifications */}
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '12px 0 0' }}>
                      Email Notifications
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Account Updates</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Receive important updates and alerts.</div>
                        </div>
                        <label className="oxoo-switch-toggle" title="Account Updates">
                          <input
                            type="checkbox"
                            checked={prefAccountUpdates}
                            onChange={(e) => setPrefAccountUpdates(e.target.checked)}
                          />
                          <span className="oxoo-slider" />
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Product Updates</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Get notified about new features.</div>
                        </div>
                        <label className="oxoo-switch-toggle" title="Product Updates">
                          <input
                            type="checkbox"
                            checked={prefProductUpdates}
                            onChange={(e) => setPrefProductUpdates(e.target.checked)}
                          />
                          <span className="oxoo-slider" />
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Marketing Communications</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Receive tips, offers and best practices.</div>
                        </div>
                        <label className="oxoo-switch-toggle" title="Marketing Communications">
                          <input
                            type="checkbox"
                            checked={prefMarketing}
                            onChange={(e) => setPrefMarketing(e.target.checked)}
                          />
                          <span className="oxoo-slider" />
                        </label>
                      </div>
                    </div>

                    {/* Additional Preferences */}
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '12px 0 0' }}>
                      Additional Preferences
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Date Format</label>
                        <select
                          className="oxoo-form-select"
                          value={prefDateFormat}
                          onChange={(e) => setPrefDateFormat(e.target.value)}
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Number Format</label>
                        <select
                          className="oxoo-form-select"
                          value={prefNumberFormat}
                          onChange={(e) => setPrefNumberFormat(e.target.value)}
                        >
                          <option value="1,234.56">1,234.56</option>
                          <option value="1.234,56">1.234,56</option>
                        </select>
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Default Application</label>
                        <select
                          className="oxoo-form-select"
                          value={prefDefaultApp}
                          onChange={(e) => setPrefDefaultApp(e.target.value)}
                        >
                          <option value="Sales Software">Sales Software</option>
                          <option value="HRMS">HRMS</option>
                          <option value="Finance">Finance</option>
                        </select>
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Dashboard Layout</label>
                        <select
                          className="oxoo-form-select"
                          value={prefDashboardLayout}
                          onChange={(e) => setPrefDashboardLayout(e.target.value)}
                        >
                          <option value="Standard">Standard</option>
                          <option value="Compact">Compact</option>
                        </select>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button type="submit" className="oxoo-upgrade-btn">
                        Save Preferences
                      </button>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => {
                          setPrefLanguage('English');
                          setPrefTimezone('(GMT+05:30) Asia/Kolkata');
                          setPrefCurrency('INR (₹)');
                          setPrefAccountUpdates(true);
                          setPrefProductUpdates(true);
                          setPrefMarketing(false);
                          setPrefDateFormat('DD/MM/YYYY');
                          setPrefNumberFormat('1,234.56');
                          setPrefDefaultApp('Sales Software');
                          setPrefDashboardLayout('Standard');
                          showToast('Settings reset to default.');
                        }}
                      >
                        Reset to Default
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              SECURITY AND PRIVACY NOTICE (FOOTER)
              ========================================================= */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '12px'
          }}>
            <ShieldCheck size={18} color="#0284c7" />
            <div>
              <strong>Security and Privacy:</strong> Your account information is protected. Only authorised team members can access your organisation's data. Your application access depends on your active subscription and assigned permissions.
            </div>
          </div>
        </main>
      </div>

      {/* ---------------------------------------------------------
          3. INTERACTIVE MODALS
          --------------------------------------------------------- */}



      {/* Invite Team Member Modal */}
      {inviteModalOpen && (
        <div className="oxoo-modal-backdrop" onClick={() => setInviteModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="oxoo-modal-header">
              <h3 className="oxoo-modal-title">Invite New Team Member</h3>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => setInviteModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!inviteForm.name || !inviteForm.email) return;
              const newMember = {
                id: String(Date.now()),
                name: inviteForm.name,
                email: inviteForm.email,
                role: inviteForm.role,
                status: 'Active',
                joined: 'Today'
              };
              setTeamMembers([newMember, ...teamMembers]);
              showToast('Invitation sent successfully.');
              setInviteModalOpen(false);
              setInviteForm({ name: '', email: '', role: 'Member', access: 'All Applications' });
            }}>
              <div className="oxoo-modal-body">
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="oxoo-form-input"
                    placeholder="e.g. Rachel Adams"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Work Email</label>
                  <input
                    type="email"
                    required
                    className="oxoo-form-input"
                    placeholder="rachel@retailmart.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Role</label>
                  <select
                    className="oxoo-form-select"
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                    <option value="Billing Manager">Billing Manager</option>
                  </select>
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Application Access</label>
                  <select
                    className="oxoo-form-select"
                    value={inviteForm.access}
                    onChange={(e) => setInviteForm({ ...inviteForm, access: e.target.value })}
                  >
                    <option value="All Applications">All Applications</option>
                    <option value="Sales Software">Sales Software</option>
                    <option value="HRMS">HRMS</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="oxoo-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="oxoo-upgrade-btn">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {ticketModalOpen && (
        <div className="oxoo-modal-backdrop" onClick={() => setTicketModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="oxoo-modal-header">
              <h3 className="oxoo-modal-title">Create Support Ticket</h3>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => setTicketModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!ticketForm.subject) return;
              const newTicket = {
                id: String(Date.now()),
                number: `OXOO-${Math.floor(1000 + Math.random() * 9000)}`,
                subject: ticketForm.subject,
                category: ticketForm.category,
                status: 'Open',
                created: 'Today'
              };
              setTickets([newTicket, ...tickets]);
              showToast('Support ticket created successfully.');
              setTicketModalOpen(false);
              setTicketForm({
                subject: '',
                category: 'Technical',
                priority: 'Normal',
                application: 'Sales Software',
                description: '',
                attachment: null
              });
            }}>
              <div className="oxoo-modal-body">
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Subject</label>
                  <input
                    type="text"
                    required
                    className="oxoo-form-input"
                    placeholder="e.g. Login issue in Sales App"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Category</label>
                    <select
                      className="oxoo-form-select"
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    >
                      <option value="Technical">Technical</option>
                      <option value="Billing">Billing</option>
                      <option value="Account">Account</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Priority</label>
                    <select
                      className="oxoo-form-select"
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Application</label>
                  <select
                    className="oxoo-form-select"
                    value={ticketForm.application}
                    onChange={(e) => setTicketForm({ ...ticketForm, application: e.target.value })}
                  >
                    <option value="Sales Software">Sales Software</option>
                    <option value="HRMS">HRMS</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Description</label>
                  <textarea
                    rows={4}
                    className="oxoo-form-textarea"
                    placeholder="Describe your issue or question in detail..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Attach Files</label>
                  <input
                    type="file"
                    className="oxoo-form-input"
                    onChange={(e) => setTicketForm({ ...ticketForm, attachment: e.target.files[0] })}
                  />
                </div>
              </div>

              <div className="oxoo-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setTicketModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="oxoo-upgrade-btn">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changePwdModalOpen && (
        <div className="oxoo-modal-backdrop" onClick={() => setChangePwdModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="oxoo-modal-header">
              <h3 className="oxoo-modal-title">Change Account Password</h3>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => setChangePwdModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setPwdSuccess('');
              setPwdError('');

              if (!pwdCurrent || !pwdNew || !pwdConfirm) {
                setPwdError('Please complete all password fields.');
                return;
              }
              if (pwdNew.length < 6) {
                setPwdError('New password must be at least 6 characters.');
                return;
              }
              if (pwdNew !== pwdConfirm) {
                setPwdError('New password and confirmation do not match.');
                return;
              }

              setPwdLoading(true);
              try {
                const res = await changePassword({ currentPassword: pwdCurrent, newPassword: pwdNew });
                showToast('Password updated successfully.');
                setChangePwdModalOpen(false);
                setPwdCurrent('');
                setPwdNew('');
                setPwdConfirm('');
              } catch (err) {
                setPwdError(err.message || 'Failed to update password. Please check your current password.');
              } finally {
                setPwdLoading(false);
              }
            }}>
              <div className="oxoo-modal-body">
                {pwdError && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12.5px' }}>
                    {pwdError}
                  </div>
                )}
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Current Password</label>
                  <input
                    type="password"
                    required
                    value={pwdCurrent}
                    onChange={(e) => setPwdCurrent(e.target.value)}
                    placeholder="••••••••••••"
                    className="oxoo-form-input"
                  />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    placeholder="••••••••••••"
                    className="oxoo-form-input"
                  />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    placeholder="••••••••••••"
                    className="oxoo-form-input"
                  />
                </div>
              </div>

              <div className="oxoo-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setChangePwdModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="oxoo-upgrade-btn" disabled={pwdLoading}>
                  {pwdLoading ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {sessionsModalOpen && (
        <div className="oxoo-modal-backdrop" onClick={() => setSessionsModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="oxoo-modal-header">
              <h3 className="oxoo-modal-title">Active Login Sessions</h3>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => setSessionsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="oxoo-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Laptop size={20} color="#0284c7" />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Chrome on Windows 11</strong>
                      <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Active Now • Current Session</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>India (IP: 103.21.24.5)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Smartphone size={20} color="#64748b" />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Safari on iPhone 15 Pro</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Last active: Yesterday at 08:30 PM</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{ background: '#fee2e2', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => showToast('Session revoked.')}
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </div>
            <div className="oxoo-modal-footer">
              <button
                type="button"
                className="oxoo-outline-btn"
                onClick={() => setSessionsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
