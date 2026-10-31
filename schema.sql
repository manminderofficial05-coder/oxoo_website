-- =============================================================================
-- Multiix / OXOO Database Schema (Neon PostgreSQL)
-- Generated on: 2026-10-27T06:15:51.652Z
-- Target Database: Neon PostgreSQL Serverless
-- Total Tables: 26
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Table: applications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id                           VARCHAR(100) NOT NULL,
  slug                         VARCHAR(100) NOT NULL,
  name                         VARCHAR(150) NOT NULL,
  category                     VARCHAR(100) NOT NULL,
  concept                      TEXT DEFAULT ''::text,
  main_color                   VARCHAR(50) DEFAULT '#2563eb'::character varying,
  bg_color                     VARCHAR(50) DEFAULT '#eff6ff'::character varying,
  icon_src                     VARCHAR(255) NOT NULL,
  svg_src                      VARCHAR(255) DEFAULT ''::character varying,
  tagline                      VARCHAR(255) DEFAULT ''::character varying,
  description                  TEXT DEFAULT ''::text,
  features                     JSONB DEFAULT '[]'::jsonb,
  enabled                      BOOLEAN DEFAULT true,
  sort_order                   INTEGER DEFAULT 0,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

-- -----------------------------------------------------------------------------
-- Table: audit_logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id                           SERIAL PRIMARY KEY,
  action                       VARCHAR(255) NOT NULL,
  target                       VARCHAR(255) DEFAULT ''::character varying,
  user_name                    VARCHAR(120) DEFAULT 'system'::character varying,
  ip                           VARCHAR(100) DEFAULT '127.0.0.1'::character varying,
  details                      JSONB DEFAULT '{}'::jsonb,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  actor_name                   VARCHAR(150) DEFAULT 'Manminder Singh'::character varying,
  actor_email                  VARCHAR(255) DEFAULT 'manminder.singh@primepro.ai'::character varying,
  actor_role                   VARCHAR(100) DEFAULT 'Super Admin'::character varying,
  resource_type                VARCHAR(100) DEFAULT 'System'::character varying,
  resource_id                  VARCHAR(100),
  ip_address                   VARCHAR(50) DEFAULT '127.0.0.1'::character varying,
  user_agent                   TEXT DEFAULT 'Mozilla/5.0 Chrome/130.0'::text,
  result                       VARCHAR(50) DEFAULT 'Success'::character varying,
  duration_ms                  INTEGER DEFAULT 24
);

