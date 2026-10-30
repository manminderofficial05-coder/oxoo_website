// ============================================================================
// Central Live Demo Routing, Flow & Brand Profile Configuration
// ============================================================================
// Security Note: All demo redirects are strictly validated against this
// internal allowlist. Arbitrary URLs from query parameters or form fields
// are never used as redirect targets.

export const DEMO_FLOW_CONFIG = {
  // Step 1 -> Step 2: Clicking a Live Demo link opens the request form first
  requireRequestFormBeforeDemo: true,
  // Route for the dedicated Demo Request Form
  requestFormRoute: '/request-demo',
  // Whether completing the request form grants verified session access to the demo viewer
  grantViewerSessionOnSubmit: true,
  // Storage key used to pass the selected demo identifier safely across navigation
  selectedDemoStorageKey: 'oxoo_selected_demo_id',
};

export const LIVE_DEMO_CATALOG = {
  'productivity-ai': {
    id: 'productivity-ai',
    viewerSlug: 'ai-demo',
    appSlug: 'ai',
    label: 'Productivity & AI',
    shortName: 'PrimePro AI & Productivity Suite',
    category: 'Productivity & AI',
    route: '/demo/ai-demo',
    staticBundleCheck: '/ai-demo/dashboard/overview/index.html',
    iconKey: 'zap',
    accentColor: '#eab308',
    badgeBg: '#fef9c3',
    description:
      'AI-powered workspace automation, autonomous agents, smart document processing, and unified team collaboration.',
    highlights: [
      'Autonomous AI workflow copilot & natural language analytics',
      'Automated document extraction, summaries & knowledge base RAG',
      'Unified team chat, tasks, calendar & executive dashboards',
    ],
  },
  'sales-crm': {
    id: 'sales-crm',
    viewerSlug: 'sales-demo',
    appSlug: 'crm',
    label: 'Sales & CRM',
    shortName: 'PrimePro Sales & CRM Suite',
    category: 'Sales & CRM',
    route: '/demo/sales-demo',
    staticBundleCheck: '/sales-demo/dashboard/index.html',
    iconKey: 'briefcase',
    accentColor: '#9a3412',
    badgeBg: '#ffedd5',
    description:
      '360° customer pipeline management, AI lead scoring, instant quotation builder, and revenue forecasting.',
    highlights: [
      'Visual Kanban sales pipeline with automated stage triggers',
      '1-click CPQ quotation to GST tax invoice conversion',
      'Omnichannel email, WhatsApp & call activity tracking',
    ],
  },
  'human-resources': {
    id: 'human-resources',
    viewerSlug: 'hrms-demo',
    appSlug: 'hr',
    label: 'Human Resources',
    shortName: 'PrimePro HRMS & Payroll Suite',
    category: 'Human Resources',
    route: '/demo/hrms-demo',
    staticBundleCheck: '/hrms-demo/index.html',
    iconKey: 'users',
    accentColor: '#7c3aed',
    badgeBg: '#f3e8ff',
    description:
      'End-to-end employee lifecycle, attendance & shift tracking, automated statutory payroll, and appraisals.',
    highlights: [
      'Automated PF, ESI, PT & TDS compliant payroll engine',
      'Self-service employee portal for leaves, expenses & payslips',
      'Recruitment pipeline, onboarding & OKR performance reviews',
    ],
  },
  'finance-gst': {
    id: 'finance-gst',
    viewerSlug: 'finance-demo',
    appSlug: 'accounting',
    label: 'Finance & GST',
    shortName: 'PrimePro Finance, Accounting & GST Suite',
    category: 'Finance & GST',
    route: '/demo/finance-demo',
    staticBundleCheck: '/finance-demo/index.html',
    iconKey: 'bar-chart',
    accentColor: '#2563eb',
    badgeBg: '#dbeafe',
    description:
      'Real-time double-entry accounting, automated GST e-invoicing, smart bank reconciliation, and financial reporting.',
    highlights: [
      'Direct GSTR-1, GSTR-3B filing & e-Way Bill generation',
      'Automated bank feed reconciliation & vendor bill matching',
      'Multi-company balance sheet, P&L & cash-flow statements',
    ],
  },
  'supply-chain': {
    id: 'supply-chain',
    viewerSlug: 'supply-chain-demo',
    appSlug: 'inventory',
    label: 'Supply Chain & Operations',
    shortName: 'PrimePro Supply Chain & Inventory Suite',
    category: 'Supply Chain & Operations',
    route: '/demo/supply-chain-demo',
    staticBundleCheck: '/supply-chain-demo/index.html',
    iconKey: 'package',
    accentColor: '#ea580c',
    badgeBg: '#ffedd5',
    description:
      'Multi-warehouse inventory control, barcode & batch tracking, automated procurement, and manufacturing MRP.',
    highlights: [
      'Real-time multi-location stock ledger with serial/lot tracking',
      'Automated reorder rules, RFQ vendor portal & purchase orders',
      'Bill of Materials (BoM), work center routing & quality checks',
    ],
  },
  'website-builder': {
    id: 'website-builder',
    viewerSlug: 'website-builder-demo',
    appSlug: 'website',
    label: 'Website Builder',
    shortName: 'PrimePro AI Website Builder & eCommerce',
    category: 'Website Builder',
    route: '/demo/website-builder-demo',
    staticBundleCheck: '/website-builder-demo/index.html',
    iconKey: 'globe',
    accentColor: '#0284c7',
    badgeBg: '#e0f2fe',
    description:
      'AI-assisted drag-and-drop website studio, integrated eCommerce storefronts, SEO tools, and custom domain hosting.',
    highlights: [
      'Generate responsive enterprise pages in seconds with AI prompts',
      'Built-in product catalog, shopping cart & Razorpay checkout',
      'Automated technical SEO, analytics & custom SSL domains',
    ],
  },
};

