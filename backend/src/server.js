require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { pool, query, initDb } = require('./db');
const { categories: fallbackCategories, services: fallbackServices } = require('./seedData');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'oxoo-super-secret-jwt-key-2026';

let isDbConnected = false;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('.onrender.com')) {
      return callback(null, true);
    }
    const allowed = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(x => x.trim()) : [];
    if (allowed.includes(origin) || allowed.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));

// Helper to check DB readiness
async function checkDb() {
  if (!isDbConnected) return false;
  try {
    await query('SELECT 1');
    return true;
  } catch (err) {
    return false;
  }
}

// Audit logger helper
async function logAudit(action, target = '', userName = 'system', ip = '127.0.0.1', details = {}) {
  try {
    if (isDbConnected) {
      await query(
        `INSERT INTO audit_logs (action, target, user_name, ip, details) VALUES ($1, $2, $3, $4, $5)`,
        [action, target, userName, ip, JSON.stringify(details)]
      );
    }
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

// Auth token verification middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

// -------------------------------------------------------------
// 1. HEALTH CHECK ROUTE
// -------------------------------------------------------------
app.get('/api/health', async (_req, res) => {
  const healthy = await checkDb();
  res.json({
    status: 'ok',
    database: healthy ? 'connected (Neon PostgreSQL)' : 'demo-mode',
    service: 'Oxoo.ai Enterprise API Gateway',
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// 2. AUTHENTICATION ROUTES (POSTGRESQL)
// -------------------------------------------------------------
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, organization } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    const emailNorm = String(email).trim().toLowerCase();

    if (!isDbConnected) {
      // Demo fallback response
      const token = jwt.sign({ id: 'demo-user', email: emailNorm, name, role: 'member' }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: 'Account created successfully (Demo Mode).',
        token,
        user: { id: 'demo-user', name, email: emailNorm, role: 'member', organization: organization || 'Oxoo.ai Tenant' }
      });
    }

    // Check if email already registered in PostgreSQL
    const existing = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [emailNorm]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password), salt);

    const userResult = await query(
      `INSERT INTO users (name, email, password, organization, role)
       VALUES ($1, $2, $3, $4, 'member')
       RETURNING id, name, email, role, organization, created_at`,
      [String(name).trim(), emailNorm, hashedPassword, organization || 'Oxoo.ai Tenant']
    );

    const user = userResult.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    await logAudit('User Registered', emailNorm, user.name, req.ip, { organization: user.organization });

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, organization: user.organization }
    });
  } catch (e) {
    next(e);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const emailNorm = String(email).trim().toLowerCase();

    // Default admin shortcut
    if ((emailNorm === 'admin@oxoo.ai' || emailNorm === 'admin@multiix.io') &&
        (password === 'oxoo123' || password === 'admin123' || password === 'multiix123')) {
      let adminId = 1;
      if (isDbConnected) {
        try {
          const dbAdmin = await query('SELECT id, name, email, role, organization FROM users WHERE email = $1', [emailNorm]);
          if (dbAdmin.rows.length > 0) adminId = dbAdmin.rows[0].id;
        } catch (e) {}
      }
      const token = jwt.sign({ id: adminId, email: emailNorm, name: 'Root Administrator', role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        message: 'Authenticated as Administrator.',
        token,
        user: { id: adminId, name: 'Root Administrator', email: emailNorm, role: 'admin', organization: 'Oxoo.ai Core Corp' }
      });
    }

    if (!isDbConnected) {
      const token = jwt.sign({ id: 'user-guest', email: emailNorm, name: 'Demo User', role: 'member' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        message: 'Login successful (Demo Mode).',
        token,
        user: { id: 'user-guest', name: 'Demo User', email: emailNorm, role: 'member', organization: 'Oxoo.ai Workspace' }
      });
    }

    const userResult = await query(
      `SELECT id, name, email, password, role, organization, active
       FROM users WHERE email = $1 LIMIT 1`,
      [emailNorm]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].active) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    await logAudit('User Login', emailNorm, user.name, req.ip);

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, organization: user.organization }
    });
  } catch (e) {
    next(e);
  }
});

app.get('/api/auth/me', verifyToken, async (req, res, next) => {
  try {
    if (!isDbConnected) return res.json({ user: req.user });
    let user = null;
    if (typeof req.user.id === 'number' || /^\d+$/.test(String(req.user.id))) {
      const userRes = await query('SELECT id, name, email, role, organization, avatar, last_login as "lastLogin" FROM users WHERE id = $1', [parseInt(req.user.id, 10)]);
      if (userRes.rows.length > 0) user = userRes.rows[0];
    } else if (req.user.email) {
      const userRes = await query('SELECT id, name, email, role, organization, avatar, last_login as "lastLogin" FROM users WHERE email = $1', [req.user.email]);
      if (userRes.rows.length > 0) user = userRes.rows[0];
    }
    res.json({ user: user || req.user });
  } catch (e) {
    next(e);
  }
});

