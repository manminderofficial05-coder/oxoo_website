import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check, ArrowRight, Grid, ExternalLink, Sparkles
} from 'lucide-react';
import { Header, Footer } from './components';
import './pricing.css';

// --------------------------------------------------------------------------
// Core Software Catalog & Categories (reusing existing OXOO application assets)
// --------------------------------------------------------------------------
export const SOFTWARE_MODULES = [
  {
    id: 'finance',
    name: 'Finance',
    desc: 'Accounting, Invoicing, Expenses',
    iconSrc: '/apps/logo-accounting.png?v=clean',
    price: 560,
    color: '#3b82f6'
  },
  {
    id: 'hr',
    name: 'Human Resources',
    desc: 'HR, Payroll, Recruitment',
    iconSrc: '/apps/logo-hr.png?v=clean',
    price: 560,
    color: '#8b5cf6'
  },
  {
    id: 'sales',
    name: 'Sales',
    desc: 'CRM, Quotations, Orders',
    iconSrc: '/apps/logo-sales.png?v=clean',
    price: 560,
    color: '#ef4444'
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    desc: 'Inventory, Purchase, Manufacturing',
    iconSrc: '/apps/logo-inventory.png?v=clean',
    price: 560,
    color: '#10b981'
  },
  {
    id: 'productivity',
    name: 'Productivity',
    desc: 'Project, Tasks, Timesheets',
    iconSrc: '/apps/logo-project.png?v=clean',
    price: 560,
    color: '#f59e0b'
  }
];

export const SOFTWARE_CATEGORIES = [
  {
    name: 'Finance',
    sub: 'Accounting, Invoicing, Expenses, Assets, Taxes',
    icon: '/apps/logo-accounting.png?v=clean',
    bg: '#eff6ff'
  },
  {
    name: 'Human Resources',
    sub: 'Employees, Payroll, Recruitment, Leaves',
    icon: '/apps/logo-hr.png?v=clean',
    bg: '#f5f3ff'
  },
  {
    name: 'Sales',
    sub: 'CRM, Quotations, Orders, Invoicing',
    icon: '/apps/logo-sales.png?v=clean',
    bg: '#fff1f2'
  },
  {
    name: 'Supply Chain',
    sub: 'Inventory, Purchase, Manufacturing, Quality',
    icon: '/apps/logo-inventory.png?v=clean',
    bg: '#ecfdf5'
  },
  {
    name: 'Productivity',
    sub: 'Projects, Tasks, Timesheets, Planning',
    icon: '/apps/logo-project.png?v=clean',
    bg: '#fffbeb'
  },
  {
    name: 'All Apps Access',
    sub: 'Get complete OXOO with all modules',
    icon: '/apps/logo-dashboard.png?v=clean',
    bg: '#f3e8ff'
  }
];

