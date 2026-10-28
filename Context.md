# CONTEXT.md — Multiix & OXOO Architectural & Domain Knowledge Bank

> **Project Name:** Multiix — All-in-One Business Software Platform (OXOO)  
> **Repository:** `oxoo_website` / `multiix`  
> **Deployment Platform:** Render.com (Backend Web Service + Static Frontend)  
> **Database:** Neon PostgreSQL (Serverless / Pooled)  
> **Last Comprehensive Audit:** October 2026  
> **Maintainer / Organization:** PrimePro.ai / Oxoo.ai Core Team  

---

## 1. Project Identity, Mission & Evolution

### 1.1 The Multiix & OXOO Vision
**Multiix** is a high-performance, modular enterprise software platform inspired by the clean, application-launcher aesthetic of Odoo.com. It is designed to replace costly, fragmented SaaS toolchains by consolidating **24 core business applications** across Finance, Sales, Operations, HR, Customer Service, Marketing, and Productivity into a single cohesive, multi-tenant cloud environment.

### 1.2 Brand Evolution: Multiix to OXOO
The project initially launched under the codename **Multiix**. During development, the platform standardized on the flagship brand **OXOO** (also referenced as `Oxoo.ai` or `OXOO Multi-App Suite`). The official platform brand is strictly **OXOO**:
- **Core Engine & Architecture:** Retains the `multiix` workspace identifier, package namespace, and filesystem conventions.
- **Client-Facing Brand:** Standardized on **OXOO** with custom antialiased brand assets (`/oxoo-brand-logo.png`, `/oxoo-logo.png`).
- **Cross-Software Integration:** Interoperates with external OXOO suites (e.g., OXOO Finance & HRMS deployed at `https://oxoo-finance.onrender.com/`) through a shared cryptographic service key: `OXOO_FINANCE_SERVICE_KEY = 'OXOO-FIN-2026-SECURE-KEY'`.

---

## 2. High-Level System Architecture

```mermaid
graph TD
    Client["Web Browser / Client Device"]
    
    subgraph "Frontend Layer (React 19 + Vite)"
        PublicWeb["Public Marketing & Hero Launcher (/)]
        AppShowcase["App Showcases & Workspaces (/apps/:slug)"]
        CustomerPortal["Customer Portal (/customer, /dashboard)"]
        AdminDashboard["Super Admin Dashboard (/admin)"]
        EmployeeLogin["Employee Portal (/employee/login)"]
        Checkout["Checkout & Payment (/checkout)"]
        HelpCenter["Help & Ticket Submission (/help)"]
        EmbeddedDemos["Embedded Live Demos (/demo/*)"]
    end
    
    subgraph "API Gateway Layer (Express.js on Node.js)"
        AuthRouter["Auth Router (JWT, Bcrypt, Rate Limiter)"]
        PublicRouter["Public Router (Apps, Services, Leads, Health)"]
        CustomerRouter["Customer Router (Billing, Team, Tickets, Overview)"]
        AdminRouter["Admin Router (14 Modules in adminModulesRoutes.js)"]
        PaymentRouter["Payment Router (Razorpay, Pricing Calc, Invoices)"]
        ServiceKeyRouter["Service Key Verification Router"]
    end
    
    subgraph "Data & Persistence Layer"
        PostgresPool["Neon PostgreSQL Connection Pool (pg.Pool)"]
        Tables["Relational Tables (users, customers, subscriptions, invoices, tickets, audit_logs, ...)"]
        JSONB["JSONB Columns (dynamic features, active_apps, replies, details)"]
    end
    
    subgraph "External Cloud Integrations"
        NeonDB["Neon Cloud PostgreSQL"]
        Brevo["Brevo HTTPS REST API (Port 443)"]
        Resend["Resend HTTPS REST API (Port 443)"]
        GmailSMTP["Nodemailer Fallback SMTP (Ports 465/587)"]
        Razorpay["Razorpay Payment Gateway API"]
        ExternalHRMS["OXOO Finance & HRMS (oxoo-finance.onrender.com)"]
    end
    
    Client --> PublicWeb
    Client --> CustomerPortal
    Client --> AdminDashboard
    Client --> EmployeeLogin
    Client --> Checkout
    Client --> HelpCenter
    Client --> EmbeddedDemos
    
    PublicWeb --> PublicRouter
    CustomerPortal --> CustomerRouter
    AdminDashboard --> AdminRouter
    EmployeeLogin --> ServiceKeyRouter
    Checkout --> PaymentRouter
    HelpCenter --> PublicRouter
    
    AuthRouter --> PostgresPool
    PublicRouter --> PostgresPool
    CustomerRouter --> PostgresPool
    AdminRouter --> PostgresPool
    PaymentRouter --> PostgresPool
    
    PostgresPool --> NeonDB
    PaymentRouter --> Razorpay
    AdminRouter --> Brevo
    AdminRouter --> Resend
    AdminRouter --> GmailSMTP
    EmployeeLogin --> ExternalHRMS
```

