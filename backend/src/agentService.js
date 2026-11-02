require('dotenv').config();
const dns = require('dns');
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {}

const { query } = require('./db');

// In-memory knowledge cache (15s short TTL so admin edits auto-reflect quickly)
let cachedKnowledge = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15 * 1000;

/**
 * Invalidate agent knowledge cache immediately (called on admin updates to apps/plans/services)
 */
function invalidateAgentKnowledgeCache() {
  cachedKnowledge = null;
  lastCacheTime = 0;
}

/**
 * Fetch and compile live product, plan, application, and service knowledge directly from Neon PostgreSQL
 */
async function getLiveKnowledge(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedKnowledge && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedKnowledge;
  }

  try {
    const [appsRes, plansRes, servicesRes, catsRes, settingsRes] = await Promise.all([
      query(`
        SELECT id, slug, name, category, tagline, description, features, main_color, bg_color
        FROM applications
        WHERE enabled = true
        ORDER BY sort_order ASC, name ASC
      `).catch(() => ({ rows: [] })),

      query(`
        SELECT id, plan_id, name, plan_code, category, plan_type, description,
               monthly_price, yearly_price, currency, trial_days, discount_percent,
               included_apps, entitlements, status, visibility
        FROM plans
        WHERE status = 'Active' AND visibility = 'Public'
        ORDER BY monthly_price ASC
      `).catch(() => ({ rows: [] })),

      query(`
        SELECT id, slug, name, category, description, features, featured
        FROM services
        WHERE active = true
        ORDER BY sort_order ASC, name ASC
      `).catch(() => ({ rows: [] })),

      query(`
        SELECT id, slug, name, description, services
        FROM categories
        WHERE active = true
        ORDER BY sort_order ASC, name ASC
      `).catch(() => ({ rows: [] })),

      query(`
        SELECT category, settings
        FROM platform_settings
        WHERE category IN ('company', 'general', 'agent')
      `).catch(() => ({ rows: [] }))
    ]);

    let companySettings = {};
    (settingsRes.rows || []).forEach(r => {
      if (r.settings) companySettings = { ...companySettings, ...r.settings };
    });

    cachedKnowledge = {
      applications: appsRes.rows || [],
      plans: plansRes.rows || [],
      services: servicesRes.rows || [],
      categories: catsRes.rows || [],
      company: companySettings,
      updatedAt: new Date().toISOString()
    };
    lastCacheTime = now;
    return cachedKnowledge;
  } catch (err) {
    console.error('Error fetching live agent knowledge from DB:', err.message);
    if (cachedKnowledge) return cachedKnowledge;
    return { applications: [], plans: [], services: [], categories: [], company: {}, updatedAt: new Date().toISOString() };
  }
}

/**
 * Fetch authenticated customer context securely (strictly isolated to caller's verified email)
 */
async function getCustomerContext(userEmail) {
  if (!userEmail) return null;
  const cleanEmail = String(userEmail).trim().toLowerCase();

  try {
    const [custRes, subRes, invRes, tickRes] = await Promise.all([
      query(`
        SELECT customer_id, company_name, contact_person, email, phone, plan,
               account_status, subscription_status, renewal_date, selected_apps,
               billing_cycle, amount
        FROM customers
        WHERE LOWER(email) = $1
        LIMIT 1
      `, [cleanEmail]).catch(() => ({ rows: [] })),

      query(`
        SELECT subscription_id, company_name, plan, amount, currency, billing_cycle,
               status, start_date, renewal_date, active_apps, auto_renewal
        FROM subscriptions
        WHERE LOWER(customer_id) = (
          SELECT customer_id FROM customers WHERE LOWER(email) = $1 LIMIT 1
        ) OR LOWER(company_name) = (
          SELECT company_name FROM customers WHERE LOWER(email) = $1 LIMIT 1
        )
        ORDER BY id DESC
        LIMIT 3
      `, [cleanEmail]).catch(() => ({ rows: [] })),

      query(`
        SELECT invoice_number, company_name, plan, amount, currency, status,
               invoice_date, due_date, payment_method
        FROM invoices
        WHERE LOWER(customer_email) = $1
        ORDER BY id DESC
        LIMIT 5
      `, [cleanEmail]).catch(() => ({ rows: [] })),

      query(`
        SELECT ticket_number, subject, description, priority, status, category,
               created_at, updated_at
        FROM support_tickets
        WHERE LOWER(user_email) = $1 OR LOWER(contact_email) = $1
        ORDER BY id DESC
        LIMIT 5
      `, [cleanEmail]).catch(() => ({ rows: [] }))
    ]);

    const customer = custRes.rows[0] || null;
    return {
      authenticated: true,
      email: cleanEmail,
      customer,
      subscriptions: subRes.rows || [],
      invoices: invRes.rows || [],
      tickets: tickRes.rows || []
    };
  } catch (err) {
    console.error('Error fetching customer context:', err.message);
    return { authenticated: true, email: cleanEmail, error: 'Failed to retrieve private account records.' };
  }
}

