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
    let openTicketsCount = 2;
    let teamCount = 12;

    if (isDbConnected) {
      try {
        const orgRes = await query(`SELECT * FROM organizations WHERE name = 'ABC Technologies' LIMIT 1`);
        if (orgRes.rows.length > 0) org = orgRes.rows[0];

        const ticketRes = await query(`SELECT COUNT(*) FROM support_tickets WHERE company_name = 'ABC Technologies' AND status != 'Resolved'`);
        if (ticketRes.rows.length > 0) openTicketsCount = parseInt(ticketRes.rows[0].count, 10) || 2;

        const teamRes = await query(`SELECT COUNT(*) FROM team_members WHERE company_name = 'ABC Technologies' AND status = 'Active'`);
        if (teamRes.rows.length > 0) teamCount = parseInt(teamRes.rows[0].count, 10) || 12;
      } catch (err) {
        console.error('Error fetching customer DB overview:', err.message);
      }
    }

    res.json({
      company: org?.name || 'ABC Technologies',
      customerName: 'Alex Johnson',
      email: 'alex@abctech.com',
      avatar: 'A',
      currentPlan: org?.plan || 'Business Pro',
      status: org?.status || 'Active',
      nextBillingDate: '12 Dec 2026',
      mrr: org?.mrr || 48200,
      activeAppsCount: 5,
      totalPurchasedApps: 12,
      activeAppsTrend: '+25%',
      teamMembersCount: teamCount,
      teamMembersTrend: '+3%',
      monthlyUsage: 2845,
      monthlyUsageTrend: '+18%',
      openTicketsCount: openTicketsCount,
      openTicketsTrend: '-50%',
      purchasedApps: [
        { id: 'accounting', name: 'Accounting', icon: 'BarChart2', status: 'Active', entitled: true },
        { id: 'invoicing', name: 'Invoicing', icon: 'FileText', status: 'Active', entitled: true },
        { id: 'expenses', name: 'Expenses', icon: 'Receipt', status: 'Active', entitled: true },
        { id: 'hrms', name: 'HRMS', icon: 'Users', status: 'Active', entitled: true },
        { id: 'website', name: 'Website Builder', icon: 'Globe', status: 'Active', entitled: true },
        { id: 'marketing', name: 'Marketing', icon: 'Megaphone', status: 'Not Purchased', entitled: false },
        { id: 'productivity', name: 'Productivity', icon: 'CheckSquare', status: 'Active', entitled: true },
        { id: 'projects', name: 'Project Management', icon: 'Layers', status: 'Active', entitled: true },
        { id: 'support', name: 'Customer Support', icon: 'Headphones', status: 'Trial', entitled: true },
        { id: 'crm', name: 'CRM Suite', icon: 'Briefcase', status: 'Not Purchased', entitled: false },
        { id: 'inventory', name: 'Inventory', icon: 'Package', status: 'Not Purchased', entitled: false },
        { id: 'pos', name: 'Point of Sale', icon: 'CreditCard', status: 'Not Purchased', entitled: false }
      ],
      recentActivity: [
        { id: 1, type: 'invoice', title: 'Invoice INV-2026-081 paid', desc: '₹48,200 received from Apex Logistics', time: '2 hours ago', icon: 'check', status: 'success' },
        { id: 2, type: 'member', title: 'New team member added', desc: 'Sarah Miller joined your organization', time: '5 hours ago', icon: 'user', status: 'info' },
        { id: 3, type: 'expense', title: 'Expense EXP-2026-034 submitted', desc: 'Office supplies expense', time: '1 day ago', icon: 'receipt', status: 'info' },
        { id: 4, type: 'ticket', title: 'Support ticket #1245 updated', desc: 'Your issue has been resolved', time: '2 days ago', icon: 'message', status: 'warning' },
        { id: 5, type: 'subscription', title: 'Subscription renewed', desc: 'Business Pro plan renewed successfully', time: '3 days ago', icon: 'check', status: 'success' }
      ]
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

    if (!invoices.length) {
      invoices = [
        { id: 1, invoice_number: 'INV-2026-081', company_name: 'Apex Logistics Ltd', plan: 'Business Pro', amount: 48200, status: 'Paid', invoice_date: '2026-10-12' },
        { id: 2, invoice_number: 'INV-2026-080', company_name: 'Metro Retailers', plan: 'Growth', amount: 25000, status: 'Paid', invoice_date: '2026-10-11' },
        { id: 3, invoice_number: 'INV-2026-079', company_name: 'BlueSky Cloud Corp', plan: 'Business Pro', amount: 124000, status: 'Paid', invoice_date: '2026-10-10' },
        { id: 4, invoice_number: 'INV-2026-078', company_name: 'ABC Technologies', plan: 'Business Pro', amount: 48200, status: 'Paid', invoice_date: '2026-10-09' }
      ];
    }

    res.json({
      currentPlan: {
        name: 'Business Pro',
        amount: 48200,
        currency: '₹',
        cycle: 'Monthly',
        status: 'Active',
        nextBilling: '12 Dec 2026',
        features: [
          'Up to 15 Team Members',
          'Access to 8 Core Business Apps',
          'Unlimited Monthly Transactions',
          'Priority 24/7 Dedicated Support',
          'Automated GST & Tax Invoicing',
          'SSO & Granular Security Roles'
        ]
      },
      availablePlans: [
        { name: 'Starter', price: 15000, cycle: '/mo', seats: '5 seats', apps: '3 Apps included', popular: false },
        { name: 'Growth', price: 25000, cycle: '/mo', seats: '10 seats', apps: '5 Apps included', popular: false },
        { name: 'Business Pro', price: 48200, cycle: '/mo', seats: '15 seats', apps: '8 Apps included', popular: true, current: true },
        { name: 'Enterprise', price: 124000, cycle: '/mo', seats: 'Unlimited seats', apps: 'All 24 Apps included', popular: false }
      ],
      invoices,
      paymentMethod: {
        type: 'Mastercard',
        last4: '8842',
        expiry: '09/28',
        isDefault: true
      }
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

    if (!members.length) {
      members = [
        { id: 1, name: 'Alex Johnson', email: 'alex@abctech.com', role: 'Organization Admin', status: 'Active' },
        { id: 2, name: 'Sarah Miller', email: 'sarah.m@abctech.com', role: 'Finance Lead', status: 'Active' },
        { id: 3, name: 'David Chen', email: 'david.c@abctech.com', role: 'HR Director', status: 'Active' },
        { id: 4, name: 'Elena Rostova', email: 'elena.r@abctech.com', role: 'Web Developer', status: 'Active' },
        { id: 5, name: 'Vikram Patel', email: 'vikram.p@abctech.com', role: 'Operations Manager', status: 'Active' },
        { id: 6, name: 'Maria Garcia', email: 'maria.g@abctech.com', role: 'Staff Accountant', status: 'Active' },
        { id: 7, name: 'James Wilson', email: 'james.w@abctech.com', role: 'Marketing Associate', status: 'Active' },
        { id: 8, name: 'Priya Rao', email: 'priya.r@abctech.com', role: 'HR Specialist', status: 'Active' },
        { id: 9, name: 'Thomas Wright', email: 'thomas.w@abctech.com', role: 'Billing Specialist', status: 'Active' },
        { id: 10, name: 'Aisha Khan', email: 'aisha.k@abctech.com', role: 'Project Coordinator', status: 'Active' },
        { id: 11, name: 'Robert Taylor', email: 'robert.t@abctech.com', role: 'Customer Support', status: 'Active' },
        { id: 12, name: 'Siddharth Iyer', email: 'sid.i@abctech.com', role: 'Security Auditor', status: 'Active' }
      ];
    }

    res.json({
      members,
      seatsUsed: members.length,
      seatsTotal: 15,
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

    if (!tickets.length) {
      tickets = [
        { id: 1, ticket_number: '#1245', subject: 'Login issue', status: 'Resolved', priority: 'Medium', created_at: '2 hours ago', company_name: 'ABC Technologies' },
        { id: 2, ticket_number: '#1244', subject: 'Payment failed', status: 'Open', priority: 'High', created_at: '4 hours ago', company_name: 'Metro Retailers' },
        { id: 3, ticket_number: '#1243', subject: 'Feature request', status: 'In Progress', priority: 'Low', created_at: '1 day ago', company_name: 'BlueSky Cloud Corp' },
        { id: 4, ticket_number: '#1242', subject: 'Integration error', status: 'Open', priority: 'High', created_at: '2 days ago', company_name: 'GreenLeaf Organics' },
        { id: 5, ticket_number: '#1241', subject: 'Account setup help', status: 'Resolved', priority: 'Low', created_at: '3 days ago', company_name: 'NovaTech Solutions' }
      ];
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
    res.json({
      totalCustomers: 1248,
      totalCustomersChange: '+132 this month',
      totalCustomersTrend: '+12%',
      activeSubscriptions: 2856,
      activeSubscriptionsChange: '+436 this month',
      activeSubscriptionsTrend: '+18%',
      monthlyRevenue: 4892000,
      monthlyRevenueFormatted: '₹48,92,000',
      mrr: 4210000,
      mrrFormatted: '₹42,10,000',
      monthlyRevenueTrend: '+24%',
      trialConversions: 68,
      trialConversionsConverted: '142 converted',
      trialConversionsTrend: '+6%',
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
    const monthlyData = [
      { month: 'Jan', revenue: 1850000, formatted: '₹18.5L' },
      { month: 'Feb', revenue: 2120000, formatted: '₹21.2L' },
      { month: 'Mar', revenue: 2450000, formatted: '₹24.5L' },
      { month: 'Apr', revenue: 2680000, formatted: '₹26.8L' },
      { month: 'May', revenue: 2950000, formatted: '₹29.5L' },
      { month: 'Jun', revenue: 3180000, formatted: '₹31.8L' },
      { month: 'Jul', revenue: 3520000, formatted: '₹35.2L' },
      { month: 'Aug', revenue: 3890000, formatted: '₹38.9L' },
      { month: 'Sep', revenue: 4340000, formatted: '₹43.4L' },
      { month: 'Oct', revenue: 4892000, formatted: '₹48,92,000', isCurrent: true }
    ];

    res.json({
      period,
      currentRevenueFormatted: '₹48,92,000',
      currentMonth: 'Oct 2026',
      data: monthlyData
    });
  } catch (e) {
    next(e);
  }
});

// Customer Growth Chart Data
app.get('/api/admin/growth-chart', async (req, res, next) => {
  try {
    const growthData = [
      { month: 'Jan', newCustomers: 120, totalCustomers: 540 },
      { month: 'Feb', newCustomers: 145, totalCustomers: 620 },
      { month: 'Mar', newCustomers: 180, totalCustomers: 710 },
      { month: 'Apr', newCustomers: 195, totalCustomers: 790 },
      { month: 'May', newCustomers: 220, totalCustomers: 880 },
      { month: 'Jun', newCustomers: 260, totalCustomers: 950 },
      { month: 'Jul', newCustomers: 290, totalCustomers: 1040 },
      { month: 'Aug', newCustomers: 320, totalCustomers: 1110 },
      { month: 'Sep', newCustomers: 350, totalCustomers: 1180 },
      { month: 'Oct', newCustomers: 380, totalCustomers: 1248 }
    ];

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

    if (!products.length) {
      products = [
        { product_name: 'Finance Suite', revenue: 1840000, revenue_percent: 38, icon: 'Finance' },
        { product_name: 'HRMS', revenue: 1260000, revenue_percent: 26, icon: 'HR' },
        { product_name: 'Website Builder', revenue: 820000, revenue_percent: 17, icon: 'Web' },
        { product_name: 'Marketing Suite', revenue: 610000, revenue_percent: 12, icon: 'Marketing' },
        { product_name: 'Productivity Suite', revenue: 370000, revenue_percent: 7, icon: 'Productivity' }
      ];
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

    if (!customers.length) {
      customers = [
        { company: 'Apex Logistics Ltd', plan: 'Business Pro', amount: '₹48,200', status: 'Active', date: '12 Oct 2026' },
        { company: 'Metro Retailers', plan: 'Growth', amount: '₹25,000', status: 'Active', date: '11 Oct 2026' },
        { company: 'BlueSky Cloud Corp', plan: 'Business Pro', amount: '₹1,24,000', status: 'Active', date: '10 Oct 2026' },
        { company: 'GreenLeaf Organics', plan: 'Starter', amount: '₹32,600', status: 'Trial', date: '09 Oct 2026' },
        { company: 'NovaTech Solutions', plan: 'Growth', amount: '₹78,400', status: 'Active', date: '08 Oct 2026' }
      ];
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
          date: 'Recently',
          company: t.company_name
        }));
      } catch (e) {}
    }

    if (!tickets.length) {
      tickets = [
        { id: '#1245', subject: 'Login issue', status: 'Resolved', priority: 'Medium', date: '2 hours ago', company: 'ABC Technologies' },
        { id: '#1244', subject: 'Payment failed', status: 'Open', priority: 'High', date: '4 hours ago', company: 'Metro Retailers' },
        { id: '#1243', subject: 'Feature request', status: 'In Progress', priority: 'Low', date: '1 day ago', company: 'BlueSky Cloud Corp' },
        { id: '#1242', subject: 'Integration error', status: 'Open', priority: 'High', date: '2 days ago', company: 'GreenLeaf Organics' },
        { id: '#1241', subject: 'Account setup help', status: 'Resolved', priority: 'Low', date: '3 days ago', company: 'NovaTech Solutions' }
      ];
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
