import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { Header, Footer } from './components';

export const ALL_APPS_CATEGORIES = [
  {
    id: 'finance',
    name: 'Finance',
    headerTitle: 'FINANCE',
    underlineColor: '#2563eb',
    titleColor: '#2563eb',
    apps: [
      { name: 'Accounting', desc: 'Manage your finances and books.', icon: '/apps/logo-accounting.png?v=clean', slug: 'accounting', bgColor: '#eff6ff' },
      { name: 'Invoicing', desc: 'Create and send professional invoices.', icon: '/apps/logo-accounting.png?v=clean', slug: 'invoicing', bgColor: '#ecfdf5' },
      { name: 'Expenses', desc: 'Track employee expenses and approvals.', icon: '/apps/logo-purchase.png?v=clean', slug: 'expenses', bgColor: '#fff7ed' },
      { name: 'Sign', desc: 'Send and sign documents online securely.', icon: '/apps/logo-sign.png?v=clean', slug: 'sign', bgColor: '#f0f9ff' },
      { name: 'Spreadsheet', desc: 'Collaborative live data spreadsheets.', icon: '/apps/logo-documents.png?v=clean', slug: 'spreadsheet', bgColor: '#fff1f2' },
      { name: 'ESG', desc: 'Track sustainability and ESG compliance.', icon: '/apps/logo-sign.png?v=clean', slug: 'esg', bgColor: '#ecfdf5' }
    ]
  },
  {
    id: 'sales',
    name: 'Sales',
    headerTitle: 'SALES',
    underlineColor: '#ec4899',
    titleColor: '#ec4899',
    apps: [
      { name: 'CRM', desc: 'Manage leads, customers and pipeline.', icon: '/apps/logo-crm.png?v=clean', slug: 'crm', bgColor: '#fdf2f8' },
      { name: 'Sales', desc: 'Manage quotations, orders and contracts.', icon: '/apps/logo-sales.png?v=clean', slug: 'sales', bgColor: '#fff7ed' },
      { name: 'Subscriptions', desc: 'Automate recurring billing and MRR.', icon: '/apps/logo-subscriptions.png?v=clean', slug: 'subscriptions', bgColor: '#ecfdf5' },
      { name: 'POS Shop', desc: 'Point of sale for retail stores & shops.', icon: '/apps/logo-pos.png?v=clean', slug: 'pos-shop', bgColor: '#f5f3ff' },
      { name: 'POS Restaurant', desc: 'Floor plans, tables and kitchen orders.', icon: '/apps/logo-pos.png?v=clean', slug: 'pos-restaurant', bgColor: '#fffbeb' },
      { name: 'Rental', desc: 'Manage equipment rental and schedules.', icon: '/apps/logo-field-service.png?v=clean', slug: 'rental', bgColor: '#f0f9ff' }
    ]
  },
  {
    id: 'websites',
    name: 'Websites & Apps',
    headerTitle: 'WEBSITES & APPS',
    underlineColor: '#0891b2',
    titleColor: '#0891b2',
    apps: [
      { name: 'AI Website Builder', desc: 'AI-powered drag-and-drop website generation.', icon: '/apps/logo-website.png?v=clean', slug: 'ai-website-builder', bgColor: '#eff6ff' },
      { name: 'Android & iOS Apps', desc: 'Native and hybrid mobile applications.', icon: '/apps/logo-studio.png?v=clean', slug: 'android-ios-apps', bgColor: '#ecfdf5' },
      { name: 'eCommerce Websites', desc: 'High-converting online store platforms.', icon: '/apps/logo-ecommerce.png?v=clean', slug: 'ecommerce-websites', bgColor: '#fdf2f8' },
      { name: '3D Websites', desc: 'Interactive 3D WebGL digital experiences.', icon: '/apps/logo-website.png?v=clean', slug: '3d-websites', bgColor: '#faf5ff' },
      { name: 'AI Chatbots', desc: 'Custom trained AI chatbots & assistants.', icon: '/apps/logo-ai.png?v=clean', slug: 'ai-chatbots', bgColor: '#f0f9ff' },
      { name: 'Web Apps & Other', desc: 'Scalable custom web applications & SaaS.', icon: '/apps/logo-documents.png?v=clean', slug: 'web-apps-other', bgColor: '#fff7ed' }
    ]
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    headerTitle: 'SUPPLY CHAIN',
    underlineColor: '#ea580c',
    titleColor: '#ea580c',
    apps: [
      { name: 'Inventory', desc: 'Real-time stock and warehouse tracking.', icon: '/apps/logo-inventory.png?v=clean', slug: 'inventory', bgColor: '#fffbeb' },
      { name: 'Manufacturing', desc: 'MRP, work orders and shop floor bills.', icon: '/apps/logo-manufacturing.png?v=clean', slug: 'manufacturing', bgColor: '#ecfdf5' },
      { name: 'Maintenance', desc: 'Equipment maintenance and work tickets.', icon: '/apps/logo-field-service.png?v=clean', slug: 'maintenance', bgColor: '#fdf2f8' },
      { name: 'PLM', desc: 'Product lifecycle and engineering change.', icon: '/apps/logo-manufacturing.png?v=clean', slug: 'plm', bgColor: '#f5f3ff' },
      { name: 'Quality', desc: 'Define inspection points and quality checks.', icon: '/apps/logo-planning.png?v=clean', slug: 'quality', bgColor: '#fff7ed' },
      { name: 'Purchase', desc: 'Automate POs, vendor RFQs and deliveries.', icon: '/apps/logo-purchase.png?v=clean', slug: 'purchase', bgColor: '#eff6ff' }
    ]
  },
  {
    id: 'human-resources',
    name: 'Human Resources',
    headerTitle: 'HUMAN RESOURCES',
    underlineColor: '#7c3aed',
    titleColor: '#7c3aed',
    apps: [
      { name: 'Employees', desc: 'Central employee directory and records.', icon: '/apps/logo-hr.png?v=clean', slug: 'employees', bgColor: '#eff6ff' },
      { name: 'Payroll', desc: 'Automated salary calculation and slips.', icon: '/apps/logo-accounting.png?v=clean', slug: 'payroll', bgColor: '#f5f3ff' },
      { name: 'Recruitment', desc: 'Hiring pipeline, resumes and interviews.', icon: '/apps/logo-crm.png?v=clean', slug: 'recruitment', bgColor: '#ecfdf5' },
      { name: 'Time Off', desc: 'Manage leaves, balances and holidays.', icon: '/apps/logo-timesheets.png?v=clean', slug: 'time-off', bgColor: '#fff1f2' },
      { name: 'Appraisals', desc: 'Performance reviews and 360 appraisals.', icon: '/apps/logo-studio.png?v=clean', slug: 'appraisals', bgColor: '#fffbeb' },
      { name: 'Fleet', desc: 'Manage company vehicles and fuel logs.', icon: '/apps/logo-field-service.png?v=clean', slug: 'fleet', bgColor: '#fdf2f8' }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    headerTitle: 'MARKETING',
    underlineColor: '#e11d48',
    titleColor: '#e11d48',
    apps: [
      { name: 'Social Marketing', desc: 'Publish and schedule social media.', icon: '/apps/logo-email-marketing.png?v=clean', slug: 'social-marketing', bgColor: '#faf5ff' },
      { name: 'Email Marketing', desc: 'Design and deliver targeted newsletters.', icon: '/apps/logo-email-marketing.png?v=clean', slug: 'email-marketing', bgColor: '#eff6ff' },
      { name: 'SMS Marketing', desc: 'Instant high-delivery text messaging.', icon: '/apps/logo-discuss.png?v=clean', slug: 'sms-marketing', bgColor: '#fff7ed' },
      { name: 'Marketing Automation', desc: 'Automate lead scoring and campaigns.', icon: '/apps/logo-email-marketing.png?v=clean', slug: 'marketing-automation', bgColor: '#ecfdf5' },
      { name: 'WhatsApp', desc: 'Official WhatsApp Cloud API broadcasts.', icon: '/apps/logo-discuss.png?v=clean', slug: 'whatsapp', bgColor: '#f0fdf4' },
      { name: 'Surveys', desc: 'Customer satisfaction and feedback NPS.', icon: '/apps/logo-knowledge.png?v=clean', slug: 'surveys', bgColor: '#f0f9ff' }
    ]
  },
  {
    id: 'whatsapp-chat-ai',
    name: 'WhatsApp Chat AI',
    headerTitle: 'WHATSAPP CHAT AI',
    underlineColor: '#059669',
    titleColor: '#059669',
    apps: [
      { name: 'WhatsApp AI Inbox', desc: 'Shared team inbox powered by AI agents.', icon: '/apps/logo-discuss.png?v=clean', slug: 'whatsapp-ai-inbox', bgColor: '#ecfdf5' },
      { name: 'WhatsApp Marketing & Broadcasts', desc: 'Bulk campaign broadcasts & analytics.', icon: '/apps/logo-email-marketing.png?v=clean', slug: 'whatsapp-marketing-broadcasts', bgColor: '#f0fdf4' },
      { name: 'WhatsApp Flow Builder', desc: 'Visual no-code automated message flows.', icon: '/apps/logo-planning.png?v=clean', slug: 'whatsapp-flow-builder', bgColor: '#eff6ff' },
      { name: 'WhatsApp Commerce', desc: 'Catalogs, in-chat payments & orders.', icon: '/apps/logo-ecommerce.png?v=clean', slug: 'whatsapp-commerce', bgColor: '#fdf2f8' },
      { name: 'WhatsApp Booking & Reminders', desc: 'Automated appointments & reminder alerts.', icon: '/apps/logo-planning.png?v=clean', slug: 'whatsapp-booking-reminders', bgColor: '#fffbeb' },
      { name: 'WhatsApp Integrations & Settings', desc: 'Meta Cloud API, webhooks & CRM sync.', icon: '/apps/logo-studio.png?v=clean', slug: 'whatsapp-integrations-settings', bgColor: '#f5f3ff' }
    ]
  },
  {
    id: 'productivity',
    name: 'Productivity',
    headerTitle: 'PRODUCTIVITY',
    underlineColor: '#6d28d9',
    titleColor: '#6d28d9',
    apps: [
      { name: 'Artificial Intelligence', desc: 'AI smart assistants and automated agents.', icon: '/apps/logo-ai.png?v=clean', slug: 'artificial-intelligence', bgColor: '#eff6ff' },
      { name: 'Discuss', desc: 'Team channels, chat and video meetings.', icon: '/apps/logo-discuss.png?v=clean', slug: 'discuss', bgColor: '#f5f3ff' },
      { name: 'VoIP', desc: 'Integrated browser phone and call logs.', icon: '/apps/logo-helpdesk.png?v=clean', slug: 'voip', bgColor: '#ecfdf5' },
      { name: 'IoT', desc: 'Connect factory sensors and hardware.', icon: '/apps/logo-studio.png?v=clean', slug: 'iot', bgColor: '#fff7ed' },
      { name: 'Documents', desc: 'Paperless document repository and OCR.', icon: '/apps/logo-documents.png?v=clean', slug: 'documents', bgColor: '#faf5ff' },
      { name: 'Knowledge', desc: 'Internal company wiki, SOPs and manuals.', icon: '/apps/logo-knowledge.png?v=clean', slug: 'knowledge', bgColor: '#f0f9ff' }
    ]
  }
];

export default function AllAppsDirectory() {
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = ALL_APPS_CATEGORIES.map((cat) => {
    if (!normalizedQuery) return cat;
    const matchingApps = cat.apps.filter(
      (app) =>
        app.name.toLowerCase().includes(normalizedQuery) ||
        app.desc.toLowerCase().includes(normalizedQuery) ||
        cat.name.toLowerCase().includes(normalizedQuery)
    );
    return { ...cat, apps: matchingApps };
  }).filter((cat) => cat.apps.length > 0);

  return (
    <div className="one-need-page">
      <Header />

      <main className="one-need-main">
        {/* HERO SECTION */}
        <div className="one-need-hero-container">
          <div className="one-need-hero-grid">
            <div className="one-need-hero-left">
              <span className="odoo-badge-pill">
                <Sparkles size={14} className="sparkle-icon" /> 48 Connected Business Applications
              </span>
              <h1 className="one-need-hero-title">
                One need, one app<span className="script-dot">.</span>
                <span className="hero-hand-sparkles" aria-hidden="true">✦</span>
              </h1>
              <div className="hero-brush-container" aria-hidden="true">
                <svg viewBox="0 0 280 18" width="280" height="18" fill="none">
                  <path d="M4 12 C80 4, 200 4, 276 12" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" />
                  <path d="M60 14 C120 10, 180 10, 240 14" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="one-need-hero-right">
              <p className="one-need-hero-subtitle">
                Everything you need to automate, manage, and scale your business operations seamlessly on one unified cloud platform.
              </p>
              <div className="one-need-controls-row">
                <div className="one-need-search-wrapper" style={{ maxWidth: '420px', width: '100%' }}>
                  <Search size={18} className="search-icon-muted" />
                  <input
                    type="text"
                    placeholder="Search any app: Accounting, CRM, Inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="one-need-search-input"
                    aria-label="Search apps"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="one-need-search-clear"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA - ONLY CARDS */}
        <div className="one-need-content-container">
          {filteredCategories.length === 0 ? (
            <div className="one-need-empty">
              <h3>No applications found</h3>
              <p>No apps matched "{searchQuery}". Try a different keyword.</p>
              <button
                type="button"
                className="button button-emerald"
                onClick={() => setSearchQuery('')}
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <section key={category.id} className="one-need-category-section" id={category.id}>
                <div className="one-need-cat-header">
                  <h2 className="one-need-cat-title">
                    {category.name}
                  </h2>
                  <div className="cat-brush-stroke-wrap" aria-hidden="true">
                    <svg viewBox="0 0 160 14" width="140" height="12" fill="none">
                      <path
                        d="M4 8 C45 3, 115 4, 156 8"
                        stroke={category.underlineColor || '#06b6d4'}
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="one-need-cards-grid">
                  {category.apps.map((app) => (
                    <Link
                      key={app.slug}
                      to={`/apps/${app.slug}`}
                      className="one-need-card"
                      title={`${app.name} - ${app.desc}`}
                    >
                      <div className="one-need-icon-box" style={{ backgroundColor: app.bgColor }}>
                        <img
                          src={app.icon}
                          alt={`${app.name} icon`}
                          className="one-need-icon-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = '/oxoo-icon.png';
                          }}
                        />
                      </div>
                      <div className="one-need-card-text">
                        <span className="one-need-card-name">{app.name}</span>
                        <p className="one-need-card-desc">{app.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
