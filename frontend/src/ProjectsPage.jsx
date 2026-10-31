import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, Phone, Mail, Check, CheckCircle2,
  Calendar, Clock, Upload, FileText, Trash2, AlertCircle,
  Building2, Globe, User, Layers, MessageSquare, ShieldCheck,
  ChevronRight, ChevronLeft, Edit3, PhoneCall, Smartphone,
  Bot, TrendingUp, ShoppingCart
} from 'lucide-react';
import { Header, Footer, renderProjectServiceIcon } from './components';
import { useRegionPricing } from './RegionPricingContext';
import {
  PROJECT_CATEGORIES,
  ALL_PROJECT_SERVICES,
  PROJECT_BUDGET_RANGES,
  BUDGET_RANGES_INR,
  BUDGET_RANGES_USD,
  PROJECT_COMPANY_SIZES,
  PROJECT_INDUSTRIES,
  CONSULTATION_CONTACT_METHODS,
  CONSULTATION_TIME_SLOTS,
  getSelectedProjectServices,
  saveSelectedProjectServices,
  deriveCategoriesFromServices
} from './projectsConfig';
import {
  getProjectConsultationSlots,
  submitProjectRequest,
  submitConsultationRequest
} from './api';
import './projects.css';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FILES_COUNT = 5;

const COUNTRIES_LIST = [
  'India', 'United States', 'United Kingdom', 'United Arab Emirates',
  'Singapore', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands',
  'Saudi Arabia', 'South Africa', 'Japan', 'Other'
];