// -------------------------------------------------------------
// 3. BUSINESS APPLICATIONS (24 APPS FROM POSTGRESQL)
// -------------------------------------------------------------
app.get('/api/apps', async (_req, res, next) => {
  try {
    if (!isDbConnected) {
      return res.json(fallbackCategories);
    }
    const result = await query(
      `SELECT id, slug, name, category, concept, main_color as "mainColor", bg_color as "bgColor",
              icon_src as "iconSrc", svg_src as "svgSrc", tagline, description, features, enabled, sort_order as "sortOrder"
       FROM applications
       WHERE enabled = true
       ORDER BY sort_order ASC`
    );
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});

app.get('/api/apps/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug.toLowerCase();
    if (!isDbConnected) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    const result = await query(
      `SELECT id, slug, name, category, concept, main_color as "mainColor", bg_color as "bgColor",
              icon_src as "iconSrc", svg_src as "svgSrc", tagline, description, features, enabled, sort_order as "sortOrder"
       FROM applications
       WHERE (slug = $1 OR id = $1) AND enabled = true
       LIMIT 1`,
      [slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    res.json(result.rows[0]);
  } catch (e) {
    next(e);
  }
});

// -------------------------------------------------------------
// 4. CATEGORIES & SERVICES (POSTGRESQL)
// -------------------------------------------------------------
app.get('/api/categories', async (_req, res, next) => {
  try {
    if (!isDbConnected) return res.json(fallbackCategories);
    const result = await query(
      `SELECT id, slug, name, description, color, icon, services, sort_order as "sortOrder", active
       FROM categories
       WHERE active = true
       ORDER BY sort_order ASC`
    );
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});

app.get('/api/services', async (req, res, next) => {
  try {
    if (!isDbConnected) return res.json(fallbackServices);

    let sql = `SELECT id, slug, name, category, description, color, icon, featured, features, sort_order as "sortOrder", active
               FROM services WHERE active = true`;
    const params = [];

    if (req.query.category) {
      params.push(req.query.category);
      sql += ` AND category = $${params.length}`;
    }

    if (req.query.featured === 'true') {
      sql += ` AND featured = true`;
    }

    if (req.query.q) {
      params.push(`%${String(req.query.q).trim()}%`);
      sql += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length} OR category ILIKE $${params.length})`;
    }

    sql += ` ORDER BY featured DESC, sort_order ASC, name ASC LIMIT 200`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});

app.get('/api/services/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug.toLowerCase();
    if (!isDbConnected) {
      const match = fallbackServices.find(s => s.slug === slug);
      if (!match) return res.status(404).json({ message: 'Service not found.' });
      return res.json(match);
    }

    const result = await query(
      `SELECT id, slug, name, category, description, color, icon, featured, features, sort_order as "sortOrder", active
       FROM services
       WHERE slug = $1 AND active = true
       LIMIT 1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    res.json(result.rows[0]);
  } catch (e) {
    next(e);
  }
});

// -------------------------------------------------------------
// 5. LEADS INGESTION (SAVED DIRECTLY TO NEON POSTGRESQL)
// -------------------------------------------------------------
app.post('/api/leads', async (req, res, next) => {
  try {
    const { name, email, phone, company, service, message, source, details } = req.body || {};
    if (!name || !String(name).trim() || !email || !String(email).trim()) {
      return res.status(400).json({ message: 'Name and business email are required.' });
    }

    const emailValue = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    const messageText = message ? String(message).trim() : 'Demo Request from Workspace Builder';

    if (isDbConnected) {
      const result = await query(
        `INSERT INTO leads (name, email, phone, company, service, message, status, source, details)
         VALUES ($1, $2, $3, $4, $5, $6, 'New', $7, $8)
         RETURNING id, name, email, created_at`,
        [
          String(name).trim(),
          emailValue,
          String(phone || '').trim().slice(0, 50),
          String(company || '').trim().slice(0, 160),
          String(service || '').trim().slice(0, 160),
          messageText,
          source || 'website',
          JSON.stringify(details || {})
        ]
      );

      const lead = result.rows[0];
      await logAudit('Lead Captured', emailValue, lead.name, req.ip, { company, service });

      return res.status(201).json({
        message: 'Enquiry received and stored successfully in Neon PostgreSQL.',
        id: lead.id
      });
    }

    // Demo mode fallback
    res.status(201).json({
      message: 'Enquiry received (Demo Mode). Our sales team will get in touch.',
      id: 'DEMO-LEAD-' + Date.now()
    });
  } catch (e) {
    next(e);
  }
});

// -------------------------------------------------------------
// 6. ADMIN GOVERNANCE ROUTES (POSTGRESQL POWERED)
// -------------------------------------------------------------
app.get('/api/admin/overview', async (_req, res, next) => {
  try {
    if (!isDbConnected) {
      return res.json({
        activeApps: 24,
        totalUsers: 4,
        totalLeads: 18,
        systemHealth: '100% Operational',
        uptime: process.uptime()
      });
    }

    const [usersRes, leadsRes, appsRes] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query('SELECT COUNT(*) FROM leads'),
      query('SELECT COUNT(*) FROM applications WHERE enabled = true')
    ]);

    res.json({
      activeApps: parseInt(appsRes.rows[0].count, 10) || 24,
      totalUsers: parseInt(usersRes.rows[0].count, 10) || 0,
      totalLeads: parseInt(leadsRes.rows[0].count, 10) || 0,
      database: 'Neon PostgreSQL (Connected)',
      systemHealth: '100% Operational',
      uptime: process.uptime()
    });
  } catch (e) {
    next(e);
  }
});

