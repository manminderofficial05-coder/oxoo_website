import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Search, ChevronDown, ChevronRight, Menu, X, Globe2, Sparkles, Layers3, Layers, User, ShieldCheck,
  LogOut, LayoutDashboard, CreditCard, Code2, Plug, Headset, Check, Star, Play, Calendar, Mail, Phone, MapPin, MessageSquare,
  Users, Package, ExternalLink, RotateCcw, LayoutGrid, PlayCircle, Box, Zap, Briefcase, BarChart3, Globe,
  Bot, Smartphone, ShoppingCart, Code, Share2, MessageCircle, ClipboardList, Inbox, Megaphone, GitBranch, ShoppingBag, CalendarCheck, Settings, FolderKanban,
  Bell, Send
} from 'lucide-react';
import { categories, services, industries } from './data';
import { getAppMeta } from './appMetaHelper';
import { useRegionPricing } from './RegionPricingContext';
import { authStorage } from './authStorage';
import { getHealthStatus } from './api';
import {
  LIVE_DEMO_LIST,
  DEMO_FLOW_CONFIG,
  SOCIAL_PROFILE_URLS,
  FOOTER_SOLUTIONS_LINKS,
  FOOTER_COMPANY_LINKS,
  FOOTER_LEGAL_LINKS,
  saveSelectedDemoId,
} from './demoConfig';
import {
  PROJECT_CATEGORIES,
  getSelectedProjectServices,
  saveSelectedProjectServices
} from './projectsConfig';

export function renderProjectServiceIcon(iconKey, color = '#2563eb', size = 18) {
  const props = { size, color, strokeWidth: 2 };
  switch (iconKey) {
    case 'Bot': return <Bot {...props} />;
    case 'Smartphone': return <Smartphone {...props} />;
    case 'ShoppingCart': return <ShoppingCart {...props} />;
    case 'Box': return <Box {...props} />;
    case 'MessageSquare': return <MessageSquare {...props} />;
    case 'Code': return <Code {...props} />;
    case 'Code2': return <Code2 {...props} />;
    case 'Share2': return <Share2 {...props} />;
    case 'Mail': return <Mail {...props} />;
    case 'MessageCircle': return <MessageCircle {...props} />;
    case 'Sparkles': return <Sparkles {...props} />;
    case 'ClipboardList': return <ClipboardList {...props} />;
    case 'Inbox': return <Inbox {...props} />;
    case 'Megaphone': return <Megaphone {...props} />;
    case 'GitBranch': return <GitBranch {...props} />;
    case 'ShoppingBag': return <ShoppingBag {...props} />;
    case 'CalendarCheck': return <CalendarCheck {...props} />;
    case 'Calendar': return <Calendar {...props} />;
    case 'Settings': return <Settings {...props} />;
    case 'Globe': return <Globe {...props} />;
    case 'Zap': return <Zap {...props} />;
    case 'Users': return <Users {...props} />;
    case 'BarChart3': return <BarChart3 {...props} />;
    case 'Search': return <Search {...props} />;
    case 'Layers3': return <Layers3 {...props} />;
    case 'Headset': return <Headset {...props} />;
    case 'Bell': return <Bell {...props} />;
    case 'Send': return <Send {...props} />;
    default: return <FolderKanban {...props} />;
  }
}

// Configured HRMS Employee Login URL from environment configuration
const HRMS_EMPLOYEE_LOGIN_URL =
  import.meta.env.VITE_HRMS_EMPLOYEE_LOGIN_URL || 'https://oxoo-finance.onrender.com/';

