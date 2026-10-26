import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Send, Bot, Phone, Mail, Sparkles, AlertCircle, HelpCircle,
  UploadCloud, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck,
  Building2, Users, Calendar, Wrench, Bug, ExternalLink, ChevronDown, Check
} from 'lucide-react';
import { Header, Footer } from './components';
import { submitSupportTicket } from './api';
import './help.css';

// Authoritative global office data matching Oxoo reference specifications
const OFFICE_REGIONS = [
  {
    region: 'Europe, Middle East and Africa',
    offices: [
      {
        country: 'Belgium - FR',
        flag: '🇧🇪',
        tags: [
          { label: 'Finance', type: 'finance' },
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: 'Rue du Laid Burniat 5, 1348 Louvain-la-Neuve',
        phone: '+32 2 290 34 90'
      },
      {
        country: 'Belgium - NL',
        flag: '🇧🇪',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: 'Roderikveldlaan 3, 2600 Antwerpen',
        phone: '+32 3 361 54 20'
      },
      {
        country: 'Belgium',
        flag: '🇧🇪',
        tags: [
          { label: 'HR', type: 'hr' },
          { label: 'R&D', type: 'rd' },
          { label: 'Services', type: 'services' }
        ],
        address: 'Farm 1: Chaussée de Namur 40, Farm 2: Rue des Bourlottes 9, Farm 3: Rue de Ramiellies 1, 1367 Grand-Rosière',
        phone: '+32 2 616 8002'
      },
      {
        country: 'Germany',
        flag: '🇩🇪',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: 'Mühlenstraße 15, 10243 Berlin, Germany',
        phone: '+49 30 138 830 190'
      },
      {
        country: 'Italy',
        flag: '🇮🇹',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: 'Via Benigno Crespi 23, 20159 Milano, Italy',
        phone: '+39 029 994 4400'
      },
      {
        country: 'Kenya',
        flag: '🇰🇪',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: 'Standard Chartered Head Office, 3rd Floor, Westlands Road 48, Nairobi, Kenya',
        phone: '+254 20 7640404'
      },
      {
        country: 'Luxembourg',
        flag: '🇱🇺',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: "13 Rue de l'Industrie, 8399 Koerich",
        phone: '+352 20 21 14 52'
      },
      {
        country: 'Spain',
        flag: '🇪🇸',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: 'Avda Cortes Valencianas, s/n portal 58, 46015 Valencia, Spain',
        phone: '+34 911870700'
      },
      {
        country: 'United Arab Emirates',
        flag: '🇦🇪',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: '5th Floor A1 building, Dubai South, United Arab Emirates',
        phone: '+971 4 498 7800'
      },
      {
        country: 'France',
        flag: '🇫🇷',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: '107/109 Boulevard Vivier Merle, Atrium Part Dieu, 69003 Lyon, France',
        phone: '+33 4 28 77 01 02'
      }
    ]
  },
  {
    region: 'Americas',
    offices: [
      {
        country: 'Argentina',
        flag: '🇦🇷',
        tags: [{ label: 'Sales', type: 'sales' }],
        address: 'Buenos Aires, Argentina',
        phone: '+54 11 5077 1930'
      },
      {
        country: 'Brazil',
        flag: '🇧🇷',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: 'Rua Marechal Deodoro 630 Edifício Centro Comercial Itália 24o Andar, Curitiba-PR, 80010-010',
        phone: '+55 41 3542-4471'
      },
      {
        country: 'Chile',
        flag: '🇨🇱',
        tags: [{ label: 'Sales', type: 'sales' }],
        address: 'Santiago, Chile',
        phone: '+56 2 3278 3816'
      },
      {
        country: 'Colombia',
        flag: '🇨🇴',
        tags: [{ label: 'Sales', type: 'sales' }],
        address: 'Bogotá, Colombia',
        phone: '+57 1 508 7840'
      },
      {
        country: 'Mexico',
        flag: '🇲🇽',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: 'Blvd. Miguel de Cervantes Saavedra, Granada, 11520 Ciudad de México',
        phone: '+52 55 9602 4871'
      },
      {
        country: 'Peru',
        flag: '🇵🇪',
        tags: [{ label: 'Sales', type: 'sales' }],
        address: 'Lima, Peru',
        phone: '+51 1 708 6740'
      },
      {
        country: 'United States',
        flag: '🇺🇸',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' },
          { label: 'R&D', type: 'rd' }
        ],
        address: '250 Executive Park Blvd, Suite 3400, San Francisco, CA 94134',
        phone: '+1 (650) 870 2051'
      }
    ]
  },
  {
    region: 'Asia Pacific',
    offices: [
      {
        country: 'India',
        flag: '🇮🇳',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' },
          { label: 'R&D', type: 'rd' }
        ],
        address: 'A-901, Signature 1, SG Highway, Ahmedabad, Gujarat 380051',
        phone: '+91 79 40 500 100'
      },
      {
        country: 'Australia',
        flag: '🇦🇺',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: 'Level 14, 380 St Kilda Road, Melbourne VIC 3004',
        phone: '+61 3 8658 9200'
      },
      {
        country: 'Hong Kong',
        flag: '🇭🇰',
        tags: [{ label: 'Sales', type: 'sales' }],
        address: 'Two International Finance Centre, 8 Finance Street, Central, Hong Kong',
        phone: '+852 3008 5800'
      },
      {
        country: 'Indonesia',
        flag: '🇮🇩',
        tags: [
          { label: 'Sales', type: 'sales' },
          { label: 'Services', type: 'services' }
        ],
        address: 'Jakarta Cyber Tower, Rasuna Said, South Jakarta',
        phone: '+62 21 5086 8500'
      }
    ]
  }
];