/**
 * Check AI configuration from DB platform_settings and server environment
 */
async function getAgentSettings() {
  let settings = {
    enabled: true,
    agentName: 'OXOO Agent',
    welcomeMessage: "Hi! I'm OXOO Agent. How can I help you today? Ask me about our software applications, pricing plans, custom development services, or account subscriptions.",
    suggestedQuestions: [
      'Browse all software applications',
      'Compare official pricing plans',
      'Custom website & app development',
      'Manage my subscription & invoices',
      'Contact support team'
    ],
    aiProvider: process.env.AI_PROVIDER || 'groq',
    aiModel: process.env.AI_MODEL || 'qwen/qwen3.8-27b',
    aiApiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
    rateLimitPerMinute: 60,
    retentionDays: 90,
    supportEscalationEmail: 'support@oxoo.ai',
    allowCustomerActions: true
  };

  try {
    const res = await query(`SELECT settings FROM platform_settings WHERE category = 'agent' LIMIT 1`);
    if (res.rows.length > 0 && res.rows[0].settings) {
      settings = { ...settings, ...res.rows[0].settings };
      if (!settings.aiApiKey && (process.env.AI_API_KEY || process.env.GEMINI_API_KEY)) {
        settings.aiApiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
      }
    }
  } catch (err) {
    console.warn('Could not load agent platform_settings from DB:', err.message);
  }

  // Priority auto-detection for Groq keys starting with gsk_
  const effectiveKey = (process.env.AI_API_KEY && process.env.AI_API_KEY.startsWith('gsk_'))
    ? process.env.AI_API_KEY
    : settings.aiApiKey;

  if (effectiveKey && effectiveKey.startsWith('gsk_')) {
    settings.aiProvider = 'groq';
    settings.aiApiKey = effectiveKey;
    if (!settings.aiModel || settings.aiModel.includes('gemini') || settings.aiModel.includes('gpt-4o')) {
      settings.aiModel = 'qwen/qwen3.8-27b';
    }
  }

  return settings;
}

/**
 * Call External LLM (Groq / Gemini / OpenAI API) grounded ONLY on authoritative website catalog
 */
