import React, { useState, useEffect } from 'react';
import {
  Mail, Search, Plus, Filter, RefreshCw, Send, Lock,
  CheckCircle2, AlertCircle, Eye, Trash2, Edit3, X,
  ExternalLink, Clock, PlayCircle, Shield, RotateCw
} from 'lucide-react';
import {
  getAdminEmailTemplates, createAdminEmailTemplate, updateAdminEmailTemplate,
  deleteAdminEmailTemplate, testAdminEmailTemplate, getAdminNotificationLogs,
  retryAdminNotification, getAdminNotificationSettings, updateAdminNotificationSettings
} from '../../api';

export default function EmailNotificationsModule({ showToast, logAuditEvent }) {
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'logs' | 'settings'

  // -------------------------------------------------------------
  // TAB 1: EMAIL TEMPLATES STATE
  // -------------------------------------------------------------
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');
  
  // Modals for Templates
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const [templateForm, setTemplateForm] = useState({
    template_name: '',
    template_key: '',
    category: 'Billing',
    subject: '',
    html_body: '',
    plain_text_body: '',
    supported_variables: 'customer_name, invoice_number, amount',
    is_active: true
  });

  const [testEmailRecipient, setTestEmailRecipient] = useState('manminder.singh@primepro.ai');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // -------------------------------------------------------------
  // TAB 2: NOTIFICATION LOGS STATE
  // -------------------------------------------------------------
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logStatus, setLogStatus] = useState('All');
  const [logPagination, setLogPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [selectedLog, setSelectedLog] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // -------------------------------------------------------------
  // TAB 3: NOTIFICATION SETTINGS STATE
  // -------------------------------------------------------------
  const [settings, setSettings] = useState({
    provider: 'Brevo',
    senderName: 'PrimePro Platform',
    senderEmail: 'manminder.singh@primepro.ai',
    replyToEmail: 'support@primepro.ai',
    smtpHost: 'smtp-relay.brevo.com',
    smtpPort: 587
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // -------------------------------------------------------------
  // DATA FETCHING
  // -------------------------------------------------------------
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await getAdminEmailTemplates({
        search: templateSearch,
        category: templateCategory
      });
      if (res && res.templates) {
        setTemplates(res.templates);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchLogs = async (page = 1) => {
    setLoadingLogs(true);
    try {
      const res = await getAdminNotificationLogs({
        search: logSearch,
        status: logStatus,
        page,
        limit: 10
      });
      if (res && res.logs) {
        setLogs(res.logs);
        if (res.pagination) setLogPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await getAdminNotificationSettings();
      if (res && res.settings) {
        setSettings(prev => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'templates') fetchTemplates();
    if (activeTab === 'logs') fetchLogs(1);
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab, templateSearch, templateCategory, logSearch, logStatus]);

  // -------------------------------------------------------------
  // TEMPLATE HANDLERS
  // -------------------------------------------------------------
  const handleOpenAdd = () => {
    setTemplateForm({
      template_name: '',
      template_key: '',
      category: 'Billing',
      subject: '',
      html_body: '<div style="font-family:sans-serif;padding:20px;"><h2>Hello {{customer_name}},</h2><p>Here are your update details.</p></div>',
      plain_text_body: 'Hello {{customer_name}},\n\nHere are your update details.',
      supported_variables: 'customer_name, plan_name, renewal_date',
      is_active: true
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (t) => {
    setSelectedTemplate(t);
    setTemplateForm({
      template_name: t.template_name || '',
      template_key: t.template_key || '',
      category: t.category || 'Billing',
      subject: t.subject || '',
      html_body: t.html_body || '',
      plain_text_body: t.plain_text_body || '',
      supported_variables: Array.isArray(t.supported_variables) ? t.supported_variables.join(', ') : (t.supported_variables || ''),
      is_active: t.is_active !== false
    });
    setShowEditModal(true);
  };

  const handleOpenPreview = (t) => {
    setSelectedTemplate(t);
    setShowPreviewModal(true);
  };

  const handleSaveAddTemplate = async (e) => {
    e.preventDefault();
    if (!templateForm.template_name || !templateForm.template_key || !templateForm.subject) {
      if (showToast) showToast('Name, key, and subject are required.');
      return;
    }
    try {
      const res = await createAdminEmailTemplate(templateForm);
      if (res && res.success) {
        if (showToast) showToast(`Template '${templateForm.template_name}' created.`);
        if (logAuditEvent) logAuditEvent('Email Template Created', templateForm.template_key);
        setShowAddModal(false);
        fetchTemplates();
      } else {
        if (showToast) showToast(res.message || 'Failed to create template.');
      }
    } catch (e) {
      if (showToast) showToast(e.message || 'Error creating template.');
    }
  };

  const handleSaveEditTemplate = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    try {
      const res = await updateAdminEmailTemplate(selectedTemplate.id, templateForm);
      if (res && res.success) {
        if (showToast) showToast(`Template '${templateForm.template_name}' updated.`);
        if (logAuditEvent) logAuditEvent('Email Template Updated', selectedTemplate.template_key);
        setShowEditModal(false);
        fetchTemplates();
      } else {
        if (showToast) showToast(res.message || 'Failed to update template.');
      }
    } catch (e) {
      if (showToast) showToast(e.message || 'Error updating template.');
    }
  };

  const handleDeleteTemplate = async (t) => {
    if (!window.confirm(`Are you sure you want to deactivate or remove template '${t.template_name}'?`)) return;
    try {
      const res = await deleteAdminEmailTemplate(t.id);
      if (res && res.success) {
        if (showToast) showToast(res.message || 'Template deactivated.');
        if (logAuditEvent) logAuditEvent('Email Template Deactivated', t.template_key);
        fetchTemplates();
      } else {
        if (showToast) showToast(res.message || 'Failed to delete template.');
      }
    } catch (e) {
      if (showToast) showToast(e.message || 'Error deleting template.');
    }
  };

  const handleSendTestEmail = async (templateKey) => {
    if (!testEmailRecipient.trim()) {
      if (showToast) showToast('Recipient email is required.');
      return;
    }
    setIsSendingTest(true);
    try {
      const res = await testAdminEmailTemplate({
        template_key: templateKey,
        recipient: testEmailRecipient.trim(),
        variables: {
          customer_name: 'Rahul Verma',
          company_name: 'Tech Solutions Pvt. Ltd.',
          invoice_number: 'INV-2026-1025',
          amount: '₹4,999',
          plan_name: 'Business Plan',
          otp: '894215',
          ticket_id: 'TK-2026-4581'
        }
      });
      if (res && res.success) {
        if (showToast) showToast(`Test email successfully dispatched to ${testEmailRecipient}`);
        if (logAuditEvent) logAuditEvent('Test Email Sent', `${templateKey} to ${testEmailRecipient}`);
      } else {
        if (showToast) showToast(res.message || 'Failed to dispatch test email.');
      }
    } catch (e) {
      if (showToast) showToast(e.message || 'Error sending test email.');
    } finally {
      setIsSendingTest(false);
    }
  };

  // -------------------------------------------------------------
  // NOTIFICATION RETRY HANDLER
  // -------------------------------------------------------------
  const handleRetryLog = async (logId) => {
    setIsRetrying(true);
    try {
      const res = await retryAdminNotification(logId);
      if (res && res.success) {
        if (showToast) showToast('Notification redelivered successfully.');
        if (logAuditEvent) logAuditEvent('Notification Redelivered', `Log #${logId}`);
        fetchLogs(logPagination.page);
        if (selectedLog && selectedLog.id === logId) {
          setSelectedLog(res.log);
        }
      } else {
        if (showToast) showToast(res.message || 'Failed to retry notification.');
      }
    } catch (e) {
      if (showToast) showToast(e.message || 'Error retrying notification.');
    } finally {
      setIsRetrying(false);
    }
  };

  // -------------------------------------------------------------
  // SETTINGS HANDLER
  // -------------------------------------------------------------
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await updateAdminNotificationSettings(settings);
      if (res && res.success) {
        if (showToast) showToast('Notification settings persisted to platform database.');
        if (logAuditEvent) logAuditEvent('Notification Settings Saved', settings.provider);
      } else {
        if (showToast) showToast(res.message || 'Failed to save settings.');
      }
    } catch (e) {
      if (showToast) showToast(e.message || 'Error saving settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="oxoo-section-card" style={{ padding: '24px' }}>
      
      {/* 1. Module Header */}
      <div className="oxoo-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={22} />
          </div>
          <div>
            <h2 className="oxoo-section-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              Email & Notifications Workspace
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
              Configure transactional email templates, audit delivery logs, and manage provider integrations.
            </p>
          </div>
        </div>

        {activeTab === 'templates' && (
          <button
            type="button"
            className="oxoo-upgrade-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 700 }}
            onClick={handleOpenAdd}
          >
            <Plus size={15} /> Add Template
          </button>
        )}
      </div>

      {/* 2. 3 Main Tabs (Requirement 3.1) */}
      <div className="oxoo-tab-pill-bar" style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          type="button"
          className={`oxoo-tab-pill ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Email Templates ({templates.length})
        </button>
        <button
          type="button"
          className={`oxoo-tab-pill ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Notification Logs ({logPagination.total})
        </button>
        <button
          type="button"
          className={`oxoo-tab-pill ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Delivery Settings
        </button>
      </div>

      {/* -------------------------------------------------------------
          TAB 1: EMAIL TEMPLATES
          ------------------------------------------------------------- */}
      {activeTab === 'templates' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search templates by name, key, subject..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="oxoo-form-input"
                style={{ paddingLeft: '36px', height: '36px', fontSize: '13px' }}
              />
            </div>

            <select
              value={templateCategory}
              onChange={(e) => setTemplateCategory(e.target.value)}
              className="oxoo-form-input"
              style={{ width: '180px', height: '36px', fontSize: '13px' }}
            >
              <option value="All">All Categories</option>
              <option value="Account">Account & Onboarding</option>
              <option value="Billing">Billing & Payments</option>
              <option value="Support">Support Tickets</option>
              <option value="Security">Security & Passwords</option>
            </select>

            <button
              type="button"
              className="oxoo-outline-btn"
              style={{ height: '36px', padding: '0 12px' }}
              onClick={fetchTemplates}
            >
              <RefreshCw size={14} className={loadingTemplates ? 'oxoo-spin' : ''} />
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table className="oxoo-table">
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Template Key</th>
                  <th>Category</th>
                  <th>Email Subject</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingTemplates ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      <RefreshCw size={18} className="oxoo-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                      Loading email templates...
                    </td>
                  </tr>
                ) : templates.length > 0 ? (
                  templates.map((tpl) => (
                    <tr key={tpl.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{tpl.template_name}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#0369a1' }}>
                          {tpl.template_key}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                          {tpl.category}
                        </span>
                      </td>
                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                        {tpl.subject}
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7' }}>
                          {tpl.delivery_channel || 'Email'}
                        </span>
                      </td>
                      <td>
                        <span className={`oxoo-status-tag ${tpl.is_active ? 'active' : 'suspended'}`}>
                          {tpl.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(tpl.updated_at || Date.now()).toLocaleDateString('en-GB')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="oxoo-outline-btn"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            title="Preview and Send Test"
                            onClick={() => handleOpenPreview(tpl)}
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            type="button"
                            className="oxoo-outline-btn"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            title="Edit Template"
                            onClick={() => handleOpenEdit(tpl)}
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            type="button"
                            className="oxoo-outline-btn"
                            style={{ padding: '4px 8px', fontSize: '11px', color: '#dc2626' }}
                            title="Deactivate / Delete"
                            onClick={() => handleDeleteTemplate(tpl)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No templates match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: NOTIFICATION LOGS (Requirement 3.7)
          ------------------------------------------------------------- */}
      {activeTab === 'logs' && (
        <div>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search logs by recipient, subject, event ID..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="oxoo-form-input"
                style={{ paddingLeft: '36px', height: '36px', fontSize: '13px' }}
              />
            </div>

            <select
              value={logStatus}
              onChange={(e) => setLogStatus(e.target.value)}
              className="oxoo-form-input"
              style={{ width: '160px', height: '36px', fontSize: '13px' }}
            >
              <option value="All">All Delivery States</option>
              <option value="Delivered">Delivered</option>
              <option value="Sent">Sent</option>
              <option value="Failed">Failed</option>
            </select>

            <button
              type="button"
              className="oxoo-outline-btn"
              style={{ height: '36px', padding: '0 12px' }}
              onClick={() => fetchLogs(1)}
            >
              <RefreshCw size={14} className={loadingLogs ? 'oxoo-spin' : ''} />
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table className="oxoo-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Recipient</th>
                  <th>Template Key</th>
                  <th>Subject</th>
                  <th>Channel</th>
                  <th>Delivery Status</th>
                  <th>Attempts</th>
                  <th>Provider</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingLogs ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      <RefreshCw size={18} className="oxoo-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                      Loading notification logs...
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7', fontSize: '11px' }}>
                        {log.event_id}
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{log.recipient}</td>
                      <td>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                          {log.template_key}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                        {log.subject}
                      </td>
                      <td>{log.channel}</td>
                      <td>
                        <span className={`oxoo-status-tag ${log.status === 'Delivered' ? 'active' : log.status === 'Failed' ? 'suspended' : 'warning'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{log.attempt_count}</td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>{log.provider}</span>
                      </td>
                      <td style={{ fontSize: '11px', color: '#64748b' }}>
                        {new Date(log.created_at).toLocaleString('en-GB')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="oxoo-outline-btn"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => setSelectedLog(log)}
                          >
                            Details
                          </button>
                          {log.status === 'Failed' && (
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px', color: '#0284c7', fontWeight: 600 }}
                              onClick={() => handleRetryLog(log.id)}
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No notification logs match your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: DELIVERY SETTINGS (Requirement 3.8)
          ------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '720px' }}>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="oxoo-form-group">
              <label className="oxoo-form-label">Primary Email Service Provider</label>
              <select
                className="oxoo-form-input"
                value={settings.provider}
                onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
              >
                <option value="Brevo">Brevo (Official SMTP & Transactional API)</option>
                <option value="Resend">Resend API (Fallback)</option>
              </select>
            </div>

            <div className="oxoo-form-grid-2">
              <div className="oxoo-form-group">
                <label className="oxoo-form-label">Sender Display Name</label>
                <input
                  type="text"
                  className="oxoo-form-input"
                  value={settings.senderName}
                  onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                />
              </div>
              <div className="oxoo-form-group">
                <label className="oxoo-form-label">Verified Sender Email</label>
                <input
                  type="email"
                  className="oxoo-form-input"
                  value={settings.senderEmail}
                  onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="oxoo-form-grid-2">
              <div className="oxoo-form-group">
                <label className="oxoo-form-label">Reply-To Address</label>
                <input
                  type="email"
                  className="oxoo-form-input"
                  value={settings.replyToEmail}
                  onChange={(e) => setSettings({ ...settings, replyToEmail: e.target.value })}
                />
              </div>
              <div className="oxoo-form-group">
                <label className="oxoo-form-label">SMTP Relay Host</label>
                <input
                  type="text"
                  className="oxoo-form-input"
                  value={settings.smtpHost}
                  disabled
                  style={{ background: '#f8fafc' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="oxoo-upgrade-btn"
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 700 }}
              >
                {isSavingSettings ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </div>

            <div className="oxoo-security-banner" style={{ marginTop: '12px' }}>
              <Lock size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Security:</strong> All provider passwords, SMTP keys, and API tokens are securely managed in backend environment variables (`BREVO_SMTP_KEY`, `RESEND_API_KEY`). Secrets are strictly masked and never returned to the browser.
              </div>
            </div>
          </form>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ADD TEMPLATE (Requirement 3.3)
          ------------------------------------------------------------- */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '680px', maxHeight: '90vh', background: '#fff', borderRadius: '16px', overflowY: 'auto', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Create New Email Template</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveAddTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="oxoo-form-grid-2">
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Template Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Account Suspension Notice"
                    className="oxoo-form-input"
                    value={templateForm.template_name}
                    onChange={(e) => setTemplateForm({ ...templateForm, template_name: e.target.value })}
                  />
                </div>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Template Key (unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. account_suspension"
                    className="oxoo-form-input"
                    value={templateForm.template_key}
                    onChange={(e) => setTemplateForm({ ...templateForm, template_key: e.target.value })}
                  />
                </div>
              </div>

              <div className="oxoo-form-grid-2">
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Category</label>
                  <select
                    className="oxoo-form-input"
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  >
                    <option value="Account">Account</option>
                    <option value="Billing">Billing</option>
                    <option value="Support">Support</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Email Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Subject line with {{variables}}"
                    className="oxoo-form-input"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  />
                </div>
              </div>

              <div className="oxoo-form-group">
                <label className="oxoo-form-label">Supported Variables (comma separated)</label>
                <input
                  type="text"
                  placeholder="customer_name, plan_name, invoice_number"
                  className="oxoo-form-input"
                  value={templateForm.supported_variables}
                  onChange={(e) => setTemplateForm({ ...templateForm, supported_variables: e.target.value })}
                />
              </div>

              <div className="oxoo-form-group">
                <label className="oxoo-form-label">HTML Email Body</label>
                <textarea
                  rows={6}
                  className="oxoo-form-input"
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                  value={templateForm.html_body}
                  onChange={(e) => setTemplateForm({ ...templateForm, html_body: e.target.value })}
                />
              </div>

              <div className="oxoo-form-group">
                <label className="oxoo-form-label">Plain Text Fallback Body</label>
                <textarea
                  rows={3}
                  className="oxoo-form-input"
                  value={templateForm.plain_text_body}
                  onChange={(e) => setTemplateForm({ ...templateForm, plain_text_body: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="oxoo-outline-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="oxoo-upgrade-btn">Create Template</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: EDIT TEMPLATE (Requirement 3.4)
          ------------------------------------------------------------- */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '720px', maxHeight: '90vh', background: '#fff', borderRadius: '16px', overflowY: 'auto', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Edit Template: {templateForm.template_name}</h3>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#0284c7' }}>{templateForm.template_key}</span>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveEditTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="oxoo-form-grid-2">
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Template Name</label>
                  <input
                    type="text"
                    required
                    className="oxoo-form-input"
                    value={templateForm.template_name}
                    onChange={(e) => setTemplateForm({ ...templateForm, template_name: e.target.value })}
                  />
                </div>
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Category</label>
                  <select
                    className="oxoo-form-input"
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  >
                    <option value="Account">Account</option>
                    <option value="Billing">Billing</option>
                    <option value="Support">Support</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
              </div>

              <div className="oxoo-form-group">
                <label className="oxoo-form-label">Email Subject</label>
                <input
                  type="text"
                  required
                  className="oxoo-form-input"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                />
              </div>

              <div className="oxoo-form-group">
                <label className="oxoo-form-label">HTML Email Body</label>
                <textarea
                  rows={8}
                  className="oxoo-form-input"
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                  value={templateForm.html_body}
                  onChange={(e) => setTemplateForm({ ...templateForm, html_body: e.target.value })}
                />
              </div>

              <div className="oxoo-form-group">
                <label className="oxoo-form-label">Plain Text Fallback</label>
                <textarea
                  rows={3}
                  className="oxoo-form-input"
                  value={templateForm.plain_text_body}
                  onChange={(e) => setTemplateForm({ ...templateForm, plain_text_body: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={templateForm.is_active}
                    onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
                  />
                  <span>Active Template</span>
                </label>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="oxoo-outline-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="oxoo-upgrade-btn">Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: PREVIEW & TEST EMAIL (Requirement 3.6)
          ------------------------------------------------------------- */}
      {showPreviewModal && selectedTemplate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '760px', maxHeight: '90vh', background: '#fff', borderRadius: '16px', overflowY: 'auto', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Preview & Dispatch Test Email</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Template: <strong>{selectedTemplate.template_name}</strong></span>
              </div>
              <button onClick={() => setShowPreviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Test Email Dispatch Input */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="email"
                placeholder="Enter recipient email address..."
                className="oxoo-form-input"
                style={{ flex: 1, fontSize: '13px' }}
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
              />
              <button
                type="button"
                disabled={isSendingTest}
                className="oxoo-upgrade-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}
                onClick={() => handleSendTestEmail(selectedTemplate.template_key)}
              >
                <Send size={14} /> {isSendingTest ? 'Sending...' : 'Send Real Test Email'}
              </button>
            </div>

            {/* HTML Preview Sandbox */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ background: '#f1f5f9', padding: '8px 14px', borderBottom: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                Subject: <strong>{selectedTemplate.subject}</strong>
              </div>
              <div
                style={{ padding: '20px', minHeight: '200px', background: '#fff' }}
                dangerouslySetInnerHTML={{ __html: selectedTemplate.html_body }}
              />
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: NOTIFICATION LOG DETAILS
          ------------------------------------------------------------- */}
      {selectedLog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '560px', background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Notification Delivery Detail</h3>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#0284c7' }}>{selectedLog.event_id}</span>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div><strong>Recipient:</strong> {selectedLog.recipient}</div>
              <div><strong>Template Key:</strong> {selectedLog.template_key}</div>
              <div><strong>Subject:</strong> {selectedLog.subject}</div>
              <div><strong>Status:</strong> <span className="oxoo-status-tag active">{selectedLog.status}</span></div>
              <div><strong>Provider:</strong> {selectedLog.provider}</div>
              <div><strong>Provider Message ID:</strong> <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{selectedLog.provider_message_id || 'N/A'}</span></div>
              <div><strong>Attempts Made:</strong> {selectedLog.attempt_count}</div>
              <div><strong>Timestamp:</strong> {new Date(selectedLog.created_at).toLocaleString('en-GB')}</div>
              {selectedLog.error_summary && (
                <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px', color: '#991b1b', fontSize: '12px' }}>
                  <strong>Error Summary:</strong> {selectedLog.error_summary}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="oxoo-outline-btn" onClick={() => setSelectedLog(null)}>Close</button>
              {selectedLog.status === 'Failed' && (
                <button
                  type="button"
                  disabled={isRetrying}
                  className="oxoo-upgrade-btn"
                  onClick={() => handleRetryLog(selectedLog.id)}
                >
                  {isRetrying ? 'Retrying...' : 'Retry Notification Delivery'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
