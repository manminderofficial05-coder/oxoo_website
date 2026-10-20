import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShoppingCart,
  Users,
  Award,
  Calendar,
  X,
  FileText,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';

export const RFQManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New RFQ form
  const [newRfq, setNewRfq] = useState({
    title: 'Precision Sensors Batch Sourcing Tender',
    deadline: '',
    terms: 'Net 30, FOB Destination',
    notes: 'Competitive multi-supplier bidding tender',
    lines: [{ productId: '', quantity: '100', targetPrice: '22.00' }],
    supplierIds: [] as string[],
  });

  // Manual Quote submission form
  const [newQuote, setNewQuote] = useState({
    supplierId: '',
    leadTimeDays: '7',
    notes: 'Guaranteed high-precision calibration',
    lines: [] as any[],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rfqRes, prodRes, supRes] = await Promise.all([
        apiRequest<{ rfqs: any[] }>('/rfq'),
        apiRequest<{ products: any[] }>('/products'),
        apiRequest<{ suppliers: any[] }>('/suppliers'),
      ]);
      setRfqs(rfqRes.rfqs || []);
      setProducts(prodRes.products || []);
      setSuppliers(supRes.suppliers || []);

      if (rfqRes.rfqs?.length > 0 && !selectedRfq) {
        setSelectedRfq(rfqRes.rfqs[0]);
      }
      if (prodRes.products?.length > 0 && !newRfq.lines[0].productId) {
        setNewRfq((prev) => ({
          ...prev,
          lines: [{ ...prev.lines[0], productId: prodRes.products[0].id }],
        }));
      }
      if (supRes.suppliers?.length > 0 && newRfq.supplierIds.length === 0) {
        setNewRfq((prev) => ({
          ...prev,
          supplierIds: supRes.suppliers.map((s: any) => s.id),
        }));
      }
    } catch (err) {
      console.error('Failed to load RFQ data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectRfq = async (rfqId: string) => {
    try {
      const res = await apiRequest<{ rfq: any }>(`/rfq/${rfqId}`);
      setSelectedRfq(res.rfq);
    } catch (err) {
      console.error('Failed to load RFQ details:', err);
    }
  };

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ rfq: any }>('/rfq', {
        method: 'POST',
        body: JSON.stringify(newRfq),
      });
      setFeedback(`RFQ ${res.rfq.rfqNumber} published to ${newRfq.supplierIds.length} suppliers!`);
      setShowCreateModal(false);
      await fetchData();
      setSelectedRfq(res.rfq);
    } catch (err: any) {
      setFeedback(`Creation failed: ${err.message}`);
    }
  };

  const handleAwardQuote = async (quoteId: string) => {
    if (!selectedRfq) return;
    try {
      const res = await apiRequest<{ purchaseOrder: any; quote: any }>(`/rfq/${selectedRfq.id}/award`, {
        method: 'POST',
        body: JSON.stringify({ quoteId }),
      });
      setFeedback(`Winning bid awarded! Generated Purchase Order ${res.purchaseOrder.poNumber}.`);
      await handleSelectRfq(selectedRfq.id);
      await fetchData();
      setTimeout(() => {
        navigate('/purchase');
      }, 1500);
    } catch (err: any) {
      setFeedback(`Awarding failed: ${err.message}`);
    }
  };

  const handleOpenQuoteModal = () => {
    if (!selectedRfq) return;
    const defaultLines = (selectedRfq.lines || []).map((l: any) => ({
      rfqLineId: l.id,
      productId: l.productId,
      unitPrice: l.targetPrice ? (l.targetPrice * 0.95).toFixed(2) : '20.00',
    }));
    setNewQuote({
      supplierId: suppliers[0]?.id || '',
      leadTimeDays: '5',
      notes: 'Competitive promotional tender price',
      lines: defaultLines,
    });
    setShowQuoteModal(true);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;
    try {
      await apiRequest(`/rfq/${selectedRfq.id}/quotes`, {
        method: 'POST',
        body: JSON.stringify(newQuote),
      });
      setFeedback(`Quotation submitted successfully against ${selectedRfq.rfqNumber}!`);
      setShowQuoteModal(false);
      await handleSelectRfq(selectedRfq.id);
      await fetchData();
    } catch (err: any) {
      setFeedback(`Quote submission failed: ${err.message}`);
    }
  };

  const filtered = rfqs.filter(
    (r) =>
      r.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find lowest price quote in selected RFQ
  const quotes = selectedRfq?.quotes || [];
  const lowestQuoteAmount = quotes.length > 0 ? Math.min(...quotes.map((q: any) => q.totalAmount)) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">RFQ Manager</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Competitive Bidding Engine
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Manage Requests for Quotation (RFQs), invite multiple suppliers, compare side-by-side bids, and award POs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create RFQ</span>
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: RFQ List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tenders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
            />
          </div>

          <div className="space-y-2 max-h-[650px] overflow-y-auto">
            {filtered.map((rfq) => {
              const isSelected = selectedRfq?.id === rfq.id;
              const quoteCount = rfq.quotes?.length || 0;
              const supplierCount = rfq.suppliers?.length || 0;

              const statusColor =
                rfq.status === 'AWARDED'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : rfq.status === 'RESPONSES_RECEIVED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200';

              return (
                <div
                  key={rfq.id}
                  onClick={() => handleSelectRfq(rfq.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-card border-brand-active shadow-card ring-1 ring-brand-active'
                      : 'bg-white border-brand-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-brand-text">{rfq.rfqNumber}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusColor}`}>
                      {rfq.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-brand-text mt-1">{rfq.title}</h3>

                  <div className="flex items-center justify-between text-[11px] text-brand-muted mt-3 pt-2 border-t border-brand-border">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {supplierCount} Invited
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-brand-active">
                      <DollarSign className="w-3 h-3" />
                      {quoteCount} Bids Submitted
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: RFQ Details & Multi-Vendor Bid Comparison Matrix */}
        <div className="lg:col-span-2 space-y-4">
          {selectedRfq ? (
            <>
              {/* RFQ Header Card */}
              <div className="p-5 bg-brand-card border border-brand-border rounded-xl shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-brand-text">{selectedRfq.title}</h2>
                      <span className="px-2 py-0.5 text-xs font-mono bg-brand-bg text-brand-text rounded border border-brand-border">
                        {selectedRfq.rfqNumber}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted mt-1">
                      Commercial Terms: {selectedRfq.terms || 'Net 30, Standard Logistics'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedRfq.status !== 'AWARDED' && (
                      <button
                        onClick={handleOpenQuoteModal}
                        className="flex items-center gap-1 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log Vendor Quote</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Multi-Vendor Bid Comparison Matrix */}
              <div className="bg-brand-card border border-brand-border rounded-xl shadow-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">Multi-Supplier Bid Comparison</h3>
                    <p className="text-xs text-brand-muted">Compare unit pricing, delivery lead times, and award winning quotation</p>
                  </div>
                  <span className="text-xs font-semibold text-brand-active">
                    {quotes.length} Quotations Received
                  </span>
                </div>

                {quotes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                        <tr>
                          <th className="py-2.5 px-3">Supplier</th>
                          <th className="py-2.5 px-3">Quote #</th>
                          <th className="py-2.5 px-3">Lead Time</th>
                          <th className="py-2.5 px-3 text-right">Total Bid</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border">
                        {quotes.map((q: any) => {
                          const isLowest = q.totalAmount === lowestQuoteAmount;
                          const isAwarded = q.status === 'ACCEPTED';

                          return (
                            <tr
                              key={q.id}
                              className={`transition-colors ${
                                isAwarded
                                  ? 'bg-purple-50/50'
                                  : isLowest
                                  ? 'bg-emerald-50/40'
                                  : 'hover:bg-brand-bg/50'
                              }`}
                            >
                              <td className="py-3 px-3">
                                <div className="font-semibold text-brand-text">{q.supplier?.name}</div>
                                <div className="text-[10px] text-brand-muted font-mono">{q.supplier?.code}</div>
                              </td>
                              <td className="py-3 px-3 font-mono text-brand-muted">{q.quoteNumber}</td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                                  {q.leadTimeDays} Days
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="font-bold text-sm text-brand-text">
                                  ${q.totalAmount?.toLocaleString()}
                                </div>
                                {isLowest && (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 bg-emerald-100 rounded border border-emerald-200">
                                    LOWEST BID
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                    q.status === 'ACCEPTED'
                                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                                      : q.status === 'REJECTED'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}
                                >
                                  {q.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                {selectedRfq.status !== 'AWARDED' && q.status !== 'REJECTED' ? (
                                  <button
                                    onClick={() => handleAwardQuote(q.id)}
                                    className="px-3 py-1 bg-brand-active text-white rounded text-xs font-semibold hover:bg-brand-active/90 shadow-xs inline-flex items-center gap-1"
                                  >
                                    <Award className="w-3 h-3" />
                                    <span>Award PO</span>
                                  </button>
                                ) : isAwarded ? (
                                  <span className="text-xs font-bold text-purple-700 flex items-center justify-end gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    PO Issued
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-400">Closed</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-brand-bg rounded-lg border border-brand-border">
                    <Clock className="w-6 h-6 text-brand-muted mx-auto mb-2" />
                    <p className="text-xs text-brand-muted">Awaiting quotation responses from invited suppliers.</p>
                    <button
                      onClick={handleOpenQuoteModal}
                      className="mt-3 px-3 py-1.5 bg-brand-active text-white rounded text-xs font-semibold hover:bg-brand-active/90"
                    >
                      Log Sample Quotation
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-brand-card border border-brand-border rounded-xl">
              <FileCode className="w-8 h-8 text-brand-muted mx-auto mb-2" />
              <p className="text-xs text-brand-muted">Select an RFQ tender to compare supplier bids.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create RFQ Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Issue Request for Quotation (RFQ)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRfq} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Tender Title *</label>
                <input
                  type="text"
                  required
                  value={newRfq.title}
                  onChange={(e) => setNewRfq({ ...newRfq, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Commercial Terms</label>
                <input
                  type="text"
                  value={newRfq.terms}
                  onChange={(e) => setNewRfq({ ...newRfq, terms: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              {/* Item selection */}
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Requested Product &amp; Volume</label>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7">
                    <select
                      value={newRfq.lines[0].productId}
                      onChange={(e) =>
                        setNewRfq({
                          ...newRfq,
                          lines: [{ ...newRfq.lines[0], productId: e.target.value }],
                        })
                      }
                      className="w-full px-2 py-1.5 text-xs bg-white border border-brand-border rounded focus:outline-none focus:border-brand-active"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={newRfq.lines[0].quantity}
                      onChange={(e) =>
                        setNewRfq({
                          ...newRfq,
                          lines: [{ ...newRfq.lines[0], quantity: e.target.value }],
                        })
                      }
                      className="w-full px-2 py-1.5 text-xs bg-white border border-brand-border rounded focus:outline-none focus:border-brand-active"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Target $"
                      value={newRfq.lines[0].targetPrice}
                      onChange={(e) =>
                        setNewRfq({
                          ...newRfq,
                          lines: [{ ...newRfq.lines[0], targetPrice: e.target.value }],
                        })
                      }
                      className="w-full px-2 py-1.5 text-xs bg-white border border-brand-border rounded focus:outline-none focus:border-brand-active"
                    />
                  </div>
                </div>
              </div>

              {/* Supplier Invitations */}
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1.5">Invited Suppliers (Competitive Pool)</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-brand-bg rounded-lg border border-brand-border">
                  {suppliers.map((s) => {
                    const isChecked = newRfq.supplierIds.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 text-xs text-brand-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRfq({ ...newRfq, supplierIds: [...newRfq.supplierIds, s.id] });
                            } else {
                              setNewRfq({
                                ...newRfq,
                                supplierIds: newRfq.supplierIds.filter((id) => id !== s.id),
                              });
                            }
                          }}
                          className="rounded text-brand-active focus:ring-brand-active"
                        />
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-[10px] text-brand-muted">({s.code})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Publish Tender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Vendor Quote Modal */}
      {showQuoteModal && selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Submit Supplier Quotation</h3>
              <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Quoting Supplier *</label>
                <select
                  value={newQuote.supplierId}
                  onChange={(e) => setNewQuote({ ...newQuote, supplierId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Offered Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newQuote.lines[0]?.unitPrice || '20.00'}
                    onChange={(e) => {
                      const updated = [...newQuote.lines];
                      if (updated[0]) updated[0].unitPrice = e.target.value;
                      setNewQuote({ ...newQuote, lines: updated });
                    }}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Promised Lead Time (Days)</label>
                  <input
                    type="number"
                    required
                    value={newQuote.leadTimeDays}
                    onChange={(e) => setNewQuote({ ...newQuote, leadTimeDays: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Quote Remarks</label>
                <input
                  type="text"
                  value={newQuote.notes}
                  onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Submit Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
