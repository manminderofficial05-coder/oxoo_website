// Complete metadata, sample data, and configurations for all 24 Oxoo.ai business applications

export const CATEGORIES_LIST = [
  'All Categories',
  'Finance',
  'Sales',
  'Websites & Apps',
  'Supply Chain',
  'Human Resources',
  'Marketing',
  'WhatsApp Chat AI',
  'Productivity'
];

export const APPS_DATA = [
  // -------------------------------------------------------------
  // ROW 1
  // -------------------------------------------------------------
  {
    id: 'accounting',
    slug: 'accounting',
    name: 'Accounting',
    category: 'Finance',
    concept: 'Clipboard, invoice and currency symbol',
    mainColor: '#2563eb',
    bgColor: '#eff6ff',
    iconSrc: '/apps/logo-accounting.png?v=clean',
    svgSrc: '/app-logos/accounting.svg',
    tagline: 'Invoicing, payments, tax compliance, and automated financial reports.',
    description: 'Oxoo.ai Accounting gives you full control of cash flow, automated bank reconciliation, GST & tax compliance, journal entries, and real-time P&L reporting in one integrated workspace.',
    features: ['Bank Reconciliation', 'Automated Invoicing', 'GST & Multi-currency', 'P&L and Balance Sheet', 'Audit Trail'],
    kpis: [
      { label: 'Revenue (MTD)', value: '₹4,82,500', change: '+14.2%' },
      { label: 'Unpaid Invoices', value: '₹62,400', change: '-8.5%' },
      { label: 'Cash Flow', value: '₹18,40,000', change: '+6.1%' },
      { label: 'Expenses (MTD)', value: '₹1,24,000', change: '-2.4%' }
    ],
    records: [
      { id: 'INV-2026-081', entity: 'Apex Logistics Ltd', date: '2026-10-12', amount: '₹48,200', status: 'Paid' },
      { id: 'INV-2026-082', entity: 'Metro Retailers', date: '2026-10-11', amount: '₹18,500', status: 'Pending' },
      { id: 'INV-2026-083', entity: 'BlueSky Cloud Corp', date: '2026-10-10', amount: '₹1,24,000', status: 'Paid' },
      { id: 'INV-2026-084', entity: 'GreenLeaf Organics', date: '2026-10-09', amount: '₹32,600', status: 'Overdue' }
    ]
  },
  {
    id: 'knowledge',
    slug: 'knowledge',
    name: 'Knowledge',
    category: 'Productivity',
    concept: 'Open book with glowing pages',
    mainColor: '#9333ea',
    bgColor: '#faf5ff',
    iconSrc: '/apps/logo-knowledge.png?v=clean',
    svgSrc: '/app-logos/knowledge.svg',
    tagline: 'Centralized company wiki, SOPs, onboarding docs, and shared intelligence.',
    description: 'Empower your teams with real-time documentation, SOP management, collaborative rich-text editing, version control, and AI-assisted search across all company resources.',
    features: ['Collaborative Docs', 'SOP Templates', 'Internal Knowledge Base', 'Version History', 'AI Instant Q&A'],
    kpis: [
      { label: 'Articles Published', value: '348', change: '+18' },
      { label: 'Monthly Readers', value: '1,840', change: '+24%' },
      { label: 'Avg Read Time', value: '3.4 min', change: '+0.4m' },
      { label: 'Helpfulness Score', value: '98.2%', change: '+1.1%' }
    ],
    records: [
      { id: 'KB-101', title: 'Employee Onboarding & Security Checklist', author: 'Priya S.', updated: '2026-10-12', category: 'HR' },
      { id: 'KB-102', title: 'Sales Playbook: Enterprise Tier Pitch', author: 'Rahul M.', updated: '2026-10-11', category: 'Sales' },
      { id: 'KB-103', title: 'Manufacturing QA & ISO Standards SOP', author: 'Amit P.', updated: '2026-10-08', category: 'Operations' },
      { id: 'KB-104', title: 'API Integration & Webhook Reference', author: 'Vikram K.', updated: '2026-10-05', category: 'Engineering' }
    ]
  },
  {
    id: 'sign',
    slug: 'sign',
    name: 'Sign',
    category: 'Operations',
    concept: 'Digital signature pen or calligraphy stroke',
    mainColor: '#059669',
    bgColor: '#ecfdf5',
    iconSrc: '/apps/logo-sign.png?v=clean',
    svgSrc: '/app-logos/sign.svg',
    tagline: 'Legally compliant electronic signatures, document routing, and signing status.',
    description: 'Send, track, and complete agreements in seconds. Oxoo.ai Sign provides encrypted PDF signing, automated recipient sequencing, audit certificates, and workflow triggers.',
    features: ['E-Sign Compliance', 'Sequential Signers', 'PDF Drag-and-Drop Fields', 'Automated Reminders', 'Audit Certificate'],
    kpis: [
      { label: 'Completed Docs', value: '1,280', change: '+19%' },
      { label: 'Avg Sign Time', value: '42 min', change: '-35%' },
      { label: 'Pending Signatures', value: '14', change: '-4' },
      { label: 'Completion Rate', value: '99.1%', change: '+0.5%' }
    ],
    records: [
      { id: 'SGN-8801', title: 'Vendor Master Services Agreement - TechCorp', recipient: 'legal@techcorp.in', date: '2026-10-12', status: 'Completed' },
      { id: 'SGN-8802', title: 'Executive Offer Letter - Senior Architect', recipient: 'k.verma@email.com', date: '2026-10-12', status: 'Pending' },
      { id: 'SGN-8803', title: 'Commercial Lease Extension Addendum', recipient: 'realty@bengaluru.in', date: '2026-10-10', status: 'Completed' },
      { id: 'SGN-8804', title: 'Non-Disclosure Agreement - Q4 Expansion', recipient: 'finance@partner.com', date: '2026-10-09', status: 'Completed' }
    ]
  },
  {
    id: 'crm',
    slug: 'crm',
    name: 'CRM',
    category: 'Sales',
    concept: 'Group of customers and customer connections',
    mainColor: '#e11d48',
    bgColor: '#fff1f2',
    iconSrc: '/apps/logo-crm.png?v=clean',
    svgSrc: '/app-logos/crm.svg',
    tagline: 'Track leads, nurture customer relationships, and close deals through visual pipelines.',
    description: 'Transform prospective leads into long-term loyal clients. View deals in customizable Kanban stages, automate email follow-ups, score leads with AI, and track rep performance.',
    features: ['Visual Pipeline Kanban', 'Lead Scoring', 'Automated Sequences', 'Call & Meeting Logs', 'Revenue Forecasting'],
    kpis: [
      { label: 'Active Pipeline', value: '₹42,80,000', change: '+18.4%' },
      { label: 'Open Deals', value: '64', change: '+8' },
      { label: 'Win Rate', value: '38.2%', change: '+3.5%' },
      { label: 'Avg Deal Cycle', value: '18 Days', change: '-4 Days' }
    ],
    records: [
      { id: 'CRM-401', client: 'Tata Cons. Projects', dealSize: '₹12,50,000', stage: 'Negotiation', owner: 'Rahul M.', probability: '80%' },
      { id: 'CRM-402', client: 'Zomato Cloud Partner', dealSize: '₹6,40,000', stage: 'Qualified', owner: 'Pooja R.', probability: '50%' },
      { id: 'CRM-403', client: 'HealthCare Diagnostics', dealSize: '₹18,00,000', stage: 'Proposal Sent', owner: 'Vikram K.', probability: '65%' },
      { id: 'CRM-404', client: 'GreenField Agro Tech', dealSize: '₹4,80,000', stage: 'Closed Won', owner: 'Pooja R.', probability: '100%' }
    ]
  },
  {
    id: 'studio',
    slug: 'studio',
    name: 'Studio',
    category: 'Administration',
    concept: 'Crossed customization tools and builder wrench',
    mainColor: '#7c3aed',
    bgColor: '#f5f3ff',
    iconSrc: '/apps/logo-studio.png?v=clean',
    svgSrc: '/app-logos/studio.svg',
    tagline: 'No-code customization for forms, automated fields, views, and workflows.',
    description: 'Tailor Oxoo.ai to your company’s unique business logic. Add custom fields, build bespoke approval workflows, configure user access permissions, and generate custom reports in minutes.',
    features: ['Drag-and-Drop Forms', 'Custom Fields & Relations', 'Automated Workflows', 'Role-Based Permissions', 'View Generator'],
    kpis: [
      { label: 'Active Workflows', value: '86', change: '+12' },
      { label: 'Custom Fields', value: '240', change: '+15' },
      { label: 'Automations Run', value: '48,200', change: '+32%' },
      { label: 'System Uptime', value: '99.98%', change: 'Stable' }
    ],
    records: [
      { id: 'STU-01', model: 'Invoice Model', field: 'GST E-Invoice IRN Token', type: 'Encrypted String', status: 'Live' },
      { id: 'STU-02', model: 'CRM Leads', field: 'AI Lead Sentiment Score', type: 'Calculated Float', status: 'Live' },
      { id: 'STU-03', model: 'Manufacturing Order', field: 'Machine Calibration Code', type: 'Dropdown', status: 'Live' },
      { id: 'STU-04', model: 'HR Employee', field: 'Emergency Contact Verified', type: 'Boolean Checkbox', status: 'Draft' }
    ]
  },
  {
    id: 'subscriptions',
    slug: 'subscriptions',
    name: 'Subscriptions',
    category: 'Finance',
    concept: 'Circular recurring arrows and billing loop',
    mainColor: '#ea580c',
    bgColor: '#fff7ed',
    iconSrc: '/apps/logo-subscriptions.png?v=clean',
    svgSrc: '/app-logos/subscriptions.svg',
    tagline: 'Recurring billing, automatic renewals, plan tiers, and MRR intelligence.',
    description: 'Scale recurring revenue with frictionless subscription lifecycle management. Automate renewals, handle upgrades and prorations, manage churn, and integrate multiple payment gateways.',
    features: ['Recurring Invoicing', 'Prorated Billing', 'Tier & Add-on Management', 'Dunning Management', 'MRR & Churn Analytics'],
    kpis: [
      { label: 'MRR', value: '₹14,20,000', change: '+11.8%' },
      { label: 'Active Subscribers', value: '542', change: '+38' },
      { label: 'Net Churn Rate', value: '1.2%', change: '-0.3%' },
      { label: 'Avg Customer LTV', value: '₹94,000', change: '+6.4%' }
    ],
    records: [
      { id: 'SUB-912', subscriber: 'Urban Logistics HQ', plan: 'Enterprise Annual', amount: '₹1,80,000/yr', renewal: '2027-04-15', status: 'Active' },
      { id: 'SUB-913', subscriber: 'FinEdge Solutions', plan: 'Professional Monthly', amount: '₹14,500/mo', renewal: '2026-11-01', status: 'Active' },
      { id: 'SUB-914', subscriber: 'Kaveri Hospital Group', plan: 'Custom Enterprise', amount: '₹3,20,000/yr', renewal: '2027-01-20', status: 'Active' },
      { id: 'SUB-915', subscriber: 'Boutique Apparel Hub', plan: 'Starter Monthly', amount: '₹4,200/mo', renewal: '2026-10-28', status: 'Trialing' }
    ]
  },

  // -------------------------------------------------------------
  // ROW 2
  // -------------------------------------------------------------
  {
    id: 'ai',
    slug: 'ai',
    name: 'AI',
    category: 'Operations',
    concept: 'AI processor chip with neural pathways',
    mainColor: '#d946ef',
    bgColor: '#fdf4ff',
    iconSrc: '/apps/logo-ai.png?v=clean',
    svgSrc: '/app-logos/ai.svg',
    tagline: 'Enterprise AI assistant for text, summarization, voice, and data intelligence.',
    description: 'Embed advanced generative intelligence into every corner of your business. Draft emails, summarize meeting notes, auto-extract invoice details, and forecast inventory with secure private models.',
    features: ['Document Text Extraction', 'Smart Predictive Analytics', 'Automated Email Composer', 'Private Enterprise Guardrails', 'Custom Prompts'],
    kpis: [
      { label: 'AI Queries Handled', value: '1,42,800', change: '+44%' },
      { label: 'Hours Saved (Mo)', value: '620 hrs', change: '+28%' },
      { label: 'Extraction Accuracy', value: '99.4%', change: '+0.2%' },
      { label: 'Avg Response Time', value: '640 ms', change: '-80ms' }
    ],
    records: [
      { id: 'AI-TASK-01', prompt: 'Summarize Q3 Vendor Performance & Price Variance', tokens: '1,420', status: 'Completed', user: 'Finance Lead' },
      { id: 'AI-TASK-02', prompt: 'Auto-categorize 80 incoming customer support tickets', tokens: '2,890', status: 'Completed', user: 'Helpdesk Bot' },
      { id: 'AI-TASK-03', prompt: 'Draft quotation email with 10% volume discount', tokens: '890', status: 'Completed', user: 'Sales Team' },
      { id: 'AI-TASK-04', prompt: 'Forecast inventory reorder dates for November peak', tokens: '3,450', status: 'Completed', user: 'Ops Lead' }
    ]
  },
  {
    id: 'pos',
    slug: 'pos',
    name: 'Point of Sale',
    category: 'Sales',
    concept: 'Retail storefront with striped awning',
    mainColor: '#f97316',
    bgColor: '#fff7ed',
    iconSrc: '/apps/logo-pos.png?v=clean',
    svgSrc: '/app-logos/point-of-sale.svg',
    tagline: 'Lightning-fast retail and restaurant checkout with offline mode and hardware support.',
    description: 'Keep checkout lines moving with a modern touchscreen POS that works online or offline. Real-time inventory sync, split payments, barcode scanner integration, and digital receipts.',
    features: ['Works 100% Offline', 'Thermal Printer & Scanner Ready', 'Split & Multi-Payment', 'Loyalty Rewards Program', 'Real-time Stock Deduct'],
    kpis: [
      { label: 'Daily Sales', value: '₹1,84,200', change: '+16%' },
      { label: 'Transactions Today', value: '384', change: '+42' },
      { label: 'Avg Ticket Size', value: '₹479', change: '+8.2%' },
      { label: 'Active Terminals', value: '8 Registers', change: 'All Online' }
    ],
    records: [
      { id: 'POS-TX-901', terminal: 'Register 1 (Main Hall)', items: '4 items', total: '₹1,450', payment: 'UPI / QR', time: '14:24' },
      { id: 'POS-TX-902', terminal: 'Register 2 (Express)', items: '1 item', total: '₹220', payment: 'Cash', time: '14:21' },
      { id: 'POS-TX-903', terminal: 'Register 3 (Drive-thru)', items: '6 items', total: '₹2,890', payment: 'Credit Card', time: '14:18' },
      { id: 'POS-TX-904', terminal: 'Register 1 (Main Hall)', items: '2 items', total: '₹780', payment: 'UPI / QR', time: '14:12' }
    ]
  },
  {
    id: 'discuss',
    slug: 'discuss',
    name: 'Discuss',
    category: 'Productivity',
    concept: 'Two overlapping speech bubbles and team chat',
    mainColor: '#3b82f6',
    bgColor: '#eff6ff',
    iconSrc: '/apps/logo-discuss.png?v=clean',
    svgSrc: '/app-logos/discuss.svg',
    tagline: 'Team chat, company channels, direct messages, and voice threads.',
    description: 'Ditch fragmented messaging tools. Oxoo.ai Discuss keeps conversations tied directly to leads, projects, invoices, and tasks, eliminating context switching across your organization.',
    features: ['Team Channels & DMs', 'Attached Record Discussions', 'Rich Markdown & Code', 'Voice & Video Calls', 'Notification Controls'],
    kpis: [
      { label: 'Messages Sent (Today)', value: '3,840', change: '+18%' },
      { label: 'Active Channels', value: '28', change: '+2' },
      { label: 'Team Members Online', value: '46 / 52', change: '88%' },
      { label: 'Attachments Shared', value: '412', change: '+14%' }
    ],
    records: [
      { id: 'DISC-CH-1', channel: '#general-announcements', topic: 'Q4 Product roadmap kickoff meeting at 4 PM', unread: 2, members: 52 },
      { id: 'DISC-CH-2', channel: '#sales-closers', topic: 'Big win! Closed Tata Cons. deal today', unread: 8, members: 14 },
      { id: 'DISC-CH-3', channel: '#finance-invoices', topic: 'Review GST reconciliation before month end', unread: 0, members: 8 },
      { id: 'DISC-CH-4', channel: '#field-service-ops', topic: 'Site inspection dispatched for Brigade Gateway', unread: 1, members: 16 }
    ]
  },
  {
    id: 'documents',
    slug: 'documents',
    name: 'Documents',
    category: 'Operations',
    concept: 'Document sheet with folded corner and lines',
    mainColor: '#10b981',
    bgColor: '#ecfdf5',
    iconSrc: '/apps/logo-documents.png?v=clean',
    svgSrc: '/app-logos/documents.svg',
    tagline: 'Secure cloud document management with OCR, tags, and automated routing.',
    description: 'Organize, collaborate, and store enterprise documents with end-to-end encryption. Automatic OCR turns scanned invoices and PDFs into searchable structured data with permission controls.',
    features: ['Automated OCR Scanner', 'Folder & Tag Hierarchy', 'Granular Role Permissions', 'Full-Text Search', 'Secure External Sharing'],
    kpis: [
      { label: 'Total Files Stored', value: '14,820', change: '+240' },
      { label: 'Storage Used', value: '142 GB / 1 TB', change: '14%' },
      { label: 'OCR Processed', value: '98.8%', change: '+0.5%' },
      { label: 'Shared Links Active', value: '42', change: '-4' }
    ],
    records: [
      { id: 'DOC-501', title: 'Q3_Financial_Audit_Report_Final.pdf', folder: 'Finance / Audits', size: '4.8 MB', updated: '2026-10-12' },
      { id: 'DOC-502', title: 'Factory_Machinery_Blueprint_V4.dwg', folder: 'Operations / Manufacturing', size: '28.4 MB', updated: '2026-10-10' },
      { id: 'DOC-503', title: 'Employee_Code_of_Conduct_2026.pdf', folder: 'HR / Policies', size: '1.2 MB', updated: '2026-10-08' },
      { id: 'DOC-504', title: 'Vendor_Contract_Template_Standard.docx', folder: 'Legal / Contracts', size: '840 KB', updated: '2026-10-02' }
    ]
  },
  {
    id: 'project',
    slug: 'projects',
    name: 'Project',
    category: 'Productivity',
    concept: 'Checked project board and milestone checkmark',
    mainColor: '#8b5cf6',
    bgColor: '#f5f3ff',
    iconSrc: '/apps/logo-project.png?v=clean',
    svgSrc: '/app-logos/project.svg',
    tagline: 'Agile sprints, Kanban boards, Gantt timelines, and project milestone delivery.',
    description: 'Plan, execute, and deliver client and internal projects on schedule. Track task dependencies, monitor billable hours, assign subtasks, and view team workloads on real-time Gantt charts.',
    features: ['Kanban & Gantt Views', 'Task Dependencies', 'Milestone Tracking', 'Subtasks & Checklists', 'Resource Allocation'],
    kpis: [
      { label: 'Active Projects', value: '24', change: '+3' },
      { label: 'Tasks in Progress', value: '184', change: '-12' },
      { label: 'On-Time Delivery', value: '96.4%', change: '+2.1%' },
      { label: 'Billable Hours (WTD)', value: '340 hrs', change: '+18 hrs' }
    ],
    records: [
      { id: 'PRJ-101', name: 'ERP Phase 2 Migration for RetailMart', lead: 'Vikram K.', deadline: '2026-11-15', progress: '72%', status: 'On Track' },
      { id: 'PRJ-102', name: 'E-commerce Mobile App Redesign', lead: 'Pooja R.', deadline: '2026-10-30', progress: '88%', status: 'Review' },
      { id: 'PRJ-103', name: 'Solar Plant Automation Telemetry', lead: 'Amit P.', deadline: '2026-12-20', progress: '40%', status: 'On Track' },
      { id: 'PRJ-104', name: 'ISO 27001 Security Audit Readiness', lead: 'Priya S.', deadline: '2026-10-25', progress: '94%', status: 'Final Stage' }
    ]
  },
  {
    id: 'timesheets',
    slug: 'timesheets',
    name: 'Timesheets',
    category: 'Human Resources',
    concept: 'Precision clock face and recorded hours',
    mainColor: '#f43f5e',
    bgColor: '#fff1f2',
    iconSrc: '/apps/logo-timesheets.png?v=clean',
    svgSrc: '/app-logos/timesheets.svg',
    tagline: 'Track hours per task, billable time logs, attendance, and payroll approvals.',
    description: 'Track billable client time with single-click timers or weekly grid sheets. Automatically flow logged time into invoices, employee payroll calculations, and project profitability reports.',
    features: ['Single-Click Timer', 'Weekly Grid Logger', 'Manager Approvals', 'Client Billable Sync', 'Overtime Compliance'],
    kpis: [
      { label: 'Logged Hours (Week)', value: '1,480 hrs', change: '+45 hrs' },
      { label: 'Billable Ratio', value: '84.2%', change: '+3.1%' },
      { label: 'Pending Approvals', value: '8 entries', change: '-5' },
      { label: 'Avg Productivity', value: '7.8 hrs/day', change: 'Normal' }
    ],
    records: [
      { id: 'TS-301', employee: 'Ananya Deshmukh', project: 'RetailMart ERP', task: 'API Endpoint Integration', hours: '7.5 hrs', billable: true },
      { id: 'TS-302', employee: 'Rohan Mehra', project: 'Mobile App Redesign', task: 'Figma Component Systems', hours: '8.0 hrs', billable: true },
      { id: 'TS-303', employee: 'Siddharth Rao', project: 'Internal Ops', task: 'Server Patching & Backups', hours: '6.0 hrs', billable: false },
      { id: 'TS-304', employee: 'Kavita Iyer', project: 'Solar Automation', task: 'Firmware Telemetry QA', hours: '8.5 hrs', billable: true }
    ]
  },

  // -------------------------------------------------------------
  // ROW 3
  // -------------------------------------------------------------
  {
    id: 'field-service',
    slug: 'field-service',
    name: 'Field Service',
    category: 'Operations',
    concept: 'Location pin with small mechanical gear',
    mainColor: '#0284c7',
    bgColor: '#f0f9ff',
    iconSrc: '/apps/logo-field-service.png?v=clean',
    svgSrc: '/app-logos/field-service.svg',
    tagline: 'Dispatch technicians, mobile work orders, customer signatures, and route optimization.',
    description: 'Coordinate your mobile workforce from any browser or phone. Dispatch technicians based on skill and location, track job progress with live GPS timestamps, and collect customer sign-offs on site.',
    features: ['Live GPS Routing', 'Technician Skill Matching', 'Mobile Work Orders', 'On-Site Photo Upload', 'Direct Customer E-Sign'],
    kpis: [
      { label: 'Completed Jobs (Today)', value: '48', change: '+6' },
      { label: 'First-Time Fix Rate', value: '92.4%', change: '+4.1%' },
      { label: 'Avg Response Time', value: '38 min', change: '-12 min' },
      { label: 'Active Field Techs', value: '16 / 18', change: 'Active' }
    ],
    records: [
      { id: 'FS-891', customer: 'Prestige Meridian Plaza', issue: 'HVAC Chiller Sensor Calibration', tech: 'Manish K.', status: 'In Progress' },
      { id: 'FS-892', customer: 'BioTech Labs Indiranagar', issue: 'UPS Battery Bank Inspection', tech: 'Suresh V.', status: 'Completed' },
      { id: 'FS-893', customer: 'Global Logistics Hub 4', issue: 'Barcode Conveyor Maintenance', tech: 'Deepak T.', status: 'Dispatched' },
      { id: 'FS-894', customer: 'Skyline Luxury Towers', issue: 'Fiber Switchboard Troubleshooting', tech: 'Manish K.', status: 'Scheduled' }
    ]
  },
  {
    id: 'planning',
    slug: 'planning',
    name: 'Planning',
    category: 'Operations',
    concept: 'Calendar with checkmark and shift schedule',
    mainColor: '#16a34a',
    bgColor: '#f0fdf4',
    iconSrc: '/apps/logo-planning.png?v=clean',
    svgSrc: '/app-logos/planning.svg',
    tagline: 'Shift schedules, workforce planning, resource allocation, and leave tracking.',
    description: 'Build optimal shift rosters without scheduling conflicts. Drag-and-drop shifts, auto-fill open spots based on employee availability, send automated notifications, and handle shift swaps.',
    features: ['Drag-and-Drop Rostering', 'Availability Management', 'Auto-fill Open Shifts', 'Overtime Alerts', 'SMS / Push Shift Alerts'],
    kpis: [
      { label: 'Shifts Scheduled', value: '320', change: '100% Filled' },
      { label: 'Open Shifts', value: '0', change: '-4' },
      { label: 'Employee Utilization', value: '94.8%', change: '+3.2%' },
      { label: 'Shift Swap Requests', value: '3 Pending', change: 'Reviewed' }
    ],
    records: [
      { id: 'PLN-01', department: 'Warehouse Morning Shift', hours: '06:00 - 14:00', staffCount: '14 Staff', status: 'Confirmed' },
      { id: 'PLN-02', department: 'Support Tier 1 Evening', hours: '14:00 - 22:00', staffCount: '8 Staff', status: 'Confirmed' },
      { id: 'PLN-03', department: 'Factory Machine Operators', hours: '08:00 - 17:00', staffCount: '22 Staff', status: 'Confirmed' },
      { id: 'PLN-04', department: 'Dispatch & Fleet Drivers', hours: '05:00 - 13:00', staffCount: '10 Staff', status: 'Confirmed' }
    ]
  },
  {
    id: 'helpdesk',
    slug: 'helpdesk',
    name: 'Helpdesk',
    category: 'Customer Service',
    concept: 'Customer support headset and support agent',
    mainColor: '#a855f7',
    bgColor: '#faf5ff',
    iconSrc: '/apps/logo-helpdesk.png?v=clean',
    svgSrc: '/app-logos/helpdesk.svg',
    tagline: 'Omnichannel ticketing, automated SLA timers, live customer portal, and CSAT metrics.',
    description: 'Deliver world-class support across email, website chat, phone, and WhatsApp. Oxoo.ai Helpdesk automates ticket routing, enforces SLA commitments, and measures customer satisfaction.',
    features: ['Omnichannel Intake', 'Automated SLA Escalation', 'Canned Responses', 'Customer Portal', 'CSAT & First Response Stats'],
    kpis: [
      { label: 'Open Tickets', value: '28', change: '-14%' },
      { label: 'First Response Time', value: '4.2 min', change: '-1.8 min' },
      { label: 'SLA Compliance', value: '98.9%', change: '+1.2%' },
      { label: 'Customer CSAT', value: '4.9 / 5.0', change: '+0.2' }
    ],
    records: [
      { id: 'TKT-1082', subject: 'Payment Gateway Webhook Timeout on Checkout', priority: 'High', customer: 'RetailMart HQ', assignee: 'Support Lead' },
      { id: 'TKT-1083', subject: 'Invoice PDF Download Generating 504 Gateway', priority: 'Urgent', customer: 'BioTech Labs', assignee: 'Vikram K.' },
      { id: 'TKT-1084', subject: 'Requesting Additional User Licenses for Q4', priority: 'Medium', customer: 'FinEdge Corp', assignee: 'Priya S.' },
      { id: 'TKT-1085', subject: 'How to configure custom tax rates in Accounting', priority: 'Low', customer: 'GreenLeaf Ltd', assignee: 'Pooja R.' }
    ]
  },
  {
    id: 'ecommerce',
    slug: 'ecommerce',
    name: 'eCommerce',
    category: 'Sales',
    concept: 'Shopping cart with digital payment',
    mainColor: '#ec4899',
    bgColor: '#fdf2f8',
    iconSrc: '/apps/logo-ecommerce.png?v=clean',
    svgSrc: '/app-logos/ecommerce.svg',
    tagline: 'High-converting online store with real-time inventory, payment gateways, and shipping.',
    description: 'Sell products online with a modern, lightning-fast storefront. Syncs directly with Oxoo.ai Inventory and Accounting, provides SEO-optimized product pages, and supports localized payment methods.',
    features: ['Instant Checkout', 'Auto Inventory Sync', 'Multi-currency & UPI', 'Abandoned Cart Recovery', 'Shipping API Integrations'],
    kpis: [
      { label: 'Online Sales (Today)', value: '₹3,42,800', change: '+22.4%' },
      { label: 'Orders Placed', value: '184', change: '+28' },
      { label: 'Conversion Rate', value: '3.8%', change: '+0.6%' },
      { label: 'Avg Order Value', value: '₹1,860', change: '+4.5%' }
    ],
    records: [
      { id: 'ORD-9821', customer: 'Anjali Sharma', items: '3 items', total: '₹4,890', payment: 'Razorpay / UPI', status: 'Shipped' },
      { id: 'ORD-9822', customer: 'Karthik Raman', items: '1 item', total: '₹1,250', payment: 'Credit Card', status: 'Processing' },
      { id: 'ORD-9823', customer: 'Pooja Nair', items: '5 items', total: '₹8,400', payment: 'Net Banking', status: 'Delivered' },
      { id: 'ORD-9824', customer: 'Manish Verma', items: '2 items', total: '₹2,100', payment: 'Cash on Delivery', status: 'Out for Delivery' }
    ]
  },
  {
    id: 'website',
    slug: 'website',
    name: 'Website',
    category: 'Marketing',
    concept: '3D wireframe globe and digital presence',
    mainColor: '#0284c7',
    bgColor: '#f0f9ff',
    iconSrc: '/apps/logo-website.png?v=clean',
    svgSrc: '/app-logos/website.svg',
    tagline: 'Visual drag-and-drop website builder with SEO, blogs, forms, and custom domains.',
    description: 'Design and publish responsive web pages without coding. Built-in lead capture forms connect directly to CRM, assets load at blazing speeds, and SEO metadata is tuned automatically.',
    features: ['Drag-and-Drop Editor', 'Mobile Responsive Preview', 'Integrated CRM Webforms', 'SEO & OpenGraph Meta', 'SSL & Custom Domains'],
    kpis: [
      { label: 'Unique Visitors (Mo)', value: '84,200', change: '+18.5%' },
      { label: 'Page Load Time', value: '0.8s', change: 'Top 5%' },
      { label: 'Form Submissions', value: '640', change: '+42' },
      { label: 'SEO Health Score', value: '98 / 100', change: '+3' }
    ],
    records: [
      { id: 'PAGE-01', title: 'Home Landing Page', path: '/', status: 'Published', views: '42,800', lastUpdated: '2026-10-12' },
      { id: 'PAGE-02', title: 'Pricing & Enterprise Plans', path: '/pricing', status: 'Published', views: '18,400', lastUpdated: '2026-10-10' },
      { id: 'PAGE-03', title: 'All Business Apps Showcase', path: '/services', status: 'Published', views: '14,200', lastUpdated: '2026-10-11' },
      { id: 'PAGE-04', title: 'Book a Demo & Contact', path: '/contact', status: 'Published', views: '8,800', lastUpdated: '2026-10-09' }
    ]
  },
  {
    id: 'email-marketing',
    slug: 'email-marketing',
    name: 'Email Marketing',
    category: 'Marketing',
    concept: 'Ascending paper airplane and campaigns',
    mainColor: '#2563eb',
    bgColor: '#eff6ff',
    iconSrc: '/apps/logo-email-marketing.png?v=clean',
    svgSrc: '/app-logos/email-marketing.svg',
    tagline: 'Automated email newsletters, customer segmentation, dynamic templates, and CTR analytics.',
    description: 'Engage and retain clients with intelligent email marketing. Segment leads by purchase history, track email opens and link clicks in real time, and trigger automated drip campaigns.',
    features: ['Responsive Email Builder', 'Audience Segmentation', 'Automated Drip Series', 'Real-Time Open & Click Rates', 'Unsubscribe Compliance'],
    kpis: [
      { label: 'Emails Sent (MTD)', value: '1,84,000', change: '+24%' },
      { label: 'Avg Open Rate', value: '38.4%', change: '+5.2%' },
      { label: 'Click-Through Rate', value: '8.6%', change: '+1.4%' },
      { label: 'Bounce Rate', value: '0.4%', change: '-0.1%' }
    ],
    records: [
      { id: 'CMP-201', name: 'October Product Feature Showcase', sent: '42,000', opened: '41.2%', clicked: '9.4%', status: 'Sent' },
      { id: 'CMP-202', name: 'Diwali Festive B2B Early Bird Offer', sent: '28,500', opened: '46.8%', clicked: '12.8%', status: 'Sent' },
      { id: 'CMP-203', name: 'New User Onboarding - Day 3 Tips', sent: 'Automated Drip', opened: '52.1%', clicked: '18.4%', status: 'Active' },
      { id: 'CMP-204', name: 'Q4 Enterprise Webinar Invitation', sent: '14,200', opened: '34.6%', clicked: '7.2%', status: 'Scheduled' }
    ]
  },

  // -------------------------------------------------------------
  // ROW 4
  // -------------------------------------------------------------
  {
    id: 'purchase',
    slug: 'purchase',
    name: 'Purchase',
    category: 'Operations',
    concept: 'Three-dimensional isometric box/package',
    mainColor: '#d97706',
    bgColor: '#fffbeb',
    iconSrc: '/apps/logo-purchase.png?v=clean',
    svgSrc: '/app-logos/purchase.svg',
    tagline: 'Purchase orders, vendor quotes, three-way matching, and automatic replenishment.',
    description: 'Streamline procurement and vendor management. Create RFQs, compare supplier quotes, enforce approval hierarchies, and automatically sync incoming shipments with warehouse stock.',
    features: ['Vendor RFQ Comparisons', 'Automated PO Generation', '3-Way Invoice Matching', 'Approval Workflows', 'Receipt Verification'],
    kpis: [
      { label: 'Spend (MTD)', value: '₹8,42,000', change: '-4.8%' },
      { label: 'Open POs', value: '14 Orders', change: '8 Approved' },
      { label: 'Vendor Rating', value: '4.8 / 5.0', change: '+0.1' },
      { label: 'Cost Savings', value: '₹64,000', change: '+12%' }
    ],
    records: [
      { id: 'PO-701', vendor: 'Steel Alloys India Pvt Ltd', amount: '₹3,40,000', date: '2026-10-11', status: 'Approved', expected: '2026-10-18' },
      { id: 'PO-702', vendor: 'MicroTech Sensors Corp', amount: '₹1,24,000', date: '2026-10-10', status: 'Received', expected: '2026-10-12' },
      { id: 'PO-703', vendor: 'Packaging Solutions Ltd', amount: '₹48,500', date: '2026-10-09', status: 'Draft', expected: '2026-10-20' },
      { id: 'PO-704', vendor: 'CleanLogistics Transport', amount: '₹82,000', date: '2026-10-08', status: 'Approved', expected: '2026-10-15' }
    ]
  },
  {
    id: 'inventory',
    slug: 'inventory',
    name: 'Inventory',
    category: 'Operations',
    concept: 'Warehouse storage building with stock crates',
    mainColor: '#7e22ce',
    bgColor: '#faf5ff',
    iconSrc: '/apps/logo-inventory.png?v=clean',
    svgSrc: '/app-logos/inventory.svg',
    tagline: 'Multi-warehouse stock tracking, serial numbers, reordering alerts, and barcode scans.',
    description: 'Gain real-time visibility across all warehouse locations and store branches. Track batch & serial numbers, automate reorder rules, and streamline pick-pack-ship operations.',
    features: ['Multi-Warehouse Tracking', 'Serial & Batch Control', 'Automated Reorder Points', 'Barcode & QR Scanning', 'Internal Stock Transfers'],
    kpis: [
      { label: 'Total SKUs Active', value: '2,840', change: '+48' },
      { label: 'Stock Valuation', value: '₹64,80,000', change: '+3.4%' },
      { label: 'Low Stock Alerts', value: '6 Items', change: 'Needs PO' },
      { label: 'Inventory Turnover', value: '5.8x / yr', change: '+0.4x' }
    ],
    records: [
      { id: 'SKU-1082', item: 'Industrial Servo Motor 24V', warehouse: 'Bangalore Central (WH-1)', qty: '142 units', status: 'In Stock' },
      { id: 'SKU-1083', item: 'Aluminum Extrusion 20x20 2m', warehouse: 'Hosur Plant (WH-2)', qty: '18 units', status: 'Low Stock' },
      { id: 'SKU-1084', item: 'Microcontroller Core Board v3', warehouse: 'Bangalore Central (WH-1)', qty: '840 units', status: 'In Stock' },
      { id: 'SKU-1085', item: 'Thermal Printer Roll 80mm', warehouse: 'Retail Hub (WH-3)', qty: '450 units', status: 'In Stock' }
    ]
  },
  {
    id: 'manufacturing',
    slug: 'manufacturing',
    name: 'Manufacturing',
    category: 'Operations',
    concept: 'Industrial factory building with smokestacks',
    mainColor: '#059669',
    bgColor: '#ecfdf5',
    iconSrc: '/apps/logo-manufacturing.png?v=clean',
    svgSrc: '/app-logos/manufacturing.svg',
    tagline: 'Bills of Materials (BOM), work orders, routing steps, and capacity scheduling.',
    description: 'Transform raw components into finished goods with precision MRP. Plan production schedules, track machine scrap rates, monitor work center capacity, and calculate exact manufacturing costs.',
    features: ['Multi-level Bills of Materials', 'Work Center Capacity Planning', 'Scrap & Quality Checkpoints', 'Cost Breakdown & Variance', 'IoT Machine Metrics'],
    kpis: [
      { label: 'Active Work Orders', value: '18', change: '4 Completed Today' },
      { label: 'OEE (Efficiency)', value: '88.6%', change: '+2.4%' },
      { label: 'Scrap Rate', value: '0.8%', change: '-0.3%' },
      { label: 'On-Time Production', value: '97.2%', change: '+1.8%' }
    ],
    records: [
      { id: 'MO-4401', product: 'Smart IoT Gateway Box v2', qty: '500 units', bom: 'BOM-IOT-02', workCenter: 'SMT Line 1', status: 'In Production' },
      { id: 'MO-4402', product: 'High-Precision Stepper Drive', qty: '200 units', bom: 'BOM-STEP-01', workCenter: 'Assembly Station 2', status: 'Ready' },
      { id: 'MO-4403', product: 'Heavy Duty Metal Enclosure', qty: '1,000 units', bom: 'BOM-ENC-04', workCenter: 'CNC Milling', status: 'Completed' },
      { id: 'MO-4404', product: 'Wiring Harness 12-pin', qty: '800 units', bom: 'BOM-HAR-09', workCenter: 'Manual Crimp Desk', status: 'In Production' }
    ]
  },
  {
    id: 'sales',
    slug: 'sales',
    name: 'Sales',
    category: 'Sales',
    concept: 'Rising bar chart with sales growth',
    mainColor: '#ea580c',
    bgColor: '#fff7ed',
    iconSrc: '/apps/logo-sales.png?v=clean',
    svgSrc: '/app-logos/sales.svg',
    tagline: 'Professional quotations, sales orders, price matrices, and commission tracking.',
    description: 'Turn quotes into orders with zero friction. Send branded quotations with instant e-signatures and online payments, manage tiered customer price lists, and track sales team targets.',
    features: ['Branded Online Quotes', 'Tiered Price Lists', 'One-Click Sales Orders', 'Commission Calculation', 'Customer Portal Access'],
    kpis: [
      { label: 'Sales Booked (MTD)', value: '₹18,40,000', change: '+21.2%' },
      { label: 'Quotes Converted', value: '42 / 58', change: '72.4%' },
      { label: 'Top Performer', value: 'Pooja R. (₹6.8L)', change: 'Leader' },
      { label: 'Pending Confirmations', value: '6 Quotes', change: '₹3.2L' }
    ],
    records: [
      { id: 'SO-1091', customer: 'Adani Logistics Hub', amount: '₹4,80,000', salesRep: 'Rahul M.', date: '2026-10-12', status: 'Confirmed' },
      { id: 'SO-1092', customer: 'L&T Infotech Division', amount: '₹8,20,000', salesRep: 'Pooja R.', date: '2026-10-11', status: 'Quotation Sent' },
      { id: 'SO-1093', customer: 'MedPlus Pharmacy Chain', amount: '₹2,40,000', salesRep: 'Vikram K.', date: '2026-10-09', status: 'Confirmed' },
      { id: 'SO-1094', customer: 'QuickBite Restaurants', amount: '₹1,15,000', salesRep: 'Pooja R.', date: '2026-10-08', status: 'Invoiced' }
    ]
  },
  {
    id: 'hr',
    slug: 'hr',
    name: 'HR',
    category: 'Human Resources',
    concept: 'Group of employees and organizational leadership',
    mainColor: '#0284c7',
    bgColor: '#f0f9ff',
    iconSrc: '/apps/logo-hr.png?v=clean',
    svgSrc: '/app-logos/hrms.svg',
    tagline: 'Employee records, department hierarchy, leave approvals, and appraisals.',
    description: 'Empower your people with modern human capital management. Centralize employee documents, manage leave policies and approvals, conduct 360 reviews, and maintain organizational charts.',
    features: ['Employee Directory', 'Leave & Attendance Tracking', 'Org Hierarchy Chart', 'Performance Appraisals', 'Expense Reimbursement'],
    kpis: [
      { label: 'Total Employees', value: '148', change: '+6 Hired' },
      { label: 'On Leave Today', value: '4 Staff', change: 'Covered' },
      { label: 'Retention Rate', value: '96.8%', change: '+1.4%' },
      { label: 'Open Positions', value: '8 Roles', change: 'Recruiting' }
    ],
    records: [
      { id: 'EMP-014', name: 'Dr. Priya Sharma', role: 'VP of Product & Engineering', dept: 'Engineering', status: 'Active', joinDate: '2024-02-15' },
      { id: 'EMP-022', name: 'Rahul Mehta', role: 'Senior Enterprise Sales Director', dept: 'Sales', status: 'Active', joinDate: '2024-06-01' },
      { id: 'EMP-038', name: 'Ananya Deshmukh', role: 'Lead DevOps & Cloud Architect', dept: 'Infrastructure', status: 'Active', joinDate: '2025-01-10' },
      { id: 'EMP-045', name: 'Siddharth Rao', role: 'Operations & Supply Chain Manager', dept: 'Logistics', status: 'On Leave', joinDate: '2025-03-20' }
    ]
  },
  {
    id: 'dashboard',
    slug: 'dashboard',
    name: 'Dashboard',
    category: 'Administration',
    concept: 'Four rounded squares and executive business KPIs',
    mainColor: '#f43f5e',
    bgColor: '#fff1f2',
    iconSrc: '/apps/logo-dashboard.png?v=clean',
    svgSrc: '/app-logos/dashboard.svg',
    tagline: 'Executive real-time business health, cross-module analytics, and custom widgets.',
    description: 'See your whole business at a glance. Oxoo.ai Dashboard aggregates data across sales, finance, operations, customer support, and HR into beautiful, interactive, drillable widgets.',
    features: ['Cross-Module KPI Summary', 'Interactive Visual Charts', 'Custom Widget Layouts', 'Scheduled PDF Reports', 'Mobile Real-Time Sync'],
    kpis: [
      { label: 'Total Platform ARR', value: '₹1.84 Cr', change: '+28.4%' },
      { label: 'Active Business Users', value: '1,420', change: '+18%' },
      { label: 'Gross Margin', value: '74.2%', change: '+2.1%' },
      { label: 'Operational Efficiency', value: '94.6%', change: '+4.5%' }
    ],
    records: [
      { id: 'KPI-1', metric: 'Monthly Recurring Revenue (MRR)', current: '₹15,40,000', target: '₹14,00,000', status: 'Exceeded' },
      { id: 'KPI-2', metric: 'Customer Acquisition Cost (CAC)', current: '₹4,200', target: '₹5,000', status: 'Optimal' },
      { id: 'KPI-3', metric: 'Support Resolution Time', current: '1.8 hrs', target: '4.0 hrs', status: 'Exceeded' },
      { id: 'KPI-4', metric: 'Manufacturing On-Time Deliveries', current: '97.2%', target: '95.0%', status: 'Exceeded' }
    ]
  }
];

