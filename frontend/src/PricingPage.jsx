import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check, ArrowRight, ShieldCheck, Lock, CreditCard, ChevronRight,
  Download, RefreshCw, CheckCircle2, AlertCircle, ShoppingCart,
  Building, User, Mail, Phone, Sparkles
} from 'lucide-react';
import { Header, Footer } from './components';
import { calculatePricing, createPaymentOrder, verifyPayment } from './api';
import './pricing.css';

// --------------------------------------------------------------------------
// Core Software Catalog & Categories (reusing existing OXOO application assets)
// --------------------------------------------------------------------------
const SOFTWARE_MODULES = [
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

const SOFTWARE_CATEGORIES = [
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

  // State: Plan selection in Cards & Stepper
  // Options: 'free' | 'single' | 'custom'
  const [activePlan, setActivePlan] = useState('custom');

  // Single App selection in Card 2
  const [selectedSingleModule, setSelectedSingleModule] = useState('finance');

  // Custom Apps selected in Stepper Step 1 (default: HR + Sales)
  const [selectedAppIds, setSelectedAppIds] = useState(['hr', 'sales']);

  // Current active step in the 5-step flow (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // User details
  const [userCount, setUserCount] = useState(1);
  const [companyName, setCompanyName] = useState('ABC Pvt Ltd');
  const [customerName, setCustomerName] = useState('Demo Customer');
  const [customerEmail, setCustomerEmail] = useState('admin@abc.com');
  const [customerPhone, setCustomerPhone] = useState('+91 9876543210');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('Credit / Debit Card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Payment result from server
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Full-screen checkout modal state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Dynamic pricing calculation
  const calculateTotals = () => {
    let ratePerUser = 0;
    const count = selectedAppIds.length;

    if (activePlan === 'free') {
      ratePerUser = 0;
    } else if (activePlan === 'single') {
      ratePerUser = isYearly ? 448 : 560; // 20% off on yearly
    } else {
      // Custom Apps: 1 app = 560, 2 apps = 980, 3+ apps = 980 + (count - 2) * 560
      let monthlyBase = count <= 1 ? 560 : 980 + Math.max(0, count - 2) * 560;
      ratePerUser = isYearly ? Math.round(monthlyBase * 0.8) : monthlyBase;
    }

    const subtotal = ratePerUser * Math.max(1, userCount);
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;

    return {
      ratePerUser,
      subtotal,
      taxAmount,
      totalAmount,
      appCount: count
    };
  };

  const totals = calculateTotals();

  // Handle toggling apps in Custom plan
  const handleToggleApp = (appId) => {
    if (activePlan === 'single') {
      setSelectedAppIds([appId]);
      setSelectedSingleModule(appId);
      return;
    }

    if (selectedAppIds.includes(appId)) {
      if (selectedAppIds.length > 1) {
        setSelectedAppIds(selectedAppIds.filter((id) => id !== appId));
      }
    } else {
      setSelectedAppIds([...selectedAppIds, appId]);
    }
  };

  // Launch checkout modal with specific plan
  const startPurchaseFlow = (plan, preselectedApp = null) => {
    setActivePlan(plan);
    if (preselectedApp) {
      setSelectedAppIds([preselectedApp]);
      setSelectedSingleModule(preselectedApp);
    } else if (plan === 'single') {
      setSelectedAppIds([selectedSingleModule]);
    } else if (plan === 'custom' && selectedAppIds.length < 2) {
      setSelectedAppIds(['hr', 'sales']);
    }
    setCurrentStep(2); // Move to review & cart
    setIsCheckoutModalOpen(true);
  };

  // Start Free Demo
  const startFreeDemoFlow = () => {
    setActivePlan('free');
    setSelectedAppIds([selectedSingleModule || 'finance']);
    setCurrentStep(3); // Go to company details
    setIsCheckoutModalOpen(true);
  };

  // Submit payment to backend API
  const handleExecutePayment = async () => {
    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      const selectedAppsNames = SOFTWARE_MODULES.filter((m) =>
        selectedAppIds.includes(m.id)
      ).map((m) => m.name);

      // 1. Create order on server
      const orderRes = await createPaymentOrder({
        planId: activePlan === 'free' ? 'free-demo' : activePlan === 'single' ? 'single-app' : 'custom-apps',
        selectedApps: selectedAppsNames,
        userCount,
        billingCycle: isYearly ? 'yearly' : 'monthly',
        companyName,
        customerName: customerName || companyName,
        customerEmail,
        customerPhone
      });

      const orderNumber = orderRes.order?.orderNumber || `OXOO-ORD-${Date.now().toString().slice(-6)}`;

      // 2. Verify payment on server
      const verifyRes = await verifyPayment({
        orderNumber,
        paymentId: `pay_rzp_${Date.now().toString().slice(-8)}`,
        paymentMethod,
        companyName,
        customerName,
        customerEmail,
        selectedApps: selectedAppsNames,
        planName: activePlan === 'free' ? 'Free Demo' : activePlan === 'single' ? 'Single App' : 'Custom (Multiple Apps)',
        billingCycle: isYearly ? 'yearly' : 'monthly',
        totalAmount: totals.totalAmount
      });

      setPaymentSuccessData(verifyRes);
      setCurrentStep(5);
    } catch (err) {
      setPaymentError(err.message || 'Payment verification failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
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
                onClick={startFreeDemoFlow}
              >
                Start Free Demo <ArrowRight size={16} />
              </button>

              <div className="card-footer-note">
                No cost · No commitment · 14 days access
              </div>
            </div>
          </div>

          {/* Card 2: Single App */}
          <div className="pricing-card">
            <div className="card-top-banner banner-coral">
              Best for Small Business
            </div>
            <div className="card-content-body">
              <h2 className="card-plan-title">Single App</h2>
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

              {/* Single Module Radio Selector */}
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
                      name="single-module-choice"
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
                onClick={() => startPurchaseFlow('single', selectedSingleModule)}
              >
                Buy One Software <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="card-secondary-btn"
                onClick={() => startPurchaseFlow('single', selectedSingleModule)}
              >
                Start Free Trial
              </button>

              <div className="card-footer-note">
                Full access · All features included · Cancel anytime
              </div>
            </div>
          </div>

          {/* Card 3: Custom (Multiple Apps) */}
          <div className="pricing-card featured-card">
            <div className="card-top-banner banner-mint">
              Most Popular for Growing Business
            </div>
            <div className="card-content-body">
              <h2 className="card-plan-title">Custom (Multiple Apps)</h2>
              <p className="card-plan-tagline">Choose 2 or more software and get advanced features</p>

              <div className="card-price-row">
                <span className="price-currency mint">Rs</span>
                <span className="price-val mint">{isYearly ? '784' : '980'}</span>
                <div className="price-strike-wrap">
                  <span className="price-struck">Rs 1,350</span>
                  <span className="discount-pill mint">27% OFF</span>
                </div>
              </div>
              <div className="price-unit-caption">/ user / month (for 2 apps)</div>
              <div className="price-extra-note">
                Additional software: + Rs {isYearly ? '448' : '560'} each / user / month
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
                onClick={() => startPurchaseFlow('custom')}
              >
                Create Custom Plan <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="card-secondary-btn"
                onClick={() => startPurchaseFlow('custom')}
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

        {/* ================================================================= */}
        {/* 4. Section: 5-Step Checkout & Payment Workflow (From Screenshot)   */}
        {/* ================================================================= */}
        <section className="workflow-section-wrap">
          <div className="workflow-stepper-header">
            {[
              { num: 1, title: 'Select Plan & Apps', desc: 'Choose Free / Single / Custom' },
              { num: 2, title: 'Review & Cart', desc: 'Check selected apps and total' },
              { num: 3, title: 'Account Details', desc: 'Enter company information' },
              { num: 4, title: 'Payment', desc: 'Pay securely with multiple options' },
              { num: 5, title: 'Payment Success', desc: 'Subscription Activated' }
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div
                  className={`step-indicator-pill ${currentStep === step.num ? 'active' : currentStep > step.num ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(step.num)}
                >
                  <span className="step-circle-num">{step.num}</span>
                  <div className="step-text-wrap">
                    <span className="step-title-text">{step.title}</span>
                    <span className="step-desc-text">{step.desc}</span>
                  </div>
                </div>
                {idx < 4 && <span className="stepper-arrow-divider">→</span>}
              </React.Fragment>
            ))}
          </div>

          {/* 5-Column Interactive Cards Matching the Mockup */}
          <div className="stepper-cards-row">
            {/* ------------------------------------------------------------- */}
            {/* Step 1 Card: Select Plan & Apps                               */}
            {/* ------------------------------------------------------------- */}
            <div className={`step-box-card ${currentStep === 1 ? 'active-step' : ''}`}>
              <div className="step-box-header">
                <span className="step-badge-num">1</span>
                <div>
                  <span className="step-box-title">Select Your Plan</span>
                </div>
              </div>

              <div className="step-tabs-mini">
                <button
                  type="button"
                  className={`tab-btn-mini ${activePlan === 'free' ? 'active' : ''}`}
                  onClick={() => { setActivePlan('free'); setSelectedAppIds([selectedSingleModule]); }}
                >
                  Free Demo
                </button>
                <button
                  type="button"
                  className={`tab-btn-mini ${activePlan === 'single' ? 'active' : ''}`}
                  onClick={() => { setActivePlan('single'); setSelectedAppIds([selectedSingleModule]); }}
                >
                  Single App
                </button>
                <button
                  type="button"
                  className={`tab-btn-mini ${activePlan === 'custom' ? 'active' : ''}`}
                  onClick={() => { setActivePlan('custom'); if (selectedAppIds.length < 2) setSelectedAppIds(['hr', 'sales']); }}
                >
                  Custom
                </button>
              </div>

              <small style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
                {activePlan === 'custom' ? 'Select Apps (2 or more)' : 'Select App'}
              </small>

              <div className="step-apps-checkbox-list">
                {SOFTWARE_MODULES.map((app) => {
                  const isChecked = selectedAppIds.includes(app.id);
                  return (
                    <div
                      key={app.id}
                      className={`app-check-row ${isChecked ? 'checked' : ''}`}
                      onClick={() => handleToggleApp(app.id)}
                    >
                      <label className="app-check-label">
                        <input
                          type={activePlan === 'custom' ? 'checkbox' : 'radio'}
                          name="app-check-stepper"
                          checked={isChecked}
                          onChange={() => handleToggleApp(app.id)}
                        />
                        <span>{app.name}</span>
                      </label>
                      <span className="app-price-tag">
                        {activePlan === 'free' ? '₹0' : `Rs ${app.price}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="step-total-row">
                <span>Total ({selectedAppIds.length} apps)</span>
                <span className="highlight-price">
                  Rs {totals.ratePerUser} / user / mo
                </span>
              </div>

              <button
                type="button"
                className="step-action-btn"
                onClick={() => setCurrentStep(2)}
              >
                Continue →
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Step 2 Card: Review & Cart                                    */}
            {/* ------------------------------------------------------------- */}
            <div className={`step-box-card ${currentStep === 2 ? 'active-step' : ''}`}>
              <div className="step-box-header">
                <span className="step-badge-num">2</span>
                <span className="step-box-title">Your Cart</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#4f46e5', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Edit
                </button>
              </div>

              <div className="cart-items-preview">
                {SOFTWARE_MODULES.filter((m) => selectedAppIds.includes(m.id)).map((mod) => (
                  <div key={mod.id} className="cart-item-chip">
                    <div className="cart-item-title">
                      <img src={mod.iconSrc} alt={mod.name} style={{ width: 16, height: 16 }} />
                      <span>{mod.name}</span>
                    </div>
                    <span className="cart-item-price-sub">
                      Rs {activePlan === 'free' ? '0' : '560'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="cart-summary-table">
                <div className="cart-row-line">
                  <span>Subtotal ({selectedAppIds.length} apps)</span>
                  <b>Rs {totals.subtotal}</b>
                </div>
                <div className="cart-row-line">
                  <span>GST (18%)</span>
                  <b>Rs {totals.taxAmount}</b>
                </div>
                <div className="cart-row-line">
                  <span>Users</span>
                  <b>{userCount}</b>
                </div>
                <div className="cart-row-line">
                  <span>Billing Cycle</span>
                  <b>{isYearly ? 'Yearly' : 'Monthly'}</b>
                </div>
                <div className="cart-row-line total-line">
                  <span>Total Payable</span>
                  <span style={{ color: '#0f172a' }}>Rs {totals.totalAmount}</span>
                </div>
              </div>

              <button
                type="button"
                className="step-action-btn"
                onClick={() => setCurrentStep(3)}
              >
                Proceed to Checkout →
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Step 3 Card: Account Details                                  */}
            {/* ------------------------------------------------------------- */}
            <div className={`step-box-card ${currentStep === 3 ? 'active-step' : ''}`}>
              <div className="step-box-header">
                <span className="step-badge-num">3</span>
                <span className="step-box-title">Company Information</span>
              </div>

              <div className="account-form-mini">
                <label>
                  Company Name
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="ABC Pvt Ltd"
                    required
                  />
                </label>
                <label>
                  Email Address
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="admin@abc.com"
                    required
                  />
                </label>
                <label>
                  Phone Number
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </label>
                <label>
                  Number of Users
                  <select
                    value={userCount}
                    onChange={(e) => setUserCount(parseInt(e.target.value, 10))}
                  >
                    {[1, 2, 5, 10, 25, 50, 100].map((num) => (
                      <option key={num} value={num}>
                        {num} User{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="button"
                className="step-action-btn"
                onClick={() => setCurrentStep(4)}
              >
                Continue →
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Step 4 Card: Payment Options                                  */}
            {/* ------------------------------------------------------------- */}
            <div className={`step-box-card ${currentStep === 4 ? 'active-step' : ''}`}>
              <div className="step-box-header">
                <span className="step-badge-num">4</span>
                <span className="step-box-title">Select Payment Method</span>
              </div>

              <div className="payment-methods-mini-list">
                {[
                  { id: 'Credit / Debit Card', label: 'Credit / Debit Card', badge: 'VISA/MC' },
                  { id: 'UPI', label: 'UPI (GPay, PhonePe, Paytm)', badge: 'UPI' },
                  { id: 'Net Banking', label: 'Net Banking', badge: 'All Banks' },
                  { id: 'Wallet', label: 'Wallet', badge: 'Paytm/Amazon' }
                ].map((pm) => (
                  <div
                    key={pm.id}
                    className={`payment-method-row ${paymentMethod === pm.id ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(pm.id)}
                  >
                    <input
                      type="radio"
                      name="payment-method-choice"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                    />
                    <span style={{ fontSize: '11px', flex: 1, fontWeight: 600 }}>{pm.label}</span>
                  </div>
                ))}
              </div>

              {paymentError && (
                <div style={{ color: '#dc2626', fontSize: '11px', marginBottom: '6px' }}>
                  {paymentError}
                </div>
              )}

              <button
                type="button"
                className="step-action-btn"
                disabled={isProcessingPayment}
                onClick={handleExecutePayment}
              >
                {isProcessingPayment ? 'Verifying...' : `Pay Rs ${totals.totalAmount} →`}
              </button>

              <div className="payment-trust-badges-row">
                <span>🔒 100% Secure</span>
                <span>PCI-DSS</span>
                <span>SSL</span>
                <span>Razorpay</span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Step 5 Card: Payment Success                                  */}
            {/* ------------------------------------------------------------- */}
            <div className={`step-box-card ${currentStep === 5 ? 'active-step' : ''}`}>
              <div className="step-box-header">
                <span className="step-badge-num" style={{ background: '#10b981' }}>5</span>
                <span className="step-box-title">Payment Success</span>
              </div>

              <div className="success-card-content">
                <div className="success-check-bubble">
                  <Check size={26} />
                </div>
                <h4 className="success-heading-mini">Payment Successful!</h4>
                <p className="success-sub-mini">Your subscription has been activated.</p>

                <div className="success-summary-box">
                  <div className="success-row-meta">
                    <b>Plan:</b>
                    <span>{activePlan === 'free' ? 'Free Demo' : activePlan === 'single' ? 'Single App' : 'Custom'}</span>
                  </div>
                  <div className="success-row-meta">
                    <b>Apps:</b>
                    <span>{selectedAppIds.join(', ')}</span>
                  </div>
                  <div className="success-row-meta">
                    <b>Users:</b>
                    <span>{userCount}</span>
                  </div>
                  <div className="success-row-meta">
                    <b>Amount:</b>
                    <span>₹{totals.totalAmount}</span>
                  </div>
                  <div className="success-row-meta">
                    <b>Order:</b>
                    <span>{paymentSuccessData?.orderNumber || 'OXOO-ORD-928114'}</span>
                  </div>
                </div>

                <Link
                  to="/customer"
                  className="step-action-btn btn-green"
                  style={{ textDecoration: 'none' }}
                >
                  Go to Dashboard →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* Full-Screen / Interactive Modal for Checkout                      */}
        {/* ================================================================= */}
        {isCheckoutModalOpen && (
          <div className="checkout-modal-overlay" onClick={() => setIsCheckoutModalOpen(false)}>
            <div className="checkout-modal-container" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsCheckoutModalOpen(false)}
              >
                ✕
              </button>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
                Complete Your OXOO Order
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
                Plan: <b>{activePlan === 'free' ? 'Free Demo' : activePlan === 'single' ? 'Single App' : 'Custom (Multiple Apps)'}</b> ({isYearly ? 'Yearly' : 'Monthly'})
              </p>

              {/* Order Breakdown */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>Selected Applications</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                  {SOFTWARE_MODULES.filter((m) => selectedAppIds.includes(m.id)).map((app) => (
                    <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
                      <img src={app.iconSrc} alt={app.name} style={{ width: 18, height: 18 }} />
                      <span>{app.name}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                  <div>Number of Users: <b>{userCount}</b></div>
                  <div>Billing Frequency: <b>{isYearly ? 'Yearly' : 'Monthly'}</b></div>
                  <div>Subtotal: <b>₹{totals.subtotal.toLocaleString('en-IN')}</b></div>
                  <div>GST (18%): <b>₹{totals.taxAmount.toLocaleString('en-IN')}</b></div>
                  <div style={{ gridColumn: 'span 2', fontSize: '1.1rem', fontWeight: 800, borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px', color: '#0f172a' }}>
                    Total Payable: ₹{totals.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Account Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                    Company Name *
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </label>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                    Full Name
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                    Business Email *
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </label>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                    Phone Number
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                    />
                  </label>
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Select Payment Method
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {['Credit / Debit Card', 'UPI (GPay / PhonePe / Paytm)', 'Net Banking', 'Wallets'].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      className={`module-radio-item ${paymentMethod === pm ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod(pm)}
                      style={{ padding: '10px 12px', justifyContent: 'flex-start' }}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === pm}
                        onChange={() => setPaymentMethod(pm)}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{pm}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentError && (
                <div style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px' }}>
                  {paymentError}
                </div>
              )}

              <button
                type="button"
                className="card-cta-btn btn-mint"
                disabled={isProcessingPayment}
                onClick={async () => {
                  await handleExecutePayment();
                  setIsCheckoutModalOpen(false);
                }}
                style={{ fontSize: '1rem', padding: '14px' }}
              >
                {isProcessingPayment ? 'Securing Transaction...' : `Pay ₹${totals.totalAmount.toLocaleString('en-IN')} Securely`}
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
                🔒 Encrypted with 256-bit SSL · PCI-DSS Compliant · Razorpay Certified
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
