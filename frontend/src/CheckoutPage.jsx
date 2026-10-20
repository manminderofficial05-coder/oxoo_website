import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check, ArrowRight, ArrowLeft, ShieldCheck, Lock, CreditCard,
  Download, Printer, CheckCircle2, Building2, User, Mail, Phone,
  ChevronRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { Header, Footer, Logo } from './components';
import { SOFTWARE_MODULES } from './PricingPage';
import { calculatePricing, createPaymentOrder, verifyPayment } from './api';
import './checkout.css';

const INDIAN_STATES = [
  'Gujarat', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu',
  'Uttar Pradesh', 'Rajasthan', 'Punjab', 'Haryana', 'Telangana',
  'West Bengal', 'Kerala', 'Madhya Pradesh', 'Andhra Pradesh', 'Bihar',
  'Goa', 'Himachal Pradesh', 'Jharkhand', 'Odisha', 'Uttarakhand'
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'United Arab Emirates',
  'Singapore', 'Canada', 'Australia', 'Germany', 'France', 'Japan'
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Current active step (1 to 5)
  const initialStep = parseInt(searchParams.get('step') || '1', 10);
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Selected plan: 'free' | 'single' | 'custom'
  const paramPlan = searchParams.get('plan');
  const [activePlan, setActivePlan] = useState(
    paramPlan === 'free' ? 'free' : paramPlan === 'custom' ? 'custom' : 'single'
  );

  // Billing Cycle
  const paramBilling = searchParams.get('billing');
  const [isYearly, setIsYearly] = useState(paramBilling === 'yearly');

  // Selected Software(s)
  const paramApps = searchParams.get('apps');
  const initialApps = paramApps
    ? paramApps.split(',').filter(Boolean)
    : activePlan === 'custom'
    ? ['hr', 'sales']
    : ['sales'];
  const [selectedAppIds, setSelectedAppIds] = useState(initialApps);

  // Number of licensed users
  const [userCount, setUserCount] = useState(1);

  // Step 3: Company & Billing Details (Exact match to User Screenshot 5)
  const [formData, setFormData] = useState({
    yourName: '',
    email: '',
    phone: '',
    companyName: '',
    vat: '',
    streetAndNumber: '',
    city: '',
    zipCode: '',
    country: 'India',
    stateProvince: 'Gujarat'
  });

  const [formErrors, setFormErrors] = useState({});

  // Step 4: Payment Method
  const [paymentMethod, setPaymentMethod] = useState('Credit / Debit Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Step 5: Verified Payment Result
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Handle plan switcher in Step 1
  const handleSelectPlan = (plan) => {
    setActivePlan(plan);
    if (plan === 'free') {
      setSelectedAppIds([selectedAppIds[0] || 'finance']);
    } else if (plan === 'single') {
      setSelectedAppIds([selectedAppIds[0] || 'sales']);
    } else if (plan === 'custom') {
      if (selectedAppIds.length < 2) {
        setSelectedAppIds(['hr', 'sales']);
      }
    }
  };

  // Handle toggling software selection in Step 1
  const handleToggleSoftware = (appId) => {
    if (activePlan === 'free' || activePlan === 'single') {
      setSelectedAppIds([appId]);
      return;
    }

    if (selectedAppIds.includes(appId)) {
      if (selectedAppIds.length > 2) {
        setSelectedAppIds(selectedAppIds.filter((id) => id !== appId));
      }
    } else {
      setSelectedAppIds([...selectedAppIds, appId]);
    }
  };

  // Pricing calculation
  const calculateTotals = () => {
    let ratePerUser = 0;
    const count = selectedAppIds.length;

    if (activePlan === 'free') {
      ratePerUser = 0;
    } else if (activePlan === 'single') {
      ratePerUser = isYearly ? 448 : 560; // 20% off on yearly
    } else {
      // Custom Softwares: 1 = 560, 2 = 980, 3+ = 980 + (count - 2) * 560
      const baseMonthly = count <= 1 ? 560 : 980 + Math.max(0, count - 2) * 560;
      ratePerUser = isYearly ? Math.round(baseMonthly * 0.8) : baseMonthly;
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

  // Validate Step 3 fields
  const validateCompanyDetails = () => {
    const errs = {};
    if (!formData.yourName.trim()) errs.yourName = 'Your name is required';
    if (!formData.email.trim()) errs.email = 'Email address is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.streetAndNumber.trim()) errs.streetAndNumber = 'Street and number are required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.zipCode.trim()) errs.zipCode = 'Zip Code is required';
    if (!formData.country) errs.country = 'Country is required';
    if (!formData.stateProvince) errs.stateProvince = 'State/Province is required';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedFromStep3 = (e) => {
    e.preventDefault();
    if (validateCompanyDetails()) {
      setCurrentStep(4);
    }
  };

  // Step 4: Execute Payment
  const handleExecutePayment = async () => {
    setIsProcessing(true);
    setPaymentError('');

    try {
      const selectedAppsNames = SOFTWARE_MODULES.filter((m) =>
        selectedAppIds.includes(m.id)
      ).map((m) => m.name);

      const planNameFormatted =
        activePlan === 'free'
          ? 'Free Demo'
          : activePlan === 'single'
          ? 'Single Software'
          : 'Custom Softwares';

      // 1. Create Order
      const orderRes = await createPaymentOrder({
        planId: activePlan === 'free' ? 'free-demo' : activePlan === 'single' ? 'single-app' : 'custom-apps',
        selectedApps: selectedAppsNames,
        userCount,
        billingCycle: isYearly ? 'yearly' : 'monthly',
        companyName: formData.companyName || formData.yourName || 'OXOO Workspace',
        customerName: formData.yourName,
        customerEmail: formData.email,
        customerPhone: formData.phone
      });

      const orderNumber = orderRes.order?.orderNumber || `OXOO-ORD-${Date.now().toString().slice(-6)}`;

      // 2. Verify Payment
      const verifyRes = await verifyPayment({
        orderNumber,
        paymentId: `pay_rzp_${Date.now().toString().slice(-8)}`,
        paymentMethod,
        companyName: formData.companyName || formData.yourName,
        customerName: formData.yourName,
        customerEmail: formData.email,
        selectedApps: selectedAppsNames,
        planName: planNameFormatted,
        billingCycle: isYearly ? 'yearly' : 'monthly',
        totalAmount: totals.totalAmount
      });

      setPaymentSuccessData(verifyRes);
      setCurrentStep(5);
    } catch (err) {
      setPaymentError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Print invoice receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <>
      <Header />
      <div className="checkout-page-root">
        {/* ================================================================= */}
        {/* Top 5-Step Progress Stepper Bar                                   */}
        {/* ================================================================= */}
        <div className="checkout-stepper-bar-wrap">
          <div className="checkout-stepper-inner">
            {[
              { num: 1, title: 'Select Plan & Software', sub: 'Choose software package' },
              { num: 2, title: 'Review & Cart', sub: 'Check selected apps & total' },
              { num: 3, title: 'Company Details', sub: 'Enter company information' },
              { num: 4, title: 'Payment', sub: 'Pay securely with multiple options' },
              { num: 5, title: 'Payment Success', sub: 'Subscription Activated' }
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div
                  className={`checkout-step-item ${currentStep === step.num ? 'active' : currentStep > step.num ? 'completed' : ''}`}
                  onClick={() => {
                    // Only allow stepping back or going forward if validated
                    if (step.num < currentStep) {
                      setCurrentStep(step.num);
                    }
                  }}
                >
                  <span className="checkout-step-num">
                    {currentStep > step.num ? <Check size={14} /> : step.num}
                  </span>
                  <div className="checkout-step-label-group">
                    <span className="checkout-step-title">{step.title}</span>
                    <span className="checkout-step-sub">{step.sub}</span>
                  </div>
                </div>
                {idx < 4 && <span className="checkout-stepper-divider">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ================================================================= */}
        {/* Main Content Area (Dedicated Single Page per Step)                */}
        {/* ================================================================= */}
        <div className="checkout-main-content">
          {/* =============================================================== */}
          {/* STEP 1: Select Plan & Software                                  */}
          {/* =============================================================== */}
          {currentStep === 1 && (
            <div className="checkout-step-card">
              <div className="checkout-view-header">
                <h1 className="checkout-view-title">Select Plan & Software</h1>
                <p className="checkout-view-sub">
                  Choose your plan, billing frequency, and software applications for your business.
                </p>
              </div>

              {/* 3 Plan Selection Pills */}
              <div className="checkout-plan-pills-row">
                <div
                  className={`checkout-plan-pill ${activePlan === 'free' ? 'active' : ''}`}
                  onClick={() => handleSelectPlan('free')}
                >
                  <div className="checkout-pill-title">Free Demo</div>
                  <div className="checkout-pill-price" style={{ color: '#0284c7' }}>₹0</div>
                  <div className="checkout-pill-sub">1 software · 14 days access</div>
                </div>

                <div
                  className={`checkout-plan-pill ${activePlan === 'single' ? 'active' : ''}`}
                  onClick={() => handleSelectPlan('single')}
                >
                  <div className="checkout-pill-title">Single Software</div>
                  <div className="checkout-pill-price" style={{ color: '#ef4444' }}>
                    ₹{isYearly ? '448' : '560'}
                  </div>
                  <div className="checkout-pill-sub">per user / month</div>
                </div>

                <div
                  className={`checkout-plan-pill ${activePlan === 'custom' ? 'active' : ''}`}
                  onClick={() => handleSelectPlan('custom')}
                >
                  <div className="checkout-pill-title">Custom Softwares</div>
                  <div className="checkout-pill-price" style={{ color: '#10b981' }}>
                    ₹{isYearly ? '784' : '980'}
                  </div>
                  <div className="checkout-pill-sub">Base 2 softwares (+₹560 addl)</div>
                </div>
              </div>

              {/* Configuration Row: Billing Cycle & Users */}
              <div className="checkout-config-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Billing Cycle:</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className={`checkout-secondary-btn ${!isYearly ? 'active' : ''}`}
                      style={{ padding: '6px 14px', fontSize: '0.85rem', background: !isYearly ? '#2563eb' : '#ffffff', color: !isYearly ? '#ffffff' : '#334155' }}
                      onClick={() => setIsYearly(false)}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      className={`checkout-secondary-btn ${isYearly ? 'active' : ''}`}
                      style={{ padding: '6px 14px', fontSize: '0.85rem', background: isYearly ? '#2563eb' : '#ffffff', color: isYearly ? '#ffffff' : '#334155' }}
                      onClick={() => setIsYearly(true)}
                    >
                      Yearly (Save 20%)
                    </button>
                  </div>
                </div>

                <div className="checkout-counter-group">
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Licensed Users:</span>
                  <button
                    type="button"
                    className="checkout-counter-btn"
                    onClick={() => setUserCount(Math.max(1, userCount - 1))}
                  >
                    -
                  </button>
                  <span className="checkout-counter-val">{userCount}</span>
                  <button
                    type="button"
                    className="checkout-counter-btn"
                    onClick={() => setUserCount(userCount + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Software Selection Grid */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>
                {activePlan === 'custom'
                  ? 'Select Softwares (Choose 2 or more):'
                  : 'Select One Software:'}
              </h3>

              <div className="checkout-software-grid">
                {SOFTWARE_MODULES.map((mod) => {
                  const isChecked = selectedAppIds.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      className={`checkout-software-card ${isChecked ? 'selected' : ''}`}
                      onClick={() => handleToggleSoftware(mod.id)}
                    >
                      <input
                        type={activePlan === 'custom' ? 'checkbox' : 'radio'}
                        name="software-choice-radio"
                        checked={isChecked}
                        onChange={() => handleToggleSoftware(mod.id)}
                      />
                      <img src={mod.iconSrc} alt={mod.name} className="checkout-software-icon" />
                      <div className="checkout-software-info">
                        <span className="checkout-software-name">{mod.name}</span>
                        <span className="checkout-software-desc">{mod.desc}</span>
                      </div>
                      <span className="checkout-software-rate">
                        {activePlan === 'free' ? '₹0' : '₹560'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Live Price Summary Bar */}
              <div className="checkout-summary-bar">
                <div>
                  <div className="checkout-summary-text">
                    Plan: <b>{activePlan === 'free' ? 'Free Demo' : activePlan === 'single' ? 'Single Software' : 'Custom Softwares'}</b> · {selectedAppIds.length} Software{selectedAppIds.length > 1 ? 's' : ''} · {userCount} User{userCount > 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    Billing: {isYearly ? 'Yearly' : 'Monthly'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="checkout-summary-amount">
                    ₹{totals.subtotal.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                    + 18% GST (₹{totals.taxAmount})
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="checkout-nav-actions">
                <Link to="/pricing" className="checkout-secondary-btn">
                  <ArrowLeft size={16} /> Back to Pricing
                </Link>
                <button
                  type="button"
                  className="checkout-primary-btn"
                  onClick={() => setCurrentStep(2)}
                >
                  Continue to Review & Cart <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 2: Review & Cart                                           */}
          {/* =============================================================== */}
          {currentStep === 2 && (
            <div className="checkout-step-card">
              <div className="checkout-view-header">
                <h1 className="checkout-view-title">Review Your Order</h1>
                <p className="checkout-view-sub">
                  Please check the selected software applications and billing details before proceeding.
                </p>
              </div>

              {/* Order Items Table */}
              <table className="cart-review-table">
                <thead>
                  <tr>
                    <th>Software Application</th>
                    <th>Category / Features</th>
                    <th>Billing Cycle</th>
                    <th>Rate / User</th>
                  </tr>
                </thead>
                <tbody>
                  {SOFTWARE_MODULES.filter((m) => selectedAppIds.includes(m.id)).map((app) => (
                    <tr key={app.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={app.iconSrc} alt={app.name} style={{ width: 32, height: 32 }} />
                        <b>{app.name}</b>
                      </td>
                      <td style={{ color: '#64748b' }}>{app.desc}</td>
                      <td>{isYearly ? 'Yearly' : 'Monthly'}</td>
                      <td><b>{activePlan === 'free' ? '₹0' : '₹560'}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Price Breakdown Box */}
              <div className="cart-review-breakdown">
                <div className="cart-breakdown-row">
                  <span>Selected Plan:</span>
                  <b>{activePlan === 'free' ? 'Free Demo' : activePlan === 'single' ? 'Single Software' : 'Custom Softwares'}</b>
                </div>
                <div className="cart-breakdown-row">
                  <span>Licensed Users:</span>
                  <b>{userCount} User{userCount > 1 ? 's' : ''}</b>
                </div>
                <div className="cart-breakdown-row">
                  <span>Subtotal ({selectedAppIds.length} Softwares):</span>
                  <b>₹{totals.subtotal.toLocaleString('en-IN')}</b>
                </div>
                <div className="cart-breakdown-row">
                  <span>Applicable GST (18%):</span>
                  <b>₹{totals.taxAmount.toLocaleString('en-IN')}</b>
                </div>
                <div className="cart-breakdown-row total-row">
                  <span>Final Amount Payable:</span>
                  <span style={{ color: '#2563eb' }}>
                    ₹{totals.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="checkout-nav-actions">
                <button
                  type="button"
                  className="checkout-secondary-btn"
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft size={16} /> Edit Selection
                </button>
                <button
                  type="button"
                  className="checkout-primary-btn"
                  onClick={() => setCurrentStep(3)}
                >
                  Proceed to Company Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 3: Company Details (Exact match to User Screenshot 5)       */}
          {/* =============================================================== */}
          {currentStep === 3 && (
            <div className="checkout-step-card">
              <div className="checkout-view-header">
                <h1 className="checkout-view-title">Company & Account Details</h1>
                <p className="checkout-view-sub">
                  Enter your contact and organization details to create your OXOO business workspace.
                </p>
              </div>

              <form onSubmit={handleProceedFromStep3}>
                <div className="company-details-form-grid">
                  {/* Your name * */}
                  <div className="form-field-group full-width">
                    <label className="form-field-label">Your name *</label>
                    <input
                      type="text"
                      className="form-field-input"
                      required
                      placeholder="John Doe"
                      value={formData.yourName}
                      onChange={(e) => setFormData({ ...formData, yourName: e.target.value })}
                    />
                    {formErrors.yourName && (
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.yourName}</span>
                    )}
                  </div>

                  {/* Email * */}
                  <div className="form-field-group">
                    <label className="form-field-label">Email *</label>
                    <input
                      type="email"
                      className="form-field-input"
                      required
                      placeholder="admin@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {formErrors.email && (
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.email}</span>
                    )}
                  </div>

                  {/* Phone * */}
                  <div className="form-field-group">
                    <label className="form-field-label">Phone *</label>
                    <div className="phone-input-container">
                      <span className="phone-prefix-chip">+91</span>
                      <input
                        type="tel"
                        required
                        placeholder="98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    {formErrors.phone && (
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.phone}</span>
                    )}
                  </div>

                  {/* Company Name */}
                  <div className="form-field-group">
                    <label className="form-field-label">Company Name</label>
                    <input
                      type="text"
                      className="form-field-input"
                      placeholder="ABC Technologies Pvt Ltd"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>

                  {/* VAT */}
                  <div className="form-field-group">
                    <label className="form-field-label">VAT / GSTIN</label>
                    <input
                      type="text"
                      className="form-field-input"
                      placeholder="24ABCDE1234F1Z5"
                      value={formData.vat}
                      onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
                    />
                  </div>

                  {/* Street and Number * */}
                  <div className="form-field-group full-width">
                    <label className="form-field-label">Street and Number *</label>
                    <input
                      type="text"
                      className="form-field-input"
                      required
                      placeholder="402, Business Hub, Ring Road"
                      value={formData.streetAndNumber}
                      onChange={(e) => setFormData({ ...formData, streetAndNumber: e.target.value })}
                    />
                    {formErrors.streetAndNumber && (
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.streetAndNumber}</span>
                    )}
                  </div>

                  {/* City * */}
                  <div className="form-field-group">
                    <label className="form-field-label">City *</label>
                    <input
                      type="text"
                      className="form-field-input"
                      required
                      placeholder="Ahmedabad"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                    {formErrors.city && (
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.city}</span>
                    )}
                  </div>

                  {/* Zip Code * */}
                  <div className="form-field-group">
                    <label className="form-field-label">Zip Code *</label>
                    <input
                      type="text"
                      className="form-field-input"
                      required
                      placeholder="380015"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    />
                    {formErrors.zipCode && (
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.zipCode}</span>
                    )}
                  </div>

                  {/* Country * */}
                  <div className="form-field-group">
                    <label className="form-field-label">Country *</label>
                    <select
                      className="form-field-select"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* State / Province * */}
                  <div className="form-field-group">
                    <label className="form-field-label">State / Province *</label>
                    <select
                      className="form-field-select"
                      required
                      value={formData.stateProvince}
                      onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
                    >
                      <option value="">State / Province...</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {formErrors.stateProvince && (
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.stateProvince}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="checkout-nav-actions">
                  <button
                    type="button"
                    className="checkout-secondary-btn"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft size={16} /> Back to Cart
                  </button>
                  <button
                    type="submit"
                    className="checkout-primary-btn"
                  >
                    Continue to Payment <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 4: Complete Your Payment                                   */}
          {/* =============================================================== */}
          {currentStep === 4 && (
            <div className="checkout-step-card">
              <div className="checkout-view-header">
                <h1 className="checkout-view-title">Complete Your Payment</h1>
                <p className="checkout-view-sub">
                  Select your payment method and pay securely to activate your OXOO subscription.
                </p>
              </div>

              {/* Order Recap Banner */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Paying For:</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    {activePlan === 'free' ? 'Free Demo' : activePlan === 'single' ? 'Single Software' : 'Custom Softwares'} ({userCount} User{userCount > 1 ? 's' : ''})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Payable:</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
                    ₹{totals.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Payment Methods Grid */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>
                Select Payment Method
              </h3>

              <div className="payment-methods-grid">
                {[
                  { id: 'Credit / Debit Card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay, Amex' },
                  { id: 'UPI', label: 'UPI (Google Pay, PhonePe, Paytm)', sub: 'Instant payment via UPI ID / QR' },
                  { id: 'Net Banking', label: 'Net Banking', sub: 'All major Indian Banks supported' },
                  { id: 'Wallets', label: 'Wallets', sub: 'Paytm, Amazon Pay, Mobikwik' }
                ].map((pm) => (
                  <div
                    key={pm.id}
                    className={`payment-method-card ${paymentMethod === pm.id ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(pm.id)}
                  >
                    <input
                      type="radio"
                      name="payment-gateway-choice"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                    />
                    <div>
                      <b style={{ fontSize: '0.95rem', display: 'block' }}>{pm.label}</b>
                      <small style={{ color: '#64748b' }}>{pm.sub}</small>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock inputs based on selected method */}
              {paymentMethod === 'Credit / Debit Card' && (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Card Number</label>
                      <input type="text" placeholder="4532 •••• •••• 8892" defaultValue="4532 8920 1289 8892" className="form-field-input" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Expiry</label>
                      <input type="text" placeholder="MM/YY" defaultValue="08/29" className="form-field-input" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>CVV</label>
                      <input type="password" placeholder="•••" defaultValue="882" className="form-field-input" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>UPI ID (VPA)</label>
                  <input type="text" placeholder="yourname@okaxis" defaultValue="admin@okhdfcbank" className="form-field-input" style={{ width: '100%', maxWidth: '360px' }} />
                </div>
              )}

              {paymentError && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '18px', fontSize: '0.9rem' }}>
                  <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  {paymentError}
                </div>
              )}

              {/* Security badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '14px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '24px', fontSize: '0.8rem', color: '#64748b' }}>
                <span>🔒 100% Secure Payment</span>
                <span>•</span>
                <span>PCI-DSS Level 1</span>
                <span>•</span>
                <span>256-bit SSL</span>
                <span>•</span>
                <span>Razorpay Verified</span>
              </div>

              {/* Actions */}
              <div className="checkout-nav-actions">
                <button
                  type="button"
                  className="checkout-secondary-btn"
                  onClick={() => setCurrentStep(3)}
                >
                  <ArrowLeft size={16} /> Back to Company Details
                </button>
                <button
                  type="button"
                  className="checkout-primary-btn btn-green"
                  disabled={isProcessing}
                  onClick={handleExecutePayment}
                >
                  {isProcessing ? 'Verifying Transaction...' : `Pay ₹${totals.totalAmount.toLocaleString('en-IN')} Securely →`}
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 5: Payment Success                                         */}
          {/* =============================================================== */}
          {currentStep === 5 && (
            <div className="checkout-step-card">
              <div className="payment-success-card-body">
                <div className="success-check-big">
                  <Check size={42} />
                </div>
                <h1 className="success-title-big">Payment Successful!</h1>
                <p className="success-sub-big">
                  Thank you for choosing OXOO. Your payment has been verified and your subscription is active.
                </p>

                {/* Receipt Details Card */}
                <div className="success-details-receipt">
                  <div className="receipt-line-item">
                    <span>Order Number:</span>
                    <b>{paymentSuccessData?.orderNumber || 'OXOO-ORD-774912'}</b>
                  </div>
                  <div className="receipt-line-item">
                    <span>Invoice Reference:</span>
                    <b>{paymentSuccessData?.invoiceNumber || 'INV-2026-928'}</b>
                  </div>
                  <div className="receipt-line-item">
                    <span>Transaction ID:</span>
                    <b style={{ fontFamily: 'monospace' }}>{paymentSuccessData?.paymentId || 'pay_rzp_91827481'}</b>
                  </div>
                  <div className="receipt-line-item">
                    <span>Plan Subscribed:</span>
                    <b>{paymentSuccessData?.planName || (activePlan === 'free' ? 'Free Demo' : activePlan === 'single' ? 'Single Software' : 'Custom Softwares')}</b>
                  </div>
                  <div className="receipt-line-item">
                    <span>Activated Softwares:</span>
                    <b>{SOFTWARE_MODULES.filter((m) => selectedAppIds.includes(m.id)).map((m) => m.name).join(', ')}</b>
                  </div>
                  <div className="receipt-line-item">
                    <span>Licensed Users:</span>
                    <b>{userCount} User{userCount > 1 ? 's' : ''}</b>
                  </div>
                  <div className="receipt-line-item">
                    <span>Amount Paid:</span>
                    <b style={{ color: '#16a34a', fontSize: '1.1rem' }}>
                      ₹{totals.totalAmount.toLocaleString('en-IN')} (Paid via {paymentMethod})
                    </b>
                  </div>
                  <div className="receipt-line-item">
                    <span>Subscription Status:</span>
                    <b style={{ color: '#16a34a' }}>● Active</b>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="checkout-secondary-btn"
                    onClick={handlePrintReceipt}
                  >
                    <Download size={16} /> Download Invoice / Receipt
                  </button>
                  <Link
                    to="/customer"
                    className="checkout-primary-btn btn-green"
                    style={{ textDecoration: 'none' }}
                  >
                    Go to Customer Dashboard <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
