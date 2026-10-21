import React, { useEffect, useState, useRef } from 'react';
import JoinMosaic from './JoinMosaic';
import { Routes, Route, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Check, CalendarDays, Search, Sparkles, ShieldCheck,
  Zap, Puzzle, BarChart3, Bot, Play, ChevronRight, ChevronLeft, Mail, Phone,
  MapPin, Clock, Filter, CheckCircle2, Send, LayoutDashboard, Users, CircleDollarSign,
  Ticket, PackageCheck, TrendingUp, Plus, ExternalLink, Globe2, Layers, Cpu,
  Laptop, Smartphone, ShoppingCart, MessageCircle, Star, Building2, Briefcase,
  HelpCircle, ChevronDown, CheckCheck, Headphones, LogIn
} from 'lucide-react';
import { Header, Footer, SectionHeading, ServiceCard, CTA, Logo, PartnerLogos, VideoModal, AnimatedHeroTitle } from './components';
import { categories, services, industries } from './data';
import { getServices, submitLead, loginUser } from './api';
import { APPS_DATA, CATEGORIES_LIST } from './appsData';
import AppWorkspace from './AppWorkspace';
import AppShowcase from './AppShowcase';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';
import AllAppsDirectory from './AllAppsDirectory';
import PrimeProPortal from './PrimeProPortal';
import LiveDemoExperience from './demo/LiveDemoExperience';
import WebsiteDemoViewer from './demo/WebsiteDemoViewer';
import ChooseAppsPage from './ChooseAppsPage';
import AppDemoPage from './AppDemoPage';
import PricingPage from './PricingPage';
import CheckoutPage from './CheckoutPage';
import CustomerLoginPage from './CustomerLoginPage';
import AdminLoginPage from './AdminLoginPage';

function useScrollTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.search]);
}

// -------------------------------------------------------------
// 24 APPS & SERVICES DATA FOR HERO GRID (Exact Match to User Mockup)
// -------------------------------------------------------------
const HERO_APP_CARDS = [
  // Row 1
  { id: 'accounting', label: 'Accounting', iconSrc: '/apps/logo-accounting.png?v=clean', link: '/apps/accounting', withoutPrice: '₹3,500/mo' },
  { id: 'knowledge', label: 'Knowledge', iconSrc: '/apps/logo-knowledge.png?v=clean', link: '/apps/knowledge', withoutPrice: '₹1,800/mo' },
  { id: 'sign', label: 'Sign', iconSrc: '/apps/logo-sign.png?v=clean', link: '/apps/sign', withoutPrice: '₹2,200/mo' },
  { id: 'crm', label: 'CRM', iconSrc: '/apps/logo-crm.png?v=clean', link: '/apps/crm', withoutPrice: '₹4,500/mo' },
  { id: 'studio', label: 'Studio', iconSrc: '/apps/logo-studio.png?v=clean', link: '/apps/studio', withoutPrice: '₹5,000/mo' },
  { id: 'subscriptions', label: 'Subscriptions', iconSrc: '/apps/logo-subscriptions.png?v=clean', link: '/apps/subscriptions', withoutPrice: '₹2,800/mo' },

  // Row 2
  { id: 'ai', label: 'AI', iconSrc: '/apps/logo-ai.png?v=clean', link: '/apps/ai', withoutPrice: '₹3,000/mo' },
  { id: 'pos', label: 'Point of Sale', iconSrc: '/apps/logo-pos.png?v=clean', link: '/apps/pos', withoutPrice: '₹3,800/mo' },
  { id: 'discuss', label: 'Discuss', iconSrc: '/apps/logo-discuss.png?v=clean', link: '/apps/discuss', withoutPrice: '₹1,500/mo' },
  { id: 'documents', label: 'Documents', iconSrc: '/apps/logo-documents.png?v=clean', link: '/apps/documents', withoutPrice: '₹1,900/mo' },
  { id: 'project', label: 'Project', iconSrc: '/apps/logo-project.png?v=clean', link: '/apps/projects', withoutPrice: '₹3,200/mo' },
  { id: 'timesheets', label: 'Timesheets', iconSrc: '/apps/logo-timesheets.png?v=clean', link: '/apps/timesheets', withoutPrice: '₹1,600/mo' },

  // Row 3
  { id: 'field-service', label: 'Field Service', iconSrc: '/apps/logo-field-service.png?v=clean', link: '/apps/field-service', withoutPrice: '₹4,000/mo' },
  { id: 'planning', label: 'Planning', iconSrc: '/apps/logo-planning.png?v=clean', link: '/apps/planning', withoutPrice: '₹2,500/mo' },
  { id: 'helpdesk', label: 'Helpdesk', iconSrc: '/apps/logo-helpdesk.png?v=clean', link: '/apps/helpdesk', withoutPrice: '₹3,500/mo' },
  { id: 'ecommerce', label: 'eCommerce', iconSrc: '/apps/logo-ecommerce.png?v=clean', link: '/apps/ecommerce', withoutPrice: '₹4,900/mo' },
  { id: 'website', label: 'Website', iconSrc: '/apps/logo-website.png?v=clean', link: '/apps/website', withoutPrice: '₹2,900/mo' },
  { id: 'email-marketing', label: 'Email Marketing', iconSrc: '/apps/logo-email-marketing.png?v=clean', link: '/apps/email-marketing', withoutPrice: '₹3,100/mo' },

  // Row 4
  { id: 'purchase', label: 'Purchase', iconSrc: '/apps/logo-purchase.png?v=clean', link: '/apps/purchase', withoutPrice: '₹2,700/mo' },
  { id: 'inventory', label: 'Inventory', iconSrc: '/apps/logo-inventory.png?v=clean', link: '/apps/inventory', withoutPrice: '₹4,800/mo' },
  { id: 'manufacturing', label: 'Manufacturing', iconSrc: '/apps/logo-manufacturing.png?v=clean', link: '/apps/manufacturing', withoutPrice: '₹6,500/mo' },
  { id: 'sales', label: 'Sales', iconSrc: '/apps/logo-sales.png?v=clean', link: '/apps/sales', withoutPrice: '₹4,200/mo' },
  { id: 'hr', label: 'HR', iconSrc: '/apps/logo-hr.png?v=clean', link: '/apps/hr', withoutPrice: '₹3,800/mo' },
  { id: 'dashboard', label: 'Dashboard', iconSrc: '/apps/logo-dashboard.png?v=clean', link: '/apps/dashboard', withoutPrice: '₹2,400/mo' }
];


