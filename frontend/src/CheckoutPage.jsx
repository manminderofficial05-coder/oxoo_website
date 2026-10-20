import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check, ArrowRight, ArrowLeft, ShieldCheck, Lock, CreditCard,
  Download, Printer, CheckCircle2, Building2, User, Mail, Phone,
  FileText, QrCode, Sparkles, AlertCircle
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

// Helper: Convert number to Indian Rupees words
function numberToWordsINR(amount) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(num) {
    if ((num = num.toString()).length > 9) return 'Overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str;
  }

  const parts = Number(amount).toFixed(2).split('.');
  const wholePart = parseInt(parts[0], 10);
  const decimalPart = parseInt(parts[1], 10);

  let result = 'Rupees ' + inWords(wholePart);
  if (decimalPart > 0) {
    result += 'and ' + inWords(decimalPart) + 'Paise ';
  }
  result += 'Only';
  return result.replace(/\s+/g, ' ').trim();
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Current active step (1 to 5)
  const initialStep = parseInt(searchParams.get('step') || '1', 10);
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Selected plan: 'single' | 'custom' (Free demo redirects to /apps)
  const paramPlan = searchParams.get('plan');
  const [activePlan, setActivePlan] = useState(
    paramPlan === 'custom' ? 'custom' : 'single'
  );

  // Billing Cycle (Monthly / Yearly)
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
    yourName: 'Rahul Sharma',
    email: 'rahul@abc.com',
    phone: '98765 43210',
    companyName: 'ABC Pvt Ltd',
    vat: '29ABCDE1234F1Z5',
    streetAndNumber: '123, MG Road',
    city: 'Bengaluru',
    zipCode: '560001',
    country: 'India',
    stateProvince: 'Karnataka'
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
    if (plan === 'single') {
      setSelectedAppIds([selectedAppIds[0] || 'sales']);
    } else if (plan === 'custom') {
      if (selectedAppIds.length < 2) {
        setSelectedAppIds(['hr', 'sales']);
      }
    }
  };

  // Handle toggling software selection in Step 1
  const handleToggleSoftware = (appId) => {
    if (selectedAppIds.includes(appId)) {
      if (selectedAppIds.length > 1) {
        const next = selectedAppIds.filter((id) => id !== appId);
        setSelectedAppIds(next);
        setActivePlan(next.length <= 1 ? 'single' : 'custom');
      }
    } else {
      const next = [...selectedAppIds, appId];
      setSelectedAppIds(next);
      setActivePlan(next.length <= 1 ? 'single' : 'custom');
    }
  };

  // Pricing calculation matching user's exact specification:
  // Single Software: monthly 740, yearly 560
  // Custom Softwares (for 2): monthly 1280, yearly 980, extra: monthly 740, yearly 560
  const calculateTotals = () => {
    let ratePerUser = 0;
    const count = selectedAppIds.length;

    if (count <= 1) {
      ratePerUser = isYearly ? 560 : 740;
    } else {
      const baseRate = isYearly ? 980 : 1280;
      const extraRate = isYearly ? 560 : 740;
      ratePerUser = count <= 2 ? baseRate : baseRate + (count - 2) * extraRate;
    }

    const subtotal = ratePerUser * Math.max(1, userCount);
    const cgstAmount = Number((subtotal * 0.09).toFixed(2));
    const sgstAmount = Number((subtotal * 0.09).toFixed(2));
    const totalTax = Number((cgstAmount + sgstAmount).toFixed(2));
    const totalAmount = Number((subtotal + totalTax).toFixed(2));

    return {
      ratePerUser,
      subtotal,
      cgstAmount,
      sgstAmount,
      totalTax,
      totalAmount,
      appCount: count,
      unitPriceFormatted: isYearly ? '₹560.00' : '₹740.00'
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
        activePlan === 'single' ? 'Single Software' : 'Custom Softwares';

      // 1. Create Order on backend
      const orderRes = await createPaymentOrder({
        planId: activePlan === 'single' ? 'single-app' : 'custom-apps',
        selectedApps: selectedAppsNames,
        userCount,
        billingCycle: isYearly ? 'yearly' : 'monthly',
        companyName: formData.companyName || formData.yourName || 'OXOO Workspace',
        customerName: formData.yourName,
        customerEmail: formData.email,
        customerPhone: formData.phone
      });

      const orderNumber = orderRes.order?.orderNumber || `OXOO-ORD-2025-${Date.now().toString().slice(-6)}`;
      const invoiceNumber = `OXOO-INV-2025-${Date.now().toString().slice(-6)}`;
      const paymentId = `pay_rzp_${Date.now().toString().slice(-8)}`;

      // 2. Verify Payment on backend
      const verifyRes = await verifyPayment({
        orderNumber,
        paymentId,
        paymentMethod,
        companyName: formData.companyName || formData.yourName,
        customerName: formData.yourName,
        customerEmail: formData.email,
        selectedApps: selectedAppsNames,
        planName: planNameFormatted,
        billingCycle: isYearly ? 'yearly' : 'monthly',
        totalAmount: totals.totalAmount
      });

      const today = new Date();
      const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      const invoiceDateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const dueDateStr = dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      setPaymentSuccessData({
        orderNumber,
        invoiceNumber,
        paymentId,
        planName: planNameFormatted,
        paymentDate: invoiceDateStr,
        invoiceDate: invoiceDateStr,
        dueDate: dueDateStr,
        ...verifyRes
      });

      setCurrentStep(5);
    } catch (err) {
      setPaymentError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const dueDateFormatted = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <>
      <Header />
      <div className="checkout-page-root">
        {/* ================================================================= */}
        {/* Top 5-Step Progress Stepper Bar                                   */}
        {/* ================================================================= */}
        <div className="checkout-stepper-bar-wrap no-print">
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

              {/* Only Monthly Plan and Yearly Plan */}
              <div className="checkout-plan-pills-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div
                  className={`checkout-plan-pill ${!isYearly ? 'active' : ''}`}
                  onClick={() => setIsYearly(false)}
                >
                  <div className="checkout-pill-title">Monthly Plan</div>
                  <div className="checkout-pill-price" style={{ color: '#2563eb' }}>
                    {selectedAppIds.length <= 1 ? '₹740' : '₹1,280'}
                  </div>
                  <div className="checkout-pill-sub">
                    {selectedAppIds.length <= 1
                      ? 'per user / month (Single Software)'
                      : `for ${selectedAppIds.length} softwares (+₹740 each addl)`}
                  </div>
                </div>

                <div
                  className={`checkout-plan-pill ${isYearly ? 'active' : ''}`}
                  onClick={() => setIsYearly(true)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="checkout-pill-title">Yearly Plan</div>
                    <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                      Save up to 24%
                    </span>
                  </div>
                  <div className="checkout-pill-price" style={{ color: '#16a34a' }}>
                    {selectedAppIds.length <= 1 ? '₹560' : '₹980'}
                  </div>
                  <div className="checkout-pill-sub">
                    {selectedAppIds.length <= 1
                      ? 'per user / month (Single Software)'
                      : `for ${selectedAppIds.length} softwares (+₹560 each addl)`}
                  </div>
                </div>
              </div>

              {/* Configuration Row: Licensed Users & Current Selected Package */}
              <div className="checkout-config-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                  Selected: <b>{selectedAppIds.length <= 1 ? 'Single Software' : 'Custom Softwares'}</b> ({selectedAppIds.length} application{selectedAppIds.length > 1 ? 's' : ''})
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
                Select Software Applications:
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
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSoftware(mod.id)}
                      />
                      <img src={mod.iconSrc} alt={mod.name} className="checkout-software-icon" />
                      <div className="checkout-software-info">
                        <span className="checkout-software-name">{mod.name}</span>
                        <span className="checkout-software-desc">{mod.desc}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="checkout-software-rate" style={{ display: 'block' }}>
                          ₹{isYearly ? '560' : '740'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          / user / mo
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Price Summary Bar */}
              <div className="checkout-summary-bar">
                <div>
                  <div className="checkout-summary-text">
                    Plan: <b>{activePlan === 'single' ? 'Single Software' : 'Custom Softwares'}</b> · {selectedAppIds.length} Software{selectedAppIds.length > 1 ? 's' : ''} · {userCount} User{userCount > 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    Billing: {isYearly ? 'Yearly (₹560/user)' : 'Monthly (₹740/user)'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="checkout-summary-amount">
                    ₹{totals.subtotal.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                    + 18% GST (₹{totals.totalTax})
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
                    <th>Description</th>
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
                      <td><b>₹{isYearly ? '560' : '740'}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Price Breakdown Box */}
              <div className="cart-review-breakdown">
                <div className="cart-breakdown-row">
                  <span>Selected Plan:</span>
                  <b>{activePlan === 'single' ? 'Single Software' : 'Custom Softwares'}</b>
                </div>
                <div className="cart-breakdown-row">
                  <span>Licensed Users:</span>
                  <b>{userCount} User{userCount > 1 ? 's' : ''}</b>
                </div>
                <div className="cart-breakdown-row">
                  <span>Subtotal ({selectedAppIds.length} Softwares):</span>
                  <b>₹{totals.subtotal.toFixed(2)}</b>
                </div>
                <div className="cart-breakdown-row">
                  <span>CGST (9%):</span>
                  <b>₹{totals.cgstAmount.toFixed(2)}</b>
                </div>
                <div className="cart-breakdown-row">
                  <span>SGST (9%):</span>
                  <b>₹{totals.sgstAmount.toFixed(2)}</b>
                </div>
                <div className="cart-breakdown-row total-row">
                  <span>Total Amount Payable:</span>
                  <span style={{ color: '#2563eb' }}>
                    ₹{totals.totalAmount.toFixed(2)}
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
                      placeholder="Rahul Sharma"
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
                      placeholder="rahul@abc.com"
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
                      placeholder="ABC Pvt Ltd"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>

                  {/* VAT */}
                  <div className="form-field-group">
                    <label className="form-field-label">VAT</label>
                    <input
                      type="text"
                      className="form-field-input"
                      placeholder="29ABCDE1234F1Z5"
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
                      placeholder="123, MG Road"
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
                      placeholder="Bengaluru"
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
                      placeholder="560001"
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
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Plan:</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    {activePlan === 'single' ? 'Single Software' : 'Custom Softwares'} ({userCount} User{userCount > 1 ? 's' : ''})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Payable:</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
                    ₹{totals.totalAmount.toFixed(2)}
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
                  {isProcessing ? 'Verifying Transaction...' : `Pay ₹${totals.totalAmount.toFixed(2)} Securely →`}
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 5: Payment Success & TAX INVOICE (Exact match to Screenshot 2) */}
          {/* =============================================================== */}
          {currentStep === 5 && (
            <div>
              {/* Actions Banner */}
              <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
                  <div>
                    <b style={{ color: '#166534', fontSize: '1rem', display: 'block' }}>Payment Successful!</b>
                    <span style={{ color: '#15803d', fontSize: '0.85rem' }}>Your subscription has been verified and activated.</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="checkout-secondary-btn"
                    onClick={handlePrintReceipt}
                  >
                    <Download size={15} /> Download / Print Invoice
                  </button>
                  <Link
                    to="/customer"
                    className="checkout-primary-btn btn-green"
                    style={{ textDecoration: 'none', padding: '10px 18px', fontSize: '0.9rem' }}
                  >
                    Go to Dashboard →
                  </Link>
                </div>
              </div>

              {/* =========================================================== */}
              {/* Exact TAX INVOICE Sheet from Screenshot 2                   */}
              {/* =========================================================== */}
              <div className="tax-invoice-paper" id="printable-tax-invoice">
                <div className="invoice-top-accent-bar" />

                <div className="invoice-inner-body">
                  {/* Top Header Row */}
                  <div className="invoice-header-layout">
                    {/* Left: Brand */}
                    <div className="invoice-brand-col">
                      <div className="invoice-brand-title">
                        <Logo />
                      </div>
                      <div className="invoice-brand-sub">
                        Business Software & Cloud Solutions
                      </div>
                      <div className="invoice-brand-tagline">
                        One Platform. All Your Business Needs.
                      </div>
                    </div>

                    {/* Right: TAX INVOICE + PAID Badge + Meta */}
                    <div className="invoice-meta-col">
                      <div className="invoice-main-title-wrap">
                        <h2 className="invoice-main-title">TAX INVOICE</h2>
                        <span className="invoice-paid-pill">
                          <Check size={14} /> PAID
                        </span>
                      </div>

                      <div className="invoice-meta-table">
                        <div className="invoice-meta-row">
                          <span>Invoice No</span>
                          <span>:</span>
                          <b>{paymentSuccessData?.invoiceNumber || 'OXOO-INV-2025-000123'}</b>
                        </div>
                        <div className="invoice-meta-row">
                          <span>Invoice Date</span>
                          <span>:</span>
                          <b>{paymentSuccessData?.invoiceDate || todayFormatted}</b>
                        </div>
                        <div className="invoice-meta-row">
                          <span>Due Date</span>
                          <span>:</span>
                          <b>{paymentSuccessData?.dueDate || dueDateFormatted}</b>
                        </div>
                        <div className="invoice-meta-row">
                          <span>Order No</span>
                          <span>:</span>
                          <b>{paymentSuccessData?.orderNumber || 'OXOO-ORD-2025-000123'}</b>
                        </div>
                        <div className="invoice-meta-row">
                          <span>Payment Date</span>
                          <span>:</span>
                          <b>{paymentSuccessData?.paymentDate || todayFormatted}</b>
                        </div>
                        <div className="invoice-meta-row">
                          <span>Transaction ID</span>
                          <span>:</span>
                          <b style={{ fontFamily: 'monospace' }}>{paymentSuccessData?.paymentId || 'pay_rzp_82918291'}</b>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billed To Box */}
                  <div className="invoice-billed-section">
                    <div className="billed-icon-chip">
                      <Building2 size={20} />
                    </div>
                    <div className="billed-info-wrap">
                      <span className="billed-label-title">Billed To</span>
                      <span className="billed-company-name">
                        {formData.companyName || 'ABC Pvt Ltd'}
                      </span>
                      <span>{formData.yourName || 'Rahul Sharma'}</span>
                      <span>{formData.email || 'rahul@abc.com'}</span>
                      <span>+91 {formData.phone || '98765 43210'}</span>
                      <span>
                        {formData.streetAndNumber || '123, MG Road'}, {formData.city || 'Bengaluru'}, {formData.stateProvince || 'Karnataka'} - {formData.zipCode || '560001'}, {formData.country || 'India'}
                      </span>
                      {formData.vat && (
                        <span style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                          GSTIN: {formData.vat}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Invoice Items Table */}
                  <table className="invoice-table-sheet">
                    <thead>
                      <tr>
                        <th className="text-center" style={{ width: '40px' }}>#</th>
                        <th>Application</th>
                        <th>Description</th>
                        <th className="text-center" style={{ width: '80px' }}>Users</th>
                        <th className="text-right" style={{ width: '130px' }}>Unit Price (INR)</th>
                        <th className="text-right" style={{ width: '130px' }}>Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SOFTWARE_MODULES.filter((m) => selectedAppIds.includes(m.id)).map((app, index) => {
                        const itemAmount = (isYearly ? 560 : 740) * userCount;
                        return (
                          <tr key={app.id}>
                            <td className="text-center">{index + 1}</td>
                            <td>
                              <div className="invoice-app-col-wrap">
                                <div className="invoice-app-icon-badge">
                                  <img src={app.iconSrc} alt={app.name} />
                                </div>
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>{app.name}</span>
                              </div>
                            </td>
                            <td style={{ color: '#475569', fontSize: '0.82rem' }}>{app.desc}</td>
                            <td className="text-center">{userCount}</td>
                            <td className="text-right">₹{(isYearly ? 560 : 740).toFixed(2)}</td>
                            <td className="text-right" style={{ fontWeight: 800, color: '#0f172a' }}>
                              ₹{itemAmount.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Subtotal Breakdown Box */}
                  <div className="invoice-breakdown-wrapper">
                    <div className="invoice-calc-table">
                      <div className="invoice-calc-row">
                        <span>Subtotal</span>
                        <b>₹{totals.subtotal.toFixed(2)}</b>
                      </div>
                      <div className="invoice-calc-row">
                        <span>Discount</span>
                        <b>₹0.00</b>
                      </div>
                      <div className="invoice-calc-row">
                        <span>CGST (9%)</span>
                        <b>₹{totals.cgstAmount.toFixed(2)}</b>
                      </div>
                      <div className="invoice-calc-row">
                        <span>SGST (9%)</span>
                        <b>₹{totals.sgstAmount.toFixed(2)}</b>
                      </div>
                      <div className="invoice-total-highlight-row">
                        <span>Total (INR)</span>
                        <b>₹{totals.totalAmount.toFixed(2)}</b>
                      </div>
                    </div>
                  </div>

                  {/* Amount in Words */}
                  <div className="invoice-amount-words">
                    <b>Amount in Words: </b>
                    <span>{numberToWordsINR(totals.totalAmount)}</span>
                  </div>

                  {/* Two Column Notes */}
                  <div className="invoice-two-col-notes">
                    {/* Left: Terms & Conditions */}
                    <div className="notes-block-item">
                      <div className="notes-block-title">
                        <FileText size={16} style={{ color: '#2563eb' }} />
                        <span>Terms & Conditions</span>
                      </div>
                      <ol className="notes-list-ol">
                        <li>This is a computer generated invoice.</li>
                        <li>Payment has been received and verified.</li>
                        <li>Subscription access is subject to applicable OXOO terms and conditions.</li>
                        <li>Renewal and cancellation are governed by the selected billing plan.</li>
                        <li>For support, contact support@oxoo.com.</li>
                      </ol>
                    </div>

                    {/* Right: Company Details */}
                    <div className="notes-block-item">
                      <div className="notes-block-title">
                        <Building2 size={16} style={{ color: '#2563eb' }} />
                        <span>Company Details</span>
                      </div>
                      <div style={{ lineHeight: 1.5 }}>
                        <b>OXOO Technologies Pvt Ltd</b><br />
                        #123, Tech Park, MG Road,<br />
                        Bengaluru - 560001, Karnataka, India<br />
                        GSTIN: 29ABCDE1234F1Z5<br />
                        CIN: U72900KA2020PTC123456<br />
                        <span style={{ color: '#2563eb' }}>www.oxoo.com</span>
                      </div>
                    </div>
                  </div>

                  {/* Signatures & QR Code Footer */}
                  <div className="invoice-signatures-row">
                    <div className="signatory-col">
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                        Authorized Signatory
                      </span>
                      <div className="signature-script-mock">
                        OxooSign
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                        OXOO Technologies Pvt Ltd
                      </span>
                    </div>

                    <div className="qr-verify-col">
                      <div className="qr-box-mock">
                        <svg viewBox="0 0 100 100" fill="currentColor">
                          <rect x="0" y="0" width="30" height="30" />
                          <rect x="5" y="5" width="20" height="20" fill="#fff" />
                          <rect x="10" y="10" width="10" height="10" fill="#000" />
                          <rect x="70" y="0" width="30" height="30" />
                          <rect x="75" y="5" width="20" height="20" fill="#fff" />
                          <rect x="80" y="10" width="10" height="10" fill="#000" />
                          <rect x="0" y="70" width="30" height="30" />
                          <rect x="5" y="75" width="20" height="20" fill="#fff" />
                          <rect x="10" y="80" width="10" height="10" fill="#000" />
                          <rect x="40" y="10" width="20" height="10" />
                          <rect x="40" y="30" width="10" height="20" />
                          <rect x="60" y="40" width="20" height="20" />
                          <rect x="35" y="65" width="15" height="15" />
                          <rect x="60" y="70" width="25" height="10" />
                          <rect x="75" y="85" width="15" height="15" />
                        </svg>
                      </div>
                      <div className="qr-text-meta">
                        <span>Scan to verify invoice</span>
                        <b>{paymentSuccessData?.invoiceNumber || 'OXOO-INV-2025-000123'}</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '28px' }}>
                <button
                  type="button"
                  className="checkout-secondary-btn"
                  onClick={handlePrintReceipt}
                >
                  <Printer size={16} /> Print / Save Tax Invoice
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
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
