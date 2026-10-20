require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, initDb, query } = require('../src/db');
const { categories, services } = require('../src/seedData');

const APPS = services.map((s, idx) => ({
  id: s.slug,
  slug: s.slug,
  name: s.name,
  category: s.category,
  icon_src: `/apps/logo-${s.slug.split('-')[0]}.png?v=clean`,
  tagline: s.description,
  sort_order: idx
}));

async function runSeed() {
  try {
    console.log('--- Initializing Neon PostgreSQL Database & Seeding ---');
    await initDb();

    // 1. Seed Categories
    for (const cat of categories) {
      await query(`
        INSERT INTO categories (slug, name, description, color, icon, services, sort_order, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          color = EXCLUDED.color,
          icon = EXCLUDED.icon,
          services = EXCLUDED.services,
          sort_order = EXCLUDED.sort_order,
          active = EXCLUDED.active;
      `, [
        cat.slug,
        cat.name,
        cat.description || '',
        cat.color || 'green',
        cat.icon || 'BriefcaseBusiness',
        JSON.stringify(cat.services || []),
        cat.sortOrder || 0,
        cat.active ?? true
      ]);
    }
    console.log(`✓ Seeded ${categories.length} categories.`);

    // 2. Seed Services
    for (const s of services) {
      await query(`
        INSERT INTO services (slug, name, category, description, color, icon, featured, features, sort_order, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          color = EXCLUDED.color,
          icon = EXCLUDED.icon,
          featured = EXCLUDED.featured,
          features = EXCLUDED.features,
          sort_order = EXCLUDED.sort_order,
          active = EXCLUDED.active;
      `, [
        s.slug,
        s.name,
        s.category,
        s.description || '',
        s.color || 'green',
        s.icon || 'BriefcaseBusiness',
        Boolean(s.featured),
        JSON.stringify(s.features || []),
        s.sortOrder || 0,
        s.active ?? true
      ]);
    }
    console.log(`✓ Seeded ${services.length} services.`);

    // 3. Seed 24 Business Apps
    for (let i = 0; i < APPS.length; i++) {
      const a = APPS[i];
      await query(`
        INSERT INTO applications (id, slug, name, category, icon_src, tagline, sort_order, enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          icon_src = EXCLUDED.icon_src,
          tagline = EXCLUDED.tagline,
          sort_order = EXCLUDED.sort_order;
      `, [
        a.id,
        a.slug,
        a.name,
        a.category,
        a.icon_src,
        a.tagline || '',
        i
      ]);
    }
    console.log(`✓ Seeded ${APPS.length} applications.`);

    // 4. Seed Root Administrator
    const adminEmail = 'admin@oxoo.ai';
    const adminPass = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(adminPass, salt);

    await query(`
      INSERT INTO users (name, email, password, role, organization, active)
      VALUES ($1, $2, $3, 'admin', 'Oxoo.ai Core Corp', true)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        role = 'admin';
    `, ['Root Administrator', adminEmail, hashedPass]);
    console.log(`✓ Seeded admin user (${adminEmail}).`);

    // 5. Seed Demo Organization
    await query(`
      INSERT INTO organizations (name, plan, active_apps, member_count, status)
      SELECT 'Oxoo.ai Enterprise', 'Enterprise', $1, 24, 'Active'
      WHERE NOT EXISTS (SELECT 1 FROM organizations LIMIT 1);
    `, [JSON.stringify(APPS.map(a => a.name))]);
    console.log('✓ Seeded initial organization.');

    // 6. Seed Initial Audit Log
    await query(`
      INSERT INTO audit_logs (action, target, user_name, ip, details)
      VALUES ('Database Initialized', 'Neon PostgreSQL', 'system', '127.0.0.1', $1);
    `, [JSON.stringify({ provider: 'Neon Serverless Postgres', timestamp: new Date().toISOString() })]);
    console.log('✓ Seeded initial audit log.');

    console.log('--- Database seeding completed successfully! ---');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
