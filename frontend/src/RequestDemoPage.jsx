import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Zap,
  Briefcase,
  Users,
  BarChart3,
  Package,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Clock,
  Building2,
  Mail,
  Phone,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
  LifeBuoy,
  ExternalLink,
} from 'lucide-react';
import { Header, Footer } from './components';
import { submitDemoRequest } from './api';
import {
  LIVE_DEMO_LIST,
  DEMO_FLOW_CONFIG,
  getSafeDemoConfig,
  saveSelectedDemoId,
  getSavedSelectedDemoId,
  buildSafeDemoLaunchUrl,
} from './demoConfig';

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91 (India)' },
  { code: '+1', label: '🇺🇸 +1 (US / Canada)' },
  { code: '+44', label: '🇬🇧 +44 (UK)' },
  { code: '+971', label: '🇦🇪 +971 (UAE)' },
  { code: '+65', label: '🇸🇬 +65 (Singapore)' },
  { code: '+61', label: '🇦🇺 +61 (Australia)' },
  { code: '+49', label: '🇩🇪 +49 (Germany)' },
  { code: '+33', label: '🇫🇷 +33 (France)' },
  { code: '+81', label: '🇯🇵 +81 (Japan)' },
  { code: '+966', label: '🇸🇦 +966 (Saudi Arabia)' },
];

const COMPANY_SIZE_OPTIONS = [
  '1–10 employees',
  '11–50 employees',
  '51–200 employees',
  '201–500 employees',
  '501–1,000 employees',
  '1,000+ employees',
];

const PREFERRED_TIME_OPTIONS = [
  'Flexible / Any Time',
  '10:00 AM – 11:00 AM IST',
  '11:00 AM – 12:00 PM IST',
  '12:00 PM – 01:00 PM IST',
  '02:00 PM – 03:00 PM IST',
  '03:00 PM – 04:00 PM IST',
  '04:00 PM – 05:00 PM IST',
  '05:00 PM – 06:00 PM IST',
];

function renderDemoCategoryIcon(iconKey, size = 20, color = '#0284c7') {
  switch (iconKey) {
    case 'zap':
      return <Zap size={size} color={color} />;
    case 'briefcase':
      return <Briefcase size={size} color={color} />;
    case 'users':
      return <Users size={size} color={color} />;
    case 'bar-chart':
      return <BarChart3 size={size} color={color} />;
    case 'package':
      return <Package size={size} color={color} />;
    case 'globe':
      return <Globe size={size} color={color} />;
    default:
      return <Sparkles size={size} color={color} />;
  }
}

