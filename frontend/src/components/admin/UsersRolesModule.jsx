import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Shield, Lock, CheckCircle2,
  AlertCircle, X, ChevronRight, Check, Sliders, ShieldCheck,
  Key, Eye, EyeOff, RefreshCw, Mail, Globe, Layers, Copy,
  Info, Sparkles, Building2, UserCheck, Trash2, AlertTriangle
} from 'lucide-react';
import {
  getStaffSummary, getAdminStaff, createAdminStaff,
  updateAdminStaff, updateAdminStaffStatus, deleteAdminStaff
} from '../../api';

export default function UsersRolesModule({ showToast, logAuditEvent, currentUser }) {
  // Detect current admin authority
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('oxoo_admin_user');
      return u ? JSON.parse(u) : currentUser || {};
    } catch (e) {
      return currentUser || {};
    }
  })();

  const currentRole = (currentUser?.role || storedUser?.role || 'Super Administrator').toString();
  const currentEmail = (currentUser?.email || storedUser?.email || 'admin@oxoo.ai').toString();
  const isSuperAdmin = currentRole.toLowerCase().includes('super');

  const [summary, setSummary] = useState({
    totalUsers: 0,
    superAdmins: 0,
    softwareAdmins: 0,
    managers: 0,
    employees: 0,
    financeAdmins: 0,
    supportTeam: 0,
    salesTeam: 0
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
  const [showPassword, setShowPassword] = useState(false);

  // Helper to generate IDs
  const generateIdForRole = (role) => {
    let pfx = 'EMP';
    if (role === 'Super Admin') pfx = 'SUP';
    else if (role === 'Software Admin') pfx = 'SFT';
    else if (role === 'Manager') pfx = 'MGR';
    return `${pfx}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  // Helper to generate strong passwords
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const initialRole = isSuperAdmin ? 'Software Admin' : 'Manager';

  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: generateIdForRole(initialRole),
    password: generateStrongPassword(),
    role: initialRole,
    department: 'Administration',
    access_level: 'Full Platform',
    assignedSoftware: ['All Software'],
    status: 'Active',
    sendEmail: true,
    permissions: ['*']
  });

  // Edit / Permissions Modal
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete User Confirmation Modal
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Credentials Created Success Modal
  const [credentialsSuccessModal, setCredentialsSuccessModal] = useState(null);

  const availableSoftwareList = [
    'All Software',
    'Website Builder & CMS',
    'Accounting & Finance',
    'HRMS & Payroll',
    'CRM & Sales Engine',
    'Inventory & SCM',
    'Support & Helpdesk',
    'Marketing & Campaigns',
    'E-Commerce & Storefront'
  ];

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
      case 'Software Admin': return 'oxoo-role-badge software-admin';
      case 'Manager': return 'oxoo-role-badge manager';
      case 'Employee': return 'oxoo-role-badge employee';
      case 'Finance Admin': return 'oxoo-role-badge finance-admin';
      case 'Support Staff': return 'oxoo-role-badge support-staff';
      case 'Sales Staff': return 'oxoo-role-badge sales-staff';
      default: return 'oxoo-role-badge';
    }
  };

  const handleRoleChange = (newRole) => {
    const updatedPerms = newRole === 'Super Admin' ? ['*']
      : newRole === 'Software Admin' ? ['applications.read', 'applications.configure', 'customers.read', 'support_tickets.read', 'support_tickets.reply', 'users.read', 'users.manage']
      : newRole === 'Manager' ? ['applications.read', 'customers.read', 'support_tickets.read', 'support_tickets.reply']
      : ['support_tickets.read', 'support_tickets.reply'];

    setNewStaffForm({
      ...newStaffForm,
      role: newRole,
      employeeId: generateIdForRole(newRole),
      permissions: updatedPerms
    });
  };

  const handleCreateStaff = async () => {
    if (!newStaffForm.name || !newStaffForm.email) {
      showToast('Name and work email are required.');
      return;
    }
    if (!newStaffForm.password) {
      showToast('Please set or generate a password for this user.');
      return;
    }
    if (!newStaffForm.employeeId) {
      showToast('Please provide or generate a User/Staff ID.');
      return;
    }

    // Role Hierarchy Constraint check on client
    if (!isSuperAdmin && (newStaffForm.role === 'Super Admin' || newStaffForm.role === 'Software Admin')) {
      showToast('Permission Denied: Software Admins can only create Manager and Employee accounts.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAdminStaff(newStaffForm);
      if (res && res.success) {
        showToast(`Account created! Login credentials dispatched to ${newStaffForm.email}.`);
        if (logAuditEvent) logAuditEvent('Staff User Created & Credentials Dispatched', `${newStaffForm.email} (${newStaffForm.role})`);
        
        setShowAddDrawer(false);
        setAddStep(1);

        // Show credentials confirmation modal
        setCredentialsSuccessModal({
          name: newStaffForm.name,
          email: newStaffForm.email,
          role: newStaffForm.role,
          employeeId: newStaffForm.employeeId,
          password: newStaffForm.password,
          assignedSoftware: newStaffForm.assignedSoftware,
          emailSent: res.emailSent ?? true
        });

        // Reset form with fresh password and ID
        const nextRole = isSuperAdmin ? 'Software Admin' : 'Manager';
        setNewStaffForm({
          name: '',
          email: '',
          phone: '',
          employeeId: generateIdForRole(nextRole),
          password: generateStrongPassword(),
          role: nextRole,
          department: 'Administration',
          access_level: 'Full Platform',
          assignedSoftware: ['All Software'],
          status: 'Active',
          sendEmail: true,
          permissions: ['*']
        });

        fetchStaff();
      } else {
        showToast(res.message || 'Failed to add user.');
      }
    } catch (e) {
      showToast(e.message || 'Error creating user.');
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

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const handleDeleteStaff = async () => {
    if (!deleteConfirmUser) return;
    setIsDeleting(true);
    try {
      const res = await deleteAdminStaff(deleteConfirmUser.id);
      if (res && res.success) {
        showToast(res.message || `User "${deleteConfirmUser.name}" was permanently deleted.`);
        if (logAuditEvent) {
          logAuditEvent('Staff User Deleted', `${deleteConfirmUser.name} (${deleteConfirmUser.email})`);
        }
        setDeleteConfirmUser(null);
        fetchStaff();
      } else {
        showToast(res.message || 'Failed to delete user.');
      }
    } catch (err) {
      showToast(err.message || 'Error deleting user from database.');
    } finally {
      setIsDeleting(false);
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
      <div className="oxoo-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="oxoo-section-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  Users & Administrators
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isSuperAdmin ? '#ede9fe' : '#e0f2fe',
                  color: isSuperAdmin ? '#6d28d9' : '#0284c7'
                }}>
                  {isSuperAdmin ? 'Full Platform Control' : 'Software Admin Scope'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                Manage multiple administrators, software admins, website managers, and employees with automated email credential dispatch.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="oxoo-upgrade-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '13px', fontWeight: 700 }}
          onClick={() => {
            const defaultRole = isSuperAdmin ? 'Software Admin' : 'Manager';
            setNewStaffForm({
              ...newStaffForm,
              role: defaultRole,
              employeeId: generateIdForRole(defaultRole),
              password: generateStrongPassword()
            });
            setShowAddDrawer(true);
            setAddStep(1);
          }}
        >
          <UserPlus size={16} /> + Create Admin / Staff
        </button>
      </div>

      {/* Role Notice Banner for Software Admins */}
      {!isSuperAdmin && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid #bae6fd',
          borderRadius: '10px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#0369a1'
        }}>
          <Info size={18} color="#0284c7" style={{ flexShrink: 0 }} />
          <div>
            <strong>Software Administrator Scope:</strong> You can manage websites, applications, and support data within your scope. As Software Admin, you can create and manage <strong>Manager</strong> and <strong>Employee</strong> users. Credentials will be automatically emailed to them.
          </div>
        </div>
      )}

      {/* 2. 5 Summary Cards matching Role Hierarchy */}
      <div className="oxoo-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Users</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{summary.totalUsers}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>All platform accounts</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6d28d9' }}>Super Admins</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#6d28d9', marginTop: '6px' }}>{summary.superAdmins}</div>
          <div style={{ fontSize: '11px', color: '#a78bfa', marginTop: '3px' }}>Unrestricted root control</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7' }}>Software Admins</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>{summary.softwareAdmins}</div>
          <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '3px' }}>Software & App Admins</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>Managers</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>{summary.managers}</div>
          <div style={{ fontSize: '11px', color: '#34d399', marginTop: '3px' }}>Website & Team leads</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Employees</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#475569', marginTop: '6px' }}>{summary.employees}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>Operations & Support</div>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="oxoo-filter-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name, email, role or Staff ID..."
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
          <option>Software Admin</option>
          <option>Manager</option>
          <option>Employee</option>
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
          <option>Operations</option>
          <option>Web Development</option>
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
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>User / ID</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Work Email</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Assigned Software Scope</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Department</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Created By</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  Loading platform users...
                </td>
              </tr>
            ) : staff.length > 0 ? (
              staff.map((st, idx) => {
                const softwareList = Array.isArray(st.assigned_software)
                  ? st.assigned_software
                  : (typeof st.assigned_software === 'string' && st.assigned_software.startsWith('[')
                    ? JSON.parse(st.assigned_software)
                    : [st.assigned_software || 'All Software']);

                return (
                  <tr key={st.id || st.email} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: st.role === 'Super Admin' ? '#ede9fe' : st.role === 'Software Admin' ? '#e0f2fe' : '#ecfdf5',
                          color: st.role === 'Super Admin' ? '#7c3aed' : st.role === 'Software Admin' ? '#0284c7' : '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px'
                        }}>
                          {st.name ? st.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>{st.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}>
                            {st.employee_id || `ID-${st.id}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} color="#94a3b8" />
                        <span>{st.email}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={getRoleBadgeClass(st.role)}>
                        {st.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#475569' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                        {softwareList.slice(0, 2).map((sw, sIdx) => (
                          <span key={sIdx} style={{
                            padding: '2px 8px',
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#334155'
                          }}>
                            {sw}
                          </span>
                        ))}
                        {softwareList.length > 2 && (
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, padding: '2px 4px' }}>
                            +{softwareList.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                      {st.department || 'Administration'}
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
                      {st.created_by ? st.created_by.split('@')[0] : 'System'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          className="oxoo-outline-btn"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => { setSelectedStaff(st); setShowEditModal(true); }}
                        >
                          Manage
                        </button>
                        <button
                          type="button"
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#ffffff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                          onClick={() => setDeleteConfirmUser(st)}
                          title={`Delete ${st.name} and revoke all access`}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No users found matching current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. ADD USER MULTI-STEP DRAWER */}
      {showAddDrawer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '680px', height: '100%', background: '#fff', boxShadow: '-10px 0 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Create Administrator / Staff User
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Assign User ID & Password with automated email dispatch upon creation.
                </p>
              </div>
              <button onClick={() => setShowAddDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            {/* Stepper */}
            <div className="oxoo-drawer-stepper">
              {[
                { step: 1, label: 'Account & Credentials' },
                { step: 2, label: 'Role & Software Scope' },
                { step: 3, label: 'Department' },
                { step: 4, label: 'Review & Dispatch' }
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
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Gurpreet Singh"
                      value={newStaffForm.name}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Work Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. gurpreet@oxoo.in"
                      value={newStaffForm.email}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                      Login credentials (ID and password) will be automatically sent to this email address.
                    </span>
                  </div>

                  {/* User / Employee ID Field with Auto-Generate */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>User / Staff ID *</label>
                      <button
                        type="button"
                        onClick={() => setNewStaffForm({ ...newStaffForm, employeeId: generateIdForRole(newStaffForm.role) })}
                        style={{ border: 'none', background: 'none', color: '#0284c7', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <RefreshCw size={11} /> Auto-Generate ID
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. SFT-5821"
                      value={newStaffForm.employeeId}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, employeeId: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px', fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>

                  {/* Password Field with Generate & Show/Hide Toggle */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Login Password *</label>
                      <button
                        type="button"
                        onClick={() => setNewStaffForm({ ...newStaffForm, password: generateStrongPassword() })}
                        style={{ border: 'none', background: 'none', color: '#7c3aed', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Sparkles size={12} /> Generate Strong Password
                      </button>
                    </div>
                    <div style={{ position: 'relative', marginTop: '4px' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter or generate temporary password"
                        value={newStaffForm.password}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                        style={{ width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                      The user will use their Email/ID and this Password to sign in.
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Mobile Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={newStaffForm.phone}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    />
                  </div>
                </div>
              )}

              {addStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Platform Role *</label>
                    <select
                      value={newStaffForm.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    >
                      {isSuperAdmin && <option value="Super Admin">Super Admin (All System Control)</option>}
                      {isSuperAdmin && <option value="Software Admin">Software Admin (All Software or Assigned Suite)</option>}
                      <option value="Manager">Manager (Website & Software Operations Manager)</option>
                      <option value="Employee">Employee (Website & Operations Staff)</option>
                    </select>
                    {!isSuperAdmin && (
                      <span style={{ fontSize: '11px', color: '#0284c7', marginTop: '4px', display: 'block' }}>
                        * As Software Admin, you have authority to create Manager and Employee accounts.
                      </span>
                    )}
                  </div>

                  {/* Assigned Software Scope */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Assigned Software Scope *</label>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                      Choose which software or applications this user will manage:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      {availableSoftwareList.map((sw) => {
                        const isChecked = newStaffForm.assignedSoftware.includes(sw);
                        return (
                          <label key={sw} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                let updated = [...newStaffForm.assignedSoftware];
                                if (sw === 'All Software') {
                                  updated = checked ? ['All Software'] : [];
                                } else {
                                  if (checked) {
                                    updated = updated.filter(x => x !== 'All Software');
                                    updated.push(sw);
                                  } else {
                                    updated = updated.filter(x => x !== sw);
                                  }
                                }
                                if (updated.length === 0) updated = ['All Software'];
                                setNewStaffForm({ ...newStaffForm, assignedSoftware: updated });
                              }}
                            />
                            <span>{sw}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                      Permissions Summary for {newStaffForm.role}
                    </div>
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
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                    >
                      <option>Administration</option>
                      <option>Operations</option>
                      <option>Web Development</option>
                      <option>Finance</option>
                      <option>Support</option>
                      <option>Sales</option>
                      <option>Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Access Level</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                      {[
                        { id: 'Full Platform', desc: 'Full administration across all designated software and websites' },
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

              {addStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                  <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>User Name:</span>
                      <strong style={{ color: '#0f172a' }}>{newStaffForm.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Email (Login ID):</span>
                      <strong style={{ color: '#0284c7' }}>{newStaffForm.email}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Staff ID:</span>
                      <strong style={{ fontFamily: 'monospace' }}>{newStaffForm.employeeId}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Assigned Role:</span>
                      <span className={getRoleBadgeClass(newStaffForm.role)}>{newStaffForm.role}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Software Scope:</span>
                      <strong>{newStaffForm.assignedSoftware.join(', ')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Temporary Password:</span>
                      <strong style={{ fontFamily: 'monospace', color: '#7c3aed' }}>{newStaffForm.password}</strong>
                    </div>
                  </div>

                  {/* Send Email Checkbox */}
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newStaffForm.sendEmail}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, sendEmail: e.target.checked })}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ color: '#1e40af', fontSize: '13px' }}>
                        Auto-send login credentials to user's email
                      </strong>
                      <div style={{ fontSize: '11.5px', color: '#1d4ed8', marginTop: '2px' }}>
                        An automated email containing User ID, Password, and the login URL will be instantly dispatched to <strong>{newStaffForm.email || 'the provided address'}</strong>.
                      </div>
                    </div>
                  </label>
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

              {addStep < 4 ? (
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => {
                    if (addStep === 1) {
                      if (!newStaffForm.name || !newStaffForm.email) {
                        showToast('Please enter full name and email.');
                        return;
                      }
                      if (!newStaffForm.password) {
                        showToast('Please enter or generate a password.');
                        return;
                      }
                    }
                    setAddStep(addStep + 1);
                  }}
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
                  style={{ padding: '8px 22px' }}
                >
                  {isSubmitting ? 'Creating & Sending Email...' : 'Confirm, Create & Dispatch Email'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. CREDENTIALS CREATED & EMAILED CONFIRMATION MODAL */}
      {credentialsSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '560px', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Account Created & Credentials Emailed!
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Login details have been dispatched to <strong>{credentialsSuccessModal.email}</strong>.
                </p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Full Name:</span>
                <strong>{credentialsSuccessModal.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Role:</span>
                <span className={getRoleBadgeClass(credentialsSuccessModal.role)}>{credentialsSuccessModal.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>User / Staff ID:</span>
                <strong style={{ fontFamily: 'monospace', color: '#0284c7' }}>{credentialsSuccessModal.employeeId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Login Email:</span>
                <strong>{credentialsSuccessModal.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ede9fe', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: '#6d28d9', fontWeight: 600 }}>Temporary Password:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ fontSize: '14px', fontWeight: 800, color: '#6d28d9' }}>{credentialsSuccessModal.password}</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(credentialsSuccessModal.password, 'Password')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed' }}
                    title="Copy Password"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="oxoo-outline-btn"
                onClick={() => {
                  const text = `OXOO Credentials:\nRole: ${credentialsSuccessModal.role}\nEmail: ${credentialsSuccessModal.email}\nID: ${credentialsSuccessModal.employeeId}\nPassword: ${credentialsSuccessModal.password}`;
                  copyToClipboard(text, 'Full credentials');
                }}
              >
                Copy All Credentials
              </button>
              <button
                type="button"
                className="oxoo-upgrade-btn"
                onClick={() => setCredentialsSuccessModal(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MANAGE STAFF & PERMISSIONS MODAL */}
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
                  {isSuperAdmin && <option value="Super Admin">Super Admin</option>}
                  {isSuperAdmin && <option value="Software Admin">Software Admin</option>}
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                  <option value="Finance Admin">Finance Admin</option>
                  <option value="Support Staff">Support Staff</option>
                  <option value="Sales Staff">Sales Staff</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Department</label>
                <select
                  value={selectedStaff.department || 'Administration'}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, department: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                >
                  <option>Administration</option>
                  <option>Operations</option>
                  <option>Web Development</option>
                  <option>Finance</option>
                  <option>Support</option>
                  <option>Sales</option>
                  <option>Engineering</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Status</label>
                <select
                  value={selectedStaff.status || 'Active'}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, status: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                >
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <button
                type="button"
                style={{
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                onClick={() => {
                  setShowEditModal(false);
                  setDeleteConfirmUser(selectedStaff);
                }}
              >
                <Trash2 size={13} />
                Delete Account
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
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
        </div>
      )}

      {/* 8. DELETE CONFIRMATION MODAL */}
      {deleteConfirmUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '500px', maxWidth: '100%', background: '#fff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', background: '#fef2f2', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#991b1b' }}>Delete Administrator / Staff</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#b91c1c' }}>Permanent removal & access revocation</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirmUser(null)}
                disabled={isDeleting}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              {deleteConfirmUser.email?.toLowerCase() === 'manminder.singh@primepro.ai' ? (
                <div style={{ padding: '16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '13px', lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Root Super Administrator Protected</div>
                  The primary root Super Administrator account (<strong>manminder.singh@primepro.ai</strong>) cannot be deleted under any circumstances.
                </div>
              ) : deleteConfirmUser.email?.toLowerCase() === currentEmail?.toLowerCase() ? (
                <div style={{ padding: '16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '13px', lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Cannot Delete Active Session</div>
                  You cannot delete your own currently active administrator session. To delete this user, please sign in with another Super Administrator account.
                </div>
              ) : (
                <>
                  <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
                    Are you sure you want to permanently delete this user account?
                  </p>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#ede9fe',
                        color: '#7c3aed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '15px'
                      }}>
                        {deleteConfirmUser.name ? deleteConfirmUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{deleteConfirmUser.name}</div>
                        <div style={{ fontSize: '12.5px', color: '#64748b' }}>{deleteConfirmUser.email}</div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                          <span className={getRoleBadgeClass(deleteConfirmUser.role)} style={{ fontSize: '11px', padding: '2px 8px' }}>
                            {deleteConfirmUser.role}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}>
                            {deleteConfirmUser.employee_id || `ID-${deleteConfirmUser.id}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>Backend Database Changes:</div>
                    • Permanently removed from <code>platform_staff</code> directory<br />
                    • Credentials deleted from PostgreSQL <code>users</code> authentication table<br />
                    • All active session tokens and authorizations immediately revoked
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="oxoo-outline-btn"
                onClick={() => setDeleteConfirmUser(null)}
                disabled={isDeleting}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              {deleteConfirmUser.email?.toLowerCase() !== 'manminder.singh@primepro.ai' &&
               deleteConfirmUser.email?.toLowerCase() !== currentEmail?.toLowerCase() && (
                <button
                  type="button"
                  onClick={handleDeleteStaff}
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
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)'
                  }}
                >
                  <Trash2 size={14} />
                  {isDeleting ? 'Deleting...' : 'Confirm & Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
