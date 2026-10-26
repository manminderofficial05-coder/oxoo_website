import React, { useState, useEffect } from 'react';
import {
  HelpCircle, Search, Filter, MessageSquare, Lock,
  CheckCircle2, Clock, AlertCircle, X, Send, Eye, User,
  Building2, ExternalLink, RefreshCw, Paperclip, ChevronRight,
  AlertTriangle, RotateCcw, Check, Calendar, ArrowRight, Shield
} from 'lucide-react';
import {
  getTicketsSummary, getAdminTickets, getAdminTicket,
  sendTicketReply, updateTicketStatus, assignTicket
} from '../../api';

export default function SupportTicketsModule({ showToast, logAuditEvent }) {
  // 1. Summary Counts from real DB
  const [summary, setSummary] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    urgentTickets: 0,
    closedTickets: 0
  });

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // 2. Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [agentFilter, setAgentFilter] = useState('All Agents');

  // 3. Details Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('conversation'); // 'conversation' | 'overview' | 'notes' | 'activity'
  const [replyText, setReplyText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isSendingNote, setIsSendingNote] = useState(false);

  // 4. Status Workflow Modals
  const [solveModalOpen, setSolveModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [pendingType, setPendingType] = useState('Pending Customer');
  const [pendingReason, setPendingReason] = useState('');
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
      const [sumRes, tickRes] = await Promise.all([
        getTicketsSummary(),
        getAdminTickets({
          search,
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
          assigned_to: agentFilter === 'All Agents' ? '' : agentFilter,
          page,
          limit: 10
        })
      ]);

      if (sumRes && sumRes.summary) {
        setSummary(sumRes.summary);
      }
      if (tickRes && tickRes.tickets) {
        setTickets(tickRes.tickets);
        if (tickRes.pagination) setPagination(tickRes.pagination);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      if (showToast) showToast('Failed to load tickets data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, [search, statusFilter, priorityFilter, categoryFilter, agentFilter]);

  const handleOpenTicket = async (t) => {
    try {
      const res = await getAdminTicket(t.ticket_id || t.ticket_number || t.id);
      setSelectedTicket(res.ticket || t);
      setShowDetailsModal(true);
      setActiveDetailTab('conversation');
    } catch {
      setSelectedTicket(t);
      setShowDetailsModal(true);
      setActiveDetailTab('conversation');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setIsSendingReply(true);
    try {
      const ticketId = selectedTicket.ticket_id || selectedTicket.ticket_number;
      const res = await sendTicketReply(ticketId, {
        message: replyText.trim(),
        sender: 'Support Team (Manminder Singh)',
        role: 'staff',
        is_internal: false
      });

      if (res && res.success) {
        if (showToast) showToast('Reply sent to customer.');
        if (logAuditEvent) logAuditEvent('Ticket Reply Sent', ticketId);
        setReplyText('');
        if (res.ticket) setSelectedTicket(res.ticket);
        fetchTickets(pagination.page);
      } else {
        if (showToast) showToast(res.message || 'Failed to send reply.');
      }
    } catch (e) {
      if (showToast) showToast(e.message || 'Error sending reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleSendInternalNote = async (e) => {
    e.preventDefault();
    if (!internalNoteText.trim() || !selectedTicket) return;

    setIsSendingNote(true);
    try {
      const ticketId = selectedTicket.ticket_id || selectedTicket.ticket_number;
      const res = await sendTicketReply(ticketId, {
        message: internalNoteText.trim(),
        sender: 'Manminder Singh (Staff Note)',
        role: 'staff',
        is_internal: true
      });

      if (res && res.success) {
        if (showToast) showToast('Internal note saved privately.');
        if (logAuditEvent) logAuditEvent('Ticket Internal Note Added', ticketId);
        setInternalNoteText('');
        if (res.ticket) setSelectedTicket(res.ticket);
        fetchTickets(pagination.page);
      } else {
        if (showToast) showToast(res.message || 'Failed to add internal note.');
      }
    } catch (e) {
      if (showToast) showToast(e.message || 'Error adding note.');
    } finally {
      setIsSendingNote(false);
    }
  };

  const handleWorkflowAction = async (status, payload = {}) => {
    if (!selectedTicket) return;
    const ticketId = selectedTicket.ticket_id || selectedTicket.ticket_number;
    try {
      const res = await updateTicketStatus(ticketId, status, payload);
      if (res && res.success) {
        if (showToast) showToast(`Ticket status updated to ${status}.`);
        if (logAuditEvent) logAuditEvent('Ticket Status Updated', `${ticketId} -> ${status}`);
        if (res.ticket) setSelectedTicket(res.ticket);
        fetchTickets(pagination.page);
      } else {
        if (showToast) showToast(res.message || 'Failed to update status.');
      }
    } catch (e) {
      if (showToast) showToast(e.message || 'Error updating status.');
    }
  };

  const handleAssignAgent = async (agentName) => {
    if (!selectedTicket) return;
    const ticketId = selectedTicket.ticket_id || selectedTicket.ticket_number;
    try {
      const res = await assignTicket(ticketId, agentName);
      if (res && res.success) {
        if (showToast) showToast(`Ticket assigned to ${agentName}.`);
        if (logAuditEvent) logAuditEvent('Ticket Reassigned', `${ticketId} to ${agentName}`);
        setSelectedTicket(prev => ({ ...prev, assigned_to: agentName }));
        fetchTickets(pagination.page);
      }
    } catch (e) {
      if (showToast) showToast('Error reassigning ticket.');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All Statuses');
    setPriorityFilter('All Priorities');
    setCategoryFilter('All Categories');
    setAgentFilter('All Agents');
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent': return 'oxoo-priority-pill urgent';
      case 'High': return 'oxoo-priority-pill high';
      case 'Medium': return 'oxoo-priority-pill medium';
      default: return 'oxoo-priority-pill low';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Open': return 'oxoo-status-tag active';
      case 'In Progress': return 'oxoo-status-tag warning';
      case 'Pending Customer':
      case 'Pending Internal Team': return 'oxoo-status-tag pending';
      case 'Resolved': return 'oxoo-status-tag success';
      case 'Closed': return 'oxoo-status-tag inactive';
      default: return 'oxoo-status-tag active';
    }
  };

  // Filter messages for timeline vs internal notes
  const customerVisibleMessages = (selectedTicket?.replies || []).filter(r => !r.is_internal);
  const internalNotesList = (selectedTicket?.replies || []).filter(r => r.is_internal);

  return (
    <div className="oxoo-section-card" style={{ padding: '24px' }}>
      {/* 1. Header (Requirement 1.1: No Admin Add Ticket button) */}
      <div className="oxoo-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HelpCircle size={22} />
          </div>
          <div>
            <h2 className="oxoo-section-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              Support Tickets
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
              Real-time customer support queue, SLA management, and agent workflow.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="oxoo-outline-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}
            onClick={() => fetchTickets(pagination.page)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'oxoo-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* 2. 6 Real Summary Cards (Requirement 1.3) */}
      <div className="oxoo-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Tickets</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{summary.totalTickets}</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #fee2e2', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>Open</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>{summary.openTickets}</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #ffedd5', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#ea580c' }}>In Progress</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c', marginTop: '6px' }}>{summary.inProgressTickets}</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #fef3c7', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#d97706' }}>Pending</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>{summary.pendingTickets}</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #dcfce7', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>Resolved</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', marginTop: '6px' }}>{summary.resolvedTickets}</div>
        </div>

        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #fee2e2', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#b91c1c' }}>Urgent</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#b91c1c', marginTop: '6px' }}>{summary.urgentTickets}</div>
        </div>
      </div>

      {/* 3. Functional Filter Bar */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by ID, customer name, email, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="oxoo-form-input"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="oxoo-form-input"
            style={{ height: '38px', fontSize: '13px' }}
          >
            <option>All Statuses</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Pending Customer</option>
            <option>Pending Internal Team</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="oxoo-form-input"
            style={{ height: '38px', fontSize: '13px' }}
          >
            <option>All Priorities</option>
            <option>Urgent</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="oxoo-form-input"
            style={{ height: '38px', fontSize: '13px' }}
          >
            <option>All Categories</option>
            <option>Technical</option>
            <option>Billing</option>
            <option>HRMS</option>
            <option>Finance</option>
            <option>Marketing</option>
            <option>Websites</option>
            <option>Access</option>
            <option>General</option>
          </select>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="oxoo-form-input"
            style={{ height: '38px', fontSize: '13px' }}
          >
            <option>All Agents</option>
            <option>Manminder Singh</option>
            <option>Priya Mehta</option>
            <option>Rohit Sharma</option>
            <option>Deepak Joshi</option>
            <option>Sonia Roy</option>
            <option>Rajesh Iyer</option>
            <option>Sneha Nair</option>
          </select>

          <button
            type="button"
            className="oxoo-outline-btn"
            style={{ height: '38px', fontSize: '12px', padding: '0 14px' }}
            onClick={handleClearFilters}
          >
            Reset
          </button>
        </div>
      </div>

      {/* 4. Support Tickets Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <table className="oxoo-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <RefreshCw size={20} className="oxoo-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                  Loading support tickets from database...
                </td>
              </tr>
            ) : tickets.length > 0 ? (
              tickets.map((t) => (
                <tr key={t.id || t.ticket_id} style={{ cursor: 'pointer' }} onClick={() => handleOpenTicket(t)}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0284c7' }}>
                    {t.ticket_id || t.ticket_number}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.company_name || 'Individual Customer'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{t.contact_email || t.user_email || t.user_name}</div>
                  </td>
                  <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{t.subject}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.description?.slice(0, 50)}...</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 600, background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                      {t.category}
                    </span>
                  </td>
                  <td>
                    <span className={getPriorityBadgeClass(t.priority)}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(t.assigned_to || 'PM').slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '12px', color: '#334155' }}>{t.assigned_to || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(t.status)}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(t.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(t.updated_at || t.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTicket(t);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                  No support tickets match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Showing {tickets.length} of {pagination.total} tickets (Page {pagination.page} of {pagination.totalPages || 1})
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="oxoo-outline-btn"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            disabled={pagination.page <= 1}
            onClick={() => fetchTickets(pagination.page - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="oxoo-outline-btn"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchTickets(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          6. FULL TICKET DETAILS WORKSPACE MODAL (Requirement 1.5)
          ------------------------------------------------------------- */}
      {showDetailsModal && selectedTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '1100px', height: '90vh', background: '#fff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '4px 10px', borderRadius: '6px', fontFamily: 'monospace' }}>
                  {selectedTicket.ticket_id || selectedTicket.ticket_number}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    {selectedTicket.subject}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span className={getStatusBadgeClass(selectedTicket.status)}>{selectedTicket.status}</span>
                    <span className={getPriorityBadgeClass(selectedTicket.priority)}>{selectedTicket.priority}</span>
                    <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {selectedTicket.category}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body - 2 Columns (Left: Timeline & tabs, Right: Actions & Context) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', flex: 1, overflow: 'hidden' }}>
              
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0', overflow: 'hidden' }}>
                
                {/* Workspace Subtabs */}
                <div className="oxoo-tab-pill-bar" style={{ margin: '12px 20px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <button
                    type="button"
                    className={`oxoo-tab-pill ${activeDetailTab === 'conversation' ? 'active' : ''}`}
                    onClick={() => setActiveDetailTab('conversation')}
                  >
                    Customer Conversation ({customerVisibleMessages.length})
                  </button>
                  <button
                    type="button"
                    className={`oxoo-tab-pill ${activeDetailTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveDetailTab('overview')}
                  >
                    Ticket Overview
                  </button>
                  <button
                    type="button"
                    className={`oxoo-tab-pill ${activeDetailTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveDetailTab('notes')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Lock size={12} /> Internal Notes ({internalNotesList.length})
                  </button>
                  <button
                    type="button"
                    className={`oxoo-tab-pill ${activeDetailTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveDetailTab('activity')}
                  >
                    Audit & Activity
                  </button>
                </div>

                {/* Subtab Contents */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                  
                  {/* Tab 1: Customer Conversation */}
                  {activeDetailTab === 'conversation' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Original customer description ticket opener */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {(selectedTicket.company_name || 'C').slice(0, 1)}
                            </div>
                            <div>
                              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{selectedTicket.company_name}</strong>
                              <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>({selectedTicket.contact_email || 'Customer'})</span>
                            </div>
                          </div>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {new Date(selectedTicket.created_at || Date.now()).toLocaleString('en-GB')}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                          {selectedTicket.description}
                        </div>
                      </div>

                      {/* Reply Messages */}
                      {customerVisibleMessages.map((msg, i) => (
                        <div
                          key={msg.id || i}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignSelf: msg.role === 'customer' ? 'flex-start' : 'flex-end',
                            maxWidth: '85%',
                            background: msg.role === 'customer' ? '#f1f5f9' : '#e0f2fe',
                            border: `1px solid ${msg.role === 'customer' ? '#e2e8f0' : '#bae6fd'}`,
                            borderRadius: '12px',
                            padding: '14px 16px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                            <strong style={{ fontSize: '12px', color: msg.role === 'customer' ? '#0f172a' : '#0369a1' }}>
                              {msg.sender || (msg.role === 'customer' ? 'Customer' : 'Support Agent')}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{msg.timestamp || 'Just now'}</span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                            {msg.message}
                          </div>
                        </div>
                      ))}

                      {customerVisibleMessages.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
                          No agent replies sent yet. Use the composer below to answer the customer.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Ticket Overview */}
                  {activeDetailTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div><strong>Ticket Reference:</strong> {selectedTicket.ticket_id || selectedTicket.ticket_number}</div>
                        <div><strong>Category:</strong> {selectedTicket.category}</div>
                        <div><strong>Priority:</strong> {selectedTicket.priority}</div>
                        <div><strong>Status:</strong> {selectedTicket.status}</div>
                        <div><strong>Created:</strong> {new Date(selectedTicket.created_at || Date.now()).toLocaleString('en-GB')}</div>
                        <div><strong>Last Updated:</strong> {new Date(selectedTicket.updated_at || Date.now()).toLocaleString('en-GB')}</div>
                        <div><strong>Assigned Support Agent:</strong> {selectedTicket.assigned_to || 'Unassigned'}</div>
                        <div><strong>Related App:</strong> {selectedTicket.related_app || 'OXOO Business Suite'}</div>
                      </div>

                      {selectedTicket.resolution_notes && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px' }}>
                          <strong style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={16} /> Official Resolution Note:
                          </strong>
                          <p style={{ margin: '6px 0 0', color: '#15803d', fontSize: '13px' }}>{selectedTicket.resolution_notes}</p>
                          <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>
                            Resolved by {selectedTicket.resolved_by || 'Support Staff'} on {new Date(selectedTicket.resolved_at || Date.now()).toLocaleString('en-GB')}
                          </div>
                        </div>
                      )}

                      <div><strong>Customer Initial Description:</strong></div>
                      <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', lineHeight: '1.6' }}>
                        {selectedTicket.description}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Internal Notes (Strictly Private) */}
                  {activeDetailTab === 'notes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#92400e' }}>
                        <Lock size={14} />
                        <strong>Staff Only:</strong> Internal notes are strictly confidential and will NEVER be visible to the customer.
                      </div>

                      {internalNotesList.map((note, i) => (
                        <div key={note.id || i} style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px', padding: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <strong style={{ fontSize: '12px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Lock size={12} /> {note.sender}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#b45309' }}>{note.timestamp || 'Recorded'}</span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.5' }}>
                            {note.message}
                          </div>
                        </div>
                      ))}

                      {internalNotesList.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
                          No internal notes recorded yet for this ticket.
                        </div>
                      )}

                      {/* Internal Note Composer */}
                      <form onSubmit={handleSendInternalNote} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                        <textarea
                          rows={3}
                          placeholder="Add private staff note (e.g. escalated to engineering, verified DB config...)"
                          value={internalNoteText}
                          onChange={(e) => setInternalNoteText(e.target.value)}
                          className="oxoo-form-input"
                          style={{ marginBottom: '10px', fontSize: '13px' }}
                        />
                        <button
                          type="submit"
                          disabled={isSendingNote || !internalNoteText.trim()}
                          className="oxoo-outline-btn"
                          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: '#fef3c7', borderColor: '#fde68a', color: '#92400e', fontWeight: 700 }}
                        >
                          <Lock size={13} /> Save Private Internal Note
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Tab 4: Activity History */}
                  {activeDetailTab === 'activity' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                      <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <div><strong>Ticket Created</strong> by {selectedTicket.company_name}</div>
                        <span style={{ color: '#94a3b8' }}>{new Date(selectedTicket.created_at || Date.now()).toLocaleString('en-GB')}</span>
                      </div>
                      <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <div><strong>Assigned To Agent</strong>: {selectedTicket.assigned_to || 'Priya Mehta'}</div>
                        <span style={{ color: '#94a3b8' }}>Auto-assigned</span>
                      </div>
                      {selectedTicket.status === 'Resolved' && (
                        <div style={{ padding: '10px 14px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <div><strong>Status Changed to Resolved</strong> by {selectedTicket.resolved_by || 'Support Staff'}</div>
                          <span style={{ color: '#166534' }}>{new Date(selectedTicket.resolved_at || Date.now()).toLocaleString('en-GB')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Reply Box for Customer Conversation */}
                {activeDetailTab === 'conversation' && (
                  <div style={{ borderTop: '1px solid #e2e8f0', padding: '14px 20px', background: '#f8fafc' }}>
                    <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '10px' }}>
                      <textarea
                        rows={2}
                        placeholder="Write a reply to the customer (email notification will be dispatched)..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="oxoo-form-input"
                        style={{ flex: 1, fontSize: '13px' }}
                      />
                      <button
                        type="submit"
                        disabled={isSendingReply || !replyText.trim()}
                        className="oxoo-upgrade-btn"
                        style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}
                      >
                        <Send size={14} /> Send Reply
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Right Column: Workflow Actions & Customer Context */}
              <div style={{ background: '#f8fafc', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Status Actions (Requirement 1.4) */}
                <div>
                  <h5 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Status Workflow Actions
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    
                    {/* Start Working */}
                    <button
                      type="button"
                      onClick={() => handleWorkflowAction('In Progress')}
                      disabled={selectedTicket.status === 'In Progress'}
                      className="oxoo-outline-btn"
                      style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', background: selectedTicket.status === 'In Progress' ? '#e2e8f0' : '#fff' }}
                    >
                      ▶ Start Working (In Progress)
                    </button>

                    {/* Mark Pending */}
                    <button
                      type="button"
                      onClick={() => setPendingModalOpen(true)}
                      className="oxoo-outline-btn"
                      style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      ⏳ Mark Pending...
                    </button>

                    {/* Mark as Solved */}
                    <button
                      type="button"
                      onClick={() => setSolveModalOpen(true)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: '1px solid #86efac',
                        background: '#dcfce7',
                        color: '#166534',
                        fontWeight: 700,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      ✓ Mark as Solved (Resolved)
                    </button>

                    {/* Reopen Ticket */}
                    {(selectedTicket.status === 'Resolved' || selectedTicket.status === 'Closed') && (
                      <button
                        type="button"
                        onClick={() => setReopenModalOpen(true)}
                        className="oxoo-outline-btn"
                        style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#f59e0b', color: '#b45309' }}
                      >
                        <RotateCcw size={14} /> Reopen Ticket...
                      </button>
                    )}

                    {/* Close Ticket */}
                    {selectedTicket.status !== 'Closed' && (
                      <button
                        type="button"
                        onClick={() => setCloseConfirmOpen(true)}
                        className="oxoo-outline-btn"
                        style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'left', color: '#64748b' }}
                      >
                        ✕ Close Ticket
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Customer Context */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <h5 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Customer Context
                  </h5>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{selectedTicket.company_name || 'Individual Customer'}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedTicket.customer_id || 'CST-0001'}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Contact:</span> {selectedTicket.contact_name || selectedTicket.user_name || 'Rahul Verma'}
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Email:</span> {selectedTicket.contact_email || selectedTicket.user_email || 'customer@oxoo.ai'}
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Active Plan:</span> <span style={{ fontWeight: 700, color: '#0284c7' }}>Enterprise Plan</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>SLA Level:</span> <span style={{ fontWeight: 600, color: '#16a34a' }}>24x7 Priority Support</span>
                    </div>
                  </div>
                </div>

                {/* 3. Assigned Support Agent */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <h5 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Assigned Agent
                  </h5>
                  <select
                    value={selectedTicket.assigned_to || 'Manminder Singh'}
                    onChange={(e) => handleAssignAgent(e.target.value)}
                    className="oxoo-form-input"
                    style={{ fontSize: '13px' }}
                  >
                    <option>Manminder Singh</option>
                    <option>Priya Mehta</option>
                    <option>Rohit Sharma</option>
                    <option>Deepak Joshi</option>
                    <option>Sonia Roy</option>
                    <option>Rajesh Iyer</option>
                    <option>Sneha Nair</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          STATUS WORKFLOW MODALS
          ------------------------------------------------------------- */}

      {/* 1. Mark as Solved Modal (Resolution note required) */}
      {solveModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '480px', background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Mark Ticket as Solved
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Please provide a resolution note summarizing what was fixed. This will be recorded and sent to the customer.
            </p>
            <div className="oxoo-form-group" style={{ marginBottom: '16px' }}>
              <label className="oxoo-form-label">Resolution Details (Required)</label>
              <textarea
                rows={4}
                className="oxoo-form-input"
                placeholder="e.g., Issue resolved after updating webhook secret and triggering delivery test. Confirmed with customer."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="oxoo-outline-btn"
                onClick={() => setSolveModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="oxoo-upgrade-btn"
                disabled={!resolutionNote.trim()}
                onClick={() => {
                  handleWorkflowAction('Resolved', { resolution_notes: resolutionNote.trim(), note: resolutionNote.trim() });
                  setSolveModalOpen(false);
                  setResolutionNote('');
                }}
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Mark Pending Modal (Choose Customer vs Internal Team + reason) */}
      {pendingModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '480px', background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Mark Ticket Pending
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Select whether this ticket is awaiting customer input or internal engineering action.
            </p>
            <div className="oxoo-form-group" style={{ marginBottom: '12px' }}>
              <label className="oxoo-form-label">Pending State</label>
              <select
                className="oxoo-form-input"
                value={pendingType}
                onChange={(e) => setPendingType(e.target.value)}
              >
                <option value="Pending Customer">Pending Customer (Waiting for customer reply/logs)</option>
                <option value="Pending Internal Team">Pending Internal Team (Waiting for engineering/product fix)</option>
              </select>
            </div>
            <div className="oxoo-form-group" style={{ marginBottom: '16px' }}>
              <label className="oxoo-form-label">Follow-up Note (Optional)</label>
              <textarea
                rows={3}
                className="oxoo-form-input"
                placeholder="Reason or expected next step..."
                value={pendingReason}
                onChange={(e) => setPendingReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="oxoo-outline-btn"
                onClick={() => setPendingModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="oxoo-upgrade-btn"
                onClick={() => {
                  handleWorkflowAction(pendingType, { note: pendingReason });
                  setPendingModalOpen(false);
                  setPendingReason('');
                }}
              >
                Set Pending
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Reopen Ticket Modal */}
      {reopenModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '480px', background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Reopen Support Ticket
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Record the reason why this ticket is being reopened.
            </p>
            <div className="oxoo-form-group" style={{ marginBottom: '16px' }}>
              <label className="oxoo-form-label">Reopen Reason (Required)</label>
              <textarea
                rows={3}
                className="oxoo-form-input"
                placeholder="e.g., Customer reported that the same API error recurred after server reboot."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="oxoo-outline-btn"
                onClick={() => setReopenModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="oxoo-upgrade-btn"
                disabled={!reopenReason.trim()}
                onClick={() => {
                  handleWorkflowAction('In Progress', { reason: reopenReason, note: `Ticket Reopened: ${reopenReason}` });
                  setReopenModalOpen(false);
                  setReopenReason('');
                }}
              >
                Reopen Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Close Confirmation Modal */}
      {closeConfirmOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '440px', background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Close Ticket
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
              Are you sure you want to permanently close ticket <strong>{selectedTicket.ticket_id || selectedTicket.ticket_number}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="oxoo-outline-btn"
                onClick={() => setCloseConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="oxoo-upgrade-btn"
                style={{ background: '#475569' }}
                onClick={() => {
                  handleWorkflowAction('Closed');
                  setCloseConfirmOpen(false);
                }}
              >
                Confirm Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
