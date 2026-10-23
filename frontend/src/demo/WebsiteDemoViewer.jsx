import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, ShoppingCart, LogOut, AlertTriangle, Check, Crown,
  X, Sparkles, RefreshCw, Layers, ShieldCheck, ArrowRight, ExternalLink
} from 'lucide-react';
import { Logo } from '../components';
import CompanyBrandLogo from '../CompanyBrandLogo';
import { getAppBySlug, APPS_DATA } from '../appsData';
import { sendEmailOtp, verifyEmailOtp } from '../api';
import './demo.css';

// 5 Interactive Application Demos Catalog
export const DEMO_CONFIGS = {
  'ai-demo': {
    id: 'ai-demo',
    label: 'Productivity & AI',
    shortLabel: 'AI & Productivity',
    badge: '⚡ Productivity Suite Demo',
    category: 'Productivity',
    src: '/ai-demo/dashboard/overview/index.html',
    title: 'Hospital Cart AI Intelligence & Productivity Platform',
    desc: 'Voice AI agents, automated workflow sequences, patient CRM, and smart task scheduling.',
    accentColor: '#8b5cf6',
    icon: '⚡',
  },
  'sales-demo': {
    id: 'sales-demo',
    label: 'Sales & CRM',
    shortLabel: 'Sales CRM',
    badge: '💼 Sales & CRM Demo',
    category: 'Sales',
    src: '/sales-demo/dashboard/index.html',
    title: 'LeadConnect Visual Sales Pipeline & CRM Dialing Suite',
    desc: 'Real-time sales deal stages, automated call dialer, lead management, and conversion analytics.',
    accentColor: '#f97316',
    icon: '💼',
  },
  'hrms-demo': {
    id: 'hrms-demo',
    label: 'Human Resources',
    shortLabel: 'HRMS & People',
    badge: '👥 HRMS & Attendance Demo',
    category: 'Human Resources',
    src: '/hrms-demo/index.html',
    title: 'Employee360° Workforce & Attendance Management Suite',
    desc: 'Central employee directory, leave requests, biometric face attendance, and payroll slips.',
    accentColor: '#0ea5e9',
    icon: '👥',
  },
  'finance-demo': {
    id: 'finance-demo',
    label: 'Finance & GST',
    shortLabel: 'Finance & Accounting',
    badge: '📊 Finance & Accounting Demo',
    category: 'Finance',
    src: '/finance-demo/index.html',
    title: 'Oxoo Accounting, GST Invoicing & Financial Reports',
    desc: 'Automated invoice generation, tax filing, balance sheet reconciliation, and cash flow reports.',
    accentColor: '#10b981',
    icon: '📊',
  },
  'supply-chain-demo': {
    id: 'supply-chain-demo',
    label: 'Supply Chain & Operations',
    shortLabel: 'Supply Chain Ops',
    badge: '📦 Supply Chain 360 Demo',
    category: 'Supply Chain',
    src: '/supply-chain-demo/index.html',
    title: 'FlowStock 360 Enterprise Supply Chain & Inventory Operations',
    desc: 'Real-time multi-warehouse tracking, MRP manufacturing, automated replenishment, and logistics dispatch.',
    accentColor: '#059669',
    icon: '📦',
  },
  'website-builder-demo': {
    id: 'website-builder-demo',
    label: 'Websites & Studio',
    shortLabel: 'Website Builder',
    badge: '🌐 Website Builder Studio Demo',
    category: 'Websites',
    src: '/website-builder-demo/index.html',
    title: 'Oxoo Website Builder & eCommerce Digital Studio',
    desc: 'Drag-and-drop web page builder, storefront customization, and instant publishing.',
    accentColor: '#6366f1',
    icon: '🌐',
  },
};

