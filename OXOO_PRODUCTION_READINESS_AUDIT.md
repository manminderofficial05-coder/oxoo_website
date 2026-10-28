# OXOO.ai SaaS Platform — Production Readiness & Centralization Audit

**Audit Date:** 2026-10-28  
**Audit Standard:** Comprehensive Production Readiness, Application Security & Central Control Plane Audit  
**Auditor Roles:** Senior SaaS Architect, Principal Backend Engineer, Application Security Engineer, DevOps Engineer, QA Automation Engineer  
**Overall Verdict:** **NO-GO (RELEASE BLOCKED)**  

---

## 1. Executive Summary

A comprehensive, evidence-based architectural, security, and operational audit was conducted across the entire OXOO.ai SaaS platform codebase (`backend`, `frontend`, standalone product demo packages in `demo/`, and the central delivery package in `OXOO_FINAL_CENTRALIZATION_DELIVERY/`).

While the newly introduced **Oxoo Central control plane** (`/api/v1/oxoo/*`) implements authoritative OIDC PKCE (S256), fail-closed entitlement evaluation, and controlled OTP verification, the **legacy core application and product ecosystem exhibit severe architectural and security vulnerabilities** that make the current system unsafe for production multi-tenant deployment.

### Critical Verdict Drivers (NO-GO Justification):
1. **Broken Object-Level Authorization (BOLA) & Tenant Spoofing [CRITICAL]:** The customer context resolver (`resolveCustomerContext`) in `backend/src/server.js` trusts unauthenticated client-supplied HTTP request headers (`x-user-company`, `x-user-email`) and query parameters (`?company=`, `?email=`). Any unauthenticated caller can impersonate any customer tenant, retrieving their full profile, subscriptions, team members, and billing invoices.
2. **Hardcoded Administrative Token Bypass [CRITICAL]:** A hardcoded static token (`demo-admin-jwt-token-88`) is active in `server.js` and `agentRoutes.js`. Supplying this token completely bypasses JWT signature verification and grants unauthenticated callers root `super_admin` privileges.
3. **52 Unprotected Administrative Endpoints [CRITICAL]:** The administrative router `adminModulesRoutes.js` (managing applications, invoices, staff credentials, support tickets, and report exports) is mounted in `server.js` without authentication middleware. Sensitive customer billing records and internal staff credentials are fully accessible to the public internet without authentication.
4. **Forged Payment Activation & Missing Webhooks [CRITICAL]:** The payment verification endpoint `POST /api/payment/verify` does not verify the Razorpay cryptographic HMAC-SHA256 signature. Any client can forge an order completion and receive an active enterprise subscription without paying. Furthermore, zero webhook handlers exist for Razorpay to handle chargebacks, refunds, or asynchronous renewal failures.
5. **Standalone Products Completely Disconnected from Central Control Plane [CRITICAL]:** All six standalone product applications in `demo/` (Employee360 HRMS, Invoice360 Finance, SalesWorks360 CRM, SupplyChain360, AI Sales Agent, Website Builder) operate entirely in isolated mock/demo mode. None of them validate OIDC tokens or enforce server-side entitlement checks against Oxoo Central.
6. **Insecure Direct Object Reference (IDOR) on File Attachments [HIGH]:** `GET /api/tickets/attachments/:id` allows any user on the internet to stream and download uploaded customer documents and screenshots without authentication or tenant ownership validation.

---

## 2. Category Assessment Summary

| Audit Domain | Verdict | Summary of Findings |
| :--- | :---: | :--- |
| **Authentication & SSO** | **FAIL** | Central OIDC PKCE is implemented in `/api/v1/oxoo`, but legacy `server.js` contains hardcoded token bypasses and plaintext localStorage token storage. |
| **Multi-Tenant Isolation** | **FAIL** | Core customer endpoints allow complete cross-tenant impersonation via `x-user-company` and `x-user-email` headers. |
| **Product Entitlement Control** | **FAIL** | Central entitlement API works, but connected products in `demo/` do not call it and operate completely unentitled in mock mode. |
| **Payment & Billing Integrity** | **FAIL** | No cryptographic signature verification on Razorpay callback; zero webhook handling; hardcoded fallback keys in source. |
| **Database & Data Integrity** | **PASS** | Additive schema migrations applied cleanly; canonical UUIDs present; billing cycle constraint validated; parameterized SQL queries used. |
| **API & File Upload Security** | **FAIL** | Attachment endpoint is unauthenticated; raw base64 uploaded without magic byte validation or antivirus scanning. |
| **Subdomain & DNS Routing** | **NOT VERIFIED** | Wildcard SSL and DNS routing (`*.oxoo.ai`) cannot be verified on local/free hosting tier without Cloudflare edge proxy setup. |
| **Operational & Deployment** | **FAIL** | `render.yaml` configures ephemeral free tier with potential cold-start timeouts and unpersisted generated JWT secrets. |