export const LIVE_DEMO_LIST = Object.values(LIVE_DEMO_CATALOG);

// Alias lookup table so legacy slugs or viewer slugs map cleanly to the canonical ID
const DEMO_ALIAS_MAP = {
  'productivity-ai': 'productivity-ai',
  'ai-demo': 'productivity-ai',
  ai: 'productivity-ai',
  'artificial-intelligence': 'productivity-ai',
  'sales-crm': 'sales-crm',
  'sales-demo': 'sales-crm',
  crm: 'sales-crm',
  sales: 'sales-crm',
  'human-resources': 'human-resources',
  'hrms-demo': 'human-resources',
  hr: 'human-resources',
  hrms: 'human-resources',
  employees: 'human-resources',
  'finance-gst': 'finance-gst',
  'finance-demo': 'finance-gst',
  accounting: 'finance-gst',
  finance: 'finance-gst',
  invoicing: 'finance-gst',
  'supply-chain': 'supply-chain',
  'supply-chain-demo': 'supply-chain',
  inventory: 'supply-chain',
  purchase: 'supply-chain',
  manufacturing: 'supply-chain',
  'website-builder': 'website-builder',
  'website-builder-demo': 'website-builder',
  website: 'website-builder',
  'ai-website-builder': 'website-builder',
};

/**
 * Resolves a demo identifier or alias to a safe canonical demo config object.
 * Returns null if the identifier is unrecognized or invalid (prevents open redirect attacks).
 */
export function getSafeDemoConfig(identifier) {
  if (!identifier || typeof identifier !== 'string') return null;
  const cleaned = identifier.trim().toLowerCase();
  // Reject any input that looks like an external URL or protocol handler
  if (
    cleaned.includes('://') ||
    cleaned.startsWith('//') ||
    cleaned.startsWith('http') ||
    cleaned.startsWith('javascript:') ||
    cleaned.startsWith('data:')
  ) {
    return null;
  }
  const canonicalId = DEMO_ALIAS_MAP[cleaned];
  if (!canonicalId) return null;
  return LIVE_DEMO_CATALOG[canonicalId] || null;
}