export default function ProjectsPage() {
  const location = useLocation();
  const engagementRef = useRef(null);
  const catalogueRef = useRef(null);
  const { isOutsideIndia } = useRegionPricing();

  const activeBudgetRanges = useMemo(() => {
    return isOutsideIndia ? BUDGET_RANGES_USD : BUDGET_RANGES_INR;
  }, [isOutsideIndia]);

  // Selected service names across the page (persisted in sessionStorage)
  const [selectedServices, setSelectedServices] = useState(() => getSelectedProjectServices());

  // Engagement mode: 'consultation' (Option A: Talk to Our Team) or 'project' (Option B: 4-step Project Request)
  const [activeMode, setActiveMode] = useState('consultation');

  // -------------------------------------------------------------------------
  // OPTION B: 4-STEP PROJECT REQUEST STATE
  // -------------------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState(1);
  const [projectForm, setProjectForm] = useState({
    fullName: '',
    businessEmail: '',
    phone: '',
    companyName: '',
    companyWebsite: '',
    country: 'India',
    industry: '',
    companySize: '',
    projectTitle: '',
    projectDescription: '',
    businessProblem: '',
    requiredFeatures: '',
    targetAudience: '',
    preferredTechnology: '',
    existingUrl: '',
    referenceWebsites: '',
    designPreferences: '',
    expectedDeliverables: '',
    preferredStartDate: '',
    expectedCompletionDate: '',
    budgetRange: '',
    additionalRequirements: '',
    privacyConsent: false
  });
  const [attachments, setAttachments] = useState([]);
  const [fileError, setFileError] = useState('');
  const [projectError, setProjectError] = useState('');
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [submittedProjectResult, setSubmittedProjectResult] = useState(null);

  // -------------------------------------------------------------------------
  // OPTION A: CONSULTATION CALL STATE
  // -------------------------------------------------------------------------
  const [consultForm, setConsultForm] = useState({
    fullName: '',
    businessEmail: '',
    phone: '',
    companyName: '',
    country: 'India',
    preferredContactMethod: 'Phone Call',
    preferredDate: '',
    preferredTime: '',
    projectSummary: '',
    linkedProjectRequestId: ''
  });
  const [slotAvailability, setSlotAvailability] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [consultError, setConsultError] = useState('');
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [submittedConsultResult, setSubmittedConsultResult] = useState(null);

  // Sync selected services to sessionStorage
  useEffect(() => {
    saveSelectedProjectServices(selectedServices);
  }, [selectedServices]);

  // Parse URL query parameters (?service=...&category=...&action=start|talk)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serviceSlugOrName = params.get('service');
    const actionParam = params.get('action');

    if (serviceSlugOrName) {
      const matched = ALL_PROJECT_SERVICES.find(
        (s) =>
          s.slug.toLowerCase() === serviceSlugOrName.toLowerCase() ||
          s.name.toLowerCase() === serviceSlugOrName.toLowerCase()
      );
      if (matched) {
        setSelectedServices((prev) =>
          prev.includes(matched.name) ? prev : [...prev, matched.name]
        );
      }
    }

    if (actionParam === 'talk') {
      setActiveMode('consultation');
      setTimeout(() => {
        engagementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else if (actionParam === 'start' || serviceSlugOrName) {
      setActiveMode('project');
      if (actionParam === 'start') {
        setTimeout(() => {
          engagementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location.search]);

  // Fetch consultation slot availability when preferredDate changes
  useEffect(() => {
    let active = true;
    if (!consultForm.preferredDate) {
      setSlotAvailability([]);
      return;
    }
    setLoadingSlots(true);
    getProjectConsultationSlots(consultForm.preferredDate)
      .then((res) => {
        if (!active) return;
        if (res && Array.isArray(res.slots)) {
          setSlotAvailability(res.slots);
          // If currently chosen time is booked on that date, reset it
          const currentSlotObj = res.slots.find((s) => s.slot === consultForm.preferredTime);
          if (currentSlotObj && !currentSlotObj.available) {
            setConsultForm((prev) => ({ ...prev, preferredTime: '' }));
          }
        }
      })
      .catch(() => {
        if (active) setSlotAvailability([]);
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });
    return () => {
      active = false;
    };
  }, [consultForm.preferredDate]);

  // Derived categories from selectedServices
  const selectedCategories = useMemo(
    () => deriveCategoriesFromServices(selectedServices),
    [selectedServices]
  );

  // Toggle a service selection
  const toggleService = (serviceName) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((item) => item !== serviceName)
        : [...prev, serviceName]
    );
  };

  // Scroll helpers
  const scrollToEngagement = (mode) => {
    setActiveMode(mode);
    setTimeout(() => {
      engagementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Handle file upload with strict validation
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setFileError('');
    if (!files.length) return;

    if (attachments.length + files.length > MAX_FILES_COUNT) {
      setFileError(`You can upload up to ${MAX_FILES_COUNT} reference files per project request.`);
      return;
    }

    files.forEach((file) => {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setFileError(`Unsupported file type "${file.name}". Allowed: PDF, PNG, JPG, WEBP, DOC, DOCX, TXT.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`File "${file.name}" exceeds the 5 MB size limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            fileName: file.name,
            mimeType: file.type,
            fileSizeBytes: file.size,
            fileDataBase64: reader.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Validate steps for Option B (4-Step Project Request)
  const validateStep = (stepNumber) => {
    setProjectError('');
    if (stepNumber === 1) {
      if (!projectForm.fullName.trim()) {
        setProjectError('Please enter your Full Name.');
        return false;
      }
      const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!projectForm.businessEmail.trim() || !EMAIL_REGEX.test(projectForm.businessEmail.trim())) {
        setProjectError('Please enter a valid email address (e.g. name@company.com).');
        return false;
      }
      const cleanPhone = (projectForm.phone || '').replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setProjectError('Please enter a valid 10-digit mobile number.');
        return false;
      }
      if (!projectForm.country.trim()) {
        setProjectError('Please select your Country.');
        return false;
      }
    } else if (stepNumber === 2) {
      if (selectedServices.length === 0) {
        setProjectError('Please select at least one service from Websites & Apps, Marketing, or WhatsApp Chat AI.');
        return false;
      }
    } else if (stepNumber === 3) {
      if (!projectForm.projectTitle.trim()) {
        setProjectError('Please enter a Project Title.');
        return false;
      }
      if (!projectForm.projectDescription.trim() || projectForm.projectDescription.trim().length < 10) {
        setProjectError('Please provide a clear Project Description (at least 10 characters).');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
      engagementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrevStep = () => {
    setProjectError('');
    setCurrentStep((prev) => Math.max(1, prev - 1));
    engagementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Submit Option B: Complete Project Request
  const handleProjectRequestSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;
    if (!projectForm.privacyConsent) {
      setProjectError('Please accept the privacy notice and consent to submit your project request.');
      return;
    }

    setProjectSubmitting(true);
    setProjectError('');
    try {
      const payload = {
        ...projectForm,
        selectedServices,
        selectedCategories,
        attachments
      };
      const response = await submitProjectRequest(payload);
      setSubmittedProjectResult(response);
      // Auto-clear selected services scope so sticky scope bar disappears on submit
      setSelectedServices([]);
      saveSelectedProjectServices([]);
      // Pre-fill consultation form in case customer also wants to book a call
      setConsultForm((prev) => ({
        ...prev,
        fullName: projectForm.fullName,
        businessEmail: projectForm.businessEmail,
        phone: projectForm.phone,
        companyName: projectForm.companyName,
        country: projectForm.country,
        projectSummary: `${projectForm.projectTitle} — ${projectForm.projectDescription}`,
        linkedProjectRequestId: response.requestId
      }));
    } catch (err) {
      setProjectError(err.message || 'Unable to submit your project request. Please check your details and try again.');
    } finally {
      setProjectSubmitting(false);
    }
  };

  // Submit Option A: Consultation Call Request
  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    setConsultError('');

    if (!consultForm.fullName.trim()) {
      setConsultError('Full Name is required.');
      return;
    }
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!consultForm.businessEmail.trim() || !EMAIL_REGEX.test(consultForm.businessEmail.trim())) {
      setConsultError('Please enter a valid email address (e.g. name@company.com).');
      return;
    }
    const cleanPhone = (consultForm.phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setConsultError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!consultForm.country.trim()) {
      setConsultError('Country is required.');
      return;
    }
    if (!consultForm.projectSummary.trim() || consultForm.projectSummary.trim().length < 5) {
      setConsultError('Please provide a brief Project Summary so our specialist can prepare.');
      return;
    }

    setConsultSubmitting(true);
    try {
      const response = await submitConsultationRequest({
        ...consultForm,
        selectedServices,
        selectedCategories
      });
      setSubmittedConsultResult(response);
      // Auto-clear selected services scope so sticky scope bar disappears on submit
      setSelectedServices([]);
      saveSelectedProjectServices([]);
    } catch (err) {
      setConsultError(err.message || 'Failed to submit consultation call request. Please try again.');
    } finally {
      setConsultSubmitting(false);
    }
  };

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  return (
    <>
      <Header />
      <main className="oxoo-projects-page">
        {/* ===================================================================
            1. HERO SECTION
            =================================================================== */}
        <section className="oxoo-projects-hero">
          <div className="oxoo-projects-hero-inner">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="oxoo-projects-eyebrow">
                <Sparkles size={14} />
                <span>OXOO.ai Digital Projects & Solutions Hub</span>
              </div>
              <h1 className="oxoo-projects-hero-title">
                Turn Your Ideas Into <span>Powerful Digital Solutions.</span>
              </h1>
              <p className="oxoo-projects-hero-desc">
                From AI-powered websites and mobile applications to digital marketing and WhatsApp automation, OXOO.ai helps you plan, build and grow your digital presence.
              </p>

              <div className="oxoo-projects-hero-actions">
                <button
                  type="button"
                  className="oxoo-projects-btn-primary"
                  onClick={() => scrollToEngagement('project')}
                >
                  <span>Start Your Project</span>
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  className="oxoo-projects-btn-secondary"
                  onClick={() => scrollToEngagement('consultation')}
                >
                  <PhoneCall size={17} />
                  <span>Talk to Our Team</span>
                </button>
              </div>

              <div className="oxoo-projects-hero-highlights">
                <div className="oxoo-projects-hero-highlight-item">
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Websites, Mobile Apps & 3D Web</span>
                </div>
                <div className="oxoo-projects-hero-highlight-item">
                  <CheckCircle2 size={16} color="#2563eb" />
                  <span>Omnichannel Growth Marketing</span>
                </div>
                <div className="oxoo-projects-hero-highlight-item">
                  <CheckCircle2 size={16} color="#06b6d4" />
                  <span>WhatsApp Chat AI & Flows</span>
                </div>
              </div>
            </motion.div>

            {/* Right Hero Composition: Website Previews, Mobile App Mockups, AI & Marketing Dashboards */}
            <motion.div
              className="oxoo-projects-hero-visual"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="oxoo-projects-showcase-stage">
                <div className="oxoo-projects-showcase-glow" />
                <div className="oxoo-projects-showcase-browser">
                  <div className="oxoo-projects-showcase-topbar">
                    <div className="oxoo-projects-showcase-dots">
                      <span style={{ background: '#ef4444' }} />
                      <span style={{ background: '#f59e0b' }} />
                      <span style={{ background: '#10b981' }} />
                    </div>
                    <div className="oxoo-projects-showcase-url">oxoo.ai/projects/studio-workspace</div>
                    <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>LIVE STUDIO</span>
                  </div>

                  <div className="oxoo-projects-showcase-body">
                    {/* Left Panel: AI Website & eCommerce Builder Preview */}
                    <div className="oxoo-projects-showcase-card">
                      <div className="oxoo-projects-showcase-badge">
                        <Sparkles size={11} /> AI Website & App Studio
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                        Custom Enterprise Web & Mobile Architecture
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '12px' }}>
                        Responsive UI, headless eCommerce, 3D WebGL experiences, and native iOS/Android builds.
                      </div>

                      <div className="oxoo-projects-showcase-grid-mini">
                        <div className="oxoo-projects-showcase-mini-tile">
                          <Smartphone size={18} color="#38bdf8" />
                          <div>
                            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#ffffff' }}>iOS & Android</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Native & Cross-Platform</div>
                          </div>
                        </div>
                        <div className="oxoo-projects-showcase-mini-tile">
                          <ShoppingCart size={18} color="#34d399" />
                          <div>
                            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#ffffff' }}>eCommerce</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Multi-Currency & GST</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: WhatsApp AI & Marketing Automation Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="oxoo-projects-showcase-card" style={{ background: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.28)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                            WhatsApp Chat AI
                          </span>
                          <Bot size={15} color="#34d399" />
                        </div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                          24/7 AI Inbox & Flow Builder
                        </div>
                        <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                          Automated lead qualification, catalog checkout & booking reminders.
                        </div>
                      </div>

                      <div className="oxoo-projects-showcase-card" style={{ background: 'rgba(37, 99, 235, 0.16)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase' }}>
                            Growth Marketing
                          </span>
                          <TrendingUp size={15} color="#60a5fa" />
                        </div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                          Social, Email, SMS & Journeys
                        </div>
                        <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                          Connected campaign orchestration with real-time conversion analytics.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===================================================================
            2. STICKY SELECTED SERVICES BAR
            =================================================================== */}
        {selectedServices.length > 0 && !submittedProjectResult && !submittedConsultResult && (
          <div className="oxoo-projects-selection-bar">
            <div className="oxoo-projects-selection-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '999px'
                }}>
                  {selectedServices.length} Selected
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                  Your Project Scope:
                </span>
              </div>

              <div className="oxoo-projects-selection-chips">
                {selectedServices.map((svcName) => (
                  <span key={svcName} className="oxoo-projects-chip">
                    {svcName}
                    <button
                      type="button"
                      onClick={() => toggleService(svcName)}
                      aria-label={`Remove ${svcName}`}
                      title={`Remove ${svcName}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedServices([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
                <button
                  type="button"
                  className="oxoo-projects-btn-primary"
                  style={{ padding: '9px 18px', fontSize: '13.5px' }}
                  onClick={() => scrollToEngagement('project')}
                >
                  Continue with Selected ({selectedServices.length}) <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            3. SERVICE CATALOGUE SECTIONS (3 CATEGORIES, 18 SERVICES)
            =================================================================== */}
        <section className="oxoo-projects-catalogue" ref={catalogueRef}>
          <div className="oxoo-projects-section-header">
            <div className="oxoo-projects-eyebrow" style={{ marginBottom: '10px' }}>
              <Layers size={13} />
              <span>Unified Service Catalogue</span>
            </div>
            <h2>Select the Digital Services You Need</h2>
            <p>
              Choose one or multiple services across Websites & Apps, Marketing, and WhatsApp Chat AI. Your selections automatically populate your consultation or project request below.
            </p>
          </div>

          {PROJECT_CATEGORIES.map((category, catIdx) => {
            const selectedInCategory = category.services.filter((s) =>
              selectedServices.includes(s.name)
            ).length;

            return (
              <div key={category.id} className="oxoo-projects-category-block" id={`cat-${category.id}`}>
                <div className="oxoo-projects-category-head">
                  <div className="oxoo-projects-category-title-wrap">
                    <div
                      className="oxoo-projects-category-badge-num"
                      style={{ background: category.accentColor }}
                    >
                      {String.fromCharCode(65 + catIdx)}
                    </div>
                    <div>
                      <h3>{category.name || category.title}</h3>
                      <p>{category.tagline || category.subtitle}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {selectedInCategory > 0 && (
                      <span style={{
                        padding: '5px 12px',
                        borderRadius: '999px',
                        background: category.badgeBg,
                        color: category.accentColor,
                        fontSize: '12.5px',
                        fontWeight: 700
                      }}>
                        {selectedInCategory} selected in {category.name || category.title}
                      </span>
                    )}
                  </div>
                </div>

                <div className="oxoo-projects-services-grid">
                  {category.services.map((service) => {
                    const isSelected = selectedServices.includes(service.name);
                    return (
                      <div
                        key={service.slug}
                        className={`oxoo-project-service-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleService(service.name)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleService(service.name);
                          }
                        }}
                      >
                        <div>
                          <div className="oxoo-project-service-card-top">
                            <div
                              className="oxoo-project-service-icon-box"
                              style={{ background: service.iconBg }}
                            >
                              {renderProjectServiceIcon(service.iconName || service.iconKey, service.iconColor, 22)}
                            </div>
                            {isSelected && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '999px',
                                background: '#dbeafe',
                                color: '#1d4ed8',
                                fontSize: '11.5px',
                                fontWeight: 700
                              }}>
                                <Check size={13} /> Selected
                              </span>
                            )}
                          </div>

                          <h4 className="oxoo-project-service-title">{service.name}</h4>
                          <p className="oxoo-project-service-desc">{service.shortDesc || service.shortDescription}</p>

                          {Array.isArray(service.deliverables) && (
                            <div className="oxoo-project-service-deliverables">
                              {service.deliverables.map((deliv) => (
                                <span key={deliv} className="oxoo-project-deliverable-tag">
                                  {deliv}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="oxoo-project-service-select-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleService(service.name);
                          }}
                        >
                          {isSelected ? (
                            <>
                              <Check size={16} />
                              <span>Selected for Project</span>
                            </>
                          ) : (
                            <>
                              <span>Select Service</span>
                              <ArrowRight size={15} />
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* ===================================================================
            4. TWO CLEAR WAYS TO START A PROJECT (ENGAGEMENT HUB)
            =================================================================== */}
        <section className="oxoo-projects-engagement-section" ref={engagementRef} id="start-project">
          <div className="oxoo-projects-section-header" style={{ marginBottom: '28px' }}>
            <div className="oxoo-projects-eyebrow" style={{ marginBottom: '10px' }}>
              <Sparkles size={13} />
              <span>Two Ways to Get Started</span>
            </div>
            <h2>How Would You Like to Start Your Project?</h2>
            <p>
              Submit a comprehensive project brief for a tailored proposal, or request a discovery consultation call with an OXOO.ai solution architect.
            </p>
          </div>

          {/* Mode Switcher Cards: Option A First (Discovery Call), Option B Second (Structured Brief) */}
          <div className="oxoo-projects-mode-switcher">
            <button
              type="button"
              className={`oxoo-projects-mode-card ${activeMode === 'consultation' ? 'active' : ''}`}
              onClick={() => setActiveMode('consultation')}
            >
              <div
                className="oxoo-projects-mode-icon"
                style={{
                  background: activeMode === 'consultation' ? '#0891b2' : '#ecfeff',
                  color: activeMode === 'consultation' ? '#ffffff' : '#0891b2'
                }}
              >
                <PhoneCall size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0891b2', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Option A · Discovery Call
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#091322', marginBottom: '6px' }}>
                  Request a Consultation Call (Talk to Our Team)
                </div>
                <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5 }}>
                  Prefer to speak with an OXOO.ai specialist first? Pick a preferred contact method and time slot for a discovery session.
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`oxoo-projects-mode-card ${activeMode === 'project' ? 'active' : ''}`}
              onClick={() => setActiveMode('project')}
            >
              <div
                className="oxoo-projects-mode-icon"
                style={{
                  background: activeMode === 'project' ? '#2563eb' : '#eff6ff',
                  color: activeMode === 'project' ? '#ffffff' : '#2563eb'
                }}
              >
                <FileText size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Option B · Structured Brief
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#091322', marginBottom: '6px' }}>
                  Submit a Project Request (Fill Project Requirements)
                </div>
                <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5 }}>
                  Complete a 4-step guided specification covering contact info, services, technical goals, budget, and reference files.
                </div>
              </div>
            </button>
          </div>

          {/* =================================================================
              FORM CONTAINER
              ================================================================= */}
          <div className="oxoo-projects-form-shell">
            {activeMode === 'project' ? (
              /* ---------------------------------------------------------------
                 OPTION B: 4-STEP PROJECT REQUEST WIZARD
                 --------------------------------------------------------------- */
              submittedProjectResult ? (
                <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px'
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '5px 14px',
                    borderRadius: '999px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontWeight: 800,
                    fontSize: '13px',
                    marginBottom: '12px'
                  }}>
                    Reference ID: {submittedProjectResult.requestId}
                  </span>
                  <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#091322', margin: '0 0 10px' }}>
                    Your Project Request Has Been Received!
                  </h3>
                  <p style={{ fontSize: '15px', color: '#475569', maxWidth: '620px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                    Thank you, <strong>{projectForm.fullName}</strong>. Our solutions engineering team has logged your project brief under reference <strong>{submittedProjectResult.requestId}</strong> and will review your requirements carefully.
                  </p>

                  <div style={{
                    maxWidth: '580px',
                    margin: '0 auto 28px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '18px 22px',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                      Submitted Project Summary
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                      <strong>Project Title:</strong> {projectForm.projectTitle}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                      <strong>Selected Categories:</strong> {selectedCategories.join(', ')}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      <strong>Selected Services ({selectedServices.length}):</strong> {selectedServices.join(', ')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' }}>
                    <button
                      type="button"
                      className="oxoo-projects-btn-primary"
                      onClick={() => {
                        setSubmittedConsultResult(null);
                        setActiveMode('consultation');
                      }}
                    >
                      <PhoneCall size={16} />
                      <span>Also Request a Consultation Call</span>
                    </button>
                    <button
                      type="button"
                      className="oxoo-projects-btn-secondary"
                      onClick={() => {
                        setSubmittedProjectResult(null);
                        setCurrentStep(1);
                      }}
                    >
                      <span>Submit Another Project Request</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProjectRequestSubmit} noValidate>
                  {/* Stepper Navigation */}
                  <div className="oxoo-projects-stepper">
                    {[
                      { num: 1, title: 'Step 1', sub: 'Contact Details' },
                      { num: 2, title: 'Step 2', sub: 'Select Services' },
                      { num: 3, title: 'Step 3', sub: 'Project Requirements' },
                      { num: 4, title: 'Step 4', sub: 'Review & Submit' }
                    ].map((st) => {
                      const isCompleted = currentStep > st.num;
                      const isActive = currentStep === st.num;
                      return (
                        <div
                          key={st.num}
                          className={`oxoo-projects-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                          onClick={() => {
                            if (st.num < currentStep || validateStep(currentStep)) {
                              setCurrentStep(st.num);
                            }
                          }}
                        >
                          <div className="oxoo-projects-step-circle">
                            {isCompleted ? <Check size={15} /> : st.num}
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                              {st.title}
                            </div>
                            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                              {st.sub}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {projectError && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#b91c1c',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      marginBottom: '22px'
                    }}>
                      <AlertCircle size={18} />
                      <span>{projectError}</span>
                    </div>
                  )}

                  {/* STEP 1: CONTACT DETAILS */}
                  {currentStep === 1 && (
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#091322', margin: '0 0 6px' }}>
                        Step 1: Your Contact Details
                      </h3>
                      <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 22px' }}>
                        Tell us who you are and where our solutions team can reach you.
                      </p>

                      <div className="oxoo-projects-form-grid">
                        <div className="oxoo-projects-form-group">
                          <label>Full Name <span className="req">*</span></label>
                          <input
                            type="text"
                            className="oxoo-projects-input"
                            placeholder="e.g. Aarav Sharma"
                            value={projectForm.fullName}
                            onChange={(e) => setProjectForm({ ...projectForm, fullName: e.target.value })}
                            required
                          />
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Email Address <span className="req">*</span></label>
                          <input
                            type="email"
                            className="oxoo-projects-input"
                            placeholder="name@example.com"
                            value={projectForm.businessEmail}
                            onChange={(e) => setProjectForm({ ...projectForm, businessEmail: e.target.value })}
                            required
                          />
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Mobile Number (10 digits) <span className="req">*</span></label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            className="oxoo-projects-input"
                            placeholder="10-digit mobile number"
                            value={projectForm.phone}
                            onChange={(e) => setProjectForm({ ...projectForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            required
                          />
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Country <span className="req">*</span></label>
                          <select
                            className="oxoo-projects-select"
                            value={projectForm.country}
                            onChange={(e) => setProjectForm({ ...projectForm, country: e.target.value })}
                            required
                          >
                            {COUNTRIES_LIST.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: SELECT SERVICES */}
                  {currentStep === 2 && (
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#091322', margin: '0 0 6px' }}>
                        Step 2: Select Services ({selectedServices.length} Selected)
                      </h3>
                      <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 22px' }}>
                        Select one or multiple services across Websites & Apps, Marketing, and WhatsApp Chat AI.
                      </p>

                      {PROJECT_CATEGORIES.map((category) => (
                        <div key={category.id} style={{ marginBottom: '24px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px',
                            fontWeight: 800,
                            fontSize: '15px',
                            color: '#0f172a'
                          }}>
                            <span style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: category.accentColor,
                              display: 'inline-block'
                            }} />
                            <span>{category.name || category.title}</span>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: '12px'
                          }}>
                            {category.services.map((svc) => {
                              const checked = selectedServices.includes(svc.name);
                              return (
                                <div
                                  key={svc.slug}
                                  onClick={() => toggleService(svc.name)}
                                  role="checkbox"
                                  aria-checked={checked}
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      toggleService(svc.name);
                                    }
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    border: checked ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                                    background: checked ? '#eff6ff' : '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: svc.iconBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    {renderProjectServiceIcon(svc.iconName || svc.iconKey, svc.iconColor, 18)}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                                      {svc.name}
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                                      {category.name || category.title}
                                    </div>
                                  </div>
                                  <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '6px',
                                    border: checked ? 'none' : '1.5px solid #cbd5e1',
                                    background: checked ? '#2563eb' : '#ffffff',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {checked && <Check size={13} />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 3: PROJECT REQUIREMENTS & FILE UPLOAD */}
                  {currentStep === 3 && (
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#091322', margin: '0 0 6px' }}>
                        Step 3: Project Requirements, Timeline & Attachments
                      </h3>
                      <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 22px' }}>
                        Share your vision, functional requirements, timeline, and any reference documents or mockups.
                      </p>

                      <div className="oxoo-projects-form-grid">
                        <div className="oxoo-projects-form-group full-width">
                          <label>Project Title <span className="req">*</span></label>
                          <input
                            type="text"
                            className="oxoo-projects-input"
                            placeholder="e.g. Global eCommerce Storefront + WhatsApp AI Order Concierge"
                            value={projectForm.projectTitle}
                            onChange={(e) => setProjectForm({ ...projectForm, projectTitle: e.target.value })}
                            required
                          />
                        </div>

                        <div className="oxoo-projects-form-group full-width">
                          <label>Project Description <span className="req">*</span></label>
                          <textarea
                            className="oxoo-projects-textarea"
                            placeholder="Describe what you want to build, key workflows, and desired user experience..."
                            value={projectForm.projectDescription}
                            onChange={(e) => setProjectForm({ ...projectForm, projectDescription: e.target.value })}
                            required
                          />
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Business Problem to Solve</label>
                          <textarea
                            className="oxoo-projects-textarea"
                            style={{ minHeight: '88px' }}
                            placeholder="What core challenge or growth goal will this project solve?"
                            value={projectForm.businessProblem}
                            onChange={(e) => setProjectForm({ ...projectForm, businessProblem: e.target.value })}
                          />
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Required Features</label>
                          <textarea
                            className="oxoo-projects-textarea"
                            style={{ minHeight: '88px' }}
                            placeholder="e.g. Multi-currency checkout, CRM sync, WhatsApp bot, Admin analytics..."
                            value={projectForm.requiredFeatures}
                            onChange={(e) => setProjectForm({ ...projectForm, requiredFeatures: e.target.value })}
                          />
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Target Audience</label>
                          <input
                            type="text"
                            className="oxoo-projects-input"
                            placeholder="e.g. B2B Enterprise Buyers, Retail Consumers, Patients..."
                            value={projectForm.targetAudience}
                            onChange={(e) => setProjectForm({ ...projectForm, targetAudience: e.target.value })}
                          />
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Preferred Technology (if known)</label>
                          <input
                            type="text"
                            className="oxoo-projects-input"
                            placeholder="e.g. React, Next.js, Flutter, Node.js, PostgreSQL, or Open to recommendation"
                            value={projectForm.preferredTechnology}
                            onChange={(e) => setProjectForm({ ...projectForm, preferredTechnology: e.target.value })}
                          />
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Existing Website or Application URL</label>
                          <input
                            type="url"
                            className="oxoo-projects-input"
                            placeholder="https://..."
                            value={projectForm.existingUrl}
                            onChange={(e) => setProjectForm({ ...projectForm, existingUrl: e.target.value })}
                          />
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Reference Websites</label>
                          <input
                            type="text"
                            className="oxoo-projects-input"
                            placeholder="Links to websites or apps whose style/features you admire"
                            value={projectForm.referenceWebsites}
                            onChange={(e) => setProjectForm({ ...projectForm, referenceWebsites: e.target.value })}
                          />
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Design Preferences</label>
                          <input
                            type="text"
                            className="oxoo-projects-input"
                            placeholder="e.g. Clean minimalist SaaS, 3D interactive, bold brand colors..."
                            value={projectForm.designPreferences}
                            onChange={(e) => setProjectForm({ ...projectForm, designPreferences: e.target.value })}
                          />
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Expected Deliverables</label>
                          <input
                            type="text"
                            className="oxoo-projects-input"
                            placeholder="e.g. Figma UI/UX, Production Web App, iOS/Android Apps, Documentation"
                            value={projectForm.expectedDeliverables}
                            onChange={(e) => setProjectForm({ ...projectForm, expectedDeliverables: e.target.value })}
                          />
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Budget Range ({isOutsideIndia ? 'USD $' : 'INR ₹'})</label>
                          <select
                            className="oxoo-projects-select"
                            value={projectForm.budgetRange}
                            onChange={(e) => setProjectForm({ ...projectForm, budgetRange: e.target.value })}
                          >
                            <option value="">Select Estimated Budget Range</option>
                            {activeBudgetRanges.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>

                        <div className="oxoo-projects-form-group">
                          <label>Additional Requirements</label>
                          <input
                            type="text"
                            className="oxoo-projects-input"
                            placeholder="Any compliance, hosting, SLA, or third-party ERP/CRM notes"
                            value={projectForm.additionalRequirements}
                            onChange={(e) => setProjectForm({ ...projectForm, additionalRequirements: e.target.value })}
                          />
                        </div>

                        {/* Reference Document or Image Upload */}
                        <div className="oxoo-projects-form-group full-width">
                          <label>Reference Document or Image Upload (Optional — Max 5 files, up to 5 MB each)</label>
                          <div className="oxoo-projects-upload-zone">
                            <Upload size={26} color="#2563eb" style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                              Upload Briefs, Wireframes, RFP Documents, or Screenshots
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                              Accepted formats: PDF, PNG, JPG, WEBP, DOC, DOCX, TXT (Max 5 MB per file)
                            </div>
                            <label
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                background: '#2563eb',
                                color: '#ffffff',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <Upload size={14} />
                              <span>Choose Files</span>
                              <input
                                type="file"
                                multiple
                                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                              />
                            </label>
                          </div>

                          {fileError && (
                            <div style={{ color: '#dc2626', fontSize: '12.5px', fontWeight: 600, marginTop: '6px' }}>
                              {fileError}
                            </div>
                          )}

                          {attachments.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                              {attachments.map((att, idx) => (
                                <div
                                  key={`${att.fileName}-${idx}`}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    background: '#f1f5f9',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '13px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={16} color="#2563eb" />
                                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{att.fileName}</span>
                                    <span style={{ color: '#64748b', fontSize: '12px' }}>
                                      ({(att.fileSizeBytes / 1024).toFixed(1)} KB)
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeAttachment(idx)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#dc2626',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '12px',
                                      fontWeight: 600
                                    }}
                                  >
                                    <Trash2 size={14} /> Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: REVIEW AND SUBMIT */}
                  {currentStep === 4 && (
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#091322', margin: '0 0 6px' }}>
                        Step 4: Review and Submit
                      </h3>
                      <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 22px' }}>
                        Review your project details below. You can edit any section before submitting.
                      </p>

                      {/* Contact Details Summary */}
                      <div className="oxoo-projects-review-card">
                        <div className="oxoo-projects-review-head">
                          <h4>1. Contact Details</h4>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={14} /> Edit Step 1
                          </button>
                        </div>
                        <div className="oxoo-projects-review-grid">
                          <div><strong>Full Name:</strong> {projectForm.fullName}</div>
                          <div><strong>Email Address:</strong> {projectForm.businessEmail}</div>
                          <div><strong>Phone Number:</strong> {projectForm.phone}</div>
                          <div><strong>Country:</strong> {projectForm.country}</div>
                        </div>
                      </div>

                      {/* Selected Categories & Services Summary */}
                      <div className="oxoo-projects-review-card">
                        <div className="oxoo-projects-review-head">
                          <h4>2. Selected Categories & Services</h4>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={14} /> Edit Step 2
                          </button>
                        </div>
                        <div style={{ fontSize: '13.5px', marginBottom: '8px' }}>
                          <strong>Selected Categories:</strong> {selectedCategories.join(', ') || 'None'}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {selectedServices.map((s) => (
                            <span key={s} className="oxoo-projects-chip">{s}</span>
                          ))}
                        </div>
                      </div>

                      {/* Project Requirements, Budget & Timeline Summary */}
                      <div className="oxoo-projects-review-card">
                        <div className="oxoo-projects-review-head">
                          <h4>3. Project Scope, Budget & Timeline</h4>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={14} /> Edit Step 3
                          </button>
                        </div>
                        <div style={{ fontSize: '13.5px', marginBottom: '10px' }}>
                          <strong>Project Title:</strong> {projectForm.projectTitle}
                        </div>
                        <div style={{ fontSize: '13.5px', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                          <strong>Project Description:</strong> {projectForm.projectDescription}
                        </div>
                        <div className="oxoo-projects-review-grid">
                          <div><strong>Budget Range:</strong> {projectForm.budgetRange || 'To be discussed'}</div>
                          {Boolean(projectForm.preferredStartDate || projectForm.expectedCompletionDate) && (
                            <div>
                              <strong>Preferred Timeline:</strong>{' '}
                              {projectForm.preferredStartDate || 'Flexible start'} → {projectForm.expectedCompletionDate || 'Flexible completion'}
                            </div>
                          )}
                          <div><strong>Preferred Technology:</strong> {projectForm.preferredTechnology || '—'}</div>
                          <div><strong>Expected Deliverables:</strong> {projectForm.expectedDeliverables || '—'}</div>
                          <div><strong>Attachments:</strong> {attachments.length > 0 ? `${attachments.length} file(s) attached` : 'None'}</div>
                        </div>
                      </div>

                      {/* Privacy Notice & Consent Checkbox */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          fontSize: '13.5px',
                          color: '#334155',
                          marginBottom: '20px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={projectForm.privacyConsent}
                          onChange={(e) => setProjectForm({ ...projectForm, privacyConsent: e.target.checked })}
                          style={{ marginTop: '3px', width: '16px', height: '16px' }}
                        />
                        <span>
                          I consent to OXOO.ai storing and processing my project requirements and contact details to prepare a tailored proposal and contact me regarding this enquiry, in accordance with the{' '}
                          <Link to="/privacy-policy" style={{ color: '#2563eb', fontWeight: 700 }}>
                            OXOO.ai Privacy Policy
                          </Link>.
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Wizard Footer Navigation Buttons */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '22px',
                    marginTop: '24px',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        className="oxoo-projects-btn-secondary"
                        onClick={handlePrevStep}
                      >
                        <ChevronLeft size={16} />
                        <span>Previous Step</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {currentStep < 4 ? (
                      <button
                        type="button"
                        className="oxoo-projects-btn-primary"
                        onClick={handleNextStep}
                      >
                        <span>Continue to Step {currentStep + 1}</span>
                        <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="oxoo-projects-btn-primary"
                        disabled={projectSubmitting}
                      >
                        <span>{projectSubmitting ? 'Submitting Project Request...' : 'Submit Project Request'}</span>
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </form>
              )
            ) : (
              /* ---------------------------------------------------------------
                 OPTION A: REQUEST A CONSULTATION CALL (TALK TO OUR TEAM)
                 --------------------------------------------------------------- */
              submittedConsultResult ? (
                <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px'
                  }}>
                    <PhoneCall size={32} />
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '5px 14px',
                    borderRadius: '999px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontWeight: 800,
                    fontSize: '13px',
                    marginBottom: '12px'
                  }}>
                    Consultation Reference: {submittedConsultResult.requestId}
                  </span>
                  <h3 style={{ fontSize: '25px', fontWeight: 800, color: '#091322', margin: '0 0 10px' }}>
                    Consultation Request Received ({submittedConsultResult.status})
                  </h3>
                  <p style={{ fontSize: '15px', color: '#475569', maxWidth: '620px', margin: '0 auto 22px', lineHeight: 1.6 }}>
                    {submittedConsultResult.message}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' }}>
                    <a href="tel:+917940500100" className="oxoo-projects-btn-primary">
                      <Phone size={16} />
                      <span>Call Now: +91 79 4050 0100</span>
                    </a>
                    <button
                      type="button"
                      className="oxoo-projects-btn-secondary"
                      onClick={() => setSubmittedConsultResult(null)}
                    >
                      <span>Submit Another Consultation Request</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConsultationSubmit} noValidate>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    marginBottom: '24px',
                    paddingBottom: '18px',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '21px', fontWeight: 800, color: '#091322', margin: '0 0 4px' }}>
                        Request a Consultation Call (Talk to Our Team)
                      </h3>
                      <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                        Speak directly with an OXOO.ai solution specialist before filling out a detailed brief.
                      </p>
                    </div>
                    <a
                      href="tel:+917940500100"
                      className="oxoo-projects-btn-secondary"
                      style={{ padding: '10px 18px', fontSize: '13.5px', borderColor: '#0891b2', color: '#0891b2' }}
                    >
                      <Phone size={15} />
                      <span>Call Now: +91 79 4050 0100</span>
                    </a>
                  </div>

                  {consultError && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#b91c1c',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      marginBottom: '22px'
                    }}>
                      <AlertCircle size={18} />
                      <span>{consultError}</span>
                    </div>
                  )}

                  <div className="oxoo-projects-form-grid">
                    <div className="oxoo-projects-form-group">
                      <label>Full Name <span className="req">*</span></label>
                      <input
                        type="text"
                        className="oxoo-projects-input"
                        placeholder="Your Full Name"
                        value={consultForm.fullName}
                        onChange={(e) => setConsultForm({ ...consultForm, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="oxoo-projects-form-group">
                      <label>Email Address <span className="req">*</span></label>
                      <input
                        type="email"
                        className="oxoo-projects-input"
                        placeholder="name@example.com"
                        value={consultForm.businessEmail}
                        onChange={(e) => setConsultForm({ ...consultForm, businessEmail: e.target.value })}
                        required
                      />
                    </div>

                    <div className="oxoo-projects-form-group">
                      <label>Mobile Number (10 digits) <span className="req">*</span></label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        className="oxoo-projects-input"
                        placeholder="10-digit mobile number"
                        value={consultForm.phone}
                        onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        required
                      />
                    </div>

                    <div className="oxoo-projects-form-group">
                      <label>Country <span className="req">*</span></label>
                      <select
                        className="oxoo-projects-select"
                        value={consultForm.country}
                        onChange={(e) => setConsultForm({ ...consultForm, country: e.target.value })}
                        required
                      >
                        {COUNTRIES_LIST.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="oxoo-projects-form-group">
                      <label>Preferred Contact Method</label>
                      <select
                        className="oxoo-projects-select"
                        value={consultForm.preferredContactMethod}
                        onChange={(e) => setConsultForm({ ...consultForm, preferredContactMethod: e.target.value })}
                      >
                        {CONSULTATION_CONTACT_METHODS.map((method) => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>

                    <div className="oxoo-projects-form-group">
                      <label>Preferred Date (Optional)</label>
                      <input
                        type="date"
                        min={todayIso}
                        className="oxoo-projects-input"
                        value={consultForm.preferredDate}
                        onChange={(e) => setConsultForm({ ...consultForm, preferredDate: e.target.value })}
                      />
                    </div>

                    <div className="oxoo-projects-form-group">
                      <label>
                        Preferred Time Slot (Optional){' '}
                        {loadingSlots && <span style={{ fontSize: '11px', color: '#2563eb' }}>(Checking live availability...)</span>}
                      </label>
                      <select
                        className="oxoo-projects-select"
                        value={consultForm.preferredTime}
                        onChange={(e) => setConsultForm({ ...consultForm, preferredTime: e.target.value })}
                      >
                        <option value="">Select a Preferred Time Slot</option>
                        {(slotAvailability.length > 0
                          ? slotAvailability
                          : CONSULTATION_TIME_SLOTS.map((slot) => ({ slot, available: true }))
                        ).map((item) => (
                          <option key={item.slot} value={item.slot} disabled={!item.available}>
                            {item.slot} {!item.available ? '— (Slot Unavailable)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selected Services (Prefilled + Quick Toggle) */}
                    <div className="oxoo-projects-form-group full-width">
                      <label>Selected Services (Prefilled from your selection — click to add/remove)</label>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}>
                        {ALL_PROJECT_SERVICES.map((svc) => {
                          const isChosen = selectedServices.includes(svc.name);
                          return (
                            <button
                              key={svc.slug}
                              type="button"
                              onClick={() => toggleService(svc.name)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '999px',
                                fontSize: '12.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: isChosen ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                                background: isChosen ? '#eff6ff' : '#ffffff',
                                color: isChosen ? '#1d4ed8' : '#475569'
                              }}
                            >
                              {isChosen && <Check size={12} />}
                              <span>{svc.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="oxoo-projects-form-group full-width">
                      <label>Project Summary <span className="req">*</span></label>
                      <textarea
                        className="oxoo-projects-textarea"
                        placeholder="Briefly describe your goals, timeline, or questions for our specialist..."
                        value={consultForm.projectSummary}
                        onChange={(e) => setConsultForm({ ...consultForm, projectSummary: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    marginTop: '24px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Note: Selecting a preferred date/time submits an appointment request. Our team will confirm the slot via email/phone.
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <a href="tel:+917940500100" className="oxoo-projects-btn-secondary">
                        <Phone size={16} />
                        <span>Call Now</span>
                      </a>
                      <button
                        type="submit"
                        className="oxoo-projects-btn-primary"
                        disabled={consultSubmitting}
                      >
                        <PhoneCall size={16} />
                        <span>{consultSubmitting ? 'Submitting Request...' : 'Request a Call'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
