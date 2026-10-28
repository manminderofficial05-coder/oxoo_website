import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Search, ChevronDown, Menu, X, Globe2, Sparkles, Layers3, User, ShieldCheck,
  LogOut, LayoutDashboard, CreditCard, Code2, Plug, Headset, Check, Star, Play, Calendar, Mail, Phone, MessageSquare,
  Users, Package, ExternalLink, RotateCcw
} from 'lucide-react';
import { categories, services, industries } from './data';
import { getAppMeta } from './appMetaHelper';
import { useRegionPricing } from './RegionPricingContext';
import { authStorage } from './authStorage';

// Configured HRMS Employee Login URL from environment configuration
const HRMS_EMPLOYEE_LOGIN_URL =
  import.meta.env.VITE_HRMS_EMPLOYEE_LOGIN_URL || 'https://oxoo-finance.onrender.com/';

export function Logo({ light = false, withTagline = false, stacked = false, iconOnly = false, className = '' }) {
  let src = '/oxoo-logo.png';
  if (iconOnly) {
    src = '/oxoo-icon.png';
  } else if (light) {
    src = '/oxoo-logo-white.png';
  } else {
    src = '/oxoo-logo.png';
  }

  return (
    <Link className={`brand ${light ? 'brand-light' : ''} ${className}`} to="/" aria-label="Oxoo Home">
      <img
        src={src}
        alt="Oxoo"
        className={`brand-logo-img ${stacked ? 'logo-stacked' : ''} ${iconOnly ? 'logo-icon-only' : ''}`}
      />
    </Link>
  );
}