---

## 3. The 24 Business Applications Specification

The homepage hero showcases a 6-column by 4-row **Squircle App Launcher**. Every application is fully documented in [appsData.js](file:///e:/bennn/multiix/frontend/src/appsData.js) and routes to `/apps/:appSlug`:

| Row | App ID / Slug | App Name | Business Category | Without Multiix Price | Core Features | Primary Color |
|---|---|---|---|---|---|---|
| **1** | `accounting` | Accounting | Finance | ₹3,500/mo | Bank reconciliation, GST invoices, P&L, balance sheets | `#2563eb` |
| **1** | `knowledge` | Knowledge | Productivity | ₹1,800/mo | Company wiki, SOPs, rich-text editor, AI search | `#9333ea` |
| **1** | `sign` | Sign | Operations | ₹2,200/mo | Digital signatures, PDF contracts, audit certificates | `#059669` |
| **1** | `crm` | CRM | Sales | ₹4,500/mo | Pipeline management, lead scoring, deal forecasts | `#ea580c` |
| **1** | `studio` | Studio | Productivity | ₹5,000/mo | Custom fields, no-code app builder, UI workflow editor | `#0891b2` |
| **1** | `subscriptions`| Subscriptions | Finance | ₹2,800/mo | Recurring billing, churn analytics, auto-renewals | `#4f46e5` |
| **2** | `ai` | AI | Productivity | ₹3,000/mo | Enterprise trend analysis, LLM automation, reasoning | `#7c3aed` |
| **2** | `pos` | Point of Sale | Sales | ₹3,800/mo | Touch register, barcode scan, offline carts, receipts | `#d97706` |
| **2** | `discuss` | Discuss | Productivity | ₹1,500/mo | Direct messaging, channel chats, video calls, mentions | `#0284c7` |
| **2** | `documents` | Documents | Operations | ₹1,900/mo | Cloud file vault, OCR indexing, version retention | `#475569` |
| **2** | `projects` | Project | Operations | ₹3,200/mo | Kanban boards, Gantt charts, subtasks, milestones | `#16a34a` |
| **2** | `timesheets` | Timesheets | Operations | ₹1,600/mo | Billable time trackers, timer clock, project sync | `#ca8a04` |
| **3** | `field-service`| Field Service | Operations | ₹4,000/mo | Route mapping, on-site job dispatch, mobile work orders | `#0d9488` |
| **3** | `planning` | Planning | Operations | ₹2,500/mo | Employee shift planner, capacity allocations, holidays | `#8b5cf6` |
| **3** | `helpdesk` | Helpdesk | Customer Service | ₹3,500/mo | Ticket queues, SLA timers, customer satisfaction CSAT | `#e11d48` |
| **3** | `ecommerce` | eCommerce | Sales | ₹4,900/mo | Product catalog, shopping cart, discounts, gateways | `#db2777` |
| **3** | `website` | Website | Marketing | ₹2,900/mo | Drag-and-drop website builder, SEO tags, forms | `#2563eb` |
| **3** | `email-marketing`| Email Marketing | Marketing | ₹3,100/mo | Automated newsletters, open tracking, drip campaigns | `#9333ea` |
| **4** | `purchase` | Purchase | Operations | ₹2,700/mo | RFQ generation, vendor POs, goods receipt matching | `#059669` |
| **4** | `inventory` | Inventory | Operations | ₹4,800/mo | Multi-warehouse tracking, stock transfers, barcode scan | `#ea580c` |
| **4** | `manufacturing`| Manufacturing | Operations | ₹6,500/mo | BOM recipe creation, work center routings, MRP | `#0284c7` |
| **4** | `sales` | Sales | Sales | ₹4,200/mo | Quotation templates, sales orders, e-signature dispatch | `#16a34a` |
| **4** | `hr` | HR | Human Resources | ₹3,800/mo | Employee directory, leave requests, attendance, payroll | `#ca8a04` |
| **4** | `dashboard` | Dashboard | Operations | ₹2,400/mo | Executive BI metrics, real-time widget builder, charts | `#4f46e5` |

---

## 4. Portals & Application Subsystems

### 4.1 Public Website & Hero Launcher (`/`)
- **Visual Foundation:** Pure white canvas with subtle cyan radial highlights, pastel squircle cards, and modern typography.
- **Hero Comparison Feature:** Interactive toggle `"Imagine without Multiix"` switches each app card to display traditional legacy license costs (e.g., Salesforce, QuickBooks, Zendesk), tallying a total enterprise savings of over **₹85,000/month**.
- **Embedded Video Showcase:** Smooth, auto-looping product demonstration video with custom play/pause scrubber and duration controls.
- **Searchable Catalog (`/apps`, `/all-apps`):** Real-time category filtering across 8 business domains (`Finance`, `Sales`, `Operations`, `Human Resources`, `Customer Service`, `Marketing`, `Productivity`, `Administration`) with instant search and ESC key reset.

### 4.2 Super Admin Dashboard (`/admin`)
The Super Admin Dashboard in [AdminDashboard.jsx](file:///e:/bennn/multiix/frontend/src/AdminDashboard.jsx) is a 15-tab executive portal driven by [adminModulesRoutes.js](file:///e:/bennn/multiix/backend/src/adminModulesRoutes.js):

1. **Dashboard (`dashboard`):** Real-time KPI summaries (Total Revenue, Active Customers, Subscriptions, Demo Sessions), dynamic ARR Growth Chart, System Health monitors, and real-time activity log.
2. **Customers Directory (`customers`):** Full customer CRUD, status toggling (`Active`, `Suspended`, `Trial`), contact information, renewal dates, and app licensing entitlements.
3. **Users & Roles (`users`):** Complete Role-Based Access Control (RBAC) & Multi-Admin Management. Super Admins can view all staff, add/invite new admin users across multiple roles (`Super Admin`, `Finance Admin`, `Support Staff`, `Sales Staff`), set granular permissions, and toggle account activation.
4. **Needs Contact (`needs`):** Dedicated module displaying subscriptions expiring within 7, 15, or 30 days, follow-up call history, sales notes, and manual reminder dispatch.
5. **Subscriptions Lifecycle (`subscriptions`):** Plan tracking, MRR, auto-renewal switches, billing cycles (`monthly`, `yearly`), and reminder audit trails.
6. **Payments & Invoices (`payments`):** Invoice generation, transaction history, payment verification, and automated PDF downloads.
7. **Products & Plans (`products`):** Catalog management for SaaS bundles, feature lists, pricing adjustments, and subscriber counts.
8. **Applications Management (`applications`):** Enable/disable any of the 24 apps, monitor latency, track version numbers, and schedule maintenance modes.
9. **Demo Analytics (`demo-analytics`):** Real-time event tracking capturing user sessions, email identities, user agents, IP addresses, and app interaction counts.
10. **Support Tickets (`tickets`):** Helpdesk queue management, priority sorting (`Urgent`, `High`, `Medium`, `Low`), customer-staff conversation threads, and resolution SLAs.
11. **Reports & Analytics (`reports`):** Revenue trends, customer acquisition cost, MRR/ARR projections, and churn diagnostics.
12. **Email & Notifications (`email`):** Brevo & SMTP logs, delivery rate metrics, template editor, and test email trigger console.
13. **Audit Logs (`audit`):** Immutable, timestamped trail of all administrator actions, actor emails, IP addresses, target resources, and event parameters.
14. **Integrations (`integrations`):** Webhook endpoints, Razorpay credentials status, cloud database connectivity, and external ERP sync.
15. **Settings (`settings`):** Global tenant profile, session timeouts, branding logos, password policies, and system-wide configurations.

### 4.3 Customer Portal (`/customer`, `/dashboard`)
A dedicated self-service workspace in [CustomerDashboard.jsx](file:///e:/bennn/multiix/frontend/src/CustomerDashboard.jsx) with 8 views:
- **Dashboard Overview:** Displays cloud storage usage, active apps count, billing status, and quick launch shortcuts.
- **My Apps (`apps`):** Interactive squircle launcher showing only the customer's purchased and licensed applications, with one-click workspace access.
- **Billing & Subscriptions (`billing`):** Invoices list, subscription plan details, renewal countdown, and direct upgrade pathways.
- **Team Management (`team`):** Manage organization seats, invite colleagues, assign roles (`Admin`, `Member`, `Viewer`), and set granular app permissions.
- **Support Center (`support`):** Raise technical or billing support tickets, monitor ticket statuses, and view staff replies.
- **Usage Reports (`reports`):** Department-level usage analytics and login logs.
- **Notifications (`notifications`):** Centralized bell inbox for payment receipts, renewal warnings, and platform announcements.
- **Account Settings (`settings`):** Company branding, contact details, timezone, and self-service password reset.

### 4.4 Employee Portal & Finance Service Key
- **Employee Login (`/employee/login`, `/hrms/login`):** Enables company employees to authenticate with Work Email or Employee ID.
- **External HRMS Linkage:** Directs employees to `https://oxoo-finance.onrender.com/` for full-featured attendance, leave management, and payroll.
- **Shared Service Key:** Backend route `GET /api/service-key/verify` validates the `OXOO_FINANCE_SERVICE_KEY` across all external applications.

### 4.5 Embedded Live Demos (`/demo/*`)
A zero-friction evaluation sandbox allowing visitors to test live apps without registration:
- `/demo/ai` — Interactive enterprise AI reasoning console.
- `/demo/sales` — Live CRM deal stage simulator.
- `/demo/hrms` — Interactive employee onboarding and attendance manager.
- `/demo/finance` — Real-time ledger, invoice generator, and P&L viewer.
- `/demo/supply-chain` — Inventory movements and procurement routing.
- `/demo/website` — Drag-and-drop website layout builder.

### 4.6 Checkout, Invoicing & Payment Flow (`/checkout`)
- **Dynamic Pricing Engine:** Calculates subtotal, 18% GST (CGST 9% + SGST 9%), discounts, and annual savings.
- **Indian Rupee Formatting:** Generates automated amount-in-words (e.g., *"Rupees Twenty-Nine Thousand Four Hundred and Ninety-Eight Only"*).
- **Payment Gateway:** Integrates with Razorpay for order creation (`POST /api/payment/create-order`) and signature verification (`POST /api/payment/verify`).
- **Instant Provisioning:** Successful payment automatically creates customer records, seeds organization entitlements, issues a unique Storage ID (e.g., `STG-08643413`), and generates an automated Tax Invoice PDF.
- **PDF Generation & Email Dispatch:** Uses `PDFKit` in [invoicePdf.js](file:///e:/bennn/multiix/backend/src/invoicePdf.js) to build a tax-compliant PDF receipt and dispatches it via Brevo/Resend with login credentials.

---

## 5. PostgreSQL Database Schema Reference

The database is powered by **Neon PostgreSQL** ([backend/src/db.js](file:///e:/bennn/multiix/backend/src/db.js)). The schema includes the following tables:

### 5.1 Core Tables
1. **`users`**
   - `id` (SERIAL PRIMARY KEY), `name` (VARCHAR 120), `email` (VARCHAR 255 UNIQUE), `password` (VARCHAR 255 - Bcrypt), `role` (VARCHAR 50 - `super_admin`, `admin`, `orgadmin`, `member`, `customer`), `organization` (VARCHAR 255), `active` (BOOLEAN), `storage_id` (VARCHAR 100), `reset_token` (VARCHAR 255), `reset_token_expires` (TIMESTAMPTZ), `last_login` (TIMESTAMPTZ), `created_at`, `updated_at`.
2. **`customers`**
   - `id` (SERIAL PRIMARY KEY), `customer_id` (VARCHAR 50 UNIQUE), `company_name` (VARCHAR 255), `contact_person` (VARCHAR 150), `email` (VARCHAR 255 UNIQUE), `phone` (VARCHAR 50), `country` (VARCHAR 100), `industry` (VARCHAR 120), `plan` (VARCHAR 100), `account_status` (VARCHAR 50), `subscription_status` (VARCHAR 50), `payment_status` (VARCHAR 50), `joined_date` (TIMESTAMPTZ), `renewal_date` (TIMESTAMPTZ), `selected_apps` (JSONB), `amount` (NUMERIC 12,2), `billing_cycle` (VARCHAR 20).
   - Indexes: `idx_customers_email`, `idx_customers_phone`, `idx_customers_customer_id`.
3. **`subscriptions`**
   - `id` (SERIAL PRIMARY KEY), `subscription_id` (VARCHAR 50 UNIQUE), `customer_id` (VARCHAR 50), `org_id` (INT), `company_name` (VARCHAR 255), `plan` (VARCHAR 100), `amount` (NUMERIC 12,2), `currency` (VARCHAR 10), `billing_cycle` (VARCHAR 20), `status` (VARCHAR 50), `auto_renewal` (BOOLEAN), `start_date` (TIMESTAMPTZ), `renewal_date` (TIMESTAMPTZ), `warning_date` (TIMESTAMPTZ), `renewal_warning_status` (VARCHAR 50), `followup_status` (VARCHAR 50), `assigned_to` (VARCHAR 120), `last_email_sent` (TIMESTAMPTZ), `notes` (TEXT), `active_apps` (JSONB).
4. **`invoices`**
   - `id` (SERIAL PRIMARY KEY), `invoice_number` (VARCHAR 100 UNIQUE), `company_name` (VARCHAR 255), `plan` (VARCHAR 100), `amount` (NUMERIC 12,2), `currency` (VARCHAR 10), `status` (VARCHAR 50), `invoice_date` (TIMESTAMPTZ), `due_date` (TIMESTAMPTZ), `pdf_url` (VARCHAR 255), `items` (JSONB).
5. **`orders`**
   - `id` (SERIAL PRIMARY KEY), `order_number` (VARCHAR 100 UNIQUE), `company_name` (VARCHAR 255), `customer_name` (VARCHAR 150), `customer_email` (VARCHAR 255), `customer_phone` (VARCHAR 50), `plan_name` (VARCHAR 100), `selected_apps` (JSONB), `subtotal` (NUMERIC 12,2), `tax_amount` (NUMERIC 12,2), `discount_amount` (NUMERIC 12,2), `total_amount` (NUMERIC 12,2), `payment_method` (VARCHAR 50), `payment_id` (VARCHAR 100), `status` (VARCHAR 50), `storage_id` (VARCHAR 100).
6. **`support_tickets`**
   - `id` (SERIAL PRIMARY KEY), `ticket_number` (VARCHAR 50 UNIQUE), `ticket_id` (VARCHAR 50), `customer_id` (VARCHAR 50), `company_name` (VARCHAR 255), `user_name` (VARCHAR 120), `user_email` (VARCHAR 255), `subject` (VARCHAR 255), `category` (VARCHAR 100), `priority` (VARCHAR 20), `status` (VARCHAR 50), `assigned_to` (VARCHAR 120), `description` (TEXT), `replies` (JSONB).
7. **`audit_logs`**
   - `id` (SERIAL PRIMARY KEY), `action` (VARCHAR 255), `target` (VARCHAR 255), `user_name` (VARCHAR 120), `actor_name` (VARCHAR 120), `actor_email` (VARCHAR 255), `actor_role` (VARCHAR 50), `resource_type` (VARCHAR 100), `resource_id` (VARCHAR 100), `ip` / `ip_address` (VARCHAR 100), `result` (VARCHAR 50), `duration_ms` (INT), `details` (JSONB), `created_at` (TIMESTAMPTZ).
8. **`platform_applications` & `applications`**
   - `id` (VARCHAR 100 PRIMARY KEY), `slug` (VARCHAR 100 UNIQUE), `name` (VARCHAR 150), `category` (VARCHAR 100), `main_color` (VARCHAR 50), `icon_src` (VARCHAR 255), `tagline` (VARCHAR 255), `features` (JSONB), `enabled` (BOOLEAN), `status` (VARCHAR 50), `health_status` (VARCHAR 50), `version` (VARCHAR 50), `active_tenants` (INT), `uptime_percent` (NUMERIC 5,2).
9. **`demo_events`**
   - `id` (SERIAL PRIMARY KEY), `event_type` (VARCHAR 50), `session_id` (VARCHAR 100), `user_name` (VARCHAR 150), `user_email` (VARCHAR 255), `company_name` (VARCHAR 255), `app_slug` (VARCHAR 100), `duration_seconds` (INT), `ip` (VARCHAR 100), `user_agent` (TEXT), `created_at` (TIMESTAMPTZ).
10. **`leads`**
    - `id` (SERIAL PRIMARY KEY), `name` (VARCHAR 120), `email` (VARCHAR 255), `phone` (VARCHAR 50), `company` (VARCHAR 160), `service` (VARCHAR 160), `message` (TEXT), `status` (VARCHAR 50), `assigned_to` (VARCHAR 120), `details` (JSONB).
11. **`team_members`**
    - `id` (SERIAL PRIMARY KEY), `company_name` (VARCHAR 255), `name` (VARCHAR 120), `email` (VARCHAR 255), `role` (VARCHAR 50), `status` (VARCHAR 50), `apps_access` (JSONB).
12. **`subscription_reminders` & `subscription_followup_notes`**
    - Tracking tables for automated expiration notices, idempotency keys, call logs, promised payment dates, and sales notes.
13. **`platform_staff`**
    - `id` (SERIAL PRIMARY KEY), `employee_id` (VARCHAR 50 UNIQUE), `name` (VARCHAR 150), `email` (VARCHAR 255 UNIQUE), `phone` (VARCHAR 50), `role` (VARCHAR 50 - `Super Admin`, `Software Admin`, `Manager`, `Employee`), `department` (VARCHAR 100), `status` (VARCHAR 50), `access_level` (VARCHAR 50), `permissions` (JSONB), `assigned_software` (JSONB), `created_by` (VARCHAR 150), `joined_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
    - **Multi-Admin RBAC Rules:**
      - **Super Admin:** Root authority; can create Super Admins, Software Admins, Managers, and Employees. Has platform-wide data visibility.
      - **Software Admin:** Scoped administrator for designated software suites; can **only** create `Manager` and `Employee` accounts. Data query is isolated to their assigned scope or staff they created (`created_by`).
      - **Manager & Employee:** Operational accounts used to manage websites, customer support tickets, and software operations.
      - **Automated Credentials Dispatch:** Upon account creation via `/api/admin/staff`, User ID and Password are generated/supplied, the user is created in both `users` and `platform_staff`, and login credentials + access URL are automatically emailed to the user via Brevo/Resend/Nodemailer.

---

## 6. Comprehensive API Endpoint Registry

### 6.1 Authentication & Profile APIs
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user / customer organization | No |
| `POST` | `/api/auth/login` | Authenticate customer/member, returns JWT | No |
| `POST` | `/api/auth/admin-login` | Authenticate Super Admin (rate-limited, 20 req/15min) | No |
| `POST` | `/api/auth/employee-login` | Authenticate employee for HRMS / Finance Suite | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & entitlements | Bearer (`oxoo_token` / `oxoo_admin_token`) |
| `POST` | `/api/auth/send-otp` | Send email/SMS verification OTP | No |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit OTP code | No |
| `POST` | `/api/auth/forgot-password` | Generate password reset token and dispatch email | No |
| `POST` | `/api/auth/reset-password` | Validate reset token and update password | No |
| `POST` | `/api/customer/change-password` | Self-service password change from portal | Bearer (`oxoo_token`) |

### 6.2 Public Catalog & Marketing APIs
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Gateway health and database connection status | No |
| `GET` | `/api/apps` | Fetch all 24 applications in specified display order | No |
| `GET` | `/api/apps/:slug` | Fetch single application details, features, and KPIs | No |
| `GET` | `/api/categories` | Fetch category taxonomy | No |
| `GET` | `/api/services` | Fetch consulting services catalog | No |
| `POST` | `/api/leads` | Submit enterprise contact enquiry or demo booking | No |
| `POST` | `/api/help/tickets` | Submit support ticket from public help center | No |
| `POST` | `/api/demo/event` | Log live demo interactions, logins, and session stats | No |
| `GET` | `/api/service-key/verify` | Verify shared `OXOO_FINANCE_SERVICE_KEY` | Header/Query key |

### 6.3 Customer Portal APIs
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/customer/overview` | Fetch customer dashboard KPIs, apps, storage quota | Optional Bearer |
| `GET` | `/api/customer/billing` | Fetch invoices and subscription lifecycle | Optional Bearer |
| `POST` | `/api/customer/upgrade` | Request plan upgrade or seat expansion | Optional Bearer |
| `GET` | `/api/customer/team` | Fetch organization team members | Optional Bearer |
| `POST` | `/api/customer/team` | Add team member with role & app permissions | Optional Bearer |
| `DELETE` | `/api/customer/team/:id` | Remove team member | Optional Bearer |
| `GET` | `/api/customer/tickets` | Fetch customer support tickets | Optional Bearer |
| `POST` | `/api/customer/tickets` | Create support ticket with category & priority | Optional Bearer |

### 6.4 Super Admin APIs (`/api/admin/*` - Protected by `requireAdminAuth`)
| Method | Endpoint | Module | Description |
|---|---|---|---|
| `GET` | `/api/admin/overview` | Dashboard | Aggregated platform metrics, health, apps count |
| `GET` | `/api/admin/metrics` | Dashboard | Financial summary, total ARR, active subscriptions |
| `GET` | `/api/admin/revenue-chart` | Dashboard | Monthly revenue graph data |
| `GET` | `/api/admin/growth-chart` | Dashboard | 6-month growth trend data |
| `GET` | `/api/admin/system-status` | Dashboard | Live server latency, database, and gateway status |
| `GET` | `/api/admin/customers` | Customers | Paginated customer list with search and filters |
| `GET` | `/api/admin/customers/:id` | Customers | Full customer detail view |
| `PUT` | `/api/admin/customers/:id/status` | Customers | Toggle customer status (`Active`, `Suspended`) |
| `PUT` | `/api/admin/customers/:id/subscription` | Customers | Update plan and licensed applications array |
| `GET` | `/api/admin/subscriptions` | Subscriptions | All subscriptions with renewal tracking |
| `GET` | `/api/admin/subscriptions/warnings-followups` | Needs Contact | Subscriptions requiring renewal follow-up |
| `POST` | `/api/admin/subscriptions/:id/send-reminder` | Needs Contact | Dispatch manual renewal email notice |
| `POST` | `/api/admin/subscriptions/:id/notes` | Needs Contact | Append follow-up phone call / sales note |
| `GET` | `/api/admin/applications` | Applications | Applications health, status, version list |
| `PUT` | `/api/admin/applications/:id` | Applications | Toggle app status or maintenance mode |
| `GET` | `/api/admin/payments/invoices` | Payments | Invoices list with payment status and PDF link |
| `POST` | `/api/admin/payments/invoices` | Payments | Create manual invoice |
| `GET` | `/api/admin/support/tickets` | Tickets | Support ticket queue with filter & SLA flags |
| `POST` | `/api/admin/support/tickets/:id/reply` | Tickets | Post staff reply to support ticket |
| `GET` | `/api/admin/email/logs` | Email | Dispatched email log with Brevo/SMTP status |
| `POST` | `/api/admin/email/test` | Email | Trigger diagnostic test email |
| `GET` | `/api/admin/audit-logs` | Audit Logs | Immutable security activity logs with IP & actor |
| `GET` | `/api/admin/integrations` | Integrations | Gateway status, API keys, webhook health |
| `GET` | `/api/admin/settings` | Settings | Fetch platform security & operational policies |
| `PUT` | `/api/admin/settings` | Settings | Save updated platform settings |
| `DELETE` | `/api/admin/staff/:id` | Users & Roles | Permanently delete staff user from `platform_staff` & `users` auth table (with root admin protection) |
| `DELETE` | `/api/admin/customers/:id` | Customers | Permanently delete customer record and associated subscriptions |
| `DELETE` | `/api/admin/applications/:id` | Applications | Permanently delete application from `platform_applications` & `applications` |
| `DELETE` | `/api/admin/tickets/:id` | Support Tickets | Permanently delete support ticket and all conversation replies |
| `DELETE` | `/api/admin/leads/:id` | Needs Contact | Delete sales lead / demo contact enquiry |

### 6.5 Checkout & Billing APIs
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/pricing/plans` | Fetch standard SaaS plans | No |
| `POST` | `/api/pricing/calculate` | Compute subtotal, GST (18%), discount, and total | No |
| `POST` | `/api/payment/create-order` | Create Razorpay payment order and reserve record | No |
| `POST` | `/api/payment/verify` | Verify Razorpay HMAC signature, provision account, create customer, generate PDF | No |
| `GET` | `/api/payment/invoice/:orderNumber` | Download or view generated Tax Invoice PDF | No |

---

## 7. Frontend State & Authentication Architecture

### 7.1 LocalStorage Keys
To prevent security leaks, all client-side sessions are isolated using specific keys:

| LocalStorage Key | Scope | Content Description |
|---|---|---|
| `oxoo_admin_token` | Super Admin | Bearer JWT token issued by `/api/auth/admin-login` |
| `oxoo_admin_user` | Super Admin | Serialized JSON containing `{ id, name, email, role: 'super_admin' }` |
| `oxoo_token` | Customer | Bearer JWT token issued by `/api/auth/login` |
| `oxoo_user` | Customer | Serialized JSON containing `{ id, name, email, role: 'customer', organization, plan, selected_apps }` |
| `hospital-cart-demo:session` | Embedded Demos | Auto-session flag injected by `setup_demo_routes.mjs` to bypass static demo auth walls |

### 7.2 Route Protection Guards in [App.jsx](file:///e:/bennn/multiix/frontend/src/App.jsx)
- **`AdminProtectedRoute`:** Reads `oxoo_admin_token` and `oxoo_admin_user`. Requires `role === 'admin' || role === 'super_admin'`. Redirects unauthorized visits to `/admin-login`.
- **`CustomerProtectedRoute`:** Reads `oxoo_token` and `oxoo_user`. Requires active customer session. Redirects unauthorized visits to `/customer-login`.

---

## 8. Environment Variables & Secrets Reference

### Backend (`backend/.env`)
```ini
# Core Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:5173,https://multiix.onrender.com

# PostgreSQL Neon Database Connection String (Serverless Pooled)
DATABASE_URL=postgresql://neondb_owner:<password>@<host>/neondb?sslmode=require&channel_binding=require

# Authentication Secrets
JWT_SECRET=oxoo-super-secret-jwt-key-2026
ADMIN_API_KEY=oxoo-admin-master-key-2026
OXOO_FINANCE_SERVICE_KEY=OXOO-FIN-2026-SECURE-KEY

# Payment Gateway Configuration
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...

# Email Delivery Pipeline (Brevo / Resend / SMTP)
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=manminder.singh@primepro.ai
RESEND_API_KEY=re_...
EMAIL_USER=notifications@oxoo.in
EMAIL_APP_PASSWORD=...

# SMS OTP Configuration (Fast2SMS)
ENABLE_SMS_OTP=false
FAST2SMS_API_KEY=...

# OXOO Agent AI Model Configuration
AI_PROVIDER=gemini
AI_API_KEY=your_server_side_secret
AI_MODEL=gemini-1.5-flash
```


### Frontend (`frontend/.env`)
```ini
# API Gateway Target
VITE_API_URL=http://localhost:5000

# External HRMS Portal Link
VITE_HRMS_EMPLOYEE_LOGIN_URL=https://oxoo-finance.onrender.com/
```

---

## 9. Deployment Architecture (Render.com)

The project is configured for one-click deployment via [render.yaml](file:///e:/bennn/multiix/render.yaml):

1. **Backend Web Service (`oxoo-backend`):**
   - Runtime: Node.js (Version 18+)
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Automatically handles HTTPS termination, CORS whitelisting, and rate-limiting.

2. **Frontend Static Site (`oxoo-website`):**
   - Runtime: Static
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build` (runs `setup_demo_routes.mjs` followed by `vite build`)
   - Static Publish Directory: `dist`
   - SPA Rewrite Rule: `/* -> /index.html` (preserves React Router v7 client navigation).
   - Environment Binding: `VITE_API_URL` automatically connects to the `oxoo-backend` service host.

---

## 10. OXOO Agent — AI Customer Assistant Architecture

The platform features **OXOO Agent**, an AI-powered conversational assistant integrated across public website pages and the Customer Portal:

### 10.1 Frontend Floating Widget & Chat Panel
- **Launcher:** Floating circular icon fixed at bottom-right (`#0a192f` navy to `#0284c7` cyan gradient) with official OXOO mark, dedicated glowing AI badge, and pulse animation.
- **Chat Window (`OxooAgentWidget.jsx`):**
  - Online live backend status badge.
  - Safe markdown message renderer for lists, headers, bold, and clickable internal route links (`/all-apps`, `/pricing`, `/checkout`, `/help`).
  - Interactive Action Cards: Plan comparison cards with direct checkout triggers and Support Ticket Draft confirmation cards.
  - Suggested questions carousel (8 core business questions).
  - Conversation controls: minimize, restart/clear history with confirmation, copy-to-clipboard, retry on failure.
  - Full keyboard accessibility and responsive mobile bottom-sheet styling (`oxoo-agent.css`).

### 10.2 Backend RAG Knowledge Engine & LLM Pipeline (`agentService.js`, `agentRoutes.js`)
- **Live Grounding Source of Truth:** Direct relational queries against Neon PostgreSQL (`applications`, `plans`, `services`, `categories`, `customers`, `invoices`, `support_tickets`). Zero hallucinations.
- **Hybrid AI Pipeline:**
  1. **Tier 1 (External LLM):** If `AI_API_KEY` (Gemini or OpenAI) is configured, calls the model securely server-side with compiled DB grounding context and user history.
  2. **Tier 2 (Intelligent Database RAG Engine):** If external API key is not configured or fails, smoothly falls back to verified database intent matching, ensuring 100% uptime with official database pricing, catalog records, and action cards.
- **Tenant Isolation:** Authenticated customer sessions (via `oxoo_token` Bearer header) can query their own subscriptions, renewal dates, and invoices. Anonymous visitors are strictly guided to sign in.
- **Consequential Actions Safeguard:** Any ticket creation or lead submission is drafted as an action card and requires explicit customer confirmation before executing `POST /api/agent/action/confirm` to persist into `support_tickets` or `leads`.

### 10.3 Database Schema & Audit Persistence
- `agent_conversations`: Tracks conversation sessions, user emails, message count, and timestamps.
- `agent_messages`: Stores user and assistant messages, markdown text, and structured action payloads.
- `agent_events`: Audit trail for chat turns, confirmed actions, and errors.
- `platform_settings ('agent')`: Stores admin configuration (enabled status, welcome text, suggested questions, provider/model settings with masked secrets, rate limits, retention policy).

### 10.4 Admin Management & Real Analytics (`SettingsModule.jsx`)
- Accessible in the Admin Dashboard under the **OXOO Agent (AI)** settings tab.
- Allows administrators to toggle agent availability, customize welcome message and suggested questions, configure AI providers and models, set rate limits and retention policies, and view real usage analytics (Total Chats, Messages, Confirmed Tickets, and live event log table).

---

## 11. Operational Gotchas & Engineering Guardrails

1. **Never Bypass `setup_demo_routes.mjs`:** The embedded demos (`/demo/*`) originate from static Next.js export artifacts. Without the regex patch executed during `npm run build`, visiting demo routes will trigger infinite sign-in redirect loops.
2. **Never Reintroduce Dummy Data:** All admin metrics, tickets, customers, subscriptions, and AI agent knowledge are wired to PostgreSQL. Maintain empty states when records are zero; never hardcode fallback dummy lists in React components.
3. **Cross-Origin Resource Policy (CORP):** Express uses Helmet with `{ crossOriginResourcePolicy: { policy: 'cross-origin' } }` so embedded iframes and PDF invoice viewers can load assets without browser blocking.
4. **GST Tax Calculation Math:** Indian GST is 18% inclusive for standard SaaS checkouts. Subtotal is `total / 1.18`, total tax is `total - subtotal`, and CGST/SGST are exact halves. Always format amounts with 2 decimal places.
5. **Session Segregation Testing:** When testing locally, logging in as an Admin stores credentials in `oxoo_admin_*`, which does not authorize `/customer`. To test the Customer Portal, log in separately via `/signin` or use an Incognito window.
6. **No Client-Side Secrets:** Never place database connection strings, Gemini/OpenAI API keys, or JWT secrets in client code or Vite `.env`. All AI and database queries must pass through server-side authenticated endpoints.

---

## 12. Software Catalog, Repurchase & Renewal Rules

1. **5 Core Software Modules:**
   - `Finance Software` (`finance`): Accounting, Invoicing, Expenses, Sign, Spreadsheet, ESG
   - `Sales Software` (`sales`): CRM, Sales, Subscriptions, POS Shop, POS Restaurant, Rental
   - `Supply Chain Software` (`supply-chain`): Inventory, Manufacturing, Maintenance, PLM, Quality, Purchase
   - `Human Resources Software` (`human-resources`): Employees, Payroll, Recruitment, Time Off, Appraisals, Fleet
   - `Productivity Software` (`productivity`): Artificial Intelligence, Discuss, VoIP, IoT, Documents, Knowledge
2. **Repurchase for Logged-In Customers:**
   - Logged-in customers are fully enabled to purchase any software suite on Checkout without restrictions or duplicate blocking. Existing active software is marked with an informative badge and merged seamlessly into their subscription.
3. **Multi-Software Renewal Flow:**
   - When renewing, the Customer Portal lists all active software in the subscription, calculates Custom Pack pricing for multi-software subscriptions, and extends the active applications suite together.
4. **5-Day Expiration Rule:**
   - Subscription renewal payment is strictly enabled only when 5 or fewer days remain before the subscription's expiration date (`daysRemaining <= 5`).
   - If more than 5 days remain, the renewal payment button is locked with countdown notifications on both frontend and backend.