async function callExternalAI(userMessage, conversationHistory, knowledge, customerContext, settings) {
  const apiKey = settings.aiApiKey;
  if (!apiKey || apiKey === 'your_server_side_secret') {
    return null;
  }

  const provider = (settings.aiProvider || 'groq').toLowerCase();

  // If user asks about a specific application, extract and provide its specific record
  const lowMsg = userMessage.toLowerCase();
  const relevantApp = (knowledge.applications || []).find(a => 
    lowMsg.includes(a.name.toLowerCase()) || lowMsg.includes(a.slug.toLowerCase())
  );
  let relevantAppText = '';
  if (relevantApp) {
    const feats = Array.isArray(relevantApp.features) ? relevantApp.features.join(', ') : '';
    relevantAppText = `SPECIFIC APPLICATION IN USER QUERY:
Name: ${relevantApp.name} (Slug: ${relevantApp.slug}, Category: ${relevantApp.category})
Tagline: ${relevantApp.tagline || ''}
Description: ${relevantApp.description || ''}
Features: ${feats}
Direct URL: /apps/${relevantApp.slug}`;
  }

  // Authoritative, concise system prompt (~1000 tokens) to stay well within Groq rate limits
  const systemPrompt = `You are "OXOO Agent", the official AI assistant for the OXOO cloud enterprise platform (https://oxoo.ai).
Answer questions with 100% accuracy using ONLY what is on the official OXOO website.

================================================================================
CRITICAL OPERATING RULES:
================================================================================
1. ANSWER EXACTLY WHAT IS IN THE OXOO WEBSITE. Use the facts below.
2. NEVER HALLUCINATE OR INVENT features, prices, external software, or policies.
3. If an application or feature is not in the standard suite, state:
   "That is not currently part of our standard SaaS suite, but our team can build it as a custom project via our [Projects & Consultation Hub](/projects) or you can reach us at [Help & Support Center](/help)."
4. Keep replies clear, well-structured, and helpful with Markdown bold headers and bullet points.
5. ALWAYS PROVIDE RELEVANT CLICKABLE MARKDOWN LINKS:
   - [Browse All Applications](/all-apps)
   - [View Pricing Plans](/pricing)
   - [Start 14-Day Free Trial](/checkout)
   - [Explore Live Demos](/demo)
   - [Projects & Consultation Hub](/projects)
   - [Request a Demo](/request-demo)
   - [Help & Support Center](/help)
   - [Sign in to Customer Portal](/login)
   - [Employee Login](/employee/login)

================================================================================
AUTHORITATIVE OXOO WEBSITE KNOWLEDGE:
================================================================================

1. PLATFORM OVERVIEW:
- Brand Name: OXOO (https://oxoo.ai)
- Concept: Enterprise All-in-One Cloud Operating System (Odoo-style application launcher) replacing multiple fragmented SaaS subscriptions.
- Scope: 24+ core business applications across 8 integrated software suites (48 apps total).
- Live interactive demos online without signup at [Explore Live Demos](/demo).

2. THE 8 OFFICIAL SOFTWARE SUITES (48 Apps Total):
- 1. Finance Suite: Accounting, Invoicing, Expenses, Sign, Spreadsheets, ESG. (Double-entry accounting, GST invoices, OCR receipt scanner, legal e-signatures, live finance sheets). Demo: [Finance Demo](/demo/finance)
- 2. Sales Suite: CRM, Sales Order Management, Point of Sale (POS), Subscriptions, Rental Management, Amazon Connector. (Lead pipelines, touch-screen POS, recurring billing, Amazon sync). Demo: [Sales Demo](/demo/sales)
- 3. Supply Chain Suite: Inventory, Manufacturing (MRP), Purchase Orders, Quality Control, Barcode Scanner, PLM. (Multi-warehouse stock, BOMs, vendor POs, pick-pack-ship barcode, ECOs). Demo: [Supply Chain Demo](/demo/supply-chain)
- 4. HRMS Suite: Employees, Recruitment, Time Off & Leaves, Appraisals, Payroll, Attendance. (Staff directory, ATS, automated salary slips, biometric/geo-clock-in). Demo: [HRMS Demo](/demo/hrms). Dedicated portal: [Employee Login](/employee/login)
- 5. Marketing Suite: Social Marketing, Email Marketing, SMS Marketing, Events & Ticketing, Marketing Automation, Surveys. (Omnichannel campaigns, automated nurture drip, multi-network social scheduler, CSAT surveys).
- 6. Services & Operations Suite: Project, Timesheets, Field Service, Helpdesk, Planning, Appointments. (Kanban/Gantt tasks, billable client timesheets, field technician dispatch, SLA ticket queues).
- 7. Productivity Suite: Discuss (Team Chat), Documents, To-Do, Knowledge (Wiki), VoIP Telephony, Approvals. (Team channels, OCR cloud documents, corporate wikis, in-browser calling). Demo: [Productivity Demo](/demo/productivity)
- 8. Website & E-Commerce Suite: Website Builder, eCommerce Store, Company Blog, Live Chat, Customer Portal, Forum. (Drag-and-drop website builder, responsive store with online payments, client portal). Demo: [Website Demo](/demo/website)

3. OFFICIAL PRICING PLANS & FREE TRIAL:
- 14-Day Free Trial: Available on all plans, full access to all applications, instant setup, no credit card required.
- India Pricing (INR ₹):
  * Standard Pack: ₹560 / month (billed annually at ₹6,720 + 18% GST) or ₹740 / month (billed monthly). Includes all core applications for 1 user.
  * Custom Pack: ₹980 / month base (billed annually at ₹11,760 + GST) or ₹1,280 / month (billed monthly). Built for growing businesses with Multi-Company, OXOO Studio custom field builder, external REST API access, and additional applications at ₹560/mo yearly or ₹740/mo monthly.
- International / Global Pricing (USD $) (Every country outside India):
  * Standard Pack: $20 / month (billed annually at $240/yr) or $25 / month (billed monthly). Includes all core applications for 1 user.
  * Custom Pack: $40 / month base (billed annually at $480/yr) or $50 / month (billed monthly). Includes Multi-Company, OXOO Studio, REST API access, and additional applications at $20/mo yearly or $25/mo monthly.
- Purchasing & Password Workflow:
  * Users purchase at [Start Free Trial / Subscribe](/checkout).
  * First-time buyers set their password directly at checkout, make payment, and receive an instant email with login credentials (User ID and Password) and their official Tax Invoice / Bill PDF attached.
  * Existing customers renewing or adding software receive congratulations and their updated Tax Invoice PDF (no password sent).

4. PROJECTS HUB & CUSTOM ENGINEERING SERVICES:
- URL: [Projects & Consultation Hub](/projects)
- For custom bespoke software beyond SaaS:
  * Custom Websites & Web Applications (React, Next.js, Node.js, enterprise portals, SaaS platforms).
  * Mobile Applications (iOS and Android native & cross-platform apps using React Native and Flutter).
  * WhatsApp Chat AI & Enterprise Automations (Official WhatsApp Business API integration, autonomous AI chatbots, CRM & ERP automated sync).
  * Performance Digital Marketing (SEO, Google Ads, Meta Ads).
- Engagement Options:
  * Option A: Request a Consultation Call — 30-minute discovery call with our solutions architects.
  * Option B: Submit a Project Request — 4-step wizard to outline requirements, choose budget, and attach briefs/wireframes (PDF, PNG, JPG, DOCX up to 5MB).

5. LIVE INTERACTIVE DEMOS:
- Test online without signup at [Explore Live Demos](/demo):
  * Finance Demo: [Finance Demo](/demo/finance)
  * Sales Demo: [Sales Demo](/demo/sales)
  * HRMS Demo: [HRMS Demo](/demo/hrms)
  * Supply Chain Demo: [Supply Chain Demo](/demo/supply-chain)
  * Website Builder Demo: [Website Builder Demo](/demo/website)
  * AI Demo: [AI Demo](/demo/ai)
- Guided demo booking: [Request a Guided Demo](/request-demo).

6. CUSTOMER SUPPORT & CONTACT:
- Help & Support Ticket Center: [Help & Support Center](/help)
- Email: hello@oxoo.ai / support@oxoo.ai
- Phone: +91 79 4050 0100 (Mon - Fri, 9:00 AM - 6:00 PM IST)

7. GLOBAL OFFICES:
- Head Office (Bengaluru HQ): PrimePro AI / OXOO Tech Campus, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103, India.
- Hyderabad Office: Mindspace IT Park, Building 12D, HITEC City, Hyderabad, Telangana 500081, India.
- United States Office: 8 The Green, Suite A, Dover, Delaware 19901, USA.

${relevantAppText ? `\n\n${relevantAppText}\n` : ''}
AUTHENTICATION STATE:
${customerContext && customerContext.authenticated ? `
USER IS LOGGED IN with email: ${customerContext.email}.
Customer Record: ${JSON.stringify(customerContext.customer || {})}
Subscriptions: ${JSON.stringify(customerContext.subscriptions || [])}
Invoices: ${JSON.stringify(customerContext.invoices || [])}
Support Tickets: ${JSON.stringify(customerContext.tickets || [])}
` : `
USER IS ANONYMOUS (Not logged in). Provide [Sign In](/login) if asking for personal subscription or invoices.
`}`;

  try {
    // 1. GROQ HIGH-SPEED INFERENCE (~300-600ms)
    if (provider === 'groq' || apiKey.startsWith('gsk_')) {
      const model = settings.aiModel && !settings.aiModel.includes('gemini') ? settings.aiModel : 'qwen/qwen3.8-27b';
      const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-4).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        { role: 'user', content: userMessage }
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          max_tokens: 450
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errBody = await resp.text();
        console.warn('Groq API error:', resp.status, errBody);
        return null;
      }

      const data = await resp.json();
      const replyText = data?.choices?.[0]?.message?.content;
      if (replyText) {
        return {
          reply: replyText.trim(),
          provider: 'groq',
          model
        };
      }
    } else if (provider === 'gemini') {
      const model = settings.aiModel || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents = [];
      contents.push({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }]
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        console.warn('Gemini API call failed:', resp.status, await resp.text());
        return null;
      }

      const data = await resp.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (replyText) {
        return {
          reply: replyText.trim(),
          provider: 'gemini',
          model
        };
      }
    } else if (provider === 'openai') {
      const model = settings.aiModel || 'gpt-4o-mini';
      const endpoint = 'https://api.openai.com/v1/chat/completions';

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-4).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        { role: 'user', content: userMessage }
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          max_tokens: 800
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        console.warn('OpenAI API call failed:', resp.status, await resp.text());
        return null;
      }

      const data = await resp.json();
      const replyText = data?.choices?.[0]?.message?.content;
      if (replyText) {
        return {
          reply: replyText.trim(),
          provider: 'openai',
          model
        };
      }
    }
  } catch (err) {
    console.error('External AI call error:', err.message);
  }

  return null;
}

