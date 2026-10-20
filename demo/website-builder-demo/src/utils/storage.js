const STORAGE_KEYS = {
  CURRENT_CONFIG: 'website_builder_current_config',
  SAVED_SITES: 'website_builder_saved_sites',
  LEAD_ENQUIRIES: 'website_builder_leads',
  BUILDER_STEP: 'website_builder_active_step'
};

export const getSavedConfig = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_CONFIG);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to load saved config from localStorage', err);
    return null;
  }
};

export const saveConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save config to localStorage', err);
  }
};

export const getSavedSites = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_SITES);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load saved sites', err);
    return [];
  }
};

export const saveSiteToLibrary = (config) => {
  try {
    const sites = getSavedSites();
    const siteToSave = {
      ...config,
      savedAt: new Date().toISOString(),
      savedId: config.savedId || `site-${Date.now()}`
    };
    const existingIndex = sites.findIndex((s) => s.savedId === siteToSave.savedId);
    if (existingIndex >= 0) {
      sites[existingIndex] = siteToSave;
    } else {
      sites.unshift(siteToSave);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_SITES, JSON.stringify(sites));
    return siteToSave;
  } catch (err) {
    console.error('Failed to save site to library', err);
    return null;
  }
};

export const deleteSavedSite = (savedId) => {
  try {
    const sites = getSavedSites().filter((s) => s.savedId !== savedId);
    localStorage.setItem(STORAGE_KEYS.SAVED_SITES, JSON.stringify(sites));
    return sites;
  } catch (err) {
    console.error('Failed to delete saved site', err);
    return [];
  }
};

// Client Enquiry Leads Storage
export const getLeadEnquiries = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEAD_ENQUIRIES);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load enquiries', err);
    return [];
  }
};

export const saveLeadEnquiry = (lead) => {
  try {
    const leads = getLeadEnquiries();
    const newLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    leads.unshift(newLead);
    localStorage.setItem(STORAGE_KEYS.LEAD_ENQUIRIES, JSON.stringify(leads));
    return newLead;
  } catch (err) {
    console.error('Failed to save lead enquiry', err);
    return null;
  }
};

export const getActiveStep = () => {
  return 1;
};

export const setActiveStep = (step) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.BUILDER_STEP, step.toString());
  } catch (err) {}
};

export const clearAllDemoData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  } catch (e) {}
};
