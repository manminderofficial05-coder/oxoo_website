import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Shield, Lock, CheckCircle2,
  AlertCircle, X, ChevronRight, Check, Sliders, ShieldCheck
} from 'lucide-react';
import {
  getStaffSummary, getAdminStaff, createAdminStaff,
  updateAdminStaff, updateAdminStaffStatus
} from '../../api';

export default function UsersRolesModule({ showToast, logAuditEvent }) {
  const [summary, setSummary] = useState({
    totalUsers: 24,
    superAdmins: 2,
    financeAdmins: 4,
    supportTeam: 8,
    salesTeam: 5
  });

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [deptFilter, setDeptFilter] = useState('All Departments');

  // Add User Drawer (Multi-step)
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Support Staff',
    department: 'Support',
    access_level: 'Module Specific',
    status: 'Active',
    permissions: ['support_tickets.read', 'support_tickets.reply']
  });

  // Edit / Permissions Modal
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const [sumRes, staffRes] = await Promise.all([
        getStaffSummary(),
        getAdminStaff({ search, role: roleFilter, status: statusFilter, department: deptFilter })
      ]);
      if (sumRes && sumRes.summary) setSummary(sumRes.summary);
      if (staffRes && staffRes.staff) setStaff(staffRes.staff);
    } catch (err) {
      console.error('Error fetching staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [search, roleFilter, statusFilter, deptFilter]);

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('All Roles');
    setStatusFilter('All Statuses');
    setDeptFilter('All Departments');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Super Admin': return 'oxoo-role-badge super-admin';
      case 'Finance Admin': return 'oxoo-role-badge finance-admin';
      case 'Support Staff': return 'oxoo-role-badge support-staff';
      case 'Sales Staff': return 'oxoo-role-badge sales-staff';
      default: return 'oxoo-role-badge';
    }
  };

  const handleCreateStaff = async () => {
    if (!newStaffForm.name || !newStaffForm.email) {
      showToast('Name and work email are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createAdminStaff(newStaffForm);
      if (res && res.success) {
        showToast(`Staff member "${newStaffForm.name}" invited successfully.`);
        if (logAuditEvent) logAuditEvent('Staff User Added', newStaffForm.email);
        setShowAddDrawer(false);
        setAddStep(1);
        setNewStaffForm({
          name: '',
          email: '',
          phone: '',
          role: 'Support Staff',
          department: 'Support',
          access_level: 'Module Specific',
          status: 'Active',
          permissions: ['support_tickets.read', 'support_tickets.reply']
        });
        fetchStaff();
      } else {
        showToast(res.message || 'Failed to add staff member.');
      }
    } catch (e) {
      showToast(e.message || 'Error creating staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedStaff) return;
    try {
      const res = await updateAdminStaff(selectedStaff.id, selectedStaff);
      if (res && res.success) {
        showToast(`Staff member "${selectedStaff.name}" updated successfully.`);
        if (logAuditEvent) logAuditEvent('Staff Permissions Updated', selectedStaff.email);
        setShowEditModal(false);
        fetchStaff();
      } else {
        showToast(res.message || 'Failed to update staff member.');
      }
    } catch (e) {
      showToast(e.message || 'Error updating staff member.');
    }
  };

  const handleToggleStatus = async (st) => {
    const nextStatus = st.status === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await updateAdminStaffStatus(st.id, nextStatus);
      if (res && res.success) {
        showToast(`Staff member status changed to ${nextStatus}.`);
        if (logAuditEvent) logAuditEvent('Staff Status Changed', `${st.email} -> ${nextStatus}`);
        fetchStaff();
      } else {
        showToast(res.message || 'Failed to change status.');
      }
    } catch (e) {
      showToast(e.message || 'Error updating status.');
    }
  };

  const allAvailablePermissions = [
    { id: 'customers.read', label: 'View Customers Directory' },
    { id: 'subscriptions.read', label: 'View Subscriptions & Renewals' },
    { id: 'subscriptions.manage', label: 'Manage & Cancel Subscriptions' },
    { id: 'products.read', label: 'View Products & Pricing' },
    { id: 'products.manage', label: 'Create & Edit Products/Plans' },
    { id: 'applications.read', label: 'View Applications' },
    { id: 'applications.configure', label: 'Configure Applications & Keys' },
    { id: 'payments.read', label: 'View Payments & Transactions' },
    { id: 'invoices.read', label: 'View Invoices' },
    { id: 'invoices.download', label: 'Download Invoices & Receipts' },
    { id: 'reports.finance.read', label: 'Access Finance Analytics' },
    { id: 'reports.support.read', label: 'Access Support Reports' },
    { id: 'reports.sales.read', label: 'Access Sales Reports' },
    { id: 'support_tickets.read', label: 'View Support Tickets' },
    { id: 'support_tickets.reply', label: 'Reply & Add Internal Notes' },
    { id: 'support_tickets.resolve', label: 'Resolve & Close Tickets' },
    { id: 'users.read', label: 'View Staff Directory' },
    { id: 'users.manage', label: 'Manage Staff Roles & Access' }
  ];

  return (
    <div className="oxoo-section-card" style={{ padding: '24px' }}>
      {/* 1. Header */}
      <div className="oxoo-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <div>
              <h2 className="oxoo-section-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Users & Roles</h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                Manage platform users, roles and permissions.
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="oxoo-upgrade-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '13px', fontWeight: 700 }}
          onClick={() => { setShowAddDrawer(true); setAddStep(1); }}
        >
          <UserPlus size={16} /> + Add User
        </button>
      </div>

      {/* 2. 5 Summary Cards matching mockup */}
      <div className="oxoo-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Users</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{summary.totalUsers}</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6d28d9' }}>Super Admins</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#6d28d9', marginTop: '6px' }}>{summary.superAdmins}</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#b45309' }}>Finance Admins</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#b45309', marginTop: '6px' }}>{summary.financeAdmins}</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#0369a1' }}>Support Team</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0369a1', marginTop: '6px' }}>{summary.supportTeam}</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>Sales Team</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#15803d', marginTop: '6px' }}>{summary.salesTeam}</div>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="oxoo-filter-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#334155' }}
        >
          <option>All Roles</option>
          <option>Super Admin</option>
          <option>Finance Admin</option>
          <option>Support Staff</option>
          <option>Sales Staff</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#334155' }}
        >
          <option>All Statuses</option>
          <option>Active</option>
          <option>Suspended</option>
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#334155' }}
        >
          <option>All Departments</option>
          <option>Administration</option>
          <option>Finance</option>
          <option>Support</option>
          <option>Sales</option>
          <option>Engineering</option>
        </select>

        {(search || roleFilter !== 'All Roles' || statusFilter !== 'All Statuses' || deptFilter !== 'All Departments') && (
          <button
            type="button"
            onClick={handleClearFilters}
            style={{ border: 'none', background: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '6px 8px' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 4. Staff Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff' }}>
        <table className="oxoo-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ width: '40px', padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>#</th>
              <th style={{ width: '40px', padding: '12px 8px', fontSize: '12px', color: '#64748b' }}>Avatar</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Department</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Joined</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length > 0 ? (
              staff.map((st, idx) => (
                <tr key={st.id || st.email} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ padding: '14px 8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                      {st.name.charAt(0)}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                    {st.name}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569' }}>
                    {st.email}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={getRoleBadgeClass(st.role)}>
                      {st.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                    {st.department}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      onClick={() => handleToggleStatus(st)}
                      className={`oxoo-status-tag ${st.status === 'Active' ? 'active' : 'maintenance'}`}
                      style={{ cursor: 'pointer' }}
                      title="Click to toggle status"
                    >
                      ● {st.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                    {st.joined_at ? new Date(st.joined_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Oct 2026'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => { setSelectedStaff(st); setShowEditModal(true); }}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No staff users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. ADD USER MULTI-STEP DRAWER matching mockup */}
      {showAddDrawer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '680px', height: '100%', background: '#fff', boxShadow: '-10px 0 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Add / Edit User</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Invite administrative staff with granular role permissions.</p>
              </div>
              <button onClick={() => setShowAddDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            {/* Stepper */}
            <div className="oxoo-drawer-stepper">
              {[
                { step: 1, label: 'User Information' },
                { step: 2, label: 'Role & Permissions' },
                { step: 3, label: 'Department' },
                { step: 4, label: 'Access Level' },
                { step: 5, label: 'Review' }
              ].map(s => (
                <div key={s.step} className={`oxoo-drawer-step-item ${addStep === s.step ? 'active' : ''}`} onClick={() => setAddStep(s.step)} style={{ cursor: 'pointer' }}>
                  <div className="oxoo-drawer-step-badge">{s.step}</div>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {addStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800 }}>
                      {newStaffForm.name ? newStaffForm.name.charAt(0) : 'U'}
                    </div>
                    <div>
                      <button type="button" className="oxoo-outline-btn" style={{ padding: '6px 14px', fontSize: '12px' }}>
                        Upload Photo
                      </button>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>PNG or JPG, max 2MB</div>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Deepak Joshi"
                      value={newStaffForm.name}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Work Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. deepak@oxoo.in"
                      value={newStaffForm.email}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Mobile Number</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={newStaffForm.phone}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>
                </div>
              )}

              {addStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Assigned Platform Role *</label>
                    <select
                      value={newStaffForm.role}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    >
                      <option>Super Admin</option>
                      <option>Finance Admin</option>
                      <option>Support Staff</option>
                      <option>Sales Staff</option>
                    </select>
                  </div>

                  <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Granular Permissions</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      {allAvailablePermissions.map(p => (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                          <input
                            type="checkbox"
                            checked={newStaffForm.permissions.includes(p.id) || newStaffForm.permissions.includes('*')}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              let perms = [...newStaffForm.permissions];
                              if (checked) {
                                perms.push(p.id);
                              } else {
                                perms = perms.filter(x => x !== p.id && x !== '*');
                              }
                              setNewStaffForm({ ...newStaffForm, permissions: perms });
                            }}
                          />
                          <span>{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {addStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Department</label>
                    <select
                      value={newStaffForm.department}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, department: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    >
                      <option>Administration</option>
                      <option>Finance</option>
                      <option>Support</option>
                      <option>Sales</option>
                      <option>Engineering</option>
                    </select>
                  </div>
                </div>
              )}

              {addStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Access Level</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                      {[
                        { id: 'Full Platform', desc: 'Unrestricted administration across all modules' },
                        { id: 'Module Specific', desc: 'Authorized only for assigned operational modules' },
                        { id: 'Read Only', desc: 'Read-only audit and reporting visibility' }
                      ].map(lvl => (
                        <label key={lvl.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: newStaffForm.access_level === lvl.id ? '#eff6ff' : '#fff', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="access_level"
                            checked={newStaffForm.access_level === lvl.id}
                            onChange={() => setNewStaffForm({ ...newStaffForm, access_level: lvl.id })}
                            style={{ marginTop: '3px' }}
                          />
                          <div>
                            <strong style={{ fontSize: '13px', color: '#0f172a' }}>{lvl.id}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{lvl.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {addStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                  <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div><strong>Name:</strong> {newStaffForm.name}</div>
                    <div><strong>Email:</strong> {newStaffForm.email}</div>
                    <div><strong>Role:</strong> {newStaffForm.role}</div>
                    <div><strong>Department:</strong> {newStaffForm.department}</div>
                    <div><strong>Access Level:</strong> {newStaffForm.access_level}</div>
                    <div><strong>Permissions:</strong> {newStaffForm.permissions.length} active rights</div>
                  </div>
                  <div style={{ padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '12px', color: '#1e40af' }}>
                    An invitation email with secure activation link will be automatically dispatched to {newStaffForm.email}.
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <button
                type="button"
                className="oxoo-outline-btn"
                onClick={() => {
                  if (addStep > 1) setAddStep(addStep - 1);
                  else setShowAddDrawer(false);
                }}
                style={{ padding: '8px 16px' }}
              >
                {addStep > 1 ? 'Back' : 'Cancel'}
              </button>

              {addStep < 5 ? (
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setAddStep(addStep + 1)}
                  style={{ padding: '8px 20px' }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="oxoo-upgrade-btn"
                  onClick={handleCreateStaff}
                  style={{ padding: '8px 20px' }}
                >
                  {isSubmitting ? 'Sending...' : 'Confirm & Send Invitation'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. MANAGE STAFF & PERMISSIONS MODAL */}
      {showEditModal && selectedStaff && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '560px', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>Manage Staff Permissions</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>{selectedStaff.name} ({selectedStaff.email})</p>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Platform Role</label>
                <select
                  value={selectedStaff.role}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, role: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                >
                  <option>Super Admin</option>
                  <option>Finance Admin</option>
                  <option>Support Staff</option>
                  <option>Sales Staff</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Department</label>
                <select
                  value={selectedStaff.department}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, department: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                >
                  <option>Administration</option>
                  <option>Finance</option>
                  <option>Support</option>
                  <option>Sales</option>
                  <option>Engineering</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Status</label>
                <select
                  value={selectedStaff.status}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, status: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                >
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#f8fafc' }}>
              <button
                type="button"
                className="oxoo-outline-btn"
                onClick={() => setShowEditModal(false)}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="oxoo-upgrade-btn"
                onClick={handleSaveEdit}
                style={{ padding: '8px 20px' }}
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
