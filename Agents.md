# AGENTS.md — AI Agent Operating Manual & Engineering Protocols

> **Project:** Multiix / OXOO All-in-One Enterprise Business Platform  
> **Repository:** `oxoo_website` / `multiix`  
> **Primary Technology Stack:** React 19, Vite, Express.js (Node.js), Neon PostgreSQL, Framer Motion, Lucide React, PDFKit, Nodemailer/Brevo  
> **Last Updated:** October 2026  
> **Target Audience:** Autonomous AI Agents, Pair-Programming Assistants, and Engineering Contributors

---

## 1. Welcome & Agent Mission

Welcome, Agent. You are operating on **Multiix (OXOO)** — a modern, multi-tenant enterprise business software platform inspired by the clean, application-launcher aesthetic of Odoo. It unifies **24 core business applications** across Finance, Sales, Operations, HR, Customer Service, Marketing, and Productivity into a single cohesive SaaS architecture.

As an AI agent developing, modifying, or debugging this codebase, your core missions are:
1. **Maintain Architectural Integrity:** Strictly respect the architectural separation between the **Public Website**, the **Super Admin Dashboard**, the **Customer Portal**, the **Employee HRMS Suite**, and the **Embedded Live Demos**.
2. **Preserve Security Isolation:** Admin and Customer credentials, JWT tokens, and session stores must **never** collide or share state.
3. **Uphold the Zero Mock Data Mandate:** Dynamic data from PostgreSQL is the standard. If a table or view is empty, render clean, production-grade empty states with actionable call-to-actions, never static dummy records.
4. **Maintain Aesthetic & UX Excellence:** Preserve the pure canvas aesthetic, squircle app grid, micro-animations, accessible color contrasts, and responsive layouts.
5. **Keep Context Synchronized:** Whenever you introduce new features, database tables, API routes, or structural changes, you **must update** [Context.md](file:///e:/bennn/multiix/Context.md) and [Agents.md](file:///e:/bennn/multiix/Agents.md).

---

## 2. Repository Topology & Directory Map

```text
multiix/
├── backend/                             # Express.js REST API Server
│   ├── .env                             # Active backend environment variables
│   ├── .env.example                     # Environment template
│   ├── package.json                     # Backend dependencies (Express, pg, pdfkit, nodemailer, etc.)
│   ├── seed_modules.js                  # Standalone seeder for Admin Modules 1-4
│   ├── scripts/
│   │   └── seed.js                      # Main database initialization & seed script
│   └── src/
│       ├── adminModulesRoutes.js        # Dedicated router for Super Admin Modules 1-9 (1988 lines)
│       ├── agentRoutes.js               # Dedicated REST router for OXOO Agent AI endpoints
│       ├── agentService.js              # RAG knowledge retrieval, customer context, tool execution & LLM caller
│       ├── db.js                        # PostgreSQL connection pool (NeonDB), schema migration & helpers
│       ├── emailService.js              # Multi-tier email delivery (Resend/Brevo HTTPS -> SMTP -> Mock)
│       ├── invoicePdf.js                # PDFKit Tax Invoice & Receipt generator
│       ├── models/                      # Legacy Mongoose schema references (User, Lead, Org, etc.)
│       ├── seedData.js                  # Default categories and services catalog
│       └── server.js                    # Core Express server, API endpoints, and auth handlers (4800+ lines)
│
├── frontend/                            # React 19 + Vite Single Page Application
│   ├── .env                             # Frontend environment configuration
│   ├── .env.example                     # Frontend template
│   ├── index.html                       # HTML5 entrypoint with Google Fonts & meta tags
│   ├── package.json                     # React, Vite, Framer Motion, Lucide React dependencies
│   ├── setup_demo_routes.mjs            # Production build patch script for embedded demos
│   ├── public/                          # Static assets, branding, and icons
│   │   ├── apps/                        # App squircle launcher icons (logo-accounting.png, etc.)
│   │   ├── app-logos/                   # Custom SVG icons
│   │   ├── oxoo-brand-logo.png          # Primary OXOO branding logo
│   │   ├── oxoo-logo.png                # Clean standard logo
│   │   └── ai-demo/, hrms-demo/, ...    # Static embedded demo bundles
│   └── src/
│       ├── main.jsx                     # ReactDOM root mounting and HashRouter/BrowserRouter
│       ├── App.jsx                      # Route definitions, route guards, and hero launcher (1780+ lines)
│       ├── AdminDashboard.jsx           # 14-Module Super Admin Dashboard (9000+ lines)
│       ├── CustomerDashboard.jsx        # 8-View Customer Workspace & App Launcher (129k bytes)
│       ├── AdminLoginPage.jsx           # Super Admin login with rate limiting & brute-force defense
│       ├── CustomerLoginPage.jsx        # Customer portal login with 1-click demos & OTP
│       ├── EmployeeLoginPage.jsx        # Dedicated Employee Login for HRMS / Finance Suite
│       ├── ResetPasswordPage.jsx        # Forgot password token validation & password update
│       ├── CheckoutPage.jsx             # Plan pricing, GST, Razorpay checkout, PDF receipt download
│       ├── PricingPage.jsx              # Pricing calculator & plan comparisons
│       ├── HelpPage.jsx                 # Support tickets submission & knowledge base FAQ
│       ├── AllAppsDirectory.jsx         # 24-App searchable catalog with category tabs
│       ├── AppWorkspace.jsx             # In-app simulators for AI, POS, Discuss, etc.
│       ├── AppShowcase.jsx              # Deep-dive presentation view for individual apps
│       ├── PrimeProPortal.jsx           # Enterprise partner portal view
│       ├── api.js                       # Frontend API client library & localStorage accessors
│       ├── appsData.js                  # Full catalog data, features, KPIs, and demo records
│       ├── data.js                      # Categories, services, and industry metadata
│       ├── components.jsx               # Header, Footer, Hero, CTA, and Navigation components
│       ├── styles.css                   # Global core styling & responsive design rules
│       ├── dashboards.css               # Admin & Customer dashboard visual styles (4100+ lines)
│       ├── checkout.css                 # Checkout & payment step styling
│       ├── help.css                     # Help page & ticket center styling
│       ├── components/
│       │   ├── admin/                   # Modular Subcomponents for Admin Dashboard:
│       │   │   ├── ApplicationsModule.jsx       # Module 1: Apps health, versioning, toggling
│       │   │   ├── PaymentsInvoicesModule.jsx   # Module 2: Invoices, receipts, PDF export
│       │   │   ├── UsersRolesModule.jsx         # Module 3: RBAC, staff, invites, permissions
│       │   │   ├── SupportTicketsModule.jsx     # Module 4: Ticket queues, priority, replies
│       │   │   ├── ReportsAnalyticsModule.jsx   # Module 5: Revenue, ARR/MRR, customer churn
│       │   │   ├── EmailNotificationsModule.jsx # Module 6: SMTP logs, templates, test emails
│       │   │   ├── AuditLogsModule.jsx          # Module 7: Immutable audit trail with actor details
│       │   │   ├── IntegrationsModule.jsx       # Module 8: Webhook, payment gateway & DB sync
│       │   │   ├── SettingsModule.jsx           # Module 9: Global platform & security settings (incl. AI Agent tab)
│       │   │   └── NeedsContactModule.jsx       # Expiry warning & renewal follow-ups
│       │   └── agent/                   # OXOO Agent AI Customer Assistant:
│       │       ├── OxooAgentWidget.jsx          # Floating launcher button, chat window, RAG cards & confirmation
│       │       └── oxoo-agent.css               # Brand styling, animations, markdown layout & accessibility
│       └── demo/
│           ├── LiveDemoExperience.jsx           # Interactive multi-app demo switcher
│           ├── WebsiteDemoViewer.jsx            # Embedded iframe / container demo runner
│           └── demo.css                         # Demo container styling
│
├── demo/                                # Standalone demo source projects & prototypes
│   ├── ai-demo/
│   ├── hrms-demo/
│   ├── oxoo-finance-demo/
│   ├── sales-demo/
│   ├── supply_chain/
│   └── website-builder-demo/
│
├── render.yaml                          # Deployment specification for Render.com (Node + Static)
├── README.md                            # High-level product overview and introduction
├── schema.sql                           # Complete DDL SQL schema for Neon PostgreSQL database (29 tables)
├── SCHEMA.md                            # Complete Database Dictionary, ERD, and column specifications
├── Agents.md                            # [THIS FILE] AI Agent Operating Manual
└── Context.md                           # Deep Technical Architecture & Project Memory Bank
```

---

## 3. Core Agent Rules & Non-Negotiables

### Rule 1: Strict Session & Auth Isolation & Multi-Admin RBAC
The platform has a clear role hierarchy and authentication contexts. **Never mix or overwrite their tokens in `localStorage`**:
- **Super Administrator:**
  - Token Key: `oxoo_admin_token`
  - User Object Key: `oxoo_admin_user`
  - Route Guard: `AdminProtectedRoute` in [App.jsx](file:///e:/bennn/multiix/frontend/src/App.jsx)
  - Login Route: `/admin/login` or `/admin-login`
  - Backend Guard: `requireAdminAuth` middleware in [server.js](file:///e:/bennn/multiix/backend/src/server.js)
  - Authority: Full platform administration. Can create `Super Admin`, `Software Admin`, `Manager`, and `Employee` accounts.
- **Software Administrator:**
  - Role: `Software Admin`
  - Authority: Admin for assigned software suites (e.g., Website Builder, Accounting, HRMS).
  - Creation Boundary: Can **only** create `Manager` and `Employee` accounts (cannot create Super Admin or other Software Admins).
  - Data Isolation: Only sees data related to their assigned software or staff members they created (`created_by`).
- **Manager & Employee:**
  - Role: `Manager` and `Employee`
  - Purpose: Operational personnel used to manage websites, customer support tickets, and software operations.
  - Automated Credential Dispatch: When any admin creates a user, the system generates/accepts User ID and Password, hashes the password in `users` for instant authentication, records the staff profile in `platform_staff`, and automatically dispatches an HTML email containing the User ID, Password, and Login Link via [sendAdminStaffCredentialsEmail](file:///e:/bennn/multiix/backend/src/emailService.js).
- **Customer / Organization Member:**
  - Token Key: `oxoo_token`
  - User Object Key: `oxoo_user`
  - Route Guard: `CustomerProtectedRoute` in [App.jsx](file:///e:/bennn/multiix/frontend/src/App.jsx)
  - Login Route: `/customer/login`, `/signin`, or `/login`
  - Backend Guard: `verifyToken` middleware in [server.js](file:///e:/bennn/multiix/backend/src/server.js)
- **Employee (HRMS & Finance Suite):**
  - External HRMS URL: `https://oxoo-finance.onrender.com/`
  - Service Key Verification Endpoint: `GET /api/service-key/verify`
  - Auth Endpoint: `POST /api/auth/employee-login`
  - Finance Service Key: `OXOO-FIN-2026-SECURE-KEY` (configured via `OXOO_FINANCE_SERVICE_KEY`)

### Rule 2: Database Strategy & Query Patterns
- The database is **PostgreSQL** hosted on **NeonDB** using connection pooling via `pg.Pool` (`backend/src/db.js`).
- Never perform unparameterized queries. Always use `$1, $2, ...` query parameters to prevent SQL injection.
- Dynamic data fields are structured with PostgreSQL native types and `JSONB` for nested configuration (e.g., `features`, `details`, `replies`, `active_apps`).
- Handle offline / connection failures gracefully using resilient try/catch handlers and fallback responses so the frontend remains navigable even during local testing or database network hiccups.

### Rule 3: Zero Mock Data Mandate
- Earlier iterations relied on hardcoded mock arrays inside React components. In Commit `408c3b5`, **all dummy data was systematically removed** from the Admin Dashboard in favor of real PostgreSQL database records.
- If an endpoint returns 0 records, **never fabricate mock records**. Instead:
  - Display an elegant empty state component.
  - Explain clearly that no records were found.
  - Provide an action button (e.g., "Add New Application", "Create Support Ticket", "Invite Team Member").

### Rule 4: Visual Design & CSS Architecture
- **Design Aesthetic:** High-end, clean white canvas, pale cyan/emerald radial gradients, crisp dark navy headings (`#091322`, `#0f172a`), subtle borders (`#e2e8f0`), and curated accent colors.
- **Do not introduce TailwindCSS:** The application uses pure modern Vanilla CSS with CSS Grid, Flexbox, custom properties, and scoped stylesheets (`styles.css`, `dashboards.css`, `checkout.css`, `help.css`).
- **Animations:** Use `framer-motion` for page transitions, modals, and accordion collapses. Ensure interactive elements include subtle micro-interactions (`transform: translateY(-2px)`, smooth shadow elevations).
- **Icons:** Use `lucide-react` for all dynamic icons. App logos are located under `/apps/logo-<slug>.png?v=clean` or `/app-logos/<slug>.svg`.

### Rule 5: Email & Notification Reliability
- The backend features an automated multi-tier delivery pipeline in [emailService.js](file:///e:/bennn/multiix/backend/src/emailService.js):
  1. **Resend REST API (Port 443):** If `RESEND_API_KEY` is present.
  2. **Brevo REST API (Port 443):** If `BREVO_API_KEY` is present.
  3. **SMTP via Port 465 (SSL):** If `EMAIL_USER` and `EMAIL_APP_PASSWORD` are present.
  4. **SMTP via Port 587 (TLS):** Fallback port.
  5. **Console Mock Fallback:** Logs the email subject, OTP/credentials, and invoice metadata to `console.log` so registration or checkout never fails in dev environments.

### Rule 6: Pre-Build Demo Script Requirement
- In the frontend build pipeline (`npm run build`), Vite runs `node setup_demo_routes.mjs && vite build`.
- `setup_demo_routes.mjs` patches embedded Next.js static chunks in `public/ai-demo/` to bypass demo auth gates and inject auto-session keys. Never delete or bypass this script in production builds.

---

## 4. Developer Workflows & Commands

### Prerequisites
- Node.js `v18.x` or `v20.x`
- npm `v9+`
- PostgreSQL instance (NeonDB recommended, or local Postgres)

### 1. Starting Local Development
Run two terminal processes simultaneously:

**Terminal 1 — Backend API Server:**
```powershell
cd e:\bennn\multiix\backend
npm run dev
# Starts nodemon on http://localhost:5000
# Connects to Neon PostgreSQL and validates tables automatically
```

**Terminal 2 — Frontend Application:**
```powershell
cd e:\bennn\multiix\frontend
npm run dev
# Starts Vite dev server on http://localhost:5173
```

### 2. Database Seeding & Setup
To populate default categories, services, and admin records:
```powershell
cd e:\bennn\multiix\backend
npm run seed              # Runs scripts/seed.js (categories, services, initial apps)
node seed_modules.js      # Populates support tickets, applications, audit logs, and test data
```

### 3. Production Build Validation
Always test the frontend build before shipping changes:
```powershell
cd e:\bennn\multiix\frontend
npm run build
# Executes setup_demo_routes.mjs and generates bundle in frontend/dist/
```

### 4. Git Commit & Documentation Protocol
When completing a milestone or task:
1. Ensure your changes do not introduce linter errors or broken imports.
2. Verify both backend and frontend start cleanly.
3. Update [Context.md](file:///e:/bennn/multiix/Context.md) with any new routes, schema changes, or UI modules.
4. Record your change summary in the **Agent Contribution History** section below.
5. Commit with clear, descriptive conventional commit messages (e.g., `feat:`, `fix:`, `refactor:`).

---

## 5. Agent Contribution History & Evolution Changelog

The following chronological log documents all major agent-driven milestones and structural iterations in this repository:

| Commit Hash | Date | Author / Agent | Milestone Summary & Key Changes |
|---|---|---|---|
| `b4404e8` | Oct 2026 | AI Assistant | **10-View Customer Portal:** Created complete Customer Portal with custom logo branding, organization profile, billing management, active subscriptions, and app launcher. |
| `ed563f9` | Oct 2026 | AI Assistant | **11 Customer Portal Specifications:** Implemented full interactive customer specifications with dynamic forms, password reset modal, team management, and support ticket submission. |
| `82d6d33` | Oct 2026 | AI Assistant | **13-Page Super Admin Dashboard:** Built full-scale Super Admin portal with 13 functional modules, KPI counters, app enablement toggling, system status, and audit logging. |
| `408c3b5` | Oct 2026 | AI Assistant | **Zero Dummy Data Mandate:** Purged all hardcoded mock arrays across the Admin Dashboard. Migrated data fetching to live PostgreSQL queries with clean empty states. |
| `f5f3ed1` | Oct 2026 | AI Assistant | **System Status UI Fix:** Corrected System Status card layout, CSS grid alignment, and responsive badge positioning. |
| `37f00f4` | Oct 2026 | AI Assistant | **Strict Auth Isolation:** Completely segregated Admin (`oxoo_admin_token`) and Customer (`oxoo_token`) sessions, route guards, and backend authorization middleware. |
| `6bf9191` | Oct 2026 | AI Assistant | **Dynamic App Entitlements:** Implemented per-customer application licensing in the Customer Portal; added direct HRMS and Inventory navigation buttons in headers. |
| `c392b4e` | Oct 2026 | AI Assistant | **Cross-Suite Finance Service Key:** Created `OXOO_FINANCE_SERVICE_KEY` verification API; added `EmployeeLoginPage.jsx` linking to the external HRMS live suite. |
| `5858f0b` | Oct 2026 | AI Assistant | **Direct Admin Route Cleanup:** Streamlined customer redirection to `#/admin` and stripped service keys from query parameters to prevent leakage. |
| `febe4ee` | Oct 2026 | AI Assistant | **HRMS Navigation Target:** Configured employee HRMS launch targets to `https://oxoo-finance.onrender.com/` for production single-sign-on experience. |
| `07db95f` | Oct 24, 2026 | AI Assistant | **OXOO 360 Branding:** Added official OXOO 360 logo exclusively to homepage navbar while maintaining clean typography across subpages. |
| `7ca9123` | Oct 24, 2026 | AI Assistant | **Brand Asset Consolidation:** Cleaned legacy `multiix` logo files and standardized on `oxoo-360-logo-clean.png`. |
| `e19bd0e` | Oct 24, 2026 | AI Assistant | **Logo Optimization:** Compressed high-resolution logo PNGs from 1MB to 240KB to optimize Largest Contentful Paint (LCP). |
| `0b915ed` | Oct 24, 2026 | AI Assistant | **Navbar Cleanup:** Refined navbar component styles and removed duplicate logo wrappers. |
| `5f55e96` | Oct 27, 2026 | AI Assistant | **Full Enterprise Modules Suite:** <br>• Created `adminModulesRoutes.js` (1988 lines) & `backend/src/db.js` (1775 lines)<br>• Created 10 Admin module subcomponents (`ApplicationsModule`, `PaymentsInvoicesModule`, `UsersRolesModule`, `SupportTicketsModule`, `ReportsAnalyticsModule`, `EmailNotificationsModule`, `AuditLogsModule`, `IntegrationsModule`, `SettingsModule`, `NeedsContactModule`)<br>• Integrated Razorpay checkout order generation, GST tax breakdown, and instant customer registration<br>• Implemented automated PDF invoice generation with PDFKit (`invoicePdf.js`)<br>• Implemented Brevo & Resend HTTPS email delivery with SMS OTP verification (`emailService.js`)<br>• Added dedicated Help & Ticket submission center (`HelpPage.jsx`, `help.css`) |
| `PATCH-1` | Oct 27, 2026 | AI Assistant | **Users & Roles Sidebar Restoration & Neon Migration:** <br>• Restored missing `Users & Roles` navigation button in `AdminDashboard.jsx` sidebar, enabling multi-admin user management & RBAC.<br>• Created dedicated `backend/scripts/migrate_to_neon.js` and added `npm run migrate:neon` script.<br>• Seeded multiple administrator accounts in `platform_staff` (Super Admin, Finance Admin, Support Staff, Sales Staff). |
| `PATCH-2` | Oct 27, 2026 | AI Assistant | **Admin Data Deletion Capabilities & Safety Guards:** <br>• Implemented permanent deletion of staff users in `DELETE /api/admin/staff/:id` (removes from both `platform_staff` and `users` auth table, revokes JWT sessions).<br>• Added multi-layer safeguards preventing deletion of root Super Admin (`manminder.singh@primepro.ai`), active user sessions, and last remaining Super Admin.<br>• Added red "Delete" buttons and safety confirmation modal dialogs across Users & Administrators (`UsersRolesModule.jsx`), Applications (`ApplicationsModule.jsx`), and Support Tickets (`SupportTicketsModule.jsx`).<br>• Implemented backend deletion endpoints for Customers (`DELETE /api/admin/customers/:id`), Applications (`DELETE /api/admin/applications/:id`), and Tickets (`DELETE /api/admin/tickets/:id`). |
| `PATCH-3` | Oct 27, 2026 | AI Assistant | **Complete Database Schema Extraction & Documentation:** <br>• Generated complete live PostgreSQL DDL file `schema.sql` (618 lines covering all 26 tables, columns, constraints, and secondary indexes).<br>• Authored comprehensive `SCHEMA.md` with complete Entity-Relationship Diagrams (ERD), table dictionaries, JSONB schemas, and migration recipes.<br>• Added `npm run schema` generator script in `backend/package.json` (`backend/scripts/generate_schema.js`). |
| `DOC-ALIGN` | Oct 27, 2026 | AI Assistant | **Knowledge Base & Agent Alignment:** Created comprehensive `Agents.md` and `Context.md` memory files capturing complete project context, database schemas, API specs, and development rules. |
| `OXOO-AGENT` | Oct 27, 2026 | AI Assistant | **OXOO Agent (AI Customer Assistant) Implementation:** <br>• Built modern floating launcher button at bottom-right corner (`#0a192f`, `#2563eb`, `#06b6d4`) with pulse aura, tooltip, unread notification dot, and reduced-motion compliance.<br>• Built premium expandable chat panel (`OxooAgentWidget.jsx`, `oxoo-agent.css`) with markdown rendering, copy-to-clipboard, retry, message clearing with confirmation, and 8 suggested question chips.<br>• Implemented real database-grounded RAG engine (`agentService.js`, `agentRoutes.js`) querying Neon PostgreSQL (`applications`, `plans`, `services`, `customers`, `subscriptions`, `invoices`, `support_tickets`) with zero price hallucinations.<br>• Built secure authenticated customer context via JWT token (`oxoo_token`) for personal subscription/invoice lookup.<br>• Created server-side tool execution with explicit client confirmation modals before ticket creation (`support_tickets`) or lead inquiries (`leads`).<br>• Added AI configuration in Admin Dashboard (`SettingsModule.jsx`) with live analytics, masked keys, enable/disable toggle, suggested question manager, and audit event logs.<br>• Created tables `agent_conversations`, `agent_messages`, `agent_events` in Neon DB and updated `schema.sql`. |
| `BRAND-UPDATE` | Oct 27, 2026 | AI Assistant | **Brand Standardization to OXOO:** <br>• Standardized the entire platform brand name to **OXOO** across all customer-facing surfaces, admin dashboard, backend notifications, emails, reports, and documentation.<br>• Replaced all references to `OXOO 360` in frontend components (`SettingsModule.jsx`, `EmailNotificationsModule.jsx`, `ApplicationsModule.jsx`, `dashboards.css`), backend services (`server.js`, `emailService.js`, `agentService.js`, `adminModulesRoutes.js`, `db.js`), and database configuration records. |
| `ENH-SW-RENEW` | Oct 28, 2026 | AI Assistant | **5-Suite Catalog, Unrestricted Repurchase & 5-Day Renewal Lock:** <br>• Updated `CustomerDashboard.jsx` My Applications directory to display all 5 core software suites (`Finance Software`, `Sales Software`, `Supply Chain Software`, `Human Resources Software`, `Productivity Software`).<br>• Enabled software purchasing for logged-in users on `CheckoutPage.jsx`, removing duplicate blocks while preserving and merging active software.<br>• Enhanced subscription renewal flow to support multi-software subscriptions, displaying all active software and Custom Pack pricing.<br>• Enforced the 5-day expiration rule across frontend and backend (`/api/customer/renew-order`, `/api/customer/renew-subscription`), disabling renewal payments until 5 or fewer days remain before subscription expiry. |
| `FOOTER-DEMO-FLOW` | Oct 29, 2026 | AI Assistant | **OXOO.ai 5-Column Footer Redesign & Live Demo Request Flow:** <br>• Recreated `Footer` in `frontend/src/components.jsx` and `frontend/src/styles.css` with a 5-column desktop layout (Brand & Contact, Solutions, Live Demos, Company & Plans, Demo CTA Card), official SVG brand icons (LinkedIn, Instagram, YouTube, Facebook, X), Bengaluru contact details, and live `/api/health` cloud status indicator.<br>• Created central demo routing allowlist and flow configuration in `frontend/src/demoConfig.js`.<br>• Built dedicated `/request-demo` page (`frontend/src/RequestDemoPage.jsx`) and informational routes (`frontend/src/InfoPages.jsx` for `/about`, `/careers`, `/partners`, `/privacy`, `/terms`, `/security`, `/compliance`).<br>• Implemented `POST /api/demo-requests` in `backend/src/server.js` and `sendDemoRequestNotificationEmail` in `backend/src/emailService.js` with strict validation, spam/honeypot protection, PostgreSQL persistence (`demo_inquiries` & `leads`), and explicit `"Continue to Demo"` launch flow. |
| `GEO-USD-ISOLATION` | Oct 29, 2026 | AI Assistant | **Client Location Header Indicator, Global USD Pricing Outside India & Indian Account Region Lock:** <br>• Updated `CountryCurrencySelector` (`frontend/src/components.jsx`) with `CountryFlagBadge` (`flagcdn.com` graphic + country code + currency pill) to eliminate duplicate `"IN IN"` emoji text rendering on Windows.<br>• Enhanced `RegionPricingContext.jsx` and `GET /api/geo/detect` (`backend/src/server.js`) with 3-tier client location detection (Backend CDN/IP, direct browser Geo-IP via `api.country.is`, and IANA timezone inference).<br>• Standardized `frontend/src/pricingConfig.js` and `backend/src/pricingConfig.js` so `IN` displays and bills in `INR ₹`, while **every** country outside India (`US`, `GB`, `AE`, `CA`, `AU`, `SG`, `DE`, `FR`, `JP`, `GLOBAL`, or any ISO country code) displays its detected country flag/code while billing and showing prices in **US Dollars (`USD $`)** (`$20/yr`, `$25/mo` Standard Pack; `$40/yr`, `$50/mo` Custom Pack).<br>• Enforced regional account isolation across `authStorage.js`, `CustomerLoginPage.jsx`, `App.jsx` (`CustomerProtectedRoute`), `CheckoutPage.jsx`, `api.js`, and `backend/src/server.js` (`POST /api/auth/login`, `POST /api/auth/register`, `GET /api/customer/overview`, `GET /api/customer/check-email-software`, `POST /api/payment/create-order`) so Indian accounts (`INR ₹` / `country = 'India'`) cannot be used outside India (`403 INDIAN_ACCOUNT_OUTSIDE_INDIA`). |
| `PROJECTS-HUB` | Oct 29, 2026 | AI Assistant | **Unified Projects Hub, Service Catalogue & Project Request Management:** <br>• Replaced `Industries` with `Projects` in the main desktop and mobile navbar (`frontend/src/components.jsx`, `frontend/src/styles.css`) and built a 3-column keyboard-accessible **Projects Mega Menu** covering 18 services across `Websites & Apps`, `Marketing`, and `WhatsApp Chat AI`, plus `"Have a project in mind? — Start Your Project →"`.<br>• Created dedicated `/projects` route (`frontend/src/ProjectsPage.jsx`, `frontend/src/projects.css`, `frontend/src/projectsConfig.js`) with Hero composition, 18 selectable service cards with multi-service selection persistence, **Option A: Request a Consultation Call (`Talk to Our Team`)** with live slot availability & `Call Now`, and **Option B: Submit a Project Request (`Fill Project Requirements`)** 4-step wizard with validated attachment uploads (`PDF`, `PNG`, `JPG`, `WEBP`, `DOC`, `DOCX`, `TXT` up to 5 MB).<br>• Created PostgreSQL tables `project_requests`, `project_attachments`, and `consultation_requests` (`backend/src/db.js`, `schema.sql`, `backend/src/models/ProjectRequest.js`) and REST routers (`backend/src/projectRoutes.js`, `backend/src/emailService.js`).<br>• Built **Project Management & Consultation Hub** (`frontend/src/components/admin/ProjectManagementModule.jsx`) in `AdminDashboard.jsx` with 6 real-time KPI cards, Section A (Project Requests) & Section B (Consultation Requests), search/filter/sort/pagination, secure attachment downloads, CSV export, status workflows, team assignment, private internal notes, and appointment confirmation/rescheduling history. |
| `PROJECTS-EMAIL-STICKY-FOOTER` | Oct 29, 2026 | AI Assistant | **Customer Email Details Notification, Sticky Scope Bar Auto-Clear, Footer Logo `.ai` Removal & Option Card Reordering:** <br>• Updated `sendProjectRequestNotificationEmail` and `sendConsultationRequestNotificationEmail` in `backend/src/emailService.js` to dispatch full submitted detail tables (Name, Email, Phone, Country, Services, Categories, Title, Budget, Timeline, Slot, Brief) to customer's email, with a dedicated callout card for making changes/updates via direct email reply, `hello@oxoo.ai`, or `+91 79 4050 0100`.<br>• Updated `frontend/src/ProjectsPage.jsx` so submitting a project request or consultation call automatically clears `selectedServices` (`setSelectedServices([])`) and `sessionStorage`, ensuring the sticky selection scope bar is hidden upon submission and confirmation screen display.<br>• Reordered engagement switcher cards so **Option A · Discovery Call (`Request a Consultation Call`)** appears first on the left, and **Option B · Structured Brief (`Submit a Project Request`)** appears second on the right.<br>• Updated `Footer` in `frontend/src/components.jsx` and `frontend/src/styles.css` removing the `.ai` text suffix from the logo, rendering only the clean `OXOO` logo image. |
| `PROJECTS-DATES-LOCATION-BUDGET` | Oct 29, 2026 | AI Assistant | **Project Form Date Removal & Location-Aware Single-Currency Budget:** <br>• Removed `Preferred Project Start Date` and `Expected Completion Date (if known)` fields from Option B project wizard in `frontend/src/ProjectsPage.jsx`.<br>• Implemented location-aware single-currency budget selection (`BUDGET_RANGES_INR` vs `BUDGET_RANGES_USD` in `frontend/src/projectsConfig.js`): visitors in India see only Indian Rupees (`₹`), while visitors outside India see only US Dollars (`$`) without mixing or displaying both. |
| `VALIDATION-RESPONSIVE-ALL` | Oct 29, 2026 | AI Assistant | **Universal 10-Digit Mobile & Strict Email Validation & Responsive Viewport Optimizations:** <br>• Standardized strict 10-digit mobile number validation (`/^[0-9]{10}$/`, `maxLength={10}`, `inputMode="numeric"`, non-digit stripping) across all customer-facing forms (`ProjectsPage.jsx`, `RequestDemoPage.jsx`, `CheckoutPage.jsx`, `HelpPage.jsx`, `CustomerLoginPage.jsx`) and backend routers (`projectRoutes.js`, `server.js`).<br>• Standardized strict email regex validation (`/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`) across all forms and APIs.<br>• Enhanced responsive viewports in `frontend/src/projects.css`, adding fluid touch targets (min-height 44px), mobile-safe input font sizing (16px to prevent iOS auto-zoom), full-width hero action buttons, responsive sticky scope bars, and clear spacing on screens from 320px to 1400px. |
| `PRICE-580-TO-560` | Oct 29, 2026 | AI Assistant | **Universal Price Standardization (580 to 560):** <br>• Updated all yearly and additional software plan pricing from ₹580 to ₹560 across frontend and backend single-source-of-truth configurations (`frontend/src/pricingConfig.js`, `backend/src/pricingConfig.js`).<br>• Updated `PricingPage.jsx` module configurations and plan fallbacks from 580 to 560.<br>• Updated `CheckoutPage.jsx` plan calculation fallbacks and annual billing summary pills from 580 to 560.<br>• Updated test suite verification in `backend/scripts/test_regional_pricing.js` to assert ₹560/mo (billed ₹6,720 + GST). |
| `HOMEPAGE-VIDEO-UPDATE` | Oct 30, 2026 | AI Assistant | **Homepage Video Updates & Audio Mute/Unmute Toggle:** <br>• Updated "Level up your quality of work" section video to `/oxoo_home.mp4`.<br>• Updated "Native AI across all your business" section video to `/oxoo_website.mp4`.<br>• Preserved identical sleek video player card and scrubber design while adding an Audio On/Off toggle button (`Volume2` / `VolumeX`) with hover feedback. |

---

## 6. How to Extend This Project (Step-by-Step Recipes)

### Recipe A: Adding a New Business Application
1. **Define the Application in Catalog:** Open [appsData.js](file:///e:/bennn/multiix/frontend/src/appsData.js) and add the new app object with `id`, `slug`, `name`, `category`, `mainColor`, `bgColor`, `iconSrc`, `tagline`, `description`, `features`, `kpis`, and sample `records`.
2. **Update the Hero Launcher Grid:** In [App.jsx](file:///e:/bennn/multiix/frontend/src/App.jsx), update `HERO_APP_CARDS` with the app slug, label, icon path, and without-Multiix price comparison.
3. **Database Registration:** Insert or seed the app record into the `applications` and `platform_applications` PostgreSQL tables in [db.js](file:///e:/bennn/multiix/backend/src/db.js).
4. **Workspace / Simulator:** Add interactive workspace logic in [AppWorkspace.jsx](file:///e:/bennn/multiix/frontend/src/AppWorkspace.jsx) if the application features a live demo simulator.

### Recipe B: Adding a New Super Admin Module
1. **Create Subcomponent:** Add `frontend/src/components/admin/YourNewModule.jsx`. Use the standard styling classes from `dashboards.css`.
2. **Register Tab in AdminDashboard:** In [AdminDashboard.jsx](file:///e:/bennn/multiix/frontend/src/AdminDashboard.jsx):
   - Add the navigation button in the left sidebar nav.
   - Import and render your subcomponent when `activeTab === 'your-module'`.
3. **Add Backend Endpoints:** In [adminModulesRoutes.js](file:///e:/bennn/multiix/backend/src/adminModulesRoutes.js), register your module routes under `/api/admin/your-module/*`. Protect them with `requireAdminAuth`.
4. **Log Audit Trail:** Ensure state changes call `logAuditAction()` in `adminModulesRoutes.js` to preserve immutable audit logging.

### Recipe C: Updating Customer Entitlements
- App entitlements are stored in the `customers.selected_apps` (`JSONB`) and `organizations.active_apps` columns.
- The Customer Portal in [CustomerDashboard.jsx](file:///e:/bennn/multiix/frontend/src/CustomerDashboard.jsx) dynamically reads `customerData.selected_apps`.
- To grant or revoke apps, call `PUT /api/admin/customers/:id/subscription` or update the record via the Admin Customers tab.

### Recipe D: OXOO Agent (AI Customer Assistant) Customization & Knowledge Engine
1. **Knowledge Grounding:**
   - [agentService.js](file:///e:/bennn/multiix/backend/src/agentService.js) pulls live applications (`applications`), published pricing plans (`plans`), service categories (`categories`), and services (`services`) from Neon PostgreSQL with a 60-second cache.
   - When plans or apps are updated in the Admin Dashboard, the cache invalidates and the agent immediately reflects the new pricing.
2. **Dual-Tier AI Fallback:**
   - **Tier 1 (External LLM):** If `AI_API_KEY` is present in `backend/.env`, calls Google Gemini or OpenAI with a strict system prompt containing live database context.
   - **Tier 2 (Database-Grounded RAG Engine):** If no API key is configured or the external model is unreachable, the built-in deterministic RAG engine maps customer intent to exact database records, pricing tables, checkout buttons, and support cards.
3. **Admin Settings & Analytics:**
   - Authorized admins can change agent name, toggle enabled/disabled status, update welcome messages and suggested questions, configure rate limits, and view usage metrics in [SettingsModule.jsx](file:///e:/bennn/multiix/frontend/src/components/admin/SettingsModule.jsx) under the `OXOO Agent (AI)` tab.
   - All settings are saved in PostgreSQL `platform_settings` under category `'agent'`.