export const SERVICE_ALIASES = {
  // Finance
  'invoicing': { base: 'accounting', name: 'Invoicing', category: 'Finance', iconSrc: '/apps/logo-accounting.png?v=clean', tagline: 'Automated professional invoicing, recurring billing, and instant payments.' },
  'expenses': { base: 'purchase', name: 'Expenses', category: 'Finance', iconSrc: '/apps/logo-purchase.png?v=clean', tagline: 'Real-time expense tracking, employee expense reports, and automatic matching.' },
  'expense-management': { base: 'purchase', name: 'Expenses', category: 'Finance', iconSrc: '/apps/logo-purchase.png?v=clean', tagline: 'Real-time expense tracking, employee expense reports, and automatic matching.' },
  'spreadsheet': { base: 'documents', name: 'Spreadsheet', category: 'Finance', iconSrc: '/apps/logo-documents.png?v=clean', tagline: 'Collaborative spreadsheets, live formula recalculations, and BI dashboards.' },
  'spreadsheets': { base: 'documents', name: 'Spreadsheet', category: 'Finance', iconSrc: '/apps/logo-documents.png?v=clean', tagline: 'Collaborative spreadsheets, live formula recalculations, and BI dashboards.' },
  'esg': { base: 'sign', name: 'ESG', category: 'Finance', iconSrc: '/apps/logo-sign.png?v=clean', tagline: 'Environmental, social, and governance reporting and carbon footprint tracking.' },

  // Sales
  'subscriptions': { base: 'subscriptions', name: 'Subscriptions', category: 'Sales', iconSrc: '/apps/logo-subscriptions.png?v=clean', tagline: 'Recurring billing engine, automated renewals, upgrades, and MRR intelligence.' },
  'pos-shop': { base: 'pos', name: 'POS Shop', category: 'Sales', iconSrc: '/apps/logo-pos.png?v=clean', tagline: 'High-speed retail point of sale, barcode scanning, inventory sync, and receipts.' },
  'pos-restaurant': { base: 'pos', name: 'POS Restaurant', category: 'Sales', iconSrc: '/apps/logo-pos.png?v=clean', tagline: 'Restaurant POS, floor plans, kitchen display system (KDS), and split billing.' },
  'rental': { base: 'field-service', name: 'Rental', category: 'Sales', iconSrc: '/apps/logo-field-service.png?v=clean', tagline: 'Equipment rental management, pickup and delivery schedules, and asset tracking.' },

  // Websites & Apps
  'ai-website-builder': { base: 'website', name: 'AI Website Builder', category: 'Websites & Apps', iconSrc: '/apps/logo-website.png?v=clean', tagline: 'Modern responsive websites with drag-and-drop AI builder and instant SEO optimization.' },
  'website-builder': { base: 'website', name: 'AI Website Builder', category: 'Websites & Apps', iconSrc: '/apps/logo-website.png?v=clean', tagline: 'Modern responsive websites with drag-and-drop AI builder and instant SEO optimization.' },
  'android-ios-apps': { base: 'studio', name: 'Android & iOS Apps', category: 'Websites & Apps', iconSrc: '/apps/logo-studio.png?v=clean', tagline: 'Native Android and iOS mobile applications with real-time cloud backend sync.' },
  'mobile-apps': { base: 'studio', name: 'Android & iOS Apps', category: 'Websites & Apps', iconSrc: '/apps/logo-studio.png?v=clean', tagline: 'Native Android and iOS mobile applications with real-time cloud backend sync.' },
  'ecommerce-websites': { base: 'ecommerce', name: 'eCommerce Websites', category: 'Websites & Apps', iconSrc: '/apps/logo-ecommerce.png?v=clean', tagline: 'High-converting online store with payment gateways, order management, and stock sync.' },
  '3d-websites': { base: 'website', name: '3D Websites', category: 'Websites & Apps', iconSrc: '/apps/logo-website.png?v=clean', tagline: 'Interactive 3D WebGL digital experiences, animations, and product visualizers.' },
  'ai-chatbots': { base: 'ai', name: 'AI Chatbots', category: 'Websites & Apps', iconSrc: '/apps/logo-ai.png?v=clean', tagline: 'Intelligent conversational AI assistants for 24/7 automated support and sales.' },
  'web-apps-other': { base: 'documents', name: 'Web Apps & Other', category: 'Websites & Apps', iconSrc: '/apps/logo-documents.png?v=clean', tagline: 'Scalable custom web applications, SaaS platforms, portals, and cloud solutions.' },
  'web-apps': { base: 'documents', name: 'Web Apps & Other', category: 'Websites & Apps', iconSrc: '/apps/logo-documents.png?v=clean', tagline: 'Scalable custom web applications, SaaS platforms, portals, and cloud solutions.' },
  'events': { base: 'planning', name: 'Events', category: 'Websites & Apps', iconSrc: '/apps/logo-planning.png?v=clean', tagline: 'Online and in-person event management, ticketing, attendee badges, and agendas.' },
  'blog': { base: 'knowledge', name: 'Blog', category: 'Websites & Apps', iconSrc: '/apps/logo-knowledge.png?v=clean', tagline: 'Publish articles, SEO-optimized blog posts, and company news updates.' },
  'elearning': { base: 'knowledge', name: 'eLearning', category: 'Websites & Apps', iconSrc: '/apps/logo-knowledge.png?v=clean', tagline: 'Online courses, video lessons, quizzes, student grading, and certifications.' },
  'forum': { base: 'discuss', name: 'Forum', category: 'Websites & Apps', iconSrc: '/apps/logo-discuss.png?v=clean', tagline: 'Community forum, questions, upvotes, tags, and discussions.' },

  // Supply Chain
  'maintenance': { base: 'field-service', name: 'Maintenance', category: 'Supply Chain', iconSrc: '/apps/logo-field-service.png?v=clean', tagline: 'Preventive and corrective equipment maintenance, repair requests, and MTBF metrics.' },
  'plm': { base: 'manufacturing', name: 'PLM', category: 'Supply Chain', iconSrc: '/apps/logo-manufacturing.png?v=clean', tagline: 'Product Lifecycle Management, engineering change orders (ECO), and BOM revisions.' },
  'quality': { base: 'sign', name: 'Quality', category: 'Supply Chain', iconSrc: '/apps/logo-sign.png?v=clean', tagline: 'Quality control points, inspection checklists, and pass/fail audit logs.' },

  // Human Resources
  'employees': { base: 'hr', name: 'Employees', category: 'Human Resources', iconSrc: '/apps/logo-hr.png?v=clean', tagline: 'Centralized employee directory, contracts, org charts, and digital onboarding.' },
  'payroll': { base: 'accounting', name: 'Payroll', category: 'Human Resources', iconSrc: '/apps/logo-accounting.png?v=clean', tagline: 'Automated salary disbursements, deductions, tax compliance, and payslips.' },
  'recruitment': { base: 'crm', name: 'Recruitment', category: 'Human Resources', iconSrc: '/apps/logo-crm.png?v=clean', tagline: 'Candidate pipeline Kanban, resume parsing, interview scheduling, and offer letters.' },
  'time-off': { base: 'timesheets', name: 'Time Off', category: 'Human Resources', iconSrc: '/apps/logo-timesheets.png?v=clean', tagline: 'Leave management, vacation requests, accruals, and departmental calendars.' },
  'appraisals': { base: 'studio', name: 'Appraisals', category: 'Human Resources', iconSrc: '/apps/logo-studio.png?v=clean', tagline: 'Periodic performance appraisals, 360-degree feedback, and goal milestones.' },
  'fleet': { base: 'field-service', name: 'Fleet', category: 'Human Resources', iconSrc: '/apps/logo-field-service.png?v=clean', tagline: 'Vehicle fleet management, fuel consumption logs, maintenance contracts, and drivers.' },

  // Marketing
  'social-marketing': { base: 'email-marketing', name: 'Social Marketing', category: 'Marketing', iconSrc: '/apps/logo-email-marketing.png?v=clean', tagline: 'Schedule and publish social posts across platforms and monitor engagement.' },
  'sms-marketing': { base: 'email-marketing', name: 'SMS Marketing', category: 'Marketing', iconSrc: '/apps/logo-email-marketing.png?v=clean', tagline: 'Direct SMS campaigns, transactional alerts, and delivery reports.' },
  'marketing-automation': { base: 'email-marketing', name: 'Marketing Automation', category: 'Marketing', iconSrc: '/apps/logo-email-marketing.png?v=clean', tagline: 'Automated multi-step customer journeys, lead scoring, and automated actions.' },
  'whatsapp': { base: 'discuss', name: 'WhatsApp', category: 'Marketing', iconSrc: '/apps/logo-discuss.png?v=clean', tagline: 'Official WhatsApp Cloud API broadcasts, automated chatbots, and order support.' },
  'surveys': { base: 'knowledge', name: 'Surveys', category: 'Marketing', iconSrc: '/apps/logo-knowledge.png?v=clean', tagline: 'Customer satisfaction surveys, feedback forms, and NPS scoring.' },

  // WhatsApp Chat AI
  'whatsapp-ai-inbox': { base: 'discuss', name: 'WhatsApp AI Inbox', category: 'WhatsApp Chat AI', iconSrc: '/apps/logo-discuss.png?v=clean', tagline: 'Unified multi-agent team inbox powered by AI co-pilots for lightning-fast replies.' },
  'whatsapp-marketing': { base: 'email-marketing', name: 'WhatsApp Marketing & Broadcasts', category: 'WhatsApp Chat AI', iconSrc: '/apps/logo-email-marketing.png?v=clean', tagline: 'Official WhatsApp Cloud API broadcasts, targeted marketing campaigns, and delivery analytics.' },
  'whatsapp-marketing-broadcasts': { base: 'email-marketing', name: 'WhatsApp Marketing & Broadcasts', category: 'WhatsApp Chat AI', iconSrc: '/apps/logo-email-marketing.png?v=clean', tagline: 'Official WhatsApp Cloud API broadcasts, targeted marketing campaigns, and delivery analytics.' },
  'whatsapp-flow-builder': { base: 'planning', name: 'WhatsApp Flow Builder', category: 'WhatsApp Chat AI', iconSrc: '/apps/logo-planning.png?v=clean', tagline: 'Visual drag-and-drop no-code flow builder for automated customer journeys and questionnaires.' },
  'whatsapp-commerce': { base: 'ecommerce', name: 'WhatsApp Commerce', category: 'WhatsApp Chat AI', iconSrc: '/apps/logo-ecommerce.png?v=clean', tagline: 'Interactive product catalogs, cart management, and seamless in-chat checkout.' },
  'whatsapp-booking': { base: 'planning', name: 'WhatsApp Booking & Reminders', category: 'WhatsApp Chat AI', iconSrc: '/apps/logo-planning.png?v=clean', tagline: 'Automated appointment scheduling, instant booking confirmations, and proactive reminders.' },
  'whatsapp-booking-reminders': { base: 'planning', name: 'WhatsApp Booking & Reminders', category: 'WhatsApp Chat AI', iconSrc: '/apps/logo-planning.png?v=clean', tagline: 'Automated appointment scheduling, instant booking confirmations, and proactive reminders.' },
  'whatsapp-integrations': { base: 'studio', name: 'WhatsApp Integrations & Settings', category: 'WhatsApp Chat AI', iconSrc: '/apps/logo-studio.png?v=clean', tagline: 'Connect Meta Business accounts, configure webhooks, and sync data with your CRM.' },
  'whatsapp-integrations-settings': { base: 'studio', name: 'WhatsApp Integrations & Settings', category: 'WhatsApp Chat AI', iconSrc: '/apps/logo-studio.png?v=clean', tagline: 'Connect Meta Business accounts, configure webhooks, and sync data with your CRM.' },

  // Services (fallback aliases)
  'planning': { base: 'planning', name: 'Planning', category: 'Services', iconSrc: '/apps/logo-planning.png?v=clean', tagline: 'Shift scheduling, workload capacity, project allocation, and forecasting.' },
  'appointments': { base: 'planning', name: 'Appointments', category: 'Services', iconSrc: '/apps/logo-planning.png?v=clean', tagline: 'Online client booking calendar, automated SMS/email reminders, and calendar sync.' },
  'live-chat': { base: 'discuss', name: 'Live Chat', category: 'Services', iconSrc: '/apps/logo-discuss.png?v=clean', tagline: 'Real-time website visitor chat widget, instant routing, and lead qualification.' },

  // Productivity
  'artificial-intelligence': { base: 'ai', name: 'Artificial Intelligence', category: 'Productivity', iconSrc: '/apps/logo-ai.png?v=clean', tagline: 'Generative AI workflows, document parsing, automated reasoning, and smart agents.' },
  'voip': { base: 'helpdesk', name: 'VoIP', category: 'Productivity', iconSrc: '/apps/logo-helpdesk.png?v=clean', tagline: 'Browser-based softphone, call queues, call recording, and CRM popup.' },
  'iot': { base: 'studio', name: 'IoT', category: 'Productivity', iconSrc: '/apps/logo-studio.png?v=clean', tagline: 'Connect smart hardware, sensors, production lines, and barcode scanners.' }
};

