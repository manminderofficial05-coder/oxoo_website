import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileText,
  Sparkles,
  Building2,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Handshake,
  Server,
  Calendar,
  List,
  ChevronRight,
  Mail,
  Globe,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Header, Footer } from './components';
import { LEGAL_TRUST_CONFIG, LEGAL_NAV_TABS } from './legalConfig';

// ============================================================================
// Complete Structured Content for the 4 Legal & Trust Pages
// ============================================================================
function buildLegalDocuments(cfg) {
  const cert = cfg.certification || {};

  return {
    'privacy-policy': {
      key: 'privacy-policy',
      route: '/privacy-policy',
      eyebrow: 'PRIVACY & DATA PROTECTION',
      title: 'PrimePro.ai Privacy Policy',
      subtitle:
        'How PrimePro.ai collects, uses, stores, shares and protects personal information across our website and connected business applications.',
      effectiveDate: cfg.effectiveDate,
      lastUpdated: cfg.lastUpdated,
      icon: Lock,
      sections: [
        {
          id: 'section-1',
          number: '1',
          heading: '1. Introduction',
          paragraphs: [
            'PrimePro.ai provides connected business software, including HRMS, Finance, Accounting, CRM, Sales, Inventory, Supply Chain, AI-powered automation and Website Builder services.',
            'This Privacy Policy explains how PrimePro.ai collects, uses, stores, shares and protects personal information when you visit our website, register an account, purchase a subscription or use our services.',
          ],
          metaCard: [
            { label: 'Website', value: cfg.websiteUrl, isLink: true, href: cfg.websiteUrl },
            { label: 'Legal entity', value: cfg.legalEntity },
            { label: 'Privacy email', value: cfg.privacyEmail },
            { label: 'Registered address', value: cfg.registeredAddress },
          ],
        },
        {
          id: 'section-2',
          number: '2',
          heading: '2. Information We Collect',
          paragraphs: ['Depending on your use of our services, we may collect:'],
          bullets: [
            {
              lead: 'Account information:',
              text: 'Name, email address, phone number, company name and login information.',
            },
            {
              lead: 'Organisation information:',
              text: 'Departments, teams, business records, user roles and account settings.',
            },
            {
              lead: 'HRMS information:',
              text: 'Employee profiles, attendance, leave, employment records and payroll information where enabled.',
            },
            {
              lead: 'Finance and CRM information:',
              text: 'Invoices, transactions, contacts, sales records, supplier details and customer interactions.',
            },
            {
              lead: 'Technical information:',
              text: 'IP address, approximate country, browser type, device information, timestamps and security logs.',
            },
            {
              lead: 'Payment information:',
              text: 'Subscription plan, amount, currency, transaction references and billing details.',
            },
            {
              lead: 'AI information:',
              text: 'Prompts, instructions, documents and outputs needed to provide AI-powered functionality.',
            },
            {
              lead: 'Support information:',
              text: 'Demo requests, enquiries, correspondence, support tickets and attachments.',
            },
          ],
          afterParagraphs: [
            'Customers are responsible for ensuring they have the legal authority to submit personal information to PrimePro.ai.',
          ],
        },
        {
          id: 'section-3',
          number: '3',
          heading: '3. How We Use Information',
          paragraphs: ['We may use information to:'],
          bullets: [
            { text: 'Provide and maintain our business applications.' },
            { text: 'Create accounts and authenticate authorised users.' },
            { text: 'Process subscriptions, invoices, payments and refunds.' },
            { text: 'Configure products, permissions and integrations.' },
            { text: 'Provide customer support and demonstrations.' },
            { text: 'Detect fraud, investigate security incidents and troubleshoot errors.' },
            { text: 'Improve website performance and product functionality.' },
            { text: 'Send essential service notifications and permitted marketing communications.' },
            { text: 'Meet legal obligations and protect our legitimate rights.' },
          ],
          afterParagraphs: [
            'We will handle customer business information according to applicable agreements, documented instructions and relevant legal requirements.',
          ],
        },
        {
          id: 'section-4',
          number: '4',
          heading: '4. Legal Basis for Processing',
          paragraphs: [
            'Where required by law, we rely on applicable legal grounds, which may include contractual necessity, legal obligations, legitimate interests and consent.',
            'Where processing relies on consent, you may withdraw it as permitted by applicable law.',
          ],
        },
        {
          id: 'section-5',
          number: '5',
          heading: '5. Customer Data and Responsibilities',
          paragraphs: [
            'Customers retain their rights in the business information they provide, subject to applicable law.',
            'Customers must maintain appropriate access permissions, provide required privacy notices, obtain necessary authorisations and ensure that information is collected and processed lawfully.',
            'Where PrimePro.ai processes information on behalf of a customer organisation, the relevant customer agreement and data-processing terms apply.',
          ],
        },
        {
          id: 'section-6',
          number: '6',
          heading: '6. Sharing Information',
          paragraphs: [
            'We may share information with service providers that support hosting, databases, payment processing, email delivery, analytics, security, customer support and AI functionality.',
            'We may also disclose information when authorised by a customer, required by law, necessary to protect security, or involved in a legitimate business transfer.',
            'We do not intend to sell personal information as a standalone commercial product.',
          ],
        },
        {
          id: 'section-7',
          number: '7',
          heading: '7. International Data Transfers',
          paragraphs: [
            'PrimePro.ai may serve customers in different countries. Information may be processed in countries other than the country where it was collected, depending on our hosting infrastructure and service providers.',
            'Where required, appropriate safeguards will be used for international transfers. Specific data-residency commitments apply only when expressly agreed.',
          ],
        },
        {
          id: 'section-8',
          number: '8',
          heading: '8. Data Retention and Deletion',
          paragraphs: [
            'We retain information for as long as reasonably necessary to provide services, maintain security, fulfil contractual obligations and comply with applicable law.',
            'Retention periods vary by information type. Account records, financial records, security logs, support records and customer business data may have different retention requirements.',
            'After account termination, deletion and backup handling will follow the applicable service terms, technical capabilities and legal requirements.',
          ],
        },
        {
          id: 'section-9',
          number: '9',
          heading: '9. Security',
          paragraphs: [
            'We use or plan to implement safeguards appropriate to the services provided, including access controls, authentication, secure configuration, encryption where implemented, monitoring, backup procedures and security incident handling.',
            'No system can guarantee absolute security. We will describe security controls and certifications accurately and will not claim unverified certifications.',
          ],
          internalLinks: [
            { label: 'Review PrimePro.ai Security Practices', to: '/security' },
            { label: 'View Security & Compliance Overview', to: '/compliance' },
          ],
        },
        {
          id: 'section-10',
          number: '10',
          heading: '10. Cookies and Country Detection',
          paragraphs: [
            'PrimePro.ai may use cookies, local storage and similar technologies for essential functionality, preferences, security and analytics.',
            'We may use IP-based country detection to select a default country, language or regional pricing display. This identifies an approximate country or region, not precise GPS location.',
            'Visitors may be able to change their region manually. Displayed regional prices do not guarantee that every currency or payment method is supported at checkout.',
          ],
        },
        {
          id: 'section-11',
          number: '11',
          heading: '11. AI-Powered Features',
          paragraphs: [
            'AI features may process user inputs, business documents and generated outputs to perform requested tasks.',
            'AI outputs can be inaccurate and should be reviewed before being used for significant business decisions. Customers should apply appropriate safeguards when handling sensitive personal information.',
            'Third-party AI services may process information according to their applicable terms and configuration.',
          ],
        },
        {
          id: 'section-12',
          number: '12',
          heading: '12. Your Privacy Rights',
          paragraphs: [
            'Depending on applicable law, you may have rights to request access, correction, deletion, restriction, portability or objection to certain processing activities.',
            'You may also withdraw consent where applicable and opt out of marketing communications.',
            'Contact our privacy team using the details provided above. We may verify your identity before responding. Where information is controlled by a customer organisation, we may direct your request to that organisation or assist it as required.',
          ],
        },
        {
          id: 'section-13',
          number: '13',
          heading: "13. Children's Privacy",
          paragraphs: [
            'PrimePro.ai is designed primarily for business use and is not intended as a consumer service directed at children. Any information involving children will be handled according to applicable legal requirements.',
          ],
        },
        {
          id: 'section-14',
          number: '14',
          heading: '14. Security Incidents',
          paragraphs: [
            'We will investigate relevant security incidents and provide notifications to affected parties or authorities where required by law or applicable contractual commitments.',
          ],
        },
        {
          id: 'section-15',
          number: '15',
          heading: '15. Third-Party Services',
          paragraphs: [
            'External websites, integrations and payment providers may have their own privacy policies and terms. Their independent processing practices are governed by the applicable arrangements.',
          ],
        },
        {
          id: 'section-16',
          number: '16',
          heading: '16. Policy Changes',
          paragraphs: [
            'We may update this policy to reflect changes in our services, technology or legal obligations. We will update the revision date and provide additional notice where required.',
          ],
        },
        {
          id: 'section-17',
          number: '17',
          heading: '17. Contact Us',
          paragraphs: ['PrimePro.ai Privacy Team'],
          metaCard: [
            { label: 'Website', value: cfg.websiteUrl, isLink: true, href: cfg.websiteUrl },
            { label: 'Email', value: cfg.privacyEmail },
            { label: 'Legal entity', value: cfg.legalEntity },
            { label: 'Address', value: cfg.registeredAddress },
          ],
          reviewNote:
            "This policy must be reviewed against PrimePro.ai's actual data practices and applicable law before publication.",
        },
      ],
    },

    terms: {
      key: 'terms',
      route: '/terms',
      eyebrow: 'TERMS & SERVICE CONDITIONS',
      title: 'PrimePro.ai Terms of Service',
      subtitle:
        'The rules governing access to and use of PrimePro.ai, subscriptions, payments, cancellations and customer responsibilities.',
      effectiveDate: cfg.effectiveDate,
      lastUpdated: cfg.lastUpdated,
      icon: FileText,
      sections: [
        {
          id: 'section-1',
          number: '1',
          heading: '1. Agreement to These Terms',
          paragraphs: [
            'These Terms of Service govern your access to and use of PrimePro.ai, including our website, software applications, AI features, subscriptions, integrations and related services.',
            'By accessing or using our services, you agree to these Terms. If you use PrimePro.ai on behalf of a company or organisation, you represent that you are authorised to accept these Terms on its behalf.',
          ],
          metaCard: [
            { label: 'Service provider', value: cfg.legalEntity },
            { label: 'Website', value: cfg.websiteUrl, isLink: true, href: cfg.websiteUrl },
            { label: 'Contact', value: cfg.businessEmail },
          ],
        },
        {
          id: 'section-2',
          number: '2',
          heading: '2. Our Services',
          paragraphs: ['PrimePro.ai provides business software and related services that may include:'],
          bullets: [
            { text: 'Human Resource Management and Payroll.' },
            { text: 'Finance and Accounting.' },
            { text: 'Customer Relationship Management.' },
            { text: 'Sales and Business Operations.' },
            { text: 'Inventory and Supply Chain Management.' },
            { text: 'AI-powered assistants and automation.' },
            { text: 'Website Builder and related integrations.' },
            { text: 'Administration, subscription management and reporting.' },
          ],
          afterParagraphs: [
            'Available features depend on your selected plan, configuration, permissions and any applicable service agreement.',
            'We may update or improve our services over time, subject to contractual commitments and applicable law.',
          ],
        },
        {
          id: 'section-3',
          number: '3',
          heading: '3. Accounts and Security',
          paragraphs: [
            'You must provide accurate registration information and maintain the confidentiality of your login credentials.',
            'You are responsible for activities performed through your account, subject to applicable law and our security obligations.',
            'You must notify us promptly if you suspect unauthorised access. We may suspend access where reasonably necessary to investigate security risks, prevent abuse or comply with legal obligations.',
            'Organisation administrators are responsible for assigning appropriate roles and permissions to their users.',
          ],
        },
        {
          id: 'section-4',
          number: '4',
          heading: '4. Subscriptions and Pricing',
          paragraphs: [
            'Some services require a paid subscription.',
            'Before purchasing, the applicable pricing page or order form will identify the plan, billing interval, applicable price and available features.',
            'Prices may differ by country or region. Any regional pricing displayed on the website is subject to the configured plan, applicable taxes and payment-provider capabilities.',
            'A change to a displayed currency does not guarantee that the same currency is supported for payment or settlement.',
          ],
          internalLinks: [{ label: 'View Pricing Plans', to: '/pricing' }],
        },
        {
          id: 'section-5',
          number: '5',
          heading: '5. Payments and Taxes',
          paragraphs: [
            'Payments are processed using the payment methods made available at checkout.',
            'You authorise the applicable payment provider to process the transaction according to the selected payment method and its terms.',
            'You are responsible for applicable taxes unless otherwise stated or required by law.',
            'We will not treat a payment as successful merely because a browser displays a success message. Subscription activation is subject to our server-side payment verification and applicable processing procedures.',
            'Payment disputes, refunds and cancellations are handled according to the applicable purchase terms and our Refund and Cancellation Policy.',
          ],
        },
        {
          id: 'section-6',
          number: '6',
          heading: '6. Subscription Renewals and Cancellation',
          paragraphs: [
            'Where recurring subscriptions are offered, the billing frequency, renewal terms and cancellation process will be disclosed before purchase.',
            'You may cancel according to the cancellation options available for your plan. Unless the applicable terms state otherwise, cancellation stops future renewals but does not automatically entitle you to a refund for a previously paid period.',
            'Any prorated refunds, trial conversions, renewal reminders and cancellation deadlines will follow the specific plan terms and applicable law.',
          ],
        },
        {
          id: 'section-7',
          number: '7',
          heading: '7. Free Trials and Demonstrations',
          paragraphs: [
            'We may offer product demonstrations, trial access or limited free features.',
            'Trial availability, duration, eligibility and included functionality will be communicated when the offer is presented.',
            'We may restrict or discontinue trial access where permitted by the applicable offer terms and law.',
          ],
          internalLinks: [{ label: 'Request a Live Demo', to: '/request-demo' }],
        },
        {
          id: 'section-8',
          number: '8',
          heading: '8. Customer Data',
          paragraphs: [
            'You retain your rights in the business information you submit to PrimePro.ai.',
            'You grant us the limited rights necessary to host, process, transmit and display that information to provide the services you request.',
            'You are responsible for ensuring that you have the necessary rights and permissions to upload and process the information.',
            "You must not use PrimePro.ai to unlawfully collect, disclose or process another person's information.",
            'Data exports, deletion, backup and retention will be governed by the applicable service plan, data-processing terms and Privacy Policy.',
          ],
        },
        {
          id: 'section-9',
          number: '9',
          heading: '9. Acceptable Use',
          paragraphs: ['You must not:'],
          bullets: [
            { text: 'Use PrimePro.ai for unlawful, fraudulent or deceptive activities.' },
            { text: "Attempt to access another organisation's accounts or information without authorisation." },
            { text: 'Bypass authentication, access controls or subscription entitlements.' },
            { text: 'Upload malicious code or interfere with service operation.' },
            { text: 'Abuse APIs, overload infrastructure or circumvent reasonable usage limits.' },
            { text: 'Reverse engineer or misuse the services except where applicable law permits.' },
            { text: 'Use the services to infringe intellectual property or privacy rights.' },
            { text: 'Misuse AI features to generate unlawful content or facilitate harmful activity.' },
          ],
          afterParagraphs: [
            'We may investigate suspected violations and take proportionate action, including restricting access where permitted by law.',
          ],
        },
        {
          id: 'section-10',
          number: '10',
          heading: '10. Intellectual Property',
          paragraphs: [
            'PrimePro.ai and its applicable software, branding, design, documentation and original materials are protected by intellectual property laws.',
            'Subject to these Terms and your subscription, we grant you a limited, non-exclusive, non-transferable right to use the services for their intended purpose.',
            'You retain ownership of your content, subject to the rights necessary for us to provide the services.',
            'Third-party software and integrations may be governed by separate licences and terms.',
          ],
        },
        {
          id: 'section-11',
          number: '11',
          heading: '11. AI Features',
          paragraphs: [
            'AI-generated outputs may be inaccurate, incomplete or unsuitable for a particular purpose.',
            'You are responsible for reviewing AI outputs before relying on them, particularly for employment, financial, legal, compliance or other high-impact decisions.',
            'You must not treat AI-generated information as guaranteed professional advice or a substitute for appropriate human review.',
            'The availability and limitations of individual AI features may vary by plan and provider.',
          ],
        },
        {
          id: 'section-12',
          number: '12',
          heading: '12. Third-Party Services',
          paragraphs: [
            'PrimePro.ai may integrate with third-party products, payment providers, AI services and external websites.',
            'Your use of those services may be subject to separate terms. We do not control independent third-party services and cannot guarantee their uninterrupted availability.',
          ],
        },
        {
          id: 'section-13',
          number: '13',
          heading: '13. Service Availability and Maintenance',
          paragraphs: [
            'We aim to provide reliable services but do not guarantee uninterrupted or error-free operation unless an applicable written service-level agreement expressly provides otherwise.',
            'Maintenance, network failures, third-party outages, security incidents and circumstances beyond our reasonable control may affect availability.',
            'Any uptime percentage or service-level commitment must be stated in the applicable agreement.',
          ],
        },
        {
          id: 'section-14',
          number: '14',
          heading: '14. Suspension and Termination',
          paragraphs: [
            'You may stop using the services or cancel your subscription according to the applicable plan terms.',
            'We may restrict or suspend access where reasonably necessary for security, non-payment, unlawful activity, material breach or legal compliance.',
            'Where appropriate and legally permitted, we will provide notice and an opportunity to resolve the issue.',
            'On termination, access to services and customer data will be handled according to the applicable service agreement, Privacy Policy and retention requirements.',
          ],
        },
        {
          id: 'section-15',
          number: '15',
          heading: '15. Warranties and Liability',
          paragraphs: [
            'To the extent permitted by law, services are provided according to their documented functionality and applicable contractual commitments.',
            'Nothing in these Terms excludes any consumer or other rights that cannot legally be excluded.',
            'Any limitation of liability, exclusions or indemnities must be interpreted subject to applicable law and the relevant customer agreement.',
          ],
        },
        {
          id: 'section-16',
          number: '16',
          heading: '16. Privacy',
          paragraphs: [
            'Our Privacy Policy explains how personal information is handled. By using PrimePro.ai, you acknowledge that the applicable privacy practices and disclosures apply to your use of the services.',
          ],
          internalLinks: [{ label: 'Read the PrimePro.ai Privacy Policy', to: '/privacy-policy' }],
        },
        {
          id: 'section-17',
          number: '17',
          heading: '17. Changes to These Terms',
          paragraphs: [
            'We may revise these Terms to reflect changes to our services, business or legal obligations. Material changes will be communicated where required by law or contract.',
            'The updated version will display its revision date.',
          ],
        },
        {
          id: 'section-18',
          number: '18',
          heading: '18. Governing Law and Disputes',
          paragraphs: [
            'The governing law, jurisdiction and dispute-resolution process must be specified in the final version based on the registered legal entity and applicable customer arrangements.',
            'Nothing in this section removes rights that cannot legally be waived.',
          ],
        },
        {
          id: 'section-19',
          number: '19',
          heading: '19. Contact',
          paragraphs: ['For questions about these Terms, contact:', 'PrimePro.ai Legal and Support Team'],
          metaCard: [
            { label: 'Email', value: cfg.businessEmail },
            { label: 'Website', value: cfg.websiteUrl, isLink: true, href: cfg.websiteUrl },
            { label: 'Legal entity', value: cfg.legalEntity },
            { label: 'Address', value: cfg.registeredAddress },
          ],
          reviewNote:
            'These Terms require legal review and completion of the company-specific fields before publication.',
        },
      ],
    },

    security: {
      key: 'security',
      route: '/security',
      eyebrow: 'PLATFORM & DATA SECURITY',
      title: 'PrimePro.ai Security',
      subtitle: 'Protecting the systems, accounts and business information that power your organisation.',
      introParagraphs: [
        'PrimePro.ai is designed to bring HRMS, Finance, CRM, Sales, Inventory, Supply Chain and AI-powered business tools into one connected ecosystem. Security is an essential part of operating that ecosystem.',
        'Our security approach focuses on protecting customer information, restricting access to authorised users, reducing risk and responding responsibly to security incidents.',
      ],
      effectiveDate: cfg.effectiveDate,
      lastUpdated: cfg.lastUpdated,
      icon: ShieldCheck,
      sections: [
        {
          id: 'section-1',
          number: '1',
          heading: '1. Identity and Access Management',
          paragraphs: [
            'Security controls should ensure that users can access only the accounts, organisations and features they are authorised to use.',
            'Our intended security approach includes:',
          ],
          bullets: [
            { text: 'Authenticated user sessions.' },
            { text: 'Role-based access control.' },
            { text: 'Administrative permissions restricted to authorised personnel.' },
            { text: 'Secure account recovery and credential management.' },
            { text: 'Session expiry and revocation where implemented.' },
            { text: 'Server-side verification of user roles and permissions.' },
          ],
        },
        {
          id: 'section-2',
          number: '2',
          heading: '2. Organisation and Tenant Isolation',
          paragraphs: [
            'PrimePro.ai is designed for business customers that may maintain separate organisations and teams.',
            "Tenant isolation is a critical requirement. Requests must be authorised against the authenticated user's verified organisation membership. A customer-supplied company ID, email address or request header must not independently grant access to another organisation's data.",
            'Access restrictions should apply consistently to profiles, employee records, invoices, reports, subscriptions, attachments, APIs and administrative functions.',
          ],
        },
        {
          id: 'section-3',
          number: '3',
          heading: '3. Data Protection',
          paragraphs: ['We aim to apply appropriate safeguards to customer information, including:'],
          bullets: [
            { text: 'Encryption in transit where configured.' },
            { text: 'Appropriate protection for stored information.' },
            { text: 'Restricted access to production systems.' },
            { text: 'Secure handling of application secrets and credentials.' },
            { text: 'Data minimisation and controlled information sharing.' },
            { text: 'Appropriate backup and recovery arrangements.' },
          ],
          afterParagraphs: [
            'Specific encryption methods, backup frequencies and retention periods should be published only after they have been verified in the production environment.',
          ],
        },
        {
          id: 'section-4',
          number: '4',
          heading: '4. Payment Security',
          paragraphs: [
            'Payment processing must use supported payment-provider integrations.',
            'Our payment security requirements include:',
          ],
          bullets: [
            { text: 'Server-side payment verification.' },
            { text: 'Verification of payment signatures where required by the provider.' },
            { text: 'Server-side calculation of subscription prices.' },
            { text: 'Validation of payment currency and amount.' },
            { text: 'Protection against duplicate payment processing.' },
            { text: 'Appropriate controls for refunds and subscription status changes.' },
            { text: 'Restricted access to payment credentials and API secrets.' },
          ],
          afterParagraphs: [
            'A browser redirect or client-side success message must not independently activate a paid subscription.',
          ],
        },
        {
          id: 'section-5',
          number: '5',
          heading: '5. Application Security',
          paragraphs: [
            'We aim to reduce application risk through secure development practices, dependency updates, input validation, access-control testing and review of security-sensitive code.',
            'Security testing should include authentication failures, unauthorised administrative access, cross-tenant access attempts, payment manipulation and access to private attachments.',
            'Security issues should be prioritised according to their potential impact.',
          ],
        },
        {
          id: 'section-6',
          number: '6',
          heading: '6. Monitoring and Incident Response',
          paragraphs: [
            'Security-relevant events should be logged and reviewed according to the implemented monitoring arrangements.',
            'If a potential incident is identified, our response process should include:',
          ],
          orderedList: [
            'Assessing and containing the issue.',
            'Investigating the potential impact.',
            'Taking corrective action.',
            'Preserving relevant evidence where appropriate.',
            'Notifying affected customers or authorities where required.',
            ' Reviewing lessons learned and preventive measures.',
          ],
          afterParagraphs: [
            'Incident response and notification timelines will follow applicable law and contractual commitments.',
          ],
        },
        {
          id: 'section-7',
          number: '7',
          heading: '7. Backups and Recovery',
          paragraphs: [
            'Customer data should be protected through appropriate backup and recovery arrangements based on service requirements.',
            'Backup frequency, recovery objectives and retention periods depend on the actual infrastructure and service agreement. Do not assume that a backup exists or that a particular recovery time is guaranteed unless it has been verified.',
          ],
        },
        {
          id: 'section-8',
          number: '8',
          heading: '8. Third-Party Providers',
          paragraphs: [
            'PrimePro.ai may rely on cloud hosting, databases, payment providers, email services and AI services.',
            'These providers have their own security controls and contractual terms. The providers used for each production service should be documented, and their relevant security assurances should be reviewed.',
          ],
        },
        {
          id: 'section-9',
          number: '9',
          heading: '9. Responsible Security Reporting',
          paragraphs: [
            'If you believe you have discovered a security vulnerability in PrimePro.ai, please report it privately.',
          ],
          metaCard: [{ label: 'Security contact', value: cfg.securityEmail }],
          secondParagraphs: ['Please include:'],
          bullets: [
            { text: 'A clear description of the suspected issue.' },
            { text: 'The affected page or endpoint.' },
            { text: "Reproduction steps that do not expose other users' data." },
            { text: 'The potential impact.' },
            { text: 'Any relevant screenshots or logs with sensitive information removed.' },
          ],
          afterParagraphs: [
            "Do not access, modify, download or disclose other customers' data. Do not disrupt services or conduct destructive testing.",
            'We will review reports and respond according to our available processes. Do not assume a bug bounty or guaranteed response time unless a formal programme is published.',
          ],
        },
        {
          id: 'section-10',
          number: '10',
          heading: '10. Security Certifications',
          paragraphs: [
            'We will identify certifications and independent assessments accurately. Certification claims must be supported by valid documentation and must reflect the applicable organisation and scope.',
            'Security practices described on this page should be confirmed against the controls actually deployed.',
            `Security is an ongoing responsibility. For security enquiries, contact ${cfg.securityEmail}.`,
          ],
          internalLinks: [
            { label: 'View Compliance & ISO/IEC 27001 Status', to: '/compliance' },
            { label: 'Read Privacy Policy', to: '/privacy-policy' },
          ],
        },
      ],
    },

    compliance: {
      key: 'compliance',
      route: '/compliance',
      eyebrow: 'SECURITY & COMPLIANCE GOVERNANCE',
      title: 'PrimePro.ai — Compliance and Information Security',
      subtitle: 'Building trust through responsible information security practices.',
      introParagraphs: [
        'PrimePro.ai is committed to developing and maintaining appropriate safeguards for the business information processed through our software platform.',
        'Our services may support HRMS, Finance, CRM, Sales, Inventory, Supply Chain, AI-powered automation and other business workflows. Protecting information across these services requires clear access controls, responsible data handling, risk management and continuous improvement.',
      ],
      effectiveDate: cfg.effectiveDate,
      lastUpdated: cfg.lastUpdated,
      icon: Server,
      sections: [
        {
          id: 'section-1',
          number: '1',
          heading: '1. Our Information Security Approach',
          paragraphs: ['Our security programme is intended to address areas such as:'],
          bullets: [
            { text: 'Information security policies and responsibilities.' },
            { text: 'Risk identification and risk treatment.' },
            { text: 'Identity and access management.' },
            { text: 'Protection of customer and employee information.' },
            { text: 'Secure software development.' },
            { text: 'Supplier and third-party risk management.' },
            { text: 'Security incident management.' },
            { text: 'Business continuity and recovery.' },
            { text: 'Staff awareness and security training.' },
            { text: 'Monitoring, review and continuous improvement.' },
          ],
          afterParagraphs: [
            'The specific controls implemented will depend on our operating environment, service scope and assessed risks.',
          ],
        },
        {
          id: 'section-2',
          number: '2',
          heading: '2. ISO/IEC 27001',
          paragraphs: [
            'ISO/IEC 27001 is an international standard for establishing, implementing, maintaining and continually improving an Information Security Management System (ISMS).',
            'PrimePro.ai recognises the importance of structured information security governance and risk management.',
          ],
          metaCard: [
            { label: 'Certification status', value: cert.statusSummary },
            ...(cert.isCertified && cert.certificationBody
              ? [
                  { label: 'Certification body', value: cert.certificationBody },
                  { label: 'Certificate number', value: cert.certificateNumber || '—' },
                  { label: 'Covered legal entity', value: cert.coveredLegalEntity || cfg.legalEntity },
                  { label: 'ISMS scope', value: cert.ismsScope || '—' },
                  { label: 'Issue date', value: cert.issueDate || '—' },
                  { label: 'Expiry date', value: cert.expiryDate || '—' },
                ]
              : []),
          ],
          afterParagraphs: [
            'If PrimePro.ai has not obtained a valid ISO/IEC 27001 certification, this page must not describe PrimePro.ai as “ISO 27001 Certified.” It may instead describe verified security practices or an active readiness programme.',
            "If certification is obtained, publish the certification body's name, certificate number, covered legal entity, ISMS scope, issue date, expiry date and certificate verification details as appropriate.",
          ],
        },
        {
          id: 'section-3',
          number: '3',
          heading: '3. Privacy and Data Protection',
          paragraphs: [
            'PrimePro.ai aims to handle personal information according to its Privacy Policy, applicable agreements and relevant data protection obligations.',
            'Depending on the services used, our data protection approach may include:',
          ],
          bullets: [
            { text: 'Access restrictions for personal information.' },
            { text: 'Appropriate handling of employee and customer records.' },
            { text: 'Data retention and deletion procedures.' },
            { text: 'Support for privacy requests where required.' },
            { text: 'Appropriate safeguards for third-party processing.' },
            { text: 'Assessment of international data transfers where applicable.' },
          ],
          afterParagraphs: [
            'Our specific legal obligations depend on the relevant processing activity, customer relationship and jurisdiction.',
          ],
          internalLinks: [{ label: 'Read the PrimePro.ai Privacy Policy', to: '/privacy-policy' }],
        },
        {
          id: 'section-4',
          number: '4',
          heading: '4. Access Control and Tenant Separation',
          paragraphs: [
            'Business customers require clear separation between their organisational data.',
            'Our security requirements include verified authentication, server-side authorisation, organisation-level access restrictions and appropriate controls for administrative functions.',
            'These controls must be tested against the production implementation rather than assumed to exist solely because they are documented.',
          ],
          internalLinks: [{ label: 'View Security Architecture & Controls', to: '/security' }],
        },
        {
          id: 'section-5',
          number: '5',
          heading: '5. Supplier and Infrastructure Management',
          paragraphs: [
            'Cloud infrastructure, databases, payment providers and other external services may form part of the PrimePro.ai environment.',
            'We aim to evaluate relevant supplier security information and document the services that process or store customer data.',
            'The actual hosting locations, provider certifications and contractual safeguards should be verified before being represented as compliance commitments.',
          ],
        },
        {
          id: 'section-6',
          number: '6',
          heading: '6. Risk Management and Continuous Improvement',
          paragraphs: [
            'Information security is an ongoing process. Risk assessments, technical reviews, security testing, incident reviews and corrective actions should be used to identify weaknesses and improve controls.',
            'Where independent audits or certifications are conducted, their results and scope should be described accurately.',
          ],
        },
        {
          id: 'section-7',
          number: '7',
          heading: '7. Customer Responsibilities',
          paragraphs: [
            'Customers should use strong authentication, assign appropriate permissions, protect credentials and ensure that data uploaded to PrimePro.ai is handled lawfully.',
            'Customers should also review their own access settings, integrations and retention requirements.',
          ],
        },
        {
          id: 'section-8',
          number: '8',
          heading: '8. Compliance Enquiries',
          paragraphs: [
            'For questions about our security controls, privacy practices or compliance documentation, contact:',
            'PrimePro.ai Security and Compliance Team',
          ],
          metaCard: [
            { label: 'Security email', value: cfg.securityEmail },
            { label: 'Privacy email', value: cfg.privacyEmail },
            { label: 'Website', value: cfg.websiteUrl, isLink: true, href: cfg.websiteUrl },
            { label: 'Legal entity', value: cfg.legalEntity },
          ],
          afterParagraphs: [
            'Additional information about controls, independent assessments or certifications may be provided where available and appropriate.',
          ],
          reviewNote:
            'Our commitment: to develop, verify and improve security practices in line with the risks and responsibilities associated with our services.',
        },
      ],
    },
  };
}