export default function HelpPage() {
  const location = useLocation();
  const ticketFormRef = useRef(null);

  // Search / AI Assistant state
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Ticket Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cc: '',
    identifyType: 'Subscription Code',
    identifyValue: '',
    topic: '',
    summary: '',
    description: '',
    files: []
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [formError, setFormError] = useState('');

  // Scroll to ticket form if URL has #ticket or /help-form
  useEffect(() => {
    if (location.hash === '#ticket' || location.hash === '#ticket-form' || location.pathname === '/help-form') {
      setTimeout(() => {
        ticketFormRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location]);

  // Handle Ask Oxoo AI Search
  const handleAiSearch = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      const q = aiQuery.toLowerCase();
      let answer = "Oxoo AI analyzed your request across all platform documentation and configurations:";

      if (q.includes('bill') || q.includes('price') || q.includes('payment') || q.includes('subscription')) {
        answer = "To manage your subscription, download GST invoices, or update payment methods, visit your Customer Portal under 'Billing & Subscriptions'. Invoices are automatically generated and sent upon renewal.";
      } else if (q.includes('login') || q.includes('password') || q.includes('access')) {
        answer = "For secure login, visit /login for Client accounts or /employee/login for Staff. If you forgot your password, use the Reset Password option to receive an instant verification link.";
      } else if (q.includes('api') || q.includes('webhook') || q.includes('integrate')) {
        answer = "Oxoo provides full REST and GraphQL APIs. You can generate API keys and configure webhooks in Admin Governance > Integrations & Connectors.";
      } else if (q.includes('whatsapp')) {
        answer = "Oxoo WhatsApp Chat AI connects directly via Meta Cloud API. Configure templates, automate interactive chatbots, and manage multi-agent shared inboxes from WhatsApp Chat AI suite.";
      } else {
        answer = `Regarding "${aiQuery}": Oxoo's unified workspace handles workflows seamlessly. If you are experiencing technical difficulties, submit a ticket below to connect directly with certified engineers.`;
      }

      setAiAnswer(answer);
    }, 400);
  };

  // Scroll to Human Form
  const scrollToHumanTicket = (preselectedTopic = '') => {
    if (preselectedTopic) {
      setFormData(prev => ({ ...prev, topic: preselectedTopic }));
    }
    ticketFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Form Change
  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (formError) setFormError('');
  };

  // Submit Ticket Form
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please provide a valid business email address.');
      return;
    }
    if (!formData.topic) {
      setFormError('Please select a topic for your support ticket.');
      return;
    }
    if (!formData.summary.trim()) {
      setFormError('Please provide a short summary of the issue.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Please provide detailed information in the description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitSupportTicket({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cc: formData.cc,
        identifyType: formData.identifyType,
        identifyValue: formData.identifyValue,
        topic: formData.topic,
        summary: formData.summary,
        description: formData.description
      });

      setSubmittedTicket(res.ticket || { ticket_number: res.ticket_number || 'TK-2026-8801' });
    } catch (err) {
      setFormError(err.message || 'Error submitting ticket. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const TOPIC_OPTIONS = [
    'A subscription or billing issue',
    'Support question',
    'Report a bug',
    'Upgrade issue (production)',
    'Upgrade issue (in a test database)',
    'A bank synchronization issue',
    'I cannot access my database',
    'Other'
  ];

  return (
    <div className="help-page-root">
      <Header />

      <main className="help-container">
        {/* =========================================================
            SECTION 1: NEED HELP? TOP HERO SEARCH (SCREENSHOT 2)
            ========================================================= */}
        <section className="help-hero-section">
          <div className="hand-heading-wrap">
            <h1 className="hand-heading-title">
              Need <span style={{ position: 'relative', display: 'inline-block' }}>
                help?
                {/* Curved teal brush accent under "help?" matching screenshot */}
                <svg
                  className="hand-brush-accent"
                  viewBox="0 0 140 18"
                  fill="none"
                  style={{ height: 14, bottom: -6 }}
                >
                  <path
                    d="M6 11 C40 4, 100 4, 134 11"
                    stroke="#06b6d4"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M30 13 C65 9, 105 9, 130 13"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
          </div>

          {/* Search bar: "Ask Oxoo AI" or "Ask a Human" */}
          <form className="help-search-row" onSubmit={handleAiSearch}>
            <div className="help-ai-search-box">
              <input
                type="text"
                className="help-ai-search-input"
                placeholder="Ask Oxoo AI"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
              />
              <button type="submit" className="help-ai-send-btn" title="Send question to Oxoo AI">
                <Send size={16} />
              </button>
            </div>

            <span className="help-or-divider">or</span>

            <button
              type="button"
              className="help-ask-human-btn"
              onClick={() => scrollToHumanTicket('Support question')}
            >
              Ask a Human
            </button>
          </form>

          {/* AI Interactive Answer Display */}
          {isAiLoading && (
            <div style={{ marginTop: 20, color: '#64748b', fontSize: 14 }}>
              Oxoo AI is analyzing your query across official knowledge bases...
            </div>
          )}

          {aiAnswer && (
            <div className="help-ai-answer-card">
              <div className="help-ai-answer-header">
                <Bot size={18} />
                <span>Oxoo AI Assistant Response</span>
              </div>
              <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.6, color: '#334155' }}>
                {aiAnswer}
              </p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  type="button"
                  className="button button-outline button-small"
                  onClick={() => setAiAnswer(null)}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => scrollToHumanTicket('Support question')}
                >
                  Still need help? Open support ticket ↓
                </button>
              </div>
            </div>
          )}
        </section>

        {/* =========================================================
            SECTION 2: CONTACT US & EMERGENCY LINES (SCREENSHOT 2)
            ========================================================= */}
        <section className="contact-overview-grid">
          <div>
            <div className="hand-heading-wrap" style={{ marginBottom: 20 }}>
              <h2 className="hand-heading-title" style={{ fontSize: 32 }}>
                Con<span style={{ position: 'relative', display: 'inline-block' }}>
                  tact
                  {/* Yellow/amber brush stroke under "tact" matching screenshot */}
                  <svg
                    className="hand-brush-accent"
                    viewBox="0 0 90 12"
                    fill="none"
                    style={{ height: 10, bottom: -4 }}
                  >
                    <path
                      d="M4 7 C25 2, 65 2, 86 7"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span> us
              </h2>
            </div>

            {/* 4 Action Cards matching screenshot */}
            <div className="contact-cards-grid">
              <div
                className="contact-action-card"
                onClick={() => scrollToHumanTicket('Support question')}
              >
                <h4>Meet an advisor</h4>
                <p>Schedule a 1-on-1 strategy call with an Oxoo solution architect.</p>
              </div>

              <div
                className="contact-action-card"
                onClick={() => scrollToHumanTicket('Other')}
              >
                <h4>Request developments</h4>
                <p>Custom module development, workflow tailoring, and cloud migrations.</p>
              </div>

              <div
                className="contact-action-card"
                onClick={() => scrollToHumanTicket('Support question')}
              >
                <h4>Become a partner</h4>
                <p>Join the official Oxoo Partner & Implementation Agency network.</p>
              </div>

              <div
                className="contact-action-card"
                onClick={() => scrollToHumanTicket('Report a bug')}
              >
                <h4>Report a bug</h4>
                <p>Submit critical defect reports directly to core engineering teams.</p>
              </div>
            </div>
          </div>

          {/* Emergency Lines Block */}
          <div className="emergency-lines-card">
            <h3>Emergency lines</h3>
            <ul className="emergency-list">
              <li className="emergency-item">
                <span className="emergency-region">America</span>
                <a href="tel:+16508702051" className="emergency-phone">+1 (650) 870 2051</a>
              </li>
              <li className="emergency-item">
                <span className="emergency-region">Latin America</span>
                <a href="tel:+525596024871" className="emergency-phone">+52 55 9602 4871</a>
              </li>
              <li className="emergency-item">
                <span className="emergency-region">Europe</span>
                <a href="tel:+3226168002" className="emergency-phone">+32 2 616 80 02</a>
              </li>
              <li className="emergency-item">
                <span className="emergency-region">Africa</span>
                <a href="tel:+254207640404" className="emergency-phone">+254 207 640 404</a>
              </li>
              <li className="emergency-item">
                <span className="emergency-region">Middle East</span>
                <a href="tel:+97144987800" className="emergency-phone">+971 4 498 7800</a>
              </li>
              <li className="emergency-item">
                <span className="emergency-region">Asia</span>
                <a href="tel:+917940500100" className="emergency-phone">+91 79 40 500 100</a>
              </li>
              <li className="emergency-item">
                <span className="emergency-region">Brazil</span>
                <a href="tel:+554135424880" className="emergency-phone">+55 41 3542 4880</a>
              </li>
            </ul>
          </div>
        </section>

        {/* =========================================================
            SECTION 3: SUBMIT A SUPPORT TICKET FORM (SCREENSHOT 3)
            ========================================================= */}
        <section className="ticket-form-section" id="ticket-form" ref={ticketFormRef}>
          <div className="hand-heading-wrap" style={{ marginBottom: 28 }}>
            <h2 className="hand-heading-title" style={{ fontSize: 34 }}>
              Need <span style={{ position: 'relative', display: 'inline-block' }}>
                help?
                {/* Curved teal brush stroke under "help?" matching Screenshot 3 */}
                <svg
                  className="hand-brush-accent"
                  viewBox="0 0 140 18"
                  fill="none"
                  style={{ height: 14, bottom: -6 }}
                >
                  <path
                    d="M6 11 C40 4, 100 4, 134 11"
                    stroke="#06b6d4"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M30 13 C65 9, 105 9, 130 13"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
          </div>

          {submittedTicket ? (
            <div className="ticket-success-box">
              <CheckCircle2 size={44} style={{ color: '#10b981', margin: '0 auto' }} />
              <h3>Support Ticket Received!</h3>
              <p style={{ fontSize: 15, margin: '8px 0 16px' }}>
                Your ticket reference number is <strong>{submittedTicket.ticket_number}</strong>.
              </p>
              <p style={{ fontSize: 13.5, color: '#047857', maxWidth: 540, margin: '0 auto 24px', lineHeight: 1.5 }}>
                A confirmation has been dispatched to <strong>{formData.email}</strong>. An Oxoo support specialist will review your details and respond with a resolution within 2 hours.
              </p>
              <button
                type="button"
                className="button button-emerald"
                onClick={() => {
                  setSubmittedTicket(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    cc: '',
                    identifyType: 'Subscription Code',
                    identifyValue: '',
                    topic: '',
                    summary: '',
                    description: '',
                    files: []
                  });
                }}
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket}>
              {formError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #f87171',
                  color: '#991b1b',
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 20,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <AlertCircle size={18} />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Your Name */}
              <div className="ticket-form-row">
                <label className="ticket-form-label" htmlFor="ticket-name">
                  Your Name
                </label>
                <div>
                  <input
                    id="ticket-name"
                    type="text"
                    className="ticket-form-input"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 2. Your Email */}
              <div className="ticket-form-row">
                <label className="ticket-form-label" htmlFor="ticket-email">
                  Your Email
                </label>
                <div>
                  <input
                    id="ticket-email"
                    type="email"
                    className="ticket-form-input"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 3. Your Phone (optional) */}
              <div className="ticket-form-row">
                <label className="ticket-form-label" htmlFor="ticket-phone">
                  Your Phone <span className="opt">(optional)</span>
                </label>
                <div>
                  <input
                    id="ticket-phone"
                    type="tel"
                    className="ticket-form-input"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* 4. CC to (optional) */}
              <div className="ticket-form-row">
                <label className="ticket-form-label" htmlFor="ticket-cc">
                  CC to <span className="opt">(optional)</span>
                </label>
                <div>
                  <input
                    id="ticket-cc"
                    type="text"
                    className="ticket-form-input"
                    placeholder="e.g. follower1@domain.com, follower2@domain.com"
                    value={formData.cc}
                    onChange={(e) => handleChange('cc', e.target.value)}
                  />
                  <div className="ticket-input-note">
                    Please note that followers will receive all the messages that will be shared
                  </div>
                </div>
              </div>

              {/* 5. Identify me with my */}
              <div className="ticket-form-row">
                <label className="ticket-form-label">
                  Identify me with my
                </label>
                <div>
                  <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
                    <label className="ticket-radio-label">
                      <input
                        type="radio"
                        name="identifyType"
                        value="Subscription Code"
                        checked={formData.identifyType === 'Subscription Code'}
                        onChange={(e) => handleChange('identifyType', e.target.value)}
                      />
                      <span>Subscription Code</span>
                    </label>

                    <label className="ticket-radio-label">
                      <input
                        type="radio"
                        name="identifyType"
                        value="Database URL"
                        checked={formData.identifyType === 'Database URL'}
                        onChange={(e) => handleChange('identifyType', e.target.value)}
                      />
                      <span>Database URL</span>
                    </label>
                  </div>

                  <input
                    type="text"
                    className="ticket-form-input"
                    placeholder={formData.identifyType === 'Subscription Code' ? 'M1234567891011 or SO2023/123456' : 'yourcompany.oxoo.ai or custom domain'}
                    value={formData.identifyValue}
                    onChange={(e) => handleChange('identifyValue', e.target.value)}
                  />

                  <div>
                    <Link to="/login" className="ticket-helper-link">
                      <HelpCircle size={13} />
                      <span>Sign in if you don't know your subscription code</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 6. Topic Radio Selection */}
              <div className="ticket-form-row">
                <label className="ticket-form-label">
                  Topic
                </label>
                <div className="ticket-radio-group">
                  {TOPIC_OPTIONS.map((t) => (
                    <label key={t} className="ticket-radio-label">
                      <input
                        type="radio"
                        name="ticket-topic"
                        value={t}
                        checked={formData.topic === t}
                        onChange={(e) => handleChange('topic', e.target.value)}
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 7. Short Summary */}
              <div className="ticket-form-row">
                <label className="ticket-form-label" htmlFor="ticket-summary">
                  Short Summary
                </label>
                <div>
                  <input
                    id="ticket-summary"
                    type="text"
                    className="ticket-form-input"
                    value={formData.summary}
                    onChange={(e) => handleChange('summary', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 8. Detailed description */}
              <div className="ticket-form-row">
                <label className="ticket-form-label" htmlFor="ticket-desc">
                  Detailed description
                </label>
                <div>
                  {!formData.topic ? (
                    <div style={{
                      padding: '16px',
                      background: '#f8fafc',
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: 6,
                      fontSize: 14,
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span>Please select a `ticket type` first 👆</span>
                    </div>
                  ) : (
                    <textarea
                      id="ticket-desc"
                      className="ticket-textarea"
                      placeholder={`Please describe what is happening in detail for: ${formData.topic}...`}
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      required
                    />
                  )}
                </div>
              </div>

              {/* 9. Attachments */}
              <div className="ticket-form-row">
                <label className="ticket-form-label">
                  Attachments
                </label>
                <div>
                  <div className="ticket-file-wrap">
                    <input
                      type="file"
                      multiple
                      className="ticket-file-input"
                      onChange={(e) => {
                        const fileNames = Array.from(e.target.files || []).map(f => f.name);
                        handleChange('files', fileNames);
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="add-attachment-btn"
                    onClick={() => {
                      document.querySelector('.ticket-file-input')?.click();
                    }}
                  >
                    + Add more attachments
                  </button>

                  <div className="ticket-privacy-notice">
                    <HelpCircle size={13} style={{ flexShrink: 0 }} />
                    <span>
                      Please do not include sensitive data. We will process your data as described in our{' '}
                      <Link to="/contact">Privacy Policy</Link>
                    </span>
                  </div>
                </div>
              </div>

              {/* 10. Submit Button */}
              <div className="ticket-form-row" style={{ marginTop: 24, marginBottom: 0 }}>
                <div />
                <div>
                  <button
                    type="submit"
                    className="ticket-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>

        {/* =========================================================
            SECTION 4: OXOO OFFICES GLOBAL DIRECTORY (SCREENSHOT 2)
            ========================================================= */}
        <section className="offices-section">
          <div className="hand-heading-wrap">
            <h2 className="hand-heading-title" style={{ fontSize: 36 }}>
              Oxoo <span style={{ position: 'relative', display: 'inline-block' }}>
                Offices
                {/* Wavy blue brush stroke under "Offices" matching Screenshot 2 */}
                <svg
                  className="hand-brush-accent"
                  viewBox="0 0 160 16"
                  fill="none"
                  style={{ height: 14, bottom: -6 }}
                >
                  <path
                    d="M4 10 Q25 3, 50 10 T95 10 T140 10 T156 10"
                    stroke="#0ea5e9"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 12 Q35 6, 60 12 T105 12 T150 12"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
          </div>

          {OFFICE_REGIONS.map((reg) => (
            <div key={reg.region} style={{ marginBottom: 40 }}>
              <h3 className="region-title">{reg.region}</h3>
              <div className="offices-grid">
                {reg.offices.map((off) => (
                  <div key={off.country} className="office-card">
                    <div>
                      <div className="office-country">
                        <span className="flag">{off.flag}</span>
                        <span>{off.country}</span>
                      </div>

                      <div className="office-tags" style={{ margin: '8px 0 12px' }}>
                        {off.tags.map((t) => (
                          <span key={t.label} className={`office-tag tag-${t.type}`}>
                            {t.label}
                          </span>
                        ))}
                      </div>

                      <p className="office-address">{off.address}</p>
                    </div>

                    <div>
                      <a href={`tel:${off.phone.replace(/[^0-9+]/g, '')}`} className="office-phone">
                        <Phone size={13} />
                        <span>{off.phone}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