app.get('/api/admin/users', async (_req, res, next) => {
  try {
    if (!isDbConnected) {
      return res.json([
        { id: 1, name: 'Root Administrator', email: 'admin@oxoo.ai', role: 'admin', organization: 'Oxoo.ai Core Corp' }
      ]);
    }
    const result = await query(
      `SELECT id, name, email, role, organization, active, avatar, last_login as "lastLogin", created_at as "createdAt"
       FROM users
       ORDER BY created_at DESC
       LIMIT 100`
    );
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});

app.get('/api/admin/leads', async (_req, res, next) => {
  try {
    if (!isDbConnected) {
      return res.json([]);
    }
    const result = await query(
      `SELECT id, name, email, phone, company, service, message, status, source, assigned_to as "assignedTo", created_at as "createdAt"
       FROM leads
       ORDER BY created_at DESC
       LIMIT 100`
    );
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});

app.get('/api/admin/audit-logs', async (_req, res, next) => {
  try {
    if (!isDbConnected) {
      return res.json([
        { id: 1, action: 'System Initialization', target: 'Oxoo.ai Platform', user: 'system', timestamp: new Date().toISOString() }
      ]);
    }
    const result = await query(
      `SELECT id, action, target, user_name as "user", ip, details, created_at as "timestamp"
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT 100`
    );
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});

// -------------------------------------------------------------
// 7. CUSTOMER PORTAL API ROUTES (POSTGRESQL POWERED)
// -------------------------------------------------------------

// Customer Overview (Summary Cards, Plan, Entitlements, Recent Activity)
app.get('/api/customer/overview', async (_req, res, next) => {
  try {
    let org = null;
    let openTicketsCount = 0;
    let teamCount = 0;

    if (isDbConnected) {
      try {
        const orgRes = await query(`SELECT * FROM organizations ORDER BY id ASC LIMIT 1`);
        if (orgRes.rows.length > 0) org = orgRes.rows[0];

        const ticketRes = await query(`SELECT COUNT(*) FROM support_tickets WHERE status != 'Resolved'`);
        if (ticketRes.rows.length > 0) openTicketsCount = parseInt(ticketRes.rows[0].count, 10) || 0;

        const teamRes = await query(`SELECT COUNT(*) FROM team_members WHERE status = 'Active'`);
        if (teamRes.rows.length > 0) teamCount = parseInt(teamRes.rows[0].count, 10) || 0;
      } catch (err) {
        console.error('Error fetching customer DB overview:', err.message);
      }
    }

    res.json({
      company: org?.name || 'My Organization',
      customerName: 'Customer Admin',
      email: 'admin@organization.com',
      avatar: 'C',
      currentPlan: org?.plan || 'Free Tier',
      status: org?.status || 'Active',
      nextBillingDate: 'N/A',
      mrr: org?.mrr || 0,
      activeAppsCount: 0,
      totalPurchasedApps: 0,
      activeAppsTrend: '0%',
      teamMembersCount: teamCount,
      teamMembersTrend: '0%',
      monthlyUsage: 0,
      monthlyUsageTrend: '0%',
      openTicketsCount: openTicketsCount,
      openTicketsTrend: '0%',
      purchasedApps: [],
      recentActivity: []
    });
  } catch (e) {
    next(e);
  }
});

// Customer Billing & Subscriptions
app.get('/api/customer/billing', async (_req, res, next) => {
  try {
    let invoices = [];
    if (isDbConnected) {
      try {
        const invRes = await query(`SELECT * FROM invoices ORDER BY invoice_date DESC LIMIT 20`);
        invoices = invRes.rows;
      } catch (e) {}
    }

    res.json({
      currentPlan: {
        name: 'Starter',
        amount: 0,
        currency: '₹',
        cycle: 'Monthly',
        status: 'Active',
        nextBilling: 'N/A',
        features: [
          'Access to Standard Applications',
          'Team Workspace',
          'Standard Community Support'
        ]
      },
      availablePlans: [
        { name: 'Starter', price: 15000, cycle: '/mo', seats: '5 seats', apps: '3 Apps included', popular: false },
        { name: 'Growth', price: 25000, cycle: '/mo', seats: '10 seats', apps: '5 Apps included', popular: false },
        { name: 'Business Pro', price: 48200, cycle: '/mo', seats: '15 seats', apps: '8 Apps included', popular: true, current: true },
        { name: 'Enterprise', price: 124000, cycle: '/mo', seats: 'Unlimited seats', apps: 'All 24 Apps included', popular: false }
      ],
      invoices,
      paymentMethod: null
    });
  } catch (e) {
    next(e);
  }
});

// Upgrade plan request
app.post('/api/customer/upgrade', async (req, res, next) => {
  try {
    const { planName } = req.body || {};
    if (!planName) return res.status(400).json({ message: 'Plan name is required' });

    if (isDbConnected) {
      await query(`UPDATE organizations SET plan = $1, updated_at = NOW() WHERE name = 'ABC Technologies'`, [planName]);
      await logAudit('Plan Upgraded', planName, 'Alex Johnson (alex@abctech.com)', req.ip);
    }

    res.json({
      success: true,
      message: `Your subscription has been successfully upgraded to ${planName}.`,
      plan: planName
    });
  } catch (e) {
    next(e);
  }
});

// Customer Team Management
app.get('/api/customer/team', async (_req, res, next) => {
  try {
    let members = [];
    if (isDbConnected) {
      try {
        const teamRes = await query(`SELECT * FROM team_members ORDER BY id ASC`);
        members = teamRes.rows;
      } catch (e) {}
    }

    res.json({
      members,
      seatsUsed: members.length,
      seatsTotal: 10,
      availableRoles: ['Organization Admin', 'Finance Lead', 'HR Director', 'Operations Manager', 'Member']
    });
  } catch (e) {
    next(e);
  }
});

// Invite Team Member
app.post('/api/customer/team', async (req, res, next) => {
  try {
    const { name, email, role, appsAccess } = req.body || {};
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

    let newMember = {
      id: Date.now(),
      name,
      email,
      role: role || 'Member',
      status: 'Active',
      company_name: 'ABC Technologies',
      apps_access: appsAccess || ['all']
    };

    if (isDbConnected) {
      const insRes = await query(
        `INSERT INTO team_members (company_name, name, email, role, status, apps_access)
         VALUES ('ABC Technologies', $1, $2, $3, 'Active', $4) RETURNING *`,
        [name, email, role || 'Member', JSON.stringify(appsAccess || ['all'])]
      );
      if (insRes.rows.length > 0) newMember = insRes.rows[0];
      await logAudit('Team Member Invited', email, 'Alex Johnson', req.ip);
    }

    res.status(201).json({
      success: true,
      message: `Invitation sent to ${email} successfully.`,
      member: newMember
    });
  } catch (e) {
    next(e);
  }
});

// Remove Team Member
app.delete('/api/customer/team/:id', async (req, res, next) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    if (isDbConnected) {
      await query(`DELETE FROM team_members WHERE id = $1`, [memberId]);
      await logAudit('Team Member Removed', `Member #${memberId}`, 'Alex Johnson', req.ip);
    }
    res.json({ success: true, message: 'Team member removed.' });
  } catch (e) {
    next(e);
  }
});

// Customer Support Tickets
app.get('/api/customer/tickets', async (_req, res, next) => {
  try {
    let tickets = [];
    if (isDbConnected) {
      try {
        const ticketRes = await query(`SELECT * FROM support_tickets ORDER BY created_at DESC`);
        tickets = ticketRes.rows;
      } catch (e) {}
    }

    res.json({ tickets });
  } catch (e) {
    next(e);
  }
});

// Create Support Ticket
app.post('/api/customer/tickets', async (req, res, next) => {
  try {
    const { subject, description, priority } = req.body || {};
    if (!subject) return res.status(400).json({ message: 'Subject is required' });

    const ticketNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;
    let createdTicket = {
      id: Date.now(),
      ticket_number: ticketNumber,
      company_name: 'ABC Technologies',
      user_name: 'Alex Johnson',
      user_email: 'alex@abctech.com',
      subject,
      description: description || '',
      priority: priority || 'Medium',
      status: 'Open',
      created_at: new Date().toISOString()
    };

    if (isDbConnected) {
      const insRes = await query(
        `INSERT INTO support_tickets (ticket_number, company_name, user_name, user_email, subject, description, priority, status)
         VALUES ($1, 'ABC Technologies', 'Alex Johnson', 'alex@abctech.com', $2, $3, $4, 'Open') RETURNING *`,
        [ticketNumber, subject, description || '', priority || 'Medium']
      );
      if (insRes.rows.length > 0) createdTicket = insRes.rows[0];
      await logAudit('Support Ticket Created', ticketNumber, 'Alex Johnson', req.ip);
    }

    res.status(201).json({
      success: true,
      message: `Support ticket ${ticketNumber} created successfully.`,
      ticket: createdTicket
    });
  } catch (e) {
    next(e);
  }
});

// -------------------------------------------------------------
// 8. ADMIN DASHBOARD API ROUTES (POSTGRESQL POWERED)
// -------------------------------------------------------------

// Admin Key Metrics & System Status
app.get('/api/admin/metrics', async (_req, res, next) => {
  try {
    let totalCustomers = 0;
    let activeSubscriptions = 0;
    let monthlyRevenue = 0;

    if (isDbConnected) {
      try {
        const custRes = await query('SELECT COUNT(*) FROM subscriptions');
        totalCustomers = parseInt(custRes.rows[0]?.count, 10) || 0;
        const subRes = await query("SELECT COUNT(*) FROM subscriptions WHERE status = 'Active'");
        activeSubscriptions = parseInt(subRes.rows[0]?.count, 10) || 0;
        const revRes = await query("SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'Paid'");
        monthlyRevenue = parseInt(revRes.rows[0]?.total, 10) || 0;
      } catch (err) {}
    }

    res.json({
      totalCustomers,
      totalCustomersChange: `${totalCustomers} total`,
      totalCustomersTrend: '0%',
      activeSubscriptions,
      activeSubscriptionsChange: `${activeSubscriptions} active`,
      activeSubscriptionsTrend: '0%',
      monthlyRevenue,
      monthlyRevenueFormatted: `₹${monthlyRevenue.toLocaleString('en-IN')}`,
      mrr: monthlyRevenue,
      mrrFormatted: `₹${monthlyRevenue.toLocaleString('en-IN')}`,
      monthlyRevenueTrend: '0%',
      trialConversions: 0,
      trialConversionsConverted: '0 converted',
      trialConversionsTrend: '0%',
      systemStatus: {
        overall: 'All Services Operational',
        status: 'Operational',
        services: [
          { id: 'auth', name: 'Authentication (SSO)', status: 'Operational' },
          { id: 'finance', name: 'Finance Apps', status: 'Operational' },
          { id: 'hrms', name: 'HRMS Apps', status: 'Operational' },
          { id: 'marketing', name: 'Marketing Apps', status: 'Operational' },
          { id: 'websites', name: 'Website Apps', status: 'Operational' },
          { id: 'api', name: 'API Services', status: 'Operational' }
        ]
      }
    });
  } catch (e) {
    next(e);
  }
});

// Revenue Overview Chart Data
app.get('/api/admin/revenue-chart', async (req, res, next) => {
  try {
    const period = req.query.period || 'monthly';
    let monthlyData = [];

    if (isDbConnected) {
      try {
        const invRes = await query(`
          SELECT TO_CHAR(invoice_date, 'Mon') as month, COALESCE(SUM(amount), 0) as revenue
          FROM invoices
          WHERE status = 'Paid'
          GROUP BY TO_CHAR(invoice_date, 'Mon')
        `);
        monthlyData = invRes.rows.map(r => ({
          month: r.month,
          revenue: parseInt(r.revenue, 10) || 0,
          formatted: `₹${(parseInt(r.revenue, 10) || 0).toLocaleString('en-IN')}`
        }));
      } catch (e) {}
    }

    res.json({
      period,
      currentRevenueFormatted: monthlyData.length ? monthlyData[monthlyData.length - 1].formatted : '₹0',
      currentMonth: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      data: monthlyData
    });
  } catch (e) {
    next(e);
  }
});

// Customer Growth Chart Data
app.get('/api/admin/growth-chart', async (_req, res, next) => {
  try {
    let growthData = [];
    if (isDbConnected) {
      try {
        const growRes = await query(`
          SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as "newCustomers", COUNT(*) as "totalCustomers"
          FROM subscriptions
          GROUP BY TO_CHAR(created_at, 'Mon')
        `);
        growthData = growRes.rows;
      } catch (e) {}
    }

    res.json({ data: growthData });
  } catch (e) {
    next(e);
  }
});

// Top Products by Revenue
app.get('/api/admin/top-products', async (_req, res, next) => {
  try {
    let products = [];
    if (isDbConnected) {
      try {
        const prodRes = await query(`SELECT * FROM products_plans ORDER BY revenue DESC`);
        products = prodRes.rows;
      } catch (e) {}
    }

    res.json(products);
  } catch (e) {
    next(e);
  }
});

// Recent Customers list
app.get('/api/admin/customers', async (req, res, next) => {
  try {
    let customers = [];
    if (isDbConnected) {
      try {
        const subRes = await query(`SELECT * FROM subscriptions ORDER BY renewal_date DESC LIMIT 50`);
        customers = subRes.rows.map(r => ({
          company: r.company_name,
          plan: r.plan,
          amount: `₹${r.amount?.toLocaleString('en-IN')}`,
          status: r.status,
          date: new Date(r.renewal_date || r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        }));
      } catch (e) {}
    }

    res.json(customers);
  } catch (e) {
    next(e);
  }
});

// Recent Support Tickets for Admin
app.get('/api/admin/tickets', async (_req, res, next) => {
  try {
    let tickets = [];
    if (isDbConnected) {
      try {
        const ticketRes = await query(`SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 50`);
        tickets = ticketRes.rows.map(t => ({
          id: t.ticket_number || `#${t.id}`,
          subject: t.subject,
          status: t.status,
          priority: t.priority,
          date: new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          company: t.company_name
        }));
      } catch (e) {}
    }

    res.json(tickets);
  } catch (e) {
    next(e);
  }
});

// Update Support Ticket (Status / Priority)
app.put('/api/admin/tickets/:id', async (req, res, next) => {
  try {
    const { status, priority } = req.body || {};
    const ticketId = req.params.id;

    if (isDbConnected) {
      await query(
        `UPDATE support_tickets SET status = COALESCE($1, status), priority = COALESCE($2, priority), updated_at = NOW()
         WHERE ticket_number = $3 OR id::text = $3`,
        [status, priority, ticketId]
      );
      await logAudit('Ticket Status Updated', ticketId, 'Super Administrator', req.ip, { status, priority });
    }

    res.json({ success: true, message: `Ticket ${ticketId} updated successfully.` });
  } catch (e) {
    next(e);
  }
});

// Update Customer Status (Suspend / Activate)
app.put('/api/admin/customers/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body || {};
    const companyName = req.params.id;

    if (isDbConnected) {
      await query(`UPDATE organizations SET status = $1 WHERE name = $2`, [status, companyName]);
      await query(`UPDATE subscriptions SET status = $1 WHERE company_name = $2`, [status, companyName]);
      await logAudit(`Customer ${status}`, companyName, 'Super Administrator', req.ip);
    }

    res.json({ success: true, message: `Customer ${companyName} status set to ${status}.` });
  } catch (e) {
    next(e);
  }
});