---

## 3. Scope and Files Inspected

- **Authoritative Control Plane:** `backend/src/oxooCentralRoutes.js`, `OXOO_FINAL_CENTRALIZATION_DELIVERY/01_OXOO_CENTRAL/*`
- **Backend Core & Middleware:** `backend/src/server.js` (6,378 lines), `backend/src/adminModulesRoutes.js` (2,570 lines), `backend/src/agentRoutes.js` (429 lines), `backend/src/db.js` (1,980 lines)
- **Configuration & Secrets:** `backend/.env`, `backend/.env.example`, `render.yaml`
- **Frontend Architecture:** `frontend/src/api.js`, `frontend/src/App.jsx`, `frontend/src/CustomerDashboard.jsx`, `frontend/src/AppWorkspace.jsx`, `frontend/src/CheckoutPage.jsx`
- **Product Codebases:** `demo/hrms-demo/`, `demo/oxoo-finance-demo/`, `demo/sales-demo/`, `demo/ai-demo/`, `demo/supply_chain/`, `demo/website-builder-demo/`
- **Test Suites:** `backend/scripts/verify_all_phases.js`, `backend/scripts/test_oxoo_central_adversarial.js`

---

## 4. Architecture and Product Integration Dependency Map

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              OXOO CENTRAL CONTROL PLANE                                │
│                     http://localhost:5000/api/v1/oxoo (oxoo.ai)                        │
│  - OIDC PKCE Authorization (/oauth/authorize, /oauth/token, /oauth/userinfo)          │
│  - Fail-Closed Entitlement Evaluation (/entitlements/check)                            │
│  - Controlled Identity Verification (OTP) & Auditable Suspension                       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │ Central API Status:        │ Central API Status:        │ Central API Status:
               ▼ Disconnected               ▼ Disconnected               ▼ Disconnected
    ┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
    │   Employee360 HRMS   │     │ Invoice360 & Finance │     │ SalesWorks360 CRM    │
    │  Location:           │     │  Location:           │     │  Location:           │
    │  demo/hrms-demo/     │     │  demo/oxoo-finance/  │     │  demo/sales-demo/    │
    │  Auth: Local Mock    │     │  Auth: Local Mock    │     │  Auth: Local Mock    │
    │  Entitlement: None   │     │  Entitlement: None   │     │  Entitlement: None   │
    └──────────────────────┘     └──────────────────────┘     └──────────────────────┘
               │                            │                            │
               ▼ Disconnected               ▼ Disconnected               ▼ Disconnected
    ┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
    │   SupplyChain360     │     │ AI Sales Agent Studio│     │   Website Builder    │
    │  Location:           │     │  Location:           │     │  Location:           │
    │  demo/supply_chain/  │     │  demo/ai-demo/       │     │  demo/website-demo/  │
    │  Auth: Local Mock    │     │  Auth: Local Mock    │     │  Auth: Local Mock    │
    │  Entitlement: None   │     │  Entitlement: None   │     │  Entitlement: None   │
    └──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

**Finding:** There is currently a complete decoupling between the central control plane and the product implementations in `demo/`. The product teams have not yet integrated the client OIDC PKCE flow or entitlement authorization middleware.

---

## 5. Detailed Findings & Vulnerability Evidence

