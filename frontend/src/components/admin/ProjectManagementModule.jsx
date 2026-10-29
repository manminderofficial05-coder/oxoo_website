import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Search, Filter, RefreshCw, Mail, Phone, Calendar,
  CheckCircle2, Clock, MessageSquare, Building2, User, Globe,
  Download, Eye, Check, X, AlertCircle, Sparkles, ChevronRight,
  ChevronLeft, FileText, UserCheck, Send, PhoneCall, Layers,
  FolderKanban, ArrowUpDown, Paperclip, ExternalLink
} from 'lucide-react';
import {
  getAdminProjectsSummary,
  getAdminProjectRequests,
  getAdminProjectRequestDetails,
  updateAdminProjectRequest,
  createAdminConsultationFromProject,
  downloadAdminProjectAttachment,
  exportAdminProjectRequestsCsv,
  getAdminConsultationRequests,
  getAdminConsultationDetails,
  updateAdminConsultationRequest
} from '../../api';
import {
  PROJECT_CATEGORIES,
  ALL_PROJECT_SERVICES,
  PROJECT_REQUEST_STATUSES,
  CONSULTATION_REQUEST_STATUSES,
  CONSULTATION_TIME_SLOTS
} from '../../projectsConfig';

const STATUS_BADGE_STYLES = {
  'New': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'Under Review': { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  'Contacted': { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' },
  'Requirements Pending': { bg: '#ffedd5', color: '#c2410c', border: '#fed7aa' },
  'Proposal in Progress': { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' },
  'Proposal Sent': { bg: '#e0e7ff', color: '#4338ca', border: '#c7d2fe' },
  'Approved': { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  'In Progress': { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc' },
  'Completed': { bg: '#d1fae5', color: '#047857', border: '#6ee7b7' },
  'Rejected': { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  'Archived': { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  'Contact Pending': { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  'Appointment Requested': { bg: '#e0e7ff', color: '#4338ca', border: '#c7d2fe' },
  'Appointment Confirmed': { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  'Cancelled': { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' }
};

export default function ProjectManagementModule({ showToast, logAuditEvent }) {
  // Active sub-section: 'projects' (Section A) or 'consultations' (Section B)
  const [activeSection, setActiveSection] = useState('projects');

  // Real database summary metrics
  const [summary, setSummary] = useState({
    totalProjectRequests: 0,
    newRequests: 0,
    underReview: 0,
    proposalsSent: 0,
    consultationRequests: 0,
    confirmedConsultations: 0,
    staffMembers: []
  });

  // List state
  const [projectRequests, setProjectRequests] = useState([]);
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignedToFilter, setAssignedToFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });

  // Selected Project Request Drawer state
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectStatusEdit, setProjectStatusEdit] = useState('');
  const [projectAssigneeEdit, setProjectAssigneeEdit] = useState('');
  const [projectNoteInput, setProjectNoteInput] = useState('');
  const [sendEmailCheckbox, setSendEmailCheckbox] = useState(false);
  const [customerEmailMsg, setCustomerEmailMsg] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  // Selected Consultation Request Drawer state
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [consultStatusEdit, setConsultStatusEdit] = useState('');
  const [consultAssigneeEdit, setConsultAssigneeEdit] = useState('');
  const [consultNoteInput, setConsultNoteInput] = useState('');
  const [appointmentAction, setAppointmentAction] = useState('');
  const [confirmedDateInput, setConfirmedDateInput] = useState('');
  const [confirmedTimeInput, setConfirmedTimeInput] = useState('');
  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const [appointmentNoteInput, setAppointmentNoteInput] = useState('');
  const [savingConsult, setSavingConsult] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const sumRes = await getAdminProjectsSummary();
      if (sumRes) {
        const s = sumRes.summary || sumRes;
        setSummary({
          ...s,
          staffMembers: sumRes.staffMembers || s.staffMembers || []
        });
      }

      const queryParams = {
        search: search.trim(),
        category: categoryFilter,
        service: serviceFilter,
        status: statusFilter,
        assignedTo: assignedToFilter,
        dateFrom,
        dateTo,
        sort: sortOrder,
        page,
        limit: 15
      };

      if (activeSection === 'projects') {
        const projRes = await getAdminProjectRequests(queryParams);
        if (projRes && Array.isArray(projRes.requests)) {
          setProjectRequests(projRes.requests);
          if (projRes.pagination) {
            setPagination({
              ...projRes.pagination,
              pages: projRes.pagination.totalPages || projRes.pagination.pages || 1
            });
          }
        }
      } else {
        const consRes = await getAdminConsultationRequests(queryParams);
        if (consRes && Array.isArray(consRes.consultations)) {
          setConsultationRequests(consRes.consultations);
          if (consRes.pagination) {
            setPagination({
              ...consRes.pagination,
              pages: consRes.pagination.totalPages || consRes.pagination.pages || 1
            });
          }
        }
      }

      if (isRefresh && showToast) {
        showToast('Project Management data refreshed from database.');
      }
    } catch (err) {
      console.error('Failed to load Project Management records:', err);
      if (showToast) showToast(err.message || 'Failed to load Project Management records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSection, categoryFilter, serviceFilter, statusFilter, assignedToFilter, dateFrom, dateTo, sortOrder, page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 320);
    return () => clearTimeout(timer);
  }, [search]);

  // Open Project Request Details
  const handleOpenProjectDetail = async (reqId) => {
    try {
      const res = await getAdminProjectRequestDetails(reqId);
      if (res && res.request) {
        setSelectedProject(res.request);
        setProjectStatusEdit(res.request.status || 'New');
        setProjectAssigneeEdit(res.request.assigned_team_member || res.request.assigned_to || '');
        setProjectNoteInput('');
        setSendEmailCheckbox(false);
        setCustomerEmailMsg('');
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to load project request details.');
    }
  };

  // Save Project Request Update
  const handleSaveProjectUpdate = async () => {
    if (!selectedProject) return;
    setSavingProject(true);
    try {
      const payload = {
        status: projectStatusEdit,
        assignedTo: projectAssigneeEdit,
        note: projectNoteInput.trim() || undefined,
        sendStatusEmail: sendEmailCheckbox,
        customerEmailMessage: customerEmailMsg.trim() || undefined
      };
      const res = await updateAdminProjectRequest(selectedProject.request_id, payload);
      if (res && res.request) {
        setSelectedProject((prev) => ({
          ...res.request,
          attachments: prev?.attachments || []
        }));
        setProjectNoteInput('');
        setCustomerEmailMsg('');
        setSendEmailCheckbox(false);
        if (showToast) showToast(`Project Request ${selectedProject.request_id} updated.`);
        if (logAuditEvent) {
          logAuditEvent('PROJECT_REQUEST_UPDATED', `Updated ${selectedProject.request_id} to status ${projectStatusEdit}`);
        }
        loadData();
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to update project request.');
    } finally {
      setSavingProject(false);
    }
  };

  // Create Consultation Request from Project Request
  const handleCreateConsultationFromProject = async () => {
    if (!selectedProject) return;
    try {
      const res = await createAdminConsultationFromProject(selectedProject.request_id, {});
      if (res && res.consultation) {
        if (showToast) {
          showToast(`Created Consultation Request ${res.consultation.request_id} from ${selectedProject.request_id}.`);
        }
        loadData();
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to create consultation request.');
    }
  };

  // Download Attachment
  const handleDownloadAttachment = async (att) => {
    try {
      await downloadAdminProjectAttachment(att.attachment_id, att.file_name);
      if (showToast) showToast(`Downloaded ${att.file_name}`);
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to download attachment.');
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      await exportAdminProjectRequestsCsv({
        search: search.trim(),
        category: categoryFilter,
        service: serviceFilter,
        status: statusFilter,
        assignedTo: assignedToFilter,
        dateFrom,
        dateTo
      });
      if (showToast) showToast('Exported Project Requests to CSV.');
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to export CSV.');
    }
  };

  // Open Consultation Details
  const handleOpenConsultDetail = async (reqId) => {
    try {
      const res = await getAdminConsultationDetails(reqId);
      if (res && res.consultation) {
        const c = res.consultation;
        setSelectedConsultation(c);
        setConsultStatusEdit(c.status || 'New');
        setConsultAssigneeEdit(c.assigned_team_member || c.assigned_to || '');
        setConsultNoteInput('');
        setAppointmentAction('');
        setConfirmedDateInput(c.confirmed_date || c.preferred_date || '');
        setConfirmedTimeInput(c.confirmed_time || c.preferred_time || '');
        setMeetingLinkInput(c.meeting_link || '');
        setAppointmentNoteInput('');
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to load consultation request details.');
    }
  };

  // Save Consultation Update
  const handleSaveConsultationUpdate = async () => {
    if (!selectedConsultation) return;
    setSavingConsult(true);
    try {
      const payload = {
        status: consultStatusEdit,
        assignedTo: consultAssigneeEdit,
        note: consultNoteInput.trim() || undefined,
        appointmentAction: appointmentAction || undefined,
        confirmedDate: confirmedDateInput || undefined,
        confirmedTime: confirmedTimeInput || undefined,
        meetingLink: meetingLinkInput || undefined,
        appointmentNote: appointmentNoteInput.trim() || undefined
      };
      const res = await updateAdminConsultationRequest(selectedConsultation.request_id, payload);
      if (res && res.consultation) {
        setSelectedConsultation(res.consultation);
        setConsultNoteInput('');
        setAppointmentAction('');
        setAppointmentNoteInput('');
        if (showToast) showToast(`Consultation Request ${selectedConsultation.request_id} updated.`);
        loadData();
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to update consultation request.');
    } finally {
      setSavingConsult(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('All');
    setServiceFilter('All');
    setStatusFilter('All');
    setAssignedToFilter('All');
    setDateFrom('');
    setDateTo('');
    setSortOrder('newest');
    setPage(1);
  };

  const renderStatusBadge = (status) => {
    const st = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES['New'];
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '11.5px',
          fontWeight: 700,
          background: st.bg,
          color: st.color,
          border: `1px solid ${st.border}`,
          whiteSpace: 'nowrap'
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.color }} />
        {status}
      </span>
    );
  };

  return (
    <div style={{ padding: '4px 0 40px' }}>
      {/* =====================================================================
          HEADER & ACTIONS
          ===================================================================== */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              color: '#ffffff'
            }}>
              <FolderKanban size={20} />
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Project Management & Consultation Hub
            </h2>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            Manage multi-service customer project requests, reference attachments, proposals, and discovery consultation appointments.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 15px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          6 DASHBOARD SUMMARY CARDS (LIVE FROM DATABASE)
          ===================================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '14px',
        marginBottom: '26px'
      }}>
        {[
          {
            label: 'Total Project Requests',
            value: summary.totalProjectRequests,
            color: '#2563eb',
            bg: '#eff6ff',
            onClick: () => { setActiveSection('projects'); setStatusFilter('All'); }
          },
          {
            label: 'New Requests',
            value: summary.newRequests,
            color: '#0284c7',
            bg: '#e0f2fe',
            onClick: () => { setActiveSection('projects'); setStatusFilter('New'); }
          },
          {
            label: 'Under Review',
            value: summary.underReview,
            color: '#d97706',
            bg: '#fef3c7',
            onClick: () => { setActiveSection('projects'); setStatusFilter('Under Review'); }
          },
          {
            label: 'Proposals Sent',
            value: summary.proposalsSent,
            color: '#4f46e5',
            bg: '#e0e7ff',
            onClick: () => { setActiveSection('projects'); setStatusFilter('Proposal Sent'); }
          },
          {
            label: 'Consultation Requests',
            value: summary.consultationRequests,
            color: '#0891b2',
            bg: '#ecfeff',
            onClick: () => { setActiveSection('consultations'); setStatusFilter('All'); }
          },
          {
            label: 'Confirmed Consultations',
            value: summary.confirmedConsultations,
            color: '#15803d',
            bg: '#dcfce7',
            onClick: () => { setActiveSection('consultations'); setStatusFilter('Appointment Confirmed'); }
          }
        ].map((card) => (
          <div
            key={card.label}
            onClick={card.onClick}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px 18px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
              transition: 'transform 0.18s ease, border-color 0.18s ease'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
              {card.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
                {card.value ?? 0}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '999px',
                background: card.bg,
                color: card.color
              }}>
                Live DB
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================================
          SECTION TABS (SECTION A: PROJECT REQUESTS | SECTION B: CONSULTATION REQUESTS)
          ===================================================================== */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '18px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px'
      }}>
        <button
          type="button"
          onClick={() => { setActiveSection('projects'); setStatusFilter('All'); setPage(1); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeSection === 'projects' ? 'none' : '1px solid #cbd5e1',
            background: activeSection === 'projects' ? '#0f172a' : '#ffffff',
            color: activeSection === 'projects' ? '#ffffff' : '#334155',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Briefcase size={16} />
          <span>Section A — Project Requests ({summary.totalProjectRequests})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSection('consultations'); setStatusFilter('All'); setPage(1); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeSection === 'consultations' ? 'none' : '1px solid #cbd5e1',
            background: activeSection === 'consultations' ? '#0f172a' : '#ffffff',
            color: activeSection === 'consultations' ? '#ffffff' : '#334155',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <PhoneCall size={16} />
          <span>Section B — Consultation Requests ({summary.consultationRequests})</span>
        </button>
      </div>

      {/* =====================================================================
          SEARCH, FILTERS & SORT BAR
          ===================================================================== */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '12px',
        alignItems: 'end'
      }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            Search (Customer, Company, Request ID, Title)
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search PRJ-2026-..., customer name, company, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '9px',
                border: '1px solid #cbd5e1',
                fontSize: '13px'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            Service Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '9px 10px', borderRadius: '9px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="All">All Categories</option>
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.name || c.title}>{c.name || c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            Individual Service
          </label>
          <select
            value={serviceFilter}
            onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '9px 10px', borderRadius: '9px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="All">All 18 Services</option>
            {ALL_PROJECT_SERVICES.map((s) => (
              <option key={s.slug} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '9px 10px', borderRadius: '9px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="All">All Statuses</option>
            {(activeSection === 'projects' ? PROJECT_REQUEST_STATUSES : CONSULTATION_REQUEST_STATUSES).map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            Assigned Team Member
          </label>
          <select
            value={assignedToFilter}
            onChange={(e) => { setAssignedToFilter(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '9px 10px', borderRadius: '9px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="All">All Team Members</option>
            <option value="Unassigned">Unassigned</option>
            {(summary.staffMembers || []).map((st) => (
              <option key={st.email || st.name} value={st.name}>
                {st.name} ({st.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            From Date
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '9px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            To Date
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '9px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            Sort By
          </label>
          <select
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '9px 10px', borderRadius: '9px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>

        <div>
          <button
            type="button"
            onClick={resetFilters}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '9px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#475569',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* =====================================================================
          DATA TABLES
          ===================================================================== */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
      }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Loading {activeSection === 'projects' ? 'Project Requests' : 'Consultation Requests'} from PostgreSQL...
          </div>
        ) : activeSection === 'projects' ? (
          projectRequests.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center' }}>
              <Briefcase size={38} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                No Project Requests Found
              </h4>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 auto 16px', maxWidth: '460px' }}>
                When customers submit multi-service project specifications on the /projects hub, they appear here in real time.
              </p>
              <a
                href="/projects"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '9px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <span>Open Public /projects Hub</span>
                <ExternalLink size={14} />
              </a>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '13px 14px' }}>Request ID</th>
                    <th style={{ padding: '13px 14px' }}>Customer & Company</th>
                    <th style={{ padding: '13px 14px' }}>Contact & Country</th>
                    <th style={{ padding: '13px 14px' }}>Project Title</th>
                    <th style={{ padding: '13px 14px' }}>Categories & Services</th>
                    <th style={{ padding: '13px 14px' }}>Budget & Timeline</th>
                    <th style={{ padding: '13px 14px' }}>Assigned To</th>
                    <th style={{ padding: '13px 14px' }}>Status</th>
                    <th style={{ padding: '13px 14px' }}>Submitted / Updated</th>
                    <th style={{ padding: '13px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projectRequests.map((req) => {
                    const cats = Array.isArray(req.selected_categories) ? req.selected_categories : [];
                    const svcs = Array.isArray(req.selected_services) ? req.selected_services : [];
                    return (
                      <tr
                        key={req.request_id}
                        style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                        onClick={() => handleOpenProjectDetail(req.request_id)}
                      >
                        <td style={{ padding: '14px', fontWeight: 800, color: '#2563eb', whiteSpace: 'nowrap' }}>
                          <div>{req.request_id}</div>
                          {(Number(req.attachment_count) > 0 || (Array.isArray(req.attachments_meta) && req.attachments_meta.length > 0)) && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: '#64748b',
                              marginTop: '3px'
                            }}>
                              <Paperclip size={11} /> {req.attachment_count || req.attachments_meta?.length} file(s)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.customer_name || req.full_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {req.company_name && req.company_name !== 'Individual / Personal' ? req.company_name : 'Individual Client'}
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ color: '#0f172a' }}>{req.business_email}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{req.phone_number || req.phone} · {req.country}</div>
                        </td>
                        <td style={{ padding: '14px', maxWidth: '220px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.project_title}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {req.project_description}
                          </div>
                        </td>
                        <td style={{ padding: '14px', maxWidth: '250px' }}>
                          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1d4ed8', marginBottom: '4px' }}>
                            {cats.join(', ')}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {svcs.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: '11px',
                                  padding: '2px 7px',
                                  borderRadius: '999px',
                                  background: '#f1f5f9',
                                  color: '#334155',
                                  fontWeight: 600
                                }}
                              >
                                {s}
                              </span>
                            ))}
                            {svcs.length > 3 && (
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                                +{svcs.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{req.budget_range || '—'}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                            {req.preferred_start_date || 'Flexible'}
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: (req.assigned_team_member || req.assigned_to) ? '#0f172a' : '#94a3b8'
                          }}>
                            {req.assigned_team_member || req.assigned_to || 'Unassigned'}
                          </span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          {renderStatusBadge(req.status)}
                        </td>
                        <td style={{ padding: '14px', fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          <div>{(req.submission_date || req.created_at) ? new Date(req.submission_date || req.created_at).toLocaleDateString() : '—'}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Upd: {req.updated_at ? new Date(req.updated_at).toLocaleDateString() : '—'}
                          </div>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenProjectDetail(req.request_id);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#0f172a',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={13} /> Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* SECTION B: CONSULTATION REQUESTS TABLE */
          consultationRequests.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center' }}>
              <PhoneCall size={38} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                No Consultation Requests Found
              </h4>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                Consultation requests from "Talk to Our Team" appear here with slot availability and appointment confirmation controls.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '13px 14px' }}>Request ID</th>
                    <th style={{ padding: '13px 14px' }}>Customer & Company</th>
                    <th style={{ padding: '13px 14px' }}>Contact & Country</th>
                    <th style={{ padding: '13px 14px' }}>Contact Method</th>
                    <th style={{ padding: '13px 14px' }}>Preferred / Confirmed Slot</th>
                    <th style={{ padding: '13px 14px' }}>Selected Services</th>
                    <th style={{ padding: '13px 14px' }}>Project Summary</th>
                    <th style={{ padding: '13px 14px' }}>Assigned To</th>
                    <th style={{ padding: '13px 14px' }}>Status</th>
                    <th style={{ padding: '13px 14px' }}>Submitted</th>
                    <th style={{ padding: '13px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {consultationRequests.map((c) => {
                    const svcs = Array.isArray(c.selected_services) ? c.selected_services : [];
                    return (
                      <tr
                        key={c.request_id}
                        style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                        onClick={() => handleOpenConsultDetail(c.request_id)}
                      >
                        <td style={{ padding: '14px', fontWeight: 800, color: '#0891b2', whiteSpace: 'nowrap' }}>
                          <div>{c.request_id}</div>
                          {c.linked_project_request_id && (
                            <div style={{ fontSize: '11px', color: '#2563eb' }}>
                              Linked: {c.linked_project_request_id}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.customer_name || c.full_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {c.company_name && c.company_name !== 'Individual / Personal' ? c.company_name : 'Individual Client'}
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ color: '#0f172a' }}>{c.business_email}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{c.phone_number || c.phone} · {c.country}</div>
                        </td>
                        <td style={{ padding: '14px', fontWeight: 600, color: '#334155' }}>
                          {c.preferred_contact_method}
                        </td>
                        <td style={{ padding: '14px' }}>
                          {c.confirmed_date ? (
                            <div>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', display: 'block' }}>
                                Confirmed: {c.confirmed_date}
                              </span>
                              <span style={{ fontSize: '11.5px', color: '#334155' }}>{c.confirmed_time}</span>
                            </div>
                          ) : (
                            <div>
                              <span style={{ fontSize: '12px', color: '#0f172a' }}>
                                {c.preferred_date || 'Flexible Date'}
                              </span>
                              <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block' }}>
                                {c.preferred_time || 'Flexible Time'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px', maxWidth: '220px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {svcs.slice(0, 2).map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: '11px',
                                  padding: '2px 7px',
                                  borderRadius: '999px',
                                  background: '#f1f5f9',
                                  color: '#334155',
                                  fontWeight: 600
                                }}
                              >
                                {s}
                              </span>
                            ))}
                            {svcs.length > 2 && (
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                                +{svcs.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px', maxWidth: '220px' }}>
                          <div style={{ fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.project_summary}
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: (c.assigned_team_member || c.assigned_to) ? '#0f172a' : '#94a3b8' }}>
                            {c.assigned_team_member || c.assigned_to || 'Unassigned'}
                          </span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          {renderStatusBadge(c.status)}
                        </td>
                        <td style={{ padding: '14px', fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {(c.submission_date || c.created_at) ? new Date(c.submission_date || c.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenConsultDetail(c.request_id);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#0f172a',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={13} /> Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: '13px'
          }}>
            <span>
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} total records)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  cursor: page >= pagination.pages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL 1: PROJECT REQUEST FULL DETAILS & MANAGEMENT
          ===================================================================== */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="oxoo-modal-backdrop"
            onClick={() => setSelectedProject(null)}
            style={{ zIndex: 1200 }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="oxoo-modal-window"
              style={{ maxWidth: '880px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="oxoo-modal-header" style={{ position: 'sticky', top: 0, background: '#ffffff', zIndex: 10 }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb' }}>
                    {selectedProject.request_id}
                  </span>
                  <h3 className="oxoo-modal-title" style={{ margin: '2px 0 0' }}>
                    {selectedProject.project_title}
                  </h3>
                </div>
                <button type="button" className="oxoo-modal-close-btn" onClick={() => setSelectedProject(null)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Customer & Project Metadata Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px',
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px'
                }}>
                  <div><strong>Customer Name:</strong> {selectedProject.customer_name || selectedProject.full_name}</div>
                  <div><strong>Company:</strong> {selectedProject.company_name}</div>
                  <div><strong>Email:</strong> {selectedProject.business_email}</div>
                  <div><strong>Phone:</strong> {selectedProject.phone_number || selectedProject.phone}</div>
                  <div><strong>Country:</strong> {selectedProject.country}</div>
                  <div><strong>Website:</strong> {selectedProject.company_website || '—'}</div>
                  <div><strong>Industry:</strong> {selectedProject.industry || '—'}</div>
                  <div><strong>Company Size:</strong> {selectedProject.company_size || '—'}</div>
                  <div><strong>Budget Range:</strong> {selectedProject.budget_range || '—'}</div>
                  <div><strong>Start Date:</strong> {selectedProject.preferred_start_date || 'Flexible'}</div>
                  <div><strong>Completion Date:</strong> {selectedProject.expected_completion_date || 'Flexible'}</div>
                  <div><strong>Submitted:</strong> {(selectedProject.submission_date || selectedProject.created_at) ? new Date(selectedProject.submission_date || selectedProject.created_at).toLocaleString() : '—'}</div>
                </div>

                {/* Selected Categories & Services */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    Selected Categories: {(selectedProject.selected_categories || []).join(', ')}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(selectedProject.selected_services || []).map((svc) => (
                      <span
                        key={svc}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#1e40af',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Full Project Requirements */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <strong>Project Description:</strong>
                    <p style={{ margin: '4px 0 0', color: '#334155', whiteSpace: 'pre-wrap' }}>{selectedProject.project_description}</p>
                  </div>
                  {selectedProject.business_problem && (
                    <div><strong>Business Problem to Solve:</strong> {selectedProject.business_problem}</div>
                  )}
                  {selectedProject.required_features && (
                    <div><strong>Required Features:</strong> {selectedProject.required_features}</div>
                  )}
                  {selectedProject.target_audience && (
                    <div><strong>Target Audience:</strong> {selectedProject.target_audience}</div>
                  )}
                  {selectedProject.preferred_technology && (
                    <div><strong>Preferred Technology:</strong> {selectedProject.preferred_technology}</div>
                  )}
                  {selectedProject.existing_url && (
                    <div><strong>Existing URL:</strong> {selectedProject.existing_url}</div>
                  )}
                  {selectedProject.reference_websites && (
                    <div><strong>Reference Websites:</strong> {selectedProject.reference_websites}</div>
                  )}
                  {selectedProject.design_preferences && (
                    <div><strong>Design Preferences:</strong> {selectedProject.design_preferences}</div>
                  )}
                  {selectedProject.expected_deliverables && (
                    <div><strong>Expected Deliverables:</strong> {selectedProject.expected_deliverables}</div>
                  )}
                  {selectedProject.additional_requirements && (
                    <div><strong>Additional Requirements:</strong> {selectedProject.additional_requirements}</div>
                  )}
                </div>

                {/* Reference Attachments */}
                {Array.isArray(selectedProject.attachments) && selectedProject.attachments.length > 0 && (
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                      Uploaded Reference Attachments ({selectedProject.attachments.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedProject.attachments.map((att) => (
                        <div
                          key={att.attachment_id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '13px'
                          }}
                        >
                          <span>
                            <strong>{att.file_name}</strong> ({(Number(att.file_size_bytes || 0) / 1024).toFixed(1)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment(att)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '7px',
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Download size={13} /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Workflow Controls: Status, Assignment, Internal Note, Customer Email */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px' }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    Admin Actions & Status Management
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Project Status
                      </label>
                      <select
                        value={projectStatusEdit}
                        onChange={(e) => setProjectStatusEdit(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      >
                        {PROJECT_REQUEST_STATUSES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Assign to Team Member
                      </label>
                      <input
                        type="text"
                        list="oxoo-project-staff-list"
                        placeholder="Enter or select staff member name/email"
                        value={projectAssigneeEdit}
                        onChange={(e) => setProjectAssigneeEdit(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                      <datalist id="oxoo-project-staff-list">
                        {(summary.staffMembers || []).map((st) => (
                          <option key={st.email || st.name} value={st.name}>{st.role}</option>
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      Add Internal Note (Private — Never exposed publicly)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add internal review notes, technical sizing, or proposal status..."
                      value={projectNoteInput}
                      onChange={(e) => setProjectNoteInput(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={sendEmailCheckbox}
                        onChange={(e) => setSendEmailCheckbox(e.target.checked)}
                      />
                      <span>Send status update / request additional information email to customer ({selectedProject.business_email})</span>
                    </label>
                    {sendEmailCheckbox && (
                      <textarea
                        rows={2}
                        placeholder="Optional message or additional questions for the customer..."
                        value={customerEmailMsg}
                        onChange={(e) => setCustomerEmailMsg(e.target.value)}
                        style={{ width: '100%', marginTop: '8px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    )}
                  </div>

                  {/* Existing Internal Notes History */}
                  {Array.isArray(selectedProject.internal_notes) && selectedProject.internal_notes.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        Internal Notes History ({selectedProject.internal_notes.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                        {selectedProject.internal_notes.map((n, idx) => (
                          <div key={n.id || n.noteId || idx} style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>
                              {n.author} <span style={{ fontWeight: 400, color: '#64748b' }}>· {new Date(n.createdAt).toLocaleString()}</span>
                            </div>
                            <div style={{ color: '#334155', marginTop: '2px' }}>{n.note || n.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleCreateConsultationFromProject}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 14px',
                        borderRadius: '8px',
                        border: '1px solid #0891b2',
                        background: '#ecfeff',
                        color: '#0e7490',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <PhoneCall size={14} />
                      <span>Create Linked Consultation Request</span>
                    </button>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedProject(null)}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveProjectUpdate}
                        disabled={savingProject}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#2563eb',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {savingProject ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          MODAL 2: CONSULTATION REQUEST FULL DETAILS & APPOINTMENT SCHEDULING
          ===================================================================== */}
      <AnimatePresence>
        {selectedConsultation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="oxoo-modal-backdrop"
            onClick={() => setSelectedConsultation(null)}
            style={{ zIndex: 1200 }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="oxoo-modal-window"
              style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="oxoo-modal-header" style={{ position: 'sticky', top: 0, background: '#ffffff', zIndex: 10 }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0891b2' }}>
                    {selectedConsultation.request_id}
                  </span>
                  <h3 className="oxoo-modal-title" style={{ margin: '2px 0 0' }}>
                    Consultation with {selectedConsultation.customer_name || selectedConsultation.full_name} ({selectedConsultation.company_name})
                  </h3>
                </div>
                <button type="button" className="oxoo-modal-close-btn" onClick={() => setSelectedConsultation(null)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '12px',
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px'
                }}>
                  <div><strong>Customer:</strong> {selectedConsultation.customer_name || selectedConsultation.full_name}</div>
                  <div><strong>Company:</strong> {selectedConsultation.company_name}</div>
                  <div><strong>Email:</strong> {selectedConsultation.business_email}</div>
                  <div><strong>Phone:</strong> {selectedConsultation.phone_number || selectedConsultation.phone}</div>
                  <div><strong>Country:</strong> {selectedConsultation.country}</div>
                  <div><strong>Preferred Contact:</strong> {selectedConsultation.preferred_contact_method}</div>
                  <div><strong>Preferred Date:</strong> {selectedConsultation.preferred_date || 'Flexible'}</div>
                  <div><strong>Preferred Time:</strong> {selectedConsultation.preferred_time || 'Flexible'}</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', fontSize: '13.5px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>Selected Services:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {(selectedConsultation.selected_services || []).map((s) => (
                      <span key={s} style={{ padding: '4px 10px', borderRadius: '999px', background: '#ecfeff', color: '#0e7490', fontSize: '12px', fontWeight: 700 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Project Summary:</div>
                  <p style={{ margin: 0, color: '#334155', whiteSpace: 'pre-wrap' }}>{selectedConsultation.project_summary}</p>
                </div>

                {/* Appointment Management & Status Controls */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px' }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    Appointment Confirmation, Rescheduling & Status
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Status
                      </label>
                      <select
                        value={consultStatusEdit}
                        onChange={(e) => setConsultStatusEdit(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      >
                        {CONSULTATION_REQUEST_STATUSES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Assigned Specialist
                      </label>
                      <input
                        type="text"
                        placeholder="Specialist name/email"
                        value={consultAssigneeEdit}
                        onChange={(e) => setConsultAssigneeEdit(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Appointment Action
                      </label>
                      <select
                        value={appointmentAction}
                        onChange={(e) => setAppointmentAction(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      >
                        <option value="">No Appointment Action</option>
                        <option value="confirm">Confirm Appointment</option>
                        <option value="reschedule">Reschedule Appointment</option>
                        <option value="cancel">Cancel Appointment</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Confirmed / Rescheduled Date
                      </label>
                      <input
                        type="date"
                        value={confirmedDateInput}
                        onChange={(e) => setConfirmedDateInput(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Confirmed / Rescheduled Time Slot
                      </label>
                      <select
                        value={confirmedTimeInput}
                        onChange={(e) => setConfirmedTimeInput(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      >
                        <option value="">Select Time Slot</option>
                        {CONSULTATION_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Meeting Link (Google Meet / Zoom / Teams)
                      </label>
                      <input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        value={meetingLinkInput}
                        onChange={(e) => setMeetingLinkInput(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Internal Note
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add internal consultation notes..."
                      value={consultNoteInput}
                      onChange={(e) => setConsultNoteInput(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  {/* Appointment History Log */}
                  {Array.isArray(selectedConsultation.appointment_history) && selectedConsultation.appointment_history.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        Appointment History ({selectedConsultation.appointment_history.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '130px', overflowY: 'auto' }}>
                        {selectedConsultation.appointment_history.map((h) => (
                          <div key={h.id} style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                            <strong>{h.action}</strong> ({h.date || 'No date'} · {h.time || 'No time'}) — by {h.actor} on {new Date(h.timestamp).toLocaleString()}
                            {h.note && <div style={{ color: '#475569', marginTop: '2px' }}>{h.note}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedConsultation(null)}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveConsultationUpdate}
                      disabled={savingConsult}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#0891b2',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {savingConsult ? 'Saving...' : 'Save Consultation Update'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
