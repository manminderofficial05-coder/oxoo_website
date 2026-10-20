import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Trash2,
  CheckCircle2,
  Plus,
  RefreshCw,
  X,
  Package,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const ReturnsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'returns' | 'scrap'>('returns');
  const [returns, setReturns] = useState<any[]>([]);
  const [scraps, setScraps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchReturnsAndScrap = async () => {
    setLoading(true);
    try {
      const [retRes, scrRes] = await Promise.all([
        apiRequest<{ returns: any[] }>('/returns'),
        apiRequest<{ scraps: any[] }>('/returns/scrap'),
      ]);
      setReturns(retRes.returns || []);
      setScraps(scrRes.scraps || []);
    } catch (err) {
      console.error('Failed to load returns/scrap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnsAndScrap();
  }, []);

  const handleProcessReturn = async (returnId: string, decision: 'RESTOCKED' | 'QUARANTINED' | 'SCRAPPED') => {
    try {
      await apiRequest(`/returns/${returnId}/process`, {
        method: 'POST',
        body: JSON.stringify({ decision, notes: `Processed with decision: ${decision}` }),
      });
      setFeedback(`Return processed as ${decision}. Inventory balance updated accordingly.`);
      fetchReturnsAndScrap();
    } catch (err: any) {
      alert(`Processing error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text">Returns &amp; Scrap Management</h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Customer returns triage (Restock, Quarantine, Scrap) and damaged stock write-off with cost tracking.
          </p>
        </div>

        <button
          onClick={fetchReturnsAndScrap}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-brand-border space-x-1">
        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'returns'
              ? 'border-brand-active text-brand-active'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Customer Returns ({returns.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('scrap')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'scrap'
              ? 'border-brand-active text-brand-active'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Scrap Ledger ({scraps.length})</span>
        </button>
      </div>

      {activeTab === 'returns' && (
        <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-3.5">Return #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3">Condition</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Triage Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-brand-text">{ret.returnNumber}</td>
                    <td className="py-2.5 px-3 text-brand-muted">{ret.customer?.name || 'Direct Customer'}</td>
                    <td className="py-2.5 px-3 font-semibold text-brand-text">{ret.product?.name}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-text">{ret.quantity}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {ret.condition}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted max-w-xs truncate">{ret.reason}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ret.status === 'RESTOCKED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ret.status === 'SCRAPPED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      {ret.status !== 'RESTOCKED' && ret.status !== 'SCRAPPED' ? (
                        <>
                          <button
                            onClick={() => handleProcessReturn(ret.id, 'RESTOCKED')}
                            className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-semibold transition-colors"
                          >
                            Restock
                          </button>
                          <button
                            onClick={() => handleProcessReturn(ret.id, 'SCRAPPED')}
                            className="px-2 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded text-[10px] font-semibold transition-colors"
                          >
                            Scrap
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-brand-muted font-medium">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'scrap' && (
        <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-3.5">Scrap #</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3 text-right">Cost Impact ($)</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Authorized By</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {scraps.map((s) => (
                  <tr key={s.id} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-brand-text">{s.scrapNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-brand-text">{s.product?.name}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-800">{s.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-800">
                      -${s.totalCostImpact?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted">{s.reason}</td>
                    <td className="py-2.5 px-3 text-brand-muted">{s.authorizedBy}</td>
                    <td className="py-2.5 px-3 text-brand-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