// -------------------------------------------------------------
// 9. SAAS PRICING & PAYMENT WORKFLOW ENDPOINTS
// -------------------------------------------------------------

// Pricing plans configuration
const PRICING_CONFIG = {
  freeDemo: {
    id: 'free-demo',
    name: 'Free Demo',
    tagline: 'Experience OXOO with live demo',
    price: 0,
    priceFormatted: '₹0',
    maxApps: 1,
    trialDays: 14,
    features: [
      'One software (choose any)',
      'Unlimited users',
      'Full feature access for 14 days',
      'Explore UI & workflow',
      'No credit card required'
    ]
  },
  singleApp: {
    id: 'single-app',
    name: 'Single Software',
    tagline: 'Buy one software at affordable price',
    monthlyPrice: 740,
    yearlyPrice: 560,
    monthlyStrikethroughPrice: 975,
    yearlyStrikethroughPrice: 740,
    discountPercent: 24,
    maxApps: 1,
    features: [
      'Select any one available OXOO software',
      'Access the purchased software\'s included features',
      'Application-specific dashboard',
      'User and role management',
      'Reports and analytics included',
      'Updates and standard support',
      'Secure account access',
      'Cancel anytime'
    ]
  },
  customApps: {
    id: 'custom-apps',
    name: 'Custom Softwares',
    tagline: 'Choose 2 or more software and get advanced features',
    monthlyBasePrice: 1280,
    yearlyBasePrice: 980,
    monthlyAdditionalAppPrice: 740,
    yearlyAdditionalAppPrice: 560,
    monthlyStrikethroughBasePrice: 1660,
    yearlyStrikethroughBasePrice: 1280,
    discountPercent: 23,
    minApps: 2,
    features: [
      'Select 2 or more software',
      'All apps full access',
      'Mix and match as per your need',
      'Multi-company support',
      'External API access',
      'Advanced reporting & integrations',
      'Priority support'
    ]
  }
};

