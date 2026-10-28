# Oxoo Central Environment Variables Specification

**Service:** Oxoo Central Control Plane (`oxoo.ai`)  
**Security Policy:** Zero plaintext secrets in database. Keep client secrets, signing keys, and provider tokens in secure environment configurations or Secret Manager.

---

## 1. Core Server & Central Issuer

| Variable Name | Required | Default / Example | Purpose / Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | `5000` | Port on which the Oxoo Central Express server listens. |
| `NODE_ENV` | Yes | `production` / `development` | Runtime environment. In production, hides internal stack traces. |
| `OXOO_CENTRAL_ISSUER` | Yes | `https://api.oxoo.ai/api/v1/oxoo` | OIDC Issuer URL stamped into JWT tokens and discovery metadata. |
| `FRONTEND_URL` | Yes | `https://oxoo.ai,http://localhost:5173` | Allowed CORS origins for web applications and tenant dashboards. |

---

## 2. Cryptography & Authentication

| Variable Name | Required | Default / Example | Purpose / Description |
| :--- | :--- | :--- | :--- |
| `JWT_SECRET` | Yes | *Cryptographically strong secret* | HMAC SHA-256 key used to sign and verify OIDC ID tokens, access tokens, and session JWTs. |
| `ADMIN_API_KEY` | Yes | *Cryptographically strong secret* | Secret key for machine-to-machine administrative operations and auditable entitlement controls. |

---

## 3. Database Connection

| Variable Name | Required | Default / Example | Purpose / Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | `postgresql://...@ep-....neon.tech/neondb?sslmode=require` | Authoritative Neon PostgreSQL database connection string. |

---

## 4. Notifications & Controlled Verification Services

| Variable Name | Required | Default / Example | Purpose / Description |
| :--- | :--- | :--- | :--- |
| `BREVO_SMTP_LOGIN` | Yes | `bf9694001@smtp-brevo.com` | Brevo SMTP account for transactional email OTP verification. |
| `BREVO_API_KEY` | Yes | `xkeysib-...` | Brevo API key for transactional emails and welcome credentials. |
| `BREVO_SENDER_EMAIL` | Yes | `notifications@oxoo.ai` | Verified email sender address for OTP delivery. |
| `ENABLE_SMS_OTP` | Optional | `false` (default) / `true` | Flag enabling live SMS OTP dispatch via Fast2SMS / Twilio. |
| `FAST2SMS_API_KEY` | Conditional | *API Key* | Provider API key when `ENABLE_SMS_OTP=true`. |

---

## 5. Approved OIDC Client Registry (Product IDs)

*Note: These client IDs are public identifiers registered in `oxoo_product_registry`. Associated product client secrets must reside in each product's local environment.*

- **HRMS (Employee360):** `oxoo-oidc-hrms`
- **Finance (Invoice360):** `oxoo-oidc-finance`
- **CRM (SalesWorks360):** `oxoo-oidc-crm`
- **Supply Chain (SupplyChain360):** `oxoo-oidc-inventory`
- **AI Sales Agent Studio:** `oxoo-oidc-aisales`
- **Website Builder & Web Apps:** `oxoo-oidc-website`