// -------------------------------------------------------------
// HOMEPAGE VIDEO PLAYER COMPONENT
// -------------------------------------------------------------
function HomepageVideoPlayer({
  srcWebm = "https://download.odoocdn.com/videos/odoo_com/video_homepage.webm",
  srcMp4 = "https://download.odoocdn.com/videos/odoo_com/video_homepage.mp4"
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    if (dur > 0) {
      setProgress((cur / dur) * 100);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekVal = parseFloat(e.target.value);
    const dur = videoRef.current.duration;
    if (dur > 0) {
      videoRef.current.currentTime = (seekVal / 100) * dur;
      setProgress(seekVal);
    }
  };

  return (
    <div className="homepage-video-wrapper">
      <div className="homepage-video-frame">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="homepage-showcase-video"
          key={srcWebm}
        >
          <source src={srcWebm} type="video/webm" />
          {srcMp4 && <source src={srcMp4} type="video/mp4" />}
        </video>
      </div>

      {/* Video Scrubber & Play/Pause Controls */}
      <div className="homepage-video-controls">
        <button
          type="button"
          onClick={togglePlay}
          className="video-ctrl-btn"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? (
            <span className="video-pause-bars" aria-hidden="true">
              <span className="bar" />
              <span className="bar" />
            </span>
          ) : (
            <span className="video-play-arrow" aria-hidden="true">▶</span>
          )}
        </button>

        <div className="video-scrubber-track-wrap">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="video-progress-slider"
            aria-label="Video timeline scrubber"
            style={{
              background: `linear-gradient(to right, #714b67 0%, #714b67 ${progress}%, #cbd5e1 ${progress}%, #cbd5e1 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// HOMEPAGE
// -------------------------------------------------------------
function Home() {
  const [liveServices, setLiveServices] = useState(services);
  const [industrySlide, setIndustrySlide] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const navigate = useNavigate();

  // Hero CTA & Advisor Dropdown State
  const [advisorDropdownOpen, setAdvisorDropdownOpen] = useState(false);
  const advisorRef = useRef(null);

  // Close advisor dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (advisorRef.current && !advisorRef.current.contains(event.target)) {
        setAdvisorDropdownOpen(false);
      }
    }
    if (advisorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [advisorDropdownOpen]);

  const handleStartNow = () => {
    navigate('/choose-apps');
  };

  const handleAdvisorSelect = (option) => {
    setAdvisorDropdownOpen(false);
    navigate('/contact');
  };

  useEffect(() => {
    getServices().then((data) => {
      if (Array.isArray(data) && data.length) {
        setLiveServices(
          data.map((s) => ({
            ...s,
            icon: services.find((x) => x.name === s.name)?.icon || services[0].icon
          }))
        );
      }
    });
  }, []);



  return (
    <>
      <Header />
      <main>
        {/* HERO SECTION (Centered Design Matching User Mockup) */}
        <section className="hero-section hero-section-centered">
          {/* Subtle dot matrix background */}
          <div className="hero-dot-grid" />

          {/* Organic fluid pastel waves on left and right */}
          <div className="hero-wave hero-wave-left" aria-hidden="true">
            <svg viewBox="0 0 450 700" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#67e8f9" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#cffafe" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <path
                d="M-50,0 C120,120 280,180 240,340 C200,500 80,580 -50,700 Z"
                fill="url(#waveGradLeft)"
              />
              <path
                d="M-50,80 C60,200 180,260 140,420 C100,560 0,640 -50,700 Z"
                fill="rgba(167, 243, 208, 0.22)"
              />
            </svg>
          </div>

          <div className="hero-wave hero-wave-right" aria-hidden="true">
            <svg viewBox="0 0 450 700" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#a5f3fc" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#bbf7d0" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <path
                d="M500,0 C330,140 170,220 210,380 C250,540 370,620 500,700 Z"
                fill="url(#waveGradRight)"
              />
              <path
                d="M500,90 C390,210 270,290 310,440 C350,580 440,650 500,700 Z"
                fill="rgba(165, 243, 252, 0.18)"
              />
            </svg>
          </div>

          <div className="hero-centered-content">
            {/* Animated Handwriting Headline & Subtitle */}
            <AnimatedHeroTitle />

            {/* Hero CTAs: Start now - It's free & Meet an advisor (Exact Match to User Reference) */}
            <motion.div
              className="hero-cta-button-group"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <button
                type="button"
                className="hero-btn-start-now"
                onClick={handleStartNow}
              >
                Start now - It's free
              </button>

              <div className="hero-advisor-dropdown-wrapper" ref={advisorRef}>
                <button
                  type="button"
                  className={`hero-btn-meet-advisor ${advisorDropdownOpen ? 'active' : ''}`}
                  onClick={() => setAdvisorDropdownOpen((prev) => !prev)}
                  aria-expanded={advisorDropdownOpen}
                  aria-haspopup="true"
                >
                  Meet an advisor
                </button>

                <AnimatePresence>
                  {advisorDropdownOpen && (
                    <motion.div
                      className="hero-advisor-dropdown-menu"
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                    >
                      <button
                        type="button"
                        className="hero-advisor-menu-item"
                        onClick={() => handleAdvisorSelect('demo-expert')}
                      >
                        Demo with an Expert (1-50 employees)
                      </button>
                      <button
                        type="button"
                        className="hero-advisor-menu-item"
                        onClick={() => handleAdvisorSelect('project-assessment')}
                      >
                        Project Assessment (250+ employees)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Trust Checkmarks */}
            <motion.div
              className="hero-trust-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <span className="hero-trust-item">
                <span className="trust-check-badge"><Check size={12} strokeWidth={3} /></span>
                <span>No credit card required</span>
              </span>
              <span className="hero-trust-item">
                <span className="trust-check-badge"><Check size={12} strokeWidth={3} /></span>
                <span>Free consultation</span>
              </span>
              <span className="hero-trust-item">
                <span className="trust-check-badge"><Check size={12} strokeWidth={3} /></span>
                <span>Quick setup</span>
              </span>
            </motion.div>

            {/* 24 App & Features Grid */}
            <motion.div
              className="hero-apps-grid-24"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {HERO_APP_CARDS.map((app) => (
                <Link
                  key={app.id}
                  to={app.link}
                  className="hero-app-card-item"
                  title={`${app.label} - Click to explore`}
                >
                  <div className="app-card-tile">
                    <img
                      src={app.iconSrc}
                      alt={app.label}
                      className="app-card-img"
                      loading="lazy"
                    />
                  </div>
                  <span className="app-card-title">{app.label}</span>
                </Link>
              ))}
            </motion.div>

            {/* Bottom Bar: View all Apps Link */}
            <div className="hero-apps-grid-bottom-bar">
              <Link to="/apps" className="view-all-apps-action">
                <span>View all Apps</span>
                <span className="arrow-disc">➔</span>
              </Link>
            </div>
          </div>
        </section>


        {/* IMAGINE A VAST COLLECTION OF BUSINESS APPS (Exact Match to User Reference) */}
        <section className="vast-collection-section">
          <div className="vast-collection-container">
            <h2 className="vast-collection-title">
              Imagine a vast collection of business apps at your disposal.
            </h2>
            <p className="vast-collection-lead">
              Got something to improve? There is an app for that.
              <br />
              No complexity, no cost, just a one-click install.
            </p>

            <p className="vast-collection-sub">
              Each app simplifies a process and empowers more people.
              <br />
              Imagine the impact when everyone gets the right tool for the job, tailored with native AI.
            </p>

            {/* Quote Persona Callout (Bill McDermott) */}
            <div className="vast-quote-persona">
              {/* Yellow background brush splash */}
              <img
                src="/persona_bg_yellow.svg"
                alt=""
                className="persona-yellow-bg"
                aria-hidden="true"
                loading="lazy"
              />

              {/* Persona avatar + smiley speech bubble */}
              <div className="persona-avatar-wrap">
                <div className="persona-speech-bubble" aria-hidden="true">
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <path
                      d="M17 3 C9.2 3 3 8.8 3 16 C3 20 4.8 23.5 7.8 25.8 C7.3 28.2 5.8 30.2 4.2 31.8 C7.5 31.8 11.2 30.5 13.8 28.7 C14.8 28.9 15.9 29 17 29 C24.8 29 31 23.2 31 16 C31 8.8 24.8 3 17 3 Z"
                      fill="#ffffff"
                      stroke="#1e293b"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="14" r="1.6" fill="#1e293b" />
                    <circle cx="22" cy="14" r="1.6" fill="#1e293b" />
                    <path
                      d="M12 18.5 C13.5 21.5 20.5 21.5 22 18.5"
                      stroke="#1e293b"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>
                <img
                  src="/persona_bill.png"
                  alt="CEO, PrimePro.ai Technologies"
                  className="persona-avatar-img"
                  loading="lazy"
                />
              </div>

              {/* White rounded pill quote card */}
              <div className="persona-quote-card">
                <span className="persona-quote-text">
                  “If you simplify everything, you can do anything!”
                </span>
                <span className="persona-quote-author">
                  — CEO, PrimePro.ai Technologies
                </span>
              </div>
            </div>
          </div>

          {/* Organic white bottom wave transitioning to the next section */}
          <div className="vast-collection-bottom-wave" aria-hidden="true">
            <svg viewBox="0 0 1440 90" fill="none" preserveAspectRatio="none">
              <path
                d="M0,25 C380,85 860,10 1440,55 L1440,90 L0,90 Z"
                fill="#ffffff"
              />
            </svg>
          </div>
        </section>

        {/* LEVEL UP YOUR QUALITY OF WORK & OPTIMIZED FOR PRODUCTIVITY (Exact Match to User Reference) */}
        <section className="level-up-section" id="about">
          {/* Part 1: Level up your quality of work + Interactive Video */}
          <div className="level-up-container">
            <h2 className="level-up-headline">
              <span className="hl-red-wrap">
                <span className="hl-text">Level up</span>
              </span>{' '}
              your quality of{' '}
              <span className="hl-teal-wrap">
                <span className="hl-text">work</span>
                <span className="hl-teal-stroke" aria-hidden="true" />
              </span>
            </h2>

            <HomepageVideoPlayer />
          </div>

          {/* Part 2: Optimized for productivity + Layered Tasks & Ask AI collage */}
          <div className="productivity-container">
            <div className="productivity-doodle-bg" aria-hidden="true">
              <img src="/home/doodle_yellow.svg" alt="" loading="lazy" />
            </div>

            <h2 className="productivity-headline">
              Optimized for{' '}
              <span className="hl-yellow-wrap">
                <span className="hl-text">productivity</span>
                <span className="hl-yellow-stroke" aria-hidden="true" />
              </span>
            </h2>

            {/* Layered Showcase: Tasks, Notifications & Ask AI */}
            <div className="productivity-showcase-grid">
              {/* Left Floating Card: Activities / Notifications */}
              <motion.div
                className="prod-card-activities"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <img
                  src="/home/speed_4.webp"
                  alt="Activities and notification tasks"
                  loading="lazy"
                />
              </motion.div>

              {/* Central Card: Kanban Floorplan & Kitchen Architecture Tasks */}
              <motion.div
                className="prod-card-kanban"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src="/home/speed_1.webp"
                  alt="Project Kanban and Floorplan tasks"
                  loading="lazy"
                />
              </motion.div>

              {/* Right Floating Card: Ask AI Chat */}
              <motion.div
                className="prod-card-ai"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <img
                  src="/home/speed_3.webp"
                  alt="Ask AI real-time intelligence assistant"
                  loading="lazy"
                />
              </motion.div>
            </div>

            <p className="productivity-footer-lead">
              <strong>Experience true speed,</strong> reduced data entry, smart AI, and a fast UI. All operations are done in less than 90ms - faster than a blink.
            </p>
          </div>
        </section>

        {/* COMPARE WITH SAP & NATIVE AI VIDEO SECTION (Image 3) */}
        <section className="native-ai-section">
          {/* Compare with SAP link with hand-drawn arrow */}
          <div className="compare-sap-wrapper">
            <div className="compare-sap-arrow-doodle" aria-hidden="true">
              <svg viewBox="0 0 30 50" width="24" height="42" fill="none">
                <path d="M15 5 C18 20 8 32 15 45" stroke="#db2777" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M8 38 L15 46 L22 39" stroke="#db2777" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <button
              type="button"
              className="compare-sap-btn"
              onClick={() => setVideoOpen(true)}
            >
              <svg viewBox="0 0 28 20" width="22" height="16" fill="none" className="sap-play-icon">
                <rect x="1" y="1" width="26" height="18" rx="5" stroke="#ef4444" strokeWidth="2" fill="none" />
                <polygon points="11,6 19,10 11,14" fill="#ef4444" />
              </svg>
              <span>Compare with SAP</span>
            </button>
          </div>

          <div className="native-ai-container">
            <h2 className="native-ai-headline">
              <span className="hl-coral-wrap">
                <span className="hl-text">Native AI</span>
              </span>{' '}
              across all your business
            </h2>

            <HomepageVideoPlayer
              srcWebm="https://download.odoocdn.com/videos/odoo_com/video_ai_homepage.webm"
              srcMp4="https://download.odoocdn.com/videos/odoo_com/video_ai_homepage.mp4"
            />

            <p className="native-ai-subtext">
              Automate work, tailor features, perform deep research, and <strong>scale without limits</strong>.
            </p>
          </div>
        </section>

        {/* ENTERPRISE SOFTWARE DONE RIGHT (Image 3 & 4) */}
        <section className="enterprise-done-right-section">
          <div className="enterprise-container">
            <h2 className="enterprise-headline">
              Enterprise{' '}
              <span className="software-loop-wrap">
                <span className="loop-text">software</span>
                <svg className="software-loop-svg" viewBox="0 0 180 70" fill="none" aria-hidden="true">
                  <ellipse cx="90" cy="35" rx="84" ry="28" stroke="#00a09d" strokeWidth="3" transform="rotate(-3 90 35)" />
                </svg>
              </span>{' '}
              done{' '}
              <span className="right-underline-wrap">
                <span className="underline-text">right.</span>
                <span className="right-blue-stroke" aria-hidden="true" />
              </span>
            </h2>

            <div className="enterprise-bento-grid">
              {/* Card 1: Open source */}
              <div className="bento-card bento-card-open-source">
                <h3>Open source</h3>
                <p>
                  Behind the technology is a community of 100k+ developers collaborating worldwide.
                  We're united by the spirit of open source, and a common vision: "to transform companies, empower employees".
                </p>
                <div className="bento-editions-sub">
                  <p>PrimePro is available in two editions:</p>
                  <p>• <strong>Community:</strong> Open Source, 100% free.</p>
                  <p>• <strong>Enterprise:</strong> extra apps, infrastructure and professional services.</p>
                </div>
                <button type="button" className="bento-purple-btn" onClick={handleStartNow}>
                  Compare Editions
                </button>
              </div>

              {/* Card 2: No vendor lock-in */}
              <div className="bento-card bento-card-lockin">
                <h3>No vendor lock-in</h3>
                <p>
                  No proprietary data format, just PostgreSQL: you own your data.
                  No software lock-in: you get the source code, GitHub access, and the flexibility to host on our infrastructure, or on premise.
                </p>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bento-purple-btn"
                >
                  Follow us on GitHub
                </a>
              </div>

              {/* Card 3: Open Source + AI = ❤️ */}
              <div className="bento-card bento-card-ai">
                <h3>Open Source + AI = ❤️</h3>
                <p>
                  Use PrimePro.sh to develop or vibe-code tailored modules. As we are open source, LLMs are already trained on our source code.
                </p>
                <div className="bento-code-img-frame">
                  <img src="/home/claude.webp" alt="PrimePro AI vibe-coding terminal" loading="lazy" />
                </div>
                <Link to="/apps" className="bento-purple-btn">
                  Browse Community Apps
                </Link>
              </div>

              {/* Card 4: Fair pricing */}
              <div className="bento-card bento-card-pricing">
                <h3>Fair pricing</h3>
                <p>
                  No usage-based pricing, no feature upselling, no long term contracts, no hosting limits, no surprises... just a single price per user - all inclusive.
                </p>
                <button type="button" className="bento-purple-btn" onClick={handleStartNow}>
                  View Pricing
                </button>
              </div>

              {/* Card 5: A unique value proposition */}
              <div className="bento-card bento-card-value-prop">
                <h3>A unique value proposition</h3>
                <div className="bento-chart-frame">
                  <img src="/home/unique-value-2024.svg" alt="Unique value proposition chart vs SAP, Salesforce, Microsoft" loading="lazy" />
                </div>
              </div>

              {/* Card 6: No corporate bullsh*t */}
              <div className="bento-card bento-card-quote">
                <h3>No corporate bullsh*t</h3>
                <blockquote className="competitor-quote">
                  “With most systems, you get 70% of what you hoped. With PrimePro, you get more than what you expected. You, guys, will transform the market.”
                </blockquote>
                <span className="competitor-author">- Anonymous competitor</span>
              </div>
            </div>
          </div>
        </section>

        {/* JOIN 28 MILLION HAPPY USERS MOSAIC SECTION (Image 4) */}
        <JoinMosaic />
        {false && <section className="join-users-mosaic-section">
          {/* Subtle curved hand-drawn accent lines */}
          <div className="mosaic-doodle-arrow mosaic-arrow-left" aria-hidden="true">
            <svg viewBox="0 0 60 80" width="50" height="70" fill="none">
              <path d="M10 10 C35 30 15 60 45 75" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" />
              <polygon points="48,70 54,78 43,80" fill="#a855f7" />
            </svg>
          </div>
          <div className="mosaic-doodle-arrow mosaic-arrow-right" aria-hidden="true">
            <svg viewBox="0 0 60 80" width="50" height="70" fill="none">
              <path d="M50 10 C25 30 45 60 15 75" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" />
              <polygon points="12,70 6,78 17,80" fill="#a855f7" />
            </svg>
          </div>

          <div className="mosaic-container">
            {/* Avatar / Squarcle Mosaic Grid */}
            <div className="mosaic-grid">
              <span className="tile tile-blank" />
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="" className="tile tile-avatar" />
              <span className="tile tile-purple" />
              <span className="tile tile-blank" />
              <span className="tile tile-circle" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="" className="tile tile-avatar" />
              <span className="tile tile-purple" />
              <span className="tile tile-blank" />
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" alt="" className="tile tile-avatar" />
              <span className="tile tile-circle" />
              <span className="tile tile-blank" />
              <span className="tile tile-purple" />

              <span className="tile tile-blank" />
              <span className="tile tile-circle" />
              <span className="tile tile-purple" />
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" alt="" className="tile tile-avatar" />
              <span className="tile tile-blank" />
              <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80" alt="" className="tile tile-avatar" />
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" alt="" className="tile tile-avatar" />
              <span className="tile tile-purple" />

              <span className="tile tile-purple" />
              <span className="tile tile-blank" />
              <span className="tile tile-purple" />
              <span className="tile tile-circle" />
              <span className="tile tile-purple" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="" className="tile tile-avatar" />

              <span className="tile tile-blank" />
              <span className="tile tile-purple" />
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80" alt="" className="tile tile-avatar" />
              <span className="tile tile-circle" />
              <span className="tile tile-purple" />
              <span className="tile tile-blank" />
              <span className="tile tile-circle" />

              <span className="tile tile-circle" />
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80" alt="" className="tile tile-avatar" />
              <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80" alt="" className="tile tile-avatar" />
              <span className="tile tile-circle" />
              <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80" alt="" className="tile tile-avatar" />
              <span className="tile tile-purple" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80" alt="" className="tile tile-avatar" />
            </div>

            {/* Center Floating White Pill */}
            <div className="mosaic-center-pill">
              <div className="happy-doodle-annotation">
                <svg viewBox="0 0 45 25" width="34" height="18" fill="none">
                  <path d="M5 20 Q22 4 40 18" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M34 10 L41 18 L32 21" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="happy-cursive-word">happy</span>
              </div>
              <h3 className="join-users-title">Join 28 million users</h3>
              <p className="join-users-caption">who grow their business with PrimePro</p>
            </div>
          </div>
        </section>}

        {/* KPMG TESTIMONIAL SECTION (Image 4) */}
        <section className="kpmg-quote-section">
          <div className="kpmg-quote-container">
            <div className="kpmg-quote-mark" aria-hidden="true">
              <svg viewBox="0 0 40 32" width="36" height="28" fill="#d97706">
                <path d="M0 18 C0 8 6 2 16 0 L18 5 C11 7 8 11 8 15 L16 15 L16 32 L0 32 Z M22 18 C22 8 28 2 38 0 L40 5 C33 7 30 11 30 15 L38 15 L38 32 L22 32 Z" />
              </svg>
            </div>
            <div className="kpmg-quote-content">
              <p className="kpmg-quote-text">
                The processing time for accounting documents has been noticeably reduced, in certain cases even from 2 days to only 5 hours. As a result we can now focus on what matters: reporting and advising the client.
              </p>
              <div className="kpmg-author-row">
                <div className="kpmg-author-meta">
                  <b className="kpmg-author-name">Harry Van Donink</b>
                  <span className="kpmg-author-role">CEO KPMG Belgium</span>
                </div>
                <img src="/home/van_donink.webp" alt="Harry Van Donink" className="kpmg-author-photo" />
                <img src="/home/kpmg_logo.svg" alt="KPMG" className="kpmg-logo-img" />
              </div>
            </div>
          </div>
        </section>

        {/* UNLEASH YOUR GROWTH POTENTIAL CTA (Image 4) */}
        <section className="unleash-bottom-cta-section">
          <div className="unleash-sunburst-doodle" aria-hidden="true">
            <svg viewBox="0 0 160 80" width="130" height="65" fill="none">
              <line x1="80" y1="75" x2="80" y2="15" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="55" y1="75" x2="30" y2="25" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="105" y1="75" x2="130" y2="25" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="35" y1="78" x2="10" y2="48" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="125" y1="78" x2="150" y2="48" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
          </div>

          <h2 className="bottom-cta-title">
            Unleash
            <br />
            <span className="cursive-growth-text">your growth potential</span>
          </h2>

          <div className="unleash-action-wrap">
            <button
              type="button"
              className="unleash-start-btn"
              onClick={handleStartNow}
            >
              Start now - It's free
            </button>
            <div className="unleash-micro-note">
              <span className="arrow-up-teal">↑</span>
              <span>No credit card required • Instant access</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
    </>
  );
}

// -------------------------------------------------------------
// SERVICES CATALOG PAGE (/services)
// -------------------------------------------------------------
function ServicesPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'All Categories';
  const initialSearch = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState('apps'); // 'apps' or 'services'
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Filter 24 Applications in exact specified order
  const filteredApps = APPS_DATA.filter((app) => {
    const matchCat = selectedCategory === 'All Categories' || app.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = search.trim().toLowerCase();
    const matchQuery = !query ||
      app.name.toLowerCase().includes(query) ||
      app.tagline.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query) ||
      app.features.some(f => f.toLowerCase().includes(query));
    return matchCat && matchQuery;
  });

  // Filter Professional Services
  const filteredServices = services.filter((s) => {
    const matchCat = selectedCategory === 'All Categories' || s.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const query = search.trim().toLowerCase();
    const matchQuery = !query ||
      `${s.name} ${s.description} ${s.category}`.toLowerCase().includes(query);
    return matchCat && matchQuery;
  });

  const handleClear = () => {
    setSearch('');
    setSelectedCategory('All Categories');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <>
      <Header />
      <main className="inner-page">
        <section className="catalog-hero-header">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <span>Applications & Services Directory</span>
          </div>
          <h1>
            Oxoo.ai Business <span className="gradient-text">Directory</span>
          </h1>
          <p>Explore all 24 connected business applications, integrated services, and departmental tools in one place.</p>

          <div className="catalog-search-bar">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by app name, description, features... (Press Esc to clear)"
              aria-label="Search applications"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                Clear
              </button>
            )}
          </div>
        </section>

        <section className="catalog-main-layout">
          {/* Left Category Filter Sidebar */}
          <aside className="catalog-sidebar">
            <div className="sidebar-box">
              <h3>
                <Filter size={16} /> Business Categories
              </h3>
              <ul className="cat-checkbox-list">
                {CATEGORIES_LIST.map((catName) => {
                  const count = catName === 'All Categories'
                    ? (activeTab === 'apps' ? APPS_DATA.length : services.length)
                    : (activeTab === 'apps'
                        ? APPS_DATA.filter(a => a.category.toLowerCase() === catName.toLowerCase()).length
                        : services.filter(s => s.category.toLowerCase().includes(catName.toLowerCase())).length);
                  return (
                    <li key={catName}>
                      <button
                        type="button"
                        className={`sidebar-cat-btn ${selectedCategory === catName ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(catName)}
                      >
                        <span>{catName}</span>
                        <small>{count}</small>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Right Results Column */}
          <div className="catalog-content-col">
            <div className="catalog-toolbar-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <div className="catalog-view-toggle">
                <button
                  type="button"
                  className={`catalog-toggle-btn ${activeTab === 'apps' ? 'active' : ''}`}
                  onClick={() => setActiveTab('apps')}
                >
                  24 Business Applications ({filteredApps.length})
                </button>
                <button
                  type="button"
                  className={`catalog-toggle-btn ${activeTab === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveTab('services')}
                >
                  Consulting & Services ({filteredServices.length})
                </button>
              </div>

              {(search || selectedCategory !== 'All Categories') && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="button button-small button-outline"
                  style={{ fontSize: '12px' }}
                >
                  ✕ Reset Filters
                </button>
              )}
            </div>

            {activeTab === 'apps' ? (
              filteredApps.length > 0 ? (
                <div className="apps-directory-grid">
                  {filteredApps.map((app) => (
                    <div key={app.id} className="app-directory-card">
                      <div className="app-dir-header">
                        <div className="app-dir-icon-tile">
                          <img src={app.iconSrc} alt={app.name} className="app-dir-icon-img" loading="lazy" />
                        </div>
                        <div>
                          <h3 className="app-dir-name">{app.name}</h3>
                          <span className="app-dir-category-pill">{app.category}</span>
                        </div>
                      </div>
                      <p className="app-dir-tagline">{app.tagline}</p>
                      <div className="app-dir-features">
                        {app.features.slice(0, 3).map((feat) => (
                          <span key={feat} className="app-dir-feat-chip">
                            <Check size={11} strokeWidth={3} /> {feat}
                          </span>
                        ))}
                      </div>
                      <div className="app-dir-footer">
                        <Link to={`/apps/${app.slug}`} className="app-dir-launch-btn">
                          Open Workspace <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-catalog-state">
                  <Search size={36} />
                  <h3>No applications found</h3>
                  <p>No business applications matched your search keyword or selected category.</p>
                  <button type="button" className="button button-emerald" onClick={handleClear}>
                    Clear Filters
                  </button>
                </div>
              )
            ) : (
              filteredServices.length > 0 ? (
                <div className="service-cards-responsive-grid">
                  {filteredServices.map((s, idx) => (
                    <ServiceCard key={s.slug} service={s} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="empty-catalog-state">
                  <Search size={36} />
                  <h3>No services found</h3>
                  <p>Try searching with another keyword or resetting the category filter.</p>
                  <button type="button" className="button button-emerald" onClick={handleClear}>
                    Clear Filters
                  </button>
                </div>
              )
            )}
          </div>
        </section>

        <CTA
          title="Need a Custom Business Solution?"
          description="We build bespoke workflows, multi-company ERP architectures, and specialized integrations tailored to your business."
          button="Request Custom Consultation"
        />
      </main>
      <Footer />
    </>
  );
}

// -------------------------------------------------------------
// SERVICE DETAIL PAGE (/services/:slug)
// -------------------------------------------------------------
function ServiceDetail() {
  const { slug } = useParams();
  const service = services.find((s) => s.slug === slug) || services[0];
  const Icon = service.icon;
  const [activeTab, setActiveTab] = useState('Overview');
  const related = services.filter((s) => s.category === service.category && s.slug !== service.slug).slice(0, 3);

  const tabs = ['Overview', 'Features', 'Benefits', 'Integrations', 'Pricing', 'FAQs'];

  return (
    <>
      <Header />
      <main className="inner-page">
        <section className="service-detail-hero">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <Link to="/services">Services</Link>
            <ChevronRight size={13} />
            <span>{service.name}</span>
          </div>

          <div className="detail-hero-two-col">
            <div className="detail-hero-left">
              <span className={`detail-pill-icon icon-${service.color}`}>
                <Icon size={28} />
              </span>
              <h1>{service.name}</h1>
              <h2 className="detail-tagline">
                Build stronger customer relationships and grow your business.
              </h2>
              <p className="detail-desc">
                A powerful {service.name} solution to manage leads, sales, operations, and customer interactions in one place.
              </p>

              <div className="detail-actions">
                <Link to="/contact" className="button button-emerald">
                  Request a Quote
                </Link>
                <Link to="/contact" className="button button-outline">
                  Book a Demo
                </Link>
              </div>
            </div>

            {/* Mockup Preview of the Service Dashboard */}
            <div className="detail-hero-right">
              <div className="detail-mockup-frame">
                <div className="mockup-screen-bar">
                  <div className="mock-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <small>{service.name} Portal</small>
                </div>
                <div className="mockup-content">
                  <div className="mock-stat-tile">
                    <small>Pipeline Value</small>
                    <b>₹18,40,000</b>
                  </div>
                  <div className="mock-stat-tile">
                    <small>Win Rate</small>
                    <b>68.4%</b>
                  </div>
                  <div className="mock-bars-visual">
                    <div style={{ height: '40%' }} />
                    <div style={{ height: '70%' }} />
                    <div style={{ height: '55%' }} />
                    <div style={{ height: '90%' }} />
                    <div style={{ height: '80%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="detail-tabs-bar">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {/* KEY FEATURES SECTION */}
        <section className="section detail-features-section">
          <SectionHeading
            eyebrow="CAPABILITIES & WORKFLOWS"
            title="Key Features"
            description={`Everything your team needs to succeed with ${service.name}.`}
          />

          <div className="key-features-six-grid">
            {[
              {
                title: 'Lead Management',
                desc: 'Capture, qualify and automatically assign leads to your sales reps in real-time.',
                icon: Users,
                color: 'blue'
              },
              {
                title: 'Sales Pipeline',
                desc: 'Visualize deal stages, track deal values, and forecast revenue with drag-and-drop ease.',
                icon: BarChart3,
                color: 'purple'
              },
              {
                title: 'Contact Management',
                desc: 'Consolidate 360-degree customer histories, conversations, and transaction records.',
                icon: ShieldCheck,
                color: 'green'
              },
              {
                title: 'Automation',
                desc: 'Automate follow-up emails, reminders, quotation approvals, and recurring tasks.',
                icon: Zap,
                color: 'orange'
              },
              {
                title: 'Reports & Analytics',
                desc: 'Make data-backed decisions with automated KPI dashboards and executive reports.',
                icon: TrendingUp,
                color: 'pink'
              },
              {
                title: 'Integrations',
                desc: 'Seamlessly connect with WhatsApp, Gmail, Outlook, payment gateways, and accounting.',
                icon: Puzzle,
                color: 'cyan'
              }
            ].map((f) => {
              const FIcon = f.icon;
              return (
                <div key={f.title} className="key-feature-card">
                  <span className={`feat-icon-badge ${f.color}`}>
                    <FIcon size={20} />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {related.length > 0 && (
          <section className="section">
            <SectionHeading
              eyebrow="RECOMMENDED PAIRINGS"
              title="Related Solutions"
              description="Tools that connect directly with this service."
            />
            <div className="service-cards-responsive-grid">
              {related.map((r, i) => (
                <ServiceCard key={r.slug} service={r} index={i} />
              ))}
            </div>
          </section>
        )}

        <CTA
          title={`Ready to deploy ${service.name}?`}
          description="Speak with our implementation architects to tailor this solution to your workflow."
          button="Schedule a Consultation"
        />
      </main>
      <Footer />
    </>
  );
}

// -------------------------------------------------------------
// INDUSTRIES PAGE (/industries)
// -------------------------------------------------------------
function IndustriesPage() {
  return (
    <>
      <Header />
      <main className="inner-page">
        <section className="catalog-hero-header">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <span>Industries</span>
          </div>
          <h1>
            Solutions for <span className="gradient-text">Every Industry</span>
          </h1>
          <p>Tailored software, products and services to meet the unique needs of your business.</p>
        </section>

        <section className="section">
          <div className="industry-full-grid">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <motion.article
                  key={ind.name}
                  className="industry-card large-card"
                  whileHover={{ y: -6 }}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    className="industry-photo-large"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(8,24,53,0.05) 0%, rgba(8,24,53,0.45) 100%), url(https://images.unsplash.com/${ind.image}?auto=format&fit=crop&w=800&q=80)`
                    }}
                  >
                    <span className="ind-pill-badge">
                      <Icon size={16} /> {ind.name}
                    </span>
                  </div>
                  <div className="industry-info-body">
                    <h3>{ind.name}</h3>
                    <p>{ind.desc}</p>
                    <Link to="/contact" className="explore-ind-link">
                      Explore solution <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <CTA
          title="Looking for a Custom Industry Setup?"
          description="We customize modules, workflows, and compliance checks for your specific vertical."
          button="Talk with an Industry Expert"
        />
      </main>
      <Footer />
    </>
  );
}