-- -----------------------------------------------------------------------------
-- Table: categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id                           SERIAL PRIMARY KEY,
  slug                         VARCHAR(100) NOT NULL,
  name                         VARCHAR(150) NOT NULL,
  description                  TEXT DEFAULT ''::text,
  color                        VARCHAR(50) DEFAULT 'green'::character varying,
  icon                         VARCHAR(100) DEFAULT 'BriefcaseBusiness'::character varying,
  services                     JSONB DEFAULT '[]'::jsonb,
  sort_order                   INTEGER DEFAULT 0,
  active                       BOOLEAN DEFAULT true,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: customers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id                           SERIAL PRIMARY KEY,
  customer_id                  VARCHAR(50) NOT NULL,
  company_name                 VARCHAR(255) NOT NULL,
  contact_person               VARCHAR(150) NOT NULL,
  email                        VARCHAR(255) NOT NULL,
  phone                        VARCHAR(50) NOT NULL,
  country                      VARCHAR(100) DEFAULT 'India'::character varying,
  country_code                 VARCHAR(10) DEFAULT '+91'::character varying,
  industry                     VARCHAR(120) DEFAULT 'Information Technology'::character varying,
  website                      VARCHAR(255) DEFAULT ''::character varying,
  registered_address           TEXT DEFAULT ''::text,
  plan                         VARCHAR(100) DEFAULT 'Business Plan'::character varying,
  account_status               VARCHAR(50) DEFAULT 'Active'::character varying,
  subscription_status          VARCHAR(50) DEFAULT 'Active'::character varying,
  payment_status               VARCHAR(50) DEFAULT 'Paid'::character varying,
  joined_date                  TIMESTAMPTZ DEFAULT now(),
  renewal_date                 TIMESTAMPTZ DEFAULT (now() + '1 year'::interval),
  last_login                   TIMESTAMPTZ DEFAULT now(),
  email_verified               BOOLEAN DEFAULT true,
  phone_verified               BOOLEAN DEFAULT true,
  auto_renewal                 BOOLEAN DEFAULT true,
  selected_apps                JSONB DEFAULT '["Finance", "HRMS", "Marketing"]'::jsonb,
  amount                       NUMERIC(12, 2) DEFAULT 24999.00,
  billing_cycle                VARCHAR(20) DEFAULT 'yearly'::character varying,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: demo_events
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS demo_events (
  id                           SERIAL PRIMARY KEY,
  event_type                   VARCHAR(50) DEFAULT 'login'::character varying,
  session_id                   VARCHAR(100),
  user_name                    VARCHAR(150) DEFAULT ''::character varying,
  user_email                   VARCHAR(255) NOT NULL,
  company_name                 VARCHAR(255) DEFAULT ''::character varying,
  app_slug                     VARCHAR(100) DEFAULT 'accounting'::character varying,
  duration_seconds             INTEGER DEFAULT 300,
  ip                           VARCHAR(100) DEFAULT '127.0.0.1'::character varying,
  user_agent                   TEXT DEFAULT ''::text,
  created_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: email_templates
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_templates (
  id                           SERIAL PRIMARY KEY,
  template_key                 VARCHAR(100) NOT NULL,
  name                         VARCHAR(255) NOT NULL,
  category                     VARCHAR(100) NOT NULL DEFAULT 'Transactional'::character varying,
  subject                      VARCHAR(255) NOT NULL,
  body_html                    TEXT NOT NULL,
  body_plain                   TEXT DEFAULT ''::text,
  available_variables          JSONB DEFAULT '[]'::jsonb,
  delivery_channel             VARCHAR(50) DEFAULT 'Email'::character varying,
  status                       VARCHAR(50) DEFAULT 'Active'::character varying,
  is_system_protected          BOOLEAN DEFAULT true,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: integrations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integrations (
  id                           SERIAL PRIMARY KEY,
  integration_id               VARCHAR(100) NOT NULL,
  name                         VARCHAR(255) NOT NULL,
  category                     VARCHAR(100) NOT NULL,
  provider                     VARCHAR(100) NOT NULL,
  description                  TEXT,
  icon                         VARCHAR(20) DEFAULT '⚡'::character varying,
  color                        VARCHAR(20) DEFAULT '#0284c7'::character varying,
  status                       VARCHAR(50) DEFAULT 'Connected'::character varying,
  environment                  VARCHAR(50) DEFAULT 'Live'::character varying,
  config                       JSONB DEFAULT '{}'::jsonb,
  webhook_url                  VARCHAR(500),
  webhook_secret               VARCHAR(255),
  subscribed_events            JSONB DEFAULT '[]'::jsonb,
  last_health_check            TIMESTAMPTZ DEFAULT now(),
  last_sync                    TIMESTAMPTZ DEFAULT now(),
  health_status                VARCHAR(50) DEFAULT 'Healthy'::character varying,
  last_error                   TEXT,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: invoices
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id                           SERIAL PRIMARY KEY,
  invoice_number               VARCHAR(100) NOT NULL,
  company_name                 VARCHAR(255) NOT NULL,
  plan                         VARCHAR(100) DEFAULT 'Business Pro'::character varying,
  amount                       NUMERIC(12, 2) NOT NULL,
  currency                     VARCHAR(10) DEFAULT 'INR'::character varying,
  status                       VARCHAR(50) DEFAULT 'Paid'::character varying,
  invoice_date                 TIMESTAMPTZ DEFAULT now(),
  due_date                     TIMESTAMPTZ DEFAULT (now() + '15 days'::interval),
  pdf_url                      VARCHAR(255) DEFAULT ''::character varying,
  items                        JSONB DEFAULT '[]'::jsonb,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  transaction_id               VARCHAR(100),
  customer_id                  VARCHAR(50),
  customer_email               VARCHAR(255),
  customer_phone               VARCHAR(50),
  plan_name                    VARCHAR(100),
  billing_cycle                VARCHAR(20) DEFAULT 'Yearly'::character varying,
  subtotal                     NUMERIC(12, 2),
  tax_amount                   NUMERIC(12, 2),
  payment_method               VARCHAR(50) DEFAULT 'Razorpay (UPI)'::character varying,
  payment_date                 TIMESTAMPTZ,
  payment_timeline             JSONB DEFAULT '[]'::jsonb
);

-- -----------------------------------------------------------------------------
-- Table: leads
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id                           SERIAL PRIMARY KEY,
  name                         VARCHAR(120) NOT NULL,
  email                        VARCHAR(255) NOT NULL,
  phone                        VARCHAR(50) DEFAULT ''::character varying,
  company                      VARCHAR(160) DEFAULT ''::character varying,
  service                      VARCHAR(160) DEFAULT ''::character varying,
  message                      TEXT NOT NULL,
  status                       VARCHAR(50) DEFAULT 'New'::character varying,
  source                       VARCHAR(50) DEFAULT 'website'::character varying,
  assigned_to                  VARCHAR(120) DEFAULT ''::character varying,
  details                      JSONB DEFAULT '{}'::jsonb,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: notification_logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_logs (
  id                           SERIAL PRIMARY KEY,
  event_id                     VARCHAR(100) NOT NULL,
  recipient                    VARCHAR(255) NOT NULL,
  template_key                 VARCHAR(100),
  subject                      VARCHAR(255),
  channel                      VARCHAR(50) DEFAULT 'Email'::character varying,
  customer_id                  VARCHAR(50),
  customer_name                VARCHAR(255),
  related_entity_type          VARCHAR(100),
  related_entity_id            VARCHAR(100),
  status                       VARCHAR(50) DEFAULT 'Sent'::character varying,
  attempt_count                INTEGER DEFAULT 1,
  provider                     VARCHAR(100) DEFAULT 'Brevo'::character varying,
  provider_message_id          VARCHAR(255),
  error_summary                TEXT,
  payload                      JSONB DEFAULT '{}'::jsonb,
  created_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: orders
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id                           SERIAL PRIMARY KEY,
  order_number                 VARCHAR(100) NOT NULL,
  company_name                 VARCHAR(255) NOT NULL,
  customer_name                VARCHAR(150),
  customer_email               VARCHAR(255),
  customer_phone               VARCHAR(50),
  plan_name                    VARCHAR(100) NOT NULL,
  selected_apps                JSONB DEFAULT '[]'::jsonb,
  user_count                   INTEGER DEFAULT 1,
  billing_cycle                VARCHAR(20) DEFAULT 'monthly'::character varying,
  subtotal                     NUMERIC(12, 2) NOT NULL,
  tax_amount                   NUMERIC(12, 2) DEFAULT 0,
  discount_amount              NUMERIC(12, 2) DEFAULT 0,
  total_amount                 NUMERIC(12, 2) NOT NULL,
  currency                     VARCHAR(10) DEFAULT 'INR'::character varying,
  payment_method               VARCHAR(50) DEFAULT 'Razorpay'::character varying,
  payment_id                   VARCHAR(100),
  status                       VARCHAR(50) DEFAULT 'Created'::character varying,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now(),
  storage_id                   VARCHAR(100)
);

-- -----------------------------------------------------------------------------
-- Table: organizations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id                           SERIAL PRIMARY KEY,
  name                         VARCHAR(255) NOT NULL,
  plan                         VARCHAR(50) DEFAULT 'Professional'::character varying,
  active_apps                  JSONB DEFAULT '[]'::jsonb,
  member_count                 INTEGER DEFAULT 1,
  status                       VARCHAR(50) DEFAULT 'Active'::character varying,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now(),
  mrr                          NUMERIC(12, 2) DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- Table: plan_change_history
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plan_change_history (
  id                           SERIAL PRIMARY KEY,
  plan_id                      VARCHAR(50) NOT NULL,
  admin_name                   VARCHAR(150) DEFAULT 'Manminder Singh'::character varying,
  action                       VARCHAR(100) NOT NULL,
  previous_value               JSONB,
  new_value                    JSONB,
  reason                       TEXT,
  created_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: plans
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
  id                           SERIAL PRIMARY KEY,
  plan_id                      VARCHAR(50) NOT NULL,
  name                         VARCHAR(150) NOT NULL,
  plan_code                    VARCHAR(50) NOT NULL,
  category                     VARCHAR(100) DEFAULT 'Business Management'::character varying,
  plan_type                    VARCHAR(50) DEFAULT 'Bundle Plan'::character varying,
  description                  TEXT,
  monthly_price                NUMERIC(12, 2) NOT NULL,
  yearly_price                 NUMERIC(12, 2) NOT NULL,
  billing_cycle                VARCHAR(50) DEFAULT 'Yearly'::character varying,
  currency                     VARCHAR(10) DEFAULT 'INR'::character varying,
  setup_fee                    NUMERIC(12, 2) DEFAULT 0,
  discount_percent             INTEGER DEFAULT 17,
  trial_days                   INTEGER DEFAULT 14,
  active_subscriptions         INTEGER DEFAULT 0,
  status                       VARCHAR(50) DEFAULT 'Active'::character varying,
  visibility                   VARCHAR(50) DEFAULT 'Public'::character varying,
  included_products            JSONB DEFAULT '[]'::jsonb,
  included_apps                JSONB DEFAULT '[]'::jsonb,
  entitlements                 JSONB DEFAULT '{}'::jsonb,
  subscription_rules           JSONB DEFAULT '{}'::jsonb,
  customer_access              JSONB DEFAULT '{}'::jsonb,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: platform_applications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_applications (
  id                           SERIAL PRIMARY KEY,
  app_id                       VARCHAR(50) NOT NULL,
  name                         VARCHAR(150) NOT NULL,
  slug                         VARCHAR(100) NOT NULL,
  category                     VARCHAR(100) NOT NULL,
  icon                         VARCHAR(50) DEFAULT 'Layers'::character varying,
  icon_bg                      VARCHAR(50) DEFAULT '#0284c7'::character varying,
  short_description            TEXT,
  detailed_description         TEXT,
  main_url                     VARCHAR(255) NOT NULL,
  employee_url                 VARCHAR(255) DEFAULT '/employee'::character varying,
  admin_url                    VARCHAR(255) DEFAULT '/admin'::character varying,
  customer_dashboard_url       VARCHAR(255) DEFAULT '/customer'::character varying,
  logout_url                   VARCHAR(255) DEFAULT '/logout'::character varying,
  health_url                   VARCHAR(255) DEFAULT '/health'::character varying,
  app_type                     VARCHAR(50) DEFAULT 'Cloud Web App'::character varying,
  access_mode                  VARCHAR(50) DEFAULT 'SSO Protected'::character varying,
  auth_method                  VARCHAR(50) DEFAULT 'OXOO OAuth2 / JWT'::character varying,
  service_key                  VARCHAR(255) DEFAULT 'sk_live_9f8d7e6c5b4a3e2d'::character varying,
  access_protection            BOOLEAN DEFAULT true,
  warning_page_url             VARCHAR(255) DEFAULT 'https://oxoo.in/access-denied'::character varying,
  subscription_required        VARCHAR(100) DEFAULT 'Business Plan'::character varying,
  status                       VARCHAR(50) DEFAULT 'Active'::character varying,
  health_status                VARCHAR(50) DEFAULT 'Operational'::character varying,
  health_response_ms           INTEGER DEFAULT 35,
  last_health_check            TIMESTAMPTZ DEFAULT now(),
  allowed_domains              JSONB DEFAULT '["*.oxoo.in", "localhost"]'::jsonb,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: platform_settings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_settings (
  category                     VARCHAR(100) NOT NULL,
  settings                     JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at                   TIMESTAMPTZ DEFAULT now(),
  updated_by                   VARCHAR(255) DEFAULT 'Super Admin'::character varying,
  PRIMARY KEY (category)
);

-- -----------------------------------------------------------------------------
-- Table: platform_staff
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_staff (
  id                           SERIAL PRIMARY KEY,
  name                         VARCHAR(150) NOT NULL,
  email                        VARCHAR(255) NOT NULL,
  phone                        VARCHAR(50) DEFAULT ''::character varying,
  role                         VARCHAR(50) NOT NULL,
  department                   VARCHAR(100) NOT NULL,
  status                       VARCHAR(50) DEFAULT 'Active'::character varying,
  access_level                 VARCHAR(50) DEFAULT 'Full Platform'::character varying,
  permissions                  JSONB DEFAULT '[]'::jsonb,
  joined_at                    TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now(),
  assigned_software            JSONB DEFAULT '["all"]'::jsonb,
  employee_id                  VARCHAR(50),
  created_by                   VARCHAR(150) DEFAULT 'admin@oxoo.ai'::character varying
);

-- -----------------------------------------------------------------------------
-- Table: products
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                           SERIAL PRIMARY KEY,
  product_id                   VARCHAR(50) NOT NULL,
  name                         VARCHAR(150) NOT NULL,
  slug                         VARCHAR(100) NOT NULL,
  icon                         VARCHAR(50) DEFAULT 'Layers'::character varying,
  icon_bg                      VARCHAR(20) DEFAULT '#0284c7'::character varying,
  short_description            TEXT,
  detailed_description         TEXT,
  category                     VARCHAR(100) DEFAULT 'Business Management'::character varying,
  included_modules             JSONB DEFAULT '[]'::jsonb,
  features                     JSONB DEFAULT '[]'::jsonb,
  total_plans                  INTEGER DEFAULT 1,
  status                       VARCHAR(50) DEFAULT 'Active'::character varying,
  visibility                   VARCHAR(50) DEFAULT 'Public'::character varying,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: products_plans
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products_plans (
  id                           SERIAL PRIMARY KEY,
  product_name                 VARCHAR(150) NOT NULL,
  category                     VARCHAR(100) NOT NULL,
  monthly_price                INTEGER NOT NULL,
  annual_price                 INTEGER NOT NULL,
  revenue                      INTEGER DEFAULT 0,
  revenue_percent              INTEGER DEFAULT 0,
  active_subscriptions         INTEGER DEFAULT 0,
  status                       VARCHAR(50) DEFAULT 'Operational'::character varying,
  features                     JSONB DEFAULT '[]'::jsonb,
  created_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: services
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id                           SERIAL PRIMARY KEY,
  slug                         VARCHAR(100) NOT NULL,
  name                         VARCHAR(150) NOT NULL,
  category                     VARCHAR(100) NOT NULL,
  description                  TEXT DEFAULT ''::text,
  color                        VARCHAR(50) DEFAULT 'green'::character varying,
  icon                         VARCHAR(100) DEFAULT 'BriefcaseBusiness'::character varying,
  featured                     BOOLEAN DEFAULT false,
  features                     JSONB DEFAULT '[]'::jsonb,
  sort_order                   INTEGER DEFAULT 0,
  active                       BOOLEAN DEFAULT true,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: subscription_followup_notes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscription_followup_notes (
  id                           SERIAL PRIMARY KEY,
  subscription_id              VARCHAR(50) NOT NULL,
  author_name                  VARCHAR(120) DEFAULT 'Admin'::character varying,
  call_date                    TIMESTAMPTZ DEFAULT now(),
  status                       VARCHAR(50) DEFAULT 'Contacted'::character varying,
  promised_payment_date        DATE,
  next_followup_date           DATE,
  note                         TEXT NOT NULL,
  created_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: subscription_reminders
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscription_reminders (
  id                           SERIAL PRIMARY KEY,
  subscription_id              VARCHAR(50) NOT NULL,
  customer_id                  VARCHAR(50),
  company_name                 VARCHAR(255),
  recipient_email              VARCHAR(255) NOT NULL,
  email_type                   VARCHAR(50) NOT NULL,
  subject                      VARCHAR(255) NOT NULL,
  status                       VARCHAR(50) DEFAULT 'Sent'::character varying,
  idempotency_key              VARCHAR(120),
  scheduled_at                 TIMESTAMPTZ DEFAULT now(),
  sent_at                      TIMESTAMPTZ DEFAULT now(),
  retry_count                  INTEGER DEFAULT 0,
  failure_reason               TEXT DEFAULT ''::text,
  details                      JSONB DEFAULT '{}'::jsonb,
  created_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: subscriptions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id                           SERIAL PRIMARY KEY,
  org_id                       INTEGER,
  company_name                 VARCHAR(255) NOT NULL,
  plan                         VARCHAR(100) NOT NULL,
  amount                       NUMERIC(12, 2) NOT NULL,
  currency                     VARCHAR(10) DEFAULT 'INR'::character varying,
  billing_cycle                VARCHAR(20) DEFAULT 'monthly'::character varying,
  status                       VARCHAR(50) DEFAULT 'Active'::character varying,
  start_date                   TIMESTAMPTZ DEFAULT (now() - '30 days'::interval),
  renewal_date                 TIMESTAMPTZ DEFAULT (now() + '30 days'::interval),
  active_apps                  JSONB DEFAULT '[]'::jsonb,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now(),
  subscription_id              VARCHAR(50),
  customer_id                  VARCHAR(50),
  payment_status               VARCHAR(50) DEFAULT 'Paid'::character varying,
  auto_renewal                 BOOLEAN DEFAULT true,
  warning_date                 TIMESTAMPTZ,
  renewal_warning_status       VARCHAR(50) DEFAULT 'Scheduled'::character varying,
  followup_status              VARCHAR(50) DEFAULT 'Not Contacted'::character varying,
  assigned_to                  VARCHAR(120) DEFAULT 'Amit Verma'::character varying,
  last_email_sent              TIMESTAMPTZ,
  next_scheduled_email         TIMESTAMPTZ,
  last_call_date               TIMESTAMPTZ,
  notes                        TEXT DEFAULT ''::text,
  reminders_paused             BOOLEAN DEFAULT false,
  timezone                     VARCHAR(50) DEFAULT 'Asia/Kolkata'::character varying
);

-- -----------------------------------------------------------------------------
-- Table: support_tickets
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS support_tickets (
  id                           SERIAL PRIMARY KEY,
  ticket_number                VARCHAR(50) NOT NULL,
  company_name                 VARCHAR(255) NOT NULL,
  user_name                    VARCHAR(120) NOT NULL,
  user_email                   VARCHAR(255) NOT NULL,
  subject                      VARCHAR(255) NOT NULL,
  description                  TEXT DEFAULT ''::text,
  priority                     VARCHAR(20) DEFAULT 'Medium'::character varying,
  status                       VARCHAR(50) DEFAULT 'Open'::character varying,
  replies                      JSONB DEFAULT '[]'::jsonb,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now(),
  ticket_id                    VARCHAR(50),
  customer_id                  VARCHAR(50),
  category                     VARCHAR(100) DEFAULT 'Technical'::character varying,
  assigned_to                  VARCHAR(150) DEFAULT 'Priya Mehta'::character varying,
  contact_name                 VARCHAR(150),
  contact_email                VARCHAR(255),
  resolution_notes             TEXT,
  resolved_by                  VARCHAR(150),
  resolved_at                  TIMESTAMPTZ,
  closed_at                    TIMESTAMPTZ,
  reopened_at                  TIMESTAMPTZ,
  reopened_reason              TEXT
);

-- -----------------------------------------------------------------------------
-- Table: team_members
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_members (
  id                           SERIAL PRIMARY KEY,
  company_name                 VARCHAR(255) NOT NULL,
  name                         VARCHAR(120) NOT NULL,
  email                        VARCHAR(255) NOT NULL,
  role                         VARCHAR(50) DEFAULT 'Member'::character varying,
  status                       VARCHAR(50) DEFAULT 'Active'::character varying,
  apps_access                  JSONB DEFAULT '["all"]'::jsonb,
  last_active                  TIMESTAMPTZ DEFAULT now(),
  created_at                   TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                           SERIAL PRIMARY KEY,
  name                         VARCHAR(120) NOT NULL,
  email                        VARCHAR(255) NOT NULL,
  password                     VARCHAR(255) NOT NULL,
  role                         VARCHAR(50) DEFAULT 'member'::character varying,
  organization                 VARCHAR(255) DEFAULT 'Oxoo.ai Tenant'::character varying,
  active                       BOOLEAN DEFAULT true,
  avatar                       VARCHAR(255) DEFAULT ''::character varying,
  last_login                   TIMESTAMPTZ,
  created_at                   TIMESTAMPTZ DEFAULT now(),
  updated_at                   TIMESTAMPTZ DEFAULT now(),
  reset_token                  VARCHAR(255),
  reset_token_expires          TIMESTAMPTZ,
  storage_id                   VARCHAR(100)
);

-- =============================================================================
-- Secondary Indexes
-- =============================================================================

CREATE UNIQUE INDEX applications_slug_key ON public.applications USING btree (slug);
CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);
CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);
CREATE UNIQUE INDEX customers_customer_id_key ON public.customers USING btree (customer_id);
CREATE UNIQUE INDEX customers_email_key ON public.customers USING btree (email);
CREATE INDEX idx_customers_customer_id ON public.customers USING btree (customer_id);
CREATE INDEX idx_customers_email ON public.customers USING btree (lower(TRIM(BOTH FROM email)));
CREATE INDEX idx_customers_phone ON public.customers USING btree (phone);
CREATE INDEX idx_demo_events_created_at ON public.demo_events USING btree (created_at);
CREATE INDEX idx_demo_events_user_email ON public.demo_events USING btree (user_email);
CREATE UNIQUE INDEX email_templates_template_key_key ON public.email_templates USING btree (template_key);
CREATE UNIQUE INDEX integrations_integration_id_key ON public.integrations USING btree (integration_id);
CREATE UNIQUE INDEX invoices_invoice_number_key ON public.invoices USING btree (invoice_number);
CREATE UNIQUE INDEX notification_logs_event_id_key ON public.notification_logs USING btree (event_id);
CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);
CREATE UNIQUE INDEX plans_plan_code_key ON public.plans USING btree (plan_code);
CREATE UNIQUE INDEX plans_plan_id_key ON public.plans USING btree (plan_id);
CREATE UNIQUE INDEX platform_applications_app_id_key ON public.platform_applications USING btree (app_id);
CREATE UNIQUE INDEX platform_applications_slug_key ON public.platform_applications USING btree (slug);
CREATE UNIQUE INDEX platform_staff_email_key ON public.platform_staff USING btree (email);
CREATE UNIQUE INDEX products_product_id_key ON public.products USING btree (product_id);
CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);
CREATE UNIQUE INDEX services_slug_key ON public.services USING btree (slug);
CREATE INDEX idx_sub_notes_sub_id ON public.subscription_followup_notes USING btree (subscription_id);
CREATE INDEX idx_sub_reminders_sub_id ON public.subscription_reminders USING btree (subscription_id);
CREATE UNIQUE INDEX subscription_reminders_idempotency_key_key ON public.subscription_reminders USING btree (idempotency_key);
CREATE INDEX idx_subs_customer_id ON public.subscriptions USING btree (customer_id);
CREATE UNIQUE INDEX idx_subs_subscription_id ON public.subscriptions USING btree (subscription_id);
CREATE UNIQUE INDEX idx_support_tickets_ticket_id ON public.support_tickets USING btree (ticket_id);
CREATE UNIQUE INDEX support_tickets_ticket_number_key ON public.support_tickets USING btree (ticket_number);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

-- -------------------------------------------------------------
-- Table: agent_conversations (OXOO AI Agent Customer Conversations)
-- -------------------------------------------------------------
CREATE TABLE public.agent_conversations (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1),
    conversation_id character varying(100) COLLATE pg_catalog."default" NOT NULL,
    session_id character varying(100) COLLATE pg_catalog."default",
    user_id integer,
    customer_id integer,
    user_email character varying(255) COLLATE pg_catalog."default",
    user_name character varying(255) COLLATE pg_catalog."default",
    title character varying(255) COLLATE pg_catalog."default" DEFAULT 'New Conversation'::character varying,
    message_count integer DEFAULT 0,
    last_message_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT agent_conversations_pkey PRIMARY KEY (id),
    CONSTRAINT agent_conversations_conversation_id_key UNIQUE (conversation_id)
);

-- -------------------------------------------------------------
-- Table: agent_messages (OXOO AI Agent Transcript Messages)
-- -------------------------------------------------------------
CREATE TABLE public.agent_messages (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1),
    conversation_id character varying(100) COLLATE pg_catalog."default" NOT NULL,
    sender character varying(20) COLLATE pg_catalog."default" NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    structured_payload jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT agent_messages_pkey PRIMARY KEY (id),
    CONSTRAINT agent_messages_conversation_id_fkey FOREIGN KEY (conversation_id)
        REFERENCES public.agent_conversations (conversation_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT agent_messages_sender_check CHECK (sender::text = ANY (ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying]::text[]))
);

