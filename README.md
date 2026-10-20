# Multiix — All-in-One Business Platform

**Multiix** is a modern, responsive all-in-one business software platform inspired by the clean, application-launcher aesthetic of Odoo.com. It unifies 24 core business applications across Finance, Sales, Operations, HR, Customer Service, Marketing, and Productivity into a single cohesive SaaS architecture.

---

## ✦ Key Features

### 1. Pixel-Perfect Homepage Hero & 24-App Launcher
- **Pure Canvas Aesthetic:** Clean white background with pale blue radial gradients, decorative dot matrix, and soft corner pastel waves.
- **Header Elements:**
  - Centered mint-green pill badge: `✦ All-in-One Business Platform`
  - Bold headline: `Your Whole Business on One Platform.` with dark navy text, green-to-cyan-to-blue gradient accent on `One Platform.`, and a curved cyan-blue underline.
  - Subtitle: `Simple, powerful, ready to grow.`
  - Trust indicators: `✓ No credit card required`, `✓ Free consultation`, `✓ Quick setup`.
- **24-App Squircle Grid:** 6-column layout across 4 rows in exact specified order:
  1. **Row 1:** Accounting, Knowledge, Sign, CRM, Studio, Subscriptions
  2. **Row 2:** AI, Point of Sale, Discuss, Documents, Project, Timesheets
  3. **Row 3:** Field Service, Planning, Helpdesk, eCommerce, Website, Email Marketing
  4. **Row 4:** Purchase, Inventory, Manufacturing, Sales, HR, Dashboard
- **Interactive Micro-Animations:** Elevated lift (`-6px`), scale (`1.05`), soft drop shadows, and accessible keyboard focus outlines.
- **Comparison Feature:** "Imagine without Multiix" toggle dynamically shows legacy SaaS license costs per tool.

### 2. Dedicated Application Workspaces (`/apps/:appSlug`)
Every application is clickable and routes to its own workspace with:
- Top breadcrumbs back to Directory and Home.
- Real-time KPIs (revenue, active users, resolution time, completion rates).
- Searchable records table with status filtering and export capabilities.
- Live interactive simulators:
  - **AI Workspace:** Interactive enterprise reasoning and trend analysis console.
  - **Point of Sale (POS):** Fast-checkout touch register and cart simulator.
  - **Discuss:** Live team channel chat and notifications.
- Capabilities specification and quick switcher across all 24 apps.

### 3. Application Directory & Search Catalog (`/services` or `/apps`)
- Real-time search across app names, descriptions, and feature tags.
- 8 Business Category filter tabs:
  - `Finance`
  - `Sales`
  - `Operations`
  - `Human Resources`
  - `Customer Service`
  - `Marketing`
  - `Productivity`
  - `Administration`
- Clear search control and keyboard navigation (`ESC` to reset).
- Empty state with reset action.

### 4. Admin Dashboard (`/admin`)
- Accessible to Super Admins and Org Admins.
- **System Health:** Gateway status, Database connectivity, active apps count.
- **App Governance:** Toggle enable/disable status for any of the 24 apps with instant state propagation and audit trail logging.
- **User Management:** View team members, assigned organizations, and security roles.
- **Inbound Inquiries:** Review submitted leads and schedule requests.
- **Immutable Audit Logs:** Timestamped actions with actor, IP, and event details.

### 5. Backend & Database Architecture
- **Framework:** Node.js + Express.js.
- **Security:** Helmet, CORS whitelisting, Express Rate Limit (300 req / 15 min).
- **Authentication:** JWT tokens (`bcryptjs` hashing, 7-day expiration).
- **Mongoose Models:**
  - `User`: Email, password hash, role (`superadmin`, `orgadmin`, `member`), organization reference.
  - `Organization`: Company profile, plan, max users, enabled applications array.
  - `Application`: App identifier, name, category, enabled state, icon and meta.
  - `AuditLog`: Action, target, actor, IP address, timestamp.
  - `Lead`: Inbound enterprise inquiries, demo requests, contact preferences.
  - `Category` & `Service`: Catalog taxonomy and descriptions.
- **Resilient Fallback Mode:** Operates seamlessly in local demo mode when MongoDB Atlas is offline or not configured.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Lucide React, Framer Motion |
| Styling | Modern CSS3 (CSS Grid, Flexbox, Custom Properties) |
| Routing | React Router v7 |
| Icons | Custom high-resolution SVG & antialiased PNG assets |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas / Mongoose |
| Security | Helmet, CORS, Rate Limiting, JWT, Bcrypt |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm 9+
- (Optional) MongoDB Atlas account

### 1. Installation

Clone or extract the project archive:
```bash
cd multiix
```

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### 2. Environment Configuration

Backend configuration:
```bash
cd ../backend
cp .env.example .env
```
Edit `.env` if connecting to a live MongoDB Atlas cluster:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/multiix?retryWrites=true&w=majority
JWT_SECRET=your-secure-jwt-secret-key
```

Frontend configuration:
```bash
cd ../frontend
cp .env.example .env
```
Ensure `VITE_API_URL` points to `http://localhost:5000` (or your deployed backend).

### 3. Run Locally

Open two terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
Backend will start on `http://localhost:5000`.

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Frontend will be available at `http://localhost:5173`.

---

## 🔑 Demo Login Credentials

For quick testing on the `/signin` screen:
- **Admin Access:**
  - Email: `admin@multiix.io`
  - Password: `multiix123`
  - Access: Redirects to `/admin`
- **Customer / Member Access:**
  - Email: `priya@retailmart.in`
  - Password: `multiix123`
  - Access: Redirects to `/apps/dashboard`

*(1-Click Demo Buttons are available on the Sign In page for instant authentication).*

---

## 📡 API Reference

### Public Endpoints
- `GET /api/health` — Gateway health and database connection status.
- `GET /api/apps` — Returns all 24 applications in specified order.
- `GET /api/services` — Returns consulting services catalog.
- `POST /api/leads` — Submits contact enquiry or demo booking.

### Authentication Endpoints
- `POST /api/auth/register` — Registers new organization user.
- `POST /api/auth/login` — Authenticates user and returns JWT token.
- `GET /api/auth/me` — Returns current authenticated profile (requires Bearer token).

### Admin Endpoints (Requires Bearer Token)
- `GET /api/admin/overview` — Aggregated metrics for health, apps, users, and audit logs.
- `PATCH /api/admin/apps/:id/toggle` — Toggles application enabled state.
- `GET /api/admin/audit-logs` — Retrieves immutable system activity logs.

---

## 📦 Production Build & Packaging

Build frontend production bundle:
```bash
cd frontend
npm run build
```
The output will be placed in `frontend/dist/`.

To run backend tests / linting:
```bash
cd ../backend
npm test
```

---

## 🛡️ License & Branding
Multiix is built as an independent SaaS business platform. Odoo is referenced only as visual and structural layout inspiration. All Multiix branding, vector logos, icons, and codebase are proprietary assets.