/**
 * Stores the selected demo ID safely in sessionStorage and returns the canonical ID.
 */
export function saveSelectedDemoId(identifier) {
  const config = getSafeDemoConfig(identifier);
  if (!config) return null;
  try {
    sessionStorage.setItem(DEMO_FLOW_CONFIG.selectedDemoStorageKey, config.id);
  } catch (err) {
    // Ignore storage quota / privacy mode errors
  }
  return config.id;
}

/**
 * Reads the previously stored demo ID from sessionStorage and validates it against the allowlist.
 */
export function getSavedSelectedDemoId() {
  try {
    const raw = sessionStorage.getItem(DEMO_FLOW_CONFIG.selectedDemoStorageKey);
    const config = getSafeDemoConfig(raw);
    return config ? config.id : null;
  } catch (err) {
    return null;
  }
}

/**
 * Builds the safe internal URL to open the live demo viewer for a validated demo config.
 */
export function buildSafeDemoLaunchUrl(demoId, { companyName = '', email = '' } = {}) {
  const config = getSafeDemoConfig(demoId);
  if (!config || !config.route || !config.route.startsWith('/demo/')) {
    return null;
  }
  const params = new URLSearchParams();
  if (companyName && typeof companyName === 'string') {
    const cleanCompany = companyName.trim().slice(0, 80);
    if (cleanCompany) params.set('company', cleanCompany);
  }
  if (email && typeof email === 'string') {
    const cleanEmail = email.trim().slice(0, 120);
    if (cleanEmail) params.set('email', cleanEmail);
  }
  if (DEMO_FLOW_CONFIG.grantViewerSessionOnSubmit) {
    params.set('verified', 'true');
  }
  const qs = params.toString();
  return qs ? `${config.route}?${qs}` : config.route;
}

// Configurable Official Social Profile URLs
export const SOCIAL_PROFILE_URLS = {
  linkedin: import.meta.env?.VITE_SOCIAL_LINKEDIN_URL || 'https://www.linkedin.com/company/primepro-ai',
  instagram: import.meta.env?.VITE_SOCIAL_INSTAGRAM_URL || 'https://www.instagram.com/primepro.ai',
  youtube: import.meta.env?.VITE_SOCIAL_YOUTUBE_URL || 'https://www.youtube.com/@primeproai',
  facebook: import.meta.env?.VITE_SOCIAL_FACEBOOK_URL || 'https://www.facebook.com/primeproai',
  x: import.meta.env?.VITE_SOCIAL_X_URL || 'https://x.com/primepro_ai',
};

// Footer Solutions Column Links
export const FOOTER_SOLUTIONS_LINKS = [
  { label: 'All Services', to: '/services' },
  { label: 'CRM', to: '/apps/crm' },
  { label: 'Accounting & GST', to: '/apps/accounting' },
  { label: 'HRMS & Payroll', to: '/apps/hr' },
  { label: 'Inventory Management', to: '/apps/inventory' },
  { label: 'Supply Chain & Operations', to: '/services?category=Supply%20Chain' },
  { label: 'AI Automation', to: '/apps/ai' },
  { label: 'Website Builder', to: '/apps/website' },
];

// Footer Company & Plans Column Links
export const FOOTER_COMPANY_LINKS = [
  { label: 'Pricing Plans', to: '/pricing' },
  { label: 'Help & Support', to: '/help' },
  { label: 'Submit a Ticket', to: '/help-form' },
  { label: 'Request Full Demo', to: '/request-demo' },
  { label: 'Contact Sales', to: '/contact' },
  { label: 'About PrimePro.ai', to: '/about' },
  { label: 'Careers', to: '/careers' },
  { label: 'Partner Program', to: '/partners' },
];

import { LEGAL_TRUST_CONFIG } from './legalConfig.js';

// Footer Bottom Legal & Compliance Links
export const FOOTER_LEGAL_LINKS = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Security', to: '/security' },
  { label: LEGAL_TRUST_CONFIG.certification.footerLinkLabel, to: '/compliance' },
];

