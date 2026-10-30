import React, { useState, useEffect } from 'react';
import {
  Zap, Search, RefreshCw, CheckCircle2, AlertCircle,
  Lock, Settings, ExternalLink, Activity, ArrowRight,
  Shield, Check, PlayCircle, X, Sliders
} from 'lucide-react';
import {
  getAdminIntegrations, updateAdminIntegration,
  testAdminIntegration, toggleAdminIntegration
} from '../../api';

export default function IntegrationsModule({ showToast, logAuditEvent }) {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Configure Modal
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [configForm, setConfigForm] = useState({
    environment: 'Live',
    webhook_url: '',
    api_key_masked: '',
    secret_key_masked: '',
    settings: {}
  });
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await getAdminIntegrations();
      if (res && res.integrations) {
        setIntegrations(res.integrations);
      }
    } catch (err) {
      console.error('Error fetching integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleOpenConfigure = (item) => {
    setSelectedIntegration(item);
    setConfigForm({
      environment: item.environment || 'Live',
      webhook_url: item.webhook_url || '',
      api_key_masked: item.api_key_masked || '••••••••••••••••',
      secret_key_masked: item.secret_key_masked || '••••••••••••••••',
      settings: item.settings || {}
    });
    setTestResult(null);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!selectedIntegration) return;

    setIsSaving(true);
    try {
      const res = await updateAdminIntegration(selectedIntegration.id, {
        environment: configForm.environment,
        webhook_url: configForm.webhook_url,
        settings: configForm.settings
      });

      if (res && res.success) {
        if (showToast) showToast(`${selectedIntegration.name} configuration updated.`);
        if (logAuditEvent) logAuditEvent('Integration Configured', selectedIntegration.name);
        setSelectedIntegration(null);
        fetchIntegrations();
      } else {
        if (showToast) showToast(res.message || 'Failed to update integration.');
      }
    } catch (e) {
      if (showToast) showToast(e.message || 'Error updating integration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (id, name) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await testAdminIntegration(id);
      if (res && res.success) {
        setTestResult({
          success: true,
          message: res.message || 'Connection test successful. Verified reachable.',
          latency: res.latency_ms || 42
        });
        if (showToast) showToast(`Tested ${name}: Reachable (${res.latency_ms || 42}ms).`);
        if (logAuditEvent) logAuditEvent('Integration Tested', name);
        fetchIntegrations();
      } else {
        setTestResult({
          success: false,
          message: res.message || 'Connection test failed.'
        });
        if (showToast) showToast(`Connection test failed for ${name}.`);
      }
    } catch (e) {
      setTestResult({
        success: false,
        message: e.message || 'Network timeout or unreachable service.'
      });
      if (showToast) showToast(`Error testing ${name}.`);
    } finally {
      setTestingId(null);
    }
  };

  const handleToggle = async (item) => {
    const nextState = !item.is_active;
    if (!nextState && item.category === 'Payments') {
      if (!window.confirm(`Warning: Disabling ${item.name} may disrupt active customer checkouts. Do you wish to continue?`)) {
        return;
      }
    }

    try {
      const res = await toggleAdminIntegration(item.id, nextState);
      if (res && res.success) {
        if (showToast) showToast(`${item.name} is now ${nextState ? 'Enabled' : 'Disabled'}.`);
        if (logAuditEvent) logAuditEvent('Integration Toggled', `${item.name} -> ${nextState ? 'Active' : 'Disabled'}`);
        fetchIntegrations();
      } else {
        if (showToast) showToast(res.message || 'Failed to toggle status.');
      }
    } catch (e) {
      if (showToast) showToast(e.message || 'Error updating status.');
    }
  };

  const categories = ['All', 'Payments', 'Email', 'Authentication & SSO', 'Databases & Storage', 'External Applications', 'Webhooks', 'Analytics'];

  const filteredIntegrations = categoryFilter === 'All'
    ? integrations
    : integrations.filter(i => i.category.toLowerCase().includes(categoryFilter.toLowerCase().slice(0, 4)));

  return (
    <div className="oxoo-section-card" style={{ padding: '24px' }}>
      
      {/* 1. Header */}
      <div className="oxoo-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} />
          </div>
          <div>
            <h2 className="oxoo-section-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              Platform Integrations & APIs
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
              Connect and verify payment gateways, transactional email, SSO identity, databases, webhooks, and analytics.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="oxoo-outline-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}
          onClick={fetchIntegrations}
        >
          <RefreshCw size={14} className={loading ? 'oxoo-spin' : ''} /> Refresh Status
        </button>
      </div>

      {/* 2. Category Filter Bar (Requirement 5.1) */}
      <div className="oxoo-tab-pill-bar" style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`oxoo-tab-pill ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Integrations Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <RefreshCw size={24} className="oxoo-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
          Polling integration health endpoints...
        </div>
      ) : (
        <div className="oxoo-integration-grid">
          {filteredIntegrations.map((item) => (
            <div key={item.id} className="oxoo-integration-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="oxoo-integration-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div
                    className="oxoo-integration-icon"
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: (item.color || '#0284c7') + '15',
                      color: item.color || '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '15px'
                    }}
                  >
                    {item.icon || item.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="oxoo-integration-category" style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: item.environment === 'Live' ? '#dcfce7' : '#fef3c7', color: item.environment === 'Live' ? '#166534' : '#92400e' }}>
                        {item.environment || 'Live'}
                      </span>
                    </div>
                    <h3 className="oxoo-integration-name" style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                      {item.name}
                    </h3>
                  </div>
                </div>

                <p className="oxoo-integration-desc" style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: '0 0 16px' }}>
                  {item.description}
                </p>

                {item.last_health_check && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>
                    Last health check: {new Date(item.last_health_check).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="oxoo-integration-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`oxoo-status-tag ${item.is_active && item.status === 'Connected' ? 'active' : 'suspended'}`}>
                    ● {item.is_active ? item.status : 'Disabled'}
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={item.is_active}
                      onChange={() => handleToggle(item)}
                      style={{ cursor: 'pointer' }}
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="oxoo-outline-btn"
                    style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 600 }}
                    disabled={testingId === item.id}
                    onClick={() => handleTestConnection(item.id, item.name)}
                  >
                    {testingId === item.id ? 'Pinging...' : 'Ping Test'}
                  </button>

                  <button
                    type="button"
                    className="oxoo-upgrade-btn"
                    style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700 }}
                    onClick={() => handleOpenConfigure(item)}
                  >
                    Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Security Notice (Requirement 5.3) */}
      <div className="oxoo-security-banner" style={{ marginTop: '24px' }}>
        <Lock size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Secret Protection:</strong> Webhook secrets, Razorpay Key Secrets, and Stripe Private API Keys are stored strictly on the server and verified via HMAC signatures. Client applications only receive masked identifiers.
        </div>
      </div>

      {/* 5. Modal: Configure Integration (Requirement 5.2) */}
      {selectedIntegration && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '580px', maxHeight: '90vh', background: '#fff', borderRadius: '16px', padding: '24px', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: (selectedIntegration.color || '#0284c7') + '20', color: selectedIntegration.color || '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {selectedIntegration.icon || selectedIntegration.name.slice(0, 2)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Configure {selectedIntegration.name}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Category: {selectedIntegration.category}</span>
                </div>
              </div>
              <button onClick={() => setSelectedIntegration(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="oxoo-form-group">
                <label className="oxoo-form-label">Deployment Environment</label>
                <select
                  className="oxoo-form-input"
                  value={configForm.environment}
                  onChange={(e) => setConfigForm({ ...configForm, environment: e.target.value })}
                >
                  <option value="Live">Live / Production</option>
                  <option value="Sandbox">Test / Sandbox</option>
                </select>
              </div>

              <div className="oxoo-form-group">
                <label className="oxoo-form-label">API Key / Client ID (Public / Reference)</label>
                <input
                  type="text"
                  className="oxoo-form-input"
                  value={configForm.api_key_masked}
                  disabled
                  style={{ background: '#f8fafc', fontFamily: 'monospace' }}
                />
              </div>

              <div className="oxoo-form-group">
                <label className="oxoo-form-label">API Secret / Signing Key (Masked)</label>
                <input
                  type="password"
                  className="oxoo-form-input"
                  value={configForm.secret_key_masked}
                  disabled
                  style={{ background: '#f8fafc' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                  Secret keys are securely read from system environment variables.
                </span>
              </div>

              <div className="oxoo-form-group">
                <label className="oxoo-form-label">Webhook Endpoint / Callback URL</label>
                <input
                  type="url"
                  placeholder="https://api.primepro.ai/api/webhooks/..."
                  className="oxoo-form-input"
                  value={configForm.webhook_url}
                  onChange={(e) => setConfigForm({ ...configForm, webhook_url: e.target.value })}
                />
              </div>

              {/* Test Result Box */}
              {testResult && (
                <div style={{ padding: '12px', borderRadius: '8px', background: testResult.success ? '#f0fdf4' : '#fee2e2', border: `1px solid ${testResult.success ? '#bbf7d0' : '#fecaca'}`, fontSize: '13px', color: testResult.success ? '#166534' : '#991b1b' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {testResult.message}
                  </div>
                  {testResult.latency && (
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>Latency: {testResult.latency}ms</div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  className="oxoo-outline-btn"
                  onClick={() => handleTestConnection(selectedIntegration.id, selectedIntegration.name)}
                  disabled={testingId === selectedIntegration.id}
                >
                  {testingId === selectedIntegration.id ? 'Testing...' : 'Test Connection'}
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="oxoo-outline-btn" onClick={() => setSelectedIntegration(null)}>Cancel</button>
                  <button type="submit" className="oxoo-upgrade-btn" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
