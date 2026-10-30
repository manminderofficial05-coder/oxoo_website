import React, { useState, useEffect } from 'react';
import {
  Layers, Plus, Search, CheckCircle2, AlertTriangle, ExternalLink,
  Sliders, Server, Globe, Key, Copy, Check, Eye, Trash2, RefreshCw, X, Shield, Lock, Activity
} from 'lucide-react';
import {
  getApplicationsSummary, getAdminApplications, getAdminApplication,
  createAdminApplication, updateAdminApplication, updateAdminApplicationStatus,
  rotateApplicationServiceKey, checkApplicationHealth, deleteAdminApplication
} from '../../api';

export default function ApplicationsModule({ showToast, logAuditEvent }) {
  const [summary, setSummary] = useState({ total: 9, active: 8, maintenance: 1, health: '100%', healthLabel: 'All services operational' });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('latest');

  // Modals & Drawers
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showConfigureDrawer, setShowConfigureDrawer] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [deleteConfirmApp, setDeleteConfirmApp] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [configureTab, setConfigureTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // Add App Form
  const [newAppForm, setNewAppForm] = useState({
    name: '',
    app_id: '',
    category: 'Business Management',
    short_description: '',
    detailed_description: '',
    main_url: 'https://',
    employee_url: '/employee',
    admin_url: '/admin',
    customer_dashboard_url: '/customer',
    logout_url: '/logout',
    health_url: '/health',
    app_type: 'Cloud Web App',
    access_mode: 'SSO Protected',
    auth_method: 'PrimePro OAuth2 / JWT',
    subscription_required: 'Business Plan',
    status: 'Active',
    access_protection: true,
    warning_page_url: 'https://primepro.ai/access-denied'
  });

  // Fetch summary and apps
  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, appsRes] = await Promise.all([
        getApplicationsSummary(),
        getAdminApplications({ search, category: categoryFilter, status: statusFilter, sort: sortBy })
      ]);
      if (sumRes && sumRes.summary) setSummary(sumRes.summary);
      if (appsRes && appsRes.applications) setApplications(appsRes.applications);
    } catch (err) {
      console.error('Error fetching applications data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, categoryFilter, statusFilter, sortBy]);

  const handleCopyKey = (keyText, id) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(id);
    showToast('Service key copied to clipboard.');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenConfigure = async (app) => {
    try {
      const res = await getAdminApplication(app.app_id || app.id);
      setSelectedApp(res.application || app);
      setConfigureTab('general');
      setShowConfigureDrawer(true);
    } catch {
      setSelectedApp(app);
      setConfigureTab('general');
      setShowConfigureDrawer(true);
    }
  };

  const handleSaveConfigure = async () => {
    if (!selectedApp) return;
    setIsSaving(true);
    try {
      const res = await updateAdminApplication(selectedApp.app_id || selectedApp.id, selectedApp);
      if (res && res.success) {
        showToast('Application configuration saved successfully.');
        if (logAuditEvent) logAuditEvent('Application Configured', selectedApp.name);
        setShowConfigureDrawer(false);
        fetchData();
      } else {
        showToast(res.message || 'Failed to save configuration.');
      }
    } catch (e) {
      showToast(e.message || 'Error saving application configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRotateKey = async () => {
    if (!selectedApp) return;
    try {
      const res = await rotateApplicationServiceKey(selectedApp.app_id || selectedApp.id);
      if (res && res.success) {
        showToast('Service key successfully rotated.');
        setSelectedApp(prev => ({
          ...prev,
          service_key: res.service_key,
          service_key_masked: res.service_key_masked
        }));
        if (logAuditEvent) logAuditEvent('Service Key Rotated', selectedApp.name);
        fetchData();
      }
    } catch (e) {
      showToast(e.message || 'Failed to rotate key.');
    }
  };

  const handleRunHealthCheck = async () => {
    if (!selectedApp) return;
    try {
      const res = await checkApplicationHealth(selectedApp.app_id || selectedApp.id);
      if (res && res.success) {
        showToast(`Health check passed: ${res.response_time_ms}ms (Operational).`);
        setSelectedApp(prev => ({
          ...prev,
          health_status: 'Operational',
          health_response_ms: res.response_time_ms,
          last_health_check: res.last_check
        }));
      }
    } catch (e) {
      showToast('Health check failed.');
    }
  };

  const handleCreateApp = async (e) => {
    e.preventDefault();
    if (!newAppForm.name || !newAppForm.main_url) {
      showToast('Application Name and Main URL are required.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await createAdminApplication(newAppForm);
      if (res && res.success) {
        showToast(`Application "${newAppForm.name}" created successfully.`);
        if (logAuditEvent) logAuditEvent('Application Added', newAppForm.name);
        setShowAddDrawer(false);
        fetchData();
      } else {
        showToast(res.message || 'Failed to create application.');
      }
    } catch (e) {
      showToast(e.message || 'Error creating application.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (app) => {
    const nextStatus = app.status === 'Active' ? 'Maintenance' : 'Active';
    try {
      const res = await updateAdminApplicationStatus(app.app_id || app.id, nextStatus);
      if (res && res.success) {
        showToast(`Status changed to ${nextStatus}.`);
        if (logAuditEvent) logAuditEvent('Application Status Changed', `${app.name} -> ${nextStatus}`);
        fetchData();
      }
    } catch (e) {
      showToast('Error changing status.');
    }
  };

  const handleDeleteApp = async () => {
    if (!deleteConfirmApp) return;
    setIsDeleting(true);
    try {
      const res = await deleteAdminApplication(deleteConfirmApp.app_id || deleteConfirmApp.id);
      if (res && res.success) {
        showToast(res.message || `Application "${deleteConfirmApp.name}" was permanently deleted.`);
        if (logAuditEvent) logAuditEvent('Application Deleted', deleteConfirmApp.name);
        setDeleteConfirmApp(null);
        fetchData();
      } else {
        showToast(res.message || 'Failed to delete application.');
      }
    } catch (e) {
      showToast(e.message || 'Error deleting application.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="oxoo-section-card" style={{ padding: '24px' }}>
      {/* 1. Header */}
      <div className="oxoo-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} />
            </div>
            <div>
              <h2 className="oxoo-section-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Applications</h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                Manage all applications in your PrimePro platform. Configure URLs, access, service keys and settings.
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="oxoo-upgrade-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '13px', fontWeight: 700 }}
          onClick={() => setShowAddDrawer(true)}
        >
          <Plus size={16} /> + Add Application
        </button>
      </div>

      {/* 2. 4 Summary Cards matching mockup */}
      <div className="oxoo-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="oxoo-metric-label" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Applications</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '9999px' }}>+12%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
            <span className="oxoo-metric-value" style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{summary.total}</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: '#e0f2fe', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: '#0284c7' }} />
          </div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="oxoo-metric-label" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Active</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '9999px' }}>+14%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
            <span className="oxoo-metric-value" style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a' }}>{summary.active}</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: '#dcfce7', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${(summary.active / summary.total) * 100}%`, height: '100%', background: '#16a34a' }} />
          </div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="oxoo-metric-label" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Under Maintenance</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', background: '#ffedd5', padding: '2px 8px', borderRadius: '9999px' }}>0%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
            <span className="oxoo-metric-value" style={{ fontSize: '28px', fontWeight: 800, color: '#ea580c' }}>{summary.maintenance}</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: '#ffedd5', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${(summary.maintenance / summary.total) * 100}%`, height: '100%', background: '#ea580c' }} />
          </div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="oxoo-metric-label" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Global Health</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: '9999px' }}>{summary.health}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
            <span className="oxoo-metric-value" style={{ fontSize: '28px', fontWeight: 800, color: '#0284c7' }}>{summary.health}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> {summary.healthLabel}
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Toolbar */}
      <div className="oxoo-filter-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#334155' }}
        >
          <option>All Categories</option>
          <option>HR</option>
          <option>Finance</option>
          <option>Sales</option>
          <option>Inventory</option>
          <option>Marketing</option>
          <option>Web</option>
          <option>Productivity</option>
          <option>AI</option>
          <option>Business Management</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#334155' }}
        >
          <option>All Statuses</option>
          <option>Active</option>
          <option>Maintenance</option>
          <option>Disabled</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#334155' }}
        >
          <option value="latest">Sort by: Latest</option>
          <option value="name">Sort by: Name</option>
        </select>

        {(search || categoryFilter !== 'All Categories' || statusFilter !== 'All Statuses') && (
          <button
            type="button"
            onClick={() => { setSearch(''); setCategoryFilter('All Categories'); setStatusFilter('All Statuses'); }}
            style={{ border: 'none', background: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '6px 8px' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 4. Applications Table matching mockup */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff' }}>
        <table className="oxoo-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ width: '40px', padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>#</th>
              <th style={{ width: '40px', padding: '12px 8px', fontSize: '12px', color: '#64748b' }}>Icon</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Application Name</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Main URL</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Employee URL</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Admin URL</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Service Key</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app, idx) => (
                <tr key={app.id || app.app_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ padding: '14px 8px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${app.icon_bg || '#0284c7'}15`, color: app.icon_bg || '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Layers size={18} />
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{app.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{app.app_id}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569' }}>{app.category}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#0284c7', fontFamily: 'monospace' }}>
                    <a href={app.main_url} target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>
                      {app.main_url}
                    </a>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{app.employee_url || '/employee'}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{app.admin_url || '/admin'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="oxoo-service-key-pill">
                      <span>{app.service_key_masked || 'sk_live_••••••••'}</span>
                      <button
                        type="button"
                        title="Copy Key"
                        onClick={() => handleCopyKey(app.service_key_raw || app.service_key, app.id)}
                      >
                        {copiedKey === app.id ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      onClick={() => handleToggleStatus(app)}
                      className={`oxoo-status-tag ${app.status === 'Active' ? 'active' : 'maintenance'}`}
                      style={{ cursor: 'pointer' }}
                      title="Click to toggle status"
                    >
                      ● {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => window.open(app.main_url, '_blank')}
                      >
                        <ExternalLink size={12} /> Open
                      </button>
                      <button
                        type="button"
                        className="oxoo-upgrade-btn"
                        style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleOpenConfigure(app)}
                      >
                        <Sliders size={12} /> Configure
                      </button>
                      <button
                        type="button"
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => setDeleteConfirmApp(app)}
                        title="Delete application"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. ADD APPLICATION DRAWER / MODAL */}
      {showAddDrawer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '640px', height: '100%', background: '#fff', boxShadow: '-10px 0 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>+ Add Application</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Provision a new SaaS application in the PrimePro ecosystem.</p>
              </div>
              <button onClick={() => setShowAddDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <form onSubmit={handleCreateApp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Application Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Employee Pro HRMS"
                      value={newAppForm.name}
                      onChange={(e) => setNewAppForm({ ...newAppForm, name: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Application Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. APP-HRMS"
                      value={newAppForm.app_id}
                      onChange={(e) => setNewAppForm({ ...newAppForm, app_id: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Category</label>
                    <select
                      value={newAppForm.category}
                      onChange={(e) => setNewAppForm({ ...newAppForm, category: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    >
                      <option>HR</option>
                      <option>Finance</option>
                      <option>Sales</option>
                      <option>Inventory</option>
                      <option>Marketing</option>
                      <option>Web</option>
                      <option>Productivity</option>
                      <option>AI</option>
                      <option>Business Management</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Application Type</label>
                    <select
                      value={newAppForm.app_type}
                      onChange={(e) => setNewAppForm({ ...newAppForm, app_type: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    >
                      <option>Cloud Web App</option>
                      <option>Microservice</option>
                      <option>Single Page App (SPA)</option>
                      <option>External Service</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Main Application URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://hrms.primepro.ai"
                    value={newAppForm.main_url}
                    onChange={(e) => setNewAppForm({ ...newAppForm, main_url: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Employee Login URL</label>
                    <input
                      type="text"
                      placeholder="/employee"
                      value={newAppForm.employee_url}
                      onChange={(e) => setNewAppForm({ ...newAppForm, employee_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Administrator Login URL</label>
                    <input
                      type="text"
                      placeholder="/admin"
                      value={newAppForm.admin_url}
                      onChange={(e) => setNewAppForm({ ...newAppForm, admin_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Customer Dashboard URL</label>
                    <input
                      type="text"
                      placeholder="/customer"
                      value={newAppForm.customer_dashboard_url}
                      onChange={(e) => setNewAppForm({ ...newAppForm, customer_dashboard_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Health Check URL</label>
                    <input
                      type="text"
                      placeholder="/health"
                      value={newAppForm.health_url}
                      onChange={(e) => setNewAppForm({ ...newAppForm, health_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Short Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of the software"
                    value={newAppForm.short_description}
                    onChange={(e) => setNewAppForm({ ...newAppForm, short_description: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>

                <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Access Protection</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Unauthorized visitors are routed to the PrimePro Access Denied page</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={newAppForm.access_protection}
                    onChange={(e) => setNewAppForm({ ...newAppForm, access_protection: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="oxoo-outline-btn"
                    onClick={() => setShowAddDrawer(false)}
                    style={{ padding: '8px 16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="oxoo-upgrade-btn"
                    style={{ padding: '8px 20px' }}
                  >
                    {isSaving ? 'Saving...' : 'Create Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 6. CONFIGURE APPLICATION DRAWER (8 TABS) */}
      {showConfigureDrawer && selectedApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '740px', height: '100%', background: '#fff', boxShadow: '-10px 0 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Apps / Configure Application
                </div>
                <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedApp.name} <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>({selectedApp.app_id})</span>
                </h3>
              </div>
              <button onClick={() => setShowConfigureDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            {/* 8 Tabs Header */}
            <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 16px' }}>
              {[
                { id: 'general', label: 'Basic Information' },
                { id: 'urls', label: 'Application URLs' },
                { id: 'auth', label: 'Access & Permissions' },
                { id: 'access', label: 'Service & API Keys' },
                { id: 'subscription', label: 'Subscription Settings' },
                { id: 'health', label: 'Health Monitoring' },
                { id: 'security', label: 'Security & Domains' },
                { id: 'history', label: 'Change History' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setConfigureTab(tab.id)}
                  style={{
                    padding: '12px 14px',
                    fontSize: '12px',
                    fontWeight: configureTab === tab.id ? 700 : 500,
                    color: configureTab === tab.id ? '#0284c7' : '#64748b',
                    borderBottom: configureTab === tab.id ? '2px solid #0284c7' : '2px solid transparent',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {configureTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: `${selectedApp.icon_bg || '#0284c7'}20`, color: selectedApp.icon_bg || '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Layers size={28} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Application Icon</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>PNG, JPG or SVG (Max 2MB)</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Application Name *</label>
                      <input
                        type="text"
                        value={selectedApp.name || ''}
                        onChange={(e) => setSelectedApp({ ...selectedApp, name: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Application ID</label>
                      <input
                        type="text"
                        disabled
                        value={selectedApp.app_id || ''}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px', background: '#f1f5f9' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Category</label>
                    <select
                      value={selectedApp.category || 'HR'}
                      onChange={(e) => setSelectedApp({ ...selectedApp, category: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    >
                      <option>HR</option>
                      <option>Finance</option>
                      <option>Sales</option>
                      <option>Inventory</option>
                      <option>Marketing</option>
                      <option>Web</option>
                      <option>Productivity</option>
                      <option>AI</option>
                      <option>Business Management</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Short Description</label>
                    <input
                      type="text"
                      value={selectedApp.short_description || ''}
                      onChange={(e) => setSelectedApp({ ...selectedApp, short_description: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Detailed Description</label>
                    <textarea
                      rows={3}
                      value={selectedApp.detailed_description || ''}
                      onChange={(e) => setSelectedApp({ ...selectedApp, detailed_description: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>
                </div>
              )}

              {configureTab === 'urls' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Main Application URL *</label>
                    <input
                      type="url"
                      value={selectedApp.main_url || ''}
                      onChange={(e) => setSelectedApp({ ...selectedApp, main_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Employee Login URL</label>
                    <input
                      type="text"
                      value={selectedApp.employee_url || ''}
                      onChange={(e) => setSelectedApp({ ...selectedApp, employee_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Administrator Login URL</label>
                    <input
                      type="text"
                      value={selectedApp.admin_url || ''}
                      onChange={(e) => setSelectedApp({ ...selectedApp, admin_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Customer Dashboard URL</label>
                    <input
                      type="text"
                      value={selectedApp.customer_dashboard_url || ''}
                      onChange={(e) => setSelectedApp({ ...selectedApp, customer_dashboard_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Logout URL</label>
                    <input
                      type="text"
                      value={selectedApp.logout_url || ''}
                      onChange={(e) => setSelectedApp({ ...selectedApp, logout_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>
                </div>
              )}

              {configureTab === 'auth' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Single Sign-On (SSO) & OAuth2</div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 12px' }}>
                      Controls authentication mechanism for enterprise users.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Access Mode</label>
                        <select
                          value={selectedApp.access_mode || 'SSO Protected'}
                          onChange={(e) => setSelectedApp({ ...selectedApp, access_mode: e.target.value })}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        >
                          <option>SSO Protected</option>
                          <option>Public / Open Access</option>
                          <option>IP Whitelisted Only</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Auth Method</label>
                        <select
                          value={selectedApp.auth_method || 'PrimePro OAuth2 / JWT'}
                          onChange={(e) => setSelectedApp({ ...selectedApp, auth_method: e.target.value })}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        >
                          <option>PrimePro OAuth2 / JWT</option>
                          <option>SAML 2.0</option>
                          <option>OpenID Connect (OIDC)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {configureTab === 'access' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Service Access & Protection</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Require verified launch tokens from backend to access</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedApp.access_protection !== false}
                        onChange={(e) => setSelectedApp({ ...selectedApp, access_protection: e.target.checked })}
                        style={{ width: '18px', height: '18px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Service Key (Cryptographic Secret)</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="password"
                        readOnly
                        value={selectedApp.service_key || 'sk_live_9f8d7e6c5b4a3e2d'}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#f1f5f9', fontFamily: 'monospace' }}
                      />
                      <button
                        type="button"
                        onClick={handleRotateKey}
                        className="oxoo-outline-btn"
                        style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <RefreshCw size={12} /> Rotate Key
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Rotating this key invalidates all existing service tokens immediately.</span>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Warning Page Redirect (Access Denied)</label>
                    <input
                      type="url"
                      value={selectedApp.warning_page_url || 'https://primepro.ai/access-denied'}
                      onChange={(e) => setSelectedApp({ ...selectedApp, warning_page_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>
                </div>
              )}

              {configureTab === 'subscription' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Required Subscription Plan</label>
                    <select
                      value={selectedApp.subscription_required || 'Business Plan'}
                      onChange={(e) => setSelectedApp({ ...selectedApp, subscription_required: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    >
                      <option>Starter Plan</option>
                      <option>Standard Plan</option>
                      <option>Business Plan</option>
                      <option>Enterprise Plan</option>
                      <option>HRMS Plan</option>
                      <option>Finance Plan</option>
                    </select>
                  </div>
                  <div style={{ padding: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Active Entitlement Policy</div>
                    <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                      Customers on this plan or higher receive automatic single-sign-on provisioning.
                    </div>
                  </div>
                </div>
              )}

              {configureTab === 'health' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Application Health Status</div>
                      <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <CheckCircle2 size={14} /> {selectedApp.health_status || 'Operational'} ({selectedApp.health_response_ms || 28}ms)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRunHealthCheck}
                      className="oxoo-outline-btn"
                      style={{ padding: '8px 14px', fontSize: '12px' }}
                    >
                      Run Health Check
                    </button>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Health Check Ping URL</label>
                    <input
                      type="text"
                      value={selectedApp.health_url || '/health'}
                      onChange={(e) => setSelectedApp({ ...selectedApp, health_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>
                </div>
              )}

              {configureTab === 'security' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Approved Domains & CORS Origins</label>
                    <textarea
                      rows={3}
                      value={typeof selectedApp.allowed_domains === 'string' ? selectedApp.allowed_domains : JSON.stringify(selectedApp.allowed_domains || ["*.primepro.ai", "localhost"])}
                      onChange={(e) => setSelectedApp({ ...selectedApp, allowed_domains: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px', fontFamily: 'monospace' }}
                    />
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>JSON list of approved hosts for CORS and SSO callback verification.</span>
                  </div>
                </div>
              )}

              {configureTab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <strong>Service Key Rotated</strong>
                      <span style={{ color: '#94a3b8' }}>26 Oct 2026, 11:30 AM</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>By: Super Administrator (Manminder Singh)</div>
                  </div>
                  <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <strong>URLs Updated</strong>
                      <span style={{ color: '#94a3b8' }}>15 Oct 2026, 04:15 PM</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>By: Super Administrator</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedApp)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {selectedApp.status === 'Active' ? 'Deactivate App' : 'Activate App'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigureDrawer(false);
                    setDeleteConfirmApp(selectedApp);
                  }}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={13} /> Delete App
                </button>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="oxoo-outline-btn"
                  onClick={() => setShowConfigureDrawer(false)}
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  className="oxoo-upgrade-btn"
                  onClick={handleSaveConfigure}
                  style={{ padding: '8px 20px' }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DELETE APPLICATION MODAL */}
      {deleteConfirmApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '480px', maxWidth: '100%', background: '#fff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: '#fef2f2', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#991b1b' }}>Delete Application</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#b91c1c' }}>Permanent removal from ecosystem</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirmApp(null)}
                disabled={isDeleting}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <strong>{deleteConfirmApp.name}</strong> ({deleteConfirmApp.app_id})?
              </p>

              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
                • Removes application from platform configuration<br />
                • Associated service API keys will immediately become invalid<br />
                • Deletes from PostgreSQL <code>platform_applications</code>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="oxoo-outline-btn"
                onClick={() => setDeleteConfirmApp(null)}
                disabled={isDeleting}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteApp}
                disabled={isDeleting}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} />
                {isDeleting ? 'Deleting...' : 'Confirm & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