// ============================================================================
// Company Informational Pages (/about, /careers, /partners)
// ============================================================================
const COMPANY_INFO_PAGES = {
  about: {
    eyebrow: 'ABOUT PrimePro.ai',
    title: 'Your 24/7 Workspace Is Here.',
    subtitle:
      'Headquartered in Bengaluru, India, PrimePro.ai unifies 24 enterprise business applications into a single connected AI-driven operating system.',
    icon: Building2,
    sections: [
      {
        heading: 'Our Mission',
        body: 'Modern businesses often struggle with disconnected point solutions across finance, sales, HR, and supply chain. PrimePro.ai eliminates data silos by delivering an integrated, modular cloud platform backed by professional implementation and ongoing support.',
      },
      {
        heading: 'Unified Architecture',
        body: 'From GST-compliant Accounting and HRMS Payroll to Omnichannel CRM, Inventory Management, AI Automation, and Website Builder, every PrimePro.ai application shares a unified data model, single sign-on, and consistent user experience.',
      },
      {
        heading: 'Engineering & Support in Bengaluru',
        body: 'Our solutions architects, product engineers, and customer success specialists work closely with growing organizations to configure workflows, migrate legacy records, and support day-to-day operations.',
      },
    ],
    ctaLabel: 'Request a Personalized Demo',
    ctaTo: '/request-demo',
  },
  careers: {
    eyebrow: 'CAREERS AT PrimePro.ai',
    title: 'Build the Future of Enterprise Software',
    subtitle:
      'Join our engineering, product design, and enterprise implementation teams in Bengaluru, India.',
    icon: Briefcase,
    sections: [
      {
        heading: 'Why Work With Us',
        body: 'At PrimePro.ai, we build mission-critical software that powers finance, operations, human resources, and AI workflows. We value clean architecture, customer empathy, and high-ownership engineering.',
      },
      {
        heading: 'Open Practice Areas',
        body: 'We actively welcome applications across Full-Stack Engineering (React, Node.js, PostgreSQL), AI & RAG Systems Engineering, Enterprise ERP Implementation Consulting, Product Design, and Customer Success.',
      },
      {
        heading: 'How to Apply',
        body: 'Send your resume, portfolio, or profile to hello@primepro.ai with the role title in the subject line, or reach out through our contact page.',
      },
    ],
    ctaLabel: 'Contact Our Team',
    ctaTo: '/contact',
  },
  partners: {
    eyebrow: 'PrimePro.ai PARTNER PROGRAM',
    title: 'Grow Your Practice as an PrimePro.ai Solution Partner',
    subtitle:
      'Collaborate with PrimePro.ai to deliver unified ERP, CRM, HRMS, and AI transformation for your clients.',
    icon: Handshake,
    sections: [
      {
        heading: 'Implementation & Consulting Partners',
        body: 'Accounting firms, IT system integrators, and digital transformation agencies partner with PrimePro.ai to deploy tailored multi-app workspaces, custom integrations, and industry workflows.',
      },
      {
        heading: 'Partner Benefits',
        body: 'Receive dedicated technical enablement, sandbox demo environments, co-marketing support, priority engineering escalation, and recurring partner revenue share.',
      },
      {
        heading: 'Become a Partner',
        body: 'Connect with our partner alliances team in Bengaluru to discuss onboarding and joint customer opportunities.',
      },
    ],
    ctaLabel: 'Apply for Partnership',
    ctaTo: '/contact',
  },
};

