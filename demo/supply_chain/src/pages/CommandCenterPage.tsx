import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Factory,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const CommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCommandData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/dashboard/summary');
      setData(res);
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-brand-active animate-spin" />
      </div>
    );
  }

  const { operational, kpis } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Operations Command Center</h1>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Mission-critical operational dispatch console. Highlights immediate bottlenecks, holds, and dispatch requirements.
          </p>
        </div>

        <button
          onClick={fetchCommandData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Operations</span>
        </button>
      </div>

      {/* Critical Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase">Quarantines &amp; Holds</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-900 mt-2">{kpis.qualityIssues}</div>
          <div className="text-[11px] text-rose-700 mt-1">Requires QA evaluation</div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase">Stockout Risks</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-900 mt-2">{kpis.lowStockItems}</div>
          <div className="text-[11px] text-amber-700 mt-1">&lt; Reorder threshold</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase">Procurement Approvals</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-900 mt-2">{kpis.poAwaitingApproval}</div>
          <div className="text-[11px] text-purple-700 mt-1">Orders &gt; $5,000 threshold</div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase">Active Production</span>
            <Factory className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 mt-2">{kpis.activeMfgOrders}</div>
          <div className="text-[11px] text-emerald-700 mt-1">Assemblies in progress</div>
        </div>
      </div>

      {/* Critical Actions & Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-3">
          <h3 className="text-sm font-bold text-brand-text">Immediate Stockout Actions Needed</h3>
          <div className="space-y-2">
            {operational.lowStockAlerts.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-white border border-brand-border rounded-lg text-xs"
              >
                <div>
                  <div className="font-bold text-brand-text">{item.productName}</div>
                  <div className="text-brand-muted">
                    Warehouse: {item.warehouseName} | On-Hand: <strong>{item.onHandQty}</strong> (Min: {item.minStock})
                  </div>
                </div>
                <button
                  onClick={() => navigate('/replenishment')}
                  className="px-2.5 py-1 bg-brand-active text-white rounded font-semibold hover:bg-brand-teal"
                >
                  Replenish
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-3">
          <h3 className="text-sm font-bold text-brand-text">Pending High-Value Authorizations</h3>
          <div className="space-y-2">
            {operational.pendingApprovals.map((app: any) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 bg-white border border-brand-border rounded-lg text-xs"
              >
                <div>
                  <div className="font-bold text-brand-text">{app.title}</div>
                  <div className="text-brand-muted">
                    Amount: <strong>${app.amount?.toFixed(2)}</strong> | By: {app.requestedBy?.email}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/purchase')}
                  className="px-2.5 py-1 bg-emerald-700 text-white rounded font-semibold hover:bg-emerald-800"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