/**
 * Intelligent Database Knowledge RAG Engine
 * Executes dynamically when external AI is unreachable or rate-limited.
 * STRICTLY uses official website records and facts!
 */
function generateDatabaseGroundedResponse(userQuery, knowledge, customerContext, aiConfigured) {
  const query = userQuery.toLowerCase().trim();
  const links = [];
  let action = null;
  let reply = '';

  // 1. GREETING & PLATFORM OVERVIEW
  if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|who are you|what is oxoo)/i.test(query)) {
    reply = `Hello! I'm **OXOO Agent**, your official assistant for the **OXOO** business operating system (https://oxoo.ai).

We offer **24+ core business applications across 8 integrated software suites**:
- **Finance Suite:** Accounting, Invoicing, Expenses, Sign, Spreadsheets, ESG.
- **Sales Suite:** CRM, Sales, Point of Sale (POS), Subscriptions, Rental, Amazon Connector.
- **Supply Chain Suite:** Inventory, Manufacturing (MRP), Purchase, Quality, Barcode, PLM.
- **HRMS Suite:** Employees, Recruitment, Time Off, Appraisals, Payroll, Attendance.
- **Marketing Suite:** Social Marketing, Email Marketing, SMS Marketing, Events, Automation, Surveys.
- **Services Suite:** Project Management, Timesheets, Field Service, Helpdesk, Planning, Appointments.
- **Productivity Suite:** Discuss (Team Chat), Documents, To-Do, Knowledge Wiki, VoIP, Approvals.
- **Website Suite:** Website Builder, eCommerce Store, Blog, Live Chat, Customer Portal, Forum.

All plans come with a **14-day free trial** with zero credit card required.`;

    links.push({ label: 'Explore All Applications', url: '/all-apps' });
    links.push({ label: 'View Pricing Plans', url: '/pricing' });
    links.push({ label: 'Explore Live Demos', url: '/demo' });
    return { reply, links, action };
  }

  // 2. PRICING & PLANS
  if (/(pricing|price|cost|plan|subscription rate|how much|package|compare|monthly|yearly|annual|rate)/i.test(query)) {
    reply = `### 💰 Official OXOO Pricing Plans

All plans include full cloud hosting, automatic updates, and a **14-day free trial** (no credit card required):

#### 🇮🇳 Inside India (INR ₹):
* **Standard Pack:** **₹560 / month** (billed annually at ₹6,720 + 18% GST) or **₹740 / month** (monthly billing). Includes all core applications for 1 user.
* **Custom Pack:** **₹980 / month base** (billed annually at ₹11,760 + GST) or **₹1,280 / month** (monthly billing). Includes Multi-Company, OXOO Studio custom field builder, external REST API access, and additional applications at ₹560/mo yearly or ₹740/mo monthly.

#### 🌍 International / Global (USD $):
* **Standard Pack:** **$20 / month** (billed annually at $240/yr) or **$25 / month** (monthly billing).
* **Custom Pack:** **$40 / month base** (billed annually at $480/yr) or **$50 / month** (monthly billing). Additional applications at $20/mo yearly or $25/mo monthly.`;

    links.push({ label: 'Compare All Pricing Plans', url: '/pricing' });
    links.push({ label: 'Start 14-Day Free Trial', url: '/checkout' });

    action = {
      type: 'compare_plans',
      title: 'Compare Official Plans',
      plans: [
        { name: 'Standard Pack', monthly: '₹740/mo', yearly: '₹560/mo (billed ₹6,720/yr)', code: 'STANDARD_PACK' },
        { name: 'Custom Pack', monthly: '₹1,280/mo', yearly: '₹980/mo (billed ₹11,760/yr)', code: 'CUSTOM_PACK' }
      ]
    };
    return { reply, links, action };
  }

  // 3. GLOBAL OFFICES & LOCATIONS
  if (/(office|location|address|headquarters|hq|where are you|contact number|phone)/i.test(query)) {
    reply = `### 🏢 OXOO Global Offices & Contact Information

* **Head Office (Bengaluru HQ):** PrimePro AI / OXOO Tech Campus, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103, India.
* **Hyderabad Office:** Mindspace IT Park, Building 12D, HITEC City, Hyderabad, Telangana 500081, India.
* **United States Office:** 8 The Green, Suite A, Dover, Delaware 19901, USA.

📞 **Phone:** +91 79 4050 0100 (Mon - Fri, 9:00 AM - 6:00 PM IST)
📧 **Email:** hello@oxoo.ai / support@oxoo.ai`;

    links.push({ label: 'Help & Support Center', url: '/help' });
    links.push({ label: 'Projects & Consultation Hub', url: '/projects' });
    return { reply, links, action };
  }

  // 4. LIVE DEMOS & TRIAL
  if (/(demo|trial|free trial|test software|try before|preview|sample)/i.test(query)) {
    reply = `### 🚀 Test OXOO Live (No Signup Required)

You can explore full interactive live simulators and demo environments right now:
* **Finance & Accounting:** [Launch Finance Demo](/demo/finance)
* **Sales, CRM & POS:** [Launch Sales Demo](/demo/sales)
* **HRMS & Payroll:** [Launch HRMS Demo](/demo/hrms)
* **Supply Chain & Inventory:** [Launch Supply Chain Demo](/demo/supply-chain)
* **Website Builder:** [Launch Website Demo](/demo/website)
* **AI Chat Assistant:** [Launch AI Demo](/demo/ai)

Ready to start your own dedicated workspace? Get started with our **14-day free trial** (no credit card required).`;

    links.push({ label: 'Explore Live Demos', url: '/demo' });
    links.push({ label: 'Start 14-Day Free Trial', url: '/checkout' });
    links.push({ label: 'Request a Guided Demo', url: '/request-demo' });
    return { reply, links, action };
  }

  // 5. PROJECTS HUB & BESPOKE DEVELOPMENT
  if (/(custom|bespoke|build|project|development|mobile app|ios|android|whatsapp|marketing|agency)/i.test(query)) {
    reply = `### 🛠️ OXOO Projects & Custom Engineering Hub

For requirements beyond standard SaaS, our engineering team provides custom product development:
* **Websites & Web Apps:** Custom React, Next.js, Node.js portals, SaaS platforms, and enterprise e-commerce.
* **Mobile Applications:** Native & cross-platform iOS and Android apps with React Native & Flutter.
* **WhatsApp Chat AI & Automation:** Official WhatsApp Business API integrations and autonomous customer support bots.
* **Performance Marketing & SEO:** Search engine optimization, PPC advertising, and brand growth.

#### How to Start:
1. **Option A: Request a Consultation Call** — 30-minute discovery call with our solutions architects.
2. **Option B: Submit a Project Request** — 4-step wizard to outline requirements and attach briefs (up to 5MB).`;

    links.push({ label: 'Projects & Consultation Hub', url: '/projects' });
    links.push({ label: 'Request a Consultation Call', url: '/projects' });
    return { reply, links, action };
  }

  // 6. SPECIFIC APPLICATION MATCH (Search all live applications in DB)
  const matchedApp = (knowledge.applications || []).find(app => {
    const appName = app.name.toLowerCase();
    const appSlug = app.slug.toLowerCase();
    return query.includes(appName) || query.includes(appSlug) || (app.tagline && query.includes(app.tagline.toLowerCase()));
  });

  if (matchedApp) {
    const featuresList = Array.isArray(matchedApp.features) && matchedApp.features.length > 0
      ? matchedApp.features.slice(0, 6).map(f => `  * ${f}`).join('\n')
      : '  * Cloud-native automation & multi-device ready\n  * Enterprise grade security & automatic backups';

    reply = `### **OXOO ${matchedApp.name}**\n\n`;
    if (matchedApp.tagline) reply += `*${matchedApp.tagline}*\n\n`;
    reply += `${matchedApp.description || 'Enterprise module built into the OXOO cloud operating system.'}\n\n`;
    reply += `**Key Capabilities:**\n${featuresList}\n\n`;
    reply += `**Category:** ${matchedApp.category || 'Business Productivity'}\n`;

    links.push({ label: `Open ${matchedApp.name} Overview`, url: `/apps/${matchedApp.slug}` });
    links.push({ label: 'Browse All Applications', url: '/all-apps' });
    links.push({ label: 'Start Free Trial', url: '/checkout' });

    action = {
      type: 'navigate',
      label: `Launch ${matchedApp.name}`,
      url: `/apps/${matchedApp.slug}`
    };
    return { reply, links, action };
  }

  // 7. CUSTOMER PRIVATE ACCOUNT LOOKUP (Strictly from verified DB records)
  if (/(my subscription|my plan|renewal|my invoice|billing history|my account|my payment)/i.test(query)) {
    if (!customerContext || !customerContext.authenticated) {
      reply = `### Customer Account Records
To view your active subscription, upcoming renewal dates, invoices, and authorized apps, please **sign in to your verified customer account**.`;
      links.push({ label: 'Sign In to Customer Portal', url: '/login' });
      return { reply, links, action };
    }

    const cust = customerContext.customer;
    const invs = customerContext.invoices || [];

    reply = `### Your Account Summary (${customerContext.email})\n\n`;
    if (cust) {
      reply += `* **Company Name:** ${cust.company_name || 'N/A'}\n`;
      reply += `* **Current Plan:** **${cust.plan || 'Standard'}**\n`;
      reply += `* **Subscription Status:** **${cust.subscription_status || 'Active'}**\n`;
      if (cust.renewal_date) {
        reply += `* **Next Renewal Date:** **${new Date(cust.renewal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}**\n`;
      }
      reply += `* **Billing Cycle:** ${cust.billing_cycle || 'Yearly'}\n\n`;
    }

    if (invs.length > 0) {
      reply += `**Recent Invoices:**\n`;
      invs.slice(0, 3).forEach(inv => {
        reply += `* Invoice **#${inv.invoice_number}**: ₹${Number(inv.amount).toLocaleString('en-IN')} — Status: **${inv.status}** (${new Date(inv.invoice_date).toLocaleDateString('en-GB')})\n`;
      });
      reply += `\n`;
    }

    links.push({ label: 'Open Customer Dashboard', url: '/customer' });
    return { reply, links, action };
  }

  // 8. SUPPORT TICKETS
  if (/(support|ticket|issue|bug|problem|help|complaint|troubleshoot)/i.test(query)) {
    if (customerContext && customerContext.authenticated && customerContext.tickets && customerContext.tickets.length > 0) {
      reply = `### Your Support Tickets (${customerContext.email})\n\n`;
      customerContext.tickets.slice(0, 3).forEach(t => {
        reply += `* **Ticket #${t.ticket_number || t.id}**: *${t.subject}* — Status: **${t.status}** (Priority: ${t.priority})\n`;
      });
    } else {
      reply = `### OXOO Customer Support
You can open a support ticket or contact our team directly:
- **Email:** support@oxoo.ai / hello@oxoo.ai
- **Phone:** +91 79 4050 0100 (Mon - Fri, 9:00 AM - 6:00 PM IST)
- **Direct Link:** [Visit Help & Support Center](/help)`;
    }

    links.push({ label: 'Help & Support Center', url: '/help' });
    links.push({ label: 'Contact Us', url: '/contact' });

    action = {
      type: 'create_ticket_draft',
      title: 'Create Support Ticket',
      defaultCategory: 'Technical',
      email: customerContext?.email || ''
    };
    return { reply, links, action };
  }

  // 9. GENERAL QUERY
  reply = `I'm here to help with all questions about **OXOO**:
- **8 Software Suites:** Finance, Sales, Supply Chain, HRMS, Marketing, Services, Productivity, and Website & eCommerce.
- **Pricing:** Standard Pack (₹560/mo yearly or ₹740/mo monthly; $20/mo yearly or $25/mo monthly) and Custom Pack (₹980/mo yearly or ₹1,280/mo monthly; $40/mo yearly or $50/mo monthly) with a **14-day free trial**.
- **Live Demos:** Test any suite online without signup at [Explore Live Demos](/demo).
- **Custom Projects:** Custom web and mobile apps, WhatsApp Chat AI at [Projects Hub](/projects).
- **Offices:** Bengaluru HQ, Hyderabad Office, and Delaware US Office.

What would you like to explore?`;

  links.push({ label: 'Browse All Applications', url: '/all-apps' });
  links.push({ label: 'View Pricing Plans', url: '/pricing' });
  links.push({ label: 'Explore Live Demos', url: '/demo' });
  links.push({ label: 'Help Center', url: '/help' });

  return { reply, links, action };
}