// -------------------------------------------------------------
// PRICING PAGE (/pricing) is imported from ./PricingPage.jsx
// -------------------------------------------------------------

// -------------------------------------------------------------
// CONTACT & BOOKING DEMO PAGE (/contact)
// -------------------------------------------------------------
function ContactPage() {
  const [activeTab, setActiveTab] = useState('Book a Demo');
  const [selectedDate, setSelectedDate] = useState(14);
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'CRM',
    preferredDate: '2026-10-14',
    requirements: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        service: form.service,
        message: `[${activeTab}] Slot: ${selectedSlot}, Day: ${selectedDate}. Requirements: ${form.requirements}`
      });
      setStatus('success');
      setForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: 'CRM',
        preferredDate: '2026-10-14',
        requirements: ''
      });
    } catch (err) {
      setStatus(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="inner-page">
        <section className="catalog-hero-header">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <span>Contact</span>
          </div>
          <h1>
            Let's Build Something <span className="gradient-text">Great Together</span>
          </h1>
          <p>Book a demo, get a free consultation, or ask us anything. Our team will get back to you shortly.</p>

          <div className="contact-nav-tabs">
            {['Book a Demo', 'Contact Us', 'Request a Quote'].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        <section className="section contact-form-grid-layout">
          {/* Left Column: Form */}
          <div className="contact-form-container">
            {status === 'success' && (
              <div className="form-alert success">
                <CheckCircle2 size={18} />
                <span>Thank you! Your demo request has been scheduled. Check your email for calendar invite.</span>
              </div>
            )}
            {status && status !== 'success' && (
              <div className="form-alert error">{status}</div>
            )}

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-two-col">
                <label>
                  Full Name *
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={update}
                    placeholder="John Doe"
                  />
                </label>

                <label>
                  Business Email *
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={update}
                    placeholder="john@company.com"
                  />
                </label>
              </div>

              <div className="form-two-col">
                <label>
                  Phone Number *
                  <div className="phone-input-wrap">
                    <span className="country-code">🇮🇳 +91</span>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={update}
                      placeholder="98765 43210"
                    />
                  </div>
                </label>

                <label>
                  Company Name *
                  <input
                    required
                    name="company"
                    value={form.company}
                    onChange={update}
                    placeholder="Your Company"
                  />
                </label>
              </div>

              <div className="form-two-col">
                <label>
                  Interested In
                  <select name="service" value={form.service} onChange={update}>
                    {services.map((s) => (
                      <option key={s.slug} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Preferred Date
                  <input
                    type="date"
                    name="preferredDate"
                    value={form.preferredDate}
                    onChange={update}
                  />
                </label>
              </div>

              <label className="field-full">
                Your Requirements
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={update}
                  placeholder="Tell us about your team size, workflow needs, or questions..."
                  rows="4"
                />
              </label>

              <button
                type="submit"
                className="button button-emerald button-large full-button"
                disabled={loading}
              >
                {loading ? 'Scheduling...' : `${activeTab} ➔`}
              </button>
            </form>
          </div>

          {/* Right Column: Interactive Calendar + Direct Contact */}
          <div className="contact-sidebar-schedule">
            <div className="calendar-picker-card">
              <div className="calendar-card-header">
                <b>Select a Date & Time</b>
                <div className="cal-month-nav">
                  <small>November 2026</small>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Day grid */}
              <div className="cal-grid">
                <span className="cal-day-head">Su</span>
                <span className="cal-day-head">Mo</span>
                <span className="cal-day-head">Tu</span>
                <span className="cal-day-head">We</span>
                <span className="cal-day-head">Th</span>
                <span className="cal-day-head">Fr</span>
                <span className="cal-day-head">Sa</span>

                {[...Array(30)].map((_, i) => {
                  const day = i + 1;
                  return (
                    <button
                      key={day}
                      type="button"
                      className={`cal-date-btn ${selectedDate === day ? 'selected' : ''}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div className="time-slots-section">
                <small className="slot-title">Available Slots</small>
                <div className="slots-pills-row">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`slot-pill ${selectedSlot === slot ? 'active' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Contact Card */}
            <div className="direct-contact-card">
              <b>Or Contact Us Directly</b>
              <div className="direct-links-list">
                <a href="tel:+917940500100" className="direct-link">
                  <Phone size={16} /> +91 79 4050 0100
                </a>
                <a href="mailto:hello@oxoo.ai" className="direct-link">
                  <Mail size={16} /> hello@oxoo.ai
                </a>
                <div className="direct-link">
                  <MessageCircle size={16} /> Chat with our team
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// -------------------------------------------------------------
// SIGN IN ROUTER (/signin & /login compatibility)
// -------------------------------------------------------------
function SignInRouter() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  if (searchParams.get('role') === 'admin') {
    return <AdminLoginPage />;
  }
  return <CustomerLoginPage />;
}

// -------------------------------------------------------------
// NOT FOUND
// -------------------------------------------------------------
function NotFound() {
  return (
    <>
      <Header />
      <main className="not-found">
        <span className="eyebrow">404 · PAGE NOT FOUND</span>
        <h1>
          Looks like this path<br />
          needs a <span className="gradient-text">new direction.</span>
        </h1>
        <Link to="/" className="button button-emerald">
          Back to Homepage <ArrowRight />
        </Link>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  useScrollTop();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/choose-apps" element={<ChooseAppsPage />} />
      <Route path="/apps" element={<AllAppsDirectory />} />
      <Route path="/all-apps" element={<AllAppsDirectory />} />
      <Route path="/apps/:appSlug" element={<AppShowcase />} />
      <Route path="/apps/:appSlug/portal" element={<PrimeProPortal />} />
      <Route path="/apps/:appSlug/workspace" element={<AppWorkspace />} />
      <Route path="/apps/:appSlug/demo" element={<AppDemoPage />} />
      <Route path="/apps/:appSlug/live-demo" element={<WebsiteDemoViewer />} />
      <Route path="/demo" element={<AppDemoPage />} />
      <Route path="/demo/request" element={<AppDemoPage />} />
      <Route path="/demo/live" element={<WebsiteDemoViewer />} />
      <Route path="/demo/ai" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/demo/ai-demo" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/demo/productivity" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/demo/sales" element={<WebsiteDemoViewer defaultDemo="sales-demo" />} />
      <Route path="/demo/sales-demo" element={<WebsiteDemoViewer defaultDemo="sales-demo" />} />
      <Route path="/demo/hrms" element={<WebsiteDemoViewer defaultDemo="hrms-demo" />} />
      <Route path="/demo/hrms-demo" element={<WebsiteDemoViewer defaultDemo="hrms-demo" />} />
      <Route path="/demo/finance" element={<WebsiteDemoViewer defaultDemo="finance-demo" />} />
      <Route path="/demo/finance-demo" element={<WebsiteDemoViewer defaultDemo="finance-demo" />} />
      <Route path="/demo/oxoo-finance-demo" element={<WebsiteDemoViewer defaultDemo="finance-demo" />} />
      <Route path="/demo/supply-chain" element={<WebsiteDemoViewer defaultDemo="supply-chain-demo" />} />
      <Route path="/demo/supply-chain-demo" element={<WebsiteDemoViewer defaultDemo="supply-chain-demo" />} />
      <Route path="/demo/website" element={<WebsiteDemoViewer defaultDemo="website-builder-demo" />} />
      <Route path="/demo/website-demo" element={<WebsiteDemoViewer defaultDemo="website-builder-demo" />} />
      <Route path="/demo/website-builder-demo" element={<WebsiteDemoViewer defaultDemo="website-builder-demo" />} />
      {/* Direct demo static path fallbacks */}
      <Route path="/dashboard/overview" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/overview/*" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/ai-chat" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/voice-ai" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/appointments" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/patient-crm" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/agents" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/leads" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/conversations" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/sequences" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/settings" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/billing" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/profile" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/notifications" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/assignment" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/dashboard/*" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/sign-in" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/sign-in/*" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/sign-up" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/sign-up/*" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/ai-demo/*" element={<WebsiteDemoViewer defaultDemo="ai-demo" />} />
      <Route path="/sales-demo/*" element={<WebsiteDemoViewer defaultDemo="sales-demo" />} />
      <Route path="/hrms-demo/*" element={<WebsiteDemoViewer defaultDemo="hrms-demo" />} />
      <Route path="/finance-demo/*" element={<WebsiteDemoViewer defaultDemo="finance-demo" />} />
      <Route path="/supply-chain-demo/*" element={<WebsiteDemoViewer defaultDemo="supply-chain-demo" />} />
      <Route path="/website-builder-demo/*" element={<WebsiteDemoViewer defaultDemo="website-builder-demo" />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/:slug" element={<AppShowcase />} />
      <Route path="/services/:slug/portal" element={<PrimeProPortal />} />
      <Route path="/services/:slug/workspace" element={<AppWorkspace />} />
      <Route path="/portal" element={<PrimeProPortal />} />
      <Route path="/industries" element={<IndustriesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/buy" element={<CheckoutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/customer/login" element={<CustomerLoginPage />} />
      <Route path="/customer-login" element={<CustomerLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/signin" element={<SignInRouter />} />
      <Route path="/login" element={<SignInRouter />} />
      <Route path="/customer" element={<CustomerDashboard />} />
      <Route path="/dashboard" element={<CustomerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
