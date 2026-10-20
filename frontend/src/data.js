import {
  Wallet, Users, Globe, Boxes, UserRound, Megaphone, BriefcaseBusiness, BrainCircuit,
  Calculator, Receipt, ChartNoAxesCombined, CreditCard, ShoppingCart, UserRoundSearch,
  Building2, Package, Factory, BadgeCheck, CalendarCheck, ClipboardList, Mail, MessageCircle,
  Workflow, FileText, Headset, Bot, Cloud, Plug, Code2, GraduationCap, Stethoscope,
  Store, Hotel, House, Wrench, HeartHandshake, FileCheck, PhoneCall, Radio, FileSpreadsheet,
  Leaf, Clock, Award, Car
} from 'lucide-react';

export const categories = [
  {
    name: 'Finance',
    color: 'blue',
    icon: Wallet,
    description: 'Accounting, invoicing, and financial clarity.',
    services: ['Accounting', 'Invoicing', 'Expenses', 'Sign', 'Spreadsheet', 'ESG']
  },
  {
    name: 'Sales',
    color: 'pink',
    icon: Users,
    description: 'Turn customer relationships into growth.',
    services: ['CRM', 'Sales', 'Subscriptions', 'POS Shop', 'POS Restaurant', 'Rental']
  },
  {
    name: 'Websites',
    color: 'cyan',
    icon: Globe,
    description: 'Build your digital presence and online store.',
    services: ['Website Builder', 'eCommerce', 'Events', 'Blog', 'eLearning', 'Forum']
  },
  {
    name: 'Supply Chain',
    color: 'orange',
    icon: Boxes,
    description: 'Keep stock, purchasing, and operations connected.',
    services: ['Inventory', 'Manufacturing', 'Maintenance', 'PLM', 'Quality', 'Purchase']
  },
  {
    name: 'Human Resources',
    color: 'purple',
    icon: UserRound,
    description: 'Support your people through every stage.',
    services: ['Employees', 'Payroll', 'Recruitment', 'Time Off', 'Appraisals', 'Fleet']
  },
  {
    name: 'Marketing',
    color: 'rose',
    icon: Megaphone,
    description: 'Reach the right people with connected campaigns.',
    services: ['Social Marketing', 'Email Marketing', 'SMS Marketing', 'Marketing Automation', 'WhatsApp', 'Surveys']
  },
  {
    name: 'Services',
    color: 'green',
    icon: BriefcaseBusiness,
    description: 'Deliver projects and customer support smoothly.',
    services: ['Project', 'Timesheets', 'Planning', 'Appointments', 'Live Chat', 'Helpdesk']
  },
  {
    name: 'Productivity',
    color: 'violet',
    icon: BrainCircuit,
    description: 'Automate routine work and connect your tools.',
    services: ['Artificial Intelligence', 'Discuss', 'VoIP', 'IoT', 'Documents', 'Knowledge']
  }
];

const iconMap = {
  // Finance
  'Accounting': Calculator,
  'Invoicing': Receipt,
  'Expenses': Wallet,
  'Sign': FileCheck,
  'Spreadsheet': FileSpreadsheet,
  'ESG': Leaf,

  // Sales
  'CRM': Users,
  'Sales': ChartNoAxesCombined,
  'Subscriptions': Receipt,
  'POS Shop': Store,
  'POS Restaurant': Store,
  'Rental': ShoppingCart,

  // Websites
  'Website Builder': Globe,
  'eCommerce': ShoppingCart,
  'Events': CalendarCheck,
  'Blog': FileText,
  'eLearning': GraduationCap,
  'Forum': MessageCircle,

  // Supply Chain
  'Inventory': Package,
  'Manufacturing': Factory,
  'Maintenance': Wrench,
  'PLM': Boxes,
  'Quality': BadgeCheck,
  'Purchase': ShoppingCart,

  // Human Resources
  'Employees': UserRound,
  'Payroll': Calculator,
  'Recruitment': UserRoundSearch,
  'Time Off': CalendarCheck,
  'Appraisals': Award,
  'Fleet': Car,

  // Marketing
  'Social Marketing': Megaphone,
  'Email Marketing': Mail,
  'SMS Marketing': MessageCircle,
  'Marketing Automation': Workflow,
  'WhatsApp': MessageCircle,
  'Surveys': ClipboardList,

  // Services
  'Project': ClipboardList,
  'Timesheets': Clock,
  'Planning': CalendarCheck,
  'Appointments': CalendarCheck,
  'Live Chat': MessageCircle,
  'Helpdesk': Headset,

  // Productivity
  'Artificial Intelligence': Bot,
  'Discuss': MessageCircle,
  'VoIP': PhoneCall,
  'IoT': Radio,
  'Documents': FileText,
  'Knowledge': BrainCircuit
};

