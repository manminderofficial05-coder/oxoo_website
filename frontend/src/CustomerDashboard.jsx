import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Layers, CreditCard, Users, HelpCircle, Settings,
  Search, Bell, ChevronDown, Check, ArrowRight, ExternalLink,
  Crown, BarChart2, FileText, Receipt, UserCheck, Globe, Megaphone,
  CheckCircle2, AlertCircle, Plus, Download, X, Shield, Lock,
  Mail, Phone, Clock, MessageSquare, RefreshCw, Filter, Sparkles,
  Laptop, Cpu, LogOut, Building, Trash2, UserPlus, Send
} from 'lucide-react';
import {
  getCustomerOverview, getCustomerBilling, upgradeCustomerPlan,
  getCustomerTeam, inviteTeamMember, removeTeamMember,
  getCustomerTickets, createCustomerTicket
} from './api';
import './dashboards.css';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tickets, setTickets] = useState([]);
  
  // Modals & Popovers
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState('Enterprise');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Forms
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Member', apps: 'all' });
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', priority: 'Medium' });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let storedUser = null;
        try {
          const su = localStorage.getItem('oxoo_user');
          if (su) storedUser = JSON.parse(su);
        } catch (e) {}

        const userEmail = storedUser?.email || '';
        const userCompany = storedUser?.organization || '';

        const [ovData, billData, teamData, tktData] = await Promise.all([
          getCustomerOverview({ email: userEmail, company: userCompany }),
          getCustomerBilling({ email: userEmail, company: userCompany }),
          getCustomerTeam(),
          getCustomerTickets()
        ]);

        // Merge with locally stored purchased apps and user session
        let localPurchased = [];
        try {
          const lp = localStorage.getItem('oxoo_purchased_apps');
          if (lp) localPurchased = JSON.parse(lp);
        } catch (e) {}

        const canonicalModuleDefs = {
          'finance': { id: 'finance', name: 'Finance Software', category: 'Finance Suite', demoUrl: '/apps/finance' },
          'sales': { id: 'sales', name: 'Sales Software', category: 'Sales Suite', demoUrl: '/apps/sales' },
          'supply-chain': { id: 'supply-chain', name: 'Supply Chain Software', category: 'Operations Suite', demoUrl: '/apps/supply-chain' },
          'human-resources': { id: 'human-resources', name: 'Human Resources Software', category: 'HR Suite', demoUrl: '/apps/human-resources' },
          'productivity': { id: 'productivity', name: 'Productivity Software', category: 'Productivity Suite', demoUrl: '/apps/productivity' }
        };

        const getCanonicalKey = (item) => {
          if (!item) return '';
          const str = (typeof item === 'string' ? item : (item.id || item.name || '')).toLowerCase().trim();
          if (str.includes('sale')) return 'sales';
          if (str.includes('supply') || str.includes('chain') || str.includes('inventory')) return 'supply-chain';
          if (str.includes('human') || str.includes('resource') || str.includes('hr')) return 'human-resources';
          if (str.includes('productivity') || str.includes('ai') || str.includes('artificial')) return 'productivity';
          if (str.includes('finance') || str.includes('account')) return 'finance';
          return str.replace(/\s+/g, '-');
        };

        const appMap = new Map();

        // 1. Add apps from backend overview
        (ovData?.purchasedApps || []).forEach((app) => {
          const key = getCanonicalKey(app);
          const base = canonicalModuleDefs[key] || {
            id: key,
            name: app.name || key,
            category: app.category || 'Business Suite',
            demoUrl: app.demoUrl || `/apps/${key}`
          };
          if (key && !appMap.has(key)) {
            appMap.set(key, { ...base, entitled: true, status: 'Active' });
          }
        });

        // 2. Add apps from local storage
        localPurchased.forEach((app) => {
          const key = getCanonicalKey(app);
          const base = canonicalModuleDefs[key] || {
            id: key,
            name: app.name || key,
            category: app.category || 'Business Suite',
            demoUrl: app.demoUrl || `/apps/${key}`
          };
          if (key && !appMap.has(key)) {
            appMap.set(key, { ...base, entitled: true, status: 'Active' });
          }
        });

        const mergedApps = Array.from(appMap.values());
        const activeCount = mergedApps.filter(a => a.entitled).length;

        const effectiveOverview = {
          ...ovData,
          customerName: storedUser?.name || ovData?.customerName || 'Customer Admin',
          company: storedUser?.organization || ovData?.company || 'My Organization',
          email: storedUser?.email || ovData?.email || 'admin@organization.com',
          avatar: (storedUser?.name || ovData?.customerName || 'C').charAt(0).toUpperCase(),
          currentPlan: storedUser?.plan || ovData?.currentPlan || (mergedApps.length > 1 ? 'Custom Softwares' : 'Single Software'),
          purchasedApps: mergedApps,
          activeAppsCount: activeCount > 0 ? activeCount : (ovData?.activeAppsCount || 0),
          totalPurchasedApps: mergedApps.length > 0 ? mergedApps.length : (ovData?.totalPurchasedApps || 0)
        };

        setOverview(effectiveOverview);
        if (billData) setBillingData(billData);
        if (teamData?.members) setTeamMembers(teamData.members);
        if (tktData?.tickets) setTickets(tktData.tickets);
      } catch (err) {
        console.error('Failed to load customer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Listen for order placements or auth changes to re-sync dashboard instantly
    window.addEventListener('oxoo_order_placed', loadData);
    window.addEventListener('oxoo_auth_change', loadData);
    return () => {
      window.removeEventListener('oxoo_order_placed', loadData);
      window.removeEventListener('oxoo_auth_change', loadData);
    };
  }, []);

  // Handle plan upgrade
  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();
    try {
      await upgradeCustomerPlan(selectedPlanToUpgrade);
      showToast(`Plan successfully upgraded to ${selectedPlanToUpgrade}!`);
      setUpgradeModalOpen(false);
      if (overview) {
        setOverview({ ...overview, currentPlan: selectedPlanToUpgrade });
      }
    } catch (err) {
      showToast('Error upgrading plan. Please try again.');
    }
  };

  // Handle invite team member
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) return;
    try {
      const res = await inviteTeamMember({
        name: inviteForm.name,
        email: inviteForm.email,
        role: inviteForm.role
      });
      if (res?.member) {
        setTeamMembers([res.member, ...teamMembers]);
      }
      showToast(`Invitation sent to ${inviteForm.email}`);
      setInviteModalOpen(false);
      setInviteForm({ name: '', email: '', role: 'Member', apps: 'all' });
    } catch (err) {
      showToast('Failed to send invitation');
    }
  };

  // Handle remove team member
  const handleRemoveMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from ABC Technologies?`)) return;
    try {
      await removeTeamMember(id);
      setTeamMembers(teamMembers.filter(m => m.id !== id));
      showToast(`${name} was removed from the team.`);
    } catch (err) {
      showToast('Error removing team member');
    }
  };

  // Handle create ticket
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject) return;
    try {
      const res = await createCustomerTicket(ticketForm);
      if (res?.ticket) {
        setTickets([res.ticket, ...tickets]);
      }
      showToast(`Support ticket ${res?.ticket?.ticket_number || '#new'} created!`);
      setTicketModalOpen(false);
      setTicketForm({ subject: '', description: '', priority: 'Medium' });
    } catch (err) {
      showToast('Failed to create ticket');
    }
  };

  // Shared secret service key matching Oxoo Finance
  const OXOO_FINANCE_SERVICE_KEY = "OXOO-FIN-2026-SECURE-KEY";

  // Application launch handler with strict entitlement verification
  const handleOpenApp = (app) => {
    if (!app.entitled) {
      showToast(`Your organization has not purchased ${app.name}. Please upgrade to access.`);
      setSelectedPlanToUpgrade('Enterprise');
      setUpgradeModalOpen(true);
      return;
    }
    const slug = (app.id || (app.name ? app.name.toLowerCase().replace(/\s+/g, '-') : 'accounting')).toLowerCase();

    // If opening Finance/Accounting, launch authenticated live suite with service key
    if (slug === 'finance' || slug.includes('finance') || slug === 'accounting') {
      const financeUrl = `https://oxoo-finance.onrender.com/?service_key=${OXOO_FINANCE_SERVICE_KEY}&user=${encodeURIComponent(overview?.email || storedUser?.email || 'customer')}`;
      window.open(financeUrl, '_blank');
      return;
    }

    navigate(`/apps/${slug}`, {
      state: { companyName: overview?.company || 'My Organization', appName: app.name }
    });
  };

  // Sparkline mini SVG
  const renderSparkline = (color = '#10b981', points = '0,25 20,20 40,24 60,12 80,8') => (
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
          1. SIDEBAR (Dark Navy, Glowing Capsule, Logo, Profile)
          --------------------------------------------------------- */}
      <aside className={`oxoo-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="oxoo-sidebar-top">
          {/* Logo & Tagline */}
          <Link to="/" className="oxoo-brand-container">
            <div className="oxoo-brand-logo-wrap">
              <img
                src="/oxoo-logo-white.png"
                alt="Oxoo"
                className="oxoo-brand-logo-img"
              />
            </div>
            <span className="oxoo-tagline-text">One Platform. Infinite Possibilities.</span>
          </Link>

          {/* Navigation Links */}
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
              className={`oxoo-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="oxoo-nav-icon" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Profile */}
        <div className="oxoo-sidebar-bottom">
          <div className="oxoo-fluid-waves-art" />
          <div
            className="oxoo-sidebar-profile"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="oxoo-profile-avatar-circle">
              {overview?.avatar || 'A'}
            </div>
            <div className="oxoo-profile-meta">
              <span className="oxoo-profile-name">{overview?.customerName || 'Alex Johnson'}</span>
              <span className="oxoo-profile-sub">{overview?.company || 'ABC Technologies'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------------
          2. MAIN VIEWPORT (Header & Dynamic Content Area)
          --------------------------------------------------------- */}
      <div className="oxoo-main-viewport">
        {/* Top Header */}
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
            {/* Quick Switch to Admin Portal */}
            <button
              type="button"
              className="oxoo-portal-switch-pill"
              onClick={() => navigate('/admin')}
              title="Access Admin Console"
            >
              <Shield size={13} />
              <span>Admin Console</span>
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="oxoo-header-icon-btn"
                onClick={() => setNotifPopoverOpen(!notifPopoverOpen)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="oxoo-badge-dot" />
              </button>

              {/* Notification Popover */}
              <AnimatePresence>
                {notifPopoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '48px',
                      width: '320px',
                      background: '#ffffff',
                      borderRadius: '16px',
                      boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
                      border: '1px solid #e2e8f0',
                      padding: '16px',
                      zIndex: 200
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>Notifications</strong>
                      <span style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer' }} onClick={() => setNotifPopoverOpen(false)}>Close</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '12px', padding: '16px 8px', textAlign: 'center', color: '#94a3b8' }}>
                        No new notifications
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Help Button */}
            <button
              type="button"
              className="oxoo-header-icon-btn"
              onClick={() => {
                setActiveTab('support');
                showToast('Welcome to Oxoo Help & Support');
              }}
              aria-label="Help"
            >
              <HelpCircle size={18} />
            </button>

            {/* User Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="oxoo-user-dropdown-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="oxoo-profile-avatar-circle" style={{ width: '34px', height: '34px' }}>
                  {overview?.avatar || 'A'}
                </div>
                <div className="oxoo-user-info-text">
                  <span className="oxoo-user-name">{overview?.customerName || 'Alex Johnson'}</span>
                  <span className="oxoo-user-org">{overview?.company || 'ABC Technologies'}</span>
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
                      width: '220px',
                      background: '#ffffff',
                      borderRadius: '14px',
                      boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
                      border: '1px solid #e2e8f0',
                      padding: '8px',
                      zIndex: 200
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{overview?.customerName || 'Alex Johnson'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{overview?.email || 'alex@abctech.com'}</div>
                    </div>
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => { setActiveTab('settings'); setUserMenuOpen(false); }}
                    >
                      Profile Settings
                    </button>
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => { setActiveTab('billing'); setUserMenuOpen(false); }}
                    >
                      Billing & Plans
                    </button>
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
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

        {/* Content Canvas */}
        <main className="oxoo-content-canvas">
          {/* TAB 1: DASHBOARD (EXACT REFERENCE DESIGN) */}
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome Row with Plan Card */}
              <div className="oxoo-welcome-row">
                <div>
                  <h1 className="oxoo-welcome-title">
                    Welcome back, {overview?.customerName ? overview.customerName.split(' ')[0] : 'Customer'}!
                  </h1>
                  <p className="oxoo-welcome-subtitle">
                    Manage your business with Oxoo. Access all your purchased apps in one place.
                  </p>
                </div>

                {/* Current Plan Card */}
                <div className="oxoo-plan-card">
                  <div className="oxoo-crown-badge">
                    <Crown size={22} />
                  </div>
                  <div className="oxoo-plan-details">
                    <span className="oxoo-plan-label">Current Plan</span>
                    <span className="oxoo-plan-name">{overview?.currentPlan || 'Free Tier'}</span>
                    <span className="oxoo-plan-billing-date">Next billing: {overview?.nextBillingDate || 'N/A'}</span>
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

              {/* 4 Interactive Summary Cards */}
              <div className="oxoo-summary-grid">
                {/* 1. Active Apps */}
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap blue">
                      <LayoutDashboard size={20} />
                    </div>
                    <span className="oxoo-metric-badge green">
                      ↑ {overview?.activeAppsTrend || '0%'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Active Apps</span>
                      <span className="oxoo-metric-value">{overview?.activeAppsCount ?? 0}</span>
                      <span className="oxoo-metric-subtitle">of {overview?.totalPurchasedApps ?? 0} purchased</span>
                    </div>
                    {renderSparkline('#10b981', '0,20 20,20 40,20 60,20 80,20')}
                  </div>
                </div>

                {/* 2. Team Members */}
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap blue">
                      <Users size={20} />
                    </div>
                    <span className="oxoo-metric-badge green">
                      ↑ {overview?.teamMembersTrend || '0%'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Team Members</span>
                      <span className="oxoo-metric-value">{overview?.teamMembersCount ?? 0}</span>
                      <span className="oxoo-metric-subtitle">active users</span>
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
                      ↑ {overview?.monthlyUsageTrend || '0%'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Monthly Usage</span>
                      <span className="oxoo-metric-value">{overview?.monthlyUsage ? overview.monthlyUsage.toLocaleString('en-IN') : 0}</span>
                      <span className="oxoo-metric-subtitle">total transactions</span>
                    </div>
                    {renderSparkline('#06b6d4', '0,20 20,20 40,20 60,20 80,20')}
                  </div>
                </div>

                {/* 4. Open Support Tickets */}
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap purple">
                      <MessageSquare size={20} />
                    </div>
                    <span className="oxoo-metric-badge red">
                      ↓ {overview?.openTicketsTrend || '0%'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Open Support Tickets</span>
                      <span className="oxoo-metric-value">{overview?.openTicketsCount ?? 0}</span>
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

                  {overview?.purchasedApps && overview.purchasedApps.length > 0 ? (
                    <div className="oxoo-apps-horizontal-grid">
                      {overview.purchasedApps.map((app) => (
                        <div key={app.id} className="oxoo-app-tile">
                          <div className={`oxoo-app-icon-box ${app.entitled ? 'gradient-blue' : 'peach'}`}>
                            <Layers size={26} />
                          </div>
                          <span className="oxoo-app-name">{app.name}</span>
                          <span className={`oxoo-status-pill ${app.entitled ? 'active' : 'not-purchased'}`}>
                            {app.entitled && <span className="oxoo-status-dot" />} {app.status || (app.entitled ? 'Active' : 'Not Purchased')}
                          </span>
                          <button
                            type="button"
                            className={`oxoo-app-action-btn ${app.entitled ? 'open' : 'view-plans'}`}
                            onClick={() => handleOpenApp(app)}
                          >
                            {app.entitled ? 'Open App →' : 'View Plans'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      <Layers size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>No Active Applications</h3>
                      <p style={{ fontSize: '13px', maxWidth: '360px', margin: '0 auto 16px' }}>
                        You haven't activated any application suites yet. Choose from our 24 enterprise apps to get started.
                      </p>
                      <button
                        type="button"
                        className="oxoo-upgrade-btn"
                        onClick={() => navigate('/choose-apps')}
                      >
                        Browse Applications Catalog →
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Recent Activity */}
                <div className="oxoo-section-card">
                  <div className="oxoo-section-header">
                    <h2 className="oxoo-section-title">Recent Activity</h2>
                    <span className="oxoo-view-all-link" onClick={() => setActiveTab('billing')}>
                      View All
                    </span>
                  </div>

                  {overview?.recentActivity && overview.recentActivity.length > 0 ? (
                    <div className="oxoo-activity-list">
                      {overview.recentActivity.map((act, i) => (
                        <div key={i} className="oxoo-activity-item">
                          <div className={`oxoo-activity-icon-circle ${act.type || 'info'}`}>
                            <Check size={16} />
                          </div>
                          <div className="oxoo-activity-content">
                            <span className="oxoo-activity-title">{act.title}</span>
                            <span className="oxoo-activity-desc">{act.desc}</span>
                          </div>
                          <span className="oxoo-activity-time">{act.time}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      <Clock size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                      <p style={{ fontSize: '13px', margin: 0 }}>No recent activity recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: MY APPLICATIONS FULL VIEW */}
          {activeTab === 'apps' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">My Applications Directory</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Access, configure, and monitor entitlements across all Oxoo suite services.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setUpgradeModalOpen(true)}
                >
                  <Plus size={14} style={{ marginRight: '4px' }} /> Add Applications
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {(overview?.purchasedApps || []).map((app) => (
                  <div key={app.id} className="oxoo-app-tile" style={{ padding: '20px' }}>
                    <div className={`oxoo-app-icon-box ${app.entitled ? 'gradient-blue' : 'peach'}`} style={{ width: '50px', height: '50px' }}>
                      <Layers size={22} />
                    </div>
                    <span className="oxoo-app-name" style={{ fontSize: '15px' }}>{app.name}</span>
                    <span className={`oxoo-status-pill ${app.entitled ? 'active' : 'not-purchased'}`}>
                      {app.status}
                    </span>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '14px' }}>
                      {app.entitled ? 'Authorized for active team usage' : 'Requires subscription upgrade'}
                    </p>
                    <button
                      type="button"
                      className={`oxoo-app-action-btn ${app.entitled ? 'open' : 'view-plans'}`}
                      onClick={() => handleOpenApp(app)}
                    >
                      {app.entitled ? 'Launch Workspace →' : 'Upgrade Plan'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BILLING & SUBSCRIPTIONS */}
          {activeTab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Current Plan Overview Banner */}
              <div className="oxoo-section-card" style={{ background: 'linear-gradient(135deg, #0a1b36 0%, #1e3a8a 100%)', color: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Active Enterprise Subscription</span>
                    <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0', color: '#ffffff' }}>{overview?.currentPlan || 'Business Pro'} Plan</h2>
                    <p style={{ color: '#bfdbfe', fontSize: '14px' }}>Next automated billing cycle date: <strong>{overview?.nextBillingDate || '12 Dec 2026'}</strong></p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      style={{ background: '#ffffff', color: '#1d4ed8' }}
                      onClick={() => setUpgradeModalOpen(true)}
                    >
                      Change Plan
                    </button>
                    <button
                      type="button"
                      style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => showToast('Cancellation request submitted to billing support.')}
                    >
                      Cancel Plan
                    </button>
                  </div>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="oxoo-section-card">
                <div className="oxoo-section-header">
                  <h3 className="oxoo-section-title">Billing History & Downloadable Invoices</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>PostgreSQL Verified Ledger</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="oxoo-table">
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>Billing Entity</th>
                        <th>Plan Tier</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const customerOrg = (overview?.company || '').toLowerCase().trim();
                        const displayedInvoices = (billingData?.invoices || []).filter((inv) => {
                          if (!inv) return false;
                          if (!customerOrg) return true;
                          const invComp = (inv.company_name || '').toLowerCase().trim();
                          return invComp === customerOrg || invComp.includes(customerOrg) || customerOrg.includes(invComp);
                        });

                        return displayedInvoices.length > 0 ? (
                          displayedInvoices.map((inv) => (
                            <tr key={inv.id || inv.invoice_number}>
                              <td className="oxoo-table-company">{inv.invoice_number}</td>
                              <td>{inv.company_name}</td>
                              <td>{inv.plan}</td>
                              <td className="oxoo-table-amount">₹{Number(inv.amount || 0).toLocaleString('en-IN')}</td>
                              <td>
                                <span className="oxoo-status-tag active">{inv.status}</span>
                              </td>
                              <td>{new Date(inv.invoice_date).toLocaleDateString('en-GB')}</td>
                              <td>
                                <button
                                  type="button"
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: '#0284c7', cursor: 'pointer' }}
                                  onClick={() => showToast(`Downloading ${inv.invoice_number}.pdf`)}
                                >
                                  <Download size={12} /> PDF
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                              No invoices generated yet for your account.
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEAM MANAGEMENT */}
          {activeTab === 'team' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Team Management</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Used seats: <strong>{teamMembers.length}</strong> active.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setInviteModalOpen(true)}
                >
                  <UserPlus size={14} style={{ marginRight: '6px' }} /> Invite Member
                </button>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th>Team Member</th>
                      <th>Work Email</th>
                      <th>Organization Role</th>
                      <th>Application Entitlement</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers && teamMembers.length > 0 ? (
                      teamMembers.map((member) => (
                        <tr key={member.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="oxoo-profile-avatar-circle" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                {member.name.charAt(0)}
                              </div>
                              <strong>{member.name}</strong>
                            </div>
                          </td>
                          <td>{member.email}</td>
                          <td>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af', background: '#dbeafe', padding: '2px 8px', borderRadius: '6px' }}>
                              {member.role}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: '#64748b' }}>Full Access</td>
                          <td>
                            <span className="oxoo-status-tag active">Active</span>
                          </td>
                          <td>
                            {member.role !== 'Organization Admin' && (
                              <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                onClick={() => handleRemoveMember(member.id, member.name)}
                                title="Remove Member"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                          No team members added yet. Click "Invite Member" to add users.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORT */}
          {activeTab === 'support' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Support & Help Desk</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Track inquiries, technical requests, and direct support interactions.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setTicketModalOpen(true)}
                >
                  <Plus size={14} style={{ marginRight: '6px' }} /> Open New Ticket
                </button>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th>Ticket #</th>
                      <th>Subject</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets && tickets.length > 0 ? (
                      tickets.map((t) => (
                        <tr key={t.id}>
                          <td className="oxoo-table-company">{t.ticket_number || `#${t.id}`}</td>
                          <td style={{ fontWeight: 600 }}>{t.subject}</td>
                          <td>
                            <span className={`oxoo-priority-pill ${String(t.priority).toLowerCase()}`}>
                              {t.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`oxoo-status-tag ${String(t.status).toLowerCase().replace(' ', '-')}`}>
                              {t.status}
                            </span>
                          </td>
                          <td>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : 'Recently'}</td>
                          <td>
                            <button
                              type="button"
                              style={{ background: '#f1f5f9', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#0284c7', cursor: 'pointer' }}
                              onClick={() => showToast(`Viewing ticket ${t.ticket_number || t.id}`)}
                            >
                              View Conversation
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                          No support tickets submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="oxoo-section-card" style={{ maxWidth: '800px' }}>
              <div className="oxoo-section-header">
                <h2 className="oxoo-section-title">Organization Settings & Security</h2>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); showToast('Settings successfully updated!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Organization Legal Name</label>
                  <input type="text" className="oxoo-form-input" defaultValue={overview?.company || "My Organization"} />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Dedicated Oxoo Domain</label>
                  <input type="text" className="oxoo-form-input" defaultValue="workspace.oxoo" disabled style={{ background: '#f8fafc' }} />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Primary Administrator Email</label>
                  <input type="email" className="oxoo-form-input" defaultValue={overview?.email || "admin@organization.com"} />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Enterprise SSO & 2FA Enforcement</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <input type="checkbox" id="twoFa" defaultChecked style={{ width: '18px', height: '18px' }} />
                    <label htmlFor="twoFa" style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                      Enforce Multi-Factor Authentication (MFA) on all team member logins
                    </label>
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <button type="submit" className="oxoo-upgrade-btn">
                    Save Changes
                  </button>
                </div>
              </form>
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
              <h3 className="oxoo-modal-title">Upgrade Your Oxoo Plan</h3>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => setUpgradeModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpgradeSubmit}>
              <div className="oxoo-modal-body">
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Unlock additional applications, higher seat limits, and premium dedicated SLA support.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'Growth', price: '₹25,000/mo', seats: '10 Users', apps: '5 Apps' },
                    { name: 'Business Pro', price: '₹48,200/mo', seats: '15 Users', apps: '8 Apps (Current)' },
                    { name: 'Enterprise', price: '₹1,24,000/mo', seats: 'Unlimited Users', apps: 'All 24 Apps + Dedicated SLA' }
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
            <form onSubmit={handleInviteSubmit}>
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
                  <label className="oxoo-form-label">Corporate Email</label>
                  <input
                    type="email"
                    required
                    className="oxoo-form-input"
                    placeholder="rachel@abctech.com"
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
                    <option value="Finance Lead">Finance Lead</option>
                    <option value="HR Director">HR Director</option>
                    <option value="Operations Manager">Operations Manager</option>
                    <option value="Organization Admin">Organization Admin</option>
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
            <form onSubmit={handleTicketSubmit}>
              <div className="oxoo-modal-body">
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Subject</label>
                  <input
                    type="text"
                    required
                    className="oxoo-form-input"
                    placeholder="e.g. Webhook delivery issue with payment provider"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  />
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
                    placeholder="Please describe the steps to reproduce or what assistance you require..."
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
