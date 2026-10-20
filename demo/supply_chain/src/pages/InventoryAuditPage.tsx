import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ScanBarcode,
  Layers,
  DollarSign,
  X,
  FileCheck,
  ShieldCheck,
  Lock,
  EyeOff,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useWarehouse } from '../context/WarehouseContext.js';

export const InventoryAuditPage: React.FC = () => {
  const { warehouses } = useWarehouse();
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forms
  const [newSession, setNewSession] = useState({
    warehouseId: '',
    countType: 'CYCLE_COUNT',
    notes: 'Q4 High-Velocity Sensor Physical Verification',
  });

  const [scanForm, setScanForm] = useState({
    barcodeOrSku: '',
    physicalQuantity: '1',
  });

  const [reconcileForm, setReconcileForm] = useState({
    reason: 'CYCLE_COUNT_DISCREPANCY',
    notes: 'Reconciliation approved by Lead Inventory Auditor',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ sessions: any[] }>('/inventory-audit/sessions');
      const list = res.sessions || [];
      setSessions(list);
      if (list.length > 0 && !selectedSession) {
        await handleSelectSession(list[0].id);
      }
      if (warehouses.length > 0 && !newSession.warehouseId) {
        setNewSession((prev) => ({ ...prev, warehouseId: warehouses[0].id }));
      }
    } catch (err) {
      console.error('Failed to load audit sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [warehouses]);

  const handleSelectSession = async (id: string) => {
    try {
      const res = await apiRequest<{ session: any }>(`/inventory-audit/sessions/${id}`);
      setSelectedSession(res.session);
    } catch (err) {
      console.error('Failed to load session details:', err);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const res = await apiRequest<{ session: any }>('/inventory-audit/sessions', {
        method: 'POST',
        body: JSON.stringify(newSession),
      });
      setFeedback(`Audit session ${res.session.countNumber} initialized with snapshot!`);
      setShowCreateModal(false);
      await fetchData();
      await handleSelectSession(res.session.id);
    } catch (err: any) {
      setErrorMessage(`Session creation failed: ${err.message}`);
    }
  };

  const handleRecordCount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    setErrorMessage(null);
    try {
      await apiRequest(`/inventory-audit/sessions/${selectedSession.id}/scan`, {
        method: 'POST',
        body: JSON.stringify({
          barcodeOrSku: scanForm.barcodeOrSku,
          physicalQuantity: parseFloat(scanForm.physicalQuantity),
        }),
      });
      setFeedback(`Physical count recorded for ${scanForm.barcodeOrSku}!`);
      setShowScanModal(false);
      setScanForm({ barcodeOrSku: '', physicalQuantity: '1' });
      await handleSelectSession(selectedSession.id);
      await fetchData();
    } catch (err: any) {
      setErrorMessage(`Count recording failed: ${err.message}`);
    }
  };

  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    setErrorMessage(null);
    try {
      const res = await apiRequest<{ session: any }>(`/inventory-audit/sessions/${selectedSession.id}/reconcile`, {
        method: 'POST',
        body: JSON.stringify(reconcileForm),
      });
      setFeedback(`Audit reconciled! Balance adjustments posted to transactional ledger.`);
      setShowReconcileModal(false);
      await handleSelectSession(selectedSession.id);
      await fetchData();
    } catch (err: any) {
      setErrorMessage(`Reconciliation failed: ${err.message}`);
    }
  };

  const filtered = sessions.filter(
    (s) =>
      s.countNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.warehouseName && s.warehouseName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECONCILED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
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
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Inventory Audit &amp; Reconciliation</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Count Governance
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Conduct scheduled cycle counts, blind audits, compute variance discrepancies, and reconcile balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start Audit Session</span>
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

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Audit Sessions List & Count Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit count #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
            />
          </div>

          <div className="space-y-2 max-h-[650px] overflow-y-auto">
            {filtered.map((s) => {
              const isSelected = selectedSession?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectSession(s.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-card border-brand-active shadow-card ring-1 ring-brand-active'
                      : 'bg-white border-brand-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-brand-text">{s.countNumber}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-brand-text mt-1">{s.warehouseName}</div>

                  <div className="flex items-center gap-1.5 text-[11px] text-brand-muted mt-0.5">
                    <span className="px-1.5 py-0.2 bg-slate-100 rounded font-semibold text-slate-700">
                      {s.countType || 'CYCLE_COUNT'}
                    </span>
                    <span>• {s.totalItemsCounted || 0} items tracked</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] mt-3 pt-2 border-t border-brand-border">
                    <span className="text-brand-muted">Discrepancies:</span>
                    <span className={s.totalDiscrepancies > 0 ? 'font-bold text-rose-600' : 'font-semibold text-emerald-600'}>
                      {s.totalDiscrepancies || 0} variance lines
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Audit Session Detail & Barcode Assisted Counting */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSession ? (
            <>
              {/* Session Overview Card */}
              <div className="p-5 bg-brand-card border border-brand-border rounded-xl shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-brand-text font-mono">{selectedSession.countNumber}</h2>
                      <span className="px-2 py-0.5 text-xs font-semibold bg-brand-bg text-brand-text rounded border border-brand-border">
                        {selectedSession.countType || 'CYCLE_COUNT'}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted mt-1">{selectedSession.notes || 'Facility verification'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedSession.status === 'IN_PROGRESS' && (
                      <>
                        <button
                          onClick={() => setShowScanModal(true)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
                        >
                          <ScanBarcode className="w-3.5 h-3.5" />
                          <span>Scan / Count Item</span>
                        </button>
                        <button
                          onClick={() => setShowReconcileModal(true)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-emerald-700 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Approve &amp; Reconcile</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {selectedSession.countType === 'BLIND_COUNT' && selectedSession.status === 'IN_PROGRESS' && (
                  <div className="mt-3 p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Blind Count Active: System expected on-hand balances are hidden to prevent auditor bias.</span>
                  </div>
                )}
              </div>

              {/* Adjustments & Counting Items Table */}
              <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
                <div className="p-4 border-b border-brand-border flex items-center justify-between">
                  <h3 className="text-sm font-bold text-brand-text">Physical Verification Ledger</h3>
                  <span className="text-xs text-brand-muted">
                    {selectedSession.adjustments?.length || 0} counted records
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                      <tr>
                        <th className="py-2.5 px-3">Item SKU / Product</th>
                        <th className="py-2.5 px-3 text-right">System Qty</th>
                        <th className="py-2.5 px-3 text-right">Physical Count</th>
                        <th className="py-2.5 px-3 text-right">Difference</th>
                        <th className="py-2.5 px-3 text-right">Cost Variance</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {(selectedSession.adjustments || []).map((adj: any) => {
                        const hasDiff = adj.differenceQty !== 0;

                        return (
                          <tr key={adj.id} className="hover:bg-brand-bg/50">
                            <td className="py-3 px-3">
                              <div className="font-mono font-bold text-brand-text">{adj.productId}</div>
                              <div className="text-[10px] text-brand-muted font-mono">{adj.locationId}</div>
                            </td>
                            <td className="py-3 px-3 text-right font-medium text-brand-text">
                              {adj.systemQuantity !== null ? adj.systemQuantity : '*** (Blind)'}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-brand-text">
                              {adj.physicalQuantity}
                            </td>
                            <td className="py-3 px-3 text-right font-bold">
                              {hasDiff ? (
                                <span className={adj.differenceQty < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                                  {adj.differenceQty > 0 ? `+${adj.differenceQty}` : adj.differenceQty}
                                </span>
                              ) : (
                                <span className="text-brand-muted">0</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-brand-text">
                              ${Math.abs(adj.costDifference || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {hasDiff ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  DISCREPANCY
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                  MATCHED
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-brand-card border border-brand-border rounded-xl">
              <ClipboardCheck className="w-8 h-8 text-brand-muted mx-auto mb-2" />
              <p className="text-xs text-brand-muted">Select an inventory audit session to view physical counts.</p>
            </div>
          )}
        </div>
      </div>

      {/* Start Audit Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Initialize Inventory Count Session</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Target Facility *</label>
                <select
                  value={newSession.warehouseId}
                  onChange={(e) => setNewSession({ ...newSession, warehouseId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Audit Count Methodology *</label>
                <select
                  value={newSession.countType}
                  onChange={(e) => setNewSession({ ...newSession, countType: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white font-semibold"
                >
                  <option value="CYCLE_COUNT">Cycle Count (Targeted High-Velocity SKUs)</option>
                  <option value="BLIND_COUNT">Blind Count (System Expected Quantities Hidden)</option>
                  <option value="FULL_PHYSICAL">Full Physical Inventory Wall-to-Wall</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Audit Justification / Scope</label>
                <input
                  type="text"
                  required
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
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
                  Launch Count Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode / Item Count Recording Modal */}
      {showScanModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Scan / Count Physical Item</h3>
              <button onClick={() => setShowScanModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordCount} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Product Barcode or SKU *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Scan barcode or type SKU..."
                  value={scanForm.barcodeOrSku}
                  onChange={(e) => setScanForm({ ...scanForm, barcodeOrSku: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active font-mono uppercase"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Physical Counted Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={scanForm.physicalQuantity}
                  onChange={(e) => setScanForm({ ...scanForm, physicalQuantity: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowScanModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Save Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {showReconcileModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Approve &amp; Reconcile Count Session</h3>
              <button onClick={() => setShowReconcileModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReconcile} className="p-5 space-y-4">
              <p className="text-xs text-brand-muted">
                Authorizing reconciliation will post adjusting stock movements directly through the transactional engine,
                aligning physical inventory balances to the audited count.
              </p>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Reason Code *</label>
                <select
                  value={reconcileForm.reason}
                  onChange={(e) => setReconcileForm({ ...reconcileForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white"
                >
                  <option value="CYCLE_COUNT_DISCREPANCY">Cycle Count Discrepancy Adjustment</option>
                  <option value="ANNUAL_PHYSICAL_RECONCILIATION">Annual Physical Audit Reconciliation</option>
                  <option value="DAMAGE_OR_SHRINKAGE">Shrinkage &amp; Handling Discrepancy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Auditor Remarks</label>
                <input
                  type="text"
                  value={reconcileForm.notes}
                  onChange={(e) => setReconcileForm({ ...reconcileForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowReconcileModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-xs"
                >
                  Post Ledger Reconciliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
