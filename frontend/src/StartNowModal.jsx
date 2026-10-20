import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ArrowRight, Sparkles, Search, Server, ShieldCheck, Globe, Zap, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APPS_DATA } from './appsData';

const CATEGORIES = [
  'All',
  'Finance',
  'Sales',
  'Websites',
  'Supply Chain',
  'Human Resources',
  'Services'
];

export default function StartNowModal({
  isOpen,
  onClose,
  currentApp = null,
  onSelectApp
}) {
  const navigate = useNavigate();

  // Selected app & search query
  const [selectedApp, setSelectedApp] = useState(currentApp || APPS_DATA[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Fast Provisioning Animation State (1.2s instant launch)
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [launchingApp, setLaunchingApp] = useState(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLaunching(false);
      setLaunchProgress(0);
      setLaunchingApp(null);
      setSearchQuery('');
      setCategoryFilter('All');
      if (currentApp) {
        setSelectedApp(currentApp);
      }
    }
  }, [isOpen, currentApp]);

  // Filter apps
  const filteredApps = APPS_DATA.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.tagline && app.tagline.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'All' ||
      app.category.toLowerCase() === categoryFilter.toLowerCase() ||
      (categoryFilter === 'Supply Chain' && (app.category === 'Supply Chain' || app.category === 'Operations'));

    return matchesSearch && matchesCategory;
  });

  // Launch workspace directly with NO form
  const handleLaunchApp = (app) => {
    setLaunchingApp(app);
    setSelectedApp(app);
    if (onSelectApp) onSelectApp(app);

    // Save demo user & app to localStorage
    try {
      localStorage.setItem('oxoo_demo_company', 'demo.oxoo');
      localStorage.setItem('oxoo_demo_user', 'Demo User');
      localStorage.setItem('oxoo_demo_app', app.slug);
    } catch (err) {}

    // Show instant provisioning animation (1.2s)
    setIsLaunching(true);
    setLaunchProgress(25);

    const interval = setInterval(() => {
      setLaunchProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25 + 15);
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setLaunchProgress(100);

      setTimeout(() => {
        const websiteSlugs = ['website', 'website-builder', 'ecommerce', 'events', 'blog', 'elearning', 'forum'];
        const isWebsiteApp = websiteSlugs.includes(app.slug) || app.category === 'Websites';

        const targetPath = isWebsiteApp
          ? `/apps/${app.slug}/live-demo?company=demo.oxoo`
          : `/apps/${app.slug}/portal?company=demo.oxoo`;

        onClose();
        setIsLaunching(false);
        setLaunchProgress(0);

        if (isWebsiteApp) {
          navigate(targetPath);
        } else {
          // Open portal in new tab or navigate directly
          let opened = null;
          try {
            opened = window.open(`${window.location.origin}${targetPath}`, '_blank', 'noopener,noreferrer');
          } catch (e) {}

          if (!opened || opened.closed || typeof opened.closed === 'undefined') {
            navigate(targetPath);
          }
        }
      }, 400);
    }, 1200);
  };

  const modalMarkup = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="start-now-overlay"
          className={`start-now-overlay ${isLaunching ? 'is-fullscreen-anim' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isLaunching ? '#ffffff' : 'rgba(15, 23, 42, 0.65)',
            backdropFilter: isLaunching ? 'none' : 'blur(6px)',
            padding: isLaunching ? '0' : '20px',
            overflowY: 'auto'
          }}
          onClick={() => !isLaunching && onClose()}
        >
          {/* ==============================================================
              A. INSTANT PROVISIONING SCREEN (WHITE THEME, NO FORMS)
             ============================================================== */}
          {isLaunching && launchingApp ? (
            <motion.div
              key="oxoo-instant-launching"
              className="oxoo-demo-loading-screen formal-white-theme"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="oxoo-demo-white-bg">
                <div className="white-bg-grid" />
              </div>

              <div className="oxoo-demo-center-card formal-white-card">
                <div className="formal-badge-pill">
                  <span className="formal-badge-dot" />
                  <span className="formal-badge-text">Instant Workspace Launch</span>
                </div>

                <div className="formal-app-icon-wrap" style={{ marginTop: '20px' }}>
                  <div className="formal-app-pulse-ring" />
                  <div
                    className="formal-app-icon-display"
                    style={{ backgroundColor: launchingApp.bgColor || '#eff6ff' }}
                  >
                    <img
                      src={launchingApp.iconSrc || launchingApp.svgSrc}
                      alt={launchingApp.name}
                      className="formal-app-img"
                      onError={(e) => { e.currentTarget.src = '/oxoo-icon.png'; }}
                    />
                  </div>
                </div>

                <h2 className="formal-build-title">
                  Launching {launchingApp.name} Workspace
                </h2>

                <p className="formal-build-subtitle">
                  Initializing instant demo environment with live database & tools...
                </p>

                <div className="formal-progress-container">
                  <div className="formal-progress-meta">
                    <span className="progress-task-label">Connecting Cloud Sandbox</span>
                    <span className="progress-percent-label">{launchProgress}%</span>
                  </div>
                  <div className="formal-progress-track">
                    <motion.div
                      className="formal-progress-fill"
                      style={{ width: `${launchProgress}%` }}
                      transition={{ ease: "easeInOut" }}
                    />
                  </div>
                </div>

                <div className="formal-specs-row" style={{ marginTop: '24px' }}>
                  <span className="formal-spec-item"><Server size={14} /> Cloud Node: ap-south-1</span>
                  <span className="formal-spec-item"><ShieldCheck size={14} /> TLS 1.3 Encryption</span>
                  <span className="formal-spec-item"><Zap size={14} /> 0-Setup Instant Sandbox</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ==============================================================
               B. ALL APPS SELECTION MODAL (NO FORMS - DIRECT LAUNCH)
               ============================================================== */
            <motion.div
              key="oxoo-apps-modal-dialog"
              className="oxoo-interactive-modal step-apps-layout"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="oxoo-modal-close-btn"
                onClick={onClose}
                aria-label="Close window"
                type="button"
              >
                <X size={20} />
              </button>

              {/* Modal Centered Header */}
              <div className="oxoo-modal-header-centered">
                <div className="oxoo-free-demo-pill">
                  FREE DEMO · NO FORMS NEEDED
                </div>
                <h2 className="oxoo-modal-main-title">
                  Select an <span className="oxoo-title-highlight">App</span> to Launch
                </h2>
                <p className="oxoo-modal-subtitle">
                  Click any application to launch its live interactive workspace immediately.
                </p>
              </div>

              {/* Search and Category Filter Bar */}
              <div className="modal-apps-filter-bar">
                <div className="modal-search-box">
                  <Search size={16} className="modal-search-icon" />
                  <input
                    type="text"
                    placeholder="Search 24 business apps (Accounting, CRM, Website, Inventory)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="modal-search-clear"
                      onClick={() => setSearchQuery('')}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="modal-category-pills">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`modal-category-chip ${categoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat} {cat === 'All' ? `(${APPS_DATA.length})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* 24 Apps Responsive Grid */}
              <div className="modal-apps-grid">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="modal-app-card"
                    onClick={() => handleLaunchApp(app)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleLaunchApp(app)}
                  >
                    <div
                      className="modal-app-icon-tile"
                      style={{ backgroundColor: app.bgColor || '#f0f9ff' }}
                    >
                      <img
                        src={app.iconSrc || app.svgSrc}
                        alt={app.name}
                        className="modal-app-icon-img"
                        onError={(e) => { e.currentTarget.src = '/oxoo-icon.png'; }}
                      />
                    </div>
                    <div className="modal-app-card-info">
                      <div className="modal-app-card-title-row">
                        <span className="modal-app-card-name">{app.name}</span>
                        <span className="modal-app-card-cat">{app.category}</span>
                      </div>
                      <p className="modal-app-card-desc">
                        {app.tagline || `${app.name} automation & management.`}
                      </p>
                    </div>
                    <span className="modal-app-card-arrow">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                ))}
              </div>

              {filteredApps.length === 0 && (
                <div className="modal-apps-empty-state">
                  <p>No applications match "<strong>{searchQuery}</strong>".</p>
                  <button
                    type="button"
                    className="modal-reset-search-btn"
                    onClick={() => { setSearchQuery(''); setCategoryFilter('All'); }}
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalMarkup, document.body);
  }
  return modalMarkup;
}
