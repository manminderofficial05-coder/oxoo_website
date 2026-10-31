import React, { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, User, Mail, Phone, Building2,
  Globe, Languages, ArrowRight, Check, X, Crown, Sparkles,
  Layers, CheckCircle2, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { getAppBySlug, APPS_DATA } from '../appsData';
import { submitLead } from '../api';
import './demo.css';

export default function LiveDemoExperience() {
  const { appSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const companyParam = queryParams.get('company') || 'abcd.oxoo';

  // Selected suite
  const initialApp = getAppBySlug(appSlug || 'website-builder') || APPS_DATA[0];
  const [selectedApp, setSelectedApp] = useState(initialApp);

  // Automatically redirect directly to the live demo / portal without any intermediate cards
  React.useEffect(() => {
    const websiteSlugs = ['website', 'website-builder', 'ai-website-builder', 'ecommerce-websites', '3d-websites', 'web-apps-other', 'ecommerce', 'events', 'blog', 'elearning', 'forum'];
    const financeSlugs = ['accounting', 'invoicing', 'expenses', 'sign', 'spreadsheet', 'esg', 'finance'];

    const isWebsiteApp = websiteSlugs.includes(selectedApp.slug?.toLowerCase()) || selectedApp.category === 'Websites' || selectedApp.category === 'Websites & Apps';
    const isFinanceApp = financeSlugs.includes(selectedApp.slug?.toLowerCase()) || selectedApp.category === 'Finance';

    const target = (isWebsiteApp || isFinanceApp)
      ? `/apps/${selectedApp.slug}/live-demo?company=demo.oxoo`
      : `/apps/${selectedApp.slug}/portal?company=demo.oxoo`;
    navigate(target, { replace: true });
  }, [selectedApp, navigate]);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState('abcd.oxoo');
  const [country, setCountry] = useState('India');
  const [language, setLanguage] = useState('English');
  const [agreed, setAgreed] = useState(true);

  // UI state
  const [appPickerOpen, setAppPickerOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [navDropdown, setNavDropdown] = useState(null); // 'solutions' | 'resources' | 'company'
  const [submitting, setSubmitting] = useState(false);
  const [launchingDemo, setLaunchingDemo] = useState(false);

  // App suite descriptions map
  const getAppSuiteDetails = (app) => {
    switch (app.slug) {
      case 'website-builder':
      case 'website':
        return {
          title: 'Website Builder Suite',
          description: 'Website Builder, Workflows, Integrations and Reports.'
        };
      case 'accounting':
        return {
          title: 'Accounting & Finance Suite',
          description: 'Accounting, Invoicing, Expenses, GST & Banking.'
        };
      case 'crm':
        return {
          title: 'CRM & Pipeline Suite',
          description: 'Lead Management, Sales Pipelines, Email Automation & Deals.'
        };
      case 'inventory':
        return {
          title: 'Supply Chain & Inventory Suite',
          description: 'Stock Management, Warehouses, Barcode & Purchase Orders.'
        };
      case 'pos':
        return {
          title: 'Point of Sale (POS) Suite',
          description: 'Retail Billing, Barcode Scanning, Multi-Store & Cashier Sync.'
        };
      case 'hr':
      case 'hrms':
        return {
          title: 'HRMS & Payroll Suite',
          description: 'Employee Directory, Leave Tracking, Attendance & Payroll.'
        };
      case 'project':
      case 'projects':
        return {
          title: 'Project Management Suite',
          description: 'Gantt Charts, Timesheets, Milestones & Team Collaboration.'
        };
      case 'ecommerce':
        return {
          title: 'eCommerce Store Suite',
          description: 'Online Store, Product Catalog, Payment Gateways & Orders.'
        };
      default:
        return {
          title: `${app.name} Suite`,
          description: `${app.name}, Workflows, Integrations and Reports.`
        };
    }
  };

  const suiteDetails = getAppSuiteDetails(selectedApp);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      alert('Please accept the agreement to continue with the demo.');
      return;
    }

    setSubmitting(true);
    const cleanCompany = (companyName.trim() || 'abcd.oxoo').toLowerCase();
    const formattedDomain = cleanCompany.endsWith('.oxoo') ? cleanCompany : `${cleanCompany}.oxoo`;

    try {
      localStorage.setItem('oxoo_demo_company', formattedDomain);
      localStorage.setItem('oxoo_demo_user', fullName || 'Oxoo Guest');
      localStorage.setItem('oxoo_demo_app', selectedApp.slug);
    } catch (err) {
      // safe fallback
    }

    try {
      await submitLead({
        name: fullName || 'Oxoo Demo Guest',
        email: workEmail || `${formattedDomain.replace(/[^a-z0-9]/g, '') || 'guest'}@company.com`,
        phone: `${phonePrefix} ${phoneNumber}`,
        company: formattedDomain,
        service: suiteDetails.title,
        message: `Oxoo Demo requested for ${suiteDetails.title} (Country: ${country}, Language: ${language})`,
        source: 'oxoo-start-demo-form'
      });
    } catch (err) {
      console.warn('Lead submit note:', err);
    }

    setSubmitting(false);
    setLaunchingDemo(true);

    setTimeout(() => {
      navigate(`/apps/${selectedApp.slug}/live-demo?company=${encodeURIComponent(formattedDomain)}`);
    }, 1200);
  };

  return (
    <div className="oxoo-full-tab-root">
      {/* ==============================================================
          TOP NAVIGATION BAR (Exact Match to User Screenshot)
          ============================================================== */}
      <header className="oxoo-tab-nav">
        <div className="oxoo-tab-nav-inner">
          {/* Left: Oxoo Logo with Tagline */}
          <Link to="/" className="oxoo-tab-brand-link">
            <img
              src="/oxoo-logo.png"
              alt="Oxoo"
              className="oxoo-tab-brand-img"
            />
          </Link>

          {/* Center Navigation Links */}
          <nav className="oxoo-tab-nav-menu">
            <Link to="/apps" className="oxoo-tab-nav-link">
              Apps
            </Link>

            <div
              className="oxoo-tab-nav-dropdown-wrap"
              onMouseEnter={() => setNavDropdown('solutions')}
              onMouseLeave={() => setNavDropdown(null)}
            >
              <button
                type="button"
                className={`oxoo-tab-nav-link dropdown-btn ${navDropdown === 'solutions' ? 'active' : ''}`}
                onClick={() => setNavDropdown(navDropdown === 'solutions' ? null : 'solutions')}
              >
                Solutions <ChevronDown size={14} className="oxoo-caret" />
              </button>
              {navDropdown === 'solutions' && (
                <div className="oxoo-nav-popover">
                  <Link to="/services" className="oxoo-popover-item">
                    <strong>Enterprise Solutions</strong>
                    <span>Full-suite workflows for mid-market & enterprise</span>
                  </Link>
                  <Link to="/industries" className="oxoo-popover-item">
                    <strong>Industry Templates</strong>
                    <span>Retail, Manufacturing, Services, Healthcare</span>
                  </Link>
                  <Link to="/apps" className="oxoo-popover-item">
                    <strong>All 24 Native Apps</strong>
                    <span>Seamlessly connected business modules</span>
                  </Link>
                </div>
              )}
            </div>

            <Link to="/pricing" className="oxoo-tab-nav-link">
              Pricing
            </Link>

            <div
              className="oxoo-tab-nav-dropdown-wrap"
              onMouseEnter={() => setNavDropdown('resources')}
              onMouseLeave={() => setNavDropdown(null)}
            >
              <button
                type="button"
                className={`oxoo-tab-nav-link dropdown-btn ${navDropdown === 'resources' ? 'active' : ''}`}
                onClick={() => setNavDropdown(navDropdown === 'resources' ? null : 'resources')}
              >
                Resources <ChevronDown size={14} className="oxoo-caret" />
              </button>
              {navDropdown === 'resources' && (
                <div className="oxoo-nav-popover">
                  <a href="#docs" onClick={(e) => { e.preventDefault(); alert('Oxoo API & Documentation hub'); }} className="oxoo-popover-item">
                    <strong>Documentation</strong>
                    <span>Quickstart guides, APIs, and release notes</span>
                  </a>
                  <a href="#support" onClick={(e) => { e.preventDefault(); alert('24/7 Priority Support desk'); }} className="oxoo-popover-item">
                    <strong>Customer Support</strong>
                    <span>Ticketing, knowledge base & live chat</span>
                  </a>
                </div>
              )}
            </div>

            <div
              className="oxoo-tab-nav-dropdown-wrap"
              onMouseEnter={() => setNavDropdown('company')}
              onMouseLeave={() => setNavDropdown(null)}
            >
              <button
                type="button"
                className={`oxoo-tab-nav-link dropdown-btn ${navDropdown === 'company' ? 'active' : ''}`}
                onClick={() => setNavDropdown(navDropdown === 'company' ? null : 'company')}
              >
                Company <ChevronDown size={14} className="oxoo-caret" />
              </button>
              {navDropdown === 'company' && (
                <div className="oxoo-nav-popover">
                  <Link to="/services" className="oxoo-popover-item">
                    <strong>About Oxoo</strong>
                    <span>Our mission, global team, and cloud architecture</span>
                  </Link>
                  <Link to="/contact" className="oxoo-popover-item">
                    <strong>Contact Sales</strong>
                    <span>Speak with an enterprise solutions architect</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Items */}
          <div className="oxoo-tab-nav-actions">
            <button
              type="button"
              className="oxoo-tab-search-btn"
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search"
            >
              <Search size={18} color="#475569" />
            </button>

            <Link to="/signin" className="oxoo-tab-signin-link">
              Sign in
            </Link>

            <button
              type="button"
              className="oxoo-tab-purchase-btn"
              onClick={() => setPurchaseModalOpen(true)}
            >
              <span>Purchase Now</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ==============================================================
          MAIN HERO CANVAS WITH HIGH-RES FLUID ARTWORK
          ============================================================== */}
      <main className="oxoo-tab-main-viewport">
        {/* Left Fluid Wave & Bubble Artwork */}
        <div className="oxoo-tab-art-left" aria-hidden="true">
          <img src="/oxoo-demo-bg-left.png" alt="" className="oxoo-art-layer" />
        </div>

        {/* Right Fluid Wave & Bubble Artwork */}
        <div className="oxoo-tab-art-right" aria-hidden="true">
          <img src="/oxoo-demo-bg-right.png" alt="" className="oxoo-art-layer" />
        </div>

        {/* Ambient Radial Highlights */}
        <div className="oxoo-ambient-glow" aria-hidden="true" />

        {/* Central Content Column */}
        <div className="oxoo-tab-content-container">
          {/* Top Pill Badge: FREE DEMO */}
          <div className="oxoo-free-demo-badge-wrap">
            <span className="oxoo-free-demo-badge">FREE DEMO</span>
          </div>

          {/* Headline: Start Your oxoo Demo */}
          <h1 className="oxoo-tab-headline">
            Start Your{' '}
            <span className="oxoo-headline-brand-anchor">
              <img
                src="/oxoo-logo.png"
                alt="oxoo"
                className="oxoo-headline-logo-img"
              />
              <svg
                className="oxoo-headline-brush-svg"
                viewBox="0 0 135 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M 3 6 C 24 2.5, 68 2, 131 5.5 C 96 8.5, 42 8.5, 3 6 Z"
                  fill="#00e5ff"
                />
                <path
                  d="M 12 7 C 46 4.5, 88 4.5, 126 6"
                  stroke="#00d2d3"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>{' '}
            Demo
          </h1>

          {/* Subtitle */}
          <p className="oxoo-tab-subtitle">
            See how Oxoo connects your business in one workspace.
          </p>

          {/* ==========================================================
              WHITE FORM CARD (Exact Match to Screenshot)
              ========================================================== */}
          <div className="oxoo-demo-form-card">
            {/* Top Suite Header Box */}
            <div className="oxoo-suite-selection-box">
              <div className="oxoo-suite-box-left">
                <div className="oxoo-suite-icon-tile">
                  <Globe size={22} className="oxoo-suite-icon" />
                </div>
                <div className="oxoo-suite-meta">
                  <h3 className="oxoo-suite-title">{suiteDetails.title}</h3>
                  <p className="oxoo-suite-desc">{suiteDetails.description}</p>
                </div>
              </div>
              <button
                type="button"
                className="oxoo-suite-change-btn"
                onClick={() => setAppPickerOpen(true)}
              >
                Change selection →
              </button>
            </div>

            {/* Launching live workspace... */}
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
              <p>Launching live interactive workspace...</p>
            </div>

            {/* Bottom Card Footer */}
            <div className="oxoo-form-card-footer">
              <span>Already have an account? </span>
              <Link to="/signin" className="oxoo-footer-signin-link">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ==============================================================
          APP PICKER DRAWER / MODAL (Change selection →)
          ============================================================== */}
      <AnimatePresence>
        {appPickerOpen && (
          <div className="oxoo-modal-backdrop" onClick={() => setAppPickerOpen(false)}>
            <motion.div
              className="oxoo-app-picker-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="oxoo-picker-header">
                <div>
                  <h3 className="oxoo-picker-title">Select Your Business App Suite</h3>
                  <p className="oxoo-picker-desc">
                    Choose the primary application suite to preconfigure in your instant demo.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-picker-close-btn"
                  onClick={() => setAppPickerOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="oxoo-picker-grid">
                {APPS_DATA.map((app) => {
                  const isSelected = selectedApp.slug === app.slug;
                  return (
                    <div
                      key={app.slug}
                      className={`oxoo-picker-tile ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedApp(app);
                        setAppPickerOpen(false);
                      }}
                    >
                      <div className="oxoo-picker-tile-left">
                        <div className="oxoo-picker-tile-icon">
                          {app.iconSrc ? (
                            <img src={app.iconSrc} alt={app.name} />
                          ) : (
                            <Layers size={20} color="#00bcd4" />
                          )}
                        </div>
                        <div>
                          <div className="oxoo-picker-tile-name">{app.name} Suite</div>
                          <div className="oxoo-picker-tile-cat">{app.category || 'Business'}</div>
                        </div>
                      </div>
                      {isSelected ? (
                        <span className="oxoo-picker-check-badge">
                          <Check size={14} color="#ffffff" strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="oxoo-picker-select-text">Select →</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================================
          PURCHASE PLAN MODAL (When clicking "Purchase Now →")
          ============================================================== */}
      <AnimatePresence>
        {purchaseModalOpen && (
          <div className="oxoo-modal-backdrop" onClick={() => setPurchaseModalOpen(false)}>
            <motion.div
              className="oxoo-purchase-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="oxoo-purchase-header">
                <span className="oxoo-purchase-pill">
                  <Crown size={12} /> ENTERPRISE CLOUD
                </span>
                <button
                  type="button"
                  className="oxoo-picker-close-btn"
                  onClick={() => setPurchaseModalOpen(false)}
                >
                  <X size={18} />
                </button>
                <h2 className="oxoo-purchase-title">Choose Your Oxoo Subscription</h2>
                <p className="oxoo-purchase-desc">
                  Immediate activation for {suiteDetails.title} with full platform integrations.
                </p>
              </div>

              <div className="oxoo-purchase-grid">
                {[
                  {
                    name: 'Starter',
                    price: '₹15,000',
                    cycle: '/mo',
                    features: ['5 Team Seats', '3 Core Apps', 'SSL & Custom Domain', 'Email Support']
                  },
                  {
                    name: 'Growth',
                    price: '₹25,000',
                    cycle: '/mo',
                    popular: false,
                    features: ['10 Team Seats', '6 Core Apps', 'Workflow Automations', 'Priority Support']
                  },
                  {
                    name: 'Business Pro',
                    price: '₹48,200',
                    cycle: '/mo',
                    popular: true,
                    features: ['15 Team Seats', '12 Business Apps', 'Website Builder Studio', '24/7 Dedicated SLA']
                  },
                  {
                    name: 'Enterprise',
                    price: '₹1,24,000',
                    cycle: '/mo',
                    popular: false,
                    features: ['Unlimited Seats', 'All 24 Oxoo Apps', 'Dedicated Cloud Server', 'Custom Integrations']
                  }
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`oxoo-purchase-tile ${plan.popular ? 'popular' : ''}`}
                  >
                    {plan.popular && <span className="oxoo-popular-ribbon">Most Popular</span>}
                    <h4 className="oxoo-plan-name">{plan.name}</h4>
                    <div className="oxoo-plan-price">
                      {plan.price}
                      <span className="oxoo-plan-cycle">{plan.cycle}</span>
                    </div>
                    <ul className="oxoo-plan-features">
                      {plan.features.map((f, i) => (
                        <li key={i}>
                          <Check size={13} color="#00bcd4" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="oxoo-plan-choose-btn"
                      onClick={() => {
                        navigate(`/pricing?plan=${encodeURIComponent(plan.name)}`);
                      }}
                    >
                      Choose {plan.name}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==============================================================
          GLOBAL SEARCH MODAL
          ============================================================== */}
      <AnimatePresence>
        {searchModalOpen && (
          <div className="oxoo-modal-backdrop" onClick={() => setSearchModalOpen(false)}>
            <motion.div
              className="oxoo-search-dialog"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="oxoo-search-input-wrap">
                <Search size={20} color="#00bcd4" />
                <input
                  type="text"
                  placeholder="Search Oxoo apps, solutions, documentation..."
                  autoFocus
                  className="oxoo-search-input"
                />
                <button
                  type="button"
                  className="oxoo-search-close"
                  onClick={() => setSearchModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="oxoo-search-quick-links">
                <span className="oxoo-search-label">Quick Suggestions:</span>
                {APPS_DATA.slice(0, 6).map((app) => (
                  <button
                    key={app.slug}
                    type="button"
                    className="oxoo-search-chip"
                    onClick={() => {
                      setSelectedApp(app);
                      setSearchModalOpen(false);
                    }}
                  >
                    {app.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