export default function WebsiteDemoViewer({ defaultDemo }) {
  const { appSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const company = queryParams.get('company') || localStorage.getItem('oxoo_demo_company') || localStorage.getItem('oxoo_company_name') || 'maan.oxoo';
  const targetApp = getAppBySlug(appSlug || 'website-builder') || APPS_DATA[0];

  // Specific Slug & Category Mappings
  const productivitySlugs = ['ai', 'artificial-intelligence', 'knowledge', 'discuss', 'projects', 'project', 'voip', 'iot', 'productivity'];
  const supplyChainSlugs = ['inventory', 'manufacturing', 'maintenance', 'plm', 'quality', 'purchase', 'warehouse', 'warehouses', 'logistics', 'delivery', 'deliveries', 'fleet', 'rfq', 'procurement', 'dispatch', 'barcode', 'barcode-scanner', 'supply-chain', 'supply_chain'];
  const salesSlugs = ['sales', 'crm', 'pos', 'pos-shop', 'pos-restaurant', 'subscriptions', 'ecommerce', 'rental'];
  const hrmsSlugs = ['hr', 'timesheets', 'employees', 'payroll', 'recruitment', 'time-off', 'appraisals', 'planning', 'helpdesk', 'field-service', 'appointments'];
  const financeSlugs = ['accounting', 'invoicing', 'expenses', 'expense-management', 'sign', 'spreadsheet', 'spreadsheets', 'esg', 'finance'];

  // 1. Resolve selected app slugs strictly from query, path, or explicit app context (no stale localStorage fallback)
  const appsQuery = queryParams.get('apps');
  let selectedSlugs = [];

  if (appsQuery) {
    selectedSlugs = appsQuery.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  } else if (appSlug) {
    // Single app view: e.g. /apps/accounting/live-demo
    selectedSlugs = [appSlug.toLowerCase()];
  } else if (defaultDemo && DEMO_CONFIGS[defaultDemo]) {
    selectedSlugs = [];
  }

  // 2. Helper to map an app slug/category to its corresponding demo
  const mapSlugToDemoId = (slug) => {
    if (!slug) return 'finance-demo';
    const s = slug.toLowerCase();
    const appObj = getAppBySlug(s);
    const cat = appObj?.category;

    if (cat === 'Productivity' || productivitySlugs.includes(s)) return 'ai-demo';
    if (cat === 'Supply Chain' || supplyChainSlugs.includes(s)) return 'supply-chain-demo';
    if (cat === 'Sales' || cat === 'Marketing' || salesSlugs.includes(s)) return 'sales-demo';
    if (cat === 'Human Resources' || cat === 'Services' || hrmsSlugs.includes(s)) return 'hrms-demo';
    if (cat === 'Finance' || financeSlugs.includes(s)) return 'finance-demo';
    if (cat === 'Websites') return 'website-builder-demo';
    return 'finance-demo';
  };

  // 3. Compute unique visible demo IDs
  // When user selects 1 app (e.g. Accounting) -> visibleDemoIds.length === 1 (Only Finance demo)
  // When user selects 2 apps from different categories (e.g. Accounting + HR) -> visibleDemoIds.length === 2 (Finance + HR)
  let visibleDemoIds = [];

  if (selectedSlugs.length > 0) {
    const uniqueIds = Array.from(new Set(selectedSlugs.map(mapSlugToDemoId)));
    visibleDemoIds = uniqueIds.filter((id) => DEMO_CONFIGS[id]);
  } else if (queryParams.get('demo')) {
    const d = queryParams.get('demo').trim().toLowerCase();
    if (d === 'ai' || d === 'ai-demo' || d === 'productivity') visibleDemoIds = ['ai-demo'];
    else if (d === 'sales' || d === 'sales-demo') visibleDemoIds = ['sales-demo'];
    else if (d === 'hrms' || d === 'hrms-demo') visibleDemoIds = ['hrms-demo'];
    else if (d === 'finance' || d === 'finance-demo' || d === 'oxoo-finance-demo') visibleDemoIds = ['finance-demo'];
    else if (d.includes('supply')) visibleDemoIds = ['supply-chain-demo'];
    else if (d.includes('website')) visibleDemoIds = ['website-builder-demo'];
    else if (DEMO_CONFIGS[d]) visibleDemoIds = [d];
  } else if (defaultDemo && DEMO_CONFIGS[defaultDemo]) {
    visibleDemoIds = [defaultDemo];
  } else {
    // Direct path segment check (e.g. /demo/ai-demo, /demo/sales-demo, etc.)
    const pathPart = (location.pathname.split('/').filter(Boolean).pop() || '').toLowerCase();
    if (pathPart === 'ai' || pathPart === 'ai-demo' || pathPart === 'productivity') {
      visibleDemoIds = ['ai-demo'];
    } else if (pathPart === 'sales' || pathPart === 'sales-demo') {
      visibleDemoIds = ['sales-demo'];
    } else if (pathPart === 'hrms' || pathPart === 'hrms-demo') {
      visibleDemoIds = ['hrms-demo'];
    } else if (pathPart === 'finance' || pathPart === 'finance-demo' || pathPart === 'oxoo-finance-demo') {
      visibleDemoIds = ['finance-demo'];
    } else if (pathPart === 'supply-chain-demo' || pathPart === 'supply-chain' || pathPart === 'supply_chain') {
      visibleDemoIds = ['supply-chain-demo'];
    } else if (pathPart === 'website' || pathPart === 'website-demo' || pathPart === 'website-builder-demo') {
      visibleDemoIds = ['website-builder-demo'];
    } else if (pathPart && DEMO_CONFIGS[pathPart]) {
      visibleDemoIds = [pathPart];
    } else if (appSlug) {
      visibleDemoIds = [mapSlugToDemoId(appSlug)];
    } else {
      visibleDemoIds = ['finance-demo'];
    }
  }

  // Ensure at least one valid demo is available
  if (visibleDemoIds.length === 0) {
    visibleDemoIds = ['finance-demo'];
  }

  // 4. Initial active demo id
  const initialDemoId = queryParams.get('demo') && visibleDemoIds.includes(queryParams.get('demo'))
    ? queryParams.get('demo')
    : visibleDemoIds[0];

  const [activeDemoId, setActiveDemoId] = useState(initialDemoId);
  const activeConfig = DEMO_CONFIGS[activeDemoId] || DEMO_CONFIGS[visibleDemoIds[0]] || DEMO_CONFIGS['finance-demo'];

  // Dynamically resolve app name for active demo badge
  const activeAppObj = selectedSlugs
    .map(getAppBySlug)
    .find((a) => a && mapSlugToDemoId(a.slug) === activeDemoId) || targetApp;
  const displayAppName = activeAppObj?.name;

  // Helper to deep-link into the specific module of the demo when an individual app is selected
  const resolveDemoSrc = (demoId, slug) => {
    const config = DEMO_CONFIGS[demoId];
    if (!config) return '/finance-demo/index.html';
    if (demoId === 'supply-chain-demo') {
      const s = (slug || appSlug || (selectedSlugs && selectedSlugs[0]) || '').toLowerCase();
      if (s === 'inventory') return '/supply-chain-demo/index.html#/inventory';
      if (s === 'manufacturing') return '/supply-chain-demo/index.html#/manufacturing';
      if (s === 'maintenance') return '/supply-chain-demo/index.html#/maintenance';
      if (s === 'plm') return '/supply-chain-demo/index.html#/plm';
      if (s === 'quality') return '/supply-chain-demo/index.html#/quality';
      if (s === 'purchase') return '/supply-chain-demo/index.html#/purchase';
      if (s === 'warehouse') return '/supply-chain-demo/index.html#/warehouse';
      if (s === 'logistics') return '/supply-chain-demo/index.html#/logistics';
      if (s === 'rfq') return '/supply-chain-demo/index.html#/rfq';
      if (s === 'barcode' || s === 'barcode-scanner') return '/supply-chain-demo/index.html#/barcode-scanner';
      if (s === 'login' || s === 'auth' || s === 'admin-login' || s === 'user-login') return '/supply-chain-demo/index.html#/login';
      return '/supply-chain-demo/index.html';
    }
    return config.src;
  };

  const OXOO_FINANCE_SERVICE_KEY = "OXOO-FIN-2026-SECURE-KEY";
  const rawDemoSrc = resolveDemoSrc(activeDemoId, activeAppObj?.slug);
  const sep = rawDemoSrc.includes('?') ? '&' : '?';
  const demoSrc = `${rawDemoSrc}${sep}service_key=${OXOO_FINANCE_SERVICE_KEY}&role=admin&auto_login=true&company=${encodeURIComponent(company)}`;
  const demoTitle = `${displayAppName ? `Oxoo ${displayAppName} · ` : ''}${activeConfig.title}`;

  // Demo Email OTP Verification Gate States (Enforces OTP verification before live demo begins!)
  const [isDemoVerified, setIsDemoVerified] = useState(() => {
    try {
      if (queryParams.get('verified') === 'true') return true;
      if (sessionStorage.getItem('oxoo_demo_session_verified') === 'true') return true;
      if (localStorage.getItem('oxoo_demo_verified') === 'true') return true;
    } catch (e) {}
    return false;
  });

  useEffect(() => {
    if (queryParams.get('verified') === 'true') {
      try {
        sessionStorage.setItem('oxoo_demo_session_verified', 'true');
        localStorage.setItem('oxoo_demo_verified', 'true');
      } catch (e) {}
      setIsDemoVerified(true);
    }
  }, []);

  const [gateEmail, setGateEmail] = useState(() => {
    try {
      return localStorage.getItem('oxoo_demo_email') || '';
    } catch (e) {
      return '';
    }
  });
  const [gateOtp, setGateOtp] = useState('');
  const [isGateOtpSent, setIsGateOtpSent] = useState(false);
  const [isGateSending, setIsGateSending] = useState(false);
  const [isGateVerifying, setIsGateVerifying] = useState(false);
  const [gateError, setGateError] = useState('');
  const [gateSuccess, setGateSuccess] = useState('');
  const [gateCooldown, setGateCooldown] = useState(0);

  // 2 Minutes = 120 seconds countdown
  const INITIAL_TIME_SECONDS = 120;
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_TIME_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timeExpiredModal, setTimeExpiredModal] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Business Pro');

  const timerRef = useRef(null);

  // Auto-authenticate any embedded demo sessions (e.g. AI / Productivity Hospital Cart demo)
  useEffect(() => {
    try {
      localStorage.setItem('hospital-cart-demo:session', '1');
    } catch (e) {}
  }, []);

  // 2-Minute Countdown Timer (Only runs after OTP verification!)
  useEffect(() => {
    if (!isTimerRunning || !isDemoVerified) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimerRunning(false);
          setTimeExpiredModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, isDemoVerified]);

  // Handle Before Unload (Prompt on exit)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (secondsLeft > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [secondsLeft]);

  // Format mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((INITIAL_TIME_SECONDS - secondsLeft) / INITIAL_TIME_SECONDS) * 100;
  const isUrgent = secondsLeft <= 30 && secondsLeft > 0;

  // Cleanup on unmount (leaving demo)
  useEffect(() => {
    return () => {
      try {
        localStorage.removeItem('website_builder_current_config');
        localStorage.removeItem('website_builder_saved_sites');
        localStorage.removeItem('website_builder_leads');
        localStorage.removeItem('website_builder_active_step');
        sessionStorage.removeItem('website_builder_active_step');
      } catch (e) {}
    };
  }, []);

  const handleTriggerLeave = () => {
    setLeaveModalOpen(true);
  };

  const handleConfirmExit = () => {
    try {
      localStorage.removeItem('website_builder_current_config');
      localStorage.removeItem('website_builder_saved_sites');
      localStorage.removeItem('website_builder_leads');
      localStorage.removeItem('website_builder_active_step');
      sessionStorage.removeItem('website_builder_active_step');
    } catch (e) {}
    navigate(targetApp.slug ? `/apps/${targetApp.slug}` : '/apps');
  };

  const handleChoosePlan = (planName) => {
    try {
      localStorage.removeItem('website_builder_current_config');
      localStorage.removeItem('website_builder_saved_sites');
      localStorage.removeItem('website_builder_leads');
      localStorage.removeItem('website_builder_active_step');
      sessionStorage.removeItem('website_builder_active_step');
    } catch (e) {}
    navigate(`/pricing?plan=${encodeURIComponent(planName)}`);
  };

  const handleRestartDemo = () => {
    try {
      localStorage.removeItem('website_builder_current_config');
      localStorage.removeItem('website_builder_saved_sites');
      localStorage.removeItem('website_builder_leads');
      localStorage.removeItem('website_builder_active_step');
      sessionStorage.removeItem('website_builder_active_step');
    } catch (e) {}
    setSecondsLeft(INITIAL_TIME_SECONDS);
    setIsTimerRunning(true);
    setTimeExpiredModal(false);
    const iframe = document.querySelector('.oxoo-viewer-iframe-frame');
    if (iframe) {
      iframe.src = demoSrc;
    }
  };

  const handleSwitchDemo = (demoId) => {
    setActiveDemoId(demoId);
    // update iframe src directly
    const iframe = document.querySelector('.oxoo-viewer-iframe-frame');
    if (iframe) {
      iframe.src = resolveDemoSrc(demoId);
    }
  };

  useEffect(() => {
    let timer;
    if (gateCooldown > 0) {
      timer = setInterval(() => {
        setGateCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gateCooldown]);

  const handleSendGateOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = (gateEmail || '').trim();
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setGateError('Please enter a valid work email address.');
      return;
    }
    setIsGateSending(true);
    setGateError('');
    setGateSuccess('');
    try {
      await sendEmailOtp({
        email: cleanEmail,
        purpose: 'OXOO Live Demo Access'
      });
      setGateOtp(''); // Keep empty so user must enter code from email
      setIsGateOtpSent(true);
      setGateSuccess(`Verification code sent to ${cleanEmail}`);
      setGateCooldown(30);
    } catch (err) {
      setGateError(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setIsGateSending(false);
    }
  };

  const handleVerifyGateOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = gateOtp.replace(/\D/g, '').trim();
    if (cleanOtp.length !== 6) {
      setGateError('Please enter the complete 6-digit verification code.');
      return;
    }
    setIsGateVerifying(true);
    setGateError('');
    try {
      await verifyEmailOtp({
        email: gateEmail.trim(),
        otp: cleanOtp
      });
      try {
        sessionStorage.setItem('oxoo_demo_session_verified', 'true');
        localStorage.setItem('oxoo_demo_verified', 'true');
        localStorage.setItem('oxoo_demo_email', gateEmail.trim());
      } catch (err) {}
      setIsDemoVerified(true);
      setIsTimerRunning(true);
    } catch (err) {
      setGateError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsGateVerifying(false);
    }
  };

  return (
    <div
      className="oxoo-demo-viewer-root"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#ffffff'
      }}
    >
      {/* -------------------------------------------------------------
          1. STICKY TOP CONTROL BAR (Logo, 5 Demo Switcher, 2-Min Timer, Actions)
          ------------------------------------------------------------- */}
      <header
        className="oxoo-viewer-top-bar"
        style={{
          height: '62px',
          minHeight: '62px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          zIndex: 100,
          gap: '12px'
        }}
      >
        {/* Left: Brand & Active Badge */}
        <div className="oxoo-viewer-brand-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CompanyBrandLogo
              companyName={company}
              size="header"
              showPill={false}
              linkTo="/"
            />
          </div>
          <span
            className="oxoo-viewer-app-badge"
            style={{
              background: '#f8fafc',
              color: '#0f172a',
              fontSize: '12.5px',
              fontWeight: 700,
              padding: '5px 12px',
              borderRadius: '999px',
              border: `1.5px solid ${activeConfig.accentColor}33`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeConfig.accentColor, display: 'inline-block' }} />
            {displayAppName ? `${displayAppName} · ` : ''}{activeConfig.shortLabel}
          </span>
        </div>

        {/* Center: DEMO SUITE SWITCHER TABS - ONLY SHOWN IF USER SELECTED MULTIPLE DIFFERENT APPS / DEMOS */}
        {visibleDemoIds.length > 1 && (
          <div
            className="oxoo-demo-suite-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f1f5f9',
              padding: '4px 6px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              overflowX: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              flexShrink: 0
            }}
          >
            <span
              className="oxoo-demo-count-badge"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#475569',
                padding: '3px 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: '#e2e8f0',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                userSelect: 'none'
              }}
            >
              {selectedSlugs.length > visibleDemoIds.length
                ? `${selectedSlugs.length} Apps (${visibleDemoIds.length} Demos):`
                : `${visibleDemoIds.length} Apps Selected:`}
            </span>
            {visibleDemoIds.map((id) => {
              const d = DEMO_CONFIGS[id];
              if (!d) return null;
              const isSelected = activeDemoId === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSwitchDemo(d.id)}
                  title={d.desc}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
                    fontSize: '12.5px',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? '#ffffff' : 'transparent',
                    color: isSelected ? '#0f172a' : '#64748b',
                    boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '13px' }}>{d.icon}</span>
                  <span>{d.shortLabel}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Timer & Actions */}
        <div className="oxoo-viewer-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Live 2-Minute Timer Capsule */}
          <div
            className="oxoo-viewer-timer-capsule"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '5px 12px',
              borderRadius: '999px'
            }}
          >
            <Clock size={14} className="oxoo-timer-clock-icon" color="#00a3e0" />
            <span className="oxoo-timer-label" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
              Free Demo:
            </span>
            <span
              className={`oxoo-timer-digits ${isUrgent ? 'urgent' : ''}`}
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                fontWeight: 800,
                color: isUrgent ? '#ef4444' : '#0f172a'
              }}
            >
              {formatTime(secondsLeft)}
            </span>
          </div>

          {/* Leave Demo Button */}
          <button
            type="button"
            className="oxoo-viewer-btn-leave"
            onClick={handleTriggerLeave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={13} />
            Leave
          </button>

          {/* Purchase Plan Button */}
          <button
            type="button"
            className="oxoo-viewer-btn-buy"
            onClick={() => setLeaveModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: '#00a3e0',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 163, 224, 0.3)'
            }}
          >
            <ShoppingCart size={13} />
            Buy Plan
          </button>
        </div>
      </header>

      {/* Timer Progress Line across top */}
      <div
        className="oxoo-viewer-progress-bar-track"
        style={{ height: '3px', background: '#f1f5f9', width: '100%', position: 'relative', zIndex: 101 }}
      >
        <div
          className="oxoo-viewer-progress-bar-fill"
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${activeConfig.accentColor}, #10b981)`,
            transition: 'width 1s linear',
            width: `${progressPercent}%`
          }}
        />
      </div>

      {/* -------------------------------------------------------------
          2. EMBEDDED DEMO CODE (Direct Fullscreen iframe)
          ------------------------------------------------------------- */}
      <iframe
        key={activeDemoId}
        title={demoTitle}
        src={isDemoVerified ? demoSrc : 'about:blank'}
        className="oxoo-viewer-iframe-frame"
        onLoad={(e) => {
          try {
            const cw = e.currentTarget?.contentWindow;
            if (cw && cw.localStorage) {
              cw.localStorage.setItem('hospital-cart-demo:session', '1');
              cw.localStorage.setItem('oxoo_company_name', company);
              cw.localStorage.setItem('oxoo_demo_company', company);
            }
            if (cw) {
              cw.postMessage({
                type: 'OXOO_COMPANY_LOGO',
                company,
                companyName: company.replace(/\.(oxoo|com|ai)$/i, '')
              }, '*');
            }
          } catch (err) {}
        }}
        style={{
          width: '100vw',
          height: 'calc(100vh - 65px)',
          minHeight: 'calc(100vh - 65px)',
          maxHeight: 'calc(100vh - 65px)',
          border: 'none',
          outline: 'none',
          display: 'block',
          flex: 1,
          background: '#ffffff'
        }}
      />

      {/* -------------------------------------------------------------
          3. TIME EXPIRED MODAL (Triggered automatically at 00:00)
          ------------------------------------------------------------- */}
      <AnimatePresence>
        {timeExpiredModal && (
          <div className="oxoo-plans-modal-backdrop">
            <motion.div
              className="oxoo-plans-modal-dialog"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="oxoo-plans-modal-header" style={{ background: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #1e3a8a 100%)' }}>
                <span className="oxoo-plans-header-pill" style={{ background: 'rgba(239, 68, 68, 0.25)', borderColor: '#ef4444', color: '#fca5a5' }}>
                  <Clock size={12} /> 2-MINUTE FREE DEMO PERIOD FINISHED
                </span>
                <h2 className="oxoo-plans-header-title">Ready to Launch Your Full Suite?</h2>
                <p className="oxoo-plans-header-subtitle">
                  Your 2-minute interactive test session for {activeConfig.name} has completed. Choose an Oxoo plan to save your work, connect custom domains, and deploy live.
                </p>
              </div>

              {/* 4 Plan Cards */}
              <div className="oxoo-plans-cards-grid">
                {[
                  {
                    name: 'Starter',
                    price: '₹15,000',
                    popular: false,
                    features: ['5 Team Seats', '3 Core Applications', 'Export HTML/CSS', 'Custom Domain SSL']
                  },
                  {
                    name: 'Growth',
                    price: '₹25,000',
                    popular: false,
                    features: ['10 Team Seats', '5 Business Applications', 'Website Builder Pro', 'eCommerce Storefront']
                  },
                  {
                    name: 'Business Pro',
                    price: '₹48,200',
                    popular: true,
                    features: ['15 Team Seats', '8 Core Applications', 'Unlimited Websites', '24/7 Dedicated SLA', 'Custom API & SSO']
                  },
                  {
                    name: 'Enterprise',
                    price: '₹1,24,000',
                    popular: false,
                    features: ['Unlimited Seats', 'All 24 Applications', 'Dedicated Account Lead', 'Multi-tenant Isolation']
                  }
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`oxoo-plan-tile ${plan.popular ? 'highlight' : ''}`}
                  >
                    {plan.popular && (
                      <span className="oxoo-plan-badge-popular">Recommended</span>
                    )}
                    <div>
                      <h4 className="oxoo-plan-tile-name">{plan.name}</h4>
                      <div className="oxoo-plan-tile-price">
                        {plan.price}<span style={{ fontSize: '11px', color: '#64748b' }}>{plan.cycle}</span>
                      </div>
                      <ul className="oxoo-plan-tile-features">
                        {plan.features.map((f, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Check size={12} color="#0284c7" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className="oxoo-plan-btn-choose"
                      onClick={() => handleChoosePlan(plan.name)}
                    >
                      Purchase {plan.name}
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer with Restart option */}
              <div className="oxoo-plans-modal-footer">
                <span className="oxoo-plans-footer-left">
                  🔒 Instant plan activation with automatic database synchronization.
                </span>
                <div className="oxoo-plans-footer-btns">
                  <button
                    type="button"
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                    onClick={handleRestartDemo}
                  >
                    <RefreshCw size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Restart Demo
                  </button>
                  <button
                    type="button"
                    className="oxoo-viewer-btn-leave"
                    style={{ background: '#0284c7', color: '#fff', border: 'none' }}
                    onClick={() => handleChoosePlan('Business Pro')}
                  >
                    Get Business Pro Now →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          4. LEAVE DEMO CONFIRMATION / PURCHASE PLAN MODAL
          ------------------------------------------------------------- */}
      <AnimatePresence>
        {leaveModalOpen && (
          <div className="oxoo-plans-modal-backdrop" onClick={() => setLeaveModalOpen(false)}>
            <motion.div
              className="oxoo-plans-modal-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="oxoo-plans-modal-header">
                <button
                  type="button"
                  className="oxoo-plans-close-btn"
                  onClick={() => setLeaveModalOpen(false)}
                >
                  <X size={18} />
                </button>
                <span className="oxoo-plans-header-pill">
                  <Crown size={12} /> SAVE YOUR WORK & UPGRADE
                </span>
                <h2 className="oxoo-plans-header-title">Before You Leave - Choose a Plan!</h2>
                <p className="oxoo-plans-header-subtitle">
                  Don't lose your customized template and configurations in {activeConfig.name}. Pick a tier to continue building permanently.
                </p>
              </div>

              {/* 4 Plan Cards */}
              <div className="oxoo-plans-cards-grid">
                {[
                  { name: 'Starter', price: '₹15,000/mo', desc: 'For freelancers & micro teams' },
                  { name: 'Growth', price: '₹25,000/mo', desc: 'For scaling modern businesses' },
                  { name: 'Business Pro', price: '₹48,200/mo', desc: 'Full Application Suite + All 5 Demos', popular: true },
                  { name: 'Enterprise', price: '₹1,24,000/mo', desc: 'Full 24 Suite Apps + 24/7 SLA & Dedicated Support' }
                ].map((p) => (
                  <div
                    key={p.name}
                    className={`oxoo-plan-tile ${p.popular ? 'highlight' : ''}`}
                  >
                    {p.popular && <span className="oxoo-plan-badge-popular">Best Value</span>}
                    <div>
                      <h4 className="oxoo-plan-tile-name">{p.name}</h4>
                      <div className="oxoo-plan-tile-price" style={{ fontSize: '18px' }}>{p.price}</div>
                      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '14px' }}>{p.desc}</p>
                    </div>
                    <button
                      type="button"
                      className="oxoo-plan-btn-choose"
                      onClick={() => handleChoosePlan(p.name)}
                    >
                      Select {p.name}
                    </button>
                  </div>
                ))}
              </div>

              <div className="oxoo-plans-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}
                  onClick={handleConfirmExit}
                >
                  Exit Demo Anyway
                </button>
                <div className="oxoo-plans-footer-btns">
                  <button
                    type="button"
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                    onClick={() => setLeaveModalOpen(false)}
                  >
                    Continue Demo ({formatTime(secondsLeft)} left)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Email OTP Verification Gate Modal (Guarantees demo only starts after OTP verification) */}
      {!isDemoVerified && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '36px 32px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              textAlign: 'center',
              position: 'relative'
            }}
          >
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
              <ShieldCheck size={32} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              Verify Email to Access Live Demo
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Please verify your work email with a 6-digit OTP code to unlock and start the interactive OXOO live demo.
            </p>

            {gateSuccess && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  fontSize: '13px',
                  fontWeight: 500,
                  marginBottom: '16px'
                }}
              >
                {gateSuccess}
              </div>
            )}

            {gateError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '13px',
                  fontWeight: 500,
                  marginBottom: '16px'
                }}
              >
                {gateError}
              </div>
            )}

            {!isGateOtpSent ? (
              <form onSubmit={handleSendGateOtp}>
                <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={gateEmail}
                    onChange={(e) => {
                      setGateEmail(e.target.value);
                      if (gateError) setGateError('');
                    }}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px',
                      fontSize: '15px',
                      color: '#0f172a',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGateSending || !gateEmail.trim()}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '12px',
                    background: gateEmail.trim() ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#94a3b8',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: gateEmail.trim() && !isGateSending ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: gateEmail.trim() ? '0 8px 20px rgba(37, 99, 235, 0.25)' : 'none'
                  }}
                >
                  {isGateSending ? 'Sending verification code...' : 'Send Verification OTP →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyGateOtp}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                    Enter 6-Digit Code
                  </label>
                  <div style={{ maxWidth: '280px', margin: '0 auto' }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      value={gateOtp}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setGateOtp(clean);
                        if (gateError) setGateError('');
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
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
                    Code valid for 10 minutes. Check your inbox or spam.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isGateVerifying || gateOtp.trim().length !== 6}
                  style={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '12px',
                    background: gateOtp.trim().length === 6 ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : '#94a3b8',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: gateOtp.trim().length === 6 && !isGateVerifying ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: gateOtp.trim().length === 6 ? '0 8px 20px rgba(22, 163, 74, 0.25)' : 'none',
                    marginBottom: '14px'
                  }}
                >
                  {isGateVerifying ? 'Verifying...' : 'Verify & Unlock Live Demo →'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsGateOtpSent(false);
                      setGateOtp('');
                      setGateError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ← Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleSendGateOtp}
                    disabled={gateCooldown > 0 || isGateSending}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: gateCooldown > 0 ? '#94a3b8' : '#2563eb',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: gateCooldown > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isGateSending ? 'Sending...' : gateCooldown > 0 ? `Resend in ${gateCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
