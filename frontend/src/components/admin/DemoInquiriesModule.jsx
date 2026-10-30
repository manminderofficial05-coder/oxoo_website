import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Search, Filter, RefreshCw, Mail, Phone, Calendar,
  CheckCircle2, Clock, MessageSquare, Building2, User, Globe,
  ArrowUpRight, Download, Eye, Trash2, Check, X, AlertCircle,
  Sparkles, ExternalLink, ChevronRight, Copy, Shield, FileText,
  UserCheck, Send, MessageCircle
} from 'lucide-react';
import {
  getAdminInquiriesSummary, getAdminInquiries, getAdminInquiry,
  updateAdminInquiry, addAdminInquiryNote, deleteAdminInquiry
} from '../../api';

export default function DemoInquiriesModule({ showToast, logAuditEvent }) {
  const [inquiries, setInquiries] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal_sent: 0,
    converted: 0,
    closed: 0,
    byCategory: {}
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });

  // Detail Drawer
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [assignedOwnerInput, setAssignedOwnerInput] = useState('');

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.all([
        getAdminInquiriesSummary(),
        getAdminInquiries({
          search,
          category: categoryFilter,
          status: statusFilter,
          page,
          limit: 15
        })
      ]);

      if (sumRes) setSummary(sumRes);
      if (listRes && Array.isArray(listRes.inquiries)) {
        setInquiries(listRes.inquiries);
        if (listRes.pagination) setPagination(listRes.pagination);
      }
      if (isRefresh && showToast) {
        showToast('Demo & Website inquiries refreshed from database.');
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      if (showToast) showToast('Failed to load inquiries.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, statusFilter, page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelectInquiry = async (inq) => {
    setSelectedInquiry(inq);
    setAssignedOwnerInput(inq.assigned_to || '');
    try {
      const full = await getAdminInquiry(inq.id);
      if (full) {
        setSelectedInquiry(full);
        setAssignedOwnerInput(full.assigned_to || '');
      }
    } catch (e) {
      console.error('Failed to fetch full inquiry details:', e);
    }
  };

  const handleStatusChange = async (inquiryId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updateAdminInquiry(inquiryId, { status: newStatus });
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: newStatus } : i));
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(prev => ({
          ...prev,
          status: newStatus,
          follow_up_history: updated.inquiry?.follow_up_history || prev.follow_up_history
        }));
      }
      if (showToast) showToast(`Inquiry status updated to ${newStatus}`);
      if (logAuditEvent) logAuditEvent(`Inquiry ${inquiryId} Status -> ${newStatus}`, inquiryId);
      getAdminInquiriesSummary().then(s => s && setSummary(s));
    } catch (err) {
      if (showToast) showToast('Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignOwner = async (inquiryId) => {
    if (!assignedOwnerInput.trim()) return;
    try {
      const updated = await updateAdminInquiry(inquiryId, { assigned_to: assignedOwnerInput.trim() });
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, assigned_to: assignedOwnerInput.trim() } : i));
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(prev => ({
          ...prev,
          assigned_to: assignedOwnerInput.trim(),
          follow_up_history: updated.inquiry?.follow_up_history || prev.follow_up_history
        }));
      }
      if (showToast) showToast(`Assigned owner updated to ${assignedOwnerInput.trim()}`);
    } catch (err) {
      if (showToast) showToast('Failed to assign owner.');
    }
  };

  const handleAddInternalNote = async (inquiryId) => {
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      const updated = await addAdminInquiryNote(inquiryId, newNote.trim(), 'Super Administrator');
      if (updated && updated.inquiry) {
        setSelectedInquiry(updated.inquiry);
        setInquiries(prev => prev.map(i => i.id === inquiryId ? updated.inquiry : i));
      }
      setNewNote('');
      if (showToast) showToast('Internal note saved to inquiry log.');
    } catch (err) {
      if (showToast) showToast('Failed to save note.');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDelete = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this inquiry record?')) return;
    try {
      await deleteAdminInquiry(inquiryId);
      setInquiries(prev => prev.filter(i => i.id !== inquiryId));
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(null);
      }
      if (showToast) showToast('Inquiry deleted.');
      getAdminInquiriesSummary().then(s => s && setSummary(s));
    } catch (err) {
      if (showToast) showToast('Failed to delete inquiry.');
    }
  };

  const copyRef = (refText) => {
    navigator.clipboard.writeText(refText);
    if (showToast) showToast(`Copied ${refText} to clipboard!`);
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || 'New').toLowerCase();
    if (s === 'new') return 'status-pill-new';
    if (s === 'contacted') return 'status-pill-contacted';
    if (s === 'qualified') return 'status-pill-qualified';
    if (s === 'proposal sent') return 'status-pill-proposal';
    if (s === 'converted') return 'status-pill-converted';
    return 'status-pill-closed';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* -----------------------------------------------------------------
          1. HEADER & ACTIONS
          ----------------------------------------------------------------- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1.5px solid #bfdbfe',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)'
          }}>
            <Inbox size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '23px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Demo & Website Inquiries
              </h1>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                Inquiry Pipeline
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Dedicated sales inquiries for Websites & Apps, Marketplace Platform, and WhatsApp AI Chat demos.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* -----------------------------------------------------------------
          2. METRIC CARDS (4 Counters)
          ----------------------------------------------------------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        {/* Total Inquiries */}
        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Inquiries</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Inbox size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{summary.total}</div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>All non-payment sales leads</span>
        </div>

        {/* New / Action Required */}
        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>New / Unassigned</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>{summary.new}</div>
          <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>Requires initial response</span>
        </div>

        {/* In Progress & Qualified */}
        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Contacted & Qualified</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>
            {(summary.contacted || 0) + (summary.qualified || 0)}
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Active architectural discovery</span>
        </div>

        {/* Proposals & Converted */}
        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Proposal & Converted</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>
            {(summary.proposal_sent || 0) + (summary.converted || 0)}
          </div>
          <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Proposal delivered / ready</span>
        </div>
      </div>

      {/* -----------------------------------------------------------------
          3. FILTER BAR
          ----------------------------------------------------------------- */}
      <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', height: '40px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search reference (INQ-...), customer, company, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', color: '#0f172a' }}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Website & Apps', 'Marketplace', 'WhatsApp AI Chat'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setCategoryFilter(cat); setPage(1); }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: categoryFilter === cat ? 700 : 500,
                border: categoryFilter === cat ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: categoryFilter === cat ? '#eff6ff' : '#ffffff',
                color: categoryFilter === cat ? '#1d4ed8' : '#475569',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{
            height: '40px',
            padding: '0 12px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            fontSize: '12.5px',
            color: '#334155',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <option value="All">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal Sent">Proposal Sent</option>
          <option value="Converted">Converted</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* -----------------------------------------------------------------
          4. INQUIRIES LIST TABLE
          ----------------------------------------------------------------- */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Reference #</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Contact Person & Company</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Category / Product</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Plan</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Assigned To</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading inquiry records from PostgreSQL...
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8' }}>
                    No inquiries found matching your current filters.
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => {
                  const isStaging = (inq.notes || '').includes('[STAGING TEST]') || (inq.message || '').includes('[STAGING TEST]');
                  return (
                    <tr
                      key={inq.id}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                      onClick={() => handleSelectInquiry(inq)}
                    >
                      {/* Ref */}
                      <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', fontSize: '12px' }}>
                            {inq.inquiry_ref}
                          </span>
                          <button
                            type="button"
                            title="Copy reference code"
                            onClick={() => copyRef(inq.inquiry_ref)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        {isStaging && (
                          <span style={{ fontSize: '9.5px', background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                            STAGING
                          </span>
                        )}
                      </td>

                      {/* Contact & Company */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{inq.contact_person}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>{inq.company_name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{inq.email} · {inq.phone}</div>
                      </td>

                      {/* Category & Product */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: inq.category === 'WhatsApp AI Chat' ? '#dcfce7' : inq.category === 'Marketplace' ? '#fef3c7' : '#eff6ff',
                          color: inq.category === 'WhatsApp AI Chat' ? '#15803d' : inq.category === 'Marketplace' ? '#b45309' : '#1d4ed8'
                        }}>
                          {inq.category}
                        </span>
                        <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px' }}>
                          {inq.product_name}
                        </div>
                      </td>

                      {/* Selected Plan */}
                      <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600 }}>
                        {inq.selected_plan || 'Custom Solution'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                        <select
                          value={inq.status || 'New'}
                          onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            cursor: 'pointer',
                            color: inq.status === 'Converted' ? '#15803d' : inq.status === 'New' ? '#dc2626' : '#2563eb'
                          }}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Proposal Sent">Proposal Sent</option>
                          <option value="Converted">Converted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      {/* Assigned Owner */}
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {inq.assigned_to ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                            <UserCheck size={13} color="#2563eb" /> {inq.assigned_to}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '11.5px' }}>Unassigned</span>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                        {inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleSelectInquiry(inq)}
                            title="Open full inquiry details"
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#2563eb',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Review
                          </button>
                          <a
                            href={`mailto:${inq.email}?subject=PrimePro Solution Inquiry — ${inq.inquiry_ref}`}
                            title="Send email to customer"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#475569',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <Mail size={13} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid #f1f5f9', background: '#fafafa', fontSize: '12px', color: '#64748b' }}>
            <span>Showing page {pagination.page} of {pagination.pages} ({pagination.total} total inquiries)</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pagination.pages}
                onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: page >= pagination.pages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* -----------------------------------------------------------------
          5. INQUIRY DETAIL DRAWER / MODAL
          ----------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedInquiry && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'flex-end'
            }}
            onClick={() => setSelectedInquiry(null)}
          >
            <motion.div
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                width: '560px',
                maxWidth: '100%',
                background: '#ffffff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-10px 0 35px rgba(0,0,0,0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563eb', fontSize: '15px' }}>
                      {selectedInquiry.inquiry_ref}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyRef(selectedInquiry.inquiry_ref)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Received on {new Date(selectedInquiry.created_at).toLocaleString('en-GB')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Contact & Company Details Card */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Customer Contact & Organization
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    {selectedInquiry.contact_person}
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600, marginBottom: '10px' }}>
                    {selectedInquiry.company_name}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12.5px', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={13} color="#2563eb" />
                      <a href={`mailto:${selectedInquiry.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                        {selectedInquiry.email}
                      </a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={13} color="#059669" />
                      <a href={`tel:${selectedInquiry.phone}`} style={{ color: '#059669', textDecoration: 'none' }}>
                        {selectedInquiry.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Product & Scope Details */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Interested Digital Solution
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedInquiry.product_name}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8' }}>
                      {selectedInquiry.category}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#475569' }}>
                    Selected Plan: <strong>{selectedInquiry.selected_plan || 'Custom Solution Plan'}</strong>
                  </div>

                  {/* Requirements / Message */}
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      Client Requirements / Project Scope:
                    </span>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#1e293b', whiteHeight: 1.5, border: '1px solid #e2e8f0' }}>
                      {selectedInquiry.message || 'No additional specifications provided.'}
                    </div>
                  </div>
                </div>

                {/* Status & Owner Controls */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Workflow & Ownership
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        Inquiry Lifecycle Status
                      </label>
                      <select
                        value={selectedInquiry.status || 'New'}
                        onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                        disabled={isUpdatingStatus}
                        style={{
                          width: '100%',
                          height: '38px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontWeight: 700,
                          color: '#0f172a',
                          fontSize: '12.5px',
                          padding: '0 8px'
                        }}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        Assigned Sales Lead
                      </label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                          type="text"
                          value={assignedOwnerInput}
                          onChange={(e) => setAssignedOwnerInput(e.target.value)}
                          placeholder="e.g. Manminder Singh"
                          style={{
                            width: '100%',
                            height: '38px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            padding: '0 10px',
                            fontSize: '12px',
                            color: '#0f172a'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAssignOwner(selectedInquiry.id)}
                          style={{
                            padding: '0 10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#2563eb',
                            color: '#fff',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Internal Notes & Follow-up History */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    Internal Sales Notes & Audit History
                  </div>

                  {/* Add note */}
                  <div style={{ marginBottom: '14px' }}>
                    <textarea
                      rows={2}
                      placeholder="Add an internal note or meeting summary (invisible to customer)..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleAddInternalNote(selectedInquiry.id)}
                        disabled={isAddingNote || !newNote.trim()}
                        style={{
                          background: newNote.trim() ? '#0f172a' : '#94a3b8',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: newNote.trim() ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {isAddingNote ? 'Saving...' : 'Add Internal Note'}
                      </button>
                    </div>
                  </div>

                  {/* History timeline */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Array.isArray(selectedInquiry.follow_up_history) && selectedInquiry.follow_up_history.length > 0 ? (
                      selectedInquiry.follow_up_history.slice().reverse().map((item, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '10.5px', marginBottom: '3px' }}>
                            <strong style={{ color: '#0f172a' }}>{item.actor || 'System'}</strong>
                            <span>{item.date ? new Date(item.date).toLocaleString('en-GB') : 'Recorded'}</span>
                          </div>
                          <div style={{ color: '#334155' }}>{item.action || item.note || item.message}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', padding: '8px 0' }}>
                        No follow-up actions recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedInquiry.id)}
                  style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={13} /> Delete Record
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=PrimePro Solution Inquiry — ${selectedInquiry.inquiry_ref}`}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Mail size={13} /> Email Customer
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(null)}
                    style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', color: '#475569', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
