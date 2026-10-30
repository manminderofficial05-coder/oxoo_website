import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Filter, RefreshCw, Mail, Phone, Calendar,
  CheckCircle2, Clock, MessageSquare, Building2, User, Globe,
  ArrowUpRight, Download, Eye, Trash2, Check, X, AlertCircle,
  Sparkles, ExternalLink, MessageCircle, MoreVertical, ShieldCheck,
  ChevronRight, Inbox, HelpCircle
} from 'lucide-react';
import { getAdminLeads, updateAdminLead, deleteAdminLead } from '../../api';

export default function NeedsContactModule({ onToast }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [noteInput, setNoteInput] = useState('');

  const loadLeads = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getAdminLeads();
      if (Array.isArray(data)) {
        setLeads(data);
      }
      if (isRefresh && onToast) {
        onToast('Contact inquiries refreshed from Neon PostgreSQL');
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
      if (onToast) onToast('Failed to load contact data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Compute metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => (l.status || 'New').toLowerCase() === 'new').length;
  const demoLeads = leads.filter(l => (l.message || '').toLowerCase().includes('demo') || (l.source || '').toLowerCase().includes('demo')).length;
  const contactedLeads = leads.filter(l => ['contacted', 'in progress'].includes((l.status || '').toLowerCase())).length;
  const convertedLeads = leads.filter(l => ['converted', 'closed', 'qualified'].includes((l.status || '').toLowerCase())).length;

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.phone && l.phone.toLowerCase().includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.service && l.service.toLowerCase().includes(q)) ||
        (l.message && l.message.toLowerCase().includes(q));

      const status = (l.status || 'New').toLowerCase();
      const matchStatus = statusFilter === 'All' || status === statusFilter.toLowerCase();

      const service = (l.service || '').toLowerCase();
      const matchService = serviceFilter === 'All' || (
        serviceFilter === 'Demo' ? ((l.message || '').toLowerCase().includes('demo') || (l.source || '').toLowerCase().includes('demo')) :
        service.includes(serviceFilter.toLowerCase())
      );

      return matchSearch && matchStatus && matchService;
    });
  }, [leads, search, statusFilter, serviceFilter]);

  const handleStatusChange = async (leadId, newStatus) => {
    setUpdatingId(leadId);
    try {
      await updateAdminLead(leadId, { status: newStatus });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(prev => ({ ...prev, status: newStatus }));
      }
      if (onToast) onToast(`Inquiry marked as ${newStatus}`);
    } catch (err) {
      if (onToast) onToast('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this contact request?')) return;
    try {
      await deleteAdminLead(leadId);
      setLeads(prev => prev.filter(l => l.id !== leadId));
      if (selectedLead && selectedLead.id === leadId) {
        setDrawerOpen(false);
      }
      if (onToast) onToast('Contact inquiry removed.');
    } catch (err) {
      if (onToast) onToast('Failed to delete inquiry.');
    }
  };

  const handleAddNote = async () => {
    if (!noteInput.trim() || !selectedLead) return;
    const currentNotes = (selectedLead.details && selectedLead.details.notes) || [];
    const newNotes = [
      ...currentNotes,
      { text: noteInput.trim(), author: 'Super Admin', time: new Date().toISOString() }
    ];
    try {
      await updateAdminLead(selectedLead.id, { notes: newNotes });
      setSelectedLead(prev => ({
        ...prev,
        details: { ...(prev.details || {}), notes: newNotes }
      }));
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? {
        ...l,
        details: { ...(l.details || {}), notes: newNotes }
      } : l));
      setNoteInput('');
      if (onToast) onToast('Note recorded successfully');
    } catch (err) {
      if (onToast) onToast('Failed to add note.');
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Service/Need', 'Message', 'Status', 'Date'];
    const rows = filteredLeads.map(l => [
      l.id,
      `"${l.name || ''}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.company || ''}"`,
      `"${l.service || ''}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      `"${l.status || 'New'}"`,
      `"${l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PrimePro_Client_Needs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onToast) onToast('Exported inquiries CSV');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Title & Top Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            color: '#1d4ed8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)'
          }}>
            <Inbox size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Client Needs & Contact Inquiries
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#2563eb',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid #bfdbfe'
              }}>
                Neon PostgreSQL Live
              </span>
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
              Incoming business requirements, demo bookings, service inquiries & client contact details
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={exportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => loadLeads(true)}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#2563eb',
              border: 'none',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Live'}
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '16px 18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Total Inquiries</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{totalLeads}</div>
            <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px' }}>100% genuine submissions</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '16px 18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>New / Unread</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>{newLeads}</div>
            <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px' }}>Requires initial follow-up</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '16px 18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Demo Requests</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#9333ea', lineHeight: 1.2 }}>{demoLeads}</div>
            <div style={{ fontSize: '11px', color: '#9333ea', marginTop: '2px' }}>Workspace demo slots</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '16px 18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Contacted</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#ea580c', lineHeight: 1.2 }}>{contactedLeads}</div>
            <div style={{ fontSize: '11px', color: '#ea580c', marginTop: '2px' }}>Active conversations</div>
          </div>
        </motion.div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '14px 18px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '6px 12px',
          flex: '1 1 280px',
          maxWidth: '420px'
        }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by contact name, company, email, phone, requirements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              width: '100%',
              color: '#0f172a'
            }}
          />
          {search && (
            <X size={14} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '12.5px',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Converted">Converted</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Type/Need:</span>
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '12.5px',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Needs</option>
              <option value="Demo">Demo Bookings</option>
              <option value="CRM">CRM Needs</option>
              <option value="Finance">Finance / ERP</option>
              <option value="HRMS">HRMS Suite</option>
              <option value="Supply Chain">Supply Chain</option>
            </select>
          </div>

          <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '6px' }}>
            Showing <strong>{filteredLeads.length}</strong> of {totalLeads}
          </span>
        </div>
      </div>

      {/* Leads & Contact Data Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px' }}>Contact Person</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px' }}>Company / Workspace</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px' }}>Phone / Reach</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px' }}>Client Need & Requirements</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px' }}>Received</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    <RefreshCw size={22} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block', color: '#2563eb' }} />
                    Loading client needs & contact records...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
                    <Inbox size={36} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
                    No client inquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const initial = (lead.name || 'C').charAt(0).toUpperCase();
                  const isDemo = (lead.message || '').toLowerCase().includes('demo') || (lead.source || '').toLowerCase().includes('demo');
                  const status = lead.status || 'New';

                  return (
                    <tr
                      key={lead.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                      onClick={() => {
                        setSelectedLead(lead);
                        setDrawerOpen(true);
                      }}
                    >
                      {/* Contact Person */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: isDemo ? 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                            flexShrink: 0
                          }}>
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{lead.name || 'Valued Client'}</div>
                            <div style={{ fontSize: '11.5px', color: '#64748b' }}>{lead.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Company / Slug */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={13} color="#94a3b8" />
                          <span style={{ fontWeight: 500, color: '#1e293b' }}>
                            {lead.company || 'Enterprise Workspace'}
                          </span>
                        </div>
                        {lead.source && (
                          <span style={{
                            fontSize: '10px',
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            marginTop: '3px',
                            display: 'inline-block'
                          }}>
                            {lead.source}
                          </span>
                        )}
                      </td>

                      {/* Phone / Reach */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: 500 }}>
                          <Phone size={13} color="#059669" />
                          <span>{lead.phone || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Need / Requirements snippet */}
                      <td style={{ padding: '12px 16px', maxWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          {lead.service ? (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              background: '#eff6ff',
                              color: '#2563eb',
                              padding: '2px 7px',
                              borderRadius: '4px'
                            }}>
                              {lead.service}
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              background: '#fdf4ff',
                              color: '#a855f7',
                              padding: '2px 7px',
                              borderRadius: '4px'
                            }}>
                              Workspace Demo
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#475569',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {lead.message || 'Requirements specified in form submission.'}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        }) : 'Recent'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                        <select
                          value={status}
                          disabled={updatingId === lead.id}
                          onChange={e => handleStatusChange(lead.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none',
                            border: '1px solid transparent',
                            background:
                              status === 'New' ? '#ecfdf5' :
                              status === 'Contacted' ? '#eff6ff' :
                              status === 'In Progress' ? '#fff7ed' :
                              status === 'Converted' ? '#f0fdf4' : '#f1f5f9',
                            color:
                              status === 'New' ? '#047857' :
                              status === 'Contacted' ? '#1d4ed8' :
                              status === 'In Progress' ? '#c2410c' :
                              status === 'Converted' ? '#15803d' : '#475569'
                          }}
                        >
                          <option value="New">● New</option>
                          <option value="Contacted">● Contacted</option>
                          <option value="In Progress">● In Progress</option>
                          <option value="Converted">● Converted</option>
                          <option value="Closed">● Closed</option>
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat on WhatsApp"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                background: '#f0fdf4',
                                color: '#16a34a',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none'
                              }}
                            >
                              <MessageCircle size={14} />
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}?subject=PrimePro%20Platform%20-%20Regarding%20Your%20Inquiry`}
                              title="Send Email"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                color: '#2563eb',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none'
                              }}
                            >
                              <Mail size={14} />
                            </a>
                          )}
                          <button
                            type="button"
                            title="View Full Details"
                            onClick={() => {
                              setSelectedLead(lead);
                              setDrawerOpen(true);
                            }}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#475569',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => handleDelete(lead.id)}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              background: '#fef2f2',
                              border: '1px solid #fee2e2',
                              color: '#dc2626',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer for Full Need & Contact Details */}
      <AnimatePresence>
        {drawerOpen && selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: '#000000',
                zIndex: 999
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                maxWidth: '520px',
                background: '#ffffff',
                boxShadow: '-8px 0 35px rgba(0, 0, 0, 0.2)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
              }}
            >
              {/* Drawer Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Lead Record #{selectedLead.id}
                  </span>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                    {selectedLead.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* Contact Card */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Status Workflow</span>
                    <select
                      value={selectedLead.status || 'New'}
                      onChange={e => handleStatusChange(selectedLead.id, e.target.value)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid #cbd5e1'
                      }}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Converted">Converted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Email</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', wordBreak: 'break-all' }}>
                        {selectedLead.email}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Phone Number</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                        {selectedLead.phone || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Company / Subdomain</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                        {selectedLead.company || 'Direct Client'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Submission Date</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                        {selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleString() : 'Recent'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements / Needs Box */}
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} color="#2563eb" />
                    Full Requirement & Inquiry Specification
                  </h4>
                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#1e3a8a',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedLead.message || 'No additional text specified in submission.'}
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedLead.email && (
                    <a
                      href={`mailto:${selectedLead.email}?subject=PrimePro%20Platform%20Follow-up`}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#2563eb',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textDecoration: 'none'
                      }}
                    >
                      <Mail size={15} /> Compose Email
                    </a>
                  )}
                  {selectedLead.phone && (
                    <a
                      href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#16a34a',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textDecoration: 'none'
                      }}
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                  )}
                </div>

                {/* Follow-up Notes Section */}
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="#475569" />
                    Internal Admin Follow-up Notes
                  </h4>
                  
                  {/* Notes List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {(!selectedLead.details || !selectedLead.details.notes || selectedLead.details.notes.length === 0) ? (
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', padding: '8px 0' }}>
                        No follow-up notes logged yet.
                      </div>
                    ) : (
                      selectedLead.details.notes.map((n, idx) => (
                        <div key={idx} style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          fontSize: '12px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', marginBottom: '3px' }}>
                            <strong>{n.author || 'Admin'}</strong>
                            <span>{new Date(n.time).toLocaleString()}</span>
                          </div>
                          <div style={{ color: '#1e293b' }}>{n.text}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Note Input */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Add follow-up note (e.g. Called client, demo scheduled for Friday)..."
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
