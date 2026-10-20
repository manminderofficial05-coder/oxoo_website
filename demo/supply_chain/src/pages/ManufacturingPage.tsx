import React, { useState, useEffect } from 'react';
import {
  Factory,
  Layers,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  Check,
  Package,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useWarehouse } from '../context/WarehouseContext.js';

export const ManufacturingPage: React.FC = () => {
  const { warehouses, selectedWarehouseId } = useWarehouse();
  const [activeTab, setActiveTab] = useState<'orders' | 'boms'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [boms, setBoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchManufacturing = async () => {
    setLoading(true);
    try {
      const [ordRes, bomRes] = await Promise.all([
        apiRequest<{ orders: any[] }>('/manufacturing/orders'),
        apiRequest<{ boms: any[] }>('/manufacturing/boms'),
      ]);
      setOrders(ordRes.orders || []);
      setBoms(bomRes.boms || []);
    } catch (err) {
      console.error('Failed to load manufacturing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturing();
  }, [selectedWarehouseId]);

  // Scenario E: Start Production
  const handleStartMO = async (moId: string) => {
    try {
      await apiRequest(`/manufacturing/orders/${moId}/start`, { method: 'POST' });
      setFeedback('Manufacturing Order started in production!');
      fetchManufacturing();
    } catch (err: any) {
      alert(`Start failed: ${err.message}`);
    }
  };

  // Scenario E: Complete Production (deducts components, creates finished stock)
  const handleCompleteMO = async (moId: string, plannedQty: number) => {
    try {
      await apiRequest(`/manufacturing/orders/${moId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ producedQuantity: plannedQty }),
      });
      setFeedback('Manufacturing completed! Raw materials consumed, finished assembly added to warehouse stock.');
      fetchManufacturing();
    } catch (err: any) {
      alert(`Completion failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Manufacturing &amp; Assembly</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Scenario E Active
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Multi-component Bills of Materials, component shortage checks, material consumption, and production tracking.
          </p>
        </div>

        <button
          onClick={fetchManufacturing}
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
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-brand-active text-brand-active'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>Manufacturing Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('boms')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'boms'
              ? 'border-brand-active text-brand-active'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Bills of Materials ({boms.length})</span>
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-3.5">MO #</th>
                  <th className="py-3 px-3">Finished Product</th>
                  <th className="py-3 px-3">Warehouse</th>
                  <th className="py-3 px-3 text-right">Planned Qty</th>
                  <th className="py-3 px-3 text-right">Produced Qty</th>
                  <th className="py-3 px-3">Shortage Check</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {orders.map((mo) => (
                  <tr key={mo.id} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-brand-text">{mo.moNumber}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-brand-text">{mo.finishedProduct?.name}</div>
                      <div className="text-[10px] font-mono text-brand-muted">BOM: {mo.bom?.bomNumber} (v{mo.bom?.version})</div>
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted">{mo.warehouse?.name}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-text">{mo.plannedQuantity}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-800">{mo.producedQuantity}</td>
                    <td className="py-2.5 px-3">
                      {mo.hasShortage ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Component Shortage</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                          <Check className="w-3 h-3" />
                          <span>Materials Ready</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {mo.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      {mo.status === 'CONFIRMED' || mo.status === 'PLANNED' ? (
                        <button
                          onClick={() => handleStartMO(mo.id)}
                          className="px-2.5 py-1 bg-brand-active hover:bg-brand-teal text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Play className="w-3 h-3" />
                          <span>Start MO</span>
                        </button>
                      ) : mo.status === 'IN_PROGRESS' ? (
                        <button
                          onClick={() => handleCompleteMO(mo.id, mo.plannedQuantity)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto shadow-2xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>Complete Production</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700">Finished</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'boms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {boms.map((bom) => (
            <div key={bom.id} className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-brand-muted uppercase">{bom.bomNumber}</span>
                  <h3 className="text-sm font-bold text-brand-text">{bom.finishedProduct?.name}</h3>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-brand-bg border border-brand-border rounded">
                  v{bom.version}
                </span>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-1.5">
                  Component Bill of Materials
                </h4>
                <div className="space-y-1 bg-white border border-brand-border rounded-lg p-2.5">
                  {bom.components?.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-brand-border/40 last:border-none">
                      <span className="text-brand-text font-medium">{c.componentProduct?.name}</span>
                      <span className="font-bold text-brand-teal font-mono">
                        {c.quantityRequired} {c.componentProduct?.uom?.symbol || 'pcs'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-brand-muted pt-1 flex items-center justify-between">
                <span>Estimated Time: <strong>{bom.estimatedHours} hrs</strong></span>
                <span>Scrap Allowance: <strong>{bom.scrapRatePercent}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
