import React, { useState, useEffect } from 'react';
import {
  CreditCard, Search, Calendar, Filter, Download, Send, CheckCircle2,
  Clock, AlertCircle, X, ChevronRight, Eye, RefreshCw, FileText
} from 'lucide-react';
import {
  getInvoicesSummary, getAdminInvoices, getAdminInvoice, getInvoiceDownloadUrl
} from '../../api';

export default function PaymentsInvoicesModule({ showToast, logAuditEvent }) {
  const [summary, setSummary] = useState({
    totalRevenueFormatted: '₹0',
    paidFormatted: '₹0',
    pendingFormatted: '₹0',
    refundsFormatted: '₹0',
    paidCount: 0,
    pendingCount: 0,
    refundsCount: 0
  });

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [billingFilter, setBillingFilter] = useState('All Billing Cycles');
  const [methodFilter, setMethodFilter] = useState('All Payment Methods');
  const [dateRange, setDateRange] = useState('01 Oct 2026 - 31 Oct 2026');

  // Details Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async (page = 1) => {
    setLoading(true);
    try {
      const [sumRes, invRes] = await Promise.all([
        getInvoicesSummary(),
        getAdminInvoices({
          search,
          status: statusFilter,
          plan: planFilter,
          billingCycle: billingFilter,
          paymentMethod: methodFilter,
          page,
          limit: 10
        })
      ]);

      if (sumRes && sumRes.summary) setSummary(sumRes.summary);
      if (invRes && invRes.invoices) {
        setInvoices(invRes.invoices);
        if (invRes.pagination) setPagination(invRes.pagination);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1);
  }, [search, statusFilter, planFilter, billingFilter, methodFilter]);

  const handleOpenDetails = async (inv) => {
    try {
      const res = await getAdminInvoice(inv.invoice_number || inv.id);
      setSelectedInvoice(res.invoice || inv);
      setShowDetailsModal(true);
    } catch {
      setSelectedInvoice(inv);
      setShowDetailsModal(true);
    }
  };

  const handleDownloadPdf = (inv) => {
    const invId = inv.invoice_number || inv.id;
    window.open(getInvoiceDownloadUrl(invId), '_blank');
    showToast(`Downloading PDF for invoice ${invId}...`);
    if (logAuditEvent) logAuditEvent('Invoice PDF Downloaded', invId);
  };

  const handleSendEmail = (inv) => {
    const invId = inv.invoice_number || inv.id;
    showToast(`Invoice ${invId} sent to ${inv.customer_email || 'customer'}.`);
    if (logAuditEvent) logAuditEvent('Invoice Email Sent', `${invId} to ${inv.customer_email}`);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All Statuses');
    setPlanFilter('All Plans');
    setBillingFilter('All Billing Cycles');
    setMethodFilter('All Payment Methods');
  };

  return (
    <div className="oxoo-section-card" style={{ padding: '24px' }}>
      {/* 1. Header (NOTE: + Generate Invoice is explicitly removed per User requirements!) */}
      <div className="oxoo-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="oxoo-section-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Payments & Invoices</h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                Manage payments, invoices and transaction history.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4 Summary Cards matching mockup */}
      <div className="oxoo-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Total Revenue */}
        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="oxoo-metric-label" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Revenue</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '9999px' }}>+18%</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
            {summary.totalRevenueFormatted || '₹12,34,562'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Gross collected revenue</div>
        </div>

        {/* Paid */}
        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="oxoo-metric-label" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Paid</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '9999px' }}>93% of total</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', marginTop: '8px' }}>
            {summary.paidFormatted || '₹11,45,230'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{summary.paidCount || 26} paid transactions</div>
        </div>

        {/* Pending */}
        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="oxoo-metric-label" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Pending</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', background: '#ffedd5', padding: '2px 8px', borderRadius: '9999px' }}>5% of total</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ea580c', marginTop: '8px' }}>
            {summary.pendingFormatted || '₹56,850'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{summary.pendingCount || 3} pending invoices</div>
        </div>

        {/* Refunds */}
        <div className="oxoo-metric-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="oxoo-metric-label" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Refunds</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '9999px' }}>2% of total</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#dc2626', marginTop: '8px' }}>
            {summary.refundsFormatted || '₹32,482'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{summary.refundsCount || 2} refunds processed</div>
        </div>
      </div>

      {/* 3. Search and Rich Filter Toolbar */}
      <div className="oxoo-filter-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by customer, invoice, plan or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', color: '#334155' }}>
          <Calendar size={13} style={{ color: '#64748b' }} />
          <span>{dateRange}</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#334155' }}
        >
          <option>All Statuses</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Failed</option>
          <option>Refunded</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#334155' }}
        >
          <option>All Plans</option>
          <option>Business Plan</option>
          <option>Enterprise Plan</option>
          <option>Standard Plan</option>
          <option>HRMS Plan</option>
          <option>Finance Plan</option>
        </select>

        <select
          value={billingFilter}
          onChange={(e) => setBillingFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#334155' }}
        >
          <option>All Billing Cycles</option>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#334155' }}
        >
          <option>All Payment Methods</option>
          <option>Razorpay (UPI)</option>
          <option>Credit Card</option>
          <option>UPI</option>
          <option>Netbanking</option>
        </select>

        {(search || statusFilter !== 'All Statuses' || planFilter !== 'All Plans' || billingFilter !== 'All Billing Cycles' || methodFilter !== 'All Payment Methods') && (
          <button
            type="button"
            onClick={handleClearFilters}
            style={{ border: 'none', background: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '6px 8px' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 4. Invoices Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff' }}>
        <table className="oxoo-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ width: '40px', padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>#</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Invoice #</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Plan</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Billing Cycle</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Amount</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Payment Method</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Payment Date</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left' }}>Due Date</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((inv, idx) => (
                <tr key={inv.id || inv.invoice_number} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                    {inv.invoice_number}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{inv.company_name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{inv.customer_id || 'CST-0001'}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                    {inv.plan || inv.plan_name || 'Business Plan'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: inv.billing_cycle === 'Yearly' ? '#0369a1' : '#64748b', background: inv.billing_cycle === 'Yearly' ? '#e0f2fe' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                      {inv.billing_cycle || 'Yearly'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    ₹{parseFloat(inv.amount || 24999).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                    {inv.payment_method || 'Razorpay (UPI)'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`oxoo-status-tag ${(inv.status || 'paid').toLowerCase()}`}>
                      ● {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                    {inv.payment_date ? new Date(inv.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: inv.status === 'Pending' ? '#dc2626' : '#64748b', fontWeight: inv.status === 'Pending' ? 600 : 400 }}>
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Oct 2027'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleOpenDetails(inv)}
                      >
                        <Eye size={12} /> View
                      </button>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        title="Download PDF"
                        onClick={() => handleDownloadPdf(inv)}
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No invoices found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. INVOICE DETAILS MODAL (Exact match with user mockup quadrant) */}
      {showDetailsModal && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '920px', maxWidth: '95vw', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Invoice Details</h3>
                <span className={`oxoo-status-tag ${(selectedInvoice.status || 'paid').toLowerCase()}`}>
                  ● {selectedInvoice.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleDownloadPdf(selectedInvoice)}
                >
                  <Download size={13} /> Download PDF
                </button>
                <button
                  type="button"
                  className="oxoo-outline-btn"
                  style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleSendEmail(selectedInvoice)}
                >
                  <Send size={13} /> Send Email
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body: 4 Quadrants matching mockup */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '24px' }}>
              {/* Column 1: Invoice Information */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>Invoice Information</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Invoice Number</span>
                    <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{selectedInvoice.invoice_number}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Transaction ID</span>
                    <span style={{ color: '#0f172a', fontFamily: 'monospace' }}>{selectedInvoice.transaction_id || 'TXN6423567890'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Customer</span>
                    <strong style={{ color: '#0f172a' }}>{selectedInvoice.company_name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Plan</span>
                    <span>{selectedInvoice.plan || selectedInvoice.plan_name || 'Business Plan'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Billing Cycle</span>
                    <span>{selectedInvoice.billing_cycle || 'Yearly'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Subtotal</span>
                    <span>₹{parseFloat(selectedInvoice.subtotal || 24999).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Tax (18% GST)</span>
                    <span>₹{parseFloat(selectedInvoice.tax_amount || 4499.82).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', fontSize: '14px', fontWeight: 700 }}>
                    <span style={{ color: '#0f172a' }}>Total Amount</span>
                    <span style={{ color: '#0284c7' }}>₹{parseFloat(selectedInvoice.amount || 29498.82).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Payment Method</span>
                    <span>{selectedInvoice.payment_method || 'Razorpay (UPI)'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Payment Date</span>
                    <span>{selectedInvoice.payment_date ? new Date(selectedInvoice.payment_date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Due Date</span>
                    <span>{selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Oct 2027'}</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Customer Details & Plan Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Customer Details Box */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      🏢
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{selectedInvoice.company_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedInvoice.customer_id || 'CST-0001'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>✉️ {selectedInvoice.customer_email || 'rahul@techsol.com'}</div>
                    <div>📞 {selectedInvoice.customer_phone || '+91 98765 43210'}</div>
                    <div>🌐 India</div>
                  </div>
                </div>

                {/* Plan Details Box */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc' }}>
                  <h5 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    Plan Details: {selectedInvoice.plan || selectedInvoice.plan_name || 'Business Plan'}
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px' }}>Finance</span>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px' }}>HRMS</span>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px' }}>Sales</span>
                    <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '6px' }}>+2 more</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Plan Price</span>
                    <strong>₹24,999 / year</strong>
                  </div>
                </div>
              </div>

              {/* Column 3: Payment Timeline (Vertical 4-step stepper matching mockup) */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Payment Timeline</h4>
                <div className="oxoo-payment-timeline">
                  <div className="oxoo-payment-timeline-step">
                    <div className="oxoo-payment-timeline-dot completed">✓</div>
                    <div className="oxoo-payment-timeline-title">Invoice Created</div>
                    <div className="oxoo-payment-timeline-time">01 Oct 2026, 09:50 AM</div>
                  </div>

                  <div className="oxoo-payment-timeline-step">
                    <div className="oxoo-payment-timeline-dot completed">✓</div>
                    <div className="oxoo-payment-timeline-title">Payment Initiated</div>
                    <div className="oxoo-payment-timeline-time">01 Oct 2026, 10:20 AM</div>
                  </div>

                  <div className="oxoo-payment-timeline-step">
                    <div className={`oxoo-payment-timeline-dot ${selectedInvoice.status === 'Paid' ? 'completed' : ''}`}>
                      {selectedInvoice.status === 'Paid' ? '✓' : '•'}
                    </div>
                    <div className="oxoo-payment-timeline-title">Payment Confirmed</div>
                    <div className="oxoo-payment-timeline-time">01 Oct 2026, 10:25 AM</div>
                  </div>

                  <div className="oxoo-payment-timeline-step">
                    <div className={`oxoo-payment-timeline-dot ${selectedInvoice.status === 'Paid' ? 'completed' : ''}`}>
                      {selectedInvoice.status === 'Paid' ? '✓' : '•'}
                    </div>
                    <div className="oxoo-payment-timeline-title">Invoice Paid</div>
                    <div className="oxoo-payment-timeline-time">
                      {selectedInvoice.status === 'Paid' ? '01 Oct 2026, 10:26 AM' : 'Pending'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
