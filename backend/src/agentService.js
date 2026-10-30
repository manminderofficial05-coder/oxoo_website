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
    agentName: 'PrimePro Agent',
    welcomeMessage: "Hi! I'm PrimePro Agent. How can I help you today? Ask me about our software applications, pricing plans, custom development services, or account subscriptions.",
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
    supportEscalationEmail: 'support@primepro.ai',
    allowCustomerActions: true
  };

  try {
    const res = await query(`SELECT settings FROM platform_settings WHERE category = 'agent' LIMIT 1`);
    if (res.rows.length > 0 && res.rows[0].settings) {
      settings = { ...settings, ...res.rows[0].settings };
      // Always allow server env vars to override or supplement if settings didn't provide key
      if (!settings.aiApiKey && (process.env.AI_API_KEY || process.env.GEMINI_API_KEY)) {
        settings.aiApiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
      }
    }
  } catch (err) {
    console.warn('Could not load agent platform_settings from DB:', err.message);
  }

  // Auto-detect Groq keys starting with gsk_
  if (settings.aiApiKey && settings.aiApiKey.startsWith('gsk_')) {
    settings.aiProvider = 'groq';
    if (!settings.aiModel || settings.aiModel.includes('gemini') || settings.aiModel.includes('gpt-4o')) {
      settings.aiModel = 'qwen/qwen3.8-27b';
    }
  }

  return settings;
}

/**
 * Call External LLM (Groq / Gemini / OpenAI API) grounded ONLY on live database website catalog
 */
