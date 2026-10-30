import React, { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, TrendingUp, Users, ShieldCheck, Play, ShoppingCart,
  ArrowRight, Zap, Headphones, Lock, Copy, Check, ExternalLink,
  ChevronRight, Sparkles, Building2, Globe, Clock, CalendarDays,
  Wallet, CheckCircle2, CheckCircle, BarChart3, Smartphone, Laptop
} from 'lucide-react';
import { getAppBySlug, APPS_DATA } from './appsData';

export default function PrimeProPortal() {
  const { appSlug, slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const app = getAppBySlug(appSlug || slug) || APPS_DATA[0];

  // Retrieve company domain (e.g., abcd.oxoo)
  const queryParams = new URLSearchParams(location.search);
  const companyFromQuery = queryParams.get('company');
  const companyFromState = location.state?.companyName;
  const companyFromStorage = typeof window !== 'undefined' ? localStorage.getItem('oxoo_demo_company') : null;
  const rawCompany = companyFromQuery || companyFromState || companyFromStorage || 'abcd.primepro.ai';
  const companyDomain = rawCompany.endsWith('.primepro.ai') ? rawCompany : `${rawCompany}.primepro.ai`;

  // Detect whether this is for Human Resources or Billing/Finance
  const isHRBySlugOrCategory =
    app.category === 'Human Resources' ||
    ['hr', 'hrms', 'attendance', 'payroll', 'recruitment', 'timesheets', 'employees', 'leave-management', 'performance-management', 'human-resources'].includes(app.slug);

  // Active view mode: 'hr' (Human Resources) or 'billing' (Finance & Billing)
  const activePortalMode = isHRBySlugOrCategory ? 'hr' : (['accounting', 'invoicing', 'expenses', 'finance'].includes(app.slug) ? 'billing' : 'hr');

  const [copiedUrl, setCopiedUrl] = useState(false);
  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(`https://${companyDomain}/apps/${app.slug}`);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleOpenWorkspace = () => {
    navigate(`/apps/${app.slug}/workspace?company=${encodeURIComponent(companyDomain)}`, {
      state: {
        companyName: companyDomain,
        appName: app.name
      }
    });
  };

  const handlePurchaseNow = () => {
    navigate('/pricing');
  };

  return (
    <div className={`primepro-portal-root ${activePortalMode === 'hr' ? 'hr-theme' : 'billing-theme'}`}>
      {/* 1. TOP DEDICATED SUBDOMAIN BAR */}
      <div className="portal-subdomain-bar">
        <div className="subdomain-bar-inner">
          <div className="subdomain-ssl-pill">
            <Lock size={13} className="subdomain-lock-icon" />
            <span className="subdomain-protocol">https://</span>
            <span className="subdomain-highlight">{companyDomain}</span>
            <span className="subdomain-slug">/apps/{app.slug}</span>
          </div>


          <div className="subdomain-actions">
            <span className="tenant-status-pill">
              <span className="tenant-status-dot" />
              Instance Active
            </span>
            <button
              type="button"
              className="subdomain-copy-btn"
              onClick={handleCopyUrl}
            >
              {copiedUrl ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
              <span>{copiedUrl ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==============================================================
          A. HUMAN RESOURCES PORTAL (Exact Match to Human Resources Image)
         ============================================================== */}
      {activePortalMode === 'hr' ? (
        <main className="hr-split-container">
          {/* LEFT & CENTER HERO CANVAS (Dark Navy-Cyan Background with Devices) */}
          <section className="hr-left-section">
            <div className="hr-left-grid-bg" />
            <div className="hr-left-glow-orb" />

            <div className="hr-left-inner-layout">
              {/* Left Column: Typography, Features 2x2, Checklist */}
              <div className="hr-text-column">
                {/* Brand Header */}
                <div className="hr-brand-header">
                  <div className="hr-logo-circle">
                    <div className="hr-logo-orbit">
                      <svg viewBox="0 0 44 44" width="44" height="44">
                        <circle cx="22" cy="22" r="18" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="3" fill="none" />
                        <path d="M4 22 A 18 18 0 1 1 36 32" fill="none" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round" />
                        <polygon points="36,32 30,28 35,24" fill="#06b6d4" />
                      </svg>
                    </div>
                    <Users size={20} className="hr-users-icon" />
                  </div>
                  <div className="hr-brand-text">
                    <h2 className="hr-brand-title">PrimePro</h2>
                    <p className="hr-brand-subtitle">HUMAN RESOURCE MANAGEMENT SYSTEM</p>
                  </div>
                </div>

                {/* Micro Label */}
                <div className="hr-eyebrow-tag">
                  A COMPLETE EMPLOYEE MANAGEMENT PLATFORM
                </div>

                {/* Main Heading */}
                <h1 className="hr-main-heading">
                  Manage your entire<br />
                  workforce, <span className="highlight-cyan">in one place.</span>
                </h1>

                {/* Subtitle */}
                <p className="hr-main-desc">
                  From attendance and leave to payroll and performance — PrimePro helps you manage your people, simplify HR operations and focus on what matters most: your business.
                </p>

                {/* 2x2 Feature Cards Grid */}
                <div className="hr-feature-grid-2x2">
                  {/* 1. People & Roles */}
                  <div className="hr-grid-card">
                    <div className="hr-card-icon-box box-blue">
                      <Users size={18} />
                    </div>
                    <div className="hr-card-content">
                      <h4 className="hr-card-heading">People & Roles</h4>
                      <p className="hr-card-detail">Manage employees, departments and access permissions.</p>
                    </div>
                  </div>

                  {/* 2. Attendance */}
                  <div className="hr-grid-card">
                    <div className="hr-card-icon-box box-teal">
                      <Clock size={18} />
                    </div>
                    <div className="hr-card-content">
                      <h4 className="hr-card-heading">Attendance</h4>
                      <p className="hr-card-detail">GPS geofencing and face recognition check-in.</p>
                    </div>
                  </div>

                  {/* 3. Leave & Tasks */}
                  <div className="hr-grid-card">
                    <div className="hr-card-icon-box box-purple">
                      <CalendarDays size={18} />
                    </div>
                    <div className="hr-card-content">
                      <h4 className="hr-card-heading">Leave & Tasks</h4>
                      <p className="hr-card-detail">Approvals, balances and assignments in one place.</p>
                    </div>
                  </div>

                  {/* 4. Payroll */}
                  <div className="hr-grid-card">
                    <div className="hr-card-icon-box box-amber">
                      <Wallet size={18} />
                    </div>
                    <div className="hr-card-content">
                      <h4 className="hr-card-heading">Payroll</h4>
                      <p className="hr-card-detail">Salary structures, monthly runs and payslips.</p>
                    </div>
                  </div>
                </div>

                {/* Bottom 3 Checkmark Pills */}
                <div className="hr-bottom-checklist">
                  <span className="hr-check-pill">
                    <CheckCircle2 size={16} className="hr-check-icon" /> Role-based access
                  </span>
                  <span className="hr-check-pill">
                    <CheckCircle2 size={16} className="hr-check-icon" /> Full audit trail
                  </span>
                  <span className="hr-check-pill">
                    <CheckCircle2 size={16} className="hr-check-icon" /> Secure and reliable
                  </span>
                </div>
              </div>

              {/* Center / Device Mockup Column (Tablet + Smartphone) */}
              <div className="hr-device-showcase-column">
                <div className="hr-device-cluster">
                  {/* Tablet Dashboard Mockup */}
                  <div className="hr-tablet-mockup">
                    <div className="tablet-bezel">
                      {/* Left Sidebar */}
                      <div className="tablet-sidebar">
                        <div className="tablet-sidebar-logo">
                          <Users size={14} color="#38bdf8" />
                          <span>PrimePro</span>
                        </div>
                        <div className="tablet-nav-item active">Dashboard</div>
                        <div className="tablet-nav-item">Employees</div>
                        <div className="tablet-nav-item">Attendance</div>
                        <div className="tablet-nav-item">Leave</div>
                        <div className="tablet-nav-item">Payroll</div>
                        <div className="tablet-nav-item">Tasks</div>
                        <div className="tablet-nav-item">Reports</div>
                        <div className="tablet-nav-item">Settings</div>
                      </div>

                      {/* Tablet Main Screen */}
                      <div className="tablet-main-area">
                        <div className="tablet-header-row">
                          <span className="tablet-dash-title">Dashboard</span>
                          <span className="tablet-user-greeting">Welcome back, Admin</span>
                        </div>

                        {/* Top KPI row */}
                        <div className="tablet-kpi-row">
                          <div className="tablet-kpi-card">
                            <span className="kpi-micro-label">Total Employees</span>
                            <div className="kpi-big-num">248</div>
                            <span className="kpi-change-green">+12% this month</span>
                          </div>
                          <div className="tablet-kpi-card">
                            <span className="kpi-micro-label">Present Today</span>
                            <div className="kpi-big-num">192</div>
                            <span className="kpi-sub-text">78% attendance</span>
                          </div>
                        </div>

                        {/* Attendance Chart Mockup */}
                        <div className="tablet-chart-card">
                          <div className="chart-header-row">
                            <span className="chart-title">Attendance Overview</span>
                            <span className="chart-legend-dot">● Present  ○ Absent</span>
                          </div>
                          <div className="chart-bars-wrap">
                            <div className="bar-col"><div className="bar-fill" style={{ height: '70%' }} /><span className="day-label">Mon</span></div>
                            <div className="bar-col"><div className="bar-fill" style={{ height: '88%' }} /><span className="day-label">Tue</span></div>
                            <div className="bar-col"><div className="bar-fill" style={{ height: '76%' }} /><span className="day-label">Wed</span></div>
                            <div className="bar-col"><div className="bar-fill" style={{ height: '92%' }} /><span className="day-label">Thu</span></div>
                            <div className="bar-col"><div className="bar-fill" style={{ height: '82%' }} /><span className="day-label">Fri</span></div>
                            <div className="bar-col"><div className="bar-fill" style={{ height: '40%' }} /><span className="day-label">Sat</span></div>
                          </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="tablet-recent-activities">
                          <span className="recent-title">Recent Activities</span>
                          <div className="recent-item">
                            <span className="recent-dot blue" />
                            <span className="recent-text">New employee joined: Simran Singh (Marketing)</span>
                          </div>
                          <div className="recent-item">
                            <span className="recent-dot purple" />
                            <span className="recent-text">Leave request approved: Priya Sharma (3 days)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Smartphone Mockup Floating Over Tablet */}
                  <div className="hr-phone-mockup">
                    <div className="phone-screen-wrap">
                      <div className="phone-island-notch">
                        <span className="phone-clock">9:41</span>
                        <div className="island-pill" />
                      </div>

                      <div className="phone-app-header">
                        <span className="phone-brand">PrimePro</span>
                        <div className="phone-avatar-thumb">
                          <Users size={12} color="#0284c7" />
                        </div>
                      </div>

                      {/* 4 Phone Quick Action Cards */}
                      <div className="phone-cards-stack">
                        <div className="phone-action-pill pill-blue">
                          <Clock size={14} className="phone-pill-icon" />
                          <div className="phone-pill-text">
                            <span className="pill-title">My Attendance</span>
                            <span className="pill-sub">Check-in / Check-out</span>
                          </div>
                        </div>

                        <div className="phone-action-pill pill-teal">
                          <CalendarDays size={14} className="phone-pill-icon" />
                          <div className="phone-pill-text">
                            <span className="pill-title">My Leave</span>
                            <span className="pill-sub">Apply or track leave</span>
                          </div>
                        </div>

                        <div className="phone-action-pill pill-amber">
                          <Wallet size={14} className="phone-pill-icon" />
                          <div className="phone-pill-text">
                            <span className="pill-title">My Payslips</span>
                            <span className="pill-sub">View salary slips</span>
                          </div>
                        </div>

                        <div className="phone-action-pill pill-indigo">
                          <FileText size={14} className="phone-pill-icon" />
                          <div className="phone-pill-text">
                            <span className="pill-title">My Tasks</span>
                            <span className="pill-sub">Manage your tasks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT LAUNCHPAD SECTION (Clean White & Mint) */}
          <section className="hr-right-section">
            <div className="hr-right-content-wrap">
              {/* Trust Badge */}
              <div className="hr-trust-pill">
                <span className="trust-crown">👑</span>
                <span className="trust-text">Trusted by 5,000+ Businesses</span>
              </div>

              {/* Headline */}
              <div className="hr-right-headline-wrap">
                <h2 className="hr-right-heading">
                  Get Started with<br />
                  <span className="oxoo-brand-gradient">PrimePro</span> Today
                </h2>
                <p className="hr-right-description">
                  See how PrimePro can simplify your HR operations, improve productivity and support your growing workforce.
                </p>
              </div>

              {/* Two Big Action CTA Cards */}
              <div className="hr-cta-cards-stack">
                {/* 1. Free Demo Card */}
                <button
                  type="button"
                  className="hr-cta-card hr-free-demo-card"
                  onClick={handleOpenWorkspace}
                >
                  <div className="cta-left-group">
                    <div className="cta-circle-icon circle-cyan-play">
                      <Play size={20} className="play-triangle-white" />
                    </div>
                    <div className="cta-text-group">
                      <span className="cta-eyebrow-blue">EXPLORE FIRST</span>
                      <h3 className="cta-main-title">Book a Free Demo</h3>
                      <p className="cta-sub-title">See PrimePro in action with a personalized walkthrough.</p>
                    </div>
                  </div>
                  <div className="cta-arrow-group">
                    <ArrowRight size={22} className="arrow-blue-icon" />
                  </div>
                </button>

                {/* 2. Purchase Now Card */}
                <button
                  type="button"
                  className="hr-cta-card hr-purchase-card"
                  onClick={handlePurchaseNow}
                >
                  <div className="cta-left-group">
                    <div className="cta-circle-icon circle-white-cart">
                      <ShoppingCart size={20} />
                    </div>
                    <div className="cta-text-group">
                      <span className="cta-eyebrow-mint">READY TO GET STARTED</span>
                      <h3 className="cta-main-title white">Purchase Now</h3>
                      <p className="cta-sub-title white-soft">Choose a plan and start using PrimePro today.</p>
                    </div>
                  </div>
                  <div className="cta-arrow-group">
                    <ArrowRight size={22} className="arrow-white-icon" />
                  </div>
                </button>
              </div>

              {/* Bottom 3 Trust Badges */}
              <div className="hr-reassurance-row">
                <div className="hr-reassurance-item">
                  <div className="reassurance-icon-box">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="reassurance-text-box">
                    <span className="reassurance-title">Secure & Reliable</span>
                    <span className="reassurance-desc">Your data is always safe.</span>
                  </div>
                </div>

                <div className="hr-reassurance-item">
                  <div className="reassurance-icon-box">
                    <Zap size={18} />
                  </div>
                  <div className="reassurance-text-box">
                    <span className="reassurance-title">Quick Setup</span>
                    <span className="reassurance-desc">Get started in minutes.</span>
                  </div>
                </div>

                <div className="hr-reassurance-item">
                  <div className="reassurance-icon-box">
                    <Headphones size={18} />
                  </div>
                  <div className="reassurance-text-box">
                    <span className="reassurance-title">Dedicated Support</span>
                    <span className="reassurance-desc">We're here to help.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* ==============================================================
            B. SMART BILLING / FINANCE PORTAL (Previous Reference Screenshot)
           ============================================================== */
        <main className="primepro-split-container">
          {/* LEFT PANEL: DARK EMERALD FOREST COMMAND CENTRE */}
          <section className="portal-left-panel">
            <div className="portal-left-grid-bg" />
            <div className="portal-left-glow-orb" />

            <div className="portal-left-content">
              {/* Brand Header */}
              <div className="portal-brand-header">
                <div className="portal-logo-square">
                  <span>PP</span>
                </div>
                <div className="portal-brand-text">
                  <h3 className="portal-brand-title">PrimePro x Fuelo</h3>
                  <p className="portal-brand-subtitle">PrimePro Management System</p>
                </div>
              </div>

              {/* Main Headline */}
              <div className="portal-headline-wrap">
                <h1 className="portal-main-heading">
                  Smart Billing.<br />
                  <span className="highlight-amber">Real-time</span><br />
                  Intelligence.
                </h1>
                <p className="portal-main-desc">
                  A unified financial command centre — manage finances, track payments and reconcile accounts seamlessly.
                </p>
              </div>

              {/* 4 Feature Pill Cards */}
              <div className="portal-feature-list">
                <div className="portal-feature-card">
                  <div className="feature-icon-box box-green">
                    <FileText size={19} />
                  </div>
                  <div className="feature-card-text">
                    <div className="feature-card-title">Auto-tracked PrimePro</div>
                    <div className="feature-card-sub">Create, send and track invoices automatically.</div>
                  </div>
                </div>

                <div className="portal-feature-card">
                  <div className="feature-icon-box box-amber">
                    <TrendingUp size={19} />
                  </div>
                  <div className="feature-card-text">
                    <div className="feature-card-title">Live Revenue Metrics</div>
                    <div className="feature-card-sub">Real-time insights into your business.</div>
                  </div>
                </div>

                <div className="portal-feature-card">
                  <div className="feature-icon-box box-teal">
                    <Users size={19} />
                  </div>
                  <div className="feature-card-text">
                    <div className="feature-card-title">GST-ready Client Management</div>
                    <div className="feature-card-sub">Manage customers, taxes and reports.</div>
                  </div>
                </div>

                <div className="portal-feature-card">
                  <div className="feature-icon-box box-emerald">
                    <ShieldCheck size={19} />
                  </div>
                  <div className="feature-card-text">
                    <div className="feature-card-title">Enterprise-grade security</div>
                    <div className="feature-card-sub">Role-based access • Encrypted data</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL: CLEAN MINT & WHITE */}
          <section className="portal-right-panel">
            <div className="portal-right-content">
              <div className="portal-trust-pill">
                <span className="trust-crown">👑</span>
                <span className="trust-text">Trusted by 5,000+ Businesses</span>
              </div>

              <div className="portal-right-title-wrap">
                <h2 className="portal-right-title">
                  Manage Your<br />
                  <span className="oxoo-ease-word">
                    PrimePro with Ease
                    <svg className="brush-underline-svg" viewBox="0 0 260 20" fill="none">
                      <path d="M4 14C60 6 180 4 256 12" stroke="#059669" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                  </span>
                </h2>
                <p className="portal-right-desc">
                  Create, send, track and get paid — all in one place. Simple, powerful and built for growing businesses.
                </p>
              </div>

              <div className="portal-actions-stack">
                <button
                  type="button"
                  className="portal-action-card free-demo-card"
                  onClick={handleOpenWorkspace}
                >
                  <div className="action-card-left">
                    <div className="action-circle-icon circle-play">
                      <Play size={20} className="play-triangle-icon" />
                    </div>
                    <div className="action-info">
                      <h3 className="action-title">Free Demo</h3>
                      <p className="action-desc">
                        See how PrimePro x Fuelo can simplify your business process.
                      </p>
                    </div>
                  </div>
                  <div className="action-arrow-wrap">
                    <ArrowRight size={22} className="action-arrow-icon" />
                  </div>
                </button>

                <button
                  type="button"
                  className="portal-action-card purchase-card"
                  onClick={handlePurchaseNow}
                >
                  <div className="action-card-left">
                    <div className="action-circle-icon circle-cart">
                      <ShoppingCart size={20} />
                    </div>
                    <div className="action-info">
                      <h3 className="action-title">Purchase Now</h3>
                      <p className="action-desc">
                        Choose a plan and get started today.
                      </p>
                    </div>
                  </div>
                  <div className="action-arrow-wrap">
                    <ArrowRight size={22} className="action-arrow-icon" />
                  </div>
                </button>
              </div>

              <div className="portal-reassurance-row">
                <div className="reassurance-badge">
                  <div className="badge-icon-wrap">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="badge-text-wrap">
                    <span className="badge-headline">Secure & Reliable</span>
                    <span className="badge-subline">Your data is always safe.</span>
                  </div>
                </div>

                <div className="reassurance-badge">
                  <div className="badge-icon-wrap">
                    <Zap size={18} />
                  </div>
                  <div className="badge-text-wrap">
                    <span className="badge-headline">Quick Setup</span>
                    <span className="badge-subline">Get started in minutes.</span>
                  </div>
                </div>

                <div className="reassurance-badge">
                  <div className="badge-icon-wrap">
                    <Headphones size={18} />
                  </div>
                  <div className="badge-text-wrap">
                    <span className="badge-headline">Dedicated Support</span>
                    <span className="badge-subline">We're here to help.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