export function getAppBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Direct match in APPS_DATA
  if (cleanSlug === 'projects' || cleanSlug === 'project') {
    return APPS_DATA.find(a => a.id === 'project');
  }
  const existing = APPS_DATA.find(a => a.slug === cleanSlug || a.id === cleanSlug);
  if (existing) return existing;

  // 2. Check rich service aliases
  if (SERVICE_ALIASES[cleanSlug]) {
    const alias = SERVICE_ALIASES[cleanSlug];
    const baseApp = APPS_DATA.find(a => a.id === alias.base || a.slug === alias.base) || APPS_DATA[0];
    return {
      ...baseApp,
      id: cleanSlug,
      slug: cleanSlug,
      name: alias.name,
      category: alias.category,
      iconSrc: alias.iconSrc || baseApp.iconSrc,
      tagline: alias.tagline,
      description: `Oxoo.ai ${alias.name} provides end-to-end tooling to streamline team productivity, eliminate repetitive tasks, and scale operations seamlessly.`
    };
  }

  // 3. Dynamic app descriptor for extended catalog apps
  const formattedName = cleanSlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    id: cleanSlug,
    slug: cleanSlug,
    name: formattedName,
    category: 'Productivity & Services',
    concept: `${formattedName} management and automated business workflows.`,
    mainColor: '#059669',
    bgColor: '#f0fdf4',
    iconSrc: `/apps/logo-accounting.png?v=clean`,
    svgSrc: `/app-logos/accounting.svg`,
    tagline: `Unified ${formattedName} management, real-time collaboration, and automated business operations.`,
    description: `Oxoo.ai ${formattedName} provides end-to-end tooling to streamline team productivity, eliminate repetitive tasks, and scale business operations seamlessly.`,
    features: ['Workflow Automation', 'Real-Time Sync', 'Custom Permissions', 'Audit Logging', 'Enterprise Export'],
    kpis: [
      { label: 'Active Items', value: '184', change: '+12.4%' },
      { label: 'Operations SLA', value: '99.8%', change: '+0.5%' },
      { label: 'Monthly Throughput', value: '1,420', change: '+18%' },
      { label: 'Hours Saved', value: '46 hrs', change: '+22%' }
    ],
    records: [
      { id: `${cleanSlug.slice(0, 3).toUpperCase()}-101`, entity: 'Apex Logistics Ltd', date: '2026-10-12', status: 'Completed' },
      { id: `${cleanSlug.slice(0, 3).toUpperCase()}-102`, entity: 'Metro Retailers', date: '2026-10-11', status: 'In Progress' },
      { id: `${cleanSlug.slice(0, 3).toUpperCase()}-103`, entity: 'BlueSky Cloud Corp', date: '2026-10-10', status: 'Pending Review' }
    ]
  };
}
