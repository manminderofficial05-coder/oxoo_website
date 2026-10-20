const categories = [
  {
    name: "Finance",
    slug: "finance",
    color: "blue",
    description: "Accounting, invoicing, and financial clarity.",
    services: ["Accounting", "Invoicing", "Expenses", "Sign", "Spreadsheet", "ESG"],
    sortOrder: 0,
    active: true
  },
  {
    name: "Sales",
    slug: "sales",
    color: "pink",
    description: "Turn customer relationships into growth.",
    services: ["CRM", "Sales", "Subscriptions", "POS Shop", "POS Restaurant", "Rental"],
    sortOrder: 1,
    active: true
  },
  {
    name: "Websites",
    slug: "websites",
    color: "cyan",
    description: "Build your digital presence and online store.",
    services: ["Website Builder", "eCommerce", "Events", "Blog", "eLearning", "Forum"],
    sortOrder: 2,
    active: true
  },
  {
    name: "Supply Chain",
    slug: "supply-chain",
    color: "orange",
    description: "Keep stock, purchasing, and operations connected.",
    services: ["Inventory", "Manufacturing", "Maintenance", "PLM", "Quality", "Purchase"],
    sortOrder: 3,
    active: true
  },
  {
    name: "Human Resources",
    slug: "human-resources",
    color: "purple",
    description: "Support your people through every stage.",
    services: ["Employees", "Payroll", "Recruitment", "Time Off", "Appraisals", "Fleet"],
    sortOrder: 4,
    active: true
  },
  {
    name: "Marketing",
    slug: "marketing",
    color: "rose",
    description: "Reach the right people with connected campaigns.",
    services: ["Social Marketing", "Email Marketing", "SMS Marketing", "Marketing Automation", "WhatsApp", "Surveys"],
    sortOrder: 5,
    active: true
  },
  {
    name: "Services",
    slug: "services",
    color: "green",
    description: "Deliver projects and customer support smoothly.",
    services: ["Project", "Timesheets", "Planning", "Appointments", "Live Chat", "Helpdesk"],
    sortOrder: 6,
    active: true
  },
  {
    name: "Productivity",
    slug: "productivity",
    color: "violet",
    description: "Automate routine work and connect your tools.",
    services: ["Artificial Intelligence", "Discuss", "VoIP", "IoT", "Documents", "Knowledge"],
    sortOrder: 7,
    active: true
  }
];

const serviceDescriptions = {
  "Accounting": "Manage full-cycle accounting, automated bank feeds, and real-time P&L reporting.",
  "Invoicing": "Generate and send professional GST-compliant invoices and collect faster payments.",
  "Expenses": "Track employee expenses, receipt uploads, approvals, and reimbursements.",
  "Sign": "Send, sign, and manage legally-binding e-signatures on contracts and proposals.",
  "Spreadsheet": "Build collaborative spreadsheets and live business dashboards with linked BI data.",
  "ESG": "Track corporate sustainability, environmental metrics, governance, and audit compliance.",

  "CRM": "Track leads, opportunities, pipeline stages, and revenue forecasts in one unified hub.",
  "Sales": "Convert quotes into sales orders, automate approvals, and manage price lists.",
  "Subscriptions": "Manage recurring subscriptions, automated billing cycles, churn, and MRR.",
  "POS Shop": "Lightning-fast point of sale with offline mode, barcode scanning, and multi-till support.",
  "POS Restaurant": "Floor plan management, kitchen order tickets (KOT), split billing, and table service.",
  "Rental": "Schedule rentals, manage equipment availability, track returns, and automate deposits.",

  "Website Builder": "Design stunning, mobile-responsive websites with drag-and-drop ease and SEO tools.",
  "eCommerce": "Launch high-converting online storefronts with cart, payment gateways, and inventory sync.",
  "Events": "Organize in-person and virtual events, sell tickets, manage badges, and agenda tracks.",
  "Blog": "Publish search-engine optimized articles, company news, and engage your readers.",
  "eLearning": "Create interactive video courses, quizzes, certifications, and student tracking.",
  "Forum": "Build a thriving customer and developer community with discussion boards and votes.",

  "Inventory": "Real-time multi-warehouse stock management, serial tracking, and automated replenishment.",
  "Manufacturing": "Bill of Materials (BOM), work orders, MRP scheduling, and shop floor management.",
  "Maintenance": "Preventive and corrective maintenance schedules for equipment, vehicles, and assets.",
  "PLM": "Manage product lifecycle, engineering change orders (ECO), and revision history.",
  "Quality": "Define control points, inspection plans, and automated quality checks across production.",
  "Purchase": "Automate purchase orders, vendor RFQs, supplier agreements, and incoming shipments.",

  "Employees": "Centralized employee directory, contracts, hierarchy, documents, and departmental roles.",
  "Payroll": "Automated salary disbursements, deductions, tax compliance, and payslip generation.",
  "Recruitment": "Kanban applicant tracking system (ATS), job boards, resumes, and interview scheduling.",
  "Time Off": "Manage employee leave requests, balances, approval workflows, and holiday calendars.",
  "Appraisals": "Periodic performance reviews, 360-degree feedback, OKRs, and employee growth plans.",
  "Fleet": "Manage corporate fleet vehicles, fuel logs, service history, and driver assignments.",

  "Social Marketing": "Schedule, publish, and analyze campaigns across LinkedIn, X, Meta, and Instagram.",
  "Email Marketing": "Design rich email newsletters, segment audiences, and monitor open/click rates.",
  "SMS Marketing": "Send high-priority transactional alerts and promotional SMS campaigns worldwide.",
  "Marketing Automation": "Build automated customer journeys, lead scoring, and targeted drip campaigns.",
  "WhatsApp": "Official WhatsApp Cloud API broadcasts, customer care bots, and order notifications.",
  "Surveys": "Create interactive feedback surveys, NPS scoring, and real-time sentiment analytics.",

  "Project": "Agile sprints, Gantt charts, task dependencies, milestone tracking, and deliverables.",
  "Timesheets": "Log billable hours, project time tracking, employee productivity, and invoicing.",
  "Planning": "Allocate team shifts, manage project workloads, capacity planning, and schedules.",
  "Appointments": "Self-service online booking calendar, automated reminders, and calendar sync.",
  "Live Chat": "Real-time visitor chat widget, lead capture, and instant support routing.",
  "Helpdesk": "Multi-channel support ticketing, SLA tracking, knowledge base, and customer ratings.",

  "Artificial Intelligence": "Generative AI workflows, document extraction, intelligent bots, and automation.",
  "Discuss": "Internal team chat, group channels, direct messaging, and video conferencing.",
  "VoIP": "Integrated web phone, call recording, dialers, and CRM customer screen pops.",
  "IoT": "Connect shop floor machines, sensors, cameras, and smart hardware to your business.",
  "Documents": "Paperless file management, OCR scanning, version control, and collaborative access.",
  "Knowledge": "Centralized team wiki, company SOPs, manuals, and searchable knowledge base."
};

const services = categories.flatMap((cat, ci) => cat.services.map((name, si) => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  category: cat.name,
  color: cat.color,
  description: serviceDescriptions[name] || `Practical ${name.toLowerCase()} solutions configured around your business workflow.`,
  featured: ['CRM', 'Accounting', 'eCommerce', 'Inventory', 'Artificial Intelligence', 'Website Builder', 'Project', 'Employees'].includes(name),
  sortOrder: ci * 10 + si,
  active: true
})));

module.exports = { categories, services };
