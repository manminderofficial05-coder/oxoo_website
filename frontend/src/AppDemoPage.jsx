import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Building2, Globe, Languages, Check, ArrowRight,
  ChevronDown, ArrowLeft, CheckCircle2, Sparkles, ShieldCheck, Pencil,
  AlertCircle, RefreshCw, KeyRound
} from 'lucide-react';
import { Header, Footer } from './components';
import { ALL_SYSTEM_APPS, getAppMeta } from './appMetaHelper';
import { submitLead, sendEmailOtp, verifyEmailOtp } from './api';
import DemoCelebrationLaunch from './DemoCelebrationLaunch';
import CompanyBrandLogo from './CompanyBrandLogo';

export default function AppDemoPage() {
  const { appSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Parse any query params (e.g. ?apps=ai or ?app=ai or ?company=...)
  const queryParams = new URLSearchParams(location.search);
  const rawAppsParam = queryParams.get('apps') || queryParams.get('app');
  const firstAppSlug = rawAppsParam ? rawAppsParam.split(',')[0].trim() : null;

  // Read stored selection from localStorage if available
  let storedAppSlug = null;
  try {
    const rawStored = localStorage.getItem('oxoo_selected_apps');
    if (rawStored) {
      const parsed = JSON.parse(rawStored);
      if (Array.isArray(parsed) && parsed.length > 0) storedAppSlug = parsed[0];
    }
  } catch (e) {}

  // Explicit query param (?apps=...) has highest priority, then appSlug from route, then stored selection, then 'accounting'
  const initialSlug = firstAppSlug || (appSlug && appSlug !== 'demo' ? appSlug : null) || storedAppSlug || 'accounting';

  // App Metadata state
  const [currentApp, setCurrentApp] = useState(() => getAppMeta(initialSlug));
  const [changeMenuOpen, setChangeMenuOpen] = useState(false);
  const [searchAppQuery, setSearchAppQuery] = useState('');

  // Form Fields (Empty by default)
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customSubdomain, setCustomSubdomain] = useState('');
  const [isEditingSubdomain, setIsEditingSubdomain] = useState(false);
  const [country, setCountry] = useState('India');
  const [language, setLanguage] = useState('English');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Company Name Limit (Max 8 characters)
  const [companyError, setCompanyError] = useState('');

  // OTP Verification States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleCompanyChange = (e) => {
    const rawVal = e.target.value;
    if (rawVal.length > 8) {
      setCompanyError('Company name cannot be more than 8 letters or numbers.');
      return;
    }
    const clean = rawVal.slice(0, 8);
    setCompanyName(clean);
    if (errorMessage) setErrorMessage('');

    if (clean.length === 8) {
      setCompanyError('Maximum 8 characters reached. Cannot enter more.');
    } else {
      setCompanyError('');
    }
  };

  const handleCompanyKeyDown = (e) => {
    if (
      companyName.length >= 8 &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
      !e.ctrlKey && !e.metaKey
    ) {
      setCompanyError('Company name cannot exceed 8 characters. Cannot enter more.');
    }
  };

  // Submission & Celebration State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update app when route param or search params change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawParam = params.get('apps') || params.get('app');
    const firstSlug = rawParam ? rawParam.split(',')[0].trim() : null;

    let localSlug = null;
    try {
      const rawStored = localStorage.getItem('oxoo_selected_apps');
      if (rawStored) {
        const parsed = JSON.parse(rawStored);
        if (Array.isArray(parsed) && parsed.length > 0) localSlug = parsed[0];
      }
    } catch (e) {}

    const targetSlug = firstSlug || (appSlug && appSlug !== 'demo' ? appSlug : null) || localSlug;
    if (targetSlug) {
      setCurrentApp(getAppMeta(targetSlug));
    }
  }, [appSlug, location.search]);

  // Derived subdomain from company name (empty until typed)
  const cleanSubdomain = (
    customSubdomain.trim() ||
    companyName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  // Filter apps for dropdown switcher
  const filteredApps = ALL_SYSTEM_APPS.filter((a) =>
    a.name.toLowerCase().includes(searchAppQuery.toLowerCase()) ||
    a.category?.toLowerCase().includes(searchAppQuery.toLowerCase())
  );

  const handleSelectApp = (appItem) => {
    setCurrentApp(appItem);
    setChangeMenuOpen(false);
    setSearchAppQuery('');
    try {
      localStorage.setItem('oxoo_selected_apps', JSON.stringify([appItem.slug]));
    } catch (e) {}
    navigate(`/apps/${appItem.slug}/demo?apps=${encodeURIComponent(appItem.slug)}`, { replace: true });
  };

  const handleCelebrationComplete = () => {
    const appsParam = queryParams.get('apps') || queryParams.get('app') || currentApp.slug;
    navigate(`/apps/${currentApp.slug}/live-demo?company=${encodeURIComponent(`${cleanSubdomain}.oxoo`)}&verified=true&apps=${encodeURIComponent(appsParam)}`);
  };

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Handle Form Submission -> Sends 6-digit OTP to Customer Email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanEmail = workEmail.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your work email.');
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@company.com).');
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone) {
      setErrorMessage('Please enter your 10-digit phone number.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setErrorMessage('Phone number must be exactly 10 digits (digits 0-9 only).');
      return;
    }
    if (!companyName.trim()) {
      setErrorMessage('Please enter your company name.');
      return;
    }
    if (companyName.trim().length > 8) {
      setCompanyError('Company name cannot be more than 8 letters or numbers.');
      setErrorMessage('Company name cannot be more than 8 letters or numbers.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the agreement to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send OTP to customer's work email
      await sendEmailOtp({
        email: cleanEmail,
        purpose: 'OXOO Live Demo Access',
        customerName: fullName.trim()
      });

      setOtpCode(''); // Keep empty so user must enter code from email
      setIsOtpStep(true);
      setOtpError('');
      setOtpSuccess(`A 6-digit verification code has been sent to ${cleanEmail}`);
      setResendCooldown(30);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error sending verification code. Please check your email.');
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResendingOtp) return;
    setIsResendingOtp(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      await sendEmailOtp({
        email: workEmail.trim(),
        purpose: 'OXOO Live Demo Access',
        customerName: fullName.trim()
      });
      setOtpSuccess(`A fresh verification code was sent to ${workEmail.trim()}`);
      setResendCooldown(30);
    } catch (err) {
      setOtpError(err.message || 'Failed to resend code.');
    } finally {
      setIsResendingOtp(false);
    }
  };

  // Handle Verify OTP and Launch Celebration & Live Demo
  const handleVerifyOtp = async (e) => {
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
        email: workEmail.trim(),
        otp: cleanOtp
      });

      // Submit lead to backend
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      await submitLead({
        name: fullName.trim(),
        email: workEmail.trim(),
        phone: `+91 ${cleanPhone}`,
        company: `${cleanSubdomain}.oxoo`,
        country,
        language,
        app: currentApp.name,
        slug: currentApp.slug,
        source: 'full-page-demo-form'
      }).catch(() => null);

      // Persist verified demo company & user to localStorage and sessionStorage
      try {
        sessionStorage.setItem('oxoo_demo_session_verified', 'true');
        localStorage.setItem('oxoo_demo_verified', 'true');
        localStorage.setItem('oxoo_demo_user', fullName.trim());
        localStorage.setItem('oxoo_demo_email', workEmail.trim());
        localStorage.setItem('oxoo_demo_company', `${cleanSubdomain}.oxoo`);
        localStorage.setItem('oxoo_demo_app', currentApp.slug);
      } catch (err) {}

      // Launch full page continuous fireworks & typewriter celebration!
      setShowCelebration(true);
      setIsVerifyingOtp(false);
    } catch (err) {
      setIsVerifyingOtp(false);
      setOtpError(err.message || 'Invalid or expired verification code. Please try again.');
    }
  };

  return (
    <div className="demo-fullpage-root">
      {/* Full Page Continuous Celebration SkyShots & Typewriter Takeover */}
      {showCelebration ? (
        <DemoCelebrationLaunch
          appName={currentApp.name}
          companyName={cleanSubdomain}
          onComplete={handleCelebrationComplete}
        />
      ) : (
        <>
          <Header />

      <main className="demo-fullpage-main">
        {/* Ambient background glow elements */}
        <div className="demo-fullpage-ambient-bg" aria-hidden="true" />

        <div className="demo-fullpage-container">
          {/* Centered White Form Card */}
          <motion.div
            className="demo-fullpage-card"
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            {isOtpStep ? (
              <div style={{ padding: '36px 32px' }}>
                <form onSubmit={handleVerifyOtp} noValidate className="demo-otp-form">
                  <div style={{ textAlign: 'center', marginBottom: '26px' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '18px',
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        border: '1px solid #bfdbfe',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb',
                        marginBottom: '16px',
                        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.16)'
                      }}
                    >
                      <ShieldCheck size={34} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                      Verify Your Work Email
                    </h2>
                    <p style={{ fontSize: '14.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      We sent a 6-digit verification code to <br />
                      <strong style={{ color: '#0f172a', fontWeight: '700' }}>{workEmail.trim()}</strong>
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
                        fontSize: '13px',
                        fontWeight: '500',
                        marginBottom: '20px',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <CheckCircle2 size={16} />
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
                        fontSize: '13px',
                        fontWeight: '500',
                        marginBottom: '20px',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div style={{ marginBottom: '24px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#334155',
                        marginBottom: '10px',
                        textAlign: 'center'
                      }}
                    >
                      Enter 6-Digit Code
                    </label>
                    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
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
                          height: '54px',
                          textAlign: 'center',
                          fontSize: '28px',
                          fontWeight: '800',
                          letterSpacing: '12px',
                          color: '#0f172a',
                          background: '#f8fafc',
                          border: '2px solid #cbd5e1',
                          borderRadius: '12px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#2563eb';
                          e.target.style.background = '#ffffff';
                          e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.12)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cbd5e1';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
                      Code is valid for 10 minutes.
                    </p>
                  </div>

                  {/* Primary Verify CTA */}
                  <button
                    type="submit"
                    disabled={isVerifyingOtp || otpValue.trim().length !== 6}
                    style={{
                      width: '100%',
                      height: '50px',
                      borderRadius: '12px',
                      background: otpValue.trim().length === 6 ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#94a3b8',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '15.5px',
                      fontWeight: '700',
                      cursor: otpValue.trim().length === 6 && !isVerifyingOtp ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: otpValue.trim().length === 6 ? '0 8px 22px rgba(37, 99, 235, 0.25)' : 'none',
                      transition: 'all 0.2s ease',
                      marginBottom: '16px'
                    }}
                  >
                    {isVerifyingOtp ? (
                      <span className="btn-loading-flex">
                        <span className="btn-spinner" />
                        <span>Verifying code...</span>
                      </span>
                    ) : (
                      <>
                        <span>Verify & Launch Demo</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  {/* Resend and Back buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpStep(false);
                        setOtpValue('');
                        setOtpError('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      <ArrowLeft size={14} />
                      <span>Edit details</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isResendingOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendCooldown > 0 ? '#94a3b8' : '#2563eb',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      <RefreshCw size={13} className={isResendingOtp ? 'animate-spin' : ''} />
                      <span>
                        {isResendingOtp ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
            <form onSubmit={handleSubmit} noValidate>
                {/* 1. App Header Suite Banner (Exact Reference Match) */}
                <div className="demo-modal-app-header-banner">
                  <div className="demo-modal-app-left">
                    {/* Exact Website Card Icon Box */}
                    <div
                      className="one-need-icon-box"
                      style={{
                        backgroundColor: currentApp.bgColor || '#eff6ff',
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px'
                      }}
                    >
                      <img
                        src={currentApp.icon}
                        alt={`${currentApp.name} icon`}
                        className="one-need-icon-img"
                        style={{ width: '34px', height: '34px' }}
                        onError={(e) => {
                          e.currentTarget.src = `/apps/logo-${currentApp.slug}.png?v=clean`;
                        }}
                      />
                    </div>
                    <div className="demo-modal-app-meta">
                      <h3 className="demo-modal-suite-title">
                        {currentApp.suiteTitle}
                      </h3>
                      <p className="demo-modal-suite-desc">
                        {currentApp.suiteDesc}
                      </p>
                    </div>
                  </div>

                  {/* Change Selection Dropdown */}
                  <div className="demo-modal-change-wrap">
                    <button
                      type="button"
                      className="demo-modal-change-btn"
                      onClick={() => setChangeMenuOpen((prev) => !prev)}
                    >
                      <span>Change selection</span>
                      <ChevronDown
                        size={14}
                        className={changeMenuOpen ? 'rotate-chevron' : ''}
                      />
                    </button>

                    <AnimatePresence>
                      {changeMenuOpen && (
                        <motion.div
                          className="demo-modal-app-dropdown-menu"
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="app-dropdown-search-wrap">
                            <input
                              type="text"
                              className="app-dropdown-search-input"
                              placeholder="Search apps..."
                              value={searchAppQuery}
                              onChange={(e) => setSearchAppQuery(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="app-dropdown-scroll">
                            {filteredApps.map((a) => (
                              <button
                                key={a.slug}
                                type="button"
                                className={`app-dropdown-item ${a.slug === currentApp.slug ? 'active' : ''}`}
                                onClick={() => handleSelectApp(a)}
                              >
                                <div
                                  className="dropdown-item-icon-box"
                                  style={{ backgroundColor: a.bgColor }}
                                >
                                  <img
                                    src={a.icon}
                                    alt=""
                                    className="item-icon"
                                    onError={(e) => {
                                      e.currentTarget.src = `/apps/logo-${a.slug}.png?v=clean`;
                                    }}
                                  />
                                </div>
                                <div className="dropdown-item-meta">
                                  <span className="item-name">{a.name}</span>
                                  <span className="item-cat">{a.category}</span>
                                </div>
                                {a.slug === currentApp.slug && (
                                  <Check size={14} color="#00a3e0" strokeWidth={2.5} style={{ marginLeft: 'auto' }} />
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="demo-modal-error-banner">
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Form Fields Stack */}
                <div className="demo-modal-fields-stack">
                  {/* Full Name */}
                  <div className="demo-modal-form-group">
                    <label className="demo-modal-field-label">
                      Full name <span className="req-asterisk">*</span>
                    </label>
                    <div className="demo-modal-input-field-wrap">
                      <User size={18} className="field-adornment-icon" />
                      <input
                        type="text"
                        className="demo-modal-text-input"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Work Email + Phone Number */}
                  <div className="demo-modal-two-col-row">
                    <div className="demo-modal-form-group">
                      <label className="demo-modal-field-label">
                        Work email <span className="req-asterisk">*</span>
                      </label>
                      <div className="demo-modal-input-field-wrap">
                        <Mail size={18} className="field-adornment-icon" />
                        <input
                          type="email"
                          className="demo-modal-text-input"
                          placeholder="you@company.com"
                          value={workEmail}
                          onChange={(e) => {
                            setWorkEmail(e.target.value);
                            if (errorMessage) setErrorMessage('');
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="demo-modal-form-group">
                      <label className="demo-modal-field-label">
                        Phone number <span className="req-asterisk">*</span>
                      </label>
                      <div className="demo-modal-phone-group-wrap">
                        <div className="demo-modal-phone-prefix">
                          <Phone size={15} className="phone-adornment-icon" />
                          <span className="phone-code-val">+91</span>
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          className="demo-modal-phone-input"
                          placeholder="10-digit mobile number"
                          value={phoneNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setPhoneNumber(val);
                            if (errorMessage && val.length === 10) setErrorMessage('');
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Name (Max 8 letters or numbers with red indication) */}
                  <div className="demo-modal-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="demo-modal-field-label" style={{ marginBottom: 0 }}>
                        Company Name <span className="req-asterisk">*</span>
                      </label>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: '600',
                          color: (companyError || companyName.length >= 8) ? '#dc2626' : '#94a3b8',
                          transition: 'color 0.15s ease'
                        }}
                      >
                        {companyName.length}/8 max
                      </span>
                    </div>
                    <div
                      className="demo-modal-input-field-wrap"
                      style={{
                        borderColor: (companyError || companyName.length >= 8) ? '#ef4444' : undefined,
                        boxShadow: (companyError || companyName.length >= 8) ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : undefined
                      }}
                    >
                      <Building2
                        size={18}
                        className="field-adornment-icon"
                        style={{ color: (companyError || companyName.length >= 8) ? '#ef4444' : undefined }}
                      />
                      <input
                        type="text"
                        className="demo-modal-text-input"
                        placeholder="Enter company name (max 8 characters)"
                        value={companyName}
                        maxLength={8}
                        onKeyDown={handleCompanyKeyDown}
                        onChange={handleCompanyChange}
                        required
                      />
                    </div>

                    {/* Red Instruction Message when reaching 8 characters or attempting more */}
                    {companyError && (
                      <div
                        className="company-name-limit-instruction"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#dc2626',
                          marginTop: '6px',
                          lineHeight: 1.3
                        }}
                      >
                        <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                        <span>{companyError}</span>
                      </div>
                    )}

                    {/* Subdomain URL display with pencil edit button (.oxoo) - shows when company is typed */}
                    {cleanSubdomain && (
                      <div className="company-subdomain-preview-row">
                        <div className="company-subdomain-left">
                          {isEditingSubdomain ? (
                            <div className="company-subdomain-edit-wrap">
                              <input
                                type="text"
                                className="company-subdomain-edit-input"
                                value={customSubdomain || cleanSubdomain}
                                onChange={(e) => setCustomSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                autoFocus
                              />
                              <span className="subdomain-domain-suffix">.oxoo</span>
                            </div>
                          ) : (
                            <span className="company-subdomain-url">
                              {cleanSubdomain}.oxoo
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="company-subdomain-pencil-btn"
                          onClick={() => setIsEditingSubdomain((prev) => !prev)}
                          title={isEditingSubdomain ? 'Confirm subdomain' : 'Edit subdomain'}
                          aria-label="Edit subdomain"
                        >
                          <Pencil size={15} color="#58427c" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Country + Language */}
                  <div className="demo-modal-two-col-row">
                    <div className="demo-modal-form-group">
                      <label className="demo-modal-field-label">
                        Country <span className="req-asterisk">*</span>
                      </label>
                      <div className="demo-modal-select-field-wrap">
                        <Globe size={18} className="field-adornment-icon" />
                        <select
                          className="demo-modal-select-input"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="Singapore">Singapore</option>
                          <option value="France">France</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                        </select>
                        <ChevronDown size={15} className="select-dropdown-chevron" />
                      </div>
                    </div>

                    <div className="demo-modal-form-group">
                      <label className="demo-modal-field-label">
                        Language <span className="req-asterisk">*</span>
                      </label>
                      <div className="demo-modal-select-field-wrap">
                        <Languages size={18} className="field-adornment-icon" />
                        <select
                          className="demo-modal-select-input"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="French">French</option>
                          <option value="Spanish">Spanish</option>
                          <option value="German">German</option>
                          <option value="Arabic">Arabic</option>
                        </select>
                        <ChevronDown size={15} className="select-dropdown-chevron" />
                      </div>
                    </div>
                  </div>

                  {/* Primary CTA Button: Request My Demo ➔ */}
                  <button
                    type="submit"
                    className="demo-modal-primary-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="btn-loading-flex">
                        <span className="btn-spinner" />
                        <span>Sending verification code...</span>
                      </span>
                    ) : (
                      <span>Request My Demo ➔</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </main>

          <Footer />
        </>
      )}
    </div>
  );
}
