import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CreditCard, Package, Layers,
  Receipt, ShieldCheck, HelpCircle, BarChart3, Settings,
  Search, Bell, Calendar, ChevronDown, Check, ArrowRight,
  TrendingUp, ArrowUpRight, DollarSign, Activity, AlertCircle,
  CheckCircle2, Plus, RefreshCw, X, Download, Shield,
  Building2, Phone, Mail, Clock, Filter, Eye, Lock, Edit3
} from 'lucide-react';
import {
  getAdminMetrics, getAdminRevenueChart, getAdminGrowthChart,
  getAdminTopProducts, getAdminCustomers, getAdminTickets,
  updateAdminTicket, updateCustomerStatus
} from './api';
import './dashboards.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Data states
  const [metrics, setMetrics] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [dateRangePickerOpen, setDateRangePickerOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('01 Oct 2026 - 31 Oct 2026');

  // Modals & Notices
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Load all admin data from backend/PostgreSQL
  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);
      try {
        const [mRes, rRes, gRes, pRes, cRes, tRes] = await Promise.all([
          getAdminMetrics(),
          getAdminRevenueChart(selectedPeriod.toLowerCase()),
          getAdminGrowthChart(),
          getAdminTopProducts(),
          getAdminCustomers(),
          getAdminTickets()
        ]);

        if (mRes) setMetrics(mRes);
        if (rRes?.data) setRevenueData(rRes.data);
        if (gRes?.data) setGrowthData(gRes.data);
        if (pRes) setTopProducts(pRes);
        if (cRes) setCustomers(cRes);
        if (tRes) setTickets(tRes);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, [selectedPeriod]);

  // Handle customer suspension / activation
  const handleToggleCustomerStatus = async (company, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await updateCustomerStatus(company, newStatus);
      setCustomers(customers.map(c => c.company === company ? { ...c, status: newStatus } : c));
      showToast(`${company} is now marked as ${newStatus}.`);
    } catch (err) {
      showToast('Failed to update customer status');
    }
  };

  // Handle ticket resolution
  const handleResolveTicket = async (ticketId) => {
    try {
      await updateAdminTicket(ticketId, { status: 'Resolved' });
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved' } : t));
      showToast(`Ticket ${ticketId} resolved successfully.`);
    } catch (err) {
      showToast('Failed to resolve ticket');
    }
  };

  // Interactive Revenue Chart Tooltip calculation
  const maxRevenue = 6000000;
  const chartHeight = 180;
  const chartWidth = 500;

  return (
    <div className="oxoo-dashboard-layout">
      {/* ---------------------------------------------------------
          1. ADMIN SIDEBAR (Dark Navy, Logo, Navigation, Glowing Capsule)
          --------------------------------------------------------- */}
      <aside className="oxoo-sidebar">
        <div className="oxoo-sidebar-top">
          {/* Brand Logo & Tagline */}
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
              className={`oxoo-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <Users className="oxoo-nav-icon" />
              <span>Customers</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              <CreditCard className="oxoo-nav-icon" />
              <span>Subscriptions</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Package className="oxoo-nav-icon" />
              <span>Products & Plans</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <Layers className="oxoo-nav-icon" />
              <span>Applications</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              <Receipt className="oxoo-nav-icon" />
              <span>Payments & Invoices</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <ShieldCheck className="oxoo-nav-icon" />
              <span>Users & Roles</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              <HelpCircle className="oxoo-nav-icon" />
              <span>Support Tickets</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <BarChart3 className="oxoo-nav-icon" />
              <span>Reports</span>
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

        {/* Fluid Waves Bottom Artwork & Admin Profile */}
        <div className="oxoo-sidebar-bottom">
          <div className="oxoo-fluid-waves-art" />
          <div
            className="oxoo-sidebar-profile"
            onClick={() => setAdminMenuOpen(!adminMenuOpen)}
          >
            <div className="oxoo-profile-avatar-circle">
              A
            </div>
            <div className="oxoo-profile-meta">
              <span className="oxoo-profile-name">Admin</span>
              <span className="oxoo-profile-sub">Super Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------------
          2. ADMIN MAIN VIEWPORT
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
                placeholder="Search customers, subscriptions, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="oxoo-header-right">
            {/* Quick Switch to Customer Dashboard */}
            <button
              type="button"
              className="oxoo-portal-switch-pill"
              onClick={() => navigate('/customer')}
              title="Access Customer Portal"
            >
              <Users size={13} />
              <span>Customer Portal</span>
            </button>

            {/* Date-Range Selector Pill */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="oxoo-date-badge-btn"
                onClick={() => setDateRangePickerOpen(!dateRangePickerOpen)}
              >
                <Calendar size={14} color="#64748b" />
                <span>{selectedDateRange}</span>
                <ChevronDown size={13} color="#94a3b8" />
              </button>

              <AnimatePresence>
                {dateRangePickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '46px',
                      width: '240px',
                      background: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
                      border: '1px solid #e2e8f0',
                      padding: '8px',
                      zIndex: 200
                    }}
                  >
                    {[
                      '01 Oct 2026 - 31 Oct 2026',
                      'Last 7 Days',
                      'Last 30 Days',
                      'Q3 2026 (Jul - Sep)',
                      'Year to Date (2026)'
                    ].map((range) => (
                      <button
                        key={range}
                        type="button"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          textAlign: 'left',
                          background: selectedDateRange === range ? '#f0f9ff' : 'none',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: selectedDateRange === range ? 600 : 400,
                          color: selectedDateRange === range ? '#0284c7' : '#334155',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setSelectedDateRange(range);
                          setDateRangePickerOpen(false);
                          showToast(`Reporting window updated: ${range}`);
                        }}
                      >
                        {range}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="oxoo-header-icon-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="oxoo-badge-dot" />
              </button>

              <AnimatePresence>
                {notifOpen && (
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
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>Platform Alerts (1)</strong>
                      <span style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer' }} onClick={() => setNotifOpen(false)}>Close</span>
                    </div>
                    <div style={{ fontSize: '12px', padding: '10px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontWeight: 600, color: '#065f46' }}>PostgreSQL Ledger Reconciled</div>
                      <div style={{ color: '#047857' }}>All 2,856 active tenant subscriptions synced.</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Help Button */}
            <button
              type="button"
              className="oxoo-header-icon-btn"
              onClick={() => showToast('Oxoo Admin Governance SLA: 99.99%')}
              aria-label="Help"
            >
              <HelpCircle size={18} />
            </button>

            {/* Admin Avatar Menu */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="oxoo-user-dropdown-btn"
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              >
                <div className="oxoo-profile-avatar-circle" style={{ width: '34px', height: '34px' }}>
                  A
                </div>
                <div className="oxoo-user-info-text">
                  <span className="oxoo-user-name">Admin</span>
                  <span className="oxoo-user-org">Super Administrator</span>
                </div>
                <ChevronDown size={14} color="#64748b" />
              </button>

              <AnimatePresence>
                {adminMenuOpen && (
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
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Admin Governance</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>admin@oxoo.ai</div>
                    </div>
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => { setActiveTab('settings'); setAdminMenuOpen(false); }}
                    >
                      System Preferences
                    </button>
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => { navigate('/customer'); setAdminMenuOpen(false); }}
                    >
                      Customer View
                    </button>
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#dc2626', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => navigate('/signin')}
                    >
                      Sign Out
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
          {/* TAB 1: DASHBOARD (EXACT REFERENCE DESIGN BOTTOM HALF) */}
          {activeTab === 'dashboard' && (
            <>
              {/* Header Row: Admin Dashboard Title & System Status Panel */}
              <div className="oxoo-admin-top-split">
                <div>
                  <h1 className="oxoo-welcome-title">Admin Dashboard</h1>
                  <p className="oxoo-welcome-subtitle">
                    Overview of your Oxoo platform, customers, revenue and applications.
                  </p>
                </div>

                {/* System Status Panel (Exact match to top right panel) */}
                <div className="oxoo-system-status-card">
                  <div className="oxoo-system-status-header">
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>System Status</strong>
                    <span className="oxoo-status-pill active" style={{ margin: 0 }}>
                      <span className="oxoo-status-dot" /> All Services Operational
                    </span>
                  </div>

                  <div className="oxoo-status-services-list">
                    {(metrics?.systemStatus?.services || [
                      { name: 'Authentication (SSO)', status: 'Operational' },
                      { name: 'Finance Apps', status: 'Operational' },
                      { name: 'HRMS Apps', status: 'Operational' },
                      { name: 'Marketing Apps', status: 'Operational' },
                      { name: 'Website Apps', status: 'Operational' },
                      { name: 'API Services', status: 'Operational' }
                    ]).map((svc) => (
                      <div key={svc.name} className="oxoo-service-row">
                        <span className="oxoo-service-row-name">
                          <span className="oxoo-status-dot" style={{ background: '#10b981' }} />
                          {svc.name}
                        </span>
                        <span className="oxoo-service-row-status">
                          Operational
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4 Admin Summary Cards */}
              <div className="oxoo-summary-grid">
                {/* 1. Total Customers */}
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap blue">
                      <Users size={20} />
                    </div>
                    <span className="oxoo-metric-badge green">
                      ↑ {metrics?.totalCustomersTrend || '12%'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Total Customers</span>
                      <span className="oxoo-metric-value">{metrics?.totalCustomers?.toLocaleString('en-IN') || '1,248'}</span>
                      <span className="oxoo-metric-subtitle">{metrics?.totalCustomersChange || '+132 this month'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Active Subscriptions */}
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap gold">
                      <Package size={20} />
                    </div>
                    <span className="oxoo-metric-badge green">
                      ↑ {metrics?.activeSubscriptionsTrend || '18%'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Active Subscriptions</span>
                      <span className="oxoo-metric-value">{metrics?.activeSubscriptions?.toLocaleString('en-IN') || '2,856'}</span>
                      <span className="oxoo-metric-subtitle">{metrics?.activeSubscriptionsChange || '+436 this month'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Monthly Revenue */}
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap cyan">
                      <BarChart3 size={20} />
                    </div>
                    <span className="oxoo-metric-badge green">
                      ↑ {metrics?.monthlyRevenueTrend || '24%'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Monthly Revenue</span>
                      <span className="oxoo-metric-value">{metrics?.monthlyRevenueFormatted || '₹48,92,000'}</span>
                      <span className="oxoo-metric-subtitle">MRR {metrics?.mrrFormatted || '₹42,10,000'}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Trial Conversions */}
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap purple">
                      <ShieldCheck size={20} />
                    </div>
                    <span className="oxoo-metric-badge green">
                      ↑ {metrics?.trialConversionsTrend || '6%'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Trial Conversions</span>
                      <span className="oxoo-metric-value">{metrics?.trialConversions || 68}%</span>
                      <span className="oxoo-metric-subtitle">{metrics?.trialConversionsConverted || '142 converted'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 Main Interactive Charts: Revenue Overview & Customer Growth */}
              <div className="oxoo-charts-row">
                {/* Chart 1: Revenue Overview */}
                <div className="oxoo-chart-card">
                  <div className="oxoo-chart-header">
                    <span className="oxoo-chart-title">Revenue Overview</span>
                    <select
                      className="oxoo-chart-dropdown"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                    </select>
                  </div>

                  {/* SVG Line Chart with Gradient and Tooltip */}
                  <div className="oxoo-svg-chart-wrap">
                    <svg className="oxoo-chart-svg" viewBox="0 0 500 180">
                      <defs>
                        <linearGradient id="oxooRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Y-axis grid lines and labels */}
                      {[
                        { y: 25, label: '₹60L' },
                        { y: 65, label: '₹45L' },
                        { y: 105, label: '₹30L' },
                        { y: 145, label: '₹15L' }
                      ].map((grid) => (
                        <g key={grid.label}>
                          <line x1="40" y1={grid.y} x2="490" y2={grid.y} stroke="#f1f5f9" strokeDasharray="3 3" />
                          <text x="30" y={grid.y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{grid.label}</text>
                        </g>
                      ))}

                      {/* Area Fill */}
                      <path
                        d="M 50,140 Q 95,130 140,118 T 230,105 T 320,95 T 410,75 T 480,50 L 480,160 L 50,160 Z"
                        fill="url(#oxooRevenueGradient)"
                      />

                      {/* Line Stroke */}
                      <path
                        d="M 50,140 Q 95,130 140,118 T 230,105 T 320,95 T 410,75 T 480,50"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Dots on line */}
                      {[
                        { x: 50, y: 140 }, { x: 95, y: 130 }, { x: 140, y: 118 },
                        { x: 185, y: 112 }, { x: 230, y: 105 }, { x: 275, y: 100 },
                        { x: 320, y: 95 }, { x: 365, y: 88 }, { x: 410, y: 75 },
                        { x: 480, y: 50 }
                      ].map((pt, i) => (
                        <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                      ))}

                      {/* Highlighted Tooltip on Oct point (480, 50) */}
                      <g transform="translate(370, 10)">
                        <rect x="0" y="0" width="105" height="42" rx="8" fill="#0f172a" />
                        <text x="52" y="18" fill="#ffffff" fontSize="12" fontWeight="700" textAnchor="middle">₹48,92,000</text>
                        <text x="52" y="32" fill="#94a3b8" fontSize="10" textAnchor="middle">Oct 2026</text>
                        <line x1="52" y1="42" x2="110" y2="40" stroke="#0f172a" strokeWidth="2" />
                      </g>
                    </svg>

                    {/* X-axis Month Labels */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '45px', paddingRight: '15px', marginTop: '6px' }}>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m) => (
                        <span key={m} style={{ fontSize: '11px', color: '#94a3b8' }}>{m}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chart 2: Customer Growth */}
                <div className="oxoo-chart-card">
                  <div className="oxoo-chart-header">
                    <span className="oxoo-chart-title">Customer Growth</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#38bdf8' }} />
                        New Customers
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#2563eb' }} />
                        Total Customers
                      </div>
                      <select
                        className="oxoo-chart-dropdown"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                      </select>
                    </div>
                  </div>

                  {/* SVG Bar Chart for Customer Growth */}
                  <div className="oxoo-svg-chart-wrap">
                    <svg className="oxoo-chart-svg" viewBox="0 0 500 180">
                      {/* Y-axis grid lines */}
                      {[
                        { y: 25, label: '1.6K' },
                        { y: 65, label: '1.2K' },
                        { y: 105, label: '800' },
                        { y: 145, label: '400' }
                      ].map((grid) => (
                        <g key={grid.label}>
                          <line x1="40" y1={grid.y} x2="490" y2={grid.y} stroke="#f1f5f9" strokeDasharray="3 3" />
                          <text x="30" y={grid.y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{grid.label}</text>
                        </g>
                      ))}

                      {/* Bars for 10 months */}
                      {[
                        { x: 55, newH: 20, totH: 55 },
                        { x: 98, newH: 26, totH: 64 },
                        { x: 141, newH: 32, totH: 74 },
                        { x: 184, newH: 36, totH: 82 },
                        { x: 227, newH: 42, totH: 92 },
                        { x: 270, newH: 48, totH: 100 },
                        { x: 313, newH: 54, totH: 110 },
                        { x: 356, newH: 58, totH: 118 },
                        { x: 399, newH: 64, totH: 126 },
                        { x: 442, newH: 72, totH: 136 }
                      ].map((bar, i) => (
                        <g key={i}>
                          {/* New Customers bar (Cyan) */}
                          <rect
                            x={bar.x}
                            y={160 - bar.newH}
                            width="9"
                            height={bar.newH}
                            rx="3"
                            fill="#38bdf8"
                          />
                          {/* Total Customers bar (Royal Blue) */}
                          <rect
                            x={bar.x + 12}
                            y={160 - bar.totH}
                            width="9"
                            height={bar.totH}
                            rx="3"
                            fill="#2563eb"
                          />
                        </g>
                      ))}
                    </svg>

                    {/* X-axis Month Labels */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '50px', paddingRight: '20px', marginTop: '6px' }}>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m) => (
                        <span key={m} style={{ fontSize: '11px', color: '#94a3b8' }}>{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom 3 Panels: Top Products, Recent Customers, Recent Support Tickets */}
              <div className="oxoo-admin-bottom-grid">
                {/* Panel 1: Top Products by Revenue */}
                <div className="oxoo-section-card">
                  <div className="oxoo-section-header">
                    <h3 className="oxoo-section-title">Top Products by Revenue</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {(topProducts.length ? topProducts : [
                      { product_name: 'Finance Suite', revenue: 1840000, revenue_percent: 38 },
                      { product_name: 'HRMS', revenue: 1260000, revenue_percent: 26 },
                      { product_name: 'Website Builder', revenue: 820000, revenue_percent: 17 },
                      { product_name: 'Marketing Suite', revenue: 610000, revenue_percent: 12 },
                      { product_name: 'Productivity Suite', revenue: 370000, revenue_percent: 7 }
                    ]).map((prod) => (
                      <div key={prod.product_name} className="oxoo-product-progress-row">
                        <div className="oxoo-product-icon-wrap">
                          <Package size={15} />
                        </div>
                        <span className="oxoo-product-name-col">{prod.product_name}</span>
                        <div className="oxoo-progress-track">
                          <div
                            className="oxoo-progress-bar"
                            style={{ width: `${prod.revenue_percent}%` }}
                          />
                        </div>
                        <span className="oxoo-product-amount-col">₹{prod.revenue?.toLocaleString('en-IN')}</span>
                        <span className="oxoo-product-percent-col">{prod.revenue_percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel 2: Recent Customers */}
                <div className="oxoo-section-card">
                  <div className="oxoo-section-header">
                    <h3 className="oxoo-section-title">Recent Customers</h3>
                    <span className="oxoo-view-all-link" onClick={() => setActiveTab('customers')}>
                      View All →
                    </span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="oxoo-table">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Plan</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(customers.length ? customers.slice(0, 5) : [
                          { company: 'Apex Logistics Ltd', plan: 'Business Pro', amount: '₹48,200', status: 'Active', date: '12 Oct 2026' },
                          { company: 'Metro Retailers', plan: 'Growth', amount: '₹25,000', status: 'Active', date: '11 Oct 2026' },
                          { company: 'BlueSky Cloud Corp', plan: 'Business Pro', amount: '₹1,24,000', status: 'Active', date: '10 Oct 2026' },
                          { company: 'GreenLeaf Organics', plan: 'Starter', amount: '₹32,600', status: 'Trial', date: '09 Oct 2026' },
                          { company: 'NovaTech Solutions', plan: 'Growth', amount: '₹78,400', status: 'Active', date: '08 Oct 2026' }
                        ]).map((c, i) => (
                          <tr key={i}>
                            <td className="oxoo-table-company">{c.company}</td>
                            <td>{c.plan}</td>
                            <td className="oxoo-table-amount">{c.amount}</td>
                            <td>
                              <span className={`oxoo-status-tag ${String(c.status).toLowerCase()}`}>
                                {c.status}
                              </span>
                            </td>
                            <td>{c.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Panel 3: Recent Support Tickets */}
                <div className="oxoo-section-card">
                  <div className="oxoo-section-header">
                    <h3 className="oxoo-section-title">Recent Support Tickets</h3>
                    <span className="oxoo-view-all-link" onClick={() => setActiveTab('tickets')}>
                      View All →
                    </span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="oxoo-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Subject</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(tickets.length ? tickets.slice(0, 5) : [
                          { id: '#1245', subject: 'Login issue', status: 'Resolved', priority: 'Medium', date: '2 hours ago' },
                          { id: '#1244', subject: 'Payment failed', status: 'Open', priority: 'High', date: '4 hours ago' },
                          { id: '#1243', subject: 'Feature request', status: 'In Progress', priority: 'Low', date: '1 day ago' },
                          { id: '#1242', subject: 'Integration error', status: 'Open', priority: 'High', date: '2 days ago' },
                          { id: '#1241', subject: 'Account setup help', status: 'Resolved', priority: 'Low', date: '3 days ago' }
                        ]).map((t, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{t.id}</td>
                            <td style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subject}</td>
                            <td>
                              <span className={`oxoo-status-tag ${String(t.status).toLowerCase().replace(' ', '-')}`}>
                                {t.status}
                              </span>
                            </td>
                            <td>
                              <span className={`oxoo-priority-pill ${String(t.priority).toLowerCase()}`}>
                                {t.priority}
                              </span>
                            </td>
                            <td>{t.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: CUSTOMERS MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Customer Organizations Management</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Inspect enterprise client accounts, manage tenant access, and toggle activation status.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => showToast('Onboarding wizard triggered.')}
                >
                  <Plus size={14} style={{ marginRight: '6px' }} /> Provision New Tenant
                </button>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th>Company Organization</th>
                      <th>Subscription Tier</th>
                      <th>Billing Value</th>
                      <th>Status</th>
                      <th>Renewal Date</th>
                      <th>Governance Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={i}>
                        <td className="oxoo-table-company">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building2 size={16} color="#0284c7" />
                            {c.company}
                          </div>
                        </td>
                        <td>{c.plan}</td>
                        <td className="oxoo-table-amount">{c.amount}</td>
                        <td>
                          <span className={`oxoo-status-tag ${String(c.status).toLowerCase()}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>{c.date}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: c.status === 'Active' ? '#fef2f2' : '#ecfdf5',
                                color: c.status === 'Active' ? '#dc2626' : '#059669',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                              onClick={() => handleToggleCustomerStatus(c.company, c.status)}
                            >
                              {c.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Subscription Entitlements & Tiers</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Active platform subscriptions, auto-renewal configurations, and MRR contribution.
                  </p>
                </div>
              </div>

              <div className="oxoo-summary-grid" style={{ marginBottom: '24px' }}>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Active Subscriptions</span>
                  <span className="oxoo-metric-value">{metrics?.activeSubscriptions || '2,856'}</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Monthly Run Rate (MRR)</span>
                  <span className="oxoo-metric-value">₹48,92,000</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Trial Conversion Rate</span>
                  <span className="oxoo-metric-value">68%</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Churn Rate</span>
                  <span className="oxoo-metric-value">0.42%</span>
                </div>
              </div>

              <table className="oxoo-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Plan Tier</th>
                    <th>Billing Cycle</th>
                    <th>MRR Amount</th>
                    <th>Renewal Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={i}>
                      <td className="oxoo-table-company">{c.company}</td>
                      <td>{c.plan}</td>
                      <td>Monthly Recurring</td>
                      <td className="oxoo-table-amount">{c.amount}</td>
                      <td><span className="oxoo-status-tag active">Auto-Renew Enabled</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: PRODUCTS & PLANS */}
          {activeTab === 'products' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Product Catalog & Plan Configuration</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Configure suite tiers, seat quotas, and pricing parameters.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => showToast('Plan creation modal opened.')}
                >
                  <Plus size={14} style={{ marginRight: '6px' }} /> Create New Plan Tier
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '16px' }}>
                {[
                  { name: 'Starter', price: '₹15,000/mo', seats: '5 Seats', apps: '3 Apps Included', users: 210 },
                  { name: 'Growth', price: '₹25,000/mo', seats: '10 Seats', apps: '5 Apps Included', users: 480 },
                  { name: 'Business Pro', price: '₹48,200/mo', seats: '15 Seats', apps: '8 Apps Included', users: 1840 },
                  { name: 'Enterprise', price: '₹1,24,000/mo', seats: 'Unlimited Seats', apps: 'All 24 Apps + SLA', users: 326 }
                ].map((p) => (
                  <div key={p.name} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '16px', color: '#0f172a' }}>{p.name}</strong>
                      <span className="oxoo-status-tag active">Live</span>
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#0284c7', marginBottom: '12px' }}>{p.price}</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li>✓ {p.seats}</li>
                      <li>✓ {p.apps}</li>
                      <li>✓ {p.users} Active Subscribed Tenants</li>
                    </ul>
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                      onClick={() => showToast(`Configuring ${p.name} plan parameters`)}
                    >
                      Edit Plan Parameters
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Platform Applications Health & Orchestration</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Manage availability, endpoints, and SSO integrations across the 24 business modules.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {[
                  { name: 'Accounting', cat: 'Finance', status: 'Operational' },
                  { name: 'Invoicing', cat: 'Finance', status: 'Operational' },
                  { name: 'Expenses', cat: 'Finance', status: 'Operational' },
                  { name: 'HRMS', cat: 'HR', status: 'Operational' },
                  { name: 'Website Builder', cat: 'Web', status: 'Operational' },
                  { name: 'Marketing', cat: 'Marketing', status: 'Operational' },
                  { name: 'Productivity', cat: 'Tools', status: 'Operational' },
                  { name: 'Project Management', cat: 'Ops', status: 'Operational' }
                ].map((app) => (
                  <div key={app.name} className="oxoo-app-tile" style={{ padding: '16px' }}>
                    <div className="oxoo-app-icon-box gradient-blue" style={{ width: '44px', height: '44px' }}>
                      <Layers size={20} />
                    </div>
                    <span className="oxoo-app-name">{app.name}</span>
                    <span className="oxoo-status-pill active">{app.status}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Category: {app.cat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENTS & INVOICES */}
          {activeTab === 'invoices' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Payment Transactions & Gateway Invoices</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Verified payment gateway transactions and real-time reconciliation logs.
                  </p>
                </div>
                <button
                  type="button"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
                  onClick={() => showToast('Exporting reconciled transactions to CSV...')}
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>

              <table className="oxoo-table" style={{ marginTop: '16px' }}>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Customer Organization</th>
                    <th>Gross Amount</th>
                    <th>Payment Method</th>
                    <th>Reconciliation Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'INV-2026-081', comp: 'Apex Logistics Ltd', amt: '₹48,200', method: 'Razorpay / Bank Transfer', stat: 'Reconciled', date: '12 Oct 2026' },
                    { id: 'INV-2026-080', comp: 'Metro Retailers', amt: '₹25,000', method: 'Stripe Corporate Card', stat: 'Reconciled', date: '11 Oct 2026' },
                    { id: 'INV-2026-079', comp: 'BlueSky Cloud Corp', amt: '₹1,24,000', method: 'NEFT / RTGS Wire', stat: 'Reconciled', date: '10 Oct 2026' },
                    { id: 'INV-2026-078', comp: 'ABC Technologies', amt: '₹48,200', method: 'Corporate Card', stat: 'Reconciled', date: '09 Oct 2026' }
                  ].map((inv) => (
                    <tr key={inv.id}>
                      <td className="oxoo-table-company">{inv.id}</td>
                      <td>{inv.comp}</td>
                      <td className="oxoo-table-amount">{inv.amt}</td>
                      <td>{inv.method}</td>
                      <td><span className="oxoo-status-tag active">{inv.stat}</span></td>
                      <td>{inv.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 7: SUPPORT TICKETS */}
          {activeTab === 'tickets' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Support Ticket Triage & Resolution</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Review escalations, assign engineers, and update customer resolution status.
                  </p>
                </div>
              </div>

              <table className="oxoo-table" style={{ marginTop: '16px' }}>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Subject Description</th>
                    <th>Priority</th>
                    <th>Current Status</th>
                    <th>Created</th>
                    <th>Governance Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700 }}>{t.id}</td>
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
                      <td>{t.date}</td>
                      <td>
                        {t.status !== 'Resolved' && (
                          <button
                            type="button"
                            style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: '#ecfdf5', color: '#059669', border: 'none', cursor: 'pointer' }}
                            onClick={() => handleResolveTicket(t.id)}
                          >
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 8: SETTINGS & GOVERNANCE */}
          {activeTab === 'settings' && (
            <div className="oxoo-section-card" style={{ maxWidth: '800px' }}>
              <div className="oxoo-section-header">
                <h2 className="oxoo-section-title">Platform Governance & SSO Architecture</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Central Identity Provider (OIDC / OAuth 2.0)</label>
                  <input type="text" className="oxoo-form-input" defaultValue="https://auth.oxoo.ai/oauth/v2" disabled style={{ background: '#f8fafc' }} />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Database Cluster</label>
                  <input type="text" className="oxoo-form-input" defaultValue="Neon PostgreSQL (Multi-Tenant Isolated Pool)" disabled style={{ background: '#f8fafc' }} />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Production API Gateway</label>
                  <input type="text" className="oxoo-form-input" defaultValue="https://api.oxoo.ai" disabled style={{ background: '#f8fafc' }} />
                </div>

                <div style={{ marginTop: '12px' }}>
                  <button
                    type="button"
                    className="oxoo-upgrade-btn"
                    onClick={() => showToast('Platform encryption keys verified.')}
                  >
                    Verify Security Status
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
