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
  Smartphone, ChevronRight, MoreHorizontal, Eye, ShieldCheck, CheckSquare
} from 'lucide-react';
import {
  getCustomerOverview, getCustomerBilling, upgradeCustomerPlan,
  getCustomerTeam, inviteTeamMember, removeTeamMember,
  getCustomerTickets, createCustomerTicket, changePassword
} from './api';
import './dashboards.css';

// Mini customer logo preview badge component
function CustomerBrandBadge({ companyName }) {
  const cleanName = (companyName || 'RetailMart Solutions').replace(/\.(oxoo|com|ai)$/i, '').trim();
  const initial = cleanName.charAt(0).toUpperCase() || 'R';
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 10px',
      background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(56, 189, 248, 0.12) 100%)',
      border: '1px solid rgba(56, 189, 248, 0.35)',
      borderRadius: '20px'
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
  // Navigation tabs: dashboard, apps, billing, team, support, reports, notifications, settings
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Settings subtab: account, security, preferences
  const [settingsSubTab, setSettingsSubTab] = useState('account');
  
  // Billing subtab: invoices, payment_history, subscription_details
  const [billingSubTab, setBillingSubTab] = useState('invoices');

  // Support ticket filter: all, open, in_progress, resolved, closed
  const [ticketFilter, setTicketFilter] = useState('all');

  // Notifications filter: all, updates, support, system
  const [notifFilter, setNotifFilter] = useState('all');

  // App status filter: all, active, not_purchased
  const [appStatusFilter, setAppStatusFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');

  // Modals & Popovers
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState('Enterprise');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Forms
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Member' });
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'Technical', description: '', priority: 'Medium' });

  // Password & Security State
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [twoFaEnabled, setTwoFaEnabled] = useState(true);

  // Settings & Preferences
  const [prefEmailNotifs, setPrefEmailNotifs] = useState(true);
  const [prefProductUpdates, setPrefProductUpdates] = useState(true);
  const [prefMarketing, setPrefMarketing] = useState(false);
  const [prefLanguage, setPrefLanguage] = useState('English');
  const [prefTimezone, setPrefTimezone] = useState('(GMT+05:30) Asia/Kolkata');
  const [prefCurrency, setPrefCurrency] = useState('INR (₹)');

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: 'Priya Sharma',
    email: 'priya@retailmart.com',
    phone: '+91 98765 43210',
    company: 'RetailMart Solutions',
    website: 'https://retailmart.com',
    country: 'India'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Static reference data matching design image
  const defaultInvoices = [
    { id: '1', invoice_number: 'INV-2026-0614197', date: '21 Oct 2026', plan: 'Single Software', amount: '₹660.8', status: 'Paid' },
    { id: '2', invoice_number: 'INV-2026-2761912', date: '21 Oct 2026', plan: 'Single Software', amount: '₹7,929.6', status: 'Paid' },
    { id: '3', invoice_number: 'INV-2026-1048201', date: '21 Sep 2026', plan: 'Single Software', amount: '₹660.8', status: 'Paid' },
    { id: '4', invoice_number: 'INV-2026-0074610', date: '21 Aug 2026', plan: 'Single Software', amount: '₹660.8', status: 'Paid' }
  ];

  const defaultTeamMembers = [
    { id: '1', name: 'Priya Sharma (You)', email: 'priya@retailmart.com', role: 'Owner', status: 'Active', joined: '01 Oct 2026' },
    { id: '2', name: 'Rahul Mehta', email: 'rahul@retailmart.com', role: 'Admin', status: 'Active', joined: '12 Oct 2026' },
    { id: '3', name: 'Sneha Gupta', email: 'sneha@retailmart.com', role: 'Member', status: 'Active', joined: '15 Oct 2026' },
    { id: '4', name: 'Amit Verma', email: 'amit@retailmart.com', role: 'Member', status: 'Pending', joined: '22 Oct 2026' }
  ];

  const defaultTickets = [
    { id: '1', number: 'OX00-1283', subject: 'Login issue in Sales App', category: 'Technical', status: 'Open', created: '23 Oct 2026' },
    { id: '2', number: 'OX00-1282', subject: 'Invoice not generating', category: 'Billing', status: 'In Progress', created: '21 Oct 2026' },
    { id: '3', number: 'OX00-1256', subject: 'Request for new user', category: 'Account', status: 'Resolved', created: '17 Oct 2026' },
    { id: '4', number: 'OX00-1234', subject: 'Feature request: Reports', category: 'Feature Request', status: 'Closed', created: '12 Oct 2026' }
  ];

  const defaultNotifications = [
    { id: '1', title: 'Payment Received', desc: 'Your payment of ₹660.8 was successful.', time: '21 Oct 2026, 12:16 PM', category: 'updates', icon: 'credit' },
    { id: '2', title: 'New Team Member', desc: 'Rahul Mehta has been added to your team.', time: '21 Oct 2026, 11:43 AM', category: 'system', icon: 'user' },
    { id: '3', title: 'Support Ticket Updated', desc: 'Ticket #OX00-1282 status changed to In Progress.', time: '21 Oct 2026, 10:05 AM', category: 'support', icon: 'ticket' },
    { id: '4', title: 'Application Access', desc: 'You have been granted access to Sales Software.', time: '20 Oct 2026, 04:15 PM', category: 'system', icon: 'apps' },
    { id: '5', title: 'Invoice Generated', desc: 'New invoice INV-2026-0614197 has been generated.', time: '20 Oct 2026, 09:30 AM', category: 'updates', icon: 'file' }
  ];

  const allDirectoryApps = [
    { id: 'sales', name: 'Sales Software', desc: 'Business management & sales tracking', status: 'Active', purchasedDate: '01 Oct 2026', entitled: true, color: 'blue' },
    { id: 'hrms', name: 'HRMS', desc: 'Employee management system', status: 'Active', purchasedDate: '12 Sep 2026', entitled: true, color: 'purple' },
    { id: 'finance', name: 'Finance', desc: 'Accounting, invoicing & reports', status: 'Not Purchased', purchasedDate: null, entitled: false, color: 'green' },
    { id: 'marketing', name: 'Marketing', desc: 'Email campaigns & marketing tools', status: 'Not Purchased', purchasedDate: null, entitled: false, color: 'orange' }
  ];

  // Dynamic overview state
  const [overview, setOverview] = useState({
    customerName: 'Priya Sharma',
    company: 'RetailMart Solutions',
    email: 'priya@retailmart.com',
    avatar: 'P',
    currentPlan: 'Single Software',
    nextBillingDate: '30 Days',
    monthlyRate: '₹660.8',
    activeAppsCount: 1,
    totalPurchasedApps: 1,
    teamMembersCount: 1,
    monthlyUsage: 1420,
    openTicketsCount: 0,
    storageId: 'STG-08643413'
  });

  const [teamMembers, setTeamMembers] = useState(defaultTeamMembers);
  const [tickets, setTickets] = useState(defaultTickets);
  const [notifications, setNotifications] = useState(defaultNotifications);

  // Initialize from session / localStorage if customer customizes their brand or logs in
  useEffect(() => {
    try {
      let storedUser = null;
      try {
        const su = localStorage.getItem('oxoo_user');
        if (su) storedUser = JSON.parse(su);
      } catch (e) {}

      const customCompany = localStorage.getItem('oxoo_demo_company') || localStorage.getItem('oxoo_company_name');

      if (storedUser || customCompany) {
        const effectiveName = storedUser?.name || 'Priya Sharma';
        const effectiveComp = customCompany || storedUser?.organization || 'RetailMart Solutions';
        const effectiveEmail = storedUser?.email || 'priya@retailmart.com';
        
        setOverview(prev => ({
          ...prev,
          customerName: effectiveName,
          company: effectiveComp,
          email: effectiveEmail,
          avatar: effectiveName.charAt(0).toUpperCase() || 'P'
        }));

        setProfileData(prev => ({
          ...prev,
          name: effectiveName,
          email: effectiveEmail,
          company: effectiveComp
        }));
      }
    } catch (e) {
      console.error('Error hydrating customer data', e);
    }
  }, []);

  // Shared secret service key matching Oxoo Finance & other software
  const OXOO_FINANCE_SERVICE_KEY = "OXOO-FIN-2026-SECURE-KEY";

  // App Launch Handler (passing service key & customer logo to the destination software)
  const handleOpenApp = (app) => {
    if (!app.entitled) {
      showToast(`${app.name} is not included in your Single Software plan. Click Upgrade to access.`);
      setSelectedPlanToUpgrade('Enterprise');
      setUpgradeModalOpen(true);
      return;
    }

    const companySlug = overview.company || 'RetailMart Solutions';
    const cleanCompName = companySlug.replace(/\.(oxoo|com|ai)$/i, '');

    if (app.id === 'finance') {
      const financeUrl = `https://oxoo-finance.onrender.com/?service_key=${OXOO_FINANCE_SERVICE_KEY}&user=${encodeURIComponent(overview.email)}&company=${encodeURIComponent(companySlug)}&company_name=${encodeURIComponent(cleanCompName)}&storage_id=${encodeURIComponent(overview.storageId)}`;
      window.open(financeUrl, '_blank');
      return;
    }

    navigate(`/apps/${app.id}`, {
      state: { companyName: overview.company, appName: app.name, serviceKey: OXOO_FINANCE_SERVICE_KEY }
    });
  };

  // Sparkline mini SVG
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
          1. SIDEBAR (Dark Navy, Logo, 8 Navigation Tabs, Profile)
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

          {/* Navigation Menu (8 Items Matching Customer Portal Prompt) */}
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

        {/* Sidebar Bottom Profile (Priya Sharma / RetailMart Solutions) */}
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
          2. MAIN VIEWPORT (Header & Content Area)
          --------------------------------------------------------- */}
      <div className="oxoo-main-viewport">
        {/* Top Header Bar */}
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
            {/* Customer Brand Logo Preview (Live badge showing customer's demo/brand logo) */}
            <CustomerBrandBadge companyName={overview.company} />

            {/* Customer Portal Pill Badge */}
            <div className="oxoo-portal-badge-pill">
              <ShieldCheck size={14} />
              <span>Customer Portal</span>
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
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
            </div>

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
                      width: '230px',
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
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#0284c7', fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                    >
                      Admin Console
                    </button>
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#dc2626', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => navigate('/signin')}
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Global Toast */}
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

        {/* Content Canvas */}
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
                  <button
                    type="button"
                    className="oxoo-upgrade-btn"
                    onClick={() => setUpgradeModalOpen(true)}
                  >
                    Upgrade Plan
                  </button>
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
                    <span className="oxoo-metric-badge green">
                      +100%
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Active Apps</span>
                      <span className="oxoo-metric-value">{overview.activeAppsCount}</span>
                      <span className="oxoo-metric-subtitle">of {overview.totalPurchasedApps} purchased</span>
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
                    <span className="oxoo-metric-badge green">
                      +0%
                    </span>
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
                    <span className="oxoo-metric-badge green">
                      +12%
                    </span>
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
                    <span className="oxoo-metric-badge red">
                      +0%
                    </span>
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
                    <div className="oxoo-app-tile" style={{ padding: '20px 16px' }}>
                      <div className="oxoo-app-icon-box gradient-blue">
                        <Layers size={26} />
                      </div>
                      <span className="oxoo-app-name" style={{ fontSize: '15px' }}>Sales Software</span>
                      <span className="oxoo-status-pill active">
                        <span className="oxoo-status-dot" /> Active
                      </span>
                      <button
                        type="button"
                        className="oxoo-app-action-btn open"
                        onClick={() => handleOpenApp({ id: 'sales', name: 'Sales Software', entitled: true })}
                      >
                        Open App →
                      </button>
                    </div>
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

              {/* Search & Filter Controls */}
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

              {/* 4 Application Cards Grid */}
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
                            Purchased on {app.purchasedDate}
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
                  <button
                    type="button"
                    className="oxoo-upgrade-btn"
                    onClick={() => setUpgradeModalOpen(true)}
                  >
                    Change Plan
                  </button>
                </div>

                {/* Plan Card */}
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
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Single Software</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#0284c7', margin: '2px 0' }}>₹660.8 / month</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Next billing date: 30 Nov 2026</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <CreditCard size={20} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>Visa •••• 4242</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Expires 12/2028</div>
                      </div>
                      <span
                        style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, cursor: 'pointer', marginLeft: '6px' }}
                        onClick={() => showToast('Payment method update request initiated.')}
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
                              onClick={() => showToast(`Downloaded invoice ${inv.invoice_number}.pdf`)}
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

              {/* 4 Stat Summary Pills */}
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

              {/* Filter Row */}
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
                  <select className="oxoo-select-filter">
                    <option>All Roles</option>
                    <option>Owner</option>
                    <option>Admin</option>
                    <option>Member</option>
                  </select>
                </div>
              </div>

              {/* Members Table */}
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
                      .filter(m => m.name.toLowerCase().includes(teamSearch.toLowerCase()) || m.email.toLowerCase().includes(teamSearch.toLowerCase()))
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

              {/* Filter Pills Bar */}
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

              {/* Search + Category Filter */}
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
                  <select className="oxoo-select-filter">
                    <option>All Categories</option>
                    <option>Technical</option>
                    <option>Billing</option>
                    <option>Account</option>
                    <option>Feature Request</option>
                  </select>
                </div>
              </div>

              {/* Tickets Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th>#</th>
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
                        const matchFilter = ticketFilter === 'all' ||
                          (ticketFilter === 'open' && t.status === 'Open') ||
                          (ticketFilter === 'in_progress' && t.status === 'In Progress') ||
                          (ticketFilter === 'resolved' && t.status === 'Resolved') ||
                          (ticketFilter === 'closed' && t.status === 'Closed');
                        return matchQuery && matchFilter;
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
                              onClick={() => showToast(`Viewing ticket ${t.number}`)}
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
                <div className="oxoo-section-header" style={{ marginBottom: '18px' }}>
                  <div>
                    <h2 className="oxoo-section-title">Reports & Usage Analytics</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Track your application usage and business insights.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="oxoo-date-badge-btn"
                    onClick={() => showToast('Date range selected: 01 Oct 2026 - 31 Oct 2026')}
                  >
                    <Calendar size={14} color="#0284c7" />
                    <span>01 Oct 2026 - 31 Oct 2026</span>
                  </button>
                </div>

                {/* 4 Analytics KPI Cards */}
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

                {/* 2-Column Grid: Usage Trend Chart + Top Features Breakdown */}
                <div className="oxoo-analytics-grid">
                  {/* Left: Usage Trend Chart */}
                  <div className="oxoo-usage-chart-wrap">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Usage Trend</h3>
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

                    {/* SVG Line Chart */}
                    <div style={{ width: '100%', height: '230px', position: 'relative' }}>
                      <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="160" x2="600" y2="160" stroke="#f1f5f9" strokeWidth="1" />

                        {/* Area fill */}
                        <polygon
                          fill="url(#blueGrad)"
                          points="30,150 110,130 190,140 280,90 380,105 480,50 560,30 560,190 30,190"
                        />

                        {/* Transactions Line (Blue) */}
                        <polyline
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="30,150 110,130 190,140 280,90 380,105 480,50 560,30"
                        />
                        {/* Transactions Points */}
                        {[[30,150],[110,130],[190,140],[280,90],[380,105],[480,50],[560,30]].map(([cx, cy], i) => (
                          <circle key={i} cx={cx} cy={cy} r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                        ))}

                        {/* Active Users Line (Cyan) */}
                        <polyline
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="30,170 110,165 190,160 280,145 380,140 480,120 560,110"
                        />
                        {/* Active Users Points */}
                        {[[30,170],[110,165],[190,160],[280,145],[380,140],[480,120],[560,110]].map(([cx, cy], i) => (
                          <circle key={i} cx={cx} cy={cy} r="3" fill="#ffffff" stroke="#06b6d4" strokeWidth="2" />
                        ))}
                      </svg>
                    </div>

                    {/* X-Axis labels */}
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

                  {/* Right: Top Features Breakdown */}
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
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => showToast('All notifications marked as read.')}
                >
                  Mark all as read
                </button>
              </div>

              {/* Tabs: All | Updates | Support | System */}
              <div className="oxoo-filter-pills-bar">
                {['all', 'updates', 'support', 'system'].map((f) => (
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

              {/* Notifications List */}
              <div className="oxoo-notifications-feed">
                {notifications
                  .filter(n => notifFilter === 'all' || n.category === notifFilter)
                  .map((notif) => (
                    <div key={notif.id} className="oxoo-notification-card">
                      <div className="oxoo-notification-icon" style={{
                        background: notif.icon === 'credit' ? '#ecfdf5' :
                          notif.icon === 'user' ? '#eff6ff' :
                          notif.icon === 'ticket' ? '#fef3c7' :
                          notif.icon === 'apps' ? '#f3e8ff' : '#f1f5f9',
                        color: notif.icon === 'credit' ? '#10b981' :
                          notif.icon === 'user' ? '#0284c7' :
                          notif.icon === 'ticket' ? '#d97706' :
                          notif.icon === 'apps' ? '#8b5cf6' : '#64748b'
                      }}>
                        {notif.icon === 'credit' && <CreditCard size={18} />}
                        {notif.icon === 'user' && <UserPlus size={18} />}
                        {notif.icon === 'ticket' && <MessageSquare size={18} />}
                        {notif.icon === 'apps' && <Layers size={18} />}
                        {notif.icon === 'file' && <FileText size={18} />}
                      </div>

                      <div className="oxoo-notification-content">
                        <span className="oxoo-notification-title">{notif.title}</span>
                        <span className="oxoo-notification-desc">{notif.desc}</span>
                      </div>

                      <span className="oxoo-notification-time">{notif.time}</span>
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
                  SUBTAB 1: ACCOUNT PROFILE (VIEW 7)
                  ------------------------------------------------------- */}
              {settingsSubTab === 'account' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 className="oxoo-section-title">Account Profile</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Manage your personal and company information.
                    </p>
                  </div>

                  {/* Profile Summary Card */}
                  <div className="oxoo-profile-summary-header">
                    <div className="oxoo-profile-avatar-big">
                      {profileData.name.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
                        {profileData.name}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#0284c7', fontWeight: 600 }}>Owner</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{profileData.company}</div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setOverview(prev => ({
                      ...prev,
                      customerName: profileData.name,
                      company: profileData.company,
                      email: profileData.email,
                      avatar: profileData.name.charAt(0).toUpperCase()
                    }));
                    showToast('Profile information saved successfully!');
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

                    <div style={{ marginTop: '8px' }}>
                      <button type="submit" className="oxoo-upgrade-btn">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* -------------------------------------------------------
                  SUBTAB 2: SECURITY & LOGIN (VIEW 9)
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
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Last changed 3 months ago</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => showToast('Password change form opened below.')}
                      >
                        Change Password
                      </button>
                    </div>

                    {/* Two-Factor Authentication Toggle */}
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <Shield size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Two-Factor Authentication</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Add an extra layer of security.</div>
                        </div>
                      </div>
                      <label className="oxoo-switch-toggle">
                        <input
                          type="checkbox"
                          checked={twoFaEnabled}
                          onChange={(e) => {
                            setTwoFaEnabled(e.target.checked);
                            showToast(`Two-Factor Authentication ${e.target.checked ? 'enabled' : 'disabled'}`);
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
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                            Authenticator App <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>(Google Authenticator)</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Use TOTP app for verification codes</div>
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
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Receive login verification codes via SMS</div>
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
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Manage your active sessions and devices.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => showToast('Current session: Chrome on Windows (Active now)')}
                      >
                        View Sessions
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------
                  SUBTAB 3: SETTINGS & PREFERENCES (VIEW 10)
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
                    showToast('Preferences saved successfully!');
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Language */}
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
                        <option value="German">German (Deutsch)</option>
                      </select>
                    </div>

                    {/* Timezone */}
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
                        <option value="(GMT+08:00) Asia/Singapore">(GMT+08:00) Asia/Singapore</option>
                      </select>
                    </div>

                    {/* Currency */}
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
                        <option value="GBP (£)">GBP (£)</option>
                        <option value="AED (د.إ)">AED (د.إ)</option>
                      </select>
                    </div>

                    <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

                    {/* Toggles */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Email Notifications</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Receive important updates and alerts.</div>
                        </div>
                        <label className="oxoo-switch-toggle">
                          <input
                            type="checkbox"
                            checked={prefEmailNotifs}
                            onChange={(e) => setPrefEmailNotifs(e.target.checked)}
                          />
                          <span className="oxoo-slider" />
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Product Updates</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Get notified about new features.</div>
                        </div>
                        <label className="oxoo-switch-toggle">
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
                        <label className="oxoo-switch-toggle">
                          <input
                            type="checkbox"
                            checked={prefMarketing}
                            onChange={(e) => setPrefMarketing(e.target.checked)}
                          />
                          <span className="oxoo-slider" />
                        </label>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <button type="submit" className="oxoo-upgrade-btn">
                        Save Preferences
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ---------------------------------------------------------
          3. INTERACTIVE MODALS
          --------------------------------------------------------- */}

      {/* Upgrade Plan Modal */}
      {upgradeModalOpen && (
        <div className="oxoo-modal-backdrop" onClick={() => setUpgradeModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="oxoo-modal-header">
              <h3 className="oxoo-modal-title">Upgrade Your OXOO Plan</h3>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => setUpgradeModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setOverview(prev => ({ ...prev, currentPlan: selectedPlanToUpgrade }));
              showToast(`Plan successfully upgraded to ${selectedPlanToUpgrade}!`);
              setUpgradeModalOpen(false);
            }}>
              <div className="oxoo-modal-body">
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Unlock additional applications, higher seat limits, and premium dedicated SLA support.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'Single Software', price: '₹660.8/mo', seats: '1 User', apps: '1 App (Current)' },
                    { name: 'Custom Pack', price: '₹2,499/mo', seats: '5 Users', apps: '3 Apps' },
                    { name: 'Full Suite', price: '₹7,929.6/yr', seats: '15 Users', apps: 'All Apps' },
                    { name: 'Enterprise', price: 'Custom', seats: 'Unlimited', apps: 'All 24 Apps + SLA' }
                  ].map((p) => (
                    <label
                      key={p.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: selectedPlanToUpgrade === p.name ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        background: selectedPlanToUpgrade === p.name ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="radio"
                          name="upgradePlan"
                          value={p.name}
                          checked={selectedPlanToUpgrade === p.name}
                          onChange={() => setSelectedPlanToUpgrade(p.name)}
                        />
                        <div>
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>{p.name}</strong>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{p.seats} • {p.apps}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{p.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="oxoo-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setUpgradeModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="oxoo-upgrade-btn">
                  Confirm Upgrade to {selectedPlanToUpgrade}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              showToast(`Invitation sent to ${inviteForm.email}`);
              setInviteModalOpen(false);
              setInviteForm({ name: '', email: '', role: 'Member' });
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
                number: `OX00-${Math.floor(1000 + Math.random() * 9000)}`,
                subject: ticketForm.subject,
                category: ticketForm.category,
                status: 'Open',
                created: 'Today'
              };
              setTickets([newTicket, ...tickets]);
              showToast(`Support ticket ${newTicket.number} created!`);
              setTicketModalOpen(false);
              setTicketForm({ subject: '', category: 'Technical', description: '', priority: 'Medium' });
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
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Detailed Description</label>
                  <textarea
                    rows={4}
                    className="oxoo-form-textarea"
                    placeholder="Describe your issue or question in detail..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
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
    </div>
  );
}