### Finding ID: BOLA-01
- **Severity:** `CRITICAL`
- **Status:** `VERIFIED`
- **Affected Component:** `backend/src/server.js:1666-1745`, `backend/src/server.js:1783-1825`
- **Evidence:**
  ```javascript
  // backend/src/server.js lines 1666-1668
  async function resolveCustomerContext(req) {
    let userEmail = (req.headers['x-user-email'] || req.query.email || req.body?.email || '').trim().toLowerCase();
    let userCompany = (req.headers['x-user-company'] || req.query.company || req.body?.company || req.body?.companyName || '').trim();
  ```
- **Reproduction Steps:**
  1. Make an unauthenticated HTTP request:
     ```bash
     curl -H "x-user-company: RetailMart Solutions" -H "x-user-email: alex.rivera@retailmart.com" http://localhost:5000/api/customer/overview
     curl -H "x-user-company: RetailMart Solutions" -H "x-user-email: alex.rivera@retailmart.com" http://localhost:5000/api/customer/team
     curl -H "x-user-company: RetailMart Solutions" -H "x-user-email: alex.rivera@retailmart.com" http://localhost:5000/api/customer/billing
     ```
  2. Observe HTTP 200 returned with full customer data, team roster (names, emails, active app permissions), and paid invoices.
- **Business Impact:** Catastrophic multi-tenant data exposure. Any competitor or user can dump entire customer bases, employee rosters, and revenue records by guessing company names.
- **Recommended Fix:** Deprecate `resolveCustomerContext` header sniffing. Enforce `verifyToken` on all customer routes and derive tenant identity strictly from `req.user.oxoo_organization_uuid`.
- **Regression Test:** Send request with spoofed `x-user-company` and assert that HTTP 401/403 is returned.

---

### Finding ID: AUTH-01
- **Severity:** `CRITICAL`
- **Status:** `VERIFIED`
- **Affected Component:** `backend/src/server.js:128-132`, `backend/src/agentRoutes.js:58-61`
- **Evidence:**
  ```javascript
  // backend/src/server.js lines 128-131
  const token = authHeader.split(' ')[1];
  if (token === 'demo-admin-jwt-token-88') {
    req.adminUser = { id: 1, role: 'super_admin', name: 'Manminder Singh' };
    return next();
  }
  ```
- **Reproduction Steps:**
  1. Call privileged admin endpoint with the static token:
     ```bash
     curl -H "Authorization: Bearer demo-admin-jwt-token-88" http://localhost:5000/api/admin/overview
     ```
  2. The server responds with HTTP 200 and full platform metrics, granting unrestricted Super Admin access.
- **Business Impact:** Permanent backdoor into the platform granting total administrative control.
- **Recommended Fix:** Delete the hardcoded token bypass check immediately.
- **Regression Test:** Request `/api/admin/overview` with `demo-admin-jwt-token-88` and assert HTTP 401 Invalid Token.

---

### Finding ID: BFLA-01
- **Severity:** `CRITICAL`
- **Status:** `VERIFIED`
- **Affected Component:** `backend/src/server.js:4299-4301`, `backend/src/adminModulesRoutes.js:1-2570`
- **Evidence:**
  ```javascript
  // backend/src/server.js line 4300
  const adminModulesRouter = require('./adminModulesRoutes');
  app.use('/api/admin', adminModulesRouter);
  ```
  `adminModulesRoutes.js` defines 52 routes without router-level `requireAdminAuth`.
- **Reproduction Steps:**
  1. Run curl without headers:
     ```bash
     curl http://localhost:5000/api/admin/invoices
     curl http://localhost:5000/api/admin/staff
     curl http://localhost:5000/api/admin/applications
     ```
  2. Observe full invoices list, internal staff emails, and application service keys dumped without authentication.
- **Business Impact:** Massive compliance violation (GDPR, SOC2, PCI-DSS). Leakage of staff credentials and financial invoices.
- **Recommended Fix:** Apply `adminModulesRouter.use(requireAdminAuth)` as the very first middleware in `adminModulesRoutes.js`.
- **Regression Test:** Call `/api/admin/invoices` without credentials and assert HTTP 401 Unauthorized.

---

