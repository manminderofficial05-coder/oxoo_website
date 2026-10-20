import React, { useState, useEffect } from 'react';
import {
  History,
  RefreshCw,
  Clock,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const ActivityFeedPage: React.FC = () => {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ movements: any[] }>('/inventory/movements?limit=100');
      setMovements(res.movements || []);
    } catch (err) {
      console.error('Failed to load activity feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text">Enterprise Activity Ledger &amp; Audit</h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Immutable log of all physical receipts, dispatches, adjustments, and transactions.
          </p>
        </div>

        <button
          onClick={fetchMovements}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
              <tr>
                <th className="py-3 px-3.5">Transaction ID</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Operation Type</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3">Warehouse / Location</th>
                <th className="py-3 px-3">Actor / Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-muted font-sans">
                    Loading activity feed...
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-brand-text">{m.movementNumber}</td>
                    <td className="py-2.5 px-3 text-brand-muted font-sans">{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-brand-text">{m.product?.name}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {m.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-teal font-sans">
                      {m.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted font-sans">
                      {m.destWarehouse?.name || m.sourceWarehouse?.name || m.destLocation || 'Internal'}
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted font-sans">{m.performedBy || 'System'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