const descriptions = {
  // Finance
  'Accounting': 'Manage full-cycle accounting, automated bank feeds, and real-time P&L reporting.',
  'Invoicing': 'Generate and send professional GST-compliant invoices and collect faster payments.',
  'Expenses': 'Track employee expenses, receipt uploads, approvals, and reimbursements.',
  'Sign': 'Send, sign, and manage legally-binding e-signatures on contracts and proposals.',
  'Spreadsheet': 'Build collaborative spreadsheets and live business dashboards with linked BI data.',
  'ESG': 'Track corporate sustainability, environmental metrics, governance, and audit compliance.',

  // Sales
  'CRM': 'Track leads, opportunities, pipeline stages, and revenue forecasts in one unified hub.',
  'Sales': 'Convert quotes into sales orders, automate approvals, and manage price lists.',
  'Subscriptions': 'Manage recurring subscriptions, automated billing cycles, churn, and MRR.',
  'POS Shop': 'Lightning-fast point of sale with offline mode, barcode scanning, and multi-till support.',
  'POS Restaurant': 'Floor plan management, kitchen order tickets (KOT), split billing, and table service.',
  'Rental': 'Schedule rentals, manage equipment availability, track returns, and automate deposits.',

  // Websites
  'Website Builder': 'Design stunning, mobile-responsive websites with drag-and-drop ease and SEO tools.',
  'eCommerce': 'Launch high-converting online storefronts with cart, payment gateways, and inventory sync.',
  'Events': 'Organize in-person and virtual events, sell tickets, manage badges, and agenda tracks.',
  'Blog': 'Publish search-engine optimized articles, company news, and engage your readers.',
  'eLearning': 'Create interactive video courses, quizzes, certifications, and student tracking.',
  'Forum': 'Build a thriving customer and developer community with discussion boards and votes.',

  // Supply Chain
  'Inventory': 'Real-time multi-warehouse stock management, serial tracking, and automated replenishment.',
  'Manufacturing': 'Bill of Materials (BOM), work orders, MRP scheduling, and shop floor management.',
  'Maintenance': 'Preventive and corrective maintenance schedules for equipment, vehicles, and assets.',
  'PLM': 'Manage product lifecycle, engineering change orders (ECO), and revision history.',
  'Quality': 'Define control points, inspection plans, and automated quality checks across production.',
  'Purchase': 'Automate purchase orders, vendor RFQs, supplier agreements, and incoming shipments.',

  // Human Resources
  'Employees': 'Centralized employee directory, contracts, hierarchy, documents, and departmental roles.',
  'Payroll': 'Automated salary disbursements, deductions, tax compliance, and payslip generation.',
  'Recruitment': 'Kanban applicant tracking system (ATS), job boards, resumes, and interview scheduling.',
  'Time Off': 'Manage employee leave requests, balances, approval workflows, and holiday calendars.',
  'Appraisals': 'Periodic performance reviews, 360-degree feedback, OKRs, and employee growth plans.',
  'Fleet': 'Manage corporate fleet vehicles, fuel logs, service history, and driver assignments.',

  // Marketing
  'Social Marketing': 'Schedule, publish, and analyze campaigns across LinkedIn, X, Meta, and Instagram.',
  'Email Marketing': 'Design rich email newsletters, segment audiences, and monitor open/click rates.',
  'SMS Marketing': 'Send high-priority transactional alerts and promotional SMS campaigns worldwide.',
  'Marketing Automation': 'Build automated customer journeys, lead scoring, and targeted drip campaigns.',
  'WhatsApp': 'Official WhatsApp Cloud API broadcasts, customer care bots, and order notifications.',
  'Surveys': 'Create interactive feedback surveys, NPS scoring, and real-time sentiment analytics.',

  // Services
  'Project': 'Agile sprints, Gantt charts, task dependencies, milestone tracking, and deliverables.',
  'Timesheets': 'Log billable hours, project time tracking, employee productivity, and invoicing.',
  'Planning': 'Allocate team shifts, manage project workloads, capacity planning, and schedules.',
  'Appointments': 'Self-service online booking calendar, automated reminders, and calendar sync.',
  'Live Chat': 'Real-time visitor chat widget, lead capture, and instant support routing.',
  'Helpdesk': 'Multi-channel support ticketing, SLA tracking, knowledge base, and customer ratings.',

  // Productivity
  'Artificial Intelligence': 'Generative AI workflows, document extraction, intelligent bots, and automation.',
  'Discuss': 'Internal team chat, group channels, direct messaging, and video conferencing.',
  'VoIP': 'Integrated web phone, call recording, dialers, and CRM customer screen pops.',
  'IoT': 'Connect shop floor machines, sensors, cameras, and smart hardware to your business.',
  'Documents': 'Paperless file management, OCR scanning, version control, and collaborative access.',
  'Knowledge': 'Centralized team wiki, company SOPs, manuals, and searchable knowledge base.'
};

