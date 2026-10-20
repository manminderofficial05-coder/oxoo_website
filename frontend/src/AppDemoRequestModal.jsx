import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Mail, Phone, Building2, Globe, Languages, Check, ArrowRight,
  ChevronDown, Sparkles, CheckCircle2, Pencil, AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ALL_SYSTEM_APPS, getAppMeta } from './appMetaHelper';
import { submitLead } from './api';
import DemoCelebrationLaunch from './DemoCelebrationLaunch';
import CompanyBrandLogo from './CompanyBrandLogo';

export default function AppDemoRequestModal({
  isOpen,
  onClose,
  app = null,
  onSuccess
}) {
  const navigate = useNavigate();

  // Current selected app for demo
  const [currentApp, setCurrentApp] = useState(() => getAppMeta(app));
  const [changeMenuOpen, setChangeMenuOpen] = useState(false);

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

  // Derived subdomain (empty until company name is typed)
  const cleanSubdomain = (
    customSubdomain.trim() ||
    companyName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  // Sync prop changes
  useEffect(() => {
    if (app) {
      setCurrentApp(getAppMeta(app));
    }
  }, [app]);

  // Reset states when opened (empty form)
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setShowCelebration(false);
      setErrorMessage('');
      setCompanyError('');
      setChangeMenuOpen(false);
      setFullName('');
      setWorkEmail('');
      setPhoneNumber('');
      setCompanyName('');
      setCustomSubdomain('');
      setIsEditingSubdomain(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCelebrationComplete = () => {
    const targetPath = `/apps/${currentApp.slug}/live-demo?company=${encodeURIComponent(`${cleanSubdomain}.oxoo`)}`;
    onClose();
    if (onSuccess) {
      onSuccess(currentApp);
    } else {
      navigate(targetPath);
    }
  };

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Handle Form Submission
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
      setErrorMessage('Please provide your company name.');
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
      // 1. Submit lead details to backend (graceful fallback if offline)
      await submitLead({
        name: fullName.trim(),
        email: cleanEmail,
        phone: `+91 ${cleanPhone}`,
        company: `${cleanSubdomain}.oxoo`,
        country,
        language,
        app: currentApp.name,
        slug: currentApp.slug,
        source: 'app-showcase-demo-modal'
      }).catch(() => null);

      // 2. Persist demo company & user to localStorage
      try {
        localStorage.setItem('oxoo_demo_user', fullName.trim());
        localStorage.setItem('oxoo_demo_email', cleanEmail);
        localStorage.setItem('oxoo_demo_company', `${cleanSubdomain}.oxoo`);
        localStorage.setItem('oxoo_demo_app', currentApp.slug);
      } catch (err) {}

      // 3. Launch full page continuous fireworks & typewriter celebration!
      setShowCelebration(true);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Something went wrong. Launching celebration directly...');
      setShowCelebration(true);
    }
  };

  const modalMarkup = (
    <AnimatePresence mode="wait">
      {showCelebration ? (
        <DemoCelebrationLaunch
          key="celebration"
          appName={currentApp.name}
          companyName={cleanSubdomain}
          onComplete={handleCelebrationComplete}
        />
      ) : (
        <div className="demo-modal-overlay-backdrop" onClick={onClose} key="form-modal">
        <motion.div
          className="demo-request-modal-card demo-unique-open"
          style={{ transformOrigin: '50% 100%', perspective: 1200 }}
          initial={{ opacity: 0, rotateX: -24, y: 60, scale: 0.9, clipPath: 'circle(0% at 50% 100%)' }}
          animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1, clipPath: 'circle(150% at 50% 100%)' }}
          exit={{ opacity: 0, rotateX: 14, y: 40, scale: 0.92, clipPath: 'circle(0% at 50% 100%)' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close X Button */}
          <button
            type="button"
            className="demo-modal-close-btn"
            onClick={onClose}
            aria-label="Close demo form"
          >
            <X size={20} />
          </button>

          <form onSubmit={handleSubmit} noValidate>
              {/* App Header Suite Banner */}
              <div className="demo-modal-app-header-banner">
                <div className="demo-modal-app-left">
                  <div
                    className="one-need-icon-box"
                    style={{
                      backgroundColor: currentApp.bgColor || '#eff6ff',
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px'
                    }}
                  >
                    <img
                      src={currentApp.icon}
                      alt={`${currentApp.name} icon`}
                      className="one-need-icon-img"
                      style={{ width: '32px', height: '32px' }}
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

                <div className="demo-modal-change-wrap">
                  <button
                    type="button"
                    className="demo-modal-change-btn"
                    onClick={() => setChangeMenuOpen((prev) => !prev)}
                  >
                    <span>Change selection</span>
                    <ChevronDown size={14} className={changeMenuOpen ? 'rotate-chevron' : ''} />
                  </button>

                  {/* App Switcher Dropdown */}
                  <AnimatePresence>
                    {changeMenuOpen && (
                      <motion.div
                        className="demo-modal-app-dropdown-menu"
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="app-dropdown-scroll">
                          {ALL_SYSTEM_APPS.map((a) => (
                            <button
                              key={a.slug}
                              type="button"
                              className={`app-dropdown-item ${a.slug === currentApp.slug ? 'active' : ''}`}
                              onClick={() => {
                                setCurrentApp(a);
                                setChangeMenuOpen(false);
                              }}
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
                              <span className="item-name">{a.name}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="demo-modal-error-banner">
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Input Groups */}
              <div className="demo-modal-fields-stack">
                {/* 1. Full Name */}
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

                {/* 2. Work Email + Phone Number (2 Columns) */}
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

                {/* 3. Company Name (Max 8 letters or numbers with red indication) */}
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

                {/* 4. Country + Language (2 Columns) */}
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

                {/* 6. Primary CTA Button: Request My Demo -> */}
                <button
                  type="submit"
                  className="demo-modal-primary-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="btn-loading-flex">
                      <span className="btn-spinner" />
                      <span>Setting up your demo...</span>
                    </span>
                  ) : (
                    <span>Request My Demo ➔</span>
                  )}
                </button>
              </div>
            </form>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalMarkup, document.body);
  }
  return modalMarkup;
}