/**
 * Main Agent Processing Pipeline
 */
async function processAgentChat({ message, conversationId, userEmail, userAuthToken }) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Message is required.');
  }

  const cleanMessage = message.trim();
  const settings = await getAgentSettings();

  if (!settings.enabled) {
    return {
      reply: 'OXOO Agent is currently offline. You can contact our support team at support@oxoo.ai or visit our Help Center.',
      links: [{ label: 'Visit Help Center', url: '/help' }, { label: 'Contact Us', url: '/contact' }],
      action: null,
      suggestedQuestions: []
    };
  }

  // 1. Fetch live knowledge from Neon DB
  const knowledge = await getLiveKnowledge();

  // 2. Fetch authenticated customer context if user is signed in
  const customerContext = userEmail ? await getCustomerContext(userEmail) : null;

  // 3. Retrieve recent conversation history from DB
  let conversationHistory = [];
  if (conversationId) {
    try {
      const histRes = await query(`
        SELECT sender, content, created_at
        FROM agent_messages
        WHERE conversation_id = $1
        ORDER BY id ASC
        LIMIT 6
      `, [conversationId]);
      conversationHistory = histRes.rows || [];
    } catch (e) {
      console.warn('Could not fetch message history:', e.message);
    }
  }

  // 4. Attempt external LLM (Groq / Gemini / OpenAI)
  const aiKeyConfigured = Boolean(settings.aiApiKey && settings.aiApiKey !== 'your_server_side_secret');
  let aiResult = null;

  if (aiKeyConfigured) {
    aiResult = await callExternalAI(cleanMessage, conversationHistory, knowledge, customerContext, settings);
  }

  // 5. If AI returned response, format and attach relevant links
  if (aiResult && aiResult.reply) {
    const links = [];
    const lowReply = aiResult.reply.toLowerCase();
    if (lowReply.includes('pricing') || lowReply.includes('/pricing')) {
      links.push({ label: 'View Pricing Plans', url: '/pricing' });
    }
    if (lowReply.includes('checkout') || lowReply.includes('trial') || lowReply.includes('/checkout')) {
      links.push({ label: 'Start 14-Day Free Trial', url: '/checkout' });
    }
    if (lowReply.includes('application') || lowReply.includes('/all-apps')) {
      links.push({ label: 'Browse All Applications', url: '/all-apps' });
    }
    if (lowReply.includes('/demo') || lowReply.includes('live demo')) {
      links.push({ label: 'Explore Live Demos', url: '/demo' });
    }
    if (lowReply.includes('project') || lowReply.includes('/projects')) {
      links.push({ label: 'Projects & Consultation Hub', url: '/projects' });
    }
    if (lowReply.includes('support') || lowReply.includes('ticket') || lowReply.includes('/help')) {
      links.push({ label: 'Help Center', url: '/help' });
    }

    return {
      reply: aiResult.reply,
      links,
      action: null,
      suggestedQuestions: settings.suggestedQuestions || [],
      provider: aiResult.provider,
      grounded: true
    };
  }

  // 6. Fallback to Database Grounded Knowledge RAG Engine
  const groundedResult = generateDatabaseGroundedResponse(cleanMessage, knowledge, customerContext, aiKeyConfigured);

  return {
    reply: groundedResult.reply,
    links: groundedResult.links || [],
    action: groundedResult.action || null,
    suggestedQuestions: settings.suggestedQuestions || [],
    provider: 'oxoo-database-rag',
    grounded: true
  };
}

