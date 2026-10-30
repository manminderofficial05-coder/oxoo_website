import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Sparkles, Check, Building2, HelpCircle } from 'lucide-react';
import { Header, Footer } from './components';
import { ALL_APPS_CATEGORIES } from './AllAppsDirectory';
import DemoInquiryModal from './demo/DemoInquiryModal';
import { useRegionPricing } from './RegionPricingContext';
import './pricing.css';

// --------------------------------------------------------------------------
// Core Software Packages Available for Purchasing (5 Core Softwares)
// --------------------------------------------------------------------------
export const SOFTWARE_MODULES = [
  {
    id: 'finance',
    name: 'Finance Software',
    shortName: 'Finance',
    desc: 'Accounting, Invoicing, Expenses, Sign, Spreadsheet, ESG',
    appsCount: 6,
    iconSrc: '/apps/logo-accounting.png?v=clean',
    color: '#2563eb',
    bgColor: '#eff6ff',
    priceMonthly: 740,
    priceYearly: 560
  },
  {
    id: 'sales',
    name: 'Sales Software',
    shortName: 'Sales',
    desc: 'CRM, Sales, Subscriptions, POS Shop, POS Restaurant, Rental',
    appsCount: 6,
    iconSrc: '/apps/logo-sales.png?v=clean',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    priceMonthly: 740,
    priceYearly: 560
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain Software',
    shortName: 'Supply Chain',
    desc: 'Inventory, Manufacturing, Maintenance, PLM, Quality, Purchase',
    appsCount: 6,
    iconSrc: '/apps/logo-inventory.png?v=clean',
    color: '#ea580c',
    bgColor: '#fff7ed',
    priceMonthly: 740,
    priceYearly: 560
  },
  {
    id: 'human-resources',
    name: 'Human Resources Software',
    shortName: 'Human Resources',
    desc: 'Employees, Payroll, Recruitment, Time Off, Appraisals, Fleet',
    appsCount: 6,
    iconSrc: '/apps/logo-hr.png?v=clean',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    priceMonthly: 740,
    priceYearly: 560
  },
  {
    id: 'productivity',
    name: 'Productivity Software',
    shortName: 'Productivity',
    desc: 'Artificial Intelligence, Discuss, VoIP, IoT, Documents, Knowledge',
    appsCount: 6,
    iconSrc: '/apps/logo-ai.png?v=clean',
    color: '#6d28d9',
    bgColor: '#faf5ff',
    priceMonthly: 740,
    priceYearly: 560
  }
];

