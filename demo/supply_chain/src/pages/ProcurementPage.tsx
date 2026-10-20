import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShoppingCart,
  X,
  AlertCircle,
  Building,
  Calendar,
  Layers,
  Send,
  Trash2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';

export const ProcurementPage: React.FC = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPR, setSelectedPR] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states
  const [newPR, setNewPR] = useState({
    department: 'Manufacturing Ops',
    justification: 'Quarterly sensor assembly replenishment',
    requiredByDate: '',
    notes: 'Urgent stock safety replenishment',
    lines: [
      { productId: '', quantity: '50', estimatedCost: '25.00', notes: 'Standard grade' },
    ],
  });

  const [convertData, setConvertData] = useState({
    supplierId: '',
    warehouseId: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prRes, prodRes, supRes, whRes] = await Promise.all([
        apiRequest<{ requisitions: any[] }>('/procurement/requisitions'),
        apiRequest<{ products: any[] }>('/products'),
        apiRequest<{ suppliers: any[] }>('/suppliers'),
        apiRequest<{ warehouses: any[] }>('/warehouses'),
      ]);
      setRequisitions(prRes.requisitions || []);
      setProducts(prodRes.products || []);
      setSuppliers(supRes.suppliers || []);
      setWarehouses(whRes.warehouses || []);

      if (supRes.suppliers?.length > 0 && !convertData.supplierId) {
        setConvertData((prev) => ({ ...prev, supplierId: supRes.suppliers[0].id }));
      }
      if (whRes.warehouses?.length > 0 && !convertData.warehouseId) {
        setConvertData((prev) => ({ ...prev, warehouseId: whRes.warehouses[0].id }));
      }
      if (prodRes.products?.length > 0 && !newPR.lines[0].productId) {
        setNewPR((prev) => ({
          ...prev,
          lines: [{ ...prev.lines[0], productId: prodRes.products[0].id }],
        }));
      }
    } catch (err) {
      console.error('Failed to load procurement data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ requisition: any }>('/procurement/requisitions', {
        method: 'POST',
        body: JSON.stringify(newPR),
      });
      setFeedback(`Requisition ${res.requisition.prNumber} submitted for management approval!`);
      setShowCreateModal(false);
      await fetchData();
      setSelectedPR(res.requisition);
    } catch (err: any) {
      setFeedback(`Submission failed: ${err.message}`);
    }
  };

  const handleApprovePR = async (prId: string) => {
    try {
      const res = await apiRequest<{ requisition: any }>(`/procurement/requisitions/${prId}/approve`, {
        method: 'POST',
      });
      setFeedback(`Requisition approved! Ready for conversion to Purchase Order.`);
      await fetchData();
      if (selectedPR?.id === prId) {
        setSelectedPR(res.requisition);
      }
    } catch (err: any) {
      setFeedback(`Approval failed: ${err.message}`);
    }
  };

  const handleConvertToPO = async () => {
    if (!selectedPR) return;
    try {
      const res = await apiRequest<{ purchaseOrder: any }>(
        `/procurement/requisitions/${selectedPR.id}/convert-to-po`,
        {
          method: 'POST',
          body: JSON.stringify(convertData),
        }
      );
      setFeedback(`Success! Generated Purchase Order ${res.purchaseOrder.poNumber}. Redirecting...`);
      setShowConvertModal(false);
      await fetchData();
      setTimeout(() => {
        navigate('/purchase');
      }, 1200);
    } catch (err: any) {
      setFeedback(`Conversion failed: ${err.message}`);
    }
  };

  const addLine = () => {
    setNewPR({
      ...newPR,
      lines: [
        ...newPR.lines,
        { productId: products[0]?.id || '', quantity: '10', estimatedCost: '20.00', notes: '' },
      ],
    });
  };

  const removeLine = (idx: number) => {
    if (newPR.lines.length <= 1) return;
    const lines = [...newPR.lines];
    lines.splice(idx, 1);
    setNewPR({ ...newPR, lines });
  };

  const filtered = requisitions.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      r.prNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CONVERTED_TO_PO':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Procurement &amp; Requisitions</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Sourcing Pipeline
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Internal purchase requisitions, approval authorizations, and automated PO/RFQ conversion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Requisition</span>
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

      {/* Requisitions Table & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search PR #, department, or submitter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {['ALL', 'SUBMITTED', 'APPROVED', 'CONVERTED_TO_PO'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-brand-active text-white'
                      : 'bg-brand-bg text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4">Requisition #</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Requested By</th>
                  <th className="py-3 px-3">Required By</th>
                  <th className="py-3 px-3 text-right">Est. Total</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filtered.map((pr) => {
                  const isSelected = selectedPR?.id === pr.id;
                  return (
                    <tr
                      key={pr.id}
                      onClick={() => setSelectedPR(pr)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-active/5 font-medium' : 'hover:bg-brand-bg/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-brand-text">{pr.prNumber}</div>
                        <div className="text-[10px] text-brand-muted">
                          {new Date(pr.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-brand-text">{pr.department}</td>
                      <td className="py-3 px-3 text-brand-muted">{pr.requestedBy}</td>
                      <td className="py-3 px-3 text-brand-muted">
                        {pr.requiredByDate ? new Date(pr.requiredByDate).toLocaleDateString() : 'Immediate'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-brand-text">
                        ${pr.estimatedTotal?.toLocaleString() || 0}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(pr.status)}`}>
                          {pr.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Requisition Detail / Action Panel */}
        <div className="lg:col-span-1 space-y-4">
          {selectedPR ? (
            <div className="bg-brand-card border border-brand-border rounded-xl shadow-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-brand-text">{selectedPR.prNumber}</h2>
                  <span className="text-xs text-brand-muted">{selectedPR.department}</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getStatusBadge(selectedPR.status)}`}>
                  {selectedPR.status.replace(/_/g, ' ')}
                </span>
              </div>

              {selectedPR.justification && (
                <div className="p-3 bg-brand-bg rounded-lg border border-brand-border text-xs">
                  <span className="font-semibold text-brand-text block mb-0.5">Business Justification:</span>
                  <p className="text-brand-muted">{selectedPR.justification}</p>
                </div>
              )}

              {/* Line Items List */}
              <div>
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">Requested Items</h3>
                <div className="space-y-2">
                  {(selectedPR.lines || []).map((l: any) => (
                    <div key={l.id} className="p-2.5 rounded-lg border border-brand-border bg-white text-xs">
                      <div className="flex items-center justify-between font-semibold text-brand-text">
                        <span>{l.product?.name || 'Catalog Item'}</span>
                        <span>{l.quantity} {l.product?.uom?.code || 'units'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-brand-muted mt-1">
                        <span className="font-mono">{l.product?.sku}</span>
                        <span>Est: ${(l.estimatedCost * l.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Info */}
              {selectedPR.approvedBy && (
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold">Approved by:</span> {selectedPR.approvedBy} on{' '}
                    {new Date(selectedPR.approvedAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Workflow Actions */}
              <div className="pt-3 border-t border-brand-border space-y-2">
                {selectedPR.status === 'SUBMITTED' && (
                  <button
                    onClick={() => handleApprovePR(selectedPR.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Authorize &amp; Approve Requisition</span>
                  </button>
                )}

                {selectedPR.status === 'APPROVED' && (
                  <button
                    onClick={() => setShowConvertModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Convert to Purchase Order</span>
                  </button>
                )}

                {selectedPR.status === 'CONVERTED_TO_PO' && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center text-xs text-purple-800 font-semibold">
                    Requisition successfully fulfilled into Purchase Order
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-brand-card border border-brand-border rounded-xl text-brand-muted text-xs">
              Select a requisition from the list to review lines and approve.
            </div>
          )}
        </div>
      </div>

      {/* Create Requisition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Submit Purchase Requisition</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Requesting Department *</label>
                  <input
                    type="text"
                    required
                    value={newPR.department}
                    onChange={(e) => setNewPR({ ...newPR, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Required By Date</label>
                  <input
                    type="date"
                    value={newPR.requiredByDate}
                    onChange={(e) => setNewPR({ ...newPR, requiredByDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Business Justification *</label>
                <textarea
                  rows={2}
                  required
                  value={newPR.justification}
                  onChange={(e) => setNewPR({ ...newPR, justification: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              {/* Line Items Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-brand-text">Line Items *</label>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-[11px] font-semibold text-brand-active hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                {newPR.lines.map((line, idx) => (
                  <div key={idx} className="p-3 bg-brand-bg rounded-lg border border-brand-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-muted uppercase">Line #{idx + 1}</span>
                      {newPR.lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-7">
                        <select
                          value={line.productId}
                          onChange={(e) => {
                            const p = products.find((prod) => prod.id === e.target.value);
                            const updated = [...newPR.lines];
                            updated[idx] = {
                              ...line,
                              productId: e.target.value,
                              estimatedCost: p ? p.costPrice.toString() : line.estimatedCost,
                            };
                            setNewPR({ ...newPR, lines: updated });
                          }}
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
                          value={line.quantity}
                          onChange={(e) => {
                            const updated = [...newPR.lines];
                            updated[idx].quantity = e.target.value;
                            setNewPR({ ...newPR, lines: updated });
                          }}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-brand-border rounded focus:outline-none focus:border-brand-active"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Est. Cost"
                          value={line.estimatedCost}
                          onChange={(e) => {
                            const updated = [...newPR.lines];
                            updated[idx].estimatedCost = e.target.value;
                            setNewPR({ ...newPR, lines: updated });
                          }}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-brand-border rounded focus:outline-none focus:border-brand-active"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to PO Modal */}
      {showConvertModal && selectedPR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Convert {selectedPR.prNumber} to Purchase Order</h3>
              <button onClick={() => setShowConvertModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-brand-muted">
                Select the supplier and destination warehouse to award this approved requisition into an active purchase order.
              </p>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Target Supplier *</label>
                <select
                  value={convertData.supplierId}
                  onChange={(e) => setConvertData({ ...convertData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - {s.leadTimeDays || 7}d Lead
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Receiving Warehouse *</label>
                <select
                  value={convertData.warehouseId}
                  onChange={(e) => setConvertData({ ...convertData, warehouseId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConvertToPO}
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Generate Purchase Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