/**
 * Execute a confirmed consequential action
 */
async function executeConfirmedAction(actionPayload, userEmail, userName = 'Customer') {
  if (!actionPayload || !actionPayload.type) {
    throw new Error('Invalid action payload.');
  }

  const { type, data } = actionPayload;

  // 1. CREATE SUPPORT TICKET
  if (type === 'create_support_ticket') {
    const { subject, description, priority = 'Medium', category = 'Technical' } = data || {};
    if (!subject || !description) {
      throw new Error('Subject and description are required to create a ticket.');
    }

    const email = userEmail || data.email || 'customer@oxoo.ai';
    const name = userName || data.name || 'Valued Customer';
    const ticketNumber = `TK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const res = await query(`
      INSERT INTO support_tickets (
        ticket_number, company_name, user_name, user_email, subject,
        description, priority, status, category, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Open', $8, NOW(), NOW())
      RETURNING *
    `, [ticketNumber, 'Customer Account', name, email, subject, description, priority, category]);

    return {
      success: true,
      ticket: res.rows[0],
      message: `Support ticket #${ticketNumber} created successfully! Our engineering team has been notified.`
    };
  }

  // 2. SUBMIT SALES / DEMO LEAD
  if (type === 'submit_lead') {
    const { name, email, phone = '', company = '', service = 'Enterprise Consultation', message } = data || {};
    if (!name || !email || !message) {
      throw new Error('Name, email, and message are required.');
    }

    const res = await query(`
      INSERT INTO leads (
        name, email, phone, company, service, message, status, source, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'New', 'oxoo-agent', NOW())
      RETURNING *
    `, [name, email, phone, company, service, message]);

    return {
      success: true,
      lead: res.rows[0],
      message: 'Your inquiry has been submitted! An OXOO solution specialist will contact you shortly.'
    };
  }

  throw new Error(`Unsupported action type: ${type}`);
}

module.exports = {
  getLiveKnowledge,
  invalidateAgentKnowledgeCache,
  getCustomerContext,
  getAgentSettings,
  processAgentChat,
  executeConfirmedAction
};
