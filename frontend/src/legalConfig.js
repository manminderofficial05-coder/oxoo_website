// ============================================================================
// Central Configurable Legal, Contact, Security & Certification Metadata
// ============================================================================
// Note: All company-specific legal entity, registered address, verified email,
// and certification fields are configurable via environment variables or this
// central configuration file. No unverified certifications or fabricated legal
// details are claimed.

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const LEGAL_TRUST_CONFIG = {
  websiteUrl: env.VITE_PUBLIC_WEBSITE_URL || 'https://oxoo.ai',
  effectiveDate: env.VITE_LEGAL_EFFECTIVE_DATE || 'October 29, 2026',
  lastUpdated: env.VITE_LEGAL_LAST_UPDATED || 'October 29, 2026',

  // Configurable Legal & Contact Details (preserve placeholders until formally verified)
  legalEntity: env.VITE_LEGAL_ENTITY_NAME || '[Insert registered company name]',
  registeredAddress: env.VITE_REGISTERED_ADDRESS || '[Insert registered business address]',
  privacyEmail: env.VITE_PRIVACY_EMAIL || '[Insert verified privacy email]',
  businessEmail: env.VITE_BUSINESS_EMAIL || '[Insert verified business email]',
  securityEmail: env.VITE_SECURITY_EMAIL || '[Insert verified security email]',

  // ISO/IEC 27001 Certification Configuration
  // IMPORTANT: Do not set isCertified to true unless a valid ISO/IEC 27001
  // certificate covering the relevant legal entity and scope has been issued.
  certification: {
    isCertified: env.VITE_ISO27001_CERTIFIED === 'true',
    statusSummary:
      env.VITE_ISO27001_STATUS ||
      '[Insert verified current status — e.g., Active ISMS & ISO/IEC 27001 Readiness Programme; Not Currently Certified]',
    footerLinkLabel:
      env.VITE_ISO27001_CERTIFIED === 'true'
        ? 'ISO 27001 Certified'
        : env.VITE_COMPLIANCE_FOOTER_LABEL || 'Security & Compliance',
    certificationBody: env.VITE_ISO27001_BODY || null,
    certificateNumber: env.VITE_ISO27001_CERT_NUMBER || null,
    coveredLegalEntity: env.VITE_ISO27001_COVERED_ENTITY || null,
    ismsScope: env.VITE_ISO27001_SCOPE || null,
    issueDate: env.VITE_ISO27001_ISSUE_DATE || null,
    expiryDate: env.VITE_ISO27001_EXPIRY_DATE || null,
    verificationUrl: env.VITE_ISO27001_VERIFICATION_URL || null,
  },
};

export const LEGAL_NAV_TABS = [
  {
    key: 'privacy-policy',
    label: 'Privacy Policy',
    to: '/privacy-policy',
    shortDesc: 'How we collect, use, store & protect personal data',
  },
  {
    key: 'terms',
    label: 'Terms of Service',
    to: '/terms',
    shortDesc: 'Rules, subscriptions, payments & responsibilities',
  },
  {
    key: 'security',
    label: 'Security',
    to: '/security',
    shortDesc: 'Access control, tenant isolation & incident response',
  },
  {
    key: 'compliance',
    label: 'Security & Compliance',
    to: '/compliance',
    shortDesc: 'Information security governance & ISO 27001 status',
  },
];

