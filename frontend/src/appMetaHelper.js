import { ALL_APPS_CATEGORIES } from './AllAppsDirectory';
import { APPS_DATA } from './appsData';

// Flatten all unique apps from ALL_APPS_CATEGORIES and APPS_DATA
export const ALL_SYSTEM_APPS = (() => {
  const map = new Map();

  // Primary source: ALL_APPS_CATEGORIES (exact website directory representation)
  for (const cat of ALL_APPS_CATEGORIES) {
    for (const app of cat.apps) {
      map.set(app.slug, {
        slug: app.slug,
        name: app.name,
        desc: app.desc,
        icon: app.icon || `/apps/logo-${app.slug}.png?v=clean`,
        bgColor: app.bgColor || '#eff6ff',
        category: cat.name,
        suiteTitle: app.name.toLowerCase().includes('suite') ? app.name : `${app.name} Suite`,
        suiteDesc: `${app.name}, Workflows, Integrations and Reports.`
      });
    }
  }

  // Secondary source: APPS_DATA
  for (const app of APPS_DATA) {
    if (!map.has(app.slug)) {
      map.set(app.slug, {
        slug: app.slug,
        name: app.name,
        desc: app.tagline || app.description || `${app.name}, Workflows, Integrations and Reports.`,
        icon: app.iconSrc || `/apps/logo-${app.slug}.png?v=clean`,
        bgColor: app.bgColor || '#eff6ff',
        category: app.category || 'Business',
        suiteTitle: app.name.toLowerCase().includes('suite') ? app.name : `${app.name} Suite`,
        suiteDesc: `${app.name}, Workflows, Integrations and Reports.`
      });
    }
  }

  return Array.from(map.values());
})();

/**
 * Resolves comprehensive metadata for any app by slug or object.
 * Guarantees proper icon, bgColor, suite title, and description matching the website.
 */
export function getAppMeta(slugOrApp) {
  if (!slugOrApp) {
    return ALL_SYSTEM_APPS.find((a) => a.slug === 'accounting') || ALL_SYSTEM_APPS[0];
  }

  const slug = typeof slugOrApp === 'string'
    ? slugOrApp.toLowerCase().trim()
    : (slugOrApp.slug || slugOrApp.id || '').toLowerCase().trim();

  // Try exact slug match
  let found = ALL_SYSTEM_APPS.find((a) => a.slug === slug);
  if (found) return found;

  // Try matching by name
  const nameToMatch = typeof slugOrApp === 'object' && slugOrApp.name ? slugOrApp.name.toLowerCase().trim() : slug;
  found = ALL_SYSTEM_APPS.find((a) => a.name.toLowerCase().trim() === nameToMatch);
  if (found) return found;

  // If object was passed with properties, synthesize
  if (typeof slugOrApp === 'object') {
    const rawName = slugOrApp.name || 'Business App';
    const rawSlug = slugOrApp.slug || slugOrApp.id || rawName.toLowerCase().replace(/\s+/g, '-');
    return {
      slug: rawSlug,
      name: rawName,
      desc: slugOrApp.desc || slugOrApp.tagline || `${rawName}, Workflows, Integrations and Reports.`,
      icon: slugOrApp.icon || slugOrApp.iconSrc || `/apps/logo-${rawSlug}.png?v=clean`,
      bgColor: slugOrApp.bgColor || '#eff6ff',
      category: slugOrApp.category || 'Business',
      suiteTitle: rawName.toLowerCase().includes('suite') ? rawName : `${rawName} Suite`,
      suiteDesc: `${rawName}, Workflows, Integrations and Reports.`
    };
  }

  return ALL_SYSTEM_APPS[0];
}
