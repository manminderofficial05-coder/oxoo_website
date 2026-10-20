import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  ArrowDownToLine,
  Layers,
  X,
  FileText,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const QualityReceivingPage: React.FC = () => {
  const [checks, setChecks] = useState<any[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form
  const [evalForm, setEvalForm] = useState({
    status: 'PASSED',
    actualValue: '99.5',
    notes: 'Inbound inspection passed dimensional and electrical tolerance tests.',
    correctiveAction: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ checks: any[] }>('/quality/checks');
      const list = res.checks || [];
      setChecks(list);
      if (list.length > 0 && !selectedCheck) {
        setSelectedCheck(list[0]);
      }
    } catch (err) {
      console.error('Failed to load quality receiving checks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCheck) return;
    try {
      const res = await apiRequest(`/quality/checks/${selectedCheck.id}/evaluate`, {
        method: 'POST',
        body: JSON.stringify(evalForm),
      });

      if (evalForm.status === 'PASSED') {
        setFeedback(`Inspection PASSED! Goods released from Quality Hold into Available Stock.`);
      } else {
        setFeedback(`Inspection FAILED! Goods placed on QA Hold & Non-Conformance Issue generated.`);
      }

      setShowEvaluateModal(false);
      await fetchData();
      if (res.check) setSelectedCheck(res.check);
    } catch (err: any) {
      setFeedback(`Evaluation failed: ${err.message}`);
    }
  };

  const filtered = checks.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      c.checkNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.product?.name && c.product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.product?.sku && c.product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASSED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const pendingCount = checks.filter((c) => c.status === 'PENDING').length;
  const passedCount = checks.filter((c) => c.status === 'PASSED').length;
  const failedCount = checks.filter((c) => c.status === 'FAILED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Quality Receiving</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Inbound Dock Inspection Station
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Inspect arriving delivery lots, record dimensional/electrical tolerances, and authorize stock release.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
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

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Awaiting Inspection</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-brand-muted mt-0.5">Inbound quarantine buffer</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Inspections Passed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{passedCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Released into general stock</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Quarantine Holds</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{failedCount}</div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">Outbound dispatch blocked</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">First-Pass Acceptance</span>
            <ShieldCheck className="w-4 h-4 text-brand-active" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">98.8%</div>
          <div className="text-[11px] text-brand-muted mt-0.5">Supplier quality compliance</div>
        </div>
      </div>

      {/* Main Grid: Inspection Queue & Evaluation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inspection Table */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search QC #, product name, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {['ALL', 'PENDING', 'PASSED', 'FAILED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-brand-active text-white'
                      : 'bg-brand-bg text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4">QC Inspection #</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Sample Qty</th>
                  <th className="py-3 px-3">Criteria / Threshold</th>
                  <th className="py-3 px-3 text-center">QA Hold</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filtered.map((c) => {
                  const isSelected = selectedCheck?.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCheck(c)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-active/5 font-medium' : 'hover:bg-brand-bg/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-brand-text">{c.checkNumber}</div>
                        <div className="text-[10px] text-brand-muted">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-brand-text">{c.product?.name}</div>
                        <div className="text-[10px] font-mono text-brand-muted">{c.product?.sku}</div>
                      </td>
                      <td className="py-3 px-3 text-brand-text font-medium">
                        {c.sampleQuantity} {c.product?.uom?.code || 'units'}
                      </td>
                      <td className="py-3 px-3 text-brand-muted">
                        {c.threshold || 'Standard Specification Tolerance'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {c.holdActive ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            BLOCKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                            RELEASED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Inspection Detail Panel */}
        <div className="lg:col-span-1 space-y-4">
          {selectedCheck ? (
            <div className="bg-brand-card border border-brand-border rounded-xl shadow-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-brand-text font-mono">{selectedCheck.checkNumber}</h2>
                  <span className="text-xs text-brand-muted">{selectedCheck.product?.name}</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getStatusBadge(selectedCheck.status)}`}>
                  {selectedCheck.status}
                </span>
              </div>

              {/* Inspection Info Card */}
              <div className="p-3 bg-brand-bg rounded-lg border border-brand-border space-y-2 text-xs">
                <div className="flex justify-between text-brand-muted">
                  <span>Product SKU:</span>
                  <span className="font-mono font-bold text-brand-text">{selectedCheck.product?.sku}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Sample Size Tested:</span>
                  <span className="font-semibold text-brand-text">
                    {selectedCheck.sampleQuantity} {selectedCheck.product?.uom?.code || 'units'}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Pass Threshold:</span>
                  <span className="font-medium text-brand-text">{selectedCheck.threshold || '≥ 98.0% Tolerance'}</span>
                </div>
                {selectedCheck.actualValue && (
                  <div className="flex justify-between text-brand-muted">
                    <span>Measured Value:</span>
                    <span className="font-bold text-brand-text">{selectedCheck.actualValue}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-muted">
                  <span>Quality Hold:</span>
                  <span className={selectedCheck.holdActive ? 'font-bold text-rose-600' : 'font-bold text-emerald-600'}>
                    {selectedCheck.holdActive ? 'ACTIVE (Outbound Blocked)' : 'RELEASED (Available for Dispatch)'}
                  </span>
                </div>
              </div>

              {selectedCheck.notes && (
                <div className="p-3 bg-white rounded-lg border border-brand-border text-xs">
                  <span className="font-semibold text-brand-text block mb-1">Inspector Notes:</span>
                  <p className="text-brand-muted">{selectedCheck.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-brand-border space-y-2">
                {selectedCheck.status === 'PENDING' && (
                  <button
                    onClick={() => setShowEvaluateModal(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Record Inspection Evaluation</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-brand-card border border-brand-border rounded-xl text-brand-muted text-xs">
              Select an inbound quality check to record inspection findings.
            </div>
          )}
        </div>
      </div>

      {/* Evaluate Modal */}
      {showEvaluateModal && selectedCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Record QA Inspection: {selectedCheck.checkNumber}</h3>
              <button onClick={() => setShowEvaluateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEvaluate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Inspection Disposition *</label>
                <select
                  value={evalForm.status}
                  onChange={(e) => setEvalForm({ ...evalForm, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white font-semibold"
                >
                  <option value="PASSED">PASSED (Release into General Inventory)</option>
                  <option value="FAILED">FAILED (Quarantine &amp; Block Outbound Movement)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Measured Value / Metric Result</label>
                <input
                  type="text"
                  required
                  value={evalForm.actualValue}
                  onChange={(e) => setEvalForm({ ...evalForm, actualValue: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Inspection Notes &amp; Observations</label>
                <textarea
                  rows={2}
                  value={evalForm.notes}
                  onChange={(e) => setEvalForm({ ...evalForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              {evalForm.status === 'FAILED' && (
                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">Corrective Action (CAPA)</label>
                  <input
                    type="text"
                    placeholder="e.g. Reject batch, issue vendor RMA"
                    value={evalForm.correctiveAction}
                    onChange={(e) => setEvalForm({ ...evalForm, correctiveAction: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-rose-300 rounded-lg focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowEvaluateModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Confirm Disposition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