export const SOFTWARE_CATEGORIES = ALL_APPS_CATEGORIES;

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentRegion, formatPrice } = useRegionPricing();

  // Read incoming query params from Demos or Landing links
  const querySoftware = searchParams.get('software') || searchParams.get('app') || searchParams.get('apps') || searchParams.get('demo') || searchParams.get('product') || '';
  const queryCompany = searchParams.get('company') || '';

  // Normalizer for software package id
  const normalizeSoftware = (str) => {
    if (!str) return 'finance';
    const s = str.toLowerCase();
    if (s.includes('hrms') || s.includes('hr') || s.includes('employee') || s.includes('human')) return 'human-resources';
    if (s.includes('finance') || s.includes('accounting') || s.includes('gst')) return 'finance';
    if (s.includes('sales') || s.includes('crm') || s.includes('deal')) return 'sales';
    if (s.includes('supply') || s.includes('inventory') || s.includes('warehouse')) return 'supply-chain';
    if (s.includes('ai') || s.includes('productivity') || s.includes('agent')) return 'productivity';
    return 'finance';
  };

  const isInquiryRequested = (str) => {
    if (!str) return false;
    const s = str.toLowerCase();
    return s.includes('website') || s.includes('marketplace') || s.includes('whatsapp');
  };

  const [selectedSoftware, setSelectedSoftware] = useState(() => normalizeSoftware(querySoftware));
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  // State: Billing toggle (default yearly)
  const [isYearly, setIsYearly] = useState(true);

  const activeModule = SOFTWARE_MODULES.find((m) => m.id === selectedSoftware) || SOFTWARE_MODULES[0];

  // Derived regional plan prices safely aligned with pricingConfig schema
  const single = currentRegion?.plans?.singleApp || {};
  const custom = currentRegion?.plans?.customApps || {};

  const singlePlan = {
    price: isYearly ? (single.yearlyPrice ?? 560) : (single.monthlyPrice ?? 740),
    originalPrice: isYearly ? (single.yearlyStrikethroughPrice ?? 740) : (single.monthlyStrikethroughPrice ?? 975),
    discountPercent: isYearly ? (single.discountPercentYearly ?? 24) : (single.discountPercentMonthly ?? 24)
  };

  const customPlan = {
    price: isYearly ? (custom.yearlyBasePrice ?? 980) : (custom.monthlyBasePrice ?? 1280),
    originalPrice: isYearly ? (custom.yearlyStrikethroughBasePrice ?? 1280) : (custom.monthlyStrikethroughBasePrice ?? 1660),
    discountPercent: isYearly ? (custom.discountPercentYearly ?? 23) : (custom.discountPercentMonthly ?? 23)
  };

  const addlPlan = {
    price: isYearly ? (custom.yearlyAdditionalAppPrice ?? 560) : (custom.monthlyAdditionalAppPrice ?? 740)
  };

  const singleDiscount = singlePlan.originalPrice > singlePlan.price
    ? Math.round(((singlePlan.originalPrice - singlePlan.price) / singlePlan.originalPrice) * 100)
    : (singlePlan.discountPercent || 0);

  const customDiscount = customPlan.originalPrice > customPlan.price
    ? Math.round(((customPlan.originalPrice - customPlan.price) / customPlan.originalPrice) * 100)
    : (customPlan.discountPercent || 0);

  // Navigate to full-page checkout flow carrying selected product and parameters forward!
  const handleGoToCheckout = (plan, trial = false) => {
    const compParam = queryCompany ? `&company=${encodeURIComponent(queryCompany)}` : '';
    navigate(`/checkout?plan=${plan}&apps=${selectedSoftware}&billing=${isYearly ? 'yearly' : 'monthly'}${trial ? '&trial=true' : ''}${compParam}&country=${currentRegion.regionCode}&currency=${currentRegion.currency}`);
  };

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

          {/* Software Package Selector Switcher Bar */}
          <div style={{ margin: '14px auto 18px auto', maxWidth: '780px', background: '#ffffff', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '0 8px' }}>
                Software:
              </span>
              {SOFTWARE_MODULES.map((mod) => {
                const isSelected = mod.id === selectedSoftware;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setSelectedSoftware(mod.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: isSelected ? `1.5px solid ${mod.color}` : '1px solid transparent',
                      background: isSelected ? mod.bgColor : 'transparent',
                      color: isSelected ? mod.color : '#475569',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <img src={mod.iconSrc} alt={mod.shortName} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                    {mod.shortName}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#64748b', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
              Selected: <strong style={{ color: activeModule.color }}>{activeModule.name}</strong> — {activeModule.desc}
            </div>
          </div>

          {/* Inquiry Banner for Custom Website / Marketplace / WhatsApp */}
          {(isInquiryRequested(querySoftware) || true) && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px 14px', borderRadius: '999px', margin: '0 auto 14px auto', fontSize: '12px', color: '#1e40af' }}>
              <Sparkles size={14} color="#2563eb" />
              <span>Looking for <strong>Websites & Apps, Marketplace, or WhatsApp AI</strong>?</span>
              <button
                type="button"
                onClick={() => setInquiryModalOpen(true)}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
              >
                Submit Project Inquiry →
              </button>
            </div>
          )}

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
            <span className="save-pill-badge">Save up to 24%</span>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. Three Pricing Cards (Clean & Compact)                          */}
        {/* ================================================================= */}
        <section className="pricing-cards-container">
          {/* Card 1: Free Demo */}
          <div className="pricing-card">
            <div className="card-top-banner banner-blue">
              Try PrimePro Without Any Cost
            </div>
            <div className="card-content-body">
              <h2 className="card-plan-title">Free Demo</h2>

              <div className="card-price-row">
                <span className="price-currency blue">{currentRegion.symbol}</span>
                <span className="price-val blue">0</span>
              </div>
              <div className="price-unit-caption">Completely Free</div>
              <div className="price-extra-note invisible-note">&nbsp;</div>

              {/* Free Demo goes directly to all apps as requested */}
              <Link
                to="/apps"
                className="card-cta-btn btn-blue"
              >
                Start Free Demo <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 2: Standard Pack (Single App) */}
          <div className="pricing-card">
            <div className="card-top-banner banner-coral">
              Best for Small Business
            </div>
            <div className="card-content-body">
              <h2 className="card-plan-title">Standard Pack</h2>

              <div className="card-price-row">
                <span className="price-currency coral">{currentRegion.symbol}</span>
                <span className="price-val coral">{singlePlan.price}</span>
                {singleDiscount > 0 && (
                  <div className="price-strike-wrap">
                    <span className="price-struck">{currentRegion.symbol} {singlePlan.originalPrice}</span>
                    <span className="discount-pill coral">{singleDiscount}% OFF</span>
                  </div>
                )}
              </div>
              <div className="price-unit-caption">
                / user / month
                {isYearly && (
                  <span style={{ display: 'block', fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '3px' }}>
                    Billed annually (12 months payment)
                  </span>
                )}
              </div>
              <div className="price-extra-note invisible-note">&nbsp;</div>

              <button
                type="button"
                className="card-cta-btn btn-coral"
                onClick={() => handleGoToCheckout('single')}
              >
                Buy Standard Pack <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 3: Custom Pack (2 Softwares included) */}
          <div className="pricing-card featured-card">
            <div className="card-top-banner banner-mint">
              Most Popular for Growing Business
            </div>
            <div className="card-content-body">
              <h2 className="card-plan-title">Custom Pack</h2>

              <div className="card-price-row">
                <span className="price-currency mint">{currentRegion.symbol}</span>
                <span className="price-val mint">{customPlan.price}</span>
                {customDiscount > 0 && (
                  <div className="price-strike-wrap">
                    <span className="price-struck">{currentRegion.symbol} {customPlan.originalPrice}</span>
                    <span className="discount-pill mint">{customDiscount}% OFF</span>
                  </div>
                )}
              </div>
              <div className="price-unit-caption">
                / user / month (for 2 softwares)
                {isYearly && (
                  <span style={{ display: 'block', fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '3px' }}>
                    Billed annually (12 months payment)
                  </span>
                )}
              </div>
              <div className="price-extra-note">
                Additional software: + {currentRegion.symbol} {addlPlan.price} each / user / month
              </div>

              <button
                type="button"
                className="card-cta-btn btn-mint"
                onClick={() => handleGoToCheckout('custom')}
              >
                Buy Custom Pack <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. Section: Our Software Applications & Categories                */}
        {/* ================================================================= */}
        <section className="categories-showcase-section">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 className="section-title-center" style={{ marginBottom: '4px' }}>
              Explore All 48 Business Applications
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Included across our Standard Pack and Custom Pack packages.
            </p>
          </div>

          <div className="pricing-categories-full-grid">
            {ALL_APPS_CATEGORIES.map((cat) => (
              <div key={cat.id} className="pricing-cat-column">
                <div className="pricing-cat-header-wrap" style={{ borderBottom: `2.5px solid ${cat.underlineColor || '#2563eb'}` }}>
                  <span className="pricing-cat-heading" style={{ color: cat.titleColor || '#2563eb' }}>
                    {cat.headerTitle || cat.name.toUpperCase()}
                  </span>
                </div>
                <ul className="pricing-cat-apps-list">
                  {cat.apps.map((app) => (
                    <li key={app.slug} className="pricing-app-item">
                      <img src={app.icon} alt={app.name} className="pricing-app-icon" />
                      <span className="pricing-app-title">{app.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <DemoInquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        category="Website & Apps"
        productName="PrimePro Custom Digital Platform & WhatsApp AI"
        defaultPlan="Growth Plan"
        availablePlans={['Starter Plan', 'Growth Studio', 'Business eCommerce', 'Custom Enterprise Platform']}
      />
    </>
  );
}
