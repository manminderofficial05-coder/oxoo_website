# Oxoo Central Authoritative Control Plane API Contract

**Version:** 1.0.0  
**Authority:** Oxoo Central (`oxoo.ai`)  
**Base URL:** `http://localhost:5000/api/v1/oxoo` (Production: `https://api.oxoo.ai/api/v1/oxoo`)  
**Security Model:** OIDC Authorization Code + PKCE (S256), Signed JWT, Server-Side Entitlement Validation (Fail-Closed)

---

## 1. OpenID Connect Discovery & Configuration

### `GET /.well-known/openid-configuration`
Returns the authoritative metadata for identity verification and token generation.

**Response `200 OK`**:
```json
{
  "issuer": "http://localhost:5000/api/v1/oxoo",
  "authorization_endpoint": "http://localhost:5000/api/v1/oxoo/oauth/authorize",
  "token_endpoint": "http://localhost:5000/api/v1/oxoo/oauth/token",
  "userinfo_endpoint": "http://localhost:5000/api/v1/oxoo/oauth/userinfo",
  "jwks_uri": "http://localhost:5000/api/v1/oxoo/.well-known/jwks.json",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code"],
  "code_challenge_methods_supported": ["S256"],
  "scopes_supported": [
    "openid",
    "profile",
    "email",
    "phone",
    "oxoo:tenant",
    "oxoo:entitlements"
  ],
  "claims_supported": [
    "sub",
    "iss",
    "aud",
    "oxoo_user_uuid",
    "oxoo_organization_uuid",
    "name",
    "email",
    "email_verified",
    "phone",
    "phone_verified",
    "identity_status",
    "entitlements",
    "roles"
  ]
}
```

---

## 2. Product Routing & Registry

### `GET /products`
Retrieves enabled operational products registered with Oxoo Central.

**Response `200 OK`**:
```json
{
  "products": [
    {
      "product_code": "hrms",
      "display_name": "Employee360 HRMS",
      "base_url": "http://localhost:5173/demo/hrms",
      "oidc_client_id": "oxoo-oidc-hrms",
      "enabled": true
    },
    {
      "product_code": "finance",
      "display_name": "Invoice360 & Finance",
      "base_url": "http://localhost:5173/demo/finance",
      "oidc_client_id": "oxoo-oidc-finance",
      "enabled": true
    },
    {
      "product_code": "crm",
      "display_name": "SalesWorks360 CRM",
      "base_url": "http://localhost:5173/demo/sales",
      "oidc_client_id": "oxoo-oidc-crm",
      "enabled": true
    },
    {
      "product_code": "inventory",
      "display_name": "SupplyChain360",
      "base_url": "http://localhost:5173/demo/supply-chain",
      "oidc_client_id": "oxoo-oidc-inventory",
      "enabled": true
    },
    {
      "product_code": "ai_sales",
      "display_name": "AI Sales Agent Studio",
      "base_url": "http://localhost:5173/demo/ai",
      "oidc_client_id": "oxoo-oidc-aisales",
      "enabled": true
    },
    {
      "product_code": "website_builder",
      "display_name": "OXOO Website Builder & Applications",
      "base_url": "http://localhost:5173/demo/website-demo",
      "oidc_client_id": "oxoo-oidc-website",
      "enabled": true
    }
  ]
}
```

---

## 3. OIDC / PKCE Authentication Flow

### `POST /oauth/authorize`
Requests an authorization code using PKCE S256 challenge.

**Request Body**:
```json
{
  "client_id": "oxoo-oidc-crm",
  "redirect_uri": "http://localhost:5173/demo/sales",
  "response_type": "code",
  "code_challenge": "E9Mel-Jfxo6PTGwYbKX10NQw07D9Sgx50IydNxxNW94",
  "code_challenge_method": "S256",
  "scope": "openid profile email oxoo:entitlements",
  "state": "xyz_client_state_nonce",
  "oxoo_user_uuid": "1fc01a0c-a927-4a8e-9fd9-a5933738322a"
}
```

**Response `200 OK`**:
```json
{
  "code": "oxoo_auth_4f98a28...",
  "state": "xyz_client_state_nonce",
  "expires_in": 300,
  "redirect_uri": "http://localhost:5173/demo/sales"
}
```

### `POST /oauth/token`
Exchanges authorization code for JWT access token and ID token. **Enforces replay protection** (code is invalidated immediately upon first use).

**Request Body**:
```json
{
  "grant_type": "authorization_code",
  "client_id": "oxoo-oidc-crm",
  "code": "oxoo_auth_4f98a28...",
  "code_verifier": "dBjftJeZ4CVP-mB92K27uhbUJu1p1r_wW1gFWFOEjXk",
  "redirect_uri": "http://localhost:5173/demo/sales"
}
```