export function Logo({ light = false, withTagline = false, stacked = false, iconOnly = false, className = '' }) {
  let src = '/oxoo-logo.png?v=navy';
  if (iconOnly) {
    src = '/oxoo-icon.png?v=navy';
  } else if (light) {
    src = '/oxoo-logo-white.png?v=navy';
  } else {
    src = '/oxoo-logo.png?v=navy';
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

function CountryFlagBadge({ code, countryName, size = 16 }) {
  const [imgErr, setImgErr] = useState(false);
  const norm = (code || '').trim().toUpperCase();
  if (!norm || norm === 'GLOBAL' || norm === 'INTL' || norm.length !== 2 || imgErr) {
    return <Globe2 size={size - 2} style={{ color: '#0284c7', flexShrink: 0 }} aria-hidden="true" />;
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${norm.toLowerCase()}.png`}
      alt={countryName || norm}
      width={size}
      height={Math.round(size * 0.75)}
      onError={() => setImgErr(true)}
      style={{
        borderRadius: '2px',
        objectFit: 'cover',
        boxShadow: '0 0 0 1px rgba(15, 23, 42, 0.12)',
        flexShrink: 0,
        display: 'inline-block'
      }}
    />
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
        title={`Client Location: ${currentRegion.countryName} (${currentRegion.currency} ${currentRegion.symbol})`}
      >
        <CountryFlagBadge code={currentRegion.regionCode} countryName={currentRegion.countryName} size={16} />
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
              <span className="country-menu-title">Client Location & Currency</span>
              <span className="country-detected-note" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                Detected: <CountryFlagBadge code={detectedRegion.regionCode} countryName={detectedRegion.countryName} size={14} /> {detectedRegion.countryName} ({detectedRegion.currency} {detectedRegion.symbol})
              </span>
            </div>

            {isManualOverride && (
              <button
                type="button"
                className="nav-country-reset-btn"
                onClick={handleReset}
              >
                <RotateCcw size={12} />
                <span>Reset to detected ({detectedRegion.countryName} — {detectedRegion.currency} {detectedRegion.symbol})</span>
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
                    <CountryFlagBadge code={reg.code} countryName={reg.label} size={16} />
                    <span className="opt-name">{reg.label}</span>
                    {isSelected && <Check size={14} className="opt-check-icon" />}
                  </button>
                );
              })}
            </div>
            <div style={{
              padding: '8px 12px',
              borderTop: '1px solid #f1f5f9',
              fontSize: '10.5px',
              color: '#64748b',
              lineHeight: 1.4,
              background: '#f8fafc',
              borderRadius: '0 0 10px 10px'
            }}>
              India: <strong>INR ₹</strong> · Outside India: <strong>USD $</strong><br />
              Indian (INR) accounts cannot be used outside India.
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
  const [openProjects, setOpenProjects] = useState(false);
  const [projectsPinned, setProjectsPinned] = useState(false);
  const [mobileProjectsOpen, setMobileProjectsOpen] = useState(false);
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
          // Enforce rule: Indian accounts cannot be used outside India
          if (authStorage.isOutsideIndia() && authStorage.isIndianAccount(user)) {
            authStorage.clearCustomerSession();
            sessionStorage.setItem(
              'oxoo_region_auth_error',
              'Access Restricted: Indian accounts (INR ₹) cannot be used outside India. Please sign in or create an International (USD $) account.'
            );
            setCurrentUser(null);
            window.dispatchEvent(new Event('oxoo_auth_change'));
            return;
          }
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
    window.addEventListener('oxoo_region_change', readUser);
    return () => {
      window.removeEventListener('oxoo_auth_change', readUser);
      window.removeEventListener('oxoo_admin_auth_change', readUser);
      window.removeEventListener('oxoo_region_change', readUser);
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
  const projectsCloseTimeoutRef = useRef(null);
  const appsBtnRef = useRef(null);
  const megaMenuRef = useRef(null);
  const projectsBtnRef = useRef(null);
  const projectsMegaRef = useRef(null);

  const filtered = services
    .filter(s => `${s.name} ${s.category}`.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 10);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const clearProjectsCloseTimeout = () => {
    if (projectsCloseTimeoutRef.current) {
      clearTimeout(projectsCloseTimeoutRef.current);
      projectsCloseTimeoutRef.current = null;
    }
  };

  const closeAll = () => {
    clearCloseTimeout();
    clearProjectsCloseTimeout();
    setOpenApps(false);
    setAppsPinned(false);
    setOpenProjects(false);
    setProjectsPinned(false);
    setProfileOpen(false);
    setMobile(false);
    setMobileProjectsOpen(false);
    setSearchQuery('');
  };

  // Close menus on route change
  useEffect(() => {
    closeAll();
  }, [location.pathname, location.search]);

  // Click outside & Escape key listener
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
      if (
        openProjects &&
        projectsBtnRef.current &&
        !projectsBtnRef.current.contains(e.target) &&
        projectsMegaRef.current &&
        !projectsMegaRef.current.contains(e.target)
      ) {
        setOpenProjects(false);
        setProjectsPinned(false);
      }
      if (profileOpen && !e.target.closest('.nav-profile-dropdown')) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAll();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      clearCloseTimeout();
      clearProjectsCloseTimeout();
    };
  }, [openApps, openProjects, profileOpen]);

  // Hover handlers for Apps button and Mega Menu box
  const handleAppsMouseEnter = () => {
    clearCloseTimeout();
    clearProjectsCloseTimeout();
    setOpenProjects(false);
    setProjectsPinned(false);
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
    setOpenProjects(false);
    setProjectsPinned(false);
    if (openApps && appsPinned) {
      setOpenApps(false);
      setAppsPinned(false);
    } else {
      setOpenApps(true);
      setAppsPinned(true);
    }
  };

  // Hover & click handlers for Projects Mega Menu
  const handleProjectsMouseEnter = () => {
    clearProjectsCloseTimeout();
    clearCloseTimeout();
    setOpenApps(false);
    setAppsPinned(false);
    setOpenProjects(true);
  };

  const handleProjectsMouseLeave = () => {
    if (projectsPinned) return;
    clearProjectsCloseTimeout();
    projectsCloseTimeoutRef.current = setTimeout(() => {
      setOpenProjects(false);
    }, 280);
  };

  const handleProjectsMenuEnter = () => {
    clearProjectsCloseTimeout();
    setOpenProjects(true);
  };

  const handleProjectsMenuLeave = () => {
    if (projectsPinned) return;
    clearProjectsCloseTimeout();
    projectsCloseTimeoutRef.current = setTimeout(() => {
      setOpenProjects(false);
    }, 280);
  };

  const handleProjectsClick = (e) => {
    e.stopPropagation();
    clearProjectsCloseTimeout();
    setOpenApps(false);
    setAppsPinned(false);
    if (openProjects && projectsPinned) {
      setOpenProjects(false);
      setProjectsPinned(false);
    } else {
      setOpenProjects(true);
      setProjectsPinned(true);
    }
  };

  const handleSelectProjectServiceFromMenu = (service, categoryTitle) => {
    const existing = getSelectedProjectServices();
    const next = existing.includes(service.name) ? existing : [...existing, service.name];
    saveSelectedProjectServices(next);
    closeAll();
    navigate(
      `/projects?service=${encodeURIComponent(service.slug)}&category=${encodeURIComponent(categoryTitle)}&action=start`
    );
  };

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Logo />

        <nav className="desktop-nav" aria-label="Main Navigation">
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
              aria-haspopup="true"
            >
              Apps <ChevronDown size={13} className={`caret ${openApps ? 'rotate' : ''}`} />
            </button>
          </div>

          {/* Projects Dropdown Button (replaces Industries) */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={handleProjectsMouseEnter}
            onMouseLeave={handleProjectsMouseLeave}
          >
            <button
              ref={projectsBtnRef}
              type="button"
              className={`nav-link ${openProjects || location.pathname.startsWith('/projects') ? 'active' : ''}`}
              onClick={handleProjectsClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProjectsClick(e);
                }
              }}
              aria-expanded={openProjects}
              aria-haspopup="true"
            >
              Projects <ChevronDown size={13} className={`caret ${openProjects ? 'rotate' : ''}`} />
            </button>
          </div>

          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/services"
            onMouseEnter={() => {
              if (!appsPinned) setOpenApps(false);
              if (!projectsPinned) setOpenProjects(false);
            }}
          >
            Community
          </NavLink>

          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/pricing"
            onMouseEnter={() => {
              if (!appsPinned) setOpenApps(false);
              if (!projectsPinned) setOpenProjects(false);
            }}
          >
            Pricing
          </NavLink>

          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/help"
            onMouseEnter={() => {
              if (!appsPinned) setOpenApps(false);
              if (!projectsPinned) setOpenProjects(false);
            }}
          >
            Help
          </NavLink>
        </nav>

        {/* Right Action Items: Country & Language Selectors, Sign in & Try it free OR Profile */}
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
            <div className="nav-guest-auth-group">
              <Link
                to="/login"
                className="nav-customer-login-btn"
                title="Customer Sign In"
              >
                <User size={15} />
                <span>Sign in</span>
              </Link>
              <Link
                to="/choose-apps"
                className="nav-try-free-btn"
                title="Try OXOO.ai Free"
              >
                <span>Try it free</span>
              </Link>
            </div>
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

      {/* Apps Mega Menu Dropdown */}
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

      {/* Projects Mega Menu Dropdown */}
      <AnimatePresence>
        {openProjects && (
          <motion.div
            className="mega-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAll}
            onMouseEnter={handleProjectsMenuEnter}
            onMouseLeave={handleProjectsMenuLeave}
          >
            <motion.div
              ref={projectsMegaRef}
              className="mega-menu projects-mega-menu"
              role="region"
              aria-label="OXOO.ai Projects & Services Menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleProjectsMenuEnter}
              onMouseLeave={handleProjectsMenuLeave}
            >
              <div className="projects-mega-header">
                <div>
                  <span className="eyebrow">CUSTOM DIGITAL SOLUTIONS & SERVICES</span>
                  <h3>Build Websites, Mobile Apps, Marketing & WhatsApp AI</h3>
                </div>
                <Link to="/projects" onClick={closeAll} className="text-link">
                  Explore Projects Hub <ArrowRight size={15} />
                </Link>
              </div>

              <div className="projects-mega-grid">
                {PROJECT_CATEGORIES.map((category) => (
                  <div key={category.id} className="projects-mega-column">
                    <div
                      className="projects-mega-col-header"
                      style={{ borderBottomColor: `${category.accentColor}26` }}
                    >
                      <span
                        className="projects-mega-col-dot"
                        style={{ backgroundColor: category.accentColor }}
                      />
                      <div className="projects-mega-col-titles">
                        <h4 style={{ color: category.accentColor }}>{category.title}</h4>
                      </div>
                    </div>

                    <ul className="projects-mega-service-list">
                      {category.services.map((svc) => (
                        <li key={svc.slug}>
                          <button
                            type="button"
                            className="projects-mega-service-item"
                            onClick={() => handleSelectProjectServiceFromMenu(svc, category.title)}
                          >
                            <span
                              className="projects-mega-service-icon"
                              style={{ backgroundColor: svc.iconBg }}
                            >
                              {renderProjectServiceIcon(svc.iconKey, svc.iconColor, 18)}
                            </span>
                            <span className="projects-mega-service-text">
                              <strong>{svc.name}</strong>
                            </span>
                            <ChevronRight size={14} className="projects-mega-service-arrow" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="projects-mega-bottom-bar">
                <div className="projects-mega-bottom-copy">
                  <Sparkles size={16} color="#0284c7" />
                  <span>Have a project in mind? Combine multiple services into one tailored roadmap.</span>
                </div>
                <Link
                  to="/projects"
                  onClick={closeAll}
                  className="projects-mega-cta-link"
                >
                  <strong>Have a project in mind? — Start Your Project →</strong>
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

            <Link to="/" onClick={closeAll} className="mobile-link">
              <span>Home</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/apps" onClick={closeAll} className="mobile-link">
              <span>Apps</span>
              <ArrowRight size={16} />
            </Link>

            {/* Mobile Projects Expandable Section */}
            <div className="mobile-projects-accordion">
              <button
                type="button"
                className="mobile-link mobile-projects-trigger"
                onClick={() => setMobileProjectsOpen(!mobileProjectsOpen)}
                aria-expanded={mobileProjectsOpen}
              >
                <span>Projects</span>
                <ChevronDown size={16} className={`caret ${mobileProjectsOpen ? 'rotate' : ''}`} />
              </button>
              {mobileProjectsOpen && (
                <div className="mobile-projects-panel">
                  {PROJECT_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="mobile-projects-cat-group">
                      <div className="mobile-projects-cat-title" style={{ color: cat.accentColor }}>
                        {cat.title}
                      </div>
                      {cat.services.map((svc) => (
                        <button
                          key={svc.slug}
                          type="button"
                          className="mobile-projects-service-btn"
                          onClick={() => handleSelectProjectServiceFromMenu(svc, cat.title)}
                        >
                          <span
                            className="mobile-projects-svc-icon"
                            style={{ backgroundColor: svc.iconBg }}
                          >
                            {renderProjectServiceIcon(svc.iconKey, svc.iconColor, 15)}
                          </span>
                          <span>{svc.name}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                  <Link
                    to="/projects"
                    onClick={closeAll}
                    className="mobile-projects-start-cta"
                  >
                    Have a project in mind? — Start Your Project →
                  </Link>
                </div>
              )}
            </div>

            {[
              ['Community', '/services'],
              ['Pricing', '/pricing'],
              ['Help', '/help'],
              ...(currentUser
                ? [
                    [currentUser.role === 'admin' ? 'Admin Console' : 'Customer Dashboard', currentUser.role === 'admin' ? '/admin' : '/dashboard']
                  ]
                : [
                    ['Sign in', '/login'],
                    ['Try it free', '/choose-apps']
                  ]),
            ].map(([n, p]) => (
              <Link key={n} to={p} onClick={closeAll} className="mobile-link">
                <span>{n}</span>
                <ArrowRight size={16} />
              </Link>
            ))}
            <div className="mobile-actions">
              <Link to="/projects" onClick={closeAll} className="button button-emerald full-button">
                Start Your Project →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function renderFooterDemoIcon(iconKey) {
  switch (iconKey) {
    case 'zap':
      return <Zap size={15} color="#eab308" fill="#eab308" />;
    case 'briefcase':
      return <Briefcase size={15} color="#9a3412" />;
    case 'users':
      return <Users size={15} color="#7c3aed" />;
    case 'bar-chart':
      return <BarChart3 size={15} color="#2563eb" />;
    case 'package':
      return <Package size={15} color="#ea580c" />;
    case 'globe':
      return <Globe size={15} color="#0284c7" />;
    default:
      return <Sparkles size={15} color="#0284c7" />;
  }
}

export function Footer() {
  const navigate = useNavigate();
  const [healthState, setHealthState] = useState({ connected: false, status: 'checking' });

  useEffect(() => {
    let active = true;
    getHealthStatus().then((res) => {
      if (active && res) {
        setHealthState(res);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleLiveDemoClick = (e, demoId) => {
    if (e) e.preventDefault();
    const canonicalId = saveSelectedDemoId(demoId) || 'productivity-ai';
    const targetRoute = DEMO_FLOW_CONFIG.requestFormRoute || '/request-demo';
    navigate(`${targetRoute}?demo=${encodeURIComponent(canonicalId)}`, {
      state: { selectedDemo: canonicalId },
    });
  };

  const handleBookDemoClick = (e) => {
    if (e) e.preventDefault();
    const targetRoute = DEMO_FLOW_CONFIG.requestFormRoute || '/request-demo';
    navigate(targetRoute);
  };

  return (
    <footer className="oxoo-footer" id="resources" role="contentinfo">
      {/* Decorative soft background wave shapes */}
      <div className="oxoo-footer-bg-shapes" aria-hidden="true">
        <div className="oxoo-footer-wave-right" />
        <div className="oxoo-footer-wave-bottom" />
        <svg className="oxoo-footer-waves-svg" viewBox="0 0 1440 280" fill="none" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,160 C320,80 520,240 840,140 C1120,50 1320,190 1440,110 L1440,280 L0,280 Z" fill="url(#oxoo-footer-wave-grad-1)" opacity="0.6" />
          <path d="M0,190 C360,110 600,260 920,180 C1180,120 1340,220 1440,160 L1440,280 L0,280 Z" fill="url(#oxoo-footer-wave-grad-2)" opacity="0.75" />
          <defs>
            <linearGradient id="oxoo-footer-wave-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#EDE9FE" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#BAE6FD" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="oxoo-footer-wave-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F0F9FF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#E0F2FE" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0.85" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="oxoo-footer-container">
        <div className="oxoo-footer-grid">
          {/* Column 1 — OXOO Brand and Contact */}
          <div className="oxoo-footer-col oxoo-footer-brand-col">
            <Link to="/" className="oxoo-footer-logo-link" aria-label="OXOO Home">
              <img src="/oxoo-logo.png" alt="OXOO" className="oxoo-footer-logo-img" />
            </Link>

            <p className="oxoo-footer-tagline">One Platform. Every Business Workflow.</p>

            <p className="oxoo-footer-description">
              Powering businesses with connected AI-driven software, professional implementation, and ongoing support.
            </p>

            <div className="oxoo-footer-contact-list">
              <a href="tel:+917940500100" className="oxoo-footer-contact-item">
                <span className="oxoo-footer-contact-icon" aria-hidden="true">
                  <Phone size={15} />
                </span>
                <span>+91 79 4050 0100</span>
              </a>

              <a href="mailto:hello@oxoo.ai" className="oxoo-footer-contact-item">
                <span className="oxoo-footer-contact-icon" aria-hidden="true">
                  <Mail size={15} />
                </span>
                <span>hello@oxoo.ai</span>
              </a>

              <div className="oxoo-footer-contact-item">
                <span className="oxoo-footer-contact-icon" aria-hidden="true">
                  <MapPin size={15} />
                </span>
                <span>Bengaluru, India</span>
              </div>
            </div>

            <div className="oxoo-footer-social-divider" aria-hidden="true" />

            {/* Official Social Brand Icons (LinkedIn, Instagram, YouTube, Facebook, X) */}
            <div className="oxoo-footer-social-row" aria-label="Social Media Links">
              <a
                href={SOCIAL_PROFILE_URLS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="oxoo-footer-social-btn"
                aria-label="OXOO.ai on LinkedIn"
                title="LinkedIn"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <rect width="24" height="24" rx="4" fill="#0A66C2" />
                  <path
                    fill="#FFFFFF"
                    d="M7.19 9.5H4.56V19h2.63V9.5zM5.88 8.28c.86 0 1.55-.7 1.55-1.56 0-.86-.69-1.55-1.55-1.55-.86 0-1.55.69-1.55 1.55 0 .86.69 1.56 1.55 1.56zM19.44 19h-2.62v-4.62c0-1.1-.02-2.52-1.54-2.52-1.54 0-1.78 1.2-1.78 2.44V19H10.88V9.5h2.52v1.3h.04c.35-.66 1.21-1.36 2.49-1.36 2.66 0 3.51 1.75 3.51 4.03V19z"
                  />
                </svg>
              </a>

              <a
                href={SOCIAL_PROFILE_URLS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="oxoo-footer-social-btn"
                aria-label="OXOO.ai on Instagram"
                title="Instagram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <defs>
                    <linearGradient id="oxoo-ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="25%" stopColor="#e6683c" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="75%" stopColor="#cc2366" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#oxoo-ig-grad)"
                    d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23c1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.36-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.36-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"
                  />
                </svg>
              </a>

              <a
                href={SOCIAL_PROFILE_URLS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="oxoo-footer-social-btn"
                aria-label="OXOO.ai on YouTube"
                title="YouTube"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    fill="#FF0000"
                    d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.56 31.56 0 0 0 0 12a31.56 31.56 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.56 31.56 0 0 0 24 12a31.56 31.56 0 0 0-.5-5.81z"
                  />
                  <polygon fill="#FFFFFF" points="9.55,15.57 15.82,12 9.55,8.43" />
                </svg>
              </a>

              <a
                href={SOCIAL_PROFILE_URLS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="oxoo-footer-social-btn"
                aria-label="OXOO.ai on Facebook"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    fill="#1877F2"
                    d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.33l-.53 3.49h-2.8v8.44C19.61 23.08 24 18.09 24 12.07z"
                  />
                </svg>
              </a>

              <a
                href={SOCIAL_PROFILE_URLS.x}
                target="_blank"
                rel="noopener noreferrer"
                className="oxoo-footer-social-btn"
                aria-label="OXOO.ai on X (Twitter)"
                title="X (Twitter)"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    fill="#0f172a"
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 — Solutions */}
          <nav className="oxoo-footer-col oxoo-footer-nav-col" aria-label="Solutions Navigation">
            <div className="oxoo-footer-col-header">
              <span className="oxoo-footer-col-badge badge-solutions" aria-hidden="true">
                <Layers size={16} />
              </span>
              <h4>Solutions</h4>
            </div>
            <ul className="oxoo-footer-nav-list">
              {FOOTER_SOLUTIONS_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="oxoo-footer-nav-link">
                    <span>{item.label}</span>
                    <ChevronRight size={14} className="oxoo-footer-chevron" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3 — Live Demos */}
          <nav className="oxoo-footer-col oxoo-footer-nav-col" aria-label="Live Demos Navigation">
            <div className="oxoo-footer-col-header">
              <span className="oxoo-footer-col-badge badge-demos" aria-hidden="true">
                <PlayCircle size={16} />
              </span>
              <h4>Live Demos</h4>
            </div>
            <ul className="oxoo-footer-nav-list">
              {LIVE_DEMO_LIST.map((demo) => (
                <li key={demo.id}>
                  <a
                    href={`${DEMO_FLOW_CONFIG.requestFormRoute}?demo=${encodeURIComponent(demo.id)}`}
                    onClick={(e) => handleLiveDemoClick(e, demo.id)}
                    className="oxoo-footer-nav-link oxoo-footer-demo-link"
                    data-demo-id={demo.id}
                  >
                    <span className="oxoo-footer-demo-item-left">
                      <span className="oxoo-footer-demo-cat-icon" aria-hidden="true">
                        {renderFooterDemoIcon(demo.iconKey)}
                      </span>
                      <span>{demo.label}</span>
                    </span>
                    <ChevronRight size={14} className="oxoo-footer-chevron" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4 — Company & Plans */}
          <nav className="oxoo-footer-col oxoo-footer-nav-col" aria-label="Company and Plans Navigation">
            <div className="oxoo-footer-col-header">
              <span className="oxoo-footer-col-badge badge-company" aria-hidden="true">
                <Box size={16} />
              </span>
              <h4>Company &amp; Plans</h4>
            </div>
            <ul className="oxoo-footer-nav-list">
              {FOOTER_COMPANY_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="oxoo-footer-nav-link">
                    <span>{item.label}</span>
                    <ChevronRight size={14} className="oxoo-footer-chevron" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 5 — Demo Call-to-Action Card */}
          <div className="oxoo-footer-col oxoo-footer-cta-col">
            <div className="oxoo-footer-cta-card">
              <div className="oxoo-footer-cta-glow" aria-hidden="true" />
              <span className="oxoo-footer-cta-eyebrow">LET&apos;S GROW TOGETHER</span>
              <h4 className="oxoo-footer-cta-heading">Ready to transform your business?</h4>
              <p className="oxoo-footer-cta-desc">
                Get a personalized demo and see how OXOO.ai can simplify your operations and accelerate your growth.
              </p>
              <a
                href={DEMO_FLOW_CONFIG.requestFormRoute}
                onClick={handleBookDemoClick}
                className="oxoo-footer-cta-btn"
              >
                <span>Book a Demo</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="oxoo-footer-bottom-wrap">
        <div className="oxoo-footer-bottom">
          <div className="oxoo-footer-copyright">
            © 2026 OXOO.ai Inc. All rights reserved.
          </div>

          <nav className="oxoo-footer-legal-nav" aria-label="Legal and Compliance Links">
            {FOOTER_LEGAL_LINKS.map((item, index) => (
              <React.Fragment key={item.label}>
                <Link
                  to={item.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="oxoo-footer-legal-link"
                >
                  {item.label}
                </Link>
                {index < FOOTER_LEGAL_LINKS.length - 1 && (
                  <span className="oxoo-footer-legal-pipe" aria-hidden="true">
                    |
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          <div className="oxoo-footer-status-slot">
            <span className="oxoo-footer-live-status" title="Live OXOO Cloud status">
              <span className="oxoo-footer-status-dot" aria-hidden="true" />
              <span>Cloud services operational</span>
            </span>
          </div>
        </div>
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

export { default as GlobalOffices } from './components/GlobalOffices';

