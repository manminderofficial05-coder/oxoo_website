import React, { useState, useEffect } from 'react';
import JoinMosaic from './JoinMosaic';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Check, Play, Star, ChevronDown, ArrowRight, ShieldCheck,
  Zap, Clock, FileText, CheckCircle2, ArrowUpRight, ChevronRight, User,
  Globe2, Building2, HelpCircle, Layers, CreditCard, X
} from 'lucide-react';
import { Header, Footer } from './components';
import { APPS_DATA, getAppBySlug } from './appsData';
import AppDemoRequestModal from './AppDemoRequestModal';

export default function AppShowcase() {
  const { appSlug, slug } = useParams();
  const navigate = useNavigate();
  const app = getAppBySlug(appSlug || slug) || APPS_DATA[0];

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handleLaunchApp = () => {
    navigate(`/apps/${app.slug}/demo`);
  };

  // Related apps for "One need, one app" section
  const relatedApps = [
    { name: 'Sales', slug: 'sales', desc: 'Generate invoices', icon: '/apps/logo-sales.png?v=clean' },
    { name: 'Purchase', slug: 'purchase', desc: 'Control bills', icon: '/apps/logo-purchase.png?v=clean' },
    { name: 'Expenses', slug: 'expenses', desc: 'Track and re-invoice', icon: '/apps/logo-expenses.png?v=clean' },
    { name: 'Inventory', slug: 'inventory', desc: 'Real-time valuation', icon: '/apps/logo-inventory.png?v=clean' },
    { name: 'Documents', slug: 'documents', desc: 'Management', icon: '/apps/logo-documents.png?v=clean' },
  ];

  // 6 Features tailored for the current app
  const featureCards = [
    {
      title: 'Worldwide compatibility',
      desc: `Multiix ${app.name} is pre-configured to address your country's requirements: charts of accounts, taxes, country-specific reports, electronic invoicing, audit files, and fiscal positions to automatically apply the right rates.`,
    },
    {
      title: 'Automated follow-ups',
      desc: `Multiix helps you identify late pending actions and allows you to schedule and send the appropriate reminders based on the number of days overdue. You can send follow-ups via email, post, or SMS.`,
    },
    {
      title: 'Real-time reporting',
      desc: `Real-time performance reports empower you to make informed decisions for your business. Additionally, you can easily annotate, export, and access detailed information for each report.`,
    },
    {
      title: 'Deferrals',
      desc: `Defer your revenues and expenses, either manually or on each invoice/bill validation. You can also audit the entries from dedicated reports.`,
    },
    {
      title: 'Electronic invoicing (EDI)',
      desc: `Various EDI file formats are available depending on your company's country. Send and receive electronic invoices in multiple formats and standards, such as Peppol.`,
    },
    {
      title: 'Dynamic taxes and accounts',
      desc: `No matter where your customers and suppliers are established, whether they have a Tax ID or not, if goods are sold cross-border, Multiix computes the right taxes and income/expense accounts.`,
    },
  ];

  const handleSwitchApp = (selected) => {
    navigate(`/apps/${selected.slug}`);
    setSubnavAppMenuOpen(false);
  };

  return (
    <div className="app-showcase-page-root">
      {/* 1. MAIN GLOBAL NAVBAR */}
      <Header />

      {/* 2. HERO SECTION (Exact Match to Screenshot 2) */}
      <section className="showcase-hero-section" id="overview">
        {/* Left hand-drawn cyan spark accent */}
        <div className="hero-doodle doodle-left" aria-hidden="true">
          <svg viewBox="0 0 60 60" width="46" height="46" fill="none">
            <path d="M10 30 L25 28 M14 18 L28 24 M20 42 L29 32" stroke="#00a09d" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Right hand-drawn India Flag / GST doodle */}
        <div className="hero-doodle doodle-right" aria-hidden="true">
          <div className="gst-badge-pill">
            <span className="gst-flag">🇮🇳</span>
            <span className="gst-text">GST compliant</span>
          </div>
          <svg viewBox="0 0 50 30" width="38" height="24" fill="none">
            <path d="M4 18 C15 4, 35 6, 44 24" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
        </div>

        <div className="showcase-hero-content">
          {/* Main Title with Teal Cursive Accent */}
          <h1 className="showcase-hero-title">
            <span className="hero-title-main">{app.name}</span>{' '}
            <span className="hero-title-cursive">made effortless</span>
          </h1>

          {/* Subtitle */}
          <p className="showcase-hero-subtitle">
            Imagine one AI-native {app.name} platform for all your operations, from reconciliation and
            expenses to tax returns and real-time reporting. Fast, complete, and simple.
          </p>

          {/* Hero CTAs: Purple Start Now + Light Advisor */}
          <div className="showcase-hero-actions">
            <button
              type="button"
              className="showcase-btn-primary"
              onClick={handleLaunchApp}
            >
              Start now - It's free
            </button>
            <button
              type="button"
              className="showcase-btn-secondary"
              onClick={() => navigate('/contact')}
            >
              Meet an advisor
            </button>
          </div>

          {/* Subnote */}
          <p className="showcase-hero-fineprint">
            Send and receive unlimited invoices and bills, for free, forever.{' '}
            <span className="fineprint-link" onClick={handleLaunchApp}>See why</span>
          </p>

          {/* Large Interactive Dashboard Mockup with Central Play Button (Screenshot 2) */}
          <div className="showcase-dashboard-mockup-wrapper">
            <div className="dashboard-mockup-frame">
              {/* Top Window Bar */}
              <div className="mockup-header-bar">
                <div className="mockup-tabs-left">
                  <span className="mockup-app-tab active">
                    <img src={app.iconSrc || app.svgSrc} alt="" className="tab-icon-small" />
                    {app.name} Dashboard
                  </span>
                  <span className="mockup-tab">Customers</span>
                  <span className="mockup-tab">Vendors</span>
                  <span className="mockup-tab">Operations</span>
                  <span className="mockup-tab">Reporting</span>
                  <span className="mockup-tab">Configuration</span>
                </div>
                <div className="mockup-search-right">
                  <div className="mockup-search-pill">
                    <span className="search-icon">🔍</span>
                    <span>Search...</span>
                  </div>
                  <div className="mockup-user-avatars">
                    <span className="u-avatar u1" />
                    <span className="u-avatar u2" />
                  </div>
                </div>
              </div>

              {/* Dashboard Content Grid */}
              <div className="mockup-dashboard-grid">
                {/* Card 1: Customer Invoices */}
                <div className="mockup-card">
                  <div className="mockup-card-head">
                    <b>Customer Invoices</b>
                    <span className="btn-mini purple">New</span>
                  </div>
                  <div className="mockup-card-body">
                    <div className="metric-row">
                      <span className="metric-tag info">1 To Validate</span>
                      <span className="metric-val">$ 5,427.50</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-tag warning">5 Unpaid</span>
                      <span className="metric-val">$ 128,657.25</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-tag danger">3 Late</span>
                      <span className="metric-val">$ 952.27</span>
                    </div>
                    {/* Bar Chart Visual */}
                    <div className="mock-chart-bars">
                      <div className="chart-bar bar-1" style={{ height: '55%' }} />
                      <div className="chart-bar bar-2" style={{ height: '75%' }} />
                      <div className="chart-bar bar-3" style={{ height: '30%' }} />
                      <div className="chart-bar bar-4" style={{ height: '85%' }} />
                    </div>
                  </div>
                </div>

                {/* Card 2: Vendor Bills */}
                <div className="mockup-card">
                  <div className="mockup-card-head">
                    <b>Vendor Bills</b>
                    <div className="head-actions">
                      <span className="btn-mini">Upload</span>
                      <span className="btn-mini">New</span>
                    </div>
                  </div>
                  <div className="mockup-card-body">
                    <div className="metric-row">
                      <span className="metric-tag info">1 To Validate</span>
                      <span className="metric-val">$ 0.00</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-tag warning">2 To Pay</span>
                      <span className="metric-val">$ 662.27</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-tag danger">1 Late</span>
                      <span className="metric-val">$ 952.27</span>
                    </div>
                    {/* Bar Chart Visual */}
                    <div className="mock-chart-bars">
                      <div className="chart-bar bar-5" style={{ height: '65%' }} />
                      <div className="chart-bar bar-6" style={{ height: '90%' }} />
                    </div>
                  </div>
                </div>

                {/* Card 3: Bank */}
                <div className="mockup-card">
                  <div className="mockup-card-head">
                    <b>Bank</b>
                    <span className="btn-mini purple">Transactions</span>
                  </div>
                  <div className="mockup-card-body">
                    <div className="metric-row">
                      <span>Balance</span>
                      <b>$ 6,344.87</b>
                    </div>
                    <div className="metric-row">
                      <span>Last Statement</span>
                      <b>$ 6,378.00</b>
                    </div>
                    <div className="metric-row">
                      <span>Reconciled</span>
                      <span className="metric-tag success">100% matched</span>
                    </div>
                    {/* Line Sparkline */}
                    <svg viewBox="0 0 200 45" className="sparkline-svg">
                      <path d="M0,40 Q50,30 100,20 T200,8" fill="none" stroke="#714b67" strokeWidth="2.5" />
                    </svg>
                  </div>
                </div>

                {/* Card 4: Cash */}
                <div className="mockup-card">
                  <div className="mockup-card-head">
                    <b>Cash</b>
                    <span className="btn-mini purple">Transactions</span>
                  </div>
                  <div className="mockup-card-body">
                    <div className="metric-row">
                      <span>Cash In Hand</span>
                      <b>$ 2,500.00</b>
                    </div>
                    <div className="metric-row">
                      <span>Cash Register</span>
                      <span className="metric-tag success">Open</span>
                    </div>
                    <svg viewBox="0 0 200 45" className="sparkline-svg">
                      <path d="M0,35 Q60,25 120,28 T200,14" fill="none" stroke="#00a09d" strokeWidth="2.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Play Button Overlay (Clickable - Launches Live Interactive Demo) */}
              <button
                type="button"
                className="mockup-play-center-btn"
                onClick={() => navigate(`/apps/${app.slug}/demo`)}
                title={`Launch Interactive Live Demo of ${app.name}`}
              >
                <Play size={24} fill="#714b67" color="#714b67" />
              </button>
            </div>

            {/* Hand-drawn Avatar Callout (Screenshot 2) */}
            <div className="speech-bubble-callout">
              <div className="callout-avatar-wrap">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Advisor"
                  className="callout-avatar-img"
                />
              </div>
              <div className="callout-bubble-box">
                <span className="speech-quote-icon">💬</span>
                <span>Looking for our simplified <strong className="underline-text">Invoicing</strong> app?</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PERFORMANCE SECTION: "Unlock true performance" (Screenshot 2) */}
      <section className="showcase-section showcase-performance-section" id="performance">
        <h2 className="section-heading-centered">
          Unlock true <span className="highlight-salmon">performance</span>
        </h2>

        <div className="performance-content-grid">
          {/* Left Mockup: BILL/2023/11/0001 */}
          <div className="performance-mockup-col">
            <div className="bill-record-mockup">
              <div className="bill-top-row">
                <span className="bill-id">BILL/2023/11/0001</span>
                <span className="bill-status-pill">Posted</span>
              </div>
              <div className="bill-meta-row">
                <div>
                  <small>Vendor</small>
                  <b>Wood Corner Store</b>
                </div>
                <div>
                  <small>Bill Date</small>
                  <b>11/12/2026</b>
                </div>
                <div>
                  <small>Due Date</small>
                  <b>11/26/2026</b>
                </div>
              </div>
              <div className="bill-table-lines">
                <div className="bill-line-head">
                  <span>Product</span>
                  <span>Quantity</span>
                  <span>Price</span>
                  <span>Subtotal</span>
                </div>
                <div className="bill-line-row">
                  <span>[FURN_7781] Office Desk</span>
                  <span>2.00</span>
                  <span>$ 240.00</span>
                  <span>$ 480.00</span>
                </div>
                <div className="bill-line-row">
                  <span>[FURN_9022] Acoustic Screen</span>
                  <span>1.00</span>
                  <span>$ 134.50</span>
                  <span>$ 134.50</span>
                </div>
              </div>
              <div className="bill-total-row">
                <span>Total:</span>
                <b>$ 614.50</b>
              </div>
            </div>
          </div>

          {/* Right Speed Benchmark: 90 seconds / milliseconds */}
          <div className="performance-text-col">
            <div className="speed-clock-badge">
              <span className="clock-icon-doodle">⏱️</span>
              <div className="clock-text-stack">
                <span className="clock-number">90 seconds</span>
                <span className="clock-caption">From login to vendor bill</span>
              </div>
            </div>

            <h3 className="performance-lead-copy">
              <strong>Speed matters.</strong> All operations are processed in less than 90 milliseconds,
              faster than the blink of an eye. It helps teams do much more in less time.
            </h3>

            <p className="performance-sub-copy">
              A snappy interface is a game changer. No reloading pages, zero input lag, and instantaneous
              financial reports give your operators superpowers.
            </p>
          </div>
        </div>

        {/* Gray hand-drawn connecting arrow */}
        <div className="connecting-arrow-center" aria-hidden="true">
          <svg viewBox="0 0 100 60" width="80" height="50" fill="none">
            <path d="M20 5 C50 35, 70 20, 80 50" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
            <path d="M72 45 L80 50 L84 41" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* 5. ZERO DATA ENTRY SECTION: "No data entry! Just automation" (Screenshot 2 & 3) */}
      <section className="showcase-section showcase-automation-section" id="automation">
        <div className="automation-heading-group">
          <h2 className="automation-main-title">
            <span className="title-line-1">
              No data entry!
              <svg className="wavy-underline-blue" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M0,6 Q25,0 50,6 T100,6 T150,6 T200,6" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            <span className="title-line-2">
              Just automation
              <span className="check-circle-green">✓</span>
            </span>
          </h2>
        </div>

        <div className="automation-content-grid">
          <div className="automation-text-col">
            <p className="automation-highlight-text">
              <strong>Experience zero data entry.</strong> Our advanced AI-powered invoice data capture has a{' '}
              <strong className="badge-highlight-rate">98% recognition rate</strong>. All you have to do is validate the invoice.
            </p>
            <p className="automation-description">
              Upload PDF bills, mobile photo receipts, or EDI streams. Multiix extracts vendor names, line items,
              taxes, and due dates automatically.
            </p>
            <div className="automation-action-row">
              <button
                type="button"
                className="showcase-btn-primary mini"
                onClick={handleLaunchApp}
              >
                Start now - It's free
              </button>
            </div>
          </div>

          {/* AI Recognition Visual Mockup */}
          <div className="automation-mockup-col">
            <div className="ocr-split-visual">
              {/* Parsed Digital Invoice Card */}
              <div className="parsed-bill-card">
                <div className="parsed-actions-bar">
                  <span className="btn-action purple">Register Payment</span>
                  <span className="btn-action">Credit Note</span>
                  <span className="btn-action">Reset to Draft</span>
                </div>
                <div className="parsed-header">
                  <small>Vendor bill</small>
                  <h4>BILL/2018/08/0001</h4>
                </div>
                <div className="parsed-details">
                  <div><span>Vendor:</span> <b>Azure Interior</b></div>
                  <div><span>Bill Date:</span> <b>08/12/2026</b></div>
                  <div><span>Total:</span> <b>$ 738.00</b></div>
                </div>
                <div className="ai-tag-verified">
                  <Sparkles size={13} /> 98% AI Match Accuracy
                </div>
              </div>

              {/* Scanned Paper Receipt on Right */}
              <div className="scanned-paper-receipt">
                <div className="paper-header">
                  <span className="paper-logo">🧾</span>
                  <b>INVOICE</b>
                </div>
                <div className="paper-barcode" />
                <div className="paper-lines">
                  <div className="line" />
                  <div className="line short" />
                  <div className="line" />
                </div>
                <div className="scan-laser-line" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SMART BANK RECONCILIATION / AUTOMATION (Screenshot 3) */}
      <section className="showcase-section showcase-reconciliation-section">
        <div className="reconciliation-header-row">
          <h2 className="reconciliation-title">
            Smart <span className="highlight-yellow">bank reconciliation</span>
          </h2>
          <div className="banks-supported-badge">
            <span className="bank-icon-gold">🏛️</span>
            <b>28,000+</b>
            <small>banks supported</small>
          </div>
        </div>

        <div className="reconciliation-content-grid">
          <div className="reconciliation-features-col">
            <div className="reconcile-feature-item">
              <h3>Bank synchronization</h3>
              <p>
                Never import bank statements manually again. Multiix integrates with 28,000 banks
                from all around the world! Real-time auto sync every 4 hours.
              </p>
            </div>
            <div className="reconcile-feature-item">
              <h3>Smart AI matching</h3>
              <p>
                <strong>95%</strong> of transactions are matched automatically with financial records,
                invoices, and expenses based on machine-learned historical patterns.
              </p>
            </div>
          </div>

          <div className="reconciliation-preview-col">
            <div className="bank-reconcile-card">
              <div className="bank-match-head">
                <div className="bank-date-label">Bank · 2026-09-03</div>
                <div className="bank-amount-val">$ 6,378.00</div>
              </div>
              <div className="bank-matched-rows">
                <div className="matched-row-bar">
                  <div className="bar-rect green" />
                  <div className="bar-num">$ 1,275.00</div>
                  <span className="badge-matched">Matched</span>
                </div>
                <div className="matched-row-bar">
                  <div className="bar-rect green" />
                  <div className="bar-num">$ 5,103.00</div>
                  <span className="badge-matched">Matched</span>
                </div>
              </div>
            </div>

            {/* Avatar Speech Bubble: "Wait! There is more!" */}
            <div className="avatar-speech-bubble-orange">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Advisor"
                className="speech-avatar"
              />
              <div className="bubble-text-orange">
                <span>Wait! There is more!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ALL THE FEATURES DONE RIGHT (Screenshot 3) */}
      <section className="showcase-section showcase-features-section">
        <h2 className="section-heading-centered">
          All the <span className="doodle-loop-teal">features</span> done{' '}
          <span className="doodle-underline-blue">right.</span>
        </h2>

        <div className="features-six-grid">
          {featureCards.map((feat, idx) => (
            <div key={idx} className="feature-six-card">
              <div className="card-top-head">
                <h3 className="card-title">{feat.title}</h3>
                <span className="card-star-badge">★</span>
              </div>
              <p className="card-desc">{feat.desc}</p>
            </div>
          ))}
        </div>

        <div className="see-all-features-row">
          <Link to="/services" className="see-all-link">
            See all features <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 8. ONE NEED, ONE APP (Screenshot 1) */}
      <section className="showcase-section showcase-one-need-section">
        <div className="one-need-heading-block">
          <h2 className="one-need-title">
            One <span className="brush-word-blue">need</span>, one{' '}
            <span className="brush-word-blue">app</span>.
          </h2>
          <p className="one-need-subtitle">Expand as you grow.</p>
        </div>

        <div className="one-need-five-row">
          {relatedApps.map((rel) => (
            <Link
              key={rel.slug}
              to={`/apps/${rel.slug}`}
              className="one-need-five-card"
            >
              <div className="five-card-icon">
                <img
                  src={rel.icon}
                  alt={rel.name}
                  onError={(e) => { e.currentTarget.src = '/oxoo-icon.png'; }}
                />
              </div>
              <div className="five-card-text">
                <span className="five-card-title">{rel.name}</span>
                <small className="five-card-desc">{rel.desc}</small>
              </div>
            </Link>
          ))}
        </div>

        <div className="see-all-apps-row">
          <Link to="/apps" className="see-all-apps-link">
            See all Apps <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 9. JOIN 28 MILLION USERS + KPMG QUOTE (Screenshot 1) */}
      <section className="showcase-section showcase-social-proof-section">
        <JoinMosaic />
        {false && <div className="avatar-cloud-wrapper">
          <div className="avatar-cloud-shapes">
            <span className="shape squarcle-1" />
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=140&q=80" alt="" className="user-face f1" />
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=140&q=80" alt="" className="user-face f2" />
            <span className="shape circle-1" />
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=140&q=80" alt="" className="user-face f3" />
            <span className="shape pill-purple" />
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=140&q=80" alt="" className="user-face f4" />
            <span className="shape circle-2" />
            <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=140&q=80" alt="" className="user-face f5" />
            <span className="shape squarcle-2" />
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=140&q=80" alt="" className="user-face f6" />
          </div>

          {/* Center Text Floating on Cloud */}
          <div className="avatar-cloud-center-box">
            <div className="cursive-happy-doodle">
              <svg viewBox="0 0 40 20" width="30" height="15" fill="none">
                <path d="M5 15 Q20 5 35 15" stroke="#f59e0b" strokeWidth="2.5" />
              </svg>
              <span className="happy-text">happy</span>
            </div>
            <h3 className="join-users-title">Join 28 million users</h3>
            <p className="join-users-caption">who grow their business with Multiix</p>
          </div>
        </div>}

        {/* Testimonial Quote Card (KPMG) */}
        <div className="kpmg-testimonial-card">
          <div className="quote-mark-large">“</div>
          <div className="quote-content">
            <p className="quote-body-text">
              A VAT closing that used to take 4 days is now done in 3 hours with Multiix,
              with a better service for our clients: real-time accounting.
            </p>
            <div className="quote-author-row">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&q=80"
                alt="Wim Van den Brande"
                className="quote-author-avatar"
              />
              <div className="quote-author-info">
                <b className="author-name">Wim Van den Brande</b>
                <span className="author-title">Head of KPMG Tax, Legal & Accountancy</span>
                <span className="author-logo-badge">KPMG</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. BOTTOM CTA: "Unleash your growth potential" (Screenshot 1) */}
      <section className="showcase-bottom-cta-section" id="advisor">
        <div className="cta-sunburst-doodle" aria-hidden="true">
          <svg viewBox="0 0 160 80" width="140" height="70" fill="none">
            <line x1="80" y1="70" x2="80" y2="20" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="70" x2="40" y2="30" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="100" y1="70" x2="120" y2="30" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="45" y1="75" x2="15" y2="50" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="115" y1="75" x2="145" y2="50" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="bottom-cta-title">
          Unleash <br />
          <span className="cursive-growth-text">your growth potential</span>
        </h2>

        <div className="bottom-cta-action-wrap">
          <button
            type="button"
            className="showcase-btn-primary large"
            onClick={handleLaunchApp}
          >
            Start now - It's free
          </button>
          <div className="bottom-cta-micro-note">
            <span className="arrow-up-teal">↑</span>
            <span>No credit card required. Instant access.</span>
          </div>
        </div>
      </section>

      {/* 11. GLOBAL FOOTER */}
      <Footer />

      {/* Video / Interactive Demo Modal */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="video-modal-backdrop" onClick={() => setVideoModalOpen(false)}>
            <motion.div
              className="video-modal-dialog"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="video-close-btn"
                onClick={() => setVideoModalOpen(false)}
                type="button"
              >
                <X size={20} />
              </button>
              <div className="video-player-frame">
                <div className="video-header-title">
                  <Sparkles size={18} color="#10b981" />
                  <h3>Interactive {app.name} Tour & Automation</h3>
                </div>
                <div className="video-mock-screen">
                  <div className="demo-live-preview">
                    <h4>Multiix {app.name} Cloud Platform</h4>
                    <p>Real-time automated flows, multi-entity support, and instant bank sync.</p>
                    <button
                      type="button"
                      className="showcase-btn-primary"
                      onClick={() => {
                        setVideoModalOpen(false);
                        handleLaunchApp();
                      }}
                      style={{ marginTop: '20px' }}
                    >
                      Start Free Now ➔
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App Demo Request Modal with Animation */}
      <AppDemoRequestModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        app={app}
      />
    </div>
  );
}
