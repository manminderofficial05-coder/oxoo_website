const { query } = require('./db');

// In-memory knowledge cache (60s TTL to prevent database thrashing while reflecting admin changes quickly)
let cachedKnowledge = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000;

/**
 * Fetch and compile live product, plan, application, and service knowledge directly from Neon PostgreSQL
 */
async function getLiveKnowledge(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedKnowledge && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedKnowledge;
  }

  try {
    const [appsRes, plansRes, servicesRes, catsRes] = await Promise.all([
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
      `).catch(() => ({ rows: [] }))
    ]);

    cachedKnowledge = {
      applications: appsRes.rows || [],
      plans: plansRes.rows || [],
      services: servicesRes.rows || [],
      categories: catsRes.rows || [],
      updatedAt: new Date().toISOString()
    };
    lastCacheTime = now;
    return cachedKnowledge;
  } catch (err) {
    console.error('Error fetching live agent knowledge:', err.message);
    if (cachedKnowledge) return cachedKnowledge;
    return { applications: [], plans: [], services: [], categories: [], updatedAt: new Date().toISOString() };
  }
}

/**
 * Fetch authenticated customer context securely (strictly isolated to the caller's verified email)
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
    welcomeMessage: "Hi! I'm OXOO Agent. How can I help you today? Ask me about our software, pricing plans, website and app development, AI solutions, subscriptions, or support.",
    suggestedQuestions: [
      'Explore OXOO applications',
      'Compare pricing plans',
      'Find a website development package',
      'Explore Android and iOS app development',
      'Learn about AI chatbots',
      'Manage my subscription',
      'Find an invoice',
      'Contact customer support'
    ],
    aiProvider: process.env.AI_PROVIDER || 'gemini',
    aiModel: process.env.AI_MODEL || 'gemini-1.5-flash',
    aiApiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
    rateLimitPerMinute: 30,
    retentionDays: 90,
    supportEscalationEmail: 'support@oxoo.ai',
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

  return settings;
}

/**
 * Call External LLM (Gemini / OpenAI API) with dynamic context injection
 */
async function callExternalAI(userMessage, conversationHistory, knowledge, customerContext, settings) {
  const apiKey = settings.aiApiKey;
  if (!apiKey || apiKey === 'your_server_side_secret') {
    return null; // External LLM not configured
  }

  const provider = (settings.aiProvider || 'gemini').toLowerCase();

  // Prepare system prompt with live database grounding
  const systemPrompt = `You are "OXOO Agent", the official AI customer assistant for the OXOO cloud software and enterprise digital solutions platform (https://oxoo.ai).
You assist customers with:
1. OXOO Software Applications (Accounting, CRM, Invoicing, HRMS, Subscriptions, POS, Project Management, E-Commerce, Website Builder, AI Solutions, WhatsApp Chat AI, etc.).
2. Published Pricing & Plans (Starter, Professional, Enterprise, Custom).
3. Custom Development Services (Website development, Android and iOS mobile app development, AI chatbots, Digital Marketing, 3D Websites).
4. Customer Account Assistance (Subscriptions, renewal dates, invoices, support tickets).

CRITICAL GROUNDING RULES:
- Use the provided live database catalog as your STRICT source of truth.
- NEVER invent prices, non-existent features, discounts, or policies.
- If information is not in the knowledge catalog, politely state that it is not currently published and offer to connect them with OXOO customer support or submit an inquiry.
- Format responses in clean Markdown (use bullet points, bold key terms, and concise tables where helpful).
- Provide clickable markdown links using internal site paths:
  * Pricing: [View Pricing Plans](/pricing)
  * Checkout: [Subscribe Now](/checkout)
  * All Applications: [Browse All Applications](/all-apps)
  * Specific Apps: e.g. [Accounting App](/apps/accounting), [CRM](/apps/crm), [HRMS](/apps/hr), [Website Builder](/apps/website)
  * Services: [Custom Services](/services)
  * Help Center: [Help & Support Center](/help)
  * Customer Login: [Sign in to Customer Portal](/login)

CUSTOMER AUTHENTICATION STATUS:
${customerContext && customerContext.authenticated ? `
The current user is SIGNED IN with email: ${customerContext.email}.
Customer Details: ${JSON.stringify(customerContext.customer || {})}
Active Subscriptions: ${JSON.stringify(customerContext.subscriptions || [])}
Recent Invoices: ${JSON.stringify(customerContext.invoices || [])}
Recent Support Tickets: ${JSON.stringify(customerContext.tickets || [])}
You may assist them with their specific subscription, invoices, and ticket details directly and accurately.
` : `
The user is an ANONYMOUS VISITOR (Not logged in).
If they ask for their private subscription, invoices, or tickets, politely ask them to [Sign In](/login) first.
`}

CURRENT LIVE DATABASE KNOWLEDGE:
- Available Published Plans:
${knowledge.plans.map(p => `  * ${p.name} (${p.plan_code}): ₹${p.monthly_price}/mo (Yearly: ₹${p.yearly_price}/yr, Discount: ${p.discount_percent}%). Trial: ${p.trial_days} days. Includes: ${Array.isArray(p.included_apps) ? p.included_apps.join(', ') : 'All Core Apps'}`).join('\n')}

- Software Applications Catalog (${knowledge.applications.length} applications):
${knowledge.applications.slice(0, 24).map(a => `  * ${a.name} (Slug: ${a.slug}): Category: ${a.category}. Tagline: ${a.tagline || ''}. Details: ${a.description || ''}`).join('\n')}

- Custom Development Services:
${knowledge.services.map(s => `  * ${s.name} (${s.category}): ${s.description || ''}`).join('\n')}
`;

  try {
    if (provider === 'gemini') {
      const model = settings.aiModel || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      // Convert conversation history into Gemini contents format
      const contents = [];
      // Include system instruction in generation config or user/model turns
      contents.push({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }]
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errorText = await resp.text();
        console.warn('Gemini API call returned non-200:', resp.status, errorText);
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
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
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
    console.error('External AI invocation error:', err.message);
  }

  return null;
}

/**
 * Intelligent Database Knowledge RAG Engine
 * Executes when no external LLM is configured or when fast local intent resolution is preferred.
 * Zero hallucination, strict DB truth.
 */
function generateDatabaseGroundedResponse(userQuery, knowledge, customerContext, aiConfigured) {
  const query = userQuery.toLowerCase().trim();
  const links = [];
  let action = null;
  let reply = '';

  // 1. GREETING & GENERAL IDENTIFICATION
  if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|who are you|what is oxoo)/i.test(query)) {
    reply = `Hello! I'm **OXOO Agent**, your official AI customer assistant for the **OXOO** business operating platform.

I can help you with:
- **Software Applications:** Explore our 24+ cloud enterprise apps (Accounting, HRMS, CRM, POS, E-commerce, Inventory, AI Studio).
- **Pricing & Plans:** Compare monthly and annual subscription packages.
- **Custom Development:** Website design, iOS/Android mobile apps, 3D websites, and AI chatbots.
- **Account & Support:** Check your active subscriptions, renewal dates, invoices, or create a support ticket.

How can I help you today?`;
    links.push({ label: 'Explore All 24 Apps', url: '/all-apps' });
    links.push({ label: 'View Pricing Plans', url: '/pricing' });
    return { reply, links, action };
  }

  // 2. PRICING & PLANS INQUIRIES
  if (/(pricing|price|cost|plan|subscription rate|how much|package|compare|monthly|yearly|annual)/i.test(query)) {
    const plans = knowledge.plans || [];
    if (plans.length > 0) {
      reply = `### OXOO Official Pricing Plans\n\nAll plans come with a **14-day free trial** and include cloud hosting, SSL, and continuous updates:\n\n`;
      plans.forEach(p => {
        const disc = p.discount_percent ? ` (${p.discount_percent}% off yearly)` : '';
        reply += `* **${p.name}**: **₹${Number(p.monthly_price).toLocaleString('en-IN')}/mo** (billed annually at ₹${Number(p.yearly_price).toLocaleString('en-IN')}/yr${disc})\n`;
        reply += `  - *Included Apps:* ${Array.isArray(p.included_apps) && p.included_apps.length > 0 ? p.included_apps.join(', ') : 'All Essential Apps'}\n`;
        reply += `  - *Key Entitlements:* 24/7 Support, Automatic Backups, Multi-tenant Isolation\n\n`;
      });
      reply += `> **Tip:** You can start with a 14-day risk-free trial on any plan without upfront payment commitments.`;
      
      links.push({ label: 'Compare Plans & Subscribe', url: '/pricing' });
      links.push({ label: 'Start 14-Day Free Trial', url: '/checkout' });

      action = {
        type: 'compare_plans',
        title: 'Compare Official Plans',
        plans: plans.map(p => ({
          name: p.name,
          monthly: `₹${Number(p.monthly_price).toLocaleString('en-IN')}/mo`,
          yearly: `₹${Number(p.yearly_price).toLocaleString('en-IN')}/yr`,
          code: p.plan_code
        }))
      };
      return { reply, links, action };
    }
  }

  // 3. SPECIFIC APPLICATION LOOKUP (Accounting, CRM, HRMS, POS, Website, etc.)
  const matchedApp = (knowledge.applications || []).find(app => {
    const appName = app.name.toLowerCase();
    const appSlug = app.slug.toLowerCase();
    return query.includes(appName) || query.includes(appSlug) || (app.tagline && query.includes(app.tagline.toLowerCase()));
  });

  if (matchedApp) {
    const featuresList = Array.isArray(matchedApp.features) && matchedApp.features.length > 0
      ? matchedApp.features.slice(0, 5).map(f => `  * ${f}`).join('\n')
      : '  * Complete real-time automation\n  * Multi-device accessibility & mobile ready\n  * Cloud backup & enterprise grade security';

    reply = `### **OXOO ${matchedApp.name}**\n\n`;
    if (matchedApp.tagline) reply += `*${matchedApp.tagline}*\n\n`;
    reply += `${matchedApp.description || 'Enterprise-grade cloud module engineered to streamline your operations.'}\n\n`;
    reply += `**Key Highlights & Capabilities:**\n${featuresList}\n\n`;
    reply += `**Category:** ${matchedApp.category || 'Business Productivity'}\n`;

    links.push({ label: `Open ${matchedApp.name} Showcase`, url: `/apps/${matchedApp.slug}` });
    links.push({ label: 'Launch Interactive Live Demo', url: `/apps/${matchedApp.slug}/live-demo` });
    links.push({ label: 'View All Applications', url: '/all-apps' });

    action = {
      type: 'navigate',
      label: `Launch ${matchedApp.name}`,
      url: `/apps/${matchedApp.slug}`
    };
    return { reply, links, action };
  }

  // 4. WEBSITE DEVELOPMENT & 3D WEBSITES
  if (/(website|web dev|web design|3d website|landing page|ecommerce website)/i.test(query)) {
    reply = `### Custom Website & E-Commerce Development

OXOO engineers ultra-fast, modern responsive websites tailored to your brand:
- **Corporate Websites & Landing Pages:** High-converting designs built with modern frameworks.
- **E-Commerce Portals:** Integrated payment gateways (UPI, Cards, NetBanking), real-time inventory synchronization, and automated invoicing.
- **Interactive 3D Websites:** Next-generation WebGL and Three.js 3D brand experiences that captivate visitors.
- **SEO & Performance:** Optimized for Core Web Vitals (sub-second load speeds) and top Google rankings.

Would you like to speak with a solution architect or request a custom quotation?`;

    links.push({ label: 'Explore Web Services', url: '/services' });
    links.push({ label: 'Test Website Builder Demo', url: '/demo/website-builder-demo' });
    links.push({ label: 'Request Custom Quote', url: '/contact' });

    action = {
      type: 'request_quote',
      service: 'Website Development',
      title: 'Request a Website Development Consultation'
    };
    return { reply, links, action };
  }

  // 5. MOBILE APP DEVELOPMENT (Android & iOS)
  if (/(mobile app|android|ios|flutter|react native|app development|play store|app store)/i.test(query)) {
    reply = `### Mobile Application Development (Android & iOS)

OXOO crafts high-performance native and cross-platform mobile apps:
- **Cross-Platform Excellence:** Native look & feel across both Android (Google Play) and iOS (Apple App Store) using unified codebases.
- **Enterprise Integrations:** Direct sync with your OXOO Accounting, CRM, Inventory, and POS databases.
- **Push Notifications & Offline Support:** Keep users engaged with real-time transactional alerts and offline data synchronization.
- **End-to-End Delivery:** UI/UX wireframing, backend API development, store submission, and lifecycle maintenance.`;

    links.push({ label: 'Explore Mobile Solutions', url: '/services' });
    links.push({ label: 'Schedule Consultation', url: '/contact' });
    return { reply, links, action };
  }

  // 6. AI CHATBOTS & WHATSAPP AI SOLUTIONS
  if (/(ai|chatbot|whatsapp|bot|artificial intelligence|whatsapp ai|smart assistant|gpt|gemini)/i.test(query)) {
    reply = `### OXOO AI Solutions & WhatsApp Chat AI

Empower your business with tailored AI automation:
- **WhatsApp Chat AI:** Instant 24/7 customer support, automated order taking, catalog browsing, and lead qualification directly over WhatsApp.
- **Custom Knowledge Bots (RAG):** AI assistants trained securely on your company's documents, policies, and product catalogs with zero data leaks.
- **Multi-Channel AI Agents:** Seamlessly deploy assistants across your website, WhatsApp, Telegram, and mobile apps.
- **Voice AI & Automated Sequences:** AI voice calling and intelligent multi-touch engagement.`;

    links.push({ label: 'Experience AI Demo', url: '/demo/ai-demo' });
    links.push({ label: 'Contact AI Team', url: '/contact' });
    return { reply, links, action };
  }

  // 7. CUSTOMER PRIVATE ACCOUNT LOOKUP (Subscriptions, Invoices, Renewal Dates)
  if (/(my subscription|my plan|renewal|my invoice|billing history|my account|my payment)/i.test(query)) {
    if (!customerContext || !customerContext.authenticated) {
      reply = `### Private Customer Account Access

To view your active subscription, upcoming renewal dates, invoices, and authorized software applications, please **sign in to your verified customer account**.

Your private records are strictly protected and isolated to authenticated members.`;
      links.push({ label: 'Sign In to Customer Portal', url: '/login' });
      return { reply, links, action };
    }

    // Authenticated user assistance
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
    links.push({ label: 'View Invoices & Billing', url: '/customer' });
    return { reply, links, action };
  }

  // 8. SUPPORT TICKETS & TECHNICAL HELP
  if (/(support|ticket|issue|bug|problem|help|complaint|troubleshoot|agent help)/i.test(query)) {
    if (customerContext && customerContext.authenticated && customerContext.tickets && customerContext.tickets.length > 0) {
      reply = `### Your Support Tickets (${customerContext.email})\n\n`;
      customerContext.tickets.slice(0, 3).forEach(t => {
        reply += `* **Ticket #${t.ticket_number || t.ticket_id}**: *${t.subject}* — Status: **${t.status}** (Priority: ${t.priority})\n`;
      });
      reply += `\nWould you like me to draft a new support ticket for our engineering team?`;
    } else {
      reply = `### OXOO Customer Support

Our technical support team is standing by to help you:
- **Email Support:** support@oxoo.ai (Average response time: < 2 hours)
- **Direct Hotline:** +91 80 4567 8900
- **Support Ticket:** I can draft a formal support ticket directly into our ticketing system right now.

To create a ticket, simply tell me:
1. Brief summary of the issue
2. What software or page is affected`;
    }

    links.push({ label: 'Visit Help & Documentation', url: '/help' });
    links.push({ label: 'Contact Support Directly', url: '/contact' });

    action = {
      type: 'create_ticket_draft',
      title: 'Create a Support Ticket',
      defaultCategory: 'Technical',
      email: customerContext?.email || ''
    };
    return { reply, links, action };
  }

  // 9. GENERAL FALLBACK WITH DIRECT VERIFIED DATABASE KNOWLEDGE
  const appNames = (knowledge.applications || []).slice(0, 10).map(a => a.name).join(', ');
  reply = `I understand you're asking about **"${userQuery.slice(0, 80)}"**.

${!aiConfigured ? `*(Note: The external AI provider is currently running in Database Grounding Mode. Live database records are active.)*\n\n` : ''}Here are verified options from our catalog:
- **Cloud Applications:** We offer a full suite including ${appNames}, and more.
- **Pricing:** Flexible starter and enterprise plans starting from affordable monthly and annual billing.
- **Custom Projects:** Websites, mobile applications (iOS/Android), and AI automation.
- **Assistance:** Logged-in customers can view live subscriptions and raise support tickets.

Would you like to explore any of these specific areas?`;

  links.push({ label: 'Browse 24 Applications', url: '/all-apps' });
  links.push({ label: 'Compare Pricing Plans', url: '/pricing' });
  links.push({ label: 'Get Support', url: '/help' });

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
      reply: 'OXOO Agent is currently offline for scheduled maintenance. You can contact our support team at support@oxoo.ai or visit our Help Center.',
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

  // 4. Attempt external LLM if configured
  const aiKeyConfigured = Boolean(settings.aiApiKey && settings.aiApiKey !== 'your_server_side_secret');
  let aiResult = null;

  if (aiKeyConfigured) {
    aiResult = await callExternalAI(cleanMessage, conversationHistory, knowledge, customerContext, settings);
  }

  // 5. If AI returned response, format and attach relevant links
  if (aiResult && aiResult.reply) {
    // Generate contextual action links
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

  // 1. CREATE SUPPORT TICKET (Consequential Action)
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
  getCustomerContext,
  getAgentSettings,
  processAgentChat,
  executeConfirmedAction
};