### Finding ID: PAY-01
- **Severity:** `CRITICAL`
- **Status:** `VERIFIED`
- **Affected Component:** `backend/src/server.js:6072-6150`
- **Evidence:**
  ```javascript
  // backend/src/server.js lines 6072-6089
  app.post('/api/payment/verify', async (req, res, next) => {
    const { orderNumber, paymentId, companyName, selectedApps, planName, totalAmount } = req.body || {};
    const verifiedPaymentId = paymentId || `pay_rzp_${Date.now().toString().slice(-8)}`;
    // NO crypto.createHmac check against razorpay_signature!
  ```
- **Reproduction Steps:**
  1. Send a POST request to `/api/payment/verify` with arbitrary `orderNumber` and `paymentId: "fake_pay_123"`.
  2. Server updates order to `Paid`, creates an active subscription, and activates organization access.
- **Business Impact:** Complete loss of subscription revenue. Any user can generate free enterprise access.
- **Recommended Fix:** Implement mandatory HMAC-SHA256 signature verification:
  ```javascript
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  if (expectedSignature !== razorpay_signature) return res.status(400).json({ error: 'INVALID_SIGNATURE' });
  ```
- **Regression Test:** Send forged payment ID and assert HTTP 400 signature verification failure.

---

### Finding ID: FILE-02
- **Severity:** `HIGH`
- **Status:** `VERIFIED`
- **Affected Component:** `backend/src/server.js:2638-2660`
- **Evidence:**
  ```javascript
  app.get('/api/tickets/attachments/:id', async (req, res, next) => {
    const { id } = req.params;
    const q = await query(`SELECT * FROM ticket_attachments WHERE attachment_id = $1 LIMIT 1`, [id]);
    // NO verifyToken, NO company ownership verification!
  ```
- **Reproduction Steps:**
  1. Fetch `http://localhost:5000/api/tickets/attachments/att_1793136287955_8869`.
  2. Server streams binary file content without verifying caller identity.
- **Business Impact:** Unauthorized access to proprietary documents, invoice attachments, and financial screenshots.
- **Recommended Fix:** Wrap with `verifyToken` and check that `ticket_attachments.ticket_number` belongs to caller's organization.
- **Regression Test:** Request attachment as User B and assert HTTP 403 Forbidden.

---

### Finding ID: PROD-01
- **Severity:** `CRITICAL`
- **Status:** `VERIFIED`
- **Affected Component:** `demo/` (All 6 product packages)
- **Evidence:**
  Scan of `demo/` reveals zero dependencies or endpoints calling `http://localhost:5000/api/v1/oxoo/oauth/*` or `/api/v1/oxoo/entitlements/check`.
- **Reproduction Steps:**
  1. Open `demo/hrms-demo`, `demo/sales-demo`, etc.
  2. Verify that mock data is used and no authorization code or central token is requested.
- **Business Impact:** The platform is not centralized in practice; operational product databases and backends do not enforce Oxoo Central control plane rules.
- **Recommended Fix:** Complete Steps 2 through 6 of `IMPLEMENTATION_ORDER.md` to wire OIDC PKCE and entitlement validation into each product.
- **Regression Test:** Launch HRMS with revoked Oxoo entitlement and assert fail-closed access denial.

---

## 6. Authentication and SSO Assessment

- **PKCE Implementation:** The central control plane (`/api/v1/oxoo/oauth/authorize` & `/oauth/token`) properly enforces `code_challenge_method = 'S256'` and validates `code_verifier`. It successfully enforces single-use replay protection.
- **Session & Token Storage:** Frontend stores both customer tokens (`oxoo_token`) and admin tokens (`oxoo_admin_token`) in browser `localStorage`. This presents a high risk of token exfiltration in the event of any XSS vulnerability. Production architecture should transition to `HttpOnly`, `SameSite=Lax`, `Secure` session cookies.
- **Admin Authentication:** Insecure fallback keys (`adminKey === JWT_SECRET`) and default keys (`replace-with-a-long-random-secret`) are present in `server.js` and `agentRoutes.js`.

---

## 7. Multi-Tenant Isolation Assessment

- **Isolation Status:** **FAILED.**
- **Finding:** While database tables have `organization_id` or `company_name` columns, the application layer resolves context using client-controlled headers.
- **Subdomain Routing:** The endpoint `GET /api/workspace/resolve?host=...` resolves subdomains, but does not bind customer sessions cryptographically to that workspace domain. A user logged into Tenant A can make requests targeting Tenant B's data.

