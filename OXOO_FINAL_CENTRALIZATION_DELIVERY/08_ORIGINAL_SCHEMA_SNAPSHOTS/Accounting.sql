CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
 password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS companies (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 legal_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, website TEXT, gstin TEXT, pan TEXT,
 address TEXT, city TEXT, state TEXT, postal_code TEXT, country TEXT NOT NULL DEFAULT 'India', currency CHAR(3) NOT NULL DEFAULT 'INR',
 financial_year_start DATE NOT NULL DEFAULT '2026-04-01', tax_system TEXT NOT NULL DEFAULT 'GST',
 invoice_prefix TEXT NOT NULL DEFAULT 'INV', payment_terms TEXT NOT NULL DEFAULT '30 Days', logo_url TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS company_members (
 company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 role TEXT NOT NULL DEFAULT 'owner' CHECK(role IN ('owner','admin','accountant','viewer')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(company_id,user_id)
);
CREATE TABLE IF NOT EXISTS finance_records (
 id TEXT NOT NULL, company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
 collection TEXT NOT NULL, payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(company_id,collection,id)
);
CREATE INDEX IF NOT EXISTS finance_records_collection_idx ON finance_records(company_id,collection);
CREATE INDEX IF NOT EXISTS companies_owner_idx ON companies(owner_user_id);
CREATE TABLE IF NOT EXISTS invoice_payments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
 invoice_id TEXT NOT NULL,
 customer_id TEXT,
 receipt_number TEXT NOT NULL,
 amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
 payment_date DATE NOT NULL,
 payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash','UPI','Bank Transfer','Cheque','Card','Other')),
 reference_number TEXT,
 idempotency_key UUID,
 notes TEXT,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS invoice_payments_company_invoice_idx ON invoice_payments(company_id,invoice_id,payment_date,created_at);
CREATE UNIQUE INDEX IF NOT EXISTS invoice_payments_idempotency_idx ON invoice_payments(company_id,idempotency_key) WHERE idempotency_key IS NOT NULL;
ALTER TABLE invoice_payments ADD COLUMN IF NOT EXISTS receipt_number TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS invoice_payments_receipt_number_idx ON invoice_payments(company_id,receipt_number);
CREATE TABLE IF NOT EXISTS invoice_payment_audit (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
 invoice_id TEXT NOT NULL,
 payment_id UUID NOT NULL,
 action TEXT NOT NULL CHECK (action IN ('created','updated','deleted')),
 before_data JSONB,
 after_data JSONB,
 actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS invoice_payment_audit_invoice_idx ON invoice_payment_audit(company_id,invoice_id,created_at);