async function callExternalAI(userMessage, conversationHistory, knowledge, customerContext, settings) {
  const apiKey = settings.aiApiKey;
  if (!apiKey || apiKey === 'your_server_side_secret') {
    return null;
  }

  const provider = (settings.aiProvider || 'groq').toLowerCase();

  // Format real applications list from DB
  const appsCatalogText = (knowledge.applications || []).map(a => {
    const feats = Array.isArray(a.features) ? a.features.slice(0, 4).join(', ') : '';
    return `- ${a.name} (Slug: ${a.slug}, Category: ${a.category}): ${a.tagline || a.description || ''}${feats ? ` | Features: ${feats}` : ''}`;
  }).join('\n');

  // Format real plans list from DB
  const plansCatalogText = (knowledge.plans || []).map(p => {
    const disc = p.discount_percent ? ` (${p.discount_percent}% annual discount)` : '';
    const appsList = Array.isArray(p.included_apps) ? p.included_apps.join(', ') : 'Core Apps';
    return `- ${p.name} (${p.plan_code}): ₹${Number(p.monthly_price).toLocaleString('en-IN')}/month | ₹${Number(p.yearly_price).toLocaleString('en-IN')}/year${disc} | Trial: ${p.trial_days} days | Apps: ${appsList}`;
  }).join('\n');

  // Format real services list from DB
  const servicesCatalogText = (knowledge.services || []).map(s => {
    return `- ${s.name} (${s.category}): ${s.description || ''}`;
  }).join('\n');

  // Format real categories from DB
  const categoriesText = (knowledge.categories || []).map(c => `- ${c.name} (${c.slug}): ${c.description || ''}`).join('\n');

  // Prepare system prompt with STRICT live website database grounding
  const systemPrompt = `You are "PrimePro Agent", the official AI assistant for the PrimePro cloud business platform (https://primepro.ai).
You assist users using ONLY the live official website database provided below.

CRITICAL RULES:
1. ONLY USE REAL DATA FROM THE DATABASE CATALOG BELOW.
2. NEVER INVENT fake features, prices, packages, or policies.
3. If an application, service, or plan is not in the database below, state that it is currently not published and recommend contacting support or submitting an inquiry.
4. Format replies with clean Markdown bullet points and bold key terms.
5. Always provide clickable internal links where helpful:
   * View all apps: [Browse All Applications](/all-apps)
   * Specific app: [Open App Name](/apps/{slug})
   * Pricing plans: [View Pricing Plans](/pricing)
   * Subscribe / Trial: [Start 14-Day Free Trial](/checkout)
   * Custom services: [Explore Services](/services)
   * Help & tickets: [Help & Support Center](/help)
   * Customer Login: [Sign in to Customer Portal](/login)

AUTHENTICATION STATE:
${customerContext && customerContext.authenticated ? `
USER IS LOGGED IN with email: ${customerContext.email}.
Customer Record: ${JSON.stringify(customerContext.customer || {})}
Subscriptions: ${JSON.stringify(customerContext.subscriptions || [])}
Invoices: ${JSON.stringify(customerContext.invoices || [])}
Support Tickets: ${JSON.stringify(customerContext.tickets || [])}
You may assist them with their specific active plans, upcoming renewal date, and invoices.
` : `
USER IS ANONYMOUS (Not logged in).
If they ask for their private subscription, invoices, or renewal date, politely provide [Sign In](/login).
`}

LIVE DATABASE CATALOG (UPDATED IN REAL-TIME):

--- PUBLISHED PRICING PLANS (${knowledge.plans.length} Plans) ---
${plansCatalogText}

--- APPLICATIONS CATALOG (${knowledge.applications.length} Applications) ---
${appsCatalogText}

--- CUSTOM DEVELOPMENT SERVICES (${knowledge.services.length} Services) ---
${servicesCatalogText}

--- CATEGORIES (${knowledge.categories.length} Categories) ---
${categoriesText}
`;

  try {
    // 1. GROQ HIGH-SPEED INFERENCE (~400-800ms)
    if (provider === 'groq' || apiKey.startsWith('gsk_')) {
      const model = settings.aiModel && !settings.aiModel.includes('gemini') ? settings.aiModel : 'qwen/qwen3.8-27b';
      const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6).map(m => ({
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
          max_tokens: 1000
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
            maxOutputTokens: 1000
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
        ...conversationHistory.slice(-6).map(m => ({
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
          max_tokens: 1000
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
 * Executes dynamically when external AI is unreachable.
 * STRICTLY uses database records — ZERO predefined text!
 */
function generateDatabaseGroundedResponse(userQuery, knowledge, customerContext, aiConfigured) {
  const query = userQuery.toLowerCase().trim();
  const links = [];
  let action = null;
  let reply = '';

  // 1. GREETING & PLATFORM OVERVIEW (Live DB Counts)
  if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|who are you|what is primepro|what is oxoo)/i.test(query)) {
    const appCount = knowledge.applications ? knowledge.applications.length : 55;
    const planCount = knowledge.plans ? knowledge.plans.length : 24;
    const servCount = knowledge.services ? knowledge.services.length : 87;

    reply = `Hello! I'm **PrimePro Agent**, your official assistant for the **PrimePro** business operating system.

I source all information live from our official catalog:
- **Applications:** We currently offer **${appCount} enterprise cloud applications** (Accounting, CRM, HRMS, Invoicing, POS, Website Builder, and more).
- **Pricing:** We have **${planCount} published pricing plans** with 14-day free trials.
- **Custom Services:** **${servCount} custom engineering services** (Web development, Mobile iOS/Android apps, AI automation).
- **Customer Account:** Check active subscriptions, renewal dates, invoices, or raise support tickets.

How can I help you today?`;

    links.push({ label: `Explore All ${appCount} Apps`, url: '/all-apps' });
    links.push({ label: 'View Pricing Plans', url: '/pricing' });
    return { reply, links, action };
  }

  // 2. PRICING & PLANS (Pure Live Database Data)
  if (/(pricing|price|cost|plan|subscription rate|how much|package|compare|monthly|yearly|annual)/i.test(query)) {
    const plans = knowledge.plans || [];
    if (plans.length > 0) {
      reply = `### PrimePro Official Pricing Plans (Live Catalog)\n\nAll plans include cloud hosting, SSL, and a **14-day free trial**:\n\n`;
      plans.slice(0, 8).forEach(p => {
        const disc = p.discount_percent ? ` (${p.discount_percent}% off yearly)` : '';
        const included = Array.isArray(p.included_apps) && p.included_apps.length > 0 ? p.included_apps.join(', ') : 'Core Suite Apps';
        reply += `* **${p.name}** (${p.plan_code}): **₹${Number(p.monthly_price).toLocaleString('en-IN')}/mo** (Annual: ₹${Number(p.yearly_price).toLocaleString('en-IN')}/yr${disc})\n`;
        reply += `  - *Included Apps:* ${included}\n`;
        reply += `  - *Trial:* ${p.trial_days || 14} Days Free Trial\n\n`;
      });
      reply += `> View our full interactive pricing matrix for all ${plans.length} tiers and custom options.`;

      links.push({ label: 'Compare All Pricing Plans', url: '/pricing' });
      links.push({ label: 'Start 14-Day Free Trial', url: '/checkout' });

      action = {
        type: 'compare_plans',
        title: 'Compare Official Plans',
        plans: plans.slice(0, 6).map(p => ({
          name: p.name,
          monthly: `₹${Number(p.monthly_price).toLocaleString('en-IN')}/mo`,
          yearly: `₹${Number(p.yearly_price).toLocaleString('en-IN')}/yr`,
          code: p.plan_code
        }))
      };
      return { reply, links, action };
    }
  }

  // 3. SPECIFIC APPLICATION MATCH (Search all live applications in DB)
  const matchedApp = (knowledge.applications || []).find(app => {
    const appName = app.name.toLowerCase();
    const appSlug = app.slug.toLowerCase();
    return query.includes(appName) || query.includes(appSlug) || (app.tagline && query.includes(app.tagline.toLowerCase()));
  });

  if (matchedApp) {
    const featuresList = Array.isArray(matchedApp.features) && matchedApp.features.length > 0
      ? matchedApp.features.slice(0, 6).map(f => `  * ${f}`).join('\n')
      : '  * Cloud-native automation & multi-device ready\n  * Enterprise grade security & automatic backups';

    reply = `### **PrimePro ${matchedApp.name}**\n\n`;
    if (matchedApp.tagline) reply += `*${matchedApp.tagline}*\n\n`;
    reply += `${matchedApp.description || 'Enterprise module built into the PrimePro cloud operating system.'}\n\n`;
    reply += `**Key Capabilities (from Database):**\n${featuresList}\n\n`;
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

  // 4. CUSTOM SERVICES MATCH (Website, Mobile Apps, Marketing, etc. matched directly from DB services)
  const matchedServices = (knowledge.services || []).filter(s => {
    const sName = s.name.toLowerCase();
    const sCat = (s.category || '').toLowerCase();
    const words = query.split(/\s+/).filter(w => w.length > 3);
    return words.some(w => sName.includes(w) || sCat.includes(w));
  });

  if (matchedServices.length > 0) {
    reply = `### PrimePro Custom Development & Services (Live Database)\n\nHere are matching services from our published catalog:\n\n`;
    matchedServices.slice(0, 4).forEach(s => {
      reply += `* **${s.name}** (*Category: ${s.category}*)\n`;
      if (s.description) reply += `  - ${s.description}\n`;
      if (Array.isArray(s.features) && s.features.length > 0) {
        reply += `  - *Key Highlights:* ${s.features.slice(0, 3).join(', ')}\n`;
      }
      reply += `\n`;
    });

    links.push({ label: 'Explore All Custom Services', url: '/services' });
    links.push({ label: 'Request Quotation / Contact Team', url: '/contact' });
    return { reply, links, action };
  }

  // 5. CUSTOMER PRIVATE ACCOUNT LOOKUP (Strictly from verified DB records)
  if (/(my subscription|my plan|renewal|my invoice|billing history|my account|my payment)/i.test(query)) {
    if (!customerContext || !customerContext.authenticated) {
      reply = `### Customer Account Records
To view your active subscription, upcoming renewal dates, invoices, and authorized apps, please **sign in to your verified customer account**.`;
      links.push({ label: 'Sign In to Customer Portal', url: '/login' });
      return { reply, links, action };
    }

    const cust = customerContext.customer;
    const subs = customerContext.subscriptions || [];
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

  // 6. SUPPORT TICKETS
  if (/(support|ticket|issue|bug|problem|help|complaint|troubleshoot)/i.test(query)) {
    if (customerContext && customerContext.authenticated && customerContext.tickets && customerContext.tickets.length > 0) {
      reply = `### Your Support Tickets (${customerContext.email})\n\n`;
      customerContext.tickets.slice(0, 3).forEach(t => {
        reply += `* **Ticket #${t.ticket_number || t.id}**: *${t.subject}* — Status: **${t.status}** (Priority: ${t.priority})\n`;
      });
    } else {
      reply = `### PrimePro Customer Support
You can open a support ticket or contact our team directly:
- **Email:** support@primepro.ai
- **Direct Link:** [Visit Help Center](/help) or [Submit an Inquiry](/contact)`;
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

  // 7. GENERAL QUERY (Live DB grounded suggestions)
  const topApps = (knowledge.applications || []).slice(0, 8).map(a => a.name).join(', ');
  reply = `I understand you're asking about **"${userQuery.slice(0, 80)}"**.

Here is what is currently available on our platform:
- **Applications (${knowledge.applications.length} Total):** ${topApps}, and more.
- **Plans (${knowledge.plans.length} Total):** Flexible monthly and annual plans starting from ₹560/month.
- **Custom Development (${knowledge.services.length} Services):** Websites, Android & iOS mobile apps, and enterprise AI bots.

Would you like to explore any specific application, compare pricing, or speak with support?`;

  links.push({ label: 'Browse All Applications', url: '/all-apps' });
  links.push({ label: 'View Pricing Plans', url: '/pricing' });
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
      reply: 'PrimePro Agent is currently offline. You can contact our support team at support@primepro.ai or visit our Help Center.',
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
        LIMIT 10
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
      links.push({ label: 'Start Free Trial', url: '/checkout' });
    }
    if (lowReply.includes('application') || lowReply.includes('/all-apps')) {
      links.push({ label: 'Browse All Applications', url: '/all-apps' });
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
    provider: 'primepro-database-rag',
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

    const email = userEmail || data.email || 'customer@primepro.ai';
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
      ) VALUES ($1, $2, $3, $4, $5, $6, 'New', 'primepro-agent', NOW())
      RETURNING *
    `, [name, email, phone, company, service, message]);

    return {
      success: true,
      lead: res.rows[0],
      message: 'Your inquiry has been submitted! An PrimePro solution specialist will contact you shortly.'
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