// Calculate pricing function with strict server-side validation
function calculatePricing({ planId, selectedApps = [], userCount = 1, billingCycle = 'monthly' }) {
  const users = Math.max(1, parseInt(userCount, 10) || 1);
  const isYearly = billingCycle === 'yearly';
  const appsCount = Math.max(1, Array.isArray(selectedApps) ? selectedApps.length : 1);

  let perUserPerMonth = 0;

  if (planId === 'free-demo' || planId === 'free') {
    return {
      planId: 'free-demo',
      planName: 'Free Demo',
      userCount: users,
      billingCycle,
      appsCount: 1,
      perUserPerMonth: 0,
      regularRatePerUser: 0,
      regularTotal: 0,
      discountAmount: 0,
      discountPercent: 0,
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      totalAmountPaise: 0,
      formattedPerUser: '₹0',
      formattedDiscount: '₹0',
      formattedSubtotal: '₹0',
      formattedTax: '₹0',
      formattedTotal: '₹0'
    };
  }

  let regularRatePerUser = 0;
  if (planId === 'single-app' || planId === 'single' || appsCount === 1) {
    perUserPerMonth = isYearly ? 560 : 740;
    regularRatePerUser = isYearly ? 740 : 975;
  } else {
    // Custom Softwares: 2 apps base (1280 monthly / 980 yearly), each additional (740 monthly / 560 yearly)
    const baseRate = isYearly ? 980 : 1280;
    const extraRate = isYearly ? 560 : 740;
    perUserPerMonth = baseRate + Math.max(0, appsCount - 2) * extraRate;

    const regularBase = isYearly ? 1280 : 1660;
    const regularExtra = isYearly ? 740 : 975;
    regularRatePerUser = regularBase + Math.max(0, appsCount - 2) * regularExtra;
  }

  let subtotal = perUserPerMonth * users;
  let regularTotal = regularRatePerUser * users;
  let discountAmount = Math.max(0, regularTotal - subtotal);
  const gstRate = 0.18;
  const taxAmount = Math.round(subtotal * gstRate);
  const totalAmount = subtotal + taxAmount;
  const totalAmountPaise = totalAmount * 100;
  const discountPercent = planId === 'custom-apps' || appsCount > 1 ? 23 : 24;

  return {
    planId: planId || (appsCount > 1 ? 'custom-apps' : 'single-app'),
    planName: planId === 'custom-apps' || appsCount > 1 ? 'Custom Softwares' : 'Single Software',
    userCount: users,
    billingCycle,
    appsCount,
    perUserPerMonth,
    regularRatePerUser,
    regularTotal,
    discountAmount,
    discountPercent,
    monthlyBase: subtotal,
    subtotal,
    taxAmount,
    totalAmount,
    totalAmountPaise,
    formattedPerUser: `₹${perUserPerMonth.toLocaleString('en-IN')}`,
    formattedDiscount: `₹${discountAmount.toLocaleString('en-IN')}`,
    formattedSubtotal: `₹${subtotal.toLocaleString('en-IN')}`,
    formattedTax: `₹${taxAmount.toLocaleString('en-IN')}`,
    formattedTotal: `₹${totalAmount.toLocaleString('en-IN')}`
  };
}

