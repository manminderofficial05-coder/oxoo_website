import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check, ArrowRight, ArrowLeft, ShieldCheck, Lock, CreditCard,
  Download, Printer, CheckCircle2, Building2, User, Mail, Phone,
  FileText, QrCode, Sparkles, AlertCircle, RefreshCw, KeyRound, X
} from 'lucide-react';
import { Header, Footer, Logo } from './components';
import { SOFTWARE_MODULES } from './PricingPage';
import {
  calculatePricing, createPaymentOrder, verifyPayment, getCustomerOverview,
  sendEmailOtp, verifyEmailOtp
} from './api';
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

  // Track apps already purchased by customer to prevent duplicate buying
  const [ownedAppIds, setOwnedAppIds] = useState(() => {
    const ids = new Set();
    try {
      const lp = localStorage.getItem('oxoo_purchased_apps');
      if (lp) {
        const list = JSON.parse(lp);
        list.forEach((a) => {
          const str = (typeof a === 'string' ? a : a.id || a.name || '').toLowerCase();
          if (str.includes('sale')) ids.add('sales');
          else if (str.includes('supply') || str.includes('chain') || str.includes('inventory')) ids.add('supply-chain');
          else if (str.includes('human') || str.includes('resource') || str.includes('hr')) ids.add('human-resources');
          else if (str.includes('productivity') || str.includes('ai')) ids.add('productivity');
          else if (str.includes('finance') || str.includes('account')) ids.add('finance');
        });
      }
    } catch (e) {}
    return Array.from(ids);
  });

  // Selected Software(s)
  const paramApps = searchParams.get('apps');
  const validSoftwareIds = SOFTWARE_MODULES.map((m) => m.id);
  const parsedApps = (paramApps ? paramApps.split(',').filter(Boolean) : [])
    .map((id) => (id === 'hr' ? 'human-resources' : id))
    .filter((id) => validSoftwareIds.includes(id));

  // Exclude already owned softwares from initial selection
  const unownedSoftwareIds = SOFTWARE_MODULES.filter((m) => !ownedAppIds.includes(m.id)).map((m) => m.id);
  const candidateApps = parsedApps.length > 0
    ? parsedApps
    : activePlan === 'custom'
    ? ['sales', 'finance']
    : ['sales'];
  const filteredApps = candidateApps.filter((id) => !ownedAppIds.includes(id));
  const initialApps = filteredApps.length > 0
    ? filteredApps
    : unownedSoftwareIds.length > 0
    ? [unownedSoftwareIds[0]]
    : [];

  const [selectedAppIds, setSelectedAppIds] = useState(initialApps);

  // Number of licensed users
  const [userCount, setUserCount] = useState(1);

  // Logged-in user state
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const u = localStorage.getItem('oxoo_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });

  // Step 3: Company & Billing Details - Auto-fill from logged-in user if available
  const [formData, setFormData] = useState(() => {
    let user = null;
    try {
      const u = localStorage.getItem('oxoo_user');
      if (u) user = JSON.parse(u);
    } catch (e) {}

    let profile = null;
    try {
      const p = localStorage.getItem('oxoo_customer_profile');
      if (p) profile = JSON.parse(p);
    } catch (e) {}

    return {
      yourName: user?.name || profile?.yourName || 'Rahul Sharma',
      email: user?.email || profile?.email || 'rahul@abc.com',
      phone: user?.phone || profile?.phone || '98765 43210',
      companyName: user?.organization || profile?.companyName || (user?.name ? `${user.name} Workspace` : 'ABC Pvt Ltd'),
      vat: user?.vat || profile?.vat || '29ABCDE1234F1Z5',
      streetAndNumber: user?.streetAndNumber || profile?.streetAndNumber || '123, MG Road',
      city: user?.city || profile?.city || 'Bengaluru',
      zipCode: user?.zipCode || profile?.zipCode || '560001',
      country: user?.country || profile?.country || 'India',
      stateProvince: user?.stateProvince || profile?.stateProvince || 'Karnataka'
    };
  });

  // Listen for login/auth changes to automatically sync user details into formData
  useEffect(() => {
    const handleAuthSync = () => {
      try {
        const u = localStorage.getItem('oxoo_user');
        const user = u ? JSON.parse(u) : null;
        setLoggedInUser(user);
        if (user) {
          setFormData((prev) => ({
            ...prev,
            yourName: user.name || prev.yourName,
            email: user.email || prev.email,
            companyName: user.organization || prev.companyName,
            phone: user.phone || prev.phone
          }));
        }
      } catch (e) {}
    };

    window.addEventListener('oxoo_auth_change', handleAuthSync);
    return () => window.removeEventListener('oxoo_auth_change', handleAuthSync);
  }, []);

  // Fetch customer's already active software from backend to prevent duplicate purchases
  useEffect(() => {
    async function checkExistingPurchases() {
      const email = loggedInUser?.email || formData.email;
      const company = loggedInUser?.organization || formData.companyName;
      if (!email && !company) return;

      try {
        const res = await getCustomerOverview({ email, company });
        if (res?.purchasedApps && res.purchasedApps.length > 0) {
          const ids = new Set(ownedAppIds);
          res.purchasedApps.forEach((a) => {
            const str = (typeof a === 'string' ? a : a.id || a.name || '').toLowerCase();
            if (str.includes('sale')) ids.add('sales');
            else if (str.includes('supply') || str.includes('chain') || str.includes('inventory')) ids.add('supply-chain');
            else if (str.includes('human') || str.includes('resource') || str.includes('hr')) ids.add('human-resources');
            else if (str.includes('productivity') || str.includes('ai')) ids.add('productivity');
            else if (str.includes('finance') || str.includes('account')) ids.add('finance');
          });
          const updated = Array.from(ids);
          setOwnedAppIds(updated);

          // If any currently selected apps are already owned, remove them
          setSelectedAppIds((prev) => {
            const clean = prev.filter((id) => !updated.includes(id));
            if (clean.length > 0) return clean;
            const available = SOFTWARE_MODULES.find((m) => !updated.includes(m.id));
            return available ? [available.id] : [];
          });
        }
      } catch (e) {}
    }
    checkExistingPurchases();
  }, [loggedInUser]);

  const [formErrors, setFormErrors] = useState({});

  // Step 3 Billing Email OTP Verification States
  const [isEmailVerified, setIsEmailVerified] = useState(() => {
    try {
      const u = localStorage.getItem('oxoo_user');
      if (u) {
        const user = JSON.parse(u);
        return Boolean(user?.email);
      }
    } catch (e) {}
    return false;
  });
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Trigger sending OTP to billing email
  const handleTriggerEmailOtp = async () => {
    const cleanEmail = (formData.email || '').trim();
    if (!cleanEmail) {
      setFormErrors((prev) => ({ ...prev, email: 'Please enter your email address' }));
      return;
    }
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setFormErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    setIsSendingOtp(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      await sendEmailOtp({
        email: cleanEmail,
        purpose: 'OXOO Billing & Payment Verification',
        customerName: (formData.yourName || '').trim()
      });
      setIsOtpModalOpen(true);
      setOtpSuccess(`Verification code sent to ${cleanEmail}`);
      setResendCooldown(30);
    } catch (err) {
      alert(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP entered by customer
  const handleVerifyCheckoutOtp = async (e) => {
    if (e) e.preventDefault();
    setOtpError('');
    const cleanOtp = otpValue.replace(/\D/g, '').trim();
    if (cleanOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await verifyEmailOtp({
        email: formData.email.trim(),
        otp: cleanOtp
      });
      setIsEmailVerified(true);
      setIsOtpModalOpen(false);
      setOtpValue('');
      // Successfully verified email! Now proceed to payment step
      setCurrentStep(4);
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

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
    const unowned = SOFTWARE_MODULES.filter((m) => !ownedAppIds.includes(m.id)).map((m) => m.id);
    if (plan === 'single') {
      const pick = selectedAppIds.find((id) => unowned.includes(id)) || unowned[0] || 'sales';
      setSelectedAppIds([pick]);
    } else if (plan === 'custom') {
      const candidates = unowned.slice(0, 2);
      if (candidates.length >= 2) {
        setSelectedAppIds(candidates);
      } else if (candidates.length === 1) {
        setSelectedAppIds(candidates);
      }
    }
  };

  // Handle toggling software selection in Step 1 (Blocks re-purchasing already owned software)
  const handleToggleSoftware = (appId) => {
    if (ownedAppIds.includes(appId)) {
      const mod = SOFTWARE_MODULES.find((m) => m.id === appId);
      alert(`You already own ${mod ? mod.name : 'this software'}! Customers cannot purchase duplicate licenses for the same software.`);
      return;
    }

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
  // Single Software: monthly 740, yearly 560/mo (billed 12 months = 6,720)
  // Custom Softwares (for 2): monthly 1280, yearly 980/mo (billed 12 months = 11,760), extra: monthly 740, yearly 560/mo (billed 12 months = 6,720)
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

    const months = isYearly ? 12 : 1;
    const subtotal = ratePerUser * Math.max(1, userCount) * months;
    const cgstAmount = Number((subtotal * 0.09).toFixed(2));
    const sgstAmount = Number((subtotal * 0.09).toFixed(2));
    const totalTax = Number((cgstAmount + sgstAmount).toFixed(2));
    const totalAmount = Number((subtotal + totalTax).toFixed(2));

    return {
      ratePerUser,
      months,
      subtotal,
      cgstAmount,
      sgstAmount,
      totalTax,
      totalAmount,
      appCount: count,
      unitPriceFormatted: isYearly ? `₹${(560 * 12).toFixed(2)}` : '₹740.00'
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

  // Proceed from Step 3: Enforces email OTP verification before allowing payment!
  const handleProceedFromStep3 = async (e) => {
    if (e) e.preventDefault();
    if (!validateCompanyDetails()) return;

    if (isEmailVerified) {
      setCurrentStep(4);
      return;
    }

    // Require email OTP verification before payment!
    await handleTriggerEmailOtp();
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

      const curYear = new Date().getFullYear();
      const orderNumber = orderRes.order?.orderNumber || `OXOO-ORD-${curYear}-${Date.now().toString().slice(-6)}`;
      const invoiceNumber = `INV-${curYear}-${Date.now().toString().slice(-5)}${Math.floor(100 + Math.random() * 900)}`;
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
        totalAmount: totals.totalAmount,
        invoiceNumber
      });

      const today = new Date();
      const calcDueDate = new Date(today);
      if (isYearly) {
        calcDueDate.setFullYear(calcDueDate.getFullYear() + 1);
      } else {
        calcDueDate.setMonth(calcDueDate.getMonth() + 1);
      }
      const invoiceDateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const dueDateStr = calcDueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      // Prepare purchased app modules
      const purchasedModules = SOFTWARE_MODULES
        .filter((m) => selectedAppIds.includes(m.id))
        .map((m) => ({
          id: m.id,
          name: m.name,
          category: m.category || 'Business Suite',
          entitled: true,
          status: 'Active',
          demoUrl: m.demoUrl || `/apps/${m.id}`,
          iconSrc: m.iconSrc
        }));

      // Store in localStorage for instant synchronization across Customer and Admin Dashboards
      let existingApps = [];
      try {
        const ea = localStorage.getItem('oxoo_purchased_apps');
        if (ea) existingApps = JSON.parse(ea);
      } catch (e) {}

      const appMap = new Map();
      existingApps.forEach((a) => appMap.set(a.id, a));
      purchasedModules.forEach((a) => appMap.set(a.id, a));
      const combinedPurchasedApps = Array.from(appMap.values());
      localStorage.setItem('oxoo_purchased_apps', JSON.stringify(combinedPurchasedApps));

      // Build customer order record for Admin Dashboard & Customer Dashboard
      const orderRecord = {
        orderNumber,
        invoiceNumber,
        paymentId,
        company: formData.companyName || formData.yourName,
        companyName: formData.companyName || formData.yourName,
        customerName: formData.yourName,
        email: formData.email,
        phone: formData.phone,
        plan: planNameFormatted,
        billingCycle: isYearly ? 'yearly' : 'monthly',
        amount: `₹${totals.totalAmount.toLocaleString('en-IN')}`,
        rawAmount: totals.totalAmount,
        currency: 'INR',
        status: 'Active',
        date: invoiceDateStr,
        timestamp: new Date().toISOString(),
        apps: selectedAppsNames,
        purchasedApps: combinedPurchasedApps
      };

      // Store in oxoo_recent_customers for Admin Dashboard
      let adminCustomers = [];
      try {
        const ac = localStorage.getItem('oxoo_recent_customers');
        if (ac) adminCustomers = JSON.parse(ac);
      } catch (e) {}
      const updatedAdminCustomers = [orderRecord, ...adminCustomers.filter((c) => c.company !== orderRecord.company)];
      localStorage.setItem('oxoo_recent_customers', JSON.stringify(updatedAdminCustomers));
      localStorage.setItem('oxoo_last_order', JSON.stringify(orderRecord));

      // Also ensure user session has active purchasedApps
      try {
        let userObj = loggedInUser || {
          id: Date.now(),
          name: formData.yourName,
          email: formData.email,
          role: 'customer'
        };
        userObj = {
          ...userObj,
          organization: formData.companyName || userObj.organization || 'My Organization',
          purchasedApps: combinedPurchasedApps,
          plan: planNameFormatted
        };
        localStorage.setItem('oxoo_user', JSON.stringify(userObj));
      } catch (e) {}

      // Trigger global events for immediate UI reactivity
      window.dispatchEvent(new Event('oxoo_auth_change'));
      window.dispatchEvent(new Event('oxoo_order_placed'));

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

  const getComputedDueDate = (yearly) => {
    const d = new Date();
    if (yearly) {
      d.setFullYear(d.getFullYear() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const computedDueDate = getComputedDueDate(isYearly);

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
                    <div className="checkout-pill-title">Yearly Plan (12 Months)</div>
                    <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                      Save up to 24%
                    </span>
                  </div>
                  <div className="checkout-pill-price" style={{ color: '#16a34a' }}>
                    {selectedAppIds.length <= 1 ? '₹560' : '₹980'}
                    <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#475569' }}> / user / mo</span>
                  </div>
                  <div className="checkout-pill-sub">
                    {selectedAppIds.length <= 1
                      ? 'Billed annually: ₹6,720 / user (12 months payment)'
                      : `Billed annually for ${selectedAppIds.length} softwares (12 months payment)`}
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

              {/* Software Selection Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                  Select Softwares ({selectedAppIds.length} selected):
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Pick 1 software for Single Software, or 2+ for Custom Softwares
                </span>
              </div>

              {/* Software Selection Grid */}
              <div className="checkout-software-grid">
                {SOFTWARE_MODULES.map((mod) => {
                  const isOwned = ownedAppIds.includes(mod.id);
                  const isChecked = selectedAppIds.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      className={`checkout-software-card ${isChecked ? 'selected' : ''} ${isOwned ? 'already-owned' : ''}`}
                      onClick={() => handleToggleSoftware(mod.id)}
                      style={isOwned ? {
                        opacity: 0.75,
                        background: '#f8fafc',
                        border: '1.5px dashed #94a3b8',
                        cursor: 'not-allowed'
                      } : {}}
                    >
                      <input
                        type="checkbox"
                        checked={isOwned ? false : isChecked}
                        disabled={isOwned}
                        onChange={() => handleToggleSoftware(mod.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <img src={mod.iconSrc} alt={mod.name} className="checkout-software-icon" />
                      <div className="checkout-software-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                          <span className="checkout-software-name">{mod.name}</span>
                          {isOwned ? (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                background: '#dcfce7',
                                color: '#15803d',
                                border: '1px solid #86efac'
                              }}
                            >
                              ✓ Already Purchased & Active
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '1px 7px',
                                borderRadius: '4px',
                                background: `${mod.color}15`,
                                color: mod.color
                              }}
                            >
                              6 Apps Suite
                            </span>
                          )}
                        </div>
                        <span className="checkout-software-desc">
                          {isOwned ? 'Active in your account. You cannot buy duplicate copies of this software.' : mod.desc}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {isOwned ? (
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>
                            Owned
                          </span>
                        ) : (
                          <>
                            <span className="checkout-software-rate" style={{ display: 'block' }}>
                              ₹{isYearly ? '560' : '740'}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              / user / mo
                            </span>
                          </>
                        )}
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
                    Billing: {isYearly ? `Yearly (12 Months at ₹${totals.ratePerUser}/user/mo)` : `Monthly (1 Month at ₹${totals.ratePerUser}/user/mo)`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="checkout-summary-amount">
                    ₹{totals.subtotal.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                    + 18% GST (₹{totals.totalTax.toLocaleString('en-IN')}) = ₹{totals.totalAmount.toLocaleString('en-IN')}
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
              <div className="invoice-table-responsive-wrapper">
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
                        <td>{isYearly ? 'Yearly (12 Months)' : 'Monthly (1 Month)'}</td>
                        <td>
                          <b>
                            {isYearly ? (
                              <span>
                                ₹{(560 * 12).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>(₹560/mo × 12)</span>
                              </span>
                            ) : (
                              '₹740 / mo'
                            )}
                          </b>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Price Breakdown Box */}
              <div className="cart-review-breakdown">
                <div className="cart-breakdown-row">
                  <span>Selected Plan:</span>
                  <b>{activePlan === 'single' ? 'Single Software' : 'Custom Softwares'}</b>
                </div>
                <div className="cart-breakdown-row">
                  <span>Billing Period:</span>
                  <b>{isYearly ? '12 Months (Annual Subscription)' : '1 Month (Monthly Subscription)'}</b>
                </div>
                <div className="cart-breakdown-row">
                  <span>Licensed Users:</span>
                  <b>{userCount} User{userCount > 1 ? 's' : ''}</b>
                </div>
                <div className="cart-breakdown-row">
                  <span>Subtotal ({selectedAppIds.length} Software{selectedAppIds.length > 1 ? 's' : ''}{isYearly ? ' × 12 Months' : ''}):</span>
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

              {/* Logged in auto-fill banner */}
              {loggedInUser ? (
                <div
                  className="checkout-logged-in-banner"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
                    border: '1.5px solid #86efac',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    marginBottom: '22px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#16a34a',
                        color: '#ffffff',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        fontSize: '17px',
                        flexShrink: 0,
                        boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
                      }}
                    >
                      {loggedInUser.name ? loggedInUser.name.charAt(0).toUpperCase() : '✓'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#166534' }}>
                          Account Active: {loggedInUser.name || 'Registered Customer'}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            border: '1px solid #bbf7d0'
                          }}
                        >
                          ✓ Auto-Filled with Account Data
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>
                        {loggedInUser.email} &bull; {formData.companyName || loggedInUser.organization || 'Business Workspace'} &bull; Details loaded from your account.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedFromStep3}
                    className="checkout-primary-btn"
                    style={{
                      padding: '9px 18px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    Use Account Details & Continue <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    fontSize: '13px',
                    color: '#475569'
                  }}
                >
                  <span>
                    Already have an OXOO customer or enterprise account?
                  </span>
                  <Link
                    to="/customer/login"
                    style={{
                      color: '#2563eb',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Log in to auto-fill this form &rarr;
                  </Link>
                </div>
              )}

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-field-label" style={{ marginBottom: 0 }}>Email *</label>
                      {isEmailVerified ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                          <CheckCircle2 size={12} /> Email Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleTriggerEmailOtp}
                          disabled={isSendingOtp || !formData.email.trim()}
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <KeyRound size={11} />
                          {isSendingOtp ? 'Sending...' : 'Verify Email (OTP)'}
                        </button>
                      )}
                    </div>
                    <input
                      type="email"
                      className="form-field-input"
                      required
                      placeholder="rahul@abc.com"
                      value={formData.email}
                      onChange={(e) => {
                        const newEmail = e.target.value;
                        setFormData({ ...formData, email: newEmail });
                        if (isEmailVerified && (!loggedInUser || loggedInUser.email !== newEmail)) {
                          setIsEmailVerified(false);
                        }
                      }}
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

          {/* OTP Verification Modal for Billing Email */}
          {isOtpModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                padding: '20px'
              }}
              onClick={() => setIsOtpModalOpen(false)}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  padding: '32px 28px',
                  maxWidth: '440px',
                  width: '100%',
                  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.25)',
                  position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                      border: '1px solid #bfdbfe',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb',
                      marginBottom: '14px',
                      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.15)'
                    }}
                  >
                    <ShieldCheck size={30} />
                  </div>
                  <h3 style={{ fontSize: '21px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                    Verify Your Billing Email
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Enter the 6-digit OTP code sent to <br />
                    <strong style={{ color: '#0f172a' }}>{formData.email}</strong>
                  </p>
                </div>

                {otpSuccess && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#15803d',
                      fontSize: '12.5px',
                      textAlign: 'center',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>{otpSuccess}</span>
                  </div>
                )}

                {otpError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      fontSize: '12.5px',
                      textAlign: 'center',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <AlertCircle size={15} />
                    <span>{otpError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyCheckoutOtp}>
                  <div style={{ marginBottom: '22px' }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      value={otpValue}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtpValue(clean);
                        if (otpError) setOtpError('');
                      }}
                      placeholder="••••••"
                      style={{
                        width: '100%',
                        height: '52px',
                        textAlign: 'center',
                        fontSize: '28px',
                        fontWeight: 800,
                        letterSpacing: '10px',
                        color: '#0f172a',
                        background: '#f8fafc',
                        border: '2px solid #cbd5e1',
                        borderRadius: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
                      Verification code is valid for 10 minutes.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || otpValue.trim().length !== 6}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '12px',
                      background: otpValue.trim().length === 6 ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : '#94a3b8',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: otpValue.trim().length === 6 && !isVerifyingOtp ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: otpValue.trim().length === 6 ? '0 8px 20px rgba(22, 163, 74, 0.25)' : 'none',
                      marginBottom: '16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isVerifyingOtp ? 'Verifying code...' : 'Verify & Proceed to Payment →'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => setIsOtpModalOpen(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleTriggerEmailOtp}
                      disabled={resendCooldown > 0 || isSendingOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendCooldown > 0 ? '#94a3b8' : '#2563eb',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <RefreshCw size={13} className={isSendingOtp ? 'animate-spin' : ''} />
                      <span>{isSendingOtp ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                    </button>
                  </div>
                </form>
              </div>
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
              {/* Emailed Invoice & Customer Dashboard Login Credentials Banner */}
              <div
                className="no-print"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                  border: '1.5px solid #93c5fd',
                  borderRadius: '14px',
                  padding: '18px 22px',
                  marginBottom: '20px',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.08)'
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#2563eb',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <Mail size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Tax Invoice & Customer Login Credentials Emailed!</span>
                    <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                      ✓ Delivered to {formData.email}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', lineHeight: 1.5 }}>
                    Your official Tax Invoice receipt and your Customer Dashboard login credentials (<strong style={{ color: '#1e3a8a' }}>User ID:</strong> <code>{formData.email}</code> &bull; <strong style={{ color: '#1e3a8a' }}>Password:</strong> <code>oxoo123</code>) have been sent to your email. You can sign in to access your customer dashboard anytime.
                  </div>
                </div>
              </div>

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
                          <b>{paymentSuccessData?.dueDate || computedDueDate}</b>
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
                  <div className="invoice-table-responsive-wrapper">
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
                          const months = isYearly ? 12 : 1;
                          const unitPrice = isYearly ? 560 * 12 : 740;
                          const itemAmount = unitPrice * userCount;
                          return (
                            <tr key={app.id}>
                              <td className="text-center">{index + 1}</td>
                              <td>
                                <div className="invoice-app-col-wrap">
                                  <div className="invoice-app-icon-badge">
                                    <img src={app.iconSrc} alt={app.name} />
                                  </div>
                                  <div>
                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{app.name}</span>
                                    {isYearly && (
                                      <span style={{ display: 'block', fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                                        12 Months Annual License (₹560/mo × 12)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td style={{ color: '#475569', fontSize: '0.82rem' }}>{app.desc}</td>
                              <td className="text-center">{userCount}</td>
                              <td className="text-right">
                                {isYearly ? (
                                  <div>
                                    <b>₹{(560 * 12).toFixed(2)}</b>
                                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>₹560/mo × 12</div>
                                  </div>
                                ) : (
                                  `₹${(740).toFixed(2)}`
                                )}
                              </td>
                              <td className="text-right" style={{ fontWeight: 800, color: '#0f172a' }}>
                                ₹{itemAmount.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

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
