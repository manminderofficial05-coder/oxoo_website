import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShoppingCart,
  Send,
  Calendar,
  Truck,
  Shield,
  X,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const VendorPortalPage: React.FC = () => {
  const [profile, setProfile] = useState<any | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [openRfqs, setOpenRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState<any | null>(null);
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAsnModal, setShowAsnModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Forms
  const [confirmDate, setConfirmDate] = useState(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [quoteForm, setQuoteForm] = useState({
    unitPrice: '21.50',
    leadTimeDays: '5',
    notes: 'Direct supplier quotation with priority freight schedule.',
  });
  const [asnForm, setAsnForm] = useState({
    poId: '',
    trackingNumber: '',
    carrierName: 'DHL Express Logistics',
    estimatedArrival: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, poRes, rfqRes] = await Promise.all([
        apiRequest<{ supplier: any }>('/vendor-portal/profile'),
        apiRequest<{ purchaseOrders: any[] }>('/vendor-portal/pos'),
        apiRequest<{ rfqs: any[] }>('/vendor-portal/rfqs'),
      ]);
      setProfile(profRes.supplier || null);
      const pos = poRes.purchaseOrders || [];
      setPurchaseOrders(pos);
      setOpenRfqs(rfqRes.rfqs || []);

      if (pos.length > 0 && !selectedPO) {
        setSelectedPO(pos[0]);
        setAsnForm((prev) => ({ ...prev, poId: pos[0].id }));
      }
    } catch (err) {
      console.error('Failed to load vendor portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      await apiRequest(`/vendor-portal/pos/${selectedPO.id}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ confirmedDeliveryDate: confirmDate }),
      });
      setFeedback(`Delivery date confirmed for Purchase Order ${selectedPO.poNumber}!`);
      setShowConfirmModal(false);
      await fetchData();
    } catch (err: any) {
      setFeedback(`Confirmation failed: ${err.message}`);
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;
    try {
      await apiRequest(`/vendor-portal/rfqs/${selectedRfq.id}/quote`, {
        method: 'POST',
        body: JSON.stringify(quoteForm),
      });
      setFeedback(`Quote submitted successfully for tender ${selectedRfq.rfqNumber}!`);
      setShowQuoteModal(false);
      await fetchData();
    } catch (err: any) {
      setFeedback(`Quote failed: ${err.message}`);
    }
  };

  const handleSubmitAsn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ shipment: any }>('/vendor-portal/shipments/asn', {
        method: 'POST',
        body: JSON.stringify(asnForm),
      });
      setFeedback(`Advance Shipping Notice (ASN) dispatched! Tracking #${res.shipment.trackingNumber}.`);
      setShowAsnModal(false);
      await fetchData();
    } catch (err: any) {
      setFeedback(`ASN submission failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Supplier Identity & Tenant Isolation Banner */}
      <div className="p-4 bg-brand-sidebar text-white rounded-xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-active flex items-center justify-center text-white shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                {profile?.name || 'Authorized Supplier Portal'}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-white/10 text-brand-sage rounded border border-white/20">
                {profile?.code || 'SUP-001'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-sage/90 mt-0.5">
              <Shield className="w-3.5 h-3.5 text-brand-sage" />
              <span>Strict Tenant Isolation Active: Authorized purchase orders &amp; private RFQ quotes</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAsnModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Submit ASN Notice</span>
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-semibold text-white hover:bg-white/20 transition-colors"
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

      {/* Main Grid: Purchase Orders Table & Open Tender RFQs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Authorized Purchase Orders */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-brand-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">Authorized Purchase Orders</h2>
              <p className="text-xs text-brand-muted">Approved orders issued to your organization</p>
            </div>
            <span className="text-xs font-semibold text-brand-active">{purchaseOrders.length} Orders Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4">PO #</th>
                  <th className="py-3 px-3">Order Date</th>
                  <th className="py-3 px-3">Destination Facility</th>
                  <th className="py-3 px-3 text-right">Order Total</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {purchaseOrders.map((po) => {
                  const isSelected = selectedPO?.id === po.id;
                  return (
                    <tr
                      key={po.id}
                      onClick={() => setSelectedPO(po)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-active/5 font-medium' : 'hover:bg-brand-bg/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-brand-text">{po.poNumber}</div>
                        <div className="text-[10px] text-brand-muted">{po.lines?.length || 0} line items</div>
                      </td>
                      <td className="py-3 px-3 text-brand-muted">
                        {new Date(po.orderDate || po.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-brand-text">{po.warehouse?.name || 'Central Logistics Hub'}</td>
                      <td className="py-3 px-3 text-right font-bold text-brand-text">
                        ${po.totalAmount?.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPO(po);
                            setShowConfirmModal(true);
                          }}
                          className="px-2.5 py-1 bg-white border border-brand-border text-brand-text rounded text-xs font-semibold hover:bg-brand-bg shadow-xs"
                        >
                          Confirm Date
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Open RFQ Tenders Board */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-brand-card border border-brand-border rounded-xl shadow-card p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">Open RFQ Tenders</h2>
              <p className="text-xs text-brand-muted">Submit competitive quotations against open buyer requests</p>
            </div>

            <div className="space-y-3">
              {openRfqs.map((rfq) => (
                <div key={rfq.id} className="p-3 bg-brand-bg rounded-lg border border-brand-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-brand-text">{rfq.rfqNumber}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                      OPEN
                    </span>
                  </div>
                  <h3 className="font-semibold text-brand-text">{rfq.title}</h3>
                  <div className="text-[11px] text-brand-muted">Terms: {rfq.terms || 'Net 30, FOB'}</div>
                  <button
                    onClick={() => {
                      setSelectedRfq(rfq);
                      setShowQuoteModal(true);
                    }}
                    className="w-full mt-1 py-1.5 bg-brand-active text-white rounded text-xs font-semibold hover:bg-brand-active/90 shadow-xs flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Submit Quotation</span>
                  </button>
                </div>
              ))}
              {openRfqs.length === 0 && (
                <div className="p-6 text-center text-xs text-brand-muted italic">
                  No open RFQs awaiting quotation at this time.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delivery Date Modal */}
      {showConfirmModal && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Acknowledge {selectedPO.poNumber}</h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Promised Arrival / Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  value={confirmDate}
                  onChange={(e) => setConfirmDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Confirm Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Quote Modal */}
      {showQuoteModal && selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Quote Tender: {selectedRfq.rfqNumber}</h3>
              <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Offered Unit Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={quoteForm.unitPrice}
                  onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Promised Lead Time (Days) *</label>
                <input
                  type="number"
                  required
                  value={quoteForm.leadTimeDays}
                  onChange={(e) => setQuoteForm({ ...quoteForm, leadTimeDays: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Commercial Notes</label>
                <input
                  type="text"
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
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
                  Submit Private Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASN Modal */}
      {showAsnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Submit Advance Shipping Notice (ASN)</h3>
              <button onClick={() => setShowAsnModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAsn} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Target Purchase Order *</label>
                <select
                  value={asnForm.poId}
                  onChange={(e) => setAsnForm({ ...asnForm, poId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white"
                >
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber} (${po.totalAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Carrier Name</label>
                <input
                  type="text"
                  required
                  value={asnForm.carrierName}
                  onChange={(e) => setAsnForm({ ...asnForm, carrierName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Carrier Tracking Number</label>
                <input
                  type="text"
                  placeholder="Auto-generated or e.g. DHL-882910"
                  value={asnForm.trackingNumber}
                  onChange={(e) => setAsnForm({ ...asnForm, trackingNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Estimated Inbound Arrival</label>
                <input
                  type="date"
                  value={asnForm.estimatedArrival}
                  onChange={(e) => setAsnForm({ ...asnForm, estimatedArrival: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowAsnModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Dispatch Inbound ASN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