**Response `200 OK`**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "id_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "scope": "openid profile email oxoo:entitlements"
}
```

### `GET /oauth/userinfo`
Retrieves authenticated identity claims.

**Headers**: `Authorization: Bearer <access_token>`

**Response `200 OK`**:
```json
{
  "sub": "1fc01a0c-a927-4a8e-9fd9-a5933738322a",
  "oxoo_user_uuid": "1fc01a0c-a927-4a8e-9fd9-a5933738322a",
  "oxoo_organization_uuid": "3ff40498-fbc1-4d6f-83c3-8e0d435fa5e2",
  "name": "Aarav Mehta",
  "email": "aarav.mehta@innovatech.io",
  "email_verified": true,
  "email_verified_at": "2026-10-28T05:00:00.000Z",
  "phone": "+919876543210",
  "phone_verified": true,
  "identity_status": "active",
  "role": "member",
  "entitlements": ["crm", "finance"]
}
```

---

## 4. Authoritative Entitlement Evaluation (Fail-Closed)

### `POST /entitlements/check`
Server-side authoritative evaluation of product entitlement. Access is denied if identity is unverified, organization is inactive, or entitlement is expired/suspended.

**Request Body**:
```json
{
  "oxoo_organization_uuid": "3ff40498-fbc1-4d6f-83c3-8e0d435fa5e2",
  "oxoo_user_uuid": "1fc01a0c-a927-4a8e-9fd9-a5933738322a",
  "product_code": "crm"
}
```

**Response `200 OK` (Allowed)**:
```json
{
  "allowed": true,
  "status": "active",
  "product_code": "crm",
  "oxoo_organization_uuid": "3ff40498-fbc1-4d6f-83c3-8e0d435fa5e2",
  "oxoo_user_uuid": "1fc01a0c-a927-4a8e-9fd9-a5933738322a",
  "limits": {
    "max_users": 25,
    "storage_gb": 50
  },
  "ends_at": "2027-10-28T04:28:41.504Z",
  "evaluated_at": "2026-10-28T05:01:00.000Z"
}
```

**Response `403 Forbidden` (Denied Examples)**:
- **Unverified Contacts**:
  ```json
  {
    "allowed": false,
    "error_code": "CONTACT_UNVERIFIED",
    "reason": "Access denied: Identity email/phone verification has not been completed. OTP verification required."
  }
  ```
- **Suspended Entitlement (Data Retained)**:
  ```json
  {
    "allowed": false,
    "error_code": "ENTITLEMENT_SUSPENDED",
    "reason": "Entitlement to 'crm' is suspended: Non-payment policy. Business data retained.",
    "suspended_at": "2026-10-28T05:00:50.000Z"
  }
  ```
- **Cross-Tenant Violation**:
  ```json
  {
    "allowed": false,
    "error_code": "ORGANIZATION_NOT_FOUND",
    "reason": "The specified organization tenant does not exist in Oxoo Central."
  }
  ```

---

## 5. Controlled Identity Verification (OTP)

### `POST /identity/request-otp`
Triggers an OTP verification challenge.
```json
{
  "oxoo_user_uuid": "1fc01a0c-a927-4a8e-9fd9-a5933738322a",
  "type": "email"
}
```

### `POST /identity/verify-otp`
Validates the OTP challenge. When verified, records `email_verified_at` / `phone_verified_at` and transitions `identity_status` to `active`.
```json
{
  "oxoo_user_uuid": "1fc01a0c-a927-4a8e-9fd9-a5933738322a",
  "type": "email",
  "otp": "489201"
}
```

---

## 6. Auditable Suspension & Reactivation (Non-Destructive)

### `POST /entitlements/suspend`
Suspends access without deleting customer records.
```json
{
  "oxoo_organization_uuid": "3ff40498-fbc1-4d6f-83c3-8e0d435fa5e2",
  "product_code": "crm",
  "reason": "Invoice unpaid after 14 days"
}
```
**Response**:
```json
{
  "message": "Entitlement to crm suspended successfully. All tenant data is strictly preserved.",
  "data_retention_guarantee": "Zero data deleted. Operational database records preserved."
}
```

### `POST /entitlements/reactivate`
Restores entitlement to active.
```json
{
  "oxoo_organization_uuid": "3ff40498-fbc1-4d6f-83c3-8e0d435fa5e2",
  "product_code": "crm"
}
```

---

## 7. Tenant & Canonical Resolution

### `GET /tenants/resolve?oxoo_organization_uuid=3ff40498-fbc1-4d6f-83c3-8e0d435fa5e2`
Resolves tenant context, custom domains, and active product entitlements.
