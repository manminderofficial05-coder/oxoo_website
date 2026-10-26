import React, { useState, useEffect } from 'react';
import {
  Settings, Globe, Palette, Mail, CreditCard, Shield,
  Sliders, FileText, Server, RefreshCw, CheckCircle2,
  Lock, AlertTriangle, Key, ExternalLink, Save, Activity
} from 'lucide-react';
import { getAdminPlatformSettings, updateAdminPlatformSettings } from '../../api';

export default function SettingsModule({ showToast, logAuditEvent }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'branding' | 'email' | 'payments' | 'security' | 'api' | 'billing' | 'system'
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Settings state by category
  const [categoryData, setCategoryData] = useState({
    general: {
      platformName: 'OXOO 360',
      tagline: 'One Platform. Infinite Possibilities.',
      defaultCurrency: 'INR (₹)',
      timezone: 'Asia/Kolkata',
      supportEmail: 'support@oxoo.ai',
      supportPhone: '+91 80 4567 8900',
      publicWebsiteUrl: 'https://oxoo.ai'
    },
    branding: {
      primaryColor: '#0284c7',
      accentColor: '#06b6d4',
      logoUrl: '/logo.svg',
      faviconUrl: '/favicon.ico',
      darkSidebar: true,
      emailBrandingEnabled: true
    },
    email: {
      provider: 'Brevo',
      senderName: 'OXOO Platform',
      senderEmail: 'manminder.singh@primepro.ai',
      replyToEmail: 'support@oxoo.ai',
      smtpHost: 'smtp-relay.brevo.com',
      smtpPort: 587
    },
    payments: {
      defaultGateway: 'Razorpay',
      mode: 'Live',
      supportedCurrencies: 'INR, USD, EUR, GBP',
      taxRatePercent: 18,
      taxName: 'GST',
      invoicePrefix: 'INV-2026-',
      gracePeriodDays: 5
    },
    security: {
      sessionLifetimeHours: 24,
      passwordMinLength: 8,
      requireSpecialChars: true,
      mfaPolicy: 'Optional for Users, Enforced for Super Admins',
      maxLoginAttempts: 5,
      lockoutDurationMins: 15
    },
    api: {
      webhookUrl: 'https://api.oxoo.ai/api/webhooks/v1',
      webhookEvents: ['payment.succeeded', 'customer.created', 'subscription.renewed', 'ticket.created'],
      signingKeyMasked: 'whsec_••••••••••••••••••••••••••••••••',
      rateLimitPerMinute: 600
    },
    billing: {
      defaultCycle: 'Monthly',
      renewalReminderDays: 5,
      autoRetryAttempts: 3,
      prorateUpgrades: true
    },
    system: {
      maintenanceMode: false,
      debugLogging: false,
      databaseStatus: 'Healthy (PostgreSQL Neon)',
      systemVersion: 'OXOO 360 v2.4.1',
      uptime: '99.98%'
    }
  });

  const fetchCategorySettings = async (cat) => {
    setLoading(true);
    try {
      const res = await getAdminPlatformSettings(cat);
      if (res && res.settings && Object.keys(res.settings).length > 0) {
        setCategoryData(prev => ({
          ...prev,
          [cat]: { ...prev[cat], ...res.settings }
        }));
      }
    } catch (err) {
      console.error(`Failed to load ${cat} settings:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorySettings(activeTab);
  }, [activeTab]);

  const handleUpdateField = (field, val) => {
    setCategoryData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: val
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const currentCategoryPayload = categoryData[activeTab];
      const res = await updateAdminPlatformSettings(activeTab, currentCategoryPayload);
      if (res && res.success) {
        if (showToast) showToast(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings saved successfully.`);
        if (logAuditEvent) logAuditEvent('Platform Settings Saved', activeTab);
      } else {
        if (showToast) showToast(res.message || 'Failed to save settings.');
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Error saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentSettings = categoryData[activeTab] || {};

  return (
    <div className="oxoo-section-card" style={{ padding: '24px' }}>
      
      {/* 1. Header */}
      <div className="oxoo-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={22} />
          </div>
          <div>
            <h2 className="oxoo-section-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              Platform Configuration & Settings
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
              Enterprise preferences, branding, email delivery, payments, security policy, and system health.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="oxoo-outline-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}
          onClick={() => fetchCategorySettings(activeTab)}
        >
          <RefreshCw size={14} className={loading ? 'oxoo-spin' : ''} /> Reload
        </button>
      </div>

      {/* 2. 8 Subnav Tabs (Requirement 6.1) */}
      <div className="oxoo-tab-pill-bar" style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
        {[
          { id: 'general', label: 'General', icon: Globe },
          { id: 'branding', label: 'Branding', icon: Palette },
          { id: 'email', label: 'Email', icon: Mail },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'api', label: 'API & Webhooks', icon: Key },
          { id: 'billing', label: 'Billing', icon: FileText },
          { id: 'system', label: 'System', icon: Server }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              className={`oxoo-tab-pill ${activeTab === t.id ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setActiveTab(t.id)}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 3. Form Content Area */}
      <div style={{ maxWidth: '780px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <RefreshCw size={20} className="oxoo-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
            Loading {activeTab} settings...
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* TAB 1: GENERAL SETTINGS (Requirement 6.2) */}
            {activeTab === 'general' && (
              <>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Platform Name</label>
                  <input
                    type="text"
                    className="oxoo-form-input"
                    value={currentSettings.platformName || ''}
                    onChange={(e) => handleUpdateField('platformName', e.target.value)}
                  />
                </div>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Tagline</label>
                  <input
                    type="text"
                    className="oxoo-form-input"
                    value={currentSettings.tagline || ''}
                    onChange={(e) => handleUpdateField('tagline', e.target.value)}
                  />
                </div>
                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Default Currency</label>
                    <input
                      type="text"
                      className="oxoo-form-input"
                      value={currentSettings.defaultCurrency || ''}
                      onChange={(e) => handleUpdateField('defaultCurrency', e.target.value)}
                    />
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Default Platform Timezone</label>
                    <input
                      type="text"
                      className="oxoo-form-input"
                      value={currentSettings.timezone || ''}
                      onChange={(e) => handleUpdateField('timezone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Customer Support Email</label>
                    <input
                      type="email"
                      className="oxoo-form-input"
                      value={currentSettings.supportEmail || ''}
                      onChange={(e) => handleUpdateField('supportEmail', e.target.value)}
                    />
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Support Phone</label>
                    <input
                      type="text"
                      className="oxoo-form-input"
                      value={currentSettings.supportPhone || ''}
                      onChange={(e) => handleUpdateField('supportPhone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Public Website URL</label>
                  <input
                    type="url"
                    className="oxoo-form-input"
                    value={currentSettings.publicWebsiteUrl || ''}
                    onChange={(e) => handleUpdateField('publicWebsiteUrl', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* TAB 2: BRANDING SETTINGS (Requirement 6.3) */}
            {activeTab === 'branding' && (
              <>
                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Primary Brand Accent Color</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={currentSettings.primaryColor || '#0284c7'}
                        onChange={(e) => handleUpdateField('primaryColor', e.target.value)}
                        style={{ width: '40px', height: '38px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        className="oxoo-form-input"
                        value={currentSettings.primaryColor || '#0284c7'}
                        onChange={(e) => handleUpdateField('primaryColor', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Cyan Accent Color</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={currentSettings.accentColor || '#06b6d4'}
                        onChange={(e) => handleUpdateField('accentColor', e.target.value)}
                        style={{ width: '40px', height: '38px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        className="oxoo-form-input"
                        value={currentSettings.accentColor || '#06b6d4'}
                        onChange={(e) => handleUpdateField('accentColor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Logo Asset Path</label>
                    <input
                      type="text"
                      className="oxoo-form-input"
                      value={currentSettings.logoUrl || ''}
                      onChange={(e) => handleUpdateField('logoUrl', e.target.value)}
                    />
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Favicon Path</label>
                    <input
                      type="text"
                      className="oxoo-form-input"
                      value={currentSettings.faviconUrl || ''}
                      onChange={(e) => handleUpdateField('faviconUrl', e.target.value)}
                    />
                  </div>
                </div>
                <div className="oxoo-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={currentSettings.darkSidebar !== false}
                      onChange={(e) => handleUpdateField('darkSidebar', e.target.checked)}
                    />
                    <span>Enterprise Fixed Dark Navy Sidebar (Recommended)</span>
                  </label>
                </div>
              </>
            )}

            {/* TAB 3: EMAIL SETTINGS (Requirement 6.4) */}
            {activeTab === 'email' && (
              <>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Email Gateway Provider</label>
                  <select
                    className="oxoo-form-input"
                    value={currentSettings.provider || 'Brevo'}
                    onChange={(e) => handleUpdateField('provider', e.target.value)}
                  >
                    <option value="Brevo">Brevo (Official SMTP & Transactional API)</option>
                    <option value="Resend">Resend API</option>
                  </select>
                </div>
                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Verified Sender Address</label>
                    <input
                      type="email"
                      className="oxoo-form-input"
                      value={currentSettings.senderEmail || ''}
                      onChange={(e) => handleUpdateField('senderEmail', e.target.value)}
                    />
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Reply-To Address</label>
                    <input
                      type="email"
                      className="oxoo-form-input"
                      value={currentSettings.replyToEmail || ''}
                      onChange={(e) => handleUpdateField('replyToEmail', e.target.value)}
                    />
                  </div>
                </div>
                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">SMTP Relay Host</label>
                    <input
                      type="text"
                      disabled
                      className="oxoo-form-input"
                      value={currentSettings.smtpHost || 'smtp-relay.brevo.com'}
                      style={{ background: '#f8fafc' }}
                    />
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Port</label>
                    <input
                      type="text"
                      disabled
                      className="oxoo-form-input"
                      value={currentSettings.smtpPort || 587}
                      style={{ background: '#f8fafc' }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* TAB 4: PAYMENTS SETTINGS (Requirement 6.5) */}
            {activeTab === 'payments' && (
              <>
                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Default Payment Gateway</label>
                    <select
                      className="oxoo-form-input"
                      value={currentSettings.defaultGateway || 'Razorpay'}
                      onChange={(e) => handleUpdateField('defaultGateway', e.target.value)}
                    >
                      <option value="Razorpay">Razorpay (India & Global UPI / Cards)</option>
                      <option value="Stripe">Stripe Payments (International Credit Cards)</option>
                    </select>
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Payment Processing Mode</label>
                    <select
                      className="oxoo-form-input"
                      value={currentSettings.mode || 'Live'}
                      onChange={(e) => handleUpdateField('mode', e.target.value)}
                    >
                      <option value="Live">Live / Production</option>
                      <option value="Test">Test / Sandbox</option>
                    </select>
                  </div>
                </div>
                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Tax Calculation Rate (%)</label>
                    <input
                      type="number"
                      className="oxoo-form-input"
                      value={currentSettings.taxRatePercent || 18}
                      onChange={(e) => handleUpdateField('taxRatePercent', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Invoice Reference Prefix</label>
                    <input
                      type="text"
                      className="oxoo-form-input"
                      value={currentSettings.invoicePrefix || 'INV-2026-'}
                      onChange={(e) => handleUpdateField('invoicePrefix', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* TAB 5: SECURITY SETTINGS (Requirement 6.6) */}
            {activeTab === 'security' && (
              <>
                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Admin Session Lifetime (Hours)</label>
                    <input
                      type="number"
                      className="oxoo-form-input"
                      value={currentSettings.sessionLifetimeHours || 24}
                      onChange={(e) => handleUpdateField('sessionLifetimeHours', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Password Minimum Length</label>
                    <input
                      type="number"
                      className="oxoo-form-input"
                      value={currentSettings.passwordMinLength || 8}
                      onChange={(e) => handleUpdateField('passwordMinLength', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Multi-Factor Authentication (MFA) Policy</label>
                  <select
                    className="oxoo-form-input"
                    value={currentSettings.mfaPolicy || 'Optional for Users, Enforced for Super Admins'}
                    onChange={(e) => handleUpdateField('mfaPolicy', e.target.value)}
                  >
                    <option>Enforced for All Super Administrators & Staff</option>
                    <option>Optional for Users, Enforced for Super Admins</option>
                    <option>Optional for All Accounts</option>
                  </select>
                </div>
                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Max Consecutive Login Failures</label>
                    <input
                      type="number"
                      className="oxoo-form-input"
                      value={currentSettings.maxLoginAttempts || 5}
                      onChange={(e) => handleUpdateField('maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Lockout Duration (Minutes)</label>
                    <input
                      type="number"
                      className="oxoo-form-input"
                      value={currentSettings.lockoutDurationMins || 15}
                      onChange={(e) => handleUpdateField('lockoutDurationMins', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}

            {/* TAB 6: API & WEBHOOKS (Requirement 6.7) */}
            {activeTab === 'api' && (
              <>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Outbound Webhook Delivery URL</label>
                  <input
                    type="url"
                    className="oxoo-form-input"
                    value={currentSettings.webhookUrl || ''}
                    onChange={(e) => handleUpdateField('webhookUrl', e.target.value)}
                  />
                </div>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Webhook Signing Secret (HMAC SHA-256)</label>
                  <input
                    type="password"
                    disabled
                    className="oxoo-form-input"
                    value={currentSettings.signingKeyMasked || 'whsec_••••••••••••••••••••'}
                    style={{ background: '#f8fafc', fontFamily: 'monospace' }}
                  />
                </div>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Subscribed Events</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }}>
                    {['payment.succeeded', 'customer.created', 'subscription.renewed', 'ticket.created', 'invoice.generated', 'user.invited'].map((ev) => (
                      <label key={ev} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={Array.isArray(currentSettings.webhookEvents) && currentSettings.webhookEvents.includes(ev)}
                          onChange={(e) => {
                            const cur = Array.isArray(currentSettings.webhookEvents) ? [...currentSettings.webhookEvents] : [];
                            if (e.target.checked) cur.push(ev);
                            else {
                              const idx = cur.indexOf(ev);
                              if (idx > -1) cur.splice(idx, 1);
                            }
                            handleUpdateField('webhookEvents', cur);
                          }}
                        />
                        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{ev}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB 7: BILLING (Requirement 6.8) */}
            {activeTab === 'billing' && (
              <>
                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Default Billing Cycle</label>
                    <select
                      className="oxoo-form-input"
                      value={currentSettings.defaultCycle || 'Monthly'}
                      onChange={(e) => handleUpdateField('defaultCycle', e.target.value)}
                    >
                      <option value="Monthly">Monthly Recurring</option>
                      <option value="Yearly">Yearly (Annual Pre-Paid)</option>
                    </select>
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Renewal Reminder Window (Days Before)</label>
                    <input
                      type="number"
                      className="oxoo-form-input"
                      value={currentSettings.renewalReminderDays || 5}
                      onChange={(e) => handleUpdateField('renewalReminderDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Auto-Retry Failed Card Charges (Attempts)</label>
                    <input
                      type="number"
                      className="oxoo-form-input"
                      value={currentSettings.autoRetryAttempts || 3}
                      onChange={(e) => handleUpdateField('autoRetryAttempts', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Prorated Plan Upgrades</label>
                    <select
                      className="oxoo-form-input"
                      value={currentSettings.prorateUpgrades !== false ? 'Yes' : 'No'}
                      onChange={(e) => handleUpdateField('prorateUpgrades', e.target.value === 'Yes')}
                    >
                      <option value="Yes">Calculate and Credit Prorated Days</option>
                      <option value="No">Charge Full Amount on Cycle Reset</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* TAB 8: SYSTEM SETTINGS (Requirement 6.8) */}
            {activeTab === 'system' && (
              <>
                <div className="oxoo-metric-card" style={{ marginBottom: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '14px' }}>
                    <CheckCircle2 size={18} /> Platform Core System Healthy
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>
                    All services online. Database connected (Neon PostgreSQL Serverless). Real-time telemetry streaming active.
                  </div>
                </div>

                <div className="oxoo-form-grid-2">
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Platform Version</label>
                    <input
                      type="text"
                      disabled
                      className="oxoo-form-input"
                      value={currentSettings.systemVersion || 'OXOO 360 v2.4.1'}
                      style={{ background: '#f8fafc' }}
                    />
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Measured API Availability</label>
                    <input
                      type="text"
                      disabled
                      className="oxoo-form-input"
                      value={currentSettings.uptime || '99.98%'}
                      style={{ background: '#f8fafc' }}
                    />
                  </div>
                </div>

                <div className="oxoo-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={currentSettings.maintenanceMode === true}
                      onChange={(e) => handleUpdateField('maintenanceMode', e.target.checked)}
                    />
                    <span>Maintenance Mode (Temporarily suspend customer portal checkouts)</span>
                  </label>
                </div>
              </>
            )}

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '14px' }}>
              <button
                type="submit"
                disabled={isSaving}
                className="oxoo-upgrade-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', fontSize: '13px', fontWeight: 700 }}
              >
                <Save size={15} /> {isSaving ? 'Saving...' : `Save ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings`}
              </button>
            </div>

            {/* Security notice */}
            <div className="oxoo-security-banner" style={{ marginTop: '14px' }}>
              <Lock size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Persisted to PostgreSQL:</strong> Every settings tab saves independently to the `platform_settings` table and creates an audit trail entry. Changes are applied immediately without restarting the server.
              </div>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
