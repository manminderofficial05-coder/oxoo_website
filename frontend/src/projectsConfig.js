// ============================================================================
// PrimePro.ai — Unified Projects Hub & Service Catalogue Configuration
// ============================================================================

export const VERIFIED_BUSINESS_PHONE = '+91 79 4050 0100';
export const VERIFIED_BUSINESS_PHONE_TEL = 'tel:+917940500100';

export const PROJECT_CATEGORIES = [
  {
    id: 'websites-apps',
    name: 'Websites & Apps',
    shortLabel: 'Websites & Apps',
    tagline: 'Custom AI websites, mobile applications, 3D web experiences, and enterprise web portals.',
    accentColor: '#2563eb',
    badgeBg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    iconName: 'Globe',
    services: [
      {
        id: 'ai-website-builder',
        slug: 'ai-website-builder',
        name: 'AI Website Builder',
        category: 'Websites & Apps',
        categoryId: 'websites-apps',
        iconName: 'Sparkles',
        iconColor: '#2563eb',
        iconBg: '#eff6ff',
        shortDesc: 'Launch high-converting, SEO-optimized business websites with AI-assisted design and copy.',
        deliverables: ['Custom Responsive UI', 'SEO & Core Web Vitals', 'CMS & Lead Capture']
      },
      {
        id: 'android-ios-apps',
        slug: 'android-ios-apps',
        name: 'Android & iOS Apps',
        category: 'Websites & Apps',
        categoryId: 'websites-apps',
        iconName: 'Smartphone',
        iconColor: '#0284c7',
        iconBg: '#e0f2fe',
        shortDesc: 'Native and cross-platform mobile applications engineered for performance on Android and iOS.',
        deliverables: ['iOS & Android Builds', 'Push Notifications', 'App Store Deployment']
      },
      {
        id: 'ecommerce-websites',
        slug: 'ecommerce-websites',
        name: 'eCommerce Websites',
        category: 'Websites & Apps',
        categoryId: 'websites-apps',
        iconName: 'ShoppingBag',
        iconColor: '#059669',
        iconBg: '#d1fae5',
        shortDesc: 'Full-featured online storefronts with catalog management, multi-currency checkout, and inventory sync.',
        deliverables: ['Product Catalog & Cart', 'Payment Gateway Sync', 'Order & Inventory Flow']
      },
      {
        id: '3d-websites',
        slug: '3d-websites',
        name: '3D Websites',
        category: 'Websites & Apps',
        categoryId: 'websites-apps',
        iconName: 'Box',
        iconColor: '#7c3aed',
        iconBg: '#f3e8ff',
        shortDesc: 'Immersive WebGL and interactive 3D product showcases that captivate modern audiences.',
        deliverables: ['Interactive 3D Models', 'Smooth Scroll Motion', 'GPU-Optimized Assets']
      },
      {
        id: 'ai-chatbots',
        slug: 'ai-chatbots',
        name: 'AI Chatbots',
        category: 'Websites & Apps',
        categoryId: 'websites-apps',
        iconName: 'Bot',
        iconColor: '#0891b2',
        iconBg: '#cffafe',
        shortDesc: 'Custom RAG-trained conversational AI assistants grounded in your business knowledge base.',
        deliverables: ['Custom Knowledge Base', 'Lead Qualification', 'Human Handover']
      },
      {
        id: 'web-apps-other',
        slug: 'web-apps-other',
        name: 'Web Apps & Other',
        category: 'Websites & Apps',
        categoryId: 'websites-apps',
        iconName: 'Code2',
        iconColor: '#4f46e5',
        iconBg: '#e0e7ff',
        shortDesc: 'Bespoke SaaS portals, internal dashboards, ERP extensions, and custom API integrations.',
        deliverables: ['Custom Web Architecture', 'Role-Based Access', 'REST / Webhook APIs']
      }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    shortLabel: 'Marketing',
    tagline: 'Multi-channel growth campaigns, marketing automation, and customer insights.',
    accentColor: '#0891b2',
    badgeBg: '#ecfeff',
    badgeBorder: '#a5f3fc',
    iconName: 'Megaphone',
    services: [
      {
        id: 'social-marketing',
        slug: 'social-marketing',
        name: 'Social Marketing',
        category: 'Marketing',
        categoryId: 'marketing',
        iconName: 'Share2',
        iconColor: '#2563eb',
        iconBg: '#eff6ff',
        shortDesc: 'Plan, schedule, and analyze high-impact campaigns across LinkedIn, Instagram, Facebook, and X.',
        deliverables: ['Content Calendar', 'Multi-Channel Publishing', 'Engagement Analytics']
      },
      {
        id: 'email-marketing',
        slug: 'email-marketing',
        name: 'Email Marketing',
        category: 'Marketing',
        categoryId: 'marketing',
        iconName: 'Mail',
        iconColor: '#0284c7',
        iconBg: '#e0f2fe',
        shortDesc: 'Segmented email broadcasts, drip sequences, and high-deliverability newsletter campaigns.',
        deliverables: ['Responsive Templates', 'Audience Segmentation', 'Open & Click Tracking']
      },
      {
        id: 'sms-marketing',
        slug: 'sms-marketing',
        name: 'SMS Marketing',
        category: 'Marketing',
        categoryId: 'marketing',
        iconName: 'MessageSquare',
        iconColor: '#d97706',
        iconBg: '#fef3c7',
        shortDesc: 'Instant transactional alerts, promotional SMS blasts, and regional DLT-compliant messaging.',
        deliverables: ['Instant SMS Delivery', 'DLT & Sender ID Setup', 'Conversion Tracking']
      },
      {
        id: 'marketing-automation',
        slug: 'marketing-automation',
        name: 'Marketing Automation',
        category: 'Marketing',
        categoryId: 'marketing',
        iconName: 'Zap',
        iconColor: '#7c3aed',
        iconBg: '#f3e8ff',
        shortDesc: 'Visual customer journeys, lead scoring, and automated omnichannel follow-up workflows.',
        deliverables: ['Trigger Workflows', 'Lead Scoring Rules', 'CRM Pipeline Sync']
      },
      {
        id: 'whatsapp-marketing',
        slug: 'whatsapp-marketing',
        name: 'WhatsApp Marketing',
        category: 'Marketing',
        categoryId: 'marketing',
        iconName: 'MessageCircle',
        iconColor: '#16a34a',
        iconBg: '#dcfce7',
        shortDesc: 'High-open-rate promotional campaigns, rich media templates, and targeted WhatsApp outreach.',
        deliverables: ['Verified Template Setup', 'Targeted Broadcasts', 'Click-to-WhatsApp Ads']
      },
      {
        id: 'surveys',
        slug: 'surveys',
        name: 'Surveys',
        category: 'Marketing',
        categoryId: 'marketing',
        iconName: 'ClipboardCheck',
        iconColor: '#0d9488',
        iconBg: '#ccfbf1',
        shortDesc: 'Interactive customer feedback forms, NPS tracking, and market research questionnaires.',
        deliverables: ['Custom Logic Forms', 'NPS & CSAT Scoring', 'Real-Time Insights']
      }
    ]
  },
  {
    id: 'whatsapp-chat-ai',
    name: 'WhatsApp Chat AI',
    shortLabel: 'WhatsApp Chat AI',
    tagline: 'End-to-end WhatsApp Business API automation, AI inbox, flows, commerce, and reminders.',
    accentColor: '#16a34a',
    badgeBg: '#f0fdf4',
    badgeBorder: '#bbf7d0',
    iconName: 'MessageCircle',
    services: [
      {
        id: 'whatsapp-ai-inbox',
        slug: 'whatsapp-ai-inbox',
        name: 'WhatsApp AI Inbox',
        category: 'WhatsApp Chat AI',
        categoryId: 'whatsapp-chat-ai',
        iconName: 'Inbox',
        iconColor: '#16a34a',
        iconBg: '#dcfce7',
        shortDesc: 'Shared team inbox with AI auto-replies, smart routing, and 24/7 customer query resolution.',
        deliverables: ['Multi-Agent Team Inbox', 'AI Auto-Responder', 'Conversation Tagging']
      },
      {
        id: 'whatsapp-marketing-broadcasts',
        slug: 'whatsapp-marketing-broadcasts',
        name: 'WhatsApp Marketing & Broadcasts',
        category: 'WhatsApp Chat AI',
        categoryId: 'whatsapp-chat-ai',
        iconName: 'Send',
        iconColor: '#0284c7',
        iconBg: '#e0f2fe',
        shortDesc: 'Scale personalized broadcast campaigns with interactive CTA buttons and delivery analytics.',
        deliverables: ['Bulk Broadcast Engine', 'Interactive Buttons', 'Read & Reply Metrics']
      },
      {
        id: 'whatsapp-flow-builder',
        slug: 'whatsapp-flow-builder',
        name: 'WhatsApp Flow Builder',
        category: 'WhatsApp Chat AI',
        categoryId: 'whatsapp-chat-ai',
        iconName: 'GitBranch',
        iconColor: '#7c3aed',
        iconBg: '#f3e8ff',
        shortDesc: 'Drag-and-drop conversational flows and native WhatsApp forms for lead capture and support.',
        deliverables: ['Visual Flow Designer', 'Native WhatsApp Forms', 'Conditional Branching']
      },
      {
        id: 'whatsapp-commerce',
        slug: 'whatsapp-commerce',
        name: 'WhatsApp Commerce',
        category: 'WhatsApp Chat AI',
        categoryId: 'whatsapp-chat-ai',
        iconName: 'ShoppingCart',
        iconColor: '#059669',
        iconBg: '#d1fae5',
        shortDesc: 'In-chat product catalogs, cart building, and instant payment links directly inside WhatsApp.',
        deliverables: ['Meta Catalog Sync', 'In-Chat Shopping Cart', 'Instant Payment Links']
      },
      {
        id: 'whatsapp-booking-reminders',
        slug: 'whatsapp-booking-reminders',
        name: 'WhatsApp Booking & Reminders',
        category: 'WhatsApp Chat AI',
        categoryId: 'whatsapp-chat-ai',
        iconName: 'Calendar',
        iconColor: '#ea580c',
        iconBg: '#ffedd5',
        shortDesc: 'Automated appointment scheduling, confirmation alerts, and no-show reduction reminders.',
        deliverables: ['Automated Slot Booking', '24h / 1h Reminders', 'Reschedule Workflows']
      },
      {
        id: 'whatsapp-integrations-settings',
        slug: 'whatsapp-integrations-settings',
        name: 'WhatsApp Integrations & Settings',
        category: 'WhatsApp Chat AI',
        categoryId: 'whatsapp-chat-ai',
        iconName: 'Settings',
        iconColor: '#475569',
        iconBg: '#f1f5f9',
        shortDesc: 'Official Meta Cloud API onboarding, webhook sync, CRM connectors, and green-tick readiness.',
        deliverables: ['Meta Cloud API Setup', 'CRM & ERP Webhooks', 'Business Verification']
      }
    ]
  }
];

export const ALL_PROJECT_SERVICES = PROJECT_CATEGORIES.flatMap((cat) => cat.services);

export const PROJECT_REQUEST_STATUSES = [
  'New',
  'Under Review',
  'Contacted',
  'Requirements Pending',
  'Proposal in Progress',
  'Proposal Sent',
  'Approved',
  'In Progress',
  'Completed',
  'Rejected',
  'Archived'
];

export const CONSULTATION_REQUEST_STATUSES = [
  'New',
  'Contact Pending',
  'Contacted',
  'Appointment Requested',
  'Appointment Confirmed',
  'Completed',
  'Cancelled'
];

export const BUDGET_RANGES_INR = [
  'Under ₹80,000',
  '₹80,000 – ₹2,50,000',
  '₹2,50,000 – ₹8,00,000',
  '₹8,00,000 – ₹20,00,000',
  '₹20,00,000+ (Enterprise)',
  'Need Estimate / To Be Discussed'
];

export const BUDGET_RANGES_USD = [
  'Under $1,000',
  '$1,000 – $3,000',
  '$3,000 – $10,000',
  '$10,000 – $25,000',
  '$25,000+ (Enterprise)',
  'Need Estimate / To Be Discussed'
];

export function getBudgetRanges(isIndia = true) {
  return isIndia ? BUDGET_RANGES_INR : BUDGET_RANGES_USD;
}

export const BUDGET_RANGES = BUDGET_RANGES_INR;
export const PROJECT_BUDGET_RANGES = BUDGET_RANGES_INR;

export const COMPANY_SIZES = [
  '1–10 Employees',
  '11–50 Employees',
  '51–200 Employees',
  '201–500 Employees',
  '500+ Employees'
];
export const PROJECT_COMPANY_SIZES = COMPANY_SIZES;

export const INDUSTRIES_LIST = [
  'Technology & SaaS',
  'Retail & eCommerce',
  'Manufacturing & Supply Chain',
  'Healthcare & Clinics',
  'Banking, Finance & FinTech',
  'Real Estate & Construction',
  'Education & EdTech',
  'Hospitality & Travel',
  'Professional Services & Agency',
  'Other'
];
export const PROJECT_INDUSTRIES = INDUSTRIES_LIST;

export const CONTACT_METHODS = [
  'Phone Call',
  'Video Call (Google Meet / Zoom)',
  'WhatsApp Call / Chat',
  'Email'
];
export const CONSULTATION_CONTACT_METHODS = CONTACT_METHODS;

export const DEFAULT_CONSULTATION_SLOTS = [
  '10:00 AM – 10:30 AM IST',
  '11:00 AM – 11:30 AM IST',
  '12:00 PM – 12:30 PM IST',
  '02:30 PM – 03:00 PM IST',
  '04:00 PM – 04:30 PM IST',
  '05:30 PM – 06:00 PM IST'
];
export const CONSULTATION_TIME_SLOTS = DEFAULT_CONSULTATION_SLOTS;

const STORAGE_KEY = 'oxoo_selected_project_services';

export function getSelectedProjectServices() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveSelectedProjectServices(serviceNamesOrSlugs) {
  try {
    const list = Array.isArray(serviceNamesOrSlugs) ? serviceNamesOrSlugs : [];
    const normalized = Array.from(
      new Set(
        list
          .map((item) => {
            const match = ALL_PROJECT_SERVICES.find(
              (s) =>
                s.id === item ||
                s.slug === item ||
                s.name.toLowerCase() === String(item || '').trim().toLowerCase()
            );
            return match ? match.name : String(item || '').trim();
          })
          .filter(Boolean)
      )
    );
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event('oxoo_project_services_change'));
    return normalized;
  } catch (e) {
    return [];
  }
}

export function deriveCategoriesFromServices(serviceNames = []) {
  const catSet = new Set();
  serviceNames.forEach((name) => {
    const found = ALL_PROJECT_SERVICES.find(
      (s) => s.name.toLowerCase() === String(name).trim().toLowerCase() || s.slug === name
    );
    if (found) catSet.add(found.category);
  });
  return Array.from(catSet);
}
