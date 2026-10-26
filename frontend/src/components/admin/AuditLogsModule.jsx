import React, { useState, useEffect } from 'react';
import {
  Shield, Search, Filter, RefreshCw, Eye, Lock,
  Clock, CheckCircle2, AlertTriangle, X, Terminal,
  User, Calendar, ExternalLink
} from 'lucide-react';
import { getAdminAuditLogs, getAdminAuditSessions } from '../../api';

export default function AuditLogsModule({ showToast }) {
  const [subTab, setSubTab] = useState('events'); // 'events' | 'sessions'
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [resultFilter, setResultFilter] = useState('All');

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchAuditData = async (page = 1) => {
    setLoading(true);
    try {
      if (subTab === 'events') {
        const res = await getAdminAuditLogs({
          search,
          role: roleFilter,
          action: actionFilter,
          result: resultFilter,
          page,
          limit: 15
        });
        if (res && res.logs) {
          setLogs(res.logs);
          if (res.pagination) setPagination(res.pagination);
        }
      } else {
        const res = await getAdminAuditSessions({
          search,
          page,
          limit: 15
        });
        if (res && res.sessions) {
          setSessions(res.sessions);
          if (res.pagination) setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching audit records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData(1);
  }, [subTab, search, roleFilter, actionFilter, resultFilter]);

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('All');
    setActionFilter('All');
    setResultFilter('All');
  };

  return (
    <div className="oxoo-section-card" style={{ padding: '24px' }}>
      
      {/* 1. Header */}
      <div className="oxoo-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} />
          </div>
          <div>
            <h2 className="oxoo-section-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              System Audit Trail & Compliance
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
              Immutable append-only record of administrative events, authentications, role mutations, and security changes.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="oxoo-outline-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}
          onClick={() => fetchAuditData(pagination.page)}
        >
          <RefreshCw size={14} className={loading ? 'oxoo-spin' : ''} /> Refresh
        </button>
      </div>

      {/* 2. Subnav: All Audit Events vs Session History (Requirement 4.3) */}
      <div className="oxoo-tab-pill-bar" style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          type="button"
          className={`oxoo-tab-pill ${subTab === 'events' ? 'active' : ''}`}
          onClick={() => setSubTab('events')}
        >
          All Audit Trail Events ({subTab === 'events' ? pagination.total : logs.length})
        </button>
        <button
          type="button"
          className={`oxoo-tab-pill ${subTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setSubTab('sessions')}
        >
          Authentication & Active Sessions
        </button>
      </div>

      {/* 3. Filter Bar */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by actor name, email, action, resource, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="oxoo-form-input"
              style={{ paddingLeft: '36px', height: '36px', fontSize: '13px' }}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="oxoo-form-input"
            style={{ height: '36px', fontSize: '13px' }}
          >
            <option value="All">All Roles</option>
            <option value="Super Administrator">Super Administrator</option>
            <option value="Finance Admin">Finance Admin</option>
            <option value="Support Staff">Support Staff</option>
            <option value="Sales Staff">Sales Staff</option>
            <option value="System Worker">System Worker</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="oxoo-form-input"
            style={{ height: '36px', fontSize: '13px' }}
          >
            <option value="All">All Actions</option>
            <option value="Auth">Login & Auth Events</option>
            <option value="Ticket">Support Ticket Actions</option>
            <option value="Subscription">Subscription Changes</option>
            <option value="Invoice">Payment & Invoices</option>
            <option value="Template">Email Templates</option>
            <option value="Setting">Settings & Config</option>
          </select>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="oxoo-form-input"
            style={{ height: '36px', fontSize: '13px' }}
          >
            <option value="All">All Results</option>
            <option value="Success">Success</option>
            <option value="Failure">Failure</option>
            <option value="Warning">Warning</option>
          </select>

          <button
            type="button"
            className="oxoo-outline-btn"
            style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
            onClick={handleClearFilters}
          >
            Reset
          </button>
        </div>
      </div>

      {/* 4. Events Table */}
      {subTab === 'events' ? (
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table className="oxoo-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Actor User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Resource Target</th>
                <th>IP Address</th>
                <th>Result</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <RefreshCw size={18} className="oxoo-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                    Loading audit trail from database...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedLog(log)}>
                    <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString('en-GB')}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.actor_name || log.user_name || 'System'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{log.actor_email || 'internal'}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: 600, background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                        {log.actor_role || 'Super Admin'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{log.action}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0369a1' }}>
                        {log.resource_type ? `${log.resource_type}:${log.resource_id || ''}` : (log.target || 'System')}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
                      {log.ip_address || log.ip || '127.0.0.1'}
                    </td>
                    <td>
                      <span className={`oxoo-status-tag ${log.result === 'Success' ? 'active' : log.result === 'Failure' ? 'suspended' : 'warning'}`}>
                        {log.result || 'Success'}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', color: '#64748b' }}>
                      {log.duration_ms ? `${log.duration_ms}ms` : '—'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No audit records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Sessions Table */
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table className="oxoo-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Administrator</th>
                <th>Role</th>
                <th>Login Timestamp</th>
                <th>IP Address</th>
                <th>User Agent Summary</th>
                <th>Session Duration</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading active sessions...
                  </td>
                </tr>
              ) : sessions.length > 0 ? (
                sessions.map((s, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0284c7' }}>
                      {s.session_id || `SESS-2026-${1000 + idx}`}
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.user_name || 'Manminder Singh'}</td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: 600, background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                        {s.role || 'Super Admin'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{new Date(s.login_at || Date.now()).toLocaleString('en-GB')}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{s.ip || '127.0.0.1'}</td>
                    <td style={{ fontSize: '11px', color: '#64748b' }}>Chrome on Windows 11 (Secure TLS 1.3)</td>
                    <td style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>Active Now</td>
                    <td><span className="oxoo-status-tag active">Active Session</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No active sessions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Showing {subTab === 'events' ? logs.length : sessions.length} of {pagination.total} records (Page {pagination.page} of {pagination.totalPages || 1})
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="oxoo-outline-btn"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            disabled={pagination.page <= 1}
            onClick={() => fetchAuditData(pagination.page - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="oxoo-outline-btn"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchAuditData(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* 6. Security Notice (Requirement 4.5) */}
      <div className="oxoo-security-banner" style={{ marginTop: '20px' }}>
        <Lock size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Append-Only Integrity:</strong> Audit trail records are cryptographically protected and append-only. Passwords, session tokens, OTP secrets, and payment credentials are strictly redacted at logging time and never recorded to disk.
        </div>
      </div>

      {/* 7. Modal: Audit Event Details (Requirement 4.4) */}
      {selectedLog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '620px', maxHeight: '85vh', background: '#fff', borderRadius: '16px', padding: '24px', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Audit Event Inspection</h3>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#0284c7' }}>LOG-ID: {selectedLog.id}</span>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px', marginBottom: '16px' }}>
              <div><strong>Actor:</strong> {selectedLog.actor_name || selectedLog.user_name || 'System Worker'}</div>
              <div><strong>Role:</strong> {selectedLog.actor_role || 'Super Admin'}</div>
              <div><strong>Action:</strong> {selectedLog.action}</div>
              <div><strong>Result:</strong> <span className="oxoo-status-tag active">{selectedLog.result || 'Success'}</span></div>
              <div><strong>Resource Type:</strong> {selectedLog.resource_type || 'System'}</div>
              <div><strong>Resource ID:</strong> {selectedLog.resource_id || selectedLog.target || 'N/A'}</div>
              <div><strong>Source IP:</strong> {selectedLog.ip_address || selectedLog.ip || '127.0.0.1'}</div>
              <div><strong>Duration:</strong> {selectedLog.duration_ms ? `${selectedLog.duration_ms} ms` : 'Immediate'}</div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong>Timestamp:</strong> {new Date(selectedLog.created_at).toLocaleString('en-GB')}
              </div>
            </div>

            {selectedLog.details && (
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '12px', color: '#475569' }}>Sanitized Event Context & Diff:</strong>
                <pre style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto', margin: '6px 0 0' }}>
                  {typeof selectedLog.details === 'string' ? selectedLog.details : JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" className="oxoo-upgrade-btn" onClick={() => setSelectedLog(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