export const services = categories.flatMap((category, ci) => category.services.map((name, si) => ({
  name,
  category: category.name,
  color: category.color,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  icon: iconMap[name] || BriefcaseBusiness,
  description: descriptions[name] || `Practical ${name.toLowerCase()} solutions configured around your business workflow.`,
  featured: ['CRM', 'Accounting', 'eCommerce', 'Inventory', 'Artificial Intelligence', 'Website Builder', 'Project', 'Employees'].includes(name),
  index: ci * 10 + si
})));

export const industries = [
  { name: 'Retail', icon: Store, image: 'photo-1441986300917-64674bd600d8', desc: 'Grow your retail business with smart tools and unified inventory.' },
  { name: 'Manufacturing', icon: Factory, image: 'photo-1567789884554-0b844b597180', desc: 'Streamline production planning, shop-floor and supply chain operations.' },
  { name: 'Healthcare', icon: Stethoscope, image: 'photo-1576091160399-112ba8d25d1d', desc: 'Manage healthcare operations, appointments and records efficiently.' },
  { name: 'Food & Hospitality', icon: Hotel, image: 'photo-1414235077428-338989a2e8c0', desc: 'Simplify restaurant, ordering, guest and hotel operations.' },
  { name: 'Real Estate', icon: House, image: 'photo-1486406146926-c627a92ad1ab', desc: 'Manage properties, leases, sales pipelines and client relationships.' },
  { name: 'Education', icon: GraduationCap, image: 'photo-1523050854058-8df90110c9f1', desc: 'Digital solutions, student portals and modern learning administration.' },
  { name: 'Construction', icon: Building2, image: 'photo-1541888946425-d0fbb1861593', desc: 'Project and resource management, contractor tracking and site budgeting.' },
  { name: 'Professional Services', icon: BriefcaseBusiness, image: 'photo-1521791136064-7986c2920216', desc: 'Tools for consultants, billing, time-tracking and service firms.' },
  { name: 'Nonprofit', icon: HeartHandshake, image: 'photo-1559027615-cd4628902d4a', desc: 'Empower non-profits with donation, donor and digital tools.' }
];
