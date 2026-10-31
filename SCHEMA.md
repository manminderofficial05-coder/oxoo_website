# SCHEMA.md — Database Architecture & Data Dictionary

> **Platform:** Multiix / OXOO All-in-One Enterprise Platform  
> **Database Engine:** Neon PostgreSQL (Serverless / Auto-scaling)  
> **Target Schema:** `public`  
> **Schema SQL File:** [`schema.sql`](file:///e:/bennn/multiix/schema.sql) | [`backend/schema.sql`](file:///e:/bennn/multiix/backend/schema.sql)  
> **Last Synchronized:** October 2026  
> **Total Active Tables:** 26  

---

## 1. Architectural Overview & Connection Management

The database layer runs on **Neon PostgreSQL Serverless**, utilizing a high-performance connection pool with automated reconnection, SSL verification, and transaction management via `pg.Pool`.

```mermaid
graph TD
    App["Express.js Server (src/server.js)"] --> Pool["pg.Pool (src/db.js)"]
    Pool -->|SSL / Pooler Mode| Neon["Neon Cloud PostgreSQL (us-east-2)"]
    
    subgraph "Core Data Domains"
        IAM["1. Identity & Staff Management (users, platform_staff)"]
        Customers["2. Customer & Team Multi-Tenancy (customers, organizations, team_members)"]
        Billing["3. Subscriptions, Orders & Billing (subscriptions, invoices, orders, plans, products)"]
        Retention["4. Renewal & Follow-up Suite (subscription_reminders, subscription_followup_notes)"]
        Apps["5. Applications & SSO Routing (applications, platform_applications)"]
        Support["6. Helpdesk & Support Tickets (support_tickets)"]
        CRM["7. CRM, Leads & Catalog (leads, categories, services)"]
        Audit["8. Audit, Telemetry & Config (audit_logs, demo_events, platform_settings, integrations, notification_logs)"]
    end
    
    Neon --- IAM
    Neon --- Customers
    Neon --- Billing
    Neon --- Retention
    Neon --- Apps
    Neon --- Support
    Neon --- CRM
    Neon --- Audit
```

### PostgreSQL Extensions
- `uuid-ossp`: High-entropy UUID generation.
- `pgcrypto`: Cryptographic hashing and token verification.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ audit_logs : generates
    customers ||--o{ subscriptions : holds
    customers ||--o{ invoices : receives
    customers ||--o{ support_tickets : submits
    subscriptions ||--o{ subscription_reminders : triggers
    subscriptions ||--o{ subscription_followup_notes : logs
    plans ||--o{ subscriptions : defines
    products ||--o{ plans : bundles
    platform_applications ||--o{ applications : metadata
    platform_staff ||--o{ audit_logs : logs_action
    organizations ||--o{ team_members : employs
    categories ||--o{ services : categorizes

    users {
        int id PK
        string email UK
        string password
        string role
        string organization
        boolean active
        timestamp last_login
    }

    platform_staff {
        int id PK
        string employee_id UK
        string email UK
        string name
        string role
        string department
        string status
        jsonb permissions
        jsonb assigned_software
    }

    customers {
        int id PK
        string customer_id UK
        string company_name
        string email UK
        string phone
        string plan
        string account_status
        string subscription_status
        jsonb selected_apps
        decimal amount
    }

    subscriptions {
        int id PK
        string subscription_id UK
        string customer_id FK
        string company_name
        string plan
        decimal amount
        string billing_cycle
        string status
        timestamp renewal_date
        jsonb active_apps
    }

    invoices {
        int id PK
        string invoice_number UK
        string customer_id FK
        string company_name
        decimal amount
        string status
        string pdf_url
        jsonb items
    }

    support_tickets {
        int id PK
        string ticket_id UK
        string ticket_number UK
        string customer_id FK
        string subject
        string priority
        string status
        string assigned_to
        jsonb replies
    }
```

---

## 3. Data Dictionary: Tables & Column Specifications

### 3.1 Identity & Staff Management

#### `users` (Core Authentication Table)
Stores encrypted credentials for all system logins (Super Admins, Tenant Admins, Employees, and Portal Users).
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Unique autoincrementing record ID |
| `name` | `VARCHAR(120)` | `NOT NULL` | Full display name |
| `email` | `VARCHAR(255)` | `NOT NULL UNIQUE` | Normalized login email address |
| `password` | `VARCHAR(255)` | `NOT NULL` | Bcrypt hashed password (`$2a$10$...`) |
| `role` | `VARCHAR(50)` | `DEFAULT 'member'` | Authority: `Super Admin`, `admin`, `member`, `customer` |
| `organization` | `VARCHAR(255)` | `DEFAULT 'Oxoo.ai Tenant'` | Company or workspace name |
| `active` | `BOOLEAN` | `DEFAULT true` | Account active flag |
| `avatar` | `VARCHAR(255)` | `DEFAULT ''` | Profile image URL |
| `last_login` | `TIMESTAMPTZ` | `DEFAULT NULL` | Last authenticated login timestamp |
| `reset_token` | `VARCHAR(255)` | `NULLABLE` | Password reset cryptographic token |
| `reset_token_expires` | `TIMESTAMPTZ` | `NULLABLE` | Expiration time of reset token |
| `storage_id` | `VARCHAR(100)` | `NULLABLE` | Tenant-isolated storage bucket identifier |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record update timestamp |

#### `platform_staff` (Enterprise RBAC Directory)
Detailed directory of administrators, software admins, managers, and support agents with granular permissions and assigned applications.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Autoincrementing staff ID |
| `employee_id` | `VARCHAR(50)` | `NULLABLE` | Staff tag identifier (e.g., `SUP-1001`, `EMP-4921`) |
| `name` | `VARCHAR(150)` | `NOT NULL` | Staff member full name |
| `email` | `VARCHAR(255)` | `NOT NULL UNIQUE` | Official work email address |
| `phone` | `VARCHAR(50)` | `DEFAULT ''` | Contact phone number |
| `role` | `VARCHAR(50)` | `NOT NULL` | Role: `Super Admin`, `Software Admin`, `Manager`, `Employee`, `Finance Admin`, `Support Staff`, `Sales Staff` |
| `department` | `VARCHAR(100)` | `NOT NULL` | Department: `Administration`, `Engineering`, `Finance`, `Support`, `Sales`, `Operations` |
| `status` | `VARCHAR(50)` | `DEFAULT 'Active'` | `Active`, `Suspended` |
| `access_level` | `VARCHAR(50)` | `DEFAULT 'Full Platform'` | Granular security level |
| `permissions` | `JSONB` | `DEFAULT '[]'` | Specific RBAC permission strings array |
| `assigned_software` | `JSONB` | `DEFAULT '["all"]'` | Software scopes granted to this admin |
| `created_by` | `VARCHAR(150)` | `DEFAULT 'admin@oxoo.ai'` | Creator email / system actor |
| `joined_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Date joined |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Last permission update |

---

### 3.2 Customer & Multi-Tenancy Hierarchy

#### `customers` (Subscriber Organizations)
The primary customer ledger capturing client companies, contract terms, billing amounts, and licensed app bundles.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Record ID |
| `customer_id` | `VARCHAR(50)` | `NOT NULL UNIQUE` | Public customer ID (e.g. `CUST-9421`) |
| `company_name` | `VARCHAR(255)` | `NOT NULL` | Organization legal name |
| `contact_person` | `VARCHAR(150)` | `NOT NULL` | Primary administrator contact |
| `email` | `VARCHAR(255)` | `NOT NULL UNIQUE` | Billing & notification email |
| `phone` | `VARCHAR(50)` | `NOT NULL` | Phone number with country code |
| `country` | `VARCHAR(100)` | `DEFAULT 'India'` | Operating country |
| `industry` | `VARCHAR(120)` | `DEFAULT 'IT'` | Industry vertical |
| `registered_address` | `TEXT` | `DEFAULT ''` | Official invoice billing address |
| `plan` | `VARCHAR(100)` | `DEFAULT 'Business Plan'` | Plan name |
| `account_status` | `VARCHAR(50)` | `DEFAULT 'Active'` | `Active`, `Suspended`, `Terminated` |
| `subscription_status` | `VARCHAR(50)` | `DEFAULT 'Active'` | `Active`, `Trialing`, `Past Due`, `Cancelled` |
| `payment_status` | `VARCHAR(50)` | `DEFAULT 'Paid'` | `Paid`, `Pending`, `Failed` |
| `joined_date` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Account creation date |
| `renewal_date` | `TIMESTAMPTZ` | `DEFAULT NOW() + 1 year` | Subscription renewal deadline |
| `selected_apps` | `JSONB` | `DEFAULT '["Finance", "HRMS"]'` | Licensed app array |
| `amount` | `NUMERIC(12,2)` | `DEFAULT 24999.00` | Contract value in INR |
| `billing_cycle` | `VARCHAR(20)` | `DEFAULT 'yearly'` | `monthly`, `yearly` |
| `auto_renewal` | `BOOLEAN` | `DEFAULT true` | Automatic renewal status |

#### `organizations` (Tenant Workspaces)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Workspace ID |
| `name` | `VARCHAR(255)` | `NOT NULL` | Organization workspace name |
| `plan` | `VARCHAR(50)` | `DEFAULT 'Professional'` | Assigned plan level |
| `active_apps` | `JSONB` | `DEFAULT '[]'` | Installed applications |
| `member_count` | `INTEGER` | `DEFAULT 1` | Total provisioned seats |
| `mrr` | `NUMERIC(12,2)` | `DEFAULT 0` | Monthly recurring revenue |
| `status` | `VARCHAR(50)` | `DEFAULT 'Active'` | `Active`, `Archived` |

#### `team_members` (Customer Organization Staff)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Member ID |
| `company_name` | `VARCHAR(255)` | `NOT NULL` | Organization mapping |
| `name` | `VARCHAR(120)` | `NOT NULL` | Employee full name |
| `email` | `VARCHAR(255)` | `NOT NULL` | Corporate email |
| `role` | `VARCHAR(50)` | `DEFAULT 'Member'` | `Admin`, `Manager`, `Member` |
| `apps_access` | `JSONB` | `DEFAULT '["all"]'` | Specific app permissions |
| `status` | `VARCHAR(50)` | `DEFAULT 'Active'` | `Active`, `Invited`, `Suspended` |

---

### 3.3 Subscriptions, Orders & Billing

#### `subscriptions` (Active License Contracts)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Subscription ID |
| `subscription_id` | `VARCHAR(50)` | `UNIQUE` | Formatted identifier (e.g. `SUB-8392`) |
| `customer_id` | `VARCHAR(50)` | `INDEXED` | Customer reference code |
| `company_name` | `VARCHAR(255)` | `NOT NULL` | Organization name |
| `plan` | `VARCHAR(100)` | `NOT NULL` | Plan name |
| `amount` | `NUMERIC(12,2)` | `NOT NULL` | Subscription cost |
| `currency` | `VARCHAR(10)` | `DEFAULT 'INR'` | Currency code |
| `billing_cycle` | `VARCHAR(20)` | `DEFAULT 'monthly'` | Billing frequency |
| `status` | `VARCHAR(50)` | `DEFAULT 'Active'` | `Active`, `Trialing`, `Past Due`, `Cancelled` |
| `start_date` | `TIMESTAMPTZ` | `NOT NULL` | Contract start timestamp |
| `renewal_date` | `TIMESTAMPTZ` | `NOT NULL` | Upcoming renewal timestamp |
| `active_apps` | `JSONB` | `DEFAULT '[]'` | Accessible apps array |
| `renewal_warning_status`| `VARCHAR(50)` | `DEFAULT 'Scheduled'` | Lifecycle renewal warning flag |
| `followup_status` | `VARCHAR(50)` | `DEFAULT 'Not Contacted'` | Sales outreach follow-up state |

#### `invoices` (Tax Invoices & Billing Records)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Record ID |
| `invoice_number` | `VARCHAR(100)` | `NOT NULL UNIQUE` | Official Tax Invoice number (e.g. `INV-2026-0041`) |
| `customer_id` | `VARCHAR(50)` | `NULLABLE` | Customer reference |
| `company_name` | `VARCHAR(255)` | `NOT NULL` | Client business name |
| `amount` | `NUMERIC(12,2)` | `NOT NULL` | Total invoice amount |
| `subtotal` | `NUMERIC(12,2)` | `NULLABLE` | Net amount before GST |
| `tax_amount` | `NUMERIC(12,2)` | `NULLABLE` | 18% GST component |
| `currency` | `VARCHAR(10)` | `DEFAULT 'INR'` | Currency code |
| `status` | `VARCHAR(50)` | `DEFAULT 'Paid'` | `Paid`, `Pending`, `Refunded` |
| `payment_method` | `VARCHAR(50)` | `DEFAULT 'Razorpay'` | Gateway or method |
| `pdf_url` | `VARCHAR(255)` | `DEFAULT ''` | Downloadable PDF URL |
| `items` | `JSONB` | `DEFAULT '[]'` | Line items with unit prices and quantities |
| `payment_timeline`| `JSONB` | `DEFAULT '[]'` | Transaction lifecycle events |

#### `orders` (Checkout Payment Sessions)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Order ID |
| `order_number` | `VARCHAR(100)` | `NOT NULL UNIQUE` | Public checkout order number (e.g. `OXOO-ORD-9281`) |
| `payment_id` | `VARCHAR(100)` | `NULLABLE` | Razorpay payment ID (`pay_...`) |
| `subtotal` | `NUMERIC(12,2)` | `NOT NULL` | Order subtotal |
| `tax_amount` | `NUMERIC(12,2)` | `DEFAULT 0` | GST tax component |
| `total_amount` | `NUMERIC(12,2)` | `NOT NULL` | Gross total |
| `status` | `VARCHAR(50)` | `DEFAULT 'Created'` | `Created`, `Paid`, `Failed` |

#### `plans` & `products` (Product Catalog & Pricing Rules)
- `plans`: Configurable SaaS bundles (`plan_id`, `plan_code`, `monthly_price`, `yearly_price`, `included_apps`, `entitlements`).
- `products`: Software suites (`product_id`, `slug`, `name`, `category`, `included_modules`).
- `plan_change_history`: Audit trail of pricing adjustments and plan feature modifications.

---

### 3.4 Renewal & Customer Retention Suite

#### `subscription_reminders`
Automated email alerts dispatched ahead of contract renewal (30-day, 15-day, 7-day, 1-day notices).
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Reminder record ID |
| `subscription_id` | `VARCHAR(50)` | `NOT NULL` | Subscription mapping |
| `customer_id` | `VARCHAR(50)` | `NULLABLE` | Customer mapping |
| `recipient_email` | `VARCHAR(255)` | `NOT NULL` | Destination email |
| `email_type` | `VARCHAR(50)` | `NOT NULL` | Notice type: `30_day_renewal`, `7_day_renewal`, `expired` |
| `status` | `VARCHAR(50)` | `DEFAULT 'Sent'` | `Scheduled`, `Sent`, `Failed` |
| `idempotency_key` | `VARCHAR(120)` | `UNIQUE` | Deduplication key preventing duplicate emails |

#### `subscription_followup_notes`
Manual CRM call logs and payment commitment notes recorded by sales & account managers.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Note ID |
| `subscription_id` | `VARCHAR(50)` | `NOT NULL` | Subscription mapping |
| `author_name` | `VARCHAR(120)` | `DEFAULT 'Admin'` | Manager who logged the outreach |
| `promised_payment_date`| `DATE` | `NULLABLE` | Customer promised payment date |
| `next_followup_date`| `DATE` | `NULLABLE` | Scheduled next follow-up date |
| `note` | `TEXT` | `NOT NULL` | Interaction summary |

---

### 3.5 Applications & Single Sign-On (SSO)

#### `applications` (24 Public SaaS Catalog Applications)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(100)` | `PRIMARY KEY` | Catalog app ID (e.g. `accounting`, `crm`, `pos`) |
| `slug` | `VARCHAR(100)` | `NOT NULL UNIQUE` | URL slug |
| `name` | `VARCHAR(150)` | `NOT NULL` | App display name |
| `category` | `VARCHAR(100)` | `NOT NULL` | Category: `Finance`, `Sales`, `Operations`, `HR` |
| `main_color` | `VARCHAR(50)` | `DEFAULT '#2563eb'` | Brand hex color |
| `icon_src` | `VARCHAR(255)` | `NOT NULL` | Icon asset path |
| `features` | `JSONB` | `DEFAULT '[]'` | Highlighted feature list |
| `enabled` | `BOOLEAN` | `DEFAULT true` | Active flag |

#### `platform_applications` (Enterprise Deployment & Key Rotation)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Platform app ID |
| `app_id` | `VARCHAR(50)` | `NOT NULL UNIQUE` | Technical identifier |
| `main_url` | `VARCHAR(255)` | `NOT NULL` | Application entrypoint URL |
| `employee_url` | `VARCHAR(255)` | `DEFAULT '/employee'`| Employee portal link |
| `admin_url` | `VARCHAR(255)` | `DEFAULT '/admin'` | Admin console link |
| `service_key` | `VARCHAR(255)` | `NOT NULL` | Cryptographic API service key for inter-app verification |
| `health_status` | `VARCHAR(50)` | `DEFAULT 'Operational'`| Live health check result |
| `health_response_ms`| `INTEGER` | `DEFAULT 35` | Ping response time |

---

### 3.6 Support Tickets & Helpdesk

#### `support_tickets`
Customer service tickets, priority triage, internal private notes, and customer conversation threads.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Internal ID |
| `ticket_id` | `VARCHAR(50)` | `UNIQUE` | Formatted ticket ID (`TICK-1002`) |
| `ticket_number` | `VARCHAR(50)` | `NOT NULL UNIQUE`| Sequential ticket number |
| `customer_id` | `VARCHAR(50)` | `NULLABLE` | Customer mapping |
| `company_name` | `VARCHAR(255)` | `NOT NULL` | Organization name |
| `user_email` | `VARCHAR(255)` | `NOT NULL` | Submitting contact email |
| `subject` | `VARCHAR(255)` | `NOT NULL` | Ticket issue summary |
| `priority` | `VARCHAR(20)` | `DEFAULT 'Medium'` | `Urgent`, `High`, `Medium`, `Low` |
| `status` | `VARCHAR(50)` | `DEFAULT 'Open'` | `Open`, `In Progress`, `Pending Customer`, `Pending Internal Team`, `Resolved`, `Closed` |
| `category` | `VARCHAR(100)` | `DEFAULT 'Technical'` | `Technical`, `Billing`, `Access`, `Feature Request` |
| `assigned_to` | `VARCHAR(150)` | `DEFAULT 'Priya Mehta'`| Assigned staff agent |
| `replies` | `JSONB` | `DEFAULT '[]'` | Threaded messages & internal notes array |

---

### 3.7 Sales CRM & Marketing

- **`leads`:** Enterprise contact enquiries, demo requests, and workspace bookings (`name`, `email`, `phone`, `company`, `message`, `status`, `source`).
- **`categories`:** Category taxonomy for consulting and software lines.
- **`services`:** Consulting services catalog with deliverables and pricing.

---

### 3.8 Observability, Governance & System Logs

- **`audit_logs`:** Immutable security audit trail recording actor email, role, IP address, user agent, target resource, action name, and timestamp.
- **`demo_events`:** Live simulator interaction analytics (visitor emails, duration seconds, app slug, browser metadata).
- **`notification_logs`:** Multi-channel delivery ledger tracking Brevo/Resend HTTPS email deliveries, message IDs, and failure reasons.
- **`integrations`:** Webhook and external integration configurations (`Razorpay`, `Brevo`, `Slack`, `AWS S3`, `Zapier`).
- **`platform_settings`:** Key-value system policies stored as categorized JSONB objects (Security, Auth, Notifications, Branding).

---

## 4. Key JSONB Column Schemas

### `support_tickets.replies`
```json
[
  {
    "id": "MSG-942104",
    "sender": "Manminder Singh",
    "role": "admin",
    "message": "We have adjusted your accounting webhook configuration.",
    "is_internal": false,
    "timestamp": "27 Oct 2026, 11:15 AM"
  },
  {
    "id": "NOTE-192842",
    "sender": "Priya Mehta",
    "role": "staff",
    "message": "Customer confirmed they will test the live transaction today.",
    "is_internal": true,
    "timestamp": "27 Oct 2026, 11:30 AM"
  }
]
```

### `platform_staff.permissions`
```json
[
  "customers.read",
  "subscriptions.read",
  "subscriptions.manage",
  "support_tickets.reply",
  "support_tickets.resolve"
]
```

### `invoices.items`
```json
[
  {
    "description": "OXOO Enterprise Suite (Yearly Contract)",
    "quantity": 1,
    "unit_price": 24999.00,
    "total": 24999.00
  }
]
```

---

## 5. How to Regenerate or Apply the Database Schema

### Regenerate `schema.sql` from Live PostgreSQL
To inspect the live Neon PostgreSQL database and automatically produce a fresh `schema.sql`:
```bash
cd backend
npm run schema
```

### Apply Schema to a Fresh Neon / PostgreSQL Instance
To provision the complete schema from scratch into a new PostgreSQL database:
```bash
# Using psql CLI:
psql "postgresql://user:password@host/neondb?sslmode=require" -f schema.sql

# Or using Node initialization script:
cd backend
npm run seed
```
