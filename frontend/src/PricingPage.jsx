import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Grid, Sparkles } from 'lucide-react';
import { Header, Footer } from './components';
import { ALL_APPS_CATEGORIES } from './AllAppsDirectory';
import './pricing.css';

// --------------------------------------------------------------------------
// Core Software Catalog & Categories (All 48 Apps Across 8 Categories)
// --------------------------------------------------------------------------
export const SOFTWARE_MODULES = ALL_APPS_CATEGORIES.flatMap((cat) =>
  cat.apps.map((app) => ({
    id: app.slug,
    name: app.name,
    desc: app.desc,
    category: cat.name,
    categoryId: cat.id,
    iconSrc: app.icon,
    color: cat.titleColor || '#2563eb',
    bgColor: app.bgColor || '#eff6ff',
    priceMonthly: 740,
    priceYearly: 560
  }))
);

export const SOFTWARE_CATEGORIES = ALL_APPS_CATEGORIES;

export default function PricingPage() {
  const navigate = useNavigate();

  // State: Billing toggle (default yearly)
  const [isYearly, setIsYearly] = useState(true);

  // Navigate to full-page checkout flow
  const handleGoToCheckout = (plan, trial = false) => {
    navigate(`/checkout?plan=${plan}&billing=${isYearly ? 'yearly' : 'monthly'}${trial ? '&trial=true' : ''}`);
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
                  <span className="feature-icon-bullet blue"><Check size={11} /></span>
                  <span>One software (choose any)</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet blue"><Check size={11} /></span>
                  <span>Unlimited users</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet blue"><Check size={11} /></span>
                  <span>Full feature access for 14 days</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet blue"><Check size={11} /></span>
                  <span>Explore UI & workflow</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet blue"><Check size={11} /></span>
                  <span>No credit card required</span>
                </li>
              </ul>

              {/* Free Demo goes directly to all apps as requested */}
              <Link
                to="/apps"
                className="card-cta-btn btn-blue"
              >
                Start Free Demo <ArrowRight size={14} />
              </Link>

              <Link
                to="/apps"
                className="card-secondary-btn"
              >
                <Grid size={13} /> Go to All Apps
              </Link>

              <div className="card-footer-note">
                No cost · No commitment · 14 days access
              </div>
            </div>
          </div>

          {/* Card 2: Single Software (Monthly 740 / Yearly 560) */}
          <div className="pricing-card">
            <div className="card-top-banner banner-coral">
              Best for Small Business
            </div>
            <div className="card-content-body">
              <h2 className="card-plan-title">Single Software</h2>
              <p className="card-plan-tagline">Buy one software at affordable price</p>

              <div className="card-price-row">
                <span className="price-currency coral">Rs</span>
                <span className="price-val coral">{isYearly ? '560' : '740'}</span>
                <div className="price-strike-wrap">
                  <span className="price-struck">{isYearly ? 'Rs 740' : 'Rs 975'}</span>
                  <span className="discount-pill coral">24% OFF</span>
                </div>
              </div>
              <div className="price-unit-caption">/ user / month</div>

              <ul className="card-features-list">
                <li className="feature-check-item">
                  <span className="feature-icon-bullet coral"><Check size={11} /></span>
                  <span>Select any one available software</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet coral"><Check size={11} /></span>
                  <span>Full features of chosen software</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet coral"><Check size={11} /></span>
                  <span>Application-specific dashboard</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet coral"><Check size={11} /></span>
                  <span>User & role management</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet coral"><Check size={11} /></span>
                  <span>Reports, analytics & updates</span>
                </li>
              </ul>

              <button
                type="button"
                className="card-cta-btn btn-coral"
                onClick={() => handleGoToCheckout('single')}
              >
                Buy One Software <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="card-secondary-btn"
                onClick={() => handleGoToCheckout('single', true)}
              >
                Start Free Trial
              </button>

              <div className="card-footer-note">
                Full access · All features included · Cancel anytime
              </div>
            </div>
          </div>

          {/* Card 3: Custom Softwares (Monthly 1280 / Yearly 980 for 2 softwares) */}
          <div className="pricing-card featured-card">
            <div className="card-top-banner banner-mint">
              Most Popular for Growing Business
            </div>
            <div className="card-content-body">
              <h2 className="card-plan-title">Custom Softwares</h2>
              <p className="card-plan-tagline">Choose 2 or more software and get advanced features</p>

              <div className="card-price-row">
                <span className="price-currency mint">Rs</span>
                <span className="price-val mint">{isYearly ? '980' : '1,280'}</span>
                <div className="price-strike-wrap">
                  <span className="price-struck">{isYearly ? 'Rs 1,280' : 'Rs 1,660'}</span>
                  <span className="discount-pill mint">23% OFF</span>
                </div>
              </div>
              <div className="price-unit-caption">/ user / month (for 2 softwares)</div>
              <div className="price-extra-note">
                Additional software: + Rs {isYearly ? '560' : '740'} each / user / month
              </div>

              <ul className="card-features-list">
                <li className="feature-check-item">
                  <span className="feature-icon-bullet mint"><Check size={11} /></span>
                  <span>Select 2 or more software</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet mint"><Check size={11} /></span>
                  <span>All selected apps full access</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet mint"><Check size={11} /></span>
                  <span>Mix & match as per your business</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet mint"><Check size={11} /></span>
                  <span>Multi-company support & external API</span>
                </li>
                <li className="feature-check-item">
                  <span className="feature-icon-bullet mint"><Check size={11} /></span>
                  <span>Advanced reporting & priority support</span>
                </li>
              </ul>

              <button
                type="button"
                className="card-cta-btn btn-mint"
                onClick={() => handleGoToCheckout('custom')}
              >
                Create Custom Plan <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="card-secondary-btn"
                onClick={() => handleGoToCheckout('custom', true)}
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
        {/* 3. Section: Our Software Applications & Categories                */}
        {/* ================================================================= */}
        <section className="categories-showcase-section">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 className="section-title-center" style={{ marginBottom: '4px' }}>
              Explore All 48 Business Applications
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Included across our Single Software and Custom Softwares packages.
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
    </>
  );
}