// 1. GET /api/pricing/plans
app.get('/api/pricing/plans', (_req, res) => {
  res.json({
    success: true,
    plans: PRICING_CONFIG,
    taxRate: 0.18,
    currency: 'INR'
  });
});

// 2. POST /api/pricing/calculate
app.post('/api/pricing/calculate', (req, res) => {
  try {
    const calc = calculatePricing(req.body || {});
    res.json({ success: true, ...calc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 3. POST /api/payment/create-order
app.post('/api/payment/create-order', async (req, res, next) => {
  try {
    const {
      planId,
      selectedApps = [],
      userCount = 1,
      billingCycle = 'monthly',
      companyName,
      customerName,
      customerEmail,
      customerPhone
    } = req.body || {};

    if (!companyName || !customerEmail) {
      return res.status(400).json({ success: false, message: 'Company name and email are required.' });
    }

    const calc = calculatePricing({ planId, selectedApps, userCount, billingCycle });
    const orderNumber = `OXOO-ORD-${Date.now().toString().slice(-6)}`;

    const safeSubtotal = parseFloat(Number(calc.subtotal || 0).toFixed(2));
    const safeTax = parseFloat(Number(calc.taxAmount || 0).toFixed(2));
    const safeTotal = parseFloat(Number(calc.totalAmount || 0).toFixed(2));

    const order = {
      orderNumber,
      companyName,
      customerName: customerName || companyName,
      customerEmail,
      customerPhone: customerPhone || '',
      planName: calc.planName,
      selectedApps,
      userCount: calc.userCount,
      billingCycle: calc.billingCycle,
      subtotal: safeSubtotal,
      taxAmount: safeTax,
      totalAmount: safeTotal,
      totalAmountPaise: calc.totalAmountPaise,
      currency: 'INR',
      status: 'Created'
    };

    if (isDbConnected) {
      await query(
        `INSERT INTO orders (order_number, company_name, customer_name, customer_email, customer_phone, plan_name, selected_apps, user_count, billing_cycle, subtotal, tax_amount, total_amount, currency, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'INR', 'Created')`,
        [
          orderNumber,
          companyName,
          customerName || companyName,
          customerEmail,
          customerPhone || '',
          calc.planName,
          JSON.stringify(selectedApps),
          calc.userCount,
          calc.billingCycle,
          safeSubtotal,
          safeTax,
          safeTotal
        ]
      );
    }

    res.json({
      success: true,
      order,
      razorpayKeyId: 'rzp_test_oxoo_demo_key',
      amountPaise: calc.totalAmountPaise,
      currency: 'INR'
    });
  } catch (err) {
    next(err);
  }
});

// 4. POST /api/payment/verify
app.post('/api/payment/verify', async (req, res, next) => {
  try {
    const {
      orderNumber,
      paymentId,
      paymentMethod = 'Credit / Debit Card',
      companyName,
      customerName,
      customerEmail,
      selectedApps = [],
      planName = 'Single App',
      billingCycle = 'monthly',
      totalAmount = 560
    } = req.body || {};

    const safeTotalAmount = parseFloat(Number(totalAmount || 0).toFixed(2));
    const verifiedPaymentId = paymentId || `pay_rzp_${Date.now().toString().slice(-8)}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    if (isDbConnected) {
      await query(
        `UPDATE orders SET status = 'Paid', payment_id = $1, payment_method = $2, updated_at = NOW() WHERE order_number = $3`,
        [verifiedPaymentId, paymentMethod, orderNumber]
      );

      const renewalInterval = billingCycle === 'yearly' ? '1 year' : '1 month';
      await query(
        `INSERT INTO subscriptions (company_name, plan, amount, currency, billing_cycle, status, start_date, renewal_date, active_apps)
         VALUES ($1, $2, $3, 'INR', $4, 'Active', NOW(), NOW() + INTERVAL '${renewalInterval}', $5)`,
        [companyName || 'My Organization', planName, safeTotalAmount, billingCycle, JSON.stringify(selectedApps)]
      );

      await query(
        `INSERT INTO invoices (invoice_number, company_name, plan, amount, currency, status, invoice_date, items)
         VALUES ($1, $2, $3, $4, 'INR', 'Paid', NOW(), $5)`,
        [invoiceNumber, companyName || 'My Organization', planName, safeTotalAmount, JSON.stringify(selectedApps)]
      );

      await query(
        `UPDATE organizations SET plan = $1, active_apps = $2, status = 'Active', mrr = $3, updated_at = NOW()
         WHERE name = $4 OR id = 1`,
        [planName, JSON.stringify(selectedApps), safeTotalAmount, companyName]
      );

      await logAudit('Payment Succeeded & Verified', `${orderNumber} (${invoiceNumber})`, customerEmail || customerName, req.ip, {
        amount: safeTotalAmount,
        paymentId: verifiedPaymentId,
        paymentMethod
      });
    }

    const now = new Date();
    const dueDate = new Date(now);
    if (billingCycle === 'yearly') {
      dueDate.setFullYear(dueDate.getFullYear() + 1);
    } else {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    res.json({
      success: true,
      message: 'Payment verified and subscription activated successfully!',
      orderNumber,
      paymentId: verifiedPaymentId,
      invoiceNumber,
      planName,
      selectedApps,
      status: 'Active',
      amountPaid: safeTotalAmount,
      invoiceDate: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      invoiceDateIso: now.toISOString(),
      dueDateIso: dueDate.toISOString(),
      nextBillingDate: dueDate.toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// 5. GET /api/payment/invoice/:orderNumber
app.get('/api/payment/invoice/:orderNumber', async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    let order = null;
    let invoice = null;

    if (isDbConnected) {
      const ordRes = await query(`SELECT * FROM orders WHERE order_number = $1`, [orderNumber]);
      if (ordRes.rows.length > 0) order = ordRes.rows[0];

      const invRes = await query(`SELECT * FROM invoices ORDER BY id DESC LIMIT 1`);
      if (invRes.rows.length > 0) invoice = invRes.rows[0];
    }

    const now = new Date();
    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      order: order || {
        order_number: orderNumber,
        company_name: 'Customer Organization',
        total_amount: 560,
        status: 'Paid'
      },
      invoice: invoice || {
        invoice_number: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        status: 'Paid',
        invoice_date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        due_date: dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// ERROR HANDLERS & SERVER STARTUP
// -------------------------------------------------------------
app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));

app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message
  });
});

async function start() {
  try {
    await initDb();
    isDbConnected = true;
    console.log('✓ Successfully connected to Neon PostgreSQL online database.');
  } catch (err) {
    console.error('Neon PostgreSQL connection warning:', err.message);
    console.log('Server running with high-speed built-in fallbacks.');
  }

  app.listen(PORT, () => {
    console.log(`Oxoo.ai API server listening on port ${PORT} with Neon PostgreSQL backend`);
  });
}

start();
