# Employee360 Frontend Demo

A modern, full-featured SaaS HR Management Platform prototype running entirely in the browser with zero backend or database dependencies.

## Quick Start

1. `npm install`
2. `npm run dev`

Open your browser to `http://localhost:5173`.

---

## Demo Access

The demo opens directly on the dashboard with a built-in administrator session. No login is required. The login and registration screens remain available for demonstrating those flows.

---

## Key Features & Modules

- **Authentication Simulation**: Frontend-only session persistence using `localStorage`, with automatic demo access on startup.
- **Executive Dashboard**: Key metrics (active employees, attendance rate, leave requests, payroll run status) with department distributions and quick actions.
- **Employee Directory**: Complete roster (Alex Johnson, Sarah Williams, Michael Brown, Priya Sharma, David Wilson, etc.) with search, department filtering, and detailed profile viewing.
- **Attendance Management**: Daily check-in/check-out toggle, facial recognition simulation, and monthly attendance tracking.
- **Leave Management**: Leave balances (Casual, Sick, Earned, Parental), request submission with simulated local state, and approval status tracking.
- **Payroll**: Salary breakdowns (Basic, HRA, Allowances, PF, Tax), slip generation, and payout tracking.
- **Reports & Analytics**: Comprehensive exports for headcount, departmental distribution, attendance rates, and leaves.
- **Work Mode**: Hybrid, Remote (WFH), and Office scheduling workflows.
- **Settings & Profile**: Customizable profile, company preferences, and role settings.
- **🔒 Premium Tier Showcase**:
  - **WorkHub**
  - **Team Tasks**
  - **Need a Hand**
  
  These modules display a modern **Feature Locked** paywall screen with "Upgrade to Professional" prompts and "Back to Dashboard" controls.

---

## Technology Stack

- **Framework**: React 19 + Vite 8
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **Offline Mock Engine**: In-memory & LocalStorage simulated REST API (Zero network calls, 0 errors, no MongoDB/Express required).
