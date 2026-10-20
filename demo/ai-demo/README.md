# Hospital Cart — Live Demo

A self-contained, interactive demo of the Hospital Cart dashboard (the `u8u-ai` codebase), meant to be
linked from the company website ("View Live Demo" / "Try Demo").

**No database. No server-side secrets. No third-party accounts.** The original UI components, styles and
pages are used as-is; every `/api/*` call the UI makes is answered **inside the visitor's browser** from
fictional sample data (`src/demo/`). Changes a visitor makes (book / confirm / cancel appointments, add
patients, add leads, create sequences, …) are stored in that visitor's own `localStorage` — they never reach
any server and never affect anyone else.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000   (opens on the sign-in page)
```

Entry points
| URL | What it does |
|---|---|
| `/demo` | **Use this from the company website.** Starts a demo session and opens the dashboard — no login screen. |
| `/sign-in` | Original sign-in design, demo credentials pre-filled: `demo@hospitalcart.demo` / `demo1234`. |
| `/dashboard/overview` | Dashboard (redirects to `/sign-in` when there is no demo session). |
| `/landing` | The original product landing page, kept for fidelity (not linked from the demo). |

## Build, test, deploy

```bash
npm run build && npm start        # production build, http://localhost:3000
npm run typecheck                 # tsc --noEmit
npm run lint                      # next lint
npm run test:demo                 # 44 assertions against the demo API layer (no server needed)
```

Browser end-to-end checks (Python + Playwright + Chromium) are in `scripts/e2e/` — start the app first
(`npm run build && npm start -- -p 3100`), then `python3 scripts/e2e/ui_check.py`, `ui_flow.py`,
`responsive_check.py` (they expect `http://localhost:3100`).

### Deploy options
* **Vercel / Netlify (simplest):** import the repo, framework "Next.js", build `npm run build`. No environment
  variables are required. Assign the domain `hospital-cart-demo.<your-domain>`.
* **Any Node host / Docker:** `npm ci && npm run build && npm start` (Node 18.18+; set `PORT`).
* **Sub-path instead of subdomain** (e.g. `https://<your-domain>/demos/hospital-cart`): build with
  `NEXT_PUBLIC_BASE_PATH=/demos/hospital-cart` and reverse-proxy that path to the app. A subdomain is
  recommended — it needs no proxy rules.

Refreshing or deep-linking any route (e.g. `/dashboard/appointments`) works; routes are served by Next.js.

### Configuration (all optional — see `.env.example`)
`NEXT_PUBLIC_PRODUCT_NAME`, `NEXT_PUBLIC_HOSPITAL_NAME`, `NEXT_PUBLIC_BASE_PATH`. These are public build-time
values. There are no secrets in this project.

> The layout loads the **Inter** font through `next/font/google` (as the original does). The build machine
> therefore needs outbound access to fonts.googleapis.com. Normal CI/Vercel builds have it.

## Connect it to the company website

Replace the existing product button/link with a normal link (new tab recommended):

```html
<a href="https://hospital-cart-demo.YOUR-DOMAIN.com/demo" target="_blank" rel="noopener">View Live Demo</a>
```

Sub-path variant: `href="/demos/hospital-cart/demo"`. Use `/sign-in` instead of `/demo` if you prefer visitors
to see the login screen first. An iframe is not needed; if you must embed, allow framing of the demo host
(no `X-Frame-Options`/CSP `frame-ancestors` is set by this project) and note that browsers may block
`localStorage` in third-party iframes — a normal link avoids that.

The company website's source was not provided, so no changes were made to it.

## How the demo behaves

* **Data & reset:** ~44 patients, 34 appointments, 26 leads, 14 conversations, 14 doctors / 8 departments,
  3 AI agents, 3 sequences, 58 call-log rows — all fictional (`@example.com` addresses, `+91 90000 …` numbers).
  Dates are generated relative to today. **Reset demo data** (top bar) restores the original sample state.
* **"Demo Environment" badge** in the top bar; the sign-in page states the demo credentials.
* **Simulated integrations (clearly labelled "simulated"/"demo"):** outbound calls, WhatsApp/SMS/e-mail
  reminders and confirmations, scheduler/dialer runs, the website chat assistant (a small scripted
  rule-based assistant, **not** the production LLM/RAG agent). Nothing is ever sent.
* **Disabled in the demo (HTTP 501 with an explanatory message):** Excel import of patients/leads, bulk dialer
  upload, conversation export, AI-agent "setup from website URL", sign-up.
* **Profile page:** the original embeds a hosted auth-provider widget that needs production credentials; the
  demo shows a read-only profile/security page instead.
* **Responsive:** the original layout had a fixed 220 px sidebar and no small-screen behaviour. The demo adds
  an off-canvas sidebar (menu button) below 900 px and collapses grids; desktop is unchanged.

## What was changed vs. the original project

Kept unchanged: all pages under `src/app/dashboard/*`, the dashboard components, UI primitives, Tailwind config
and styles. Removed (server-only / production): all `src/app/api/*` routes, Prisma + schema, auth middleware,
Clerk/JWT code, Twilio/Exotel/OpenAI/Groq/SendGrid/Stripe/Redis/queue/voice-server code, cron config, `.env*`.
Added: `src/demo/*` (data, API layer, session, gate, badge, mobile nav), `/demo` page, sign-in defaults, a
demo `dashboard/layout.tsx` (no database), profile replacement, responsive CSS, tests, docs.
Branding text inside the UI (e.g. "OXOO.ai" in the sidebar, "Fuelo Technologies" in the chat widget footer)
is exactly as in the original source.

## Known limitations
* Demo data lives in the browser: a different browser/device starts from the seed, and clearing site data resets it.
* There is no real authentication — the "login" is a client-side flag. That is intentional for a public demo
  with fictional data; never put real data in this build.
* Not every secondary screen was exercised action-by-action (see the summary delivered with this project).