export function AnimatedHeroTitle() {
  const [animKey, setAnimKey] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const { currentRegion, formatPrice } = useRegionPricing();

  useEffect(() => {
    setIsFinished(false);
    const timer = setTimeout(() => {
      setIsFinished(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, [animKey]);

  const handleReplay = (e) => {
    e.stopPropagation();
    setIsFinished(false);
    setAnimKey((k) => k + 1);
  };

  return (
    <div
      className="hero-animated-title-wrap"
    >
      <div key={animKey} className={`handwriting-title-board ${isFinished ? 'finished' : 'animating'}`}>
        {/* Line 1: 'Your Whole Business' */}
        <div className="hand-row row-1">
          <div className="hand-text-clip clip-line-1">
            <span className="hand-text text-navy">Your Whole Business</span>
          </div>
          <span className="hand-pen pen-line-1" aria-hidden="true" />
        </div>

        {/* Line 2: 'on One Platform.' (Multi-colored with green & blue gradients) */}
        <div className="hand-row row-2">
          {/* Green accent spark decor on left */}
          <span className="spark-decor spark-left" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M4 18 L18 10 M8 22 L22 14" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </svg>
          </span>

          <div className="hand-text-clip clip-line-2">
            <span className="hand-text text-navy word-on">on </span>
            <span className="hand-text word-one">One</span>{' '}
            <span className="hand-text word-platform">Platform.</span>
          </div>

          {/* Green accent spark decor on right */}
          <span className="spark-decor spark-right" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M6 10 L20 18 M2 14 L16 22" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </svg>
          </span>

          {/* Vibrant Multi-Color Brush Underlines */}
          <div className="brush-underlines-wrap" aria-hidden="true">
            <span className="brush-pill brush-green" />
            <span className="brush-pill brush-blue" />
          </div>

          <span className="hand-pen pen-line-2" aria-hidden="true" />
        </div>

        {/* Line 3: 'Simple, powerful, ready to grow.' with red highlighter & shifted arrow callout */}
        <div className="row-3-anchor-wrapper">
          <div className="hand-row row-3">
            <div className="hand-text-clip clip-line-3">
              <span className="hand-text text-subtitle">
                Simple, powerful, ready to{' '}
                <span className="word-grow-container">
                  <span className="word-grow-text">grow.</span>
                  <span className="grow-red-highlighter" aria-hidden="true">
                    <svg viewBox="0 0 96 16" preserveAspectRatio="none" className="grow-highlighter-svg">
                      <path
                        d="M 4 9 C 28 5, 68 5, 92 10"
                        stroke="#ef4444"
                        strokeWidth="7.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </span>
              </span>
              <span className="subtitle-flick" aria-hidden="true">
                <svg viewBox="0 0 30 16" width="26" height="14">
                  <path d="M4 13 Q 16 6, 26 2" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </div>
            <span className="hand-pen pen-line-3" aria-hidden="true" />
          </div>

          {/* Hand-drawn Arrow & Price Callout: shifted to the right, directly after 'grow.' */}
          <div className="hero-price-annotation">
            <svg className="price-drawn-arrow" viewBox="0 0 95 80" fill="none" aria-hidden="true">
              <path
                d="M 8 10 C 35 14, 68 28, 84 60"
                stroke="#58355e"
                strokeWidth="3.8"
                strokeLinecap="round"
              />
              <path
                d="M 64 50 L 84 60 L 80 40"
                stroke="#58355e"
                strokeWidth="3.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="price-hand-copy">
              <span className="price-headline">
                {formatPrice(currentRegion.plans.singleApp.yearlyPrice)} / month
              </span>
              <span className="price-subline">for ALL apps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CountryCurrencySelector({ isMobile = false }) {
  const {
    currentRegion,
    detectedRegion,
    isManualOverride,
    selectableRegions,
    setCountry,
    resetToDetected
  } = useRegionPricing();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleSelect = (code) => {
    setCountry(code, true);
    setIsOpen(false);
  };

  const handleReset = (e) => {
    e.stopPropagation();
    resetToDetected();
    setIsOpen(false);
  };

  return (
    <div className={`nav-country-selector-wrap ${isMobile ? 'is-mobile' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        className={`nav-country-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Select Country and Currency"
        title={`Selected Region: ${currentRegion.countryName} (${currentRegion.currency} ${currentRegion.symbol})`}
      >
        <span className="country-flag" role="img" aria-label={currentRegion.countryName}>
          {currentRegion.flag}
        </span>
        <span className="country-code-label">
          {currentRegion.regionCode === 'GLOBAL' ? 'INTL' : currentRegion.regionCode}
        </span>
        <span className="country-currency-pill">
          {currentRegion.currency} {currentRegion.symbol}
        </span>
        <ChevronDown size={12} className={`country-caret ${isOpen ? 'rotate' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="nav-country-dropdown-menu"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <div className="nav-country-menu-header">
              <span className="country-menu-title">Select Region & Currency</span>
              <span className="country-detected-note">
                Detected: {detectedRegion.flag} {detectedRegion.countryName}
              </span>
            </div>

            {isManualOverride && (
              <button
                type="button"
                className="nav-country-reset-btn"
                onClick={handleReset}
              >
                <RotateCcw size={12} />
                <span>Reset to detected ({detectedRegion.flag} {detectedRegion.countryName})</span>
              </button>
            )}

            <div className="nav-country-options-list" role="listbox">
              {selectableRegions.map((reg) => {
                const isSelected = currentRegion.regionCode === reg.code;
                return (
                  <button
                    key={reg.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`nav-country-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(reg.code)}
                  >
                    <span className="opt-flag">{reg.flag}</span>
                    <span className="opt-name">{reg.label}</span>
                    {isSelected && <Check size={14} className="opt-check-icon" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LanguageSelector() {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const langRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    if (langOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [langOpen]);

  return (
    <div className="nav-lang-selector-wrap" ref={langRef}>
      <button
        type="button"
        className={`nav-lang-btn ${langOpen ? 'open' : ''}`}
        onClick={() => setLangOpen(!langOpen)}
        aria-expanded={langOpen}
        aria-label="Select Language"
        title="Language"
      >
        <Globe2 size={13} className="lang-icon" />
        <span className="lang-code">{selectedLang}</span>
        <ChevronDown size={11} className={`lang-caret ${langOpen ? 'rotate' : ''}`} />
      </button>

      <AnimatePresence>
        {langOpen && (
          <motion.div
            className="nav-lang-dropdown-menu"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {[
              { code: 'EN', label: 'English (US)' },
              { code: 'HI', label: 'हिन्दी (Hindi)' },
              { code: 'ES', label: 'Español (Spanish)' },
              { code: 'AR', label: 'العربية (Arabic)' },
              { code: 'FR', label: 'Français (French)' }
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                className={`nav-lang-option-item ${selectedLang === l.code ? 'selected' : ''}`}
                onClick={() => { setSelectedLang(l.code); setLangOpen(false); }}
              >
                <span>{l.label}</span>
                {selectedLang === l.code && <Check size={13} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const [openApps, setOpenApps] = useState(false);
  const [appsPinned, setAppsPinned] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const readUser = () => {
      try {
        const user = authStorage.getCustomerUser();
        const token = authStorage.getCustomerToken();
        if (user && token) {
          setCurrentUser(user);
          return;
        }
        const adminUser = authStorage.getAdminUser();
        const adminToken = authStorage.getAdminToken();
        if (adminUser && adminToken) {
          setCurrentUser({ ...adminUser, role: 'admin' });
          return;
        }
        setCurrentUser(null);
      } catch (e) {
        setCurrentUser(null);
      }
    };
    readUser();
    window.addEventListener('oxoo_auth_change', readUser);
    window.addEventListener('oxoo_admin_auth_change', readUser);
    return () => {
      window.removeEventListener('oxoo_auth_change', readUser);
      window.removeEventListener('oxoo_admin_auth_change', readUser);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    authStorage.clearAll();
    setCurrentUser(null);
    setProfileOpen(false);
    window.dispatchEvent(new Event('oxoo_auth_change'));
    window.dispatchEvent(new Event('oxoo_admin_auth_change'));
    navigate('/');
  };

  const closeTimeoutRef = useRef(null);
  const appsBtnRef = useRef(null);
  const megaMenuRef = useRef(null);

  const filtered = services
    .filter(s => `${s.name} ${s.category}`.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 10);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const closeAll = () => {
    clearCloseTimeout();
    setOpenApps(false);
    setAppsPinned(false);
    setProfileOpen(false);
    setMobile(false);
    setSearchQuery('');
  };

  // Close menus on route change
  useEffect(() => {
    closeAll();
  }, [location.pathname]);

  // Click outside listener: clicking anywhere outside closes the menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        openApps &&
        appsBtnRef.current &&
        !appsBtnRef.current.contains(e.target) &&
        megaMenuRef.current &&
        !megaMenuRef.current.contains(e.target)
      ) {
        setOpenApps(false);
        setAppsPinned(false);
      }
      if (profileOpen && !e.target.closest('.nav-profile-dropdown')) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearCloseTimeout();
    };
  }, [openApps, profileOpen]);

  // Hover handlers for Apps button and Mega Menu box
  const handleAppsMouseEnter = () => {
    clearCloseTimeout();
    setOpenApps(true);
  };

  const handleAppsMouseLeave = () => {
    if (appsPinned) return;
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setOpenApps(false);
    }, 280);
  };

  const handleMenuMouseEnter = () => {
    clearCloseTimeout();
    setOpenApps(true);
  };

  const handleMenuMouseLeave = () => {
    if (appsPinned) return;
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setOpenApps(false);
    }, 280);
  };

  // Click toggle on Apps button
  const handleAppsClick = (e) => {
    e.stopPropagation();
    clearCloseTimeout();
    if (openApps && appsPinned) {
      setOpenApps(false);
      setAppsPinned(false);
    } else {
      setOpenApps(true);
      setAppsPinned(true);
    }
  };

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Logo />

        <nav className="desktop-nav">
          {/* Apps Dropdown Button */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={handleAppsMouseEnter}
            onMouseLeave={handleAppsMouseLeave}
          >
            <button
              ref={appsBtnRef}
              className={`nav-link ${openApps ? 'active' : ''}`}
              onClick={handleAppsClick}
              aria-expanded={openApps}
            >
              Apps <ChevronDown size={13} className={`caret ${openApps ? 'rotate' : ''}`} />
            </button>
          </div>

          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/industries"
            onMouseEnter={() => {
              if (!appsPinned) setOpenApps(false);
            }}
          >
            Industries
          </NavLink>

          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/services"
            onMouseEnter={() => {
              if (!appsPinned) setOpenApps(false);
            }}
          >
            Community
          </NavLink>

          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/pricing"
            onMouseEnter={() => {
              if (!appsPinned) setOpenApps(false);
            }}
          >
            Pricing
          </NavLink>

          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/help"
            onMouseEnter={() => {
              if (!appsPinned) setOpenApps(false);
            }}
          >
            Help
          </NavLink>
        </nav>

        {/* Right Action Items: Country & Language Selectors, Customer Login & Admin Login OR Profile */}
        <div className="nav-actions">
          <CountryCurrencySelector />
          <LanguageSelector />
          {currentUser ? (
            <div className="nav-profile-dropdown">
              <button
                type="button"
                className={`nav-profile-btn ${currentUser.role === 'admin' ? 'is-admin' : 'is-customer'}`}
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
              >
                <div className="nav-profile-avatar">
                  {currentUser.role === 'admin' ? <ShieldCheck size={15} /> : <User size={15} />}
                  <span className="nav-profile-status-dot" />
                </div>
                <div className="nav-profile-info">
                  <span className="nav-profile-name">{currentUser.name || 'Account'}</span>
                  <span className="nav-profile-badge">
                    {currentUser.role === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                </div>
                <ChevronDown size={14} className={`nav-profile-caret ${profileOpen ? 'rotate' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className="nav-profile-menu"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                  >
                    <div className="nav-profile-menu-header">
                      <div className="nav-profile-menu-avatar">
                        {currentUser.role === 'admin' ? '🛡️' : '👤'}
                      </div>
                      <div className="nav-profile-menu-meta">
                        <div className="nav-profile-menu-name">{currentUser.name}</div>
                        <div className="nav-profile-menu-email">{currentUser.email}</div>
                        <div className="nav-profile-menu-org">
                          {currentUser.organization || (currentUser.role === 'admin' ? 'Oxoo Core Platform' : 'Client Organization')}
                        </div>
                      </div>
                    </div>

                    <div className="nav-profile-menu-divider" />

                    {currentUser.role === 'admin' ? (
                      <>
                        <Link
                          to="/admin"
                          className="nav-profile-menu-item"
                          onClick={() => setProfileOpen(false)}
                        >
                          <LayoutDashboard size={15} />
                          <span>Admin Governance Console</span>
                        </Link>
                        <Link
                          to="/dashboard"
                          className="nav-profile-menu-item"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User size={15} />
                          <span>View Customer Portal</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/dashboard"
                          className="nav-profile-menu-item"
                          onClick={() => setProfileOpen(false)}
                        >
                          <LayoutDashboard size={15} />
                          <span>Customer Portal Dashboard</span>
                        </Link>
                        <Link
                          to="/dashboard"
                          className="nav-profile-menu-item"
                          onClick={() => setProfileOpen(false)}
                        >
                          <CreditCard size={15} />
                          <span>Billing & Subscriptions</span>
                        </Link>
                      </>
                    )}

                    <div className="nav-profile-menu-divider" />

                    <button
                      type="button"
                      className="nav-profile-menu-item nav-profile-logout-btn"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="nav-customer-login-btn"
              title="Customer Sign In"
            >
              <User size={15} />
              <span>Customer Login</span>
            </Link>
          )}

          <button
            className="mobile-toggle"
            onClick={() => setMobile(!mobile)}
            aria-label="Toggle Navigation Menu"
          >
            {mobile ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {openApps && (
          <motion.div
            className="mega-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAll}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
          >
            <motion.div
              ref={megaMenuRef}
              className="mega-menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
            >
              <div className="mega-top">
                <div className="mega-title-block">
                  <span className="eyebrow">OXOO.AI BUSINESS SUITE</span>
                  <h3>{searchQuery ? `Search results for "${searchQuery}"` : 'Explore All Apps & Services'}</h3>
                </div>
                <div className="mega-search-box">
                  <Search size={16} />
                  <input
                    placeholder="Search for apps, services or solutions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {searchQuery && (
                    <button className="clear-btn" onClick={() => setSearchQuery('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>
                <Link to="/apps" onClick={closeAll} className="text-link">
                  View full apps directory <ArrowRight size={15} />
                </Link>
              </div>

              {searchQuery ? (
                <div className="mega-results">
                  {filtered.length > 0 ? (
                    filtered.map((s) => {
                      const meta = getAppMeta(s.name);
                      return (
                        <Link
                          key={s.slug}
                          to={`/apps/${s.slug || meta.slug}`}
                          onClick={closeAll}
                          className="mega-result-card"
                        >
                          <img
                            src={meta.icon}
                            alt={s.name}
                            className="mega-app-icon-result"
                            style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 4 }}
                          />
                          <div>
                            <b>{s.name}</b>
                            <small>{s.category}</small>
                          </div>
                          <ArrowRight size={14} className="arr" />
                        </Link>
                      );
                    })
                  ) : (
                    <div className="mega-no-results">
                      <p>No apps or services found for "{searchQuery}".</p>
                      <Link to="/services" onClick={closeAll} className="button button-outline button-small">
                        Browse all categories
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mega-grid">
                  {categories.map((cat) => (
                    <section key={cat.name} className="mega-category">
                      <h4 className={`accent-${cat.color}`}>
                        {cat.name}
                      </h4>
                      <ul className="mega-list">
                        {cat.services.map((name) => {
                          const s = services.find((x) => x.name === name) || { slug: name.toLowerCase().replace(/\s+/g, '-') };
                          const meta = getAppMeta(name);
                          return (
                            <li key={name}>
                              <Link to={`/apps/${s.slug || meta.slug}`} onClick={closeAll} className="mega-app-link">
                                <img src={meta.icon} alt={name} className="mega-app-icon" />
                                <span className="mega-app-name">{name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))}
                </div>
              )}

              <div className="mega-footer">
                <Link to="/services" onClick={closeAll}>
                  <Layers3 size={17} /> View All Services
                </Link>
                <Link to="/services/custom-software-development" onClick={closeAll}>
                  <Code2 size={17} /> Custom Development
                </Link>
                <a href="#integrations" onClick={closeAll}>
                  <Plug size={17} /> Integrations
                </a>
                <Link to="/contact" onClick={closeAll}>
                  <Headset size={17} /> Contact Sales
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mobile-search">
              <Search size={16} />
              <input
                placeholder="Search solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    closeAll();
                    navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
                  }
                }}
              />
            </div>
            {/* Mobile Logged-in User Profile Card */}
            {currentUser && (
              <div className="mobile-profile-card">
                <div className="mobile-profile-avatar">
                  {currentUser.role === 'admin' ? <ShieldCheck size={18} /> : <User size={18} />}
                </div>
                <div className="mobile-profile-text">
                  <b>{currentUser.name}</b>
                  <small>{currentUser.email}</small>
                  <span className={`mobile-role-tag ${currentUser.role === 'admin' ? 'admin' : 'customer'}`}>
                    {currentUser.role === 'admin' ? '🛡️ Administrator' : '🏢 Customer'}
                  </span>
                </div>
                <button
                  type="button"
                  className="mobile-logout-btn"
                  onClick={() => { closeAll(); handleLogout(); }}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}



            <div className="mobile-country-select-row" style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                Region & Pricing
              </div>
              <CountryCurrencySelector isMobile={true} />
            </div>

            {[
              ['Home', '/'],
              ['All Apps & Services', '/services'],
              ['Industries We Serve', '/industries'],
              ['Pricing Plans', '/pricing'],
              ['Help & Support', '/help'],
              ...(currentUser
                ? [
                    [currentUser.role === 'admin' ? 'Admin Console' : 'Customer Dashboard', currentUser.role === 'admin' ? '/admin' : '/dashboard']
                  ]
                : [
                    ['Customer Login', '/login']
                  ]),
              ['Book a Demo / Contact', '/contact']
            ].map(([n, p]) => (
              <Link key={n} to={p} onClick={closeAll} className="mobile-link">
                <span>{n}</span>
                <ArrowRight size={16} />
              </Link>
            ))}
            <div className="mobile-actions">
              <Link to="/contact" onClick={closeAll} className="button button-emerald full-button">
                Get a Free Quote
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer" id="resources">
      <div className="footer-main">
        <div className="footer-about">
          <Logo withTagline={true} />
          <p>
            One Intelligent Platform. Every Business. Powering 10,000+ businesses worldwide with connected AI-driven software, professional implementation, and ongoing care.
          </p>
          <div className="footer-contact-pills">
            <span><Phone size={13} /> +91 79 4050 0100</span>
            <span><Mail size={13} /> hello@oxoo.ai</span>
          </div>
          <div className="footer-social">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">𝕏</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">gh</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">ig</a>
          </div>
        </div>

        <div>
          <h4>Solutions</h4>
          <Link to="/services">All Services</Link>
          <Link to="/services/crm">CRM</Link>
          <Link to="/services/accounting">Accounting & GST</Link>
          <Link to="/services/hrms">HRMS & Payroll</Link>
          <Link to="/services/inventory-management">Inventory Management</Link>
          <Link to="/services/ai-automation">AI Automation</Link>
        </div>

        <div>
          <h4>Live Demos</h4>
          <Link to="/demo/ai-demo">⚡ Productivity & AI</Link>
          <Link to="/demo/sales-demo">💼 Sales & CRM</Link>
          <Link to="/demo/hrms-demo">👥 Human Resources</Link>
          <Link to="/demo/finance-demo">📊 Finance & GST</Link>
          <Link to="/demo/supply-chain-demo">📦 Supply Chain & Operations</Link>
          <Link to="/demo/website-builder-demo">🌐 Website Builder</Link>
        </div>

        <div>
          <h4>Company & Plans</h4>
          <Link to="/pricing">Pricing Plans</Link>
          <Link to="/help">Help & Support</Link>
          <Link to="/help-form">Submit a Ticket</Link>
          <Link to="/demo">Request Full Demo</Link>
          <Link to="/contact">Contact Sales</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Oxoo.ai Inc. All rights reserved.</span>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#security">Security</a>
          <a href="#compliance">ISO 27001 Certified</a>
        </div>
        <span className="footer-status">
          <i /> All cloud services 99.99% operational
        </span>
      </div>
    </footer>
  );
}

export function SectionHeading({ eyebrow, title, description, center = false }) {
  return (
    <div className={`section-heading ${center ? 'center' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export function ServiceCard({ service, index = 0 }) {
  const Icon = service.icon;
  return (
    <motion.div
      className="service-card"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/services/${service.slug}`} className="service-card-link">
        <span className={`service-icon icon-${service.color}`}>
          <Icon size={22} />
        </span>
        <ArrowRight className="card-arrow" size={17} />
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <span className="learn-link">
          Learn More <ArrowRight size={13} />
        </span>
      </Link>
    </motion.div>
  );
}

export function PartnerLogos() {
  return (
    <div className="partner-logos-row">
      {/* Google */}
      <span className="partner-badge google-brand">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <b>Google</b>
      </span>

      {/* Microsoft */}
      <span className="partner-badge ms-brand">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <rect x="1" y="1" width="10" height="10" fill="#F25022" />
          <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
          <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
          <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
        </svg>
        <b>Microsoft</b>
      </span>

      {/* AWS */}
      <span className="partner-badge aws-brand">
        <span className="aws-txt">aws</span>
      </span>

      {/* Adobe */}
      <span className="partner-badge adobe-brand">
        <span className="adobe-sq">A</span>
        <b>Adobe</b>
      </span>

      {/* Shopify */}
      <span className="partner-badge shopify-brand">
        <span className="shopify-bag">🛍️</span>
        <b>shopify</b>
      </span>

      {/* Slack */}
      <span className="partner-badge slack-brand">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="#E01E5A" d="M5.04 14.5c0-.98-.79-1.78-1.78-1.78s-1.78.8-1.78 1.78.8 1.78 1.78 1.78h1.78v-1.78zm1.07 0c0 .98.8 1.78 1.78 1.78s1.78-.8 1.78-1.78V10.22H6.11v4.28z" />
          <path fill="#36C5F0" d="M9.5 5.04c-.98 0-1.78-.79-1.78-1.78S8.52 1.48 9.5 1.48s1.78.8 1.78 1.78v1.78H9.5zm0 1.07c.98 0 1.78.8 1.78 1.78s-.8 1.78-1.78 1.78H5.22V6.11h4.28z" />
          <path fill="#2EB67D" d="M18.96 9.5c0 .98.79 1.78 1.78 1.78s1.78-.8 1.78-1.78-.8-1.78-1.78-1.78h-1.78v1.78zm-1.07 0c0-.98-.8-1.78-1.78-1.78s-1.78.8-1.78 1.78v4.28h4.28V9.5z" />
          <path fill="#ECB22E" d="M14.5 18.96c.98 0 1.78.79 1.78 1.78s-.8 1.78-1.78 1.78-1.78-.8-1.78-1.78v-1.78h1.78zm0-1.07c-.98 0-1.78-.8-1.78-1.78s.8-1.78 1.78-1.78h4.28v4.28H14.5z" />
        </svg>
        <b>slack</b>
      </span>
    </div>
  );
}

export function CTA({
  title = "Ready to Transform Your Business?",
  description = "Join 10,000+ businesses already growing with Oxoo.ai. Get a free consultation and see how we can help you.",
  button = "Get a Free Consultation"
}) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSent(true);
      setTimeout(() => setSent(false), 4000);
      setEmail('');
    }
  };

  return (
    <section className="cta-band">
      <div className="cta-glow-mesh" />
      <div className="cta-inner-grid">
        <div className="cta-copy">
          <span className="eyebrow eyebrow-light">
            <Sparkles size={13} /> JOIN 10,000+ GROWING COMPANIES
          </span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <div className="cta-action-area">
          <form className="cta-email-form" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your business email"
            />
            <button type="submit" className="button button-white">
              {button} <ArrowRight size={16} />
            </button>
          </form>
          {sent && (
            <div className="cta-success-msg">
              <Check size={14} /> Thank you! Our solution consultant will reach out within 2 hours.
            </div>
          )}
          <div className="cta-checks">
            <span><Check size={14} /> No credit card required</span>
            <span><Check size={14} /> Free consultation</span>
            <span><Check size={14} /> Custom solution for your business</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VideoModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="modal-content video-modal-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close Modal">
          <X size={20} />
        </button>
        <div className="video-player-container">
          <div className="video-fake-player">
            <div className="video-overlay-elements">
              <div className="play-pulse">
                <Play size={36} fill="#fff" />
              </div>
              <h3>Oxoo.ai Platform Overview</h3>
              <p>See how CRM, Accounting, Inventory, and HRMS connect into one unified flow.</p>
              <div className="video-duration">3:24 mins • Product Tour</div>
            </div>
          </div>
        </div>
        <div className="video-modal-footer">
          <div>
            <b>Ready to see it live with your data?</b>
            <small>Book a 1-on-1 personalized product demo with an expert.</small>
          </div>
          <Link to="/contact" onClick={onClose} className="button button-emerald">
            Book Live Demo <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
