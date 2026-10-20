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
  const [invoices, setInvoices] = useState([]);
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
                      <div style={{ fontWeight: 600, color: '#065f46' }}>PostgreSQL Cluster Ready</div>
                      <div style={{ color: '#047857' }}>All system services operational.</div>
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
                      ↑ {metrics?.totalCustomersTrend || '0%'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Total Customers</span>
                      <span className="oxoo-metric-value">{metrics?.totalCustomers?.toLocaleString('en-IN') ?? 0}</span>
                      <span className="oxoo-metric-subtitle">{metrics?.totalCustomersChange || '0 total'}</span>
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
                      ↑ {metrics?.activeSubscriptionsTrend || '0%'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Active Subscriptions</span>
                      <span className="oxoo-metric-value">{metrics?.activeSubscriptions?.toLocaleString('en-IN') ?? 0}</span>
                      <span className="oxoo-metric-subtitle">{metrics?.activeSubscriptionsChange || '0 active'}</span>
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
                      ↑ {metrics?.monthlyRevenueTrend || '0%'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Monthly Revenue</span>
                      <span className="oxoo-metric-value">{metrics?.monthlyRevenueFormatted || '₹0'}</span>
                      <span className="oxoo-metric-subtitle">MRR {metrics?.mrrFormatted || '₹0'}</span>
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
                      ↑ {metrics?.trialConversionsTrend || '0%'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Trial Conversions</span>
                      <span className="oxoo-metric-value">{metrics?.trialConversions ?? 0}%</span>
                      <span className="oxoo-metric-subtitle">{metrics?.trialConversionsConverted || '0 converted'}</span>
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

                  <div className="oxoo-svg-chart-wrap">
                    {revenueData && revenueData.length > 0 ? (
                      <svg className="oxoo-chart-svg" viewBox="0 0 500 180">
                        <defs>
                          <linearGradient id="oxooRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {[
                          { y: 25, label: '₹10K' },
                          { y: 65, label: '₹7.5K' },
                          { y: 105, label: '₹5K' },
                          { y: 145, label: '₹2.5K' }
                        ].map((grid) => (
                          <g key={grid.label}>
                            <line x1="40" y1={grid.y} x2="490" y2={grid.y} stroke="#f1f5f9" strokeDasharray="3 3" />
                            <text x="30" y={grid.y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{grid.label}</text>
                          </g>
                        ))}
                        <path
                          d="M 50,150 L 480,150"
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="2.5"
                        />
                      </svg>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <BarChart3 size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                        <p style={{ fontSize: '13px', margin: 0 }}>No revenue transactions recorded yet.</p>
                      </div>
                    )}
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

                  <div className="oxoo-svg-chart-wrap">
                    {growthData && growthData.length > 0 ? (
                      <svg className="oxoo-chart-svg" viewBox="0 0 500 180">
                        {[
                          { y: 25, label: '10' },
                          { y: 65, label: '7' },
                          { y: 105, label: '5' },
                          { y: 145, label: '2' }
                        ].map((grid) => (
                          <g key={grid.label}>
                            <line x1="40" y1={grid.y} x2="490" y2={grid.y} stroke="#f1f5f9" strokeDasharray="3 3" />
                            <text x="30" y={grid.y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{grid.label}</text>
                          </g>
                        ))}
                      </svg>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <Users size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                        <p style={{ fontSize: '13px', margin: 0 }}>No customer growth recorded yet.</p>
                      </div>
                    )}
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
                    {topProducts && topProducts.length > 0 ? (
                      topProducts.map((prod) => (
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
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94a3b8', fontSize: '13px' }}>
                        No product sales recorded yet.
                      </div>
                    )}
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
                        {customers && customers.length > 0 ? (
                          customers.slice(0, 5).map((c, i) => (
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              No registered customers yet.
                            </td>
                          </tr>
                        )}
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
                        {tickets && tickets.length > 0 ? (
                          tickets.slice(0, 5).map((t, idx) => (
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              No support tickets open.
                            </td>
                          </tr>
                        )}
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
                  {invoices && invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <tr key={inv.id || inv.invoice_number}>
                        <td className="oxoo-table-company">{inv.invoice_number || inv.id}</td>
                        <td>{inv.company_name || inv.comp}</td>
                        <td className="oxoo-table-amount">₹{(inv.amount || 0).toLocaleString('en-IN')}</td>
                        <td>{inv.method || 'Razorpay Gateway'}</td>
                        <td><span className="oxoo-status-tag active">{inv.status || 'Paid'}</span></td>
                        <td>{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-GB') : inv.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No payment transactions recorded yet.
                      </td>
                    </tr>
                  )}
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