-- -------------------------------------------------------------
-- Table: agent_events (OXOO AI Agent Analytics & Audit Logs)
-- -------------------------------------------------------------
CREATE TABLE public.agent_events (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1),
    event_type character varying(100) COLLATE pg_catalog."default" NOT NULL,
    conversation_id character varying(100) COLLATE pg_catalog."default",
    actor_email character varying(255) COLLATE pg_catalog."default",
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT agent_events_pkey PRIMARY KEY (id)
);

-- -------------------------------------------------------------
-- Indexes for Agent Tables
-- -------------------------------------------------------------
CREATE INDEX idx_agent_conv_session ON public.agent_conversations USING btree (session_id);
CREATE INDEX idx_agent_conv_user ON public.agent_conversations USING btree (user_email);
CREATE INDEX idx_agent_messages_conv ON public.agent_messages USING btree (conversation_id);
CREATE INDEX idx_agent_events_type ON public.agent_events USING btree (event_type);

-- -------------------------------------------------------------
-- Table: project_requests (OXOO Unified Projects Hub Enquiries)
-- -------------------------------------------------------------
CREATE TABLE public.project_requests (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1),
    request_id character varying(40) NOT NULL,
    customer_name character varying(255) NOT NULL,
    business_email character varying(255) NOT NULL,
    phone_number character varying(100) NOT NULL,
    company_name character varying(255) NOT NULL,
    company_website character varying(255) DEFAULT ''::character varying,
    country character varying(120) NOT NULL,
    industry character varying(120) DEFAULT ''::character varying,
    company_size character varying(80) DEFAULT ''::character varying,
    selected_categories jsonb DEFAULT '[]'::jsonb,
    selected_services jsonb DEFAULT '[]'::jsonb,
    project_title character varying(255) NOT NULL,
    project_description text NOT NULL,
    business_problem text DEFAULT ''::text,
    required_features text DEFAULT ''::text,
    target_audience text DEFAULT ''::text,
    preferred_technology character varying(255) DEFAULT ''::character varying,
    existing_url character varying(500) DEFAULT ''::character varying,
    reference_websites text DEFAULT ''::text,
    design_preferences text DEFAULT ''::text,
    expected_deliverables text DEFAULT ''::text,
    preferred_start_date character varying(100) DEFAULT ''::character varying,
    expected_completion_date character varying(100) DEFAULT ''::character varying,
    budget_range character varying(120) DEFAULT ''::character varying,
    additional_requirements text DEFAULT ''::text,
    attachments_meta jsonb DEFAULT '[]'::jsonb,
    consent_accepted boolean DEFAULT true,
    assigned_team_member character varying(255) DEFAULT 'Unassigned'::character varying,
    status character varying(80) DEFAULT 'New'::character varying,
    internal_notes jsonb DEFAULT '[]'::jsonb,
    status_history jsonb DEFAULT '[]'::jsonb,
    notification_delivered boolean DEFAULT false,
    source_ip character varying(100) DEFAULT ''::character varying,
    submission_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT project_requests_pkey PRIMARY KEY (id),
    CONSTRAINT project_requests_request_id_key UNIQUE (request_id)
);