export function InfoPageView({ pageKey }) {
  const location = useLocation();
  const normalizedKey = pageKey === 'privacy' ? 'privacy-policy' : pageKey;
  const legalDocs = useMemo(() => buildLegalDocuments(LEGAL_TRUST_CONFIG), []);
  const legalDoc = legalDocs[normalizedKey];

  const [activeSectionId, setActiveSectionId] = useState(
    legalDoc?.sections?.[0]?.id || 'section-1'
  );
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSectionId(targetId);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (legalDoc?.sections?.[0]?.id) {
      setActiveSectionId(legalDoc.sections[0].id);
    }
    setMobileTocOpen(false);
  }, [normalizedKey, location.pathname, location.hash, legalDoc]);

  // Track active section while scrolling on Legal & Trust pages
  useEffect(() => {
    if (!legalDoc) return undefined;
    const handleScroll = () => {
      const offset = 150;
      let currentId = legalDoc.sections[0]?.id;
      for (const sec of legalDoc.sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            currentId = sec.id;
          }
        }
      }
      if (currentId) setActiveSectionId(currentId);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [legalDoc]);

  const handleJumpToSection = (e, sectionId) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSectionId(sectionId);
      setMobileTocOpen(false);
    }
  };

  // Render Company Page (/about, /careers, /partners) if not one of the 4 legal/trust docs
  if (!legalDoc) {
    const content = COMPANY_INFO_PAGES[normalizedKey] || COMPANY_INFO_PAGES.about;
    const IconComp = content.icon || Sparkles;
    return (
      <div className="info-page-wrapper">
        <Header />
        <main className="inner-page" id="main-content">
          <section className="catalog-hero-header">
            <nav className="breadcrumbs" aria-label="Breadcrumb" style={{ justifyContent: 'center' }}>
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>{content.title}</span>
            </nav>
            <div className="legal-hero-icon-badge" aria-hidden="true">
              <IconComp size={26} />
            </div>
            <h1>{content.title}</h1>
            <p>{content.subtitle}</p>
          </section>

          <section className="section" style={{ maxWidth: '960px', margin: '0 auto', padding: '56px 24px 80px' }}>
            <div style={{ display: 'grid', gap: '24px' }}>
              {content.sections.map((sec) => (
                <article key={sec.heading} className="legal-section-card">
                  <h2 className="legal-section-heading">
                    <CheckCircle2 size={18} color="#0284c7" />
                    <span>{sec.heading}</span>
                  </h2>
                  <p className="legal-paragraph">{sec.body}</p>
                </article>
              ))}
            </div>

            <div className="legal-bottom-cta-box">
              <div>
                <h3>Need more information from our Bengaluru team?</h3>
                <p>
                  Reach us at <strong>+91 79 4050 0100</strong> or <strong>hello@primepro.ai</strong>.
                </p>
              </div>
              <Link to={content.ctaTo} className="legal-cta-primary-btn">
                <span>{content.ctaLabel}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Render one of the 4 Legal & Trust Pages (/privacy-policy, /terms, /security, /compliance)
  const DocIcon = legalDoc.icon || ShieldCheck;

  return (
    <div className="legal-page-wrapper" data-page-key={legalDoc.key}>
      <Header />

      <main className="legal-main" id="main-content">
        {/* Top Hero Header */}
        <section className="legal-hero">
          <div className="legal-hero-inner">
            <nav className="legal-breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <ChevronRight size={13} aria-hidden="true" />
              <span>Legal &amp; Trust Center</span>
              <ChevronRight size={13} aria-hidden="true" />
              <span aria-current="page">{legalDoc.title}</span>
            </nav>

            <div className="legal-hero-top-row">
              <div className="legal-hero-icon-badge" aria-hidden="true">
                <DocIcon size={28} />
              </div>
              <span className="legal-eyebrow-pill">{legalDoc.eyebrow}</span>
            </div>

            <h1 className="legal-hero-title">{legalDoc.title}</h1>
            <p className="legal-hero-subtitle">{legalDoc.subtitle}</p>

            <div className="legal-dates-row" style={{ marginBottom: 0 }}>
              <span className="legal-date-chip">
                <Calendar size={14} aria-hidden="true" />
                <span>Effective Date: <strong>{legalDoc.effectiveDate}</strong></span>
              </span>
              <span className="legal-date-chip">
                <Calendar size={14} aria-hidden="true" />
                <span>Last Updated: <strong>{legalDoc.lastUpdated}</strong></span>
              </span>
            </div>
          </div>
        </section>

        {/* Main 2-Column Content Area: Table of Contents + Readable Document Body */}
        <div className="legal-body-container">
          {/* Mobile Collapsible Table of Contents */}
          <div className="legal-mobile-toc-wrap">
            <button
              type="button"
              className="legal-mobile-toc-toggle"
              onClick={() => setMobileTocOpen((prev) => !prev)}
              aria-expanded={mobileTocOpen}
              aria-controls="legal-mobile-toc-list"
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <List size={16} />
                <span>Table of Contents ({legalDoc.sections.length} Sections)</span>
              </span>
              <ChevronRight
                size={16}
                style={{
                  transform: mobileTocOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.18s ease',
                }}
              />
            </button>
            {mobileTocOpen && (
              <nav id="legal-mobile-toc-list" className="legal-mobile-toc-panel" aria-label="Mobile Table of Contents">
                <ol className="legal-toc-list">
                  {legalDoc.sections.map((sec) => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        onClick={(e) => handleJumpToSection(e, sec.id)}
                        className={`legal-toc-link ${activeSectionId === sec.id ? 'active' : ''}`}
                      >
                        {sec.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>

          <div className="legal-content-grid">
            {/* Desktop Sticky Table of Contents */}
            <aside className="legal-toc-sidebar" aria-label="Document Table of Contents">
              <div className="legal-toc-card">
                <div className="legal-toc-header">
                  <List size={16} color="#0284c7" />
                  <span>On This Page</span>
                </div>
                <nav aria-label="Section Navigation">
                  <ol className="legal-toc-list">
                    {legalDoc.sections.map((sec) => (
                      <li key={sec.id}>
                        <a
                          href={`#${sec.id}`}
                          onClick={(e) => handleJumpToSection(e, sec.id)}
                          className={`legal-toc-link ${activeSectionId === sec.id ? 'active' : ''}`}
                        >
                          {sec.heading}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </aside>

            {/* Primary Document Article */}
            <article className="legal-document-article">
              {legalDoc.introParagraphs && legalDoc.introParagraphs.length > 0 && (
                <div className="legal-intro-card">
                  {legalDoc.introParagraphs.map((para, i) => (
                    <p key={i} className="legal-paragraph">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              <div className="legal-sections-stack">
                {legalDoc.sections.map((sec) => (
                  <section
                    key={sec.id}
                    id={sec.id}
                    className="legal-section-card"
                    aria-labelledby={`${sec.id}-title`}
                  >
                    <h2 id={`${sec.id}-title`} className="legal-section-heading">
                      <span className="legal-section-num-badge" aria-hidden="true">
                        {sec.number}
                      </span>
                      <span>{sec.heading}</span>
                    </h2>

                    {sec.paragraphs &&
                      sec.paragraphs.map((para, idx) => (
                        <p key={idx} className="legal-paragraph">
                          {para}
                        </p>
                      ))}

                    {sec.metaCard && sec.metaCard.length > 0 && (
                      <dl className="legal-meta-dl">
                        {sec.metaCard.map((row) => (
                          <div key={row.label} className="legal-meta-row">
                            <dt>{row.label}:</dt>
                            <dd>
                              {row.isLink ? (
                                <a href={row.href} target="_blank" rel="noopener noreferrer">
                                  {row.value}
                                </a>
                              ) : (
                                row.value
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    {sec.secondParagraphs &&
                      sec.secondParagraphs.map((para, idx) => (
                        <p key={idx} className="legal-paragraph">
                          {para}
                        </p>
                      ))}

                    {sec.bullets && sec.bullets.length > 0 && (
                      <ul className="legal-bullet-list">
                        {sec.bullets.map((b, idx) => (
                          <li key={idx}>
                            {b.lead ? <strong>{b.lead} </strong> : null}
                            <span>{b.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {sec.orderedList && sec.orderedList.length > 0 && (
                      <ol className="legal-ordered-list">
                        {sec.orderedList.map((step, idx) => (
                          <li key={idx}>{step.trim()}</li>
                        ))}
                      </ol>
                    )}

                    {sec.afterParagraphs &&
                      sec.afterParagraphs.map((para, idx) => (
                        <p key={idx} className="legal-paragraph">
                          {para}
                        </p>
                      ))}

                    {sec.internalLinks && sec.internalLinks.length > 0 && (
                      <div className="legal-section-links-row">
                        {sec.internalLinks.map((lnk) => (
                          <Link key={lnk.to} to={lnk.to} className="legal-inline-pill-link">
                            <span>{lnk.label}</span>
                            <ArrowRight size={14} />
                          </Link>
                        ))}
                      </div>
                    )}

                    {sec.reviewNote && (
                      <div className="legal-review-callout" role="note">
                        <Info size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{sec.reviewNote}</span>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* Bottom Navigation & Support Banner */}
              <div className="legal-bottom-cta-box">
                <div>
                  <h3>Questions about our {legalDoc.title}?</h3>
                  <p>
                    Contact our team via the{' '}
                    <Link to="/contact" style={{ color: '#0284c7', fontWeight: 700 }}>
                      Contact Page
                    </Link>{' '}
                    or visit our{' '}
                    <Link to="/help" style={{ color: '#0284c7', fontWeight: 700 }}>
                      Help &amp; Support Center
                    </Link>
                    .
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link to="/contact" className="legal-cta-primary-btn">
                    <span>Contact PrimePro.ai</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function PrivacyPolicyPage() {
  return <InfoPageView pageKey="privacy-policy" />;
}

export function TermsOfServicePage() {
  return <InfoPageView pageKey="terms" />;
}

export function SecurityPage() {
  return <InfoPageView pageKey="security" />;
}

export function CompliancePage() {
  return <InfoPageView pageKey="compliance" />;
}