export default function RequestDemoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Resolve initial demo selection safely:
  // Priority 1: React Router location.state.selectedDemo
  // Priority 2: Validated ?demo= query parameter
  // Priority 3: Previously stored sessionStorage demo ID
  // Priority 4: Default to 'productivity-ai'
  const resolvedInitialDemoId = useMemo(() => {
    const fromState = getSafeDemoConfig(location.state?.selectedDemo);
    if (fromState) return fromState.id;

    const fromQuery = getSafeDemoConfig(searchParams.get('demo'));
    if (fromQuery) return fromQuery.id;

    const fromStorage = getSavedSelectedDemoId();
    if (fromStorage) return fromStorage;

    return 'productivity-ai';
  }, [location.state, searchParams]);

  // Form fields state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [interestedDemo, setInterestedDemo] = useState(resolvedInitialDemoId);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [requirements, setRequirements] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  // Validation & Submission state
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [demoUnavailableError, setDemoUnavailableError] = useState('');

  // Keep interestedDemo synchronized when user clicks a different footer link while on /request-demo
  useEffect(() => {
    const nextConfig =
      getSafeDemoConfig(location.state?.selectedDemo) ||
      getSafeDemoConfig(searchParams.get('demo'));
    if (nextConfig) {
      setInterestedDemo(nextConfig.id);
      saveSelectedDemoId(nextConfig.id);
      // If user clicks a new demo link after submitting a previous one, reset confirmation state
      setSubmissionResult(null);
      setSubmitError('');
      setDemoUnavailableError('');
    }
  }, [location.state?.selectedDemo, searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const selectedDemoConfig = useMemo(
    () => getSafeDemoConfig(interestedDemo) || LIVE_DEMO_LIST[0],
    [interestedDemo]
  );

  const handleDemoCategoryChange = (newDemoId) => {
    const valid = getSafeDemoConfig(newDemoId);
    if (!valid) return;
    setInterestedDemo(valid.id);
    saveSelectedDemoId(valid.id);
    setSearchParams({ demo: valid.id }, { replace: true });
    if (fieldErrors.interestedDemo) {
      setFieldErrors((prev) => ({ ...prev, interestedDemo: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedCompany = companyName.trim();
    const trimmedWebsite = companyWebsite.trim();

    if (!trimmedName || trimmedName.length < 2) {
      errors.fullName = 'Please enter your full name (at least 2 characters).';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail) {
      errors.email = 'Business email is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid business email address (e.g., name@company.com).';
    }

    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (!trimmedPhone) {
      errors.phone = 'Mobile number is required.';
    } else if (digitsOnly.length !== 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!trimmedCompany || trimmedCompany.length < 2) {
      errors.companyName = 'Company name is required.';
    }

    if (trimmedWebsite) {
      const websiteRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
      if (!websiteRegex.test(trimmedWebsite) || trimmedWebsite.toLowerCase().startsWith('javascript:')) {
        errors.companyWebsite = 'Please enter a valid website URL (e.g., https://yourcompany.com).';
      }
    }

    if (!getSafeDemoConfig(interestedDemo)) {
      errors.interestedDemo = 'Please select a valid PrimePro.ai product demo.';
    }

    if (!privacyConsent) {
      errors.privacyConsent = 'Please acknowledge the Privacy Policy to continue.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setDemoUnavailableError('');

    if (!validateForm()) {
      setSubmitError('Please review and complete the highlighted required fields below.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitDemoRequest({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        countryCode,
        phone: phone.trim(),
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim(),
        companySize,
        interestedDemo: selectedDemoConfig.id,
        preferredDate,
        preferredTime,
        requirements: requirements.trim(),
        privacyConsent: Boolean(privacyConsent),
        website_url_hp: honeypot,
      });

      // Persist verified demo session context so WebsiteDemoViewer opens smoothly when user clicks Continue to Demo
      if (DEMO_FLOW_CONFIG.grantViewerSessionOnSubmit) {
        try {
          sessionStorage.setItem('oxoo_demo_session_verified', 'true');
          localStorage.setItem('oxoo_demo_verified', 'true');
          localStorage.setItem('oxoo_demo_user', fullName.trim());
          localStorage.setItem('oxoo_demo_email', email.trim().toLowerCase());
          localStorage.setItem('oxoo_demo_company', companyName.trim());
          localStorage.setItem('oxoo_demo_app', selectedDemoConfig.appSlug);
        } catch (storageErr) {
          // Ignore storage restrictions
        }
      }

      setSubmissionResult({
        requestRef: response.requestRef || 'DEMO-2026',
        demoId: selectedDemoConfig.id,
        demoLabel: selectedDemoConfig.label,
        companyName: companyName.trim(),
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        message: response.message,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err.field) {
        setFieldErrors((prev) => ({ ...prev, [err.field]: err.message }));
      }
      setSubmitError(
        err.message || 'Unable to submit your demo request right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Open the Demo only when the user explicitly clicks "Continue to Demo"
  const handleContinueToDemo = () => {
    setDemoUnavailableError('');
    const targetDemoId = submissionResult?.demoId || selectedDemoConfig.id;
    const validConfig = getSafeDemoConfig(targetDemoId);

    if (!validConfig || !validConfig.route) {
      setDemoUnavailableError(
        'This interactive demo environment is temporarily unavailable. Please reach out to our solutions team for a live guided walkthrough.'
      );
      return;
    }

    const safeTargetUrl = buildSafeDemoLaunchUrl(validConfig.id, {
      companyName: submissionResult?.companyName || companyName,
      email: submissionResult?.email || email,
    });

    if (!safeTargetUrl) {
      setDemoUnavailableError(
        'The configured demo URL for this product could not be verified. Please contact support for assistance.'
      );
      return;
    }

    navigate(safeTargetUrl);
  };

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  return (
    <div className="request-demo-page-wrapper">
      <Header />

      <main className="request-demo-main" id="main-content">
        <div className="request-demo-container">
          {/* Selected Demo Header Banner */}
          <div className="request-demo-top-banner">
            <div className="request-demo-pill-row">
              <span className="request-demo-eyebrow-badge">
                <Sparkles size={14} /> LIVE INTERACTIVE DEMO & PERSONALIZED WALKTHROUGH
              </span>
            </div>

            <div className="request-demo-selected-card" role="region" aria-label="Selected Demo Product">
              <div
                className="request-demo-selected-icon"
                style={{
                  background: selectedDemoConfig.badgeBg,
                  borderColor: `${selectedDemoConfig.accentColor}33`,
                }}
              >
                {renderDemoCategoryIcon(selectedDemoConfig.iconKey, 26, selectedDemoConfig.accentColor)}
              </div>
              <div className="request-demo-selected-info">
                <div className="request-demo-selected-label-row">
                  <span className="request-demo-selected-tag">Selected Demo Category</span>
                  <span className="request-demo-selected-suite">{selectedDemoConfig.shortName}</span>
                </div>
                <h1 className="request-demo-title">{selectedDemoConfig.label} Live Demo</h1>
                <p className="request-demo-subtitle">{selectedDemoConfig.description}</p>
              </div>
            </div>
          </div>

          <div className="request-demo-grid">
            {/* Left Sidebar: Demo Selector & Highlights */}
            <aside className="request-demo-sidebar" aria-label="Demo Categories & Highlights">
              <div className="request-demo-side-card">
                <h2 className="request-demo-side-heading">Switch Demo Category</h2>
                <p className="request-demo-side-desc">
                  Choose any of the 6 core PrimePro.ai enterprise suites below to preselect your interactive demo:
                </p>
                <div className="request-demo-category-list" role="radiogroup" aria-label="Demo Categories">
                  {LIVE_DEMO_LIST.map((item) => {
                    const isActive = item.id === selectedDemoConfig.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        disabled={Boolean(submissionResult)}
                        onClick={() => handleDemoCategoryChange(item.id)}
                        className={`request-demo-category-btn ${isActive ? 'active' : ''}`}
                      >
                        <span
                          className="request-demo-category-icon"
                          style={{ background: item.badgeBg }}
                        >
                          {renderDemoCategoryIcon(item.iconKey, 16, item.accentColor)}
                        </span>
                        <span className="request-demo-category-label">{item.label}</span>
                        {isActive && <CheckCircle2 size={16} className="request-demo-category-check" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="request-demo-side-card">
                <h3 className="request-demo-side-heading">What You’ll Experience</h3>
                <ul className="request-demo-highlights-list">
                  {selectedDemoConfig.highlights.map((point, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="request-demo-trust-box">
                  <ShieldCheck size={20} color="#0284c7" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Enterprise Privacy & Security</strong>
                    <p>
                      Your information is encrypted and used strictly to configure your demo session and connect you with an PrimePro.ai specialist.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Main Panel: Form OR Step 4 Confirmation State */}
            <section className="request-demo-form-panel" aria-live="polite">
              {submissionResult ? (
                <div className="request-demo-confirmation-card" data-testid="demo-confirmation-card">
                  <div className="request-demo-confirm-icon-wrap">
                    <CheckCircle2 size={42} color="#16a34a" />
                  </div>
                  <span className="request-demo-confirm-ref">
                    Reference ID: {submissionResult.requestRef}
                  </span>
                  <h2 className="request-demo-confirm-title">
                    Your {submissionResult.demoLabel} Demo Request is Confirmed!
                  </h2>
                  <p className="request-demo-confirm-text">
                    Thank you, <strong>{submissionResult.fullName}</strong>. We have registered your request for{' '}
                    <strong>{submissionResult.companyName}</strong> and notified our solutions team. A confirmation has also been sent to{' '}
                    <strong>{submissionResult.email}</strong>.
                  </p>

                  <div className="request-demo-confirm-summary">
                    <div className="request-demo-confirm-summary-row">
                      <span>Selected Demo Suite:</span>
                      <strong>{submissionResult.demoLabel}</strong>
                    </div>
                    <div className="request-demo-confirm-summary-row">
                      <span>Organization:</span>
                      <strong>{submissionResult.companyName}</strong>
                    </div>
                    <div className="request-demo-confirm-summary-row">
                      <span>Interactive Environment:</span>
                      <strong style={{ color: '#16a34a' }}>Ready to Launch</strong>
                    </div>
                  </div>

                  {demoUnavailableError && (
                    <div className="request-demo-error-banner" role="alert" style={{ marginBottom: '20px' }}>
                      <AlertCircle size={18} style={{ flexShrink: 0 }} />
                      <div>
                        <strong>Demo Environment Unavailable</strong>
                        <p style={{ margin: '4px 0 10px 0' }}>{demoUnavailableError}</p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <Link to="/contact" className="request-demo-support-link">
                            Contact Sales Team →
                          </Link>
                          <Link to="/help-form" className="request-demo-support-link">
                            Submit Support Ticket →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="request-demo-confirm-actions">
                    <button
                      type="button"
                      onClick={handleContinueToDemo}
                      className="request-demo-continue-btn"
                      data-testid="continue-to-demo-btn"
                    >
                      <span>Continue to Demo ({submissionResult.demoLabel})</span>
                      <ArrowRight size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSubmissionResult(null);
                        setDemoUnavailableError('');
                      }}
                      className="request-demo-secondary-btn"
                    >
                      Request Another Demo
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="request-demo-form-card"
                  data-testid="demo-request-form"
                >
                  <div className="request-demo-form-header">
                    <h2>Request Access & Personalized Demo</h2>
                    <p>
                      Complete your details below to unlock the interactive{' '}
                      <strong>{selectedDemoConfig.label}</strong> environment and schedule a tailored walkthrough.
                    </p>
                  </div>

                  {submitError && (
                    <div className="request-demo-error-banner" role="alert" data-testid="demo-form-error-banner">
                      <AlertCircle size={18} style={{ flexShrink: 0 }} />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Honeypot field for bot/spam protection */}
                  <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
                    <label htmlFor="website_url_hp">Do not fill this field</label>
                    <input
                      id="website_url_hp"
                      name="website_url_hp"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <div className="request-demo-fields-grid">
                    {/* 1. Full Name (Required) */}
                    <div className="request-demo-field">
                      <label htmlFor="demo-full-name">
                        Full Name <span className="req-star">*</span>
                      </label>
                      <div className="request-demo-input-wrap">
                        <User size={16} className="request-demo-input-icon" />
                        <input
                          id="demo-full-name"
                          name="fullName"
                          type="text"
                          required
                          placeholder="e.g., Aarav Sharma"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: '' }));
                          }}
                          className={fieldErrors.fullName ? 'has-error' : ''}
                        />
                      </div>
                      {fieldErrors.fullName && (
                        <span className="request-demo-field-error">{fieldErrors.fullName}</span>
                      )}
                    </div>

                    {/* 2. Business Email (Required) */}
                    <div className="request-demo-field">
                      <label htmlFor="demo-business-email">
                        Business Email <span className="req-star">*</span>
                      </label>
                      <div className="request-demo-input-wrap">
                        <Mail size={16} className="request-demo-input-icon" />
                        <input
                          id="demo-business-email"
                          name="email"
                          type="email"
                          required
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                          }}
                          className={fieldErrors.email ? 'has-error' : ''}
                        />
                      </div>
                      {fieldErrors.email && (
                        <span className="request-demo-field-error">{fieldErrors.email}</span>
                      )}
                    </div>

                    {/* 3. Phone Number with Country Code (Required) */}
                    <div className="request-demo-field">
                      <label htmlFor="demo-phone">
                        Phone Number <span className="req-star">*</span>
                      </label>
                      <div className="request-demo-phone-group">
                        <select
                          id="demo-country-code"
                          name="countryCode"
                          aria-label="Country Code"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="request-demo-country-select"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <div className="request-demo-input-wrap" style={{ flex: 1 }}>
                          <Phone size={16} className="request-demo-input-icon" />
                          <input
                            id="demo-phone"
                            name="phone"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            required
                            placeholder="10-digit mobile number"
                            value={phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setPhone(val);
                              if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: '' }));
                            }}
                            className={fieldErrors.phone ? 'has-error' : ''}
                          />
                        </div>
                      </div>
                      {fieldErrors.phone && (
                        <span className="request-demo-field-error">{fieldErrors.phone}</span>
                      )}
                    </div>

                    {/* 4. Company Name (Required) */}
                    <div className="request-demo-field">
                      <label htmlFor="demo-company-name">
                        Company Name <span className="req-star">*</span>
                      </label>
                      <div className="request-demo-input-wrap">
                        <Building2 size={16} className="request-demo-input-icon" />
                        <input
                          id="demo-company-name"
                          name="companyName"
                          type="text"
                          required
                          placeholder="e.g., Acme Enterprises Pvt. Ltd."
                          value={companyName}
                          onChange={(e) => {
                            setCompanyName(e.target.value);
                            if (fieldErrors.companyName) setFieldErrors((p) => ({ ...p, companyName: '' }));
                          }}
                          className={fieldErrors.companyName ? 'has-error' : ''}
                        />
                      </div>
                      {fieldErrors.companyName && (
                        <span className="request-demo-field-error">{fieldErrors.companyName}</span>
                      )}
                    </div>

                    {/* 5. Company Website (Optional) */}
                    <div className="request-demo-field">
                      <label htmlFor="demo-company-website">
                        Company Website <span className="opt-tag">(Optional)</span>
                      </label>
                      <div className="request-demo-input-wrap">
                        <Globe size={16} className="request-demo-input-icon" />
                        <input
                          id="demo-company-website"
                          name="companyWebsite"
                          type="url"
                          placeholder="https://yourcompany.com"
                          value={companyWebsite}
                          onChange={(e) => {
                            setCompanyWebsite(e.target.value);
                            if (fieldErrors.companyWebsite) setFieldErrors((p) => ({ ...p, companyWebsite: '' }));
                          }}
                          className={fieldErrors.companyWebsite ? 'has-error' : ''}
                        />
                      </div>
                      {fieldErrors.companyWebsite && (
                        <span className="request-demo-field-error">{fieldErrors.companyWebsite}</span>
                      )}
                    </div>

                    {/* 6. Company Size (Selectable Options) */}
                    <div className="request-demo-field">
                      <label htmlFor="demo-company-size">
                        Company Size <span className="opt-tag">(Selectable)</span>
                      </label>
                      <select
                        id="demo-company-size"
                        name="companySize"
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="request-demo-select"
                      >
                        <option value="">Select company size...</option>
                        {COMPANY_SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 7. Interested Product / Demo (Preselected from clicked link) */}
                    <div className="request-demo-field full-span">
                      <label htmlFor="demo-interested-product">
                        Interested Product / Demo <span className="req-star">*</span>
                      </label>
                      <select
                        id="demo-interested-product"
                        name="interestedDemo"
                        required
                        value={selectedDemoConfig.id}
                        onChange={(e) => handleDemoCategoryChange(e.target.value)}
                        className={`request-demo-select highlight-select ${fieldErrors.interestedDemo ? 'has-error' : ''}`}
                      >
                        {LIVE_DEMO_LIST.map((demo) => (
                          <option key={demo.id} value={demo.id}>
                            {demo.label} — {demo.shortName}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.interestedDemo && (
                        <span className="request-demo-field-error">{fieldErrors.interestedDemo}</span>
                      )}
                    </div>

                    {/* 8. Preferred Date (Optional) */}
                    <div className="request-demo-field">
                      <label htmlFor="demo-preferred-date">
                        Preferred Date <span className="opt-tag">(Optional)</span>
                      </label>
                      <div className="request-demo-input-wrap">
                        <Calendar size={16} className="request-demo-input-icon" />
                        <input
                          id="demo-preferred-date"
                          name="preferredDate"
                          type="date"
                          min={todayIso}
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* 9. Preferred Time (Optional) */}
                    <div className="request-demo-field">
                      <label htmlFor="demo-preferred-time">
                        Preferred Time <span className="opt-tag">(Optional)</span>
                      </label>
                      <div className="request-demo-input-wrap">
                        <Clock size={16} className="request-demo-input-icon" />
                        <select
                          id="demo-preferred-time"
                          name="preferredTime"
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="request-demo-select with-left-icon"
                        >
                          <option value="">Select preferred time slot...</option>
                          {PREFERRED_TIME_OPTIONS.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 10. Requirements / Message (Optional) */}
                    <div className="request-demo-field full-span">
                      <label htmlFor="demo-requirements">
                        Requirements / Message <span className="opt-tag">(Optional)</span>
                      </label>
                      <textarea
                        id="demo-requirements"
                        name="requirements"
                        rows={3}
                        placeholder="Tell us about your current workflows, number of users, or specific modules you want to evaluate..."
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        className="request-demo-textarea"
                      />
                    </div>

                    {/* 11. Privacy Policy Acknowledgement (Required) */}
                    <div className="request-demo-field full-span">
                      <label className="request-demo-consent-label" htmlFor="demo-privacy-consent">
                        <input
                          id="demo-privacy-consent"
                          name="privacyConsent"
                          type="checkbox"
                          required
                          checked={privacyConsent}
                          onChange={(e) => {
                            setPrivacyConsent(e.target.checked);
                            if (fieldErrors.privacyConsent) {
                              setFieldErrors((p) => ({ ...p, privacyConsent: '' }));
                            }
                          }}
                        />
                        <span>
                          I agree to the{' '}
                          <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">
                            PrimePro.ai Privacy Policy
                          </Link>{' '}
                          and consent to being contacted regarding my live demo request and product evaluation.{' '}
                          <span className="req-star">*</span>
                        </span>
                      </label>
                      {fieldErrors.privacyConsent && (
                        <span className="request-demo-field-error">{fieldErrors.privacyConsent}</span>
                      )}
                    </div>
                  </div>

                  <div className="request-demo-submit-row">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="request-demo-submit-btn"
                      data-testid="submit-demo-request-btn"
                    >
                      <span>
                        {isSubmitting
                          ? 'Submitting Request...'
                          : `Submit & Unlock ${selectedDemoConfig.label} Demo`}
                      </span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