-- -------------------------------------------------------------
-- Table: project_attachments (Secure Reference Files for Projects)
-- -------------------------------------------------------------
CREATE TABLE public.project_attachments (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1),
    attachment_id character varying(60) NOT NULL,
    project_request_id character varying(40) NOT NULL,
    file_name character varying(255) NOT NULL,
    mime_type character varying(120) NOT NULL,
    size_bytes integer NOT NULL,
    content_base64 text NOT NULL,
    uploaded_by character varying(255) DEFAULT ''::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT project_attachments_pkey PRIMARY KEY (id),
    CONSTRAINT project_attachments_attachment_id_key UNIQUE (attachment_id),
    CONSTRAINT project_attachments_req_fkey FOREIGN KEY (project_request_id)
        REFERENCES public.project_requests (request_id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Table: consultation_requests (Project Consultation Calls)
-- -------------------------------------------------------------
CREATE TABLE public.consultation_requests (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1),
    request_id character varying(40) NOT NULL,
    linked_project_request_id character varying(40) DEFAULT NULL,
    customer_name character varying(255) NOT NULL,
    business_email character varying(255) NOT NULL,
    phone_number character varying(100) NOT NULL,
    company_name character varying(255) NOT NULL,
    country character varying(120) NOT NULL,
    preferred_contact_method character varying(80) DEFAULT 'Video Consultation (Google Meet / Zoom)'::character varying,
    preferred_date character varying(40) DEFAULT ''::character varying,
    preferred_time character varying(80) DEFAULT ''::character varying,
    confirmed_date character varying(40) DEFAULT ''::character varying,
    confirmed_time character varying(80) DEFAULT ''::character varying,
    meeting_link character varying(500) DEFAULT ''::character varying,
    selected_categories jsonb DEFAULT '[]'::jsonb,
    selected_services jsonb DEFAULT '[]'::jsonb,
    project_summary text NOT NULL,
    assigned_team_member character varying(255) DEFAULT 'Unassigned'::character varying,
    status character varying(80) DEFAULT 'New'::character varying,
    internal_notes jsonb DEFAULT '[]'::jsonb,
    appointment_history jsonb DEFAULT '[]'::jsonb,
    notification_delivered boolean DEFAULT false,
    source_ip character varying(100) DEFAULT ''::character varying,
    submission_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT consultation_requests_pkey PRIMARY KEY (id),
    CONSTRAINT consultation_requests_request_id_key UNIQUE (request_id)
);

CREATE INDEX idx_proj_req_status ON public.project_requests USING btree (status);
CREATE INDEX idx_proj_req_email ON public.project_requests USING btree (business_email);
CREATE INDEX idx_proj_req_sub_date ON public.project_requests USING btree (submission_date DESC);
CREATE INDEX idx_proj_att_req ON public.project_attachments USING btree (project_request_id);
CREATE INDEX idx_cons_req_status ON public.consultation_requests USING btree (status);
CREATE INDEX idx_cons_req_email ON public.consultation_requests USING btree (business_email);
CREATE INDEX idx_cons_req_slot ON public.consultation_requests USING btree (preferred_date, preferred_time);
CREATE INDEX idx_cons_req_sub_date ON public.consultation_requests USING btree (submission_date DESC);


