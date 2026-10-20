import React, { useState, useEffect } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  X,
  Package,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const MaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workOrders' | 'assets'>('workOrders');
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const [woRes, assRes] = await Promise.all([
        apiRequest<{ workOrders: any[] }>('/maintenance/work-orders'),
        apiRequest<{ assets: any[] }>('/maintenance/assets'),
      ]);
      setWorkOrders(woRes.workOrders || []);
      setAssets(assRes.assets || []);
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  // Complete Work Order & Deduct Spare Parts
  const handleCompleteWO = async (woId: string) => {
    try {
      await apiRequest(`/maintenance/work-orders/${woId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ downtimeHours: 2.0, cost: 120.0, notes: 'Completed and verified by technician' }),
      });
      setFeedback('Work order completed! Spare parts deducted from inventory.');
      fetchMaintenance();
    } catch (err: any) {
      alert(`Completion failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text">Plant &amp; Equipment Maintenance</h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Asset register, preventive maintenance schedules, technician work orders, and automatic spare part inventory deduction.
          </p>
        </div>

        <button
          onClick={fetchMaintenance}
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
          onClick={() => setActiveTab('workOrders')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'workOrders'
              ? 'border-brand-active text-brand-active'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Work Orders ({workOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'assets'
              ? 'border-brand-active text-brand-active'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Equipment Asset Register ({assets.length})</span>
        </button>
      </div>

      {activeTab === 'workOrders' && (
        <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-3.5">Order #</th>
                  <th className="py-3 px-3">Asset Equipment</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Spare Part Required</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-brand-text">{wo.orderNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-brand-text">{wo.asset?.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {wo.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          wo.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800'
                            : wo.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {wo.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted max-w-xs truncate">{wo.description}</td>
                    <td className="py-2.5 px-3">
                      {wo.sparePart ? (
                        <span className="text-brand-text font-medium">
                          {wo.sparePart.name} ({wo.sparePartQty} units)
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {wo.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {wo.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => handleCompleteWO(wo.id)}
                          className="px-2.5 py-1 bg-brand-active hover:bg-brand-teal text-white rounded text-[11px] font-semibold transition-colors"
                        >
                          Complete &amp; Deduct Parts
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assets.map((a) => (
            <div key={a.id} className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-brand-muted uppercase">{a.assetCode}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded">
                  {a.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-brand-text">{a.name}</h3>
              <p className="text-xs text-brand-muted">Category: {a.category} | Location: {a.location}</p>
              <div className="pt-2 border-t border-brand-border text-xs text-brand-muted flex justify-between">
                <span>Maintenance Interval: <strong>{a.maintenanceIntervalDays} days</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