export default function PricingPage() {
  const navigate = useNavigate();

  // State: Billing toggle (default yearly)
  const [isYearly, setIsYearly] = useState(false);

  // Single Software selection in Card 2
  const [selectedSingleModule, setSelectedSingleModule] = useState('sales');

  // Custom Softwares selection in Card 3
  const [selectedCustomModules, setSelectedCustomModules] = useState(['hr', 'sales']);

  const handleToggleCustomApp = (appId) => {
    if (selectedCustomModules.includes(appId)) {
      if (selectedCustomModules.length > 2) {
        setSelectedCustomModules(selectedCustomModules.filter((id) => id !== appId));
      }
    } else {
      setSelectedCustomModules([...selectedCustomModules, appId]);
    }
  };

  // Navigate to full-page checkout flow
  const handleGoToCheckout = (plan, appList = []) => {
    const appsParam = appList.length > 0 ? appList.join(',') : selectedSingleModule;
    navigate(`/checkout?plan=${plan}&apps=${appsParam}&billing=${isYearly ? 'yearly' : 'monthly'}`);
  };

  // Calculate live custom price
  const customCount = selectedCustomModules.length;
  const customBaseMonthly = customCount <= 2 ? 980 : 980 + (customCount - 2) * 560;
  const customPrice = isYearly ? Math.round(customBaseMonthly * 0.8) : customBaseMonthly;

  return (
    <>
      <Header />
      <main className="oxoo-pricing-page-root">
        {/* ================================================================= */}
        {/* 1. Header & Billing Toggle                                        */}
        {/* ================================================================= */}
        <section className="pricing-hero-wrap">
          <h1 className="pricing-main-heading">
            Simple & <span className="gradient-word">Transparent Pricing</span>
          </h1>
          <p className="pricing-sub-heading">
            Choose the plan that fits your business needs. Start free, buy one software, or create a custom package.
          </p>

          <div className="billing-toggle-row">
            <span
              className={`billing-toggle-label ${isYearly ? 'active' : ''}`}
              onClick={() => setIsYearly(true)}
            >
              Yearly
            </span>
            <button
              type="button"
              className="billing-toggle-switch"
              onClick={() => setIsYearly(!isYearly)}
              aria-label="Toggle Billing Frequency"
            >
              <span className={`billing-toggle-knob ${!isYearly ? 'monthly' : ''}`} />
            </button>
            <span
              className={`billing-toggle-label ${!isYearly ? 'active' : ''}`}
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </span>
            <span className="save-pill-badge">Save up to 20%</span>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. Three Pricing Cards                                            */}
        {/* ================================================================= */}
        <section className="pricing-cards-container">
          {/* Card 1: Free Demo */}
          <div className="pricing-card">
            <div className="card-top-banner banner-blue">
              Try OXOO Without Any Cost
            </div>
            <div className="card-content-body">
              <h2 className="card-plan-title">Free Demo</h2>
              <p className="card-plan-tagline">Experience OXOO with live demo</p>

              <div className="card-price-row">
                <span className="price-currency blue">Rs</span>
                <span className="price-val blue">0</span>
              </div>
              <div className="price-unit-caption">Completely Free</div>

              <ul className="card-features-list">
                <li className="feature-check-item">
                  <span className="feature-icon-bullet blue"><Check size={12} /></span>
                  <span>One software (choose any)</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet blue"><Check size={12} /></span>
                  <span>Unlimited users</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet blue"><Check size={12} /></span>
                  <span>Full feature access for 14 days</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet blue"><Check size={12} /></span>
                  <span>Explore UI & workflow</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet blue"><Check size={12} /></span>
                  <span>No credit card required</span>
                </li>
              </ul>

              <button
                type="button"
                className="card-cta-btn btn-blue"
                onClick={() => handleGoToCheckout('free', ['finance'])}
              >
                Start Free Demo <ArrowRight size={16} />
              </button>

              {/* Added Button Link to Explore All Apps as requested */}
              <Link
                to="/apps"
                className="card-secondary-btn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <Grid size={14} /> Go to All Apps
              </Link>

              <div className="card-footer-note">
                No cost · No commitment · 14 days access
              </div>
            </div>
          </div>

          {/* Card 2: Single Software (renamed from Single App) */}
          <div className="pricing-card">
            <div className="card-top-banner banner-coral">
              Best for Small Business
            </div>
            <div className="card-content-body">
              <h2 className="card-plan-title">Single Software</h2>
              <p className="card-plan-tagline">Buy one software at affordable price</p>

              <div className="card-price-row">
                <span className="price-currency coral">Rs</span>
                <span className="price-val coral">{isYearly ? '448' : '560'}</span>
                <div className="price-strike-wrap">
                  <span className="price-struck">Rs 725</span>
                  <span className="discount-pill coral">22% OFF</span>
                </div>
              </div>
              <div className="price-unit-caption">/ user / month</div>

              {/* Software Radio Selector */}
              <div className="single-app-selector-box">
                <span className="module-select-title">Choose any one software</span>
                {SOFTWARE_MODULES.map((mod) => (
                  <label
                    key={mod.id}
                    className={`module-radio-item ${selectedSingleModule === mod.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSingleModule(mod.id)}
                  >
                    <input
                      type="radio"
                      name="single-software-choice"
                      checked={selectedSingleModule === mod.id}
                      onChange={() => setSelectedSingleModule(mod.id)}
                    />
                    <img src={mod.iconSrc} alt={mod.name} className="module-chip-icon" />
                    <div className="module-info-wrap">
                      <span className="module-name">{mod.name}</span>
                      <span className="module-desc">({mod.desc})</span>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="button"
                className="card-cta-btn btn-coral"
                onClick={() => handleGoToCheckout('single', [selectedSingleModule])}
              >
                Buy One Software <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="card-secondary-btn"
                onClick={() => handleGoToCheckout('single', [selectedSingleModule])}
              >
                Start Free Trial
              </button>

              <div className="card-footer-note">
                Full access · All features included · Cancel anytime
              </div>
            </div>
          </div>

          {/* Card 3: Custom Softwares (renamed from Custom (Multiple Apps)) */}
          <div className="pricing-card featured-card">
            <div className="card-top-banner banner-mint">
              Most Popular for Growing Business
            </div>
            <div className="card-content-body">
              <h2 className="card-plan-title">Custom Softwares</h2>
              <p className="card-plan-tagline">Choose 2 or more software and get advanced features</p>

              <div className="card-price-row">
                <span className="price-currency mint">Rs</span>
                <span className="price-val mint">{customPrice}</span>
                <div className="price-strike-wrap">
                  <span className="price-struck">Rs 1,350</span>
                  <span className="discount-pill mint">27% OFF</span>
                </div>
              </div>
              <div className="price-unit-caption">/ user / month (for {customCount} softwares)</div>
              <div className="price-extra-note">
                Additional software: + Rs {isYearly ? '448' : '560'} each / user / month
              </div>

              {/* Multi-Software Selector Chips */}
              <div className="single-app-selector-box" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <span className="module-select-title" style={{ color: '#166534' }}>
                  Select softwares (choose 2 or more):
                </span>
                {SOFTWARE_MODULES.map((mod) => {
                  const isChecked = selectedCustomModules.includes(mod.id);
                  return (
                    <label
                      key={mod.id}
                      className={`module-radio-item ${isChecked ? 'selected' : ''}`}
                      style={{ borderColor: isChecked ? '#10b981' : '#e2e8f0', background: isChecked ? '#f0fdf4' : '#ffffff' }}
                      onClick={() => handleToggleCustomApp(mod.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCustomApp(mod.id)}
                        style={{ accentColor: '#10b981' }}
                      />
                      <img src={mod.iconSrc} alt={mod.name} className="module-chip-icon" />
                      <div className="module-info-wrap">
                        <span className="module-name">{mod.name}</span>
                        <span className="module-desc">({mod.desc})</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <ul className="card-features-list">
                <li className="feature-check-item">
                  <span className="feature-icon-bullet mint"><Check size={12} /></span>
                  <span>Select 2 or more software</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet mint"><Check size={12} /></span>
                  <span>All apps full access</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet mint"><Check size={12} /></span>
                  <span>Mix and match as per your need</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet mint"><Check size={12} /></span>
                  <span>Multi-company support</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet mint"><Check size={12} /></span>
                  <span>External API access</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet mint"><Check size={12} /></span>
                  <span>Advanced reporting & integrations</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet mint"><Check size={12} /></span>
                  <span>Priority support</span>
                </li>
              </ul>

              <button
                type="button"
                className="card-cta-btn btn-mint"
                onClick={() => handleGoToCheckout('custom', selectedCustomModules)}
              >
                Create Custom Plan <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="card-secondary-btn"
                onClick={() => handleGoToCheckout('custom', selectedCustomModules)}
              >
                Start Free Trial
              </button>

              <div className="card-footer-note">
                Full access · Scalable · Cancel anytime
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. Section: Our Software Categories                               */}
        {/* ================================================================= */}
        <section className="categories-showcase-section">
          <h2 className="section-title-center">Our Software Categories</h2>
          <div className="categories-grid">
            {SOFTWARE_CATEGORIES.map((cat) => (
              <div key={cat.name} className="category-card-item">
                <div className="cat-icon-chip" style={{ background: cat.bg }}>
                  <img src={cat.icon} alt={cat.name} />
                </div>
                <h3 className="cat-card-name">{cat.name}</h3>
                <p className="cat-card-sub">{cat.sub}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