---

## 8. Payment and Billing Assessment

- **Order Creation:** Backend validates plan pricing (`calculatePricing`), subtotal, and tax amount server-side.
- **Verification Integrity:** **FAILED.** No cryptographic verification of Razorpay callback signatures.
- **Webhooks:** **NOT IMPLEMENTED.** Zero webhook handlers exist for asynchronous event processing.
- **Subscription Lifecycle:** Invoices and subscriptions are created directly in database on client verification call without idempotency keys.

---

## 9. Test Suite Evaluation (Core 35 vs Adversarial 42)

1. **`verify_all_phases.js` (35 Tests):**
   - **What it really tests:** Validates happy-path schema existence, inquiry formatting, spam throttling (3 min), ticket insertion, and frontend string removal.
   - **Critical Gap:** Made requests to `/api/admin/inquiries/*` without authentication headers and passed because the backend route had no authentication check! It gives a false sense of security regarding access control.
2. **`test_oxoo_central_adversarial.js` (42 Tests):**
   - **What it really tests:** Tests the newly added `/api/v1/oxoo/*` endpoints (PKCE S256 challenge, code replay burn, unverified identity rejection, foreign tenant denial, suspension fail-closed).
   - **Limitation:** Does not test the legacy customer endpoints (`/api/customer/*`) or admin modules (`/api/admin/*`), which remain vulnerable.

---

## 10. Prioritized Remediation Plan

### Phase 1: Critical Security Remediation (Pre-Launch Blockers)
1. **Patch BOLA:** Rewrite `resolveCustomerContext` to strictly use `req.user.oxoo_organization_uuid` extracted from verified JWT tokens. Require `verifyToken` on all `/api/customer/*` routes.
2. **Remove Backdoors:** Strip `demo-admin-jwt-token-88` from `server.js` and `agentRoutes.js`. Remove `adminKey === JWT_SECRET` fallback.
3. **Protect Admin Routes:** Add `requireAdminAuth` to `app.use('/api/admin', requireAdminAuth, adminModulesRouter)`.
4. **Enforce Payment Cryptography:** Implement Razorpay HMAC-SHA256 signature verification in `POST /api/payment/verify`.
5. **Secure Attachments:** Add `verifyToken` and tenant ownership checks to `GET /api/tickets/attachments/:id`.

### Phase 2: Centralization & Product Integration
1. **Product OIDC Onboarding:** Implement OIDC PKCE client flows in `hrms-demo`, `sales-demo`, `ai-demo`, and `supply_chain`.
2. **Server-Side Product Entitlements:** Integrate `POST /api/v1/oxoo/entitlements/check` in product API middleware (fail-closed rule).
3. **Razorpay Webhooks:** Build idempotent webhook listener with signature verification for `subscription.charged`, `payment.failed`, and `refund.processed`.

### Phase 3: Infrastructure & Production Hardening
1. **Production Hosting Upgrade:** Migrate backend off free-tier instance to prevent spin-down and cold-start latency.
2. **Wildcard TLS & DNS:** Configure Cloudflare edge certificates for `*.oxoo.ai`.
3. **Cookie Migration:** Transition from `localStorage` token storage to secure `HttpOnly` cookies.

---

## 11. Final Launch Checklist

- [ ] All CRITICAL BOLA vulnerabilities resolved in `/api/customer/*`.
- [ ] Hardcoded `demo-admin-jwt-token-88` removed from all backend files.
- [ ] `requireAdminAuth` enforced on all 52 `/api/admin/*` routes.
- [ ] Razorpay HMAC verification verified with test secret.
- [ ] Razorpay webhook handler implemented and tested.
- [ ] IDOR on `/api/tickets/attachments/:id` resolved.
- [ ] At least one operational product (e.g. HRMS) fully authenticated via Oxoo Central OIDC.
- [ ] Free-tier ephemeral hosting upgraded to dedicated container runtime.

---

## 12. Final Launch Verdict

**VERDICT: NO-GO**

*Production release is strictly blocked until Phase 1 critical security remediations are implemented and verified.*
