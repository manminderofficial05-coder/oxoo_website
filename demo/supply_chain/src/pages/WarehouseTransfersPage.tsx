import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Plus,
  RefreshCw,
  CheckCircle2,
  X,
  Truck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useWarehouse } from '../context/WarehouseContext.js';

export const WarehouseTransfersPage: React.FC = () => {
  const { warehouses } = useWarehouse();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Transfer Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fromWh, setFromWh] = useState('');
  const [toWh, setToWh] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [transferQty, setTransferQty] = useState('10');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ transfers: any[] }>('/transfers');
      setTransfers(res.transfers || []);
    } catch (err) {
      console.error('Failed to load transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
    apiRequest<{ products: any[] }>('/products?limit=50').then((res) => {
      setProducts(res.products || []);
      if (res.products[0]) setSelectedProduct(res.products[0].id);
    });
  }, []);

  useEffect(() => {
    if (warehouses.length >= 2) {
      setFromWh(warehouses[0].id);
      setToWh(warehouses[1].id);
    }
  }, [warehouses]);

  // Scenario C: Dispatch Transfer
  const handleDispatch = async (transferId: string) => {
    try {
      await apiRequest(`/transfers/${transferId}/dispatch`, { method: 'POST' });
      setFeedback('Transfer dispatched in-transit. Source warehouse balance updated.');
      fetchTransfers();
    } catch (err: any) {
      setFeedback(`Dispatch failed: ${err.message}`);
    }
  };

  // Scenario C: Receive Transfer at Destination
  const handleReceive = async (transferId: string) => {
    try {
      await apiRequest(`/transfers/${transferId}/receive`, { method: 'POST' });
      setFeedback('Transfer received at destination. Stock conserved company-wide.');
      fetchTransfers();
    } catch (err: any) {
      setFeedback(`Receipt failed: ${err.message}`);
    }
  };

  // Create Transfer
  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWh === toWh) {
      alert('Source and destination warehouse must be different');
      return;
    }

    setCreateLoading(true);
    try {
      await apiRequest('/transfers', {
        method: 'POST',
        body: JSON.stringify({
          fromWarehouseId: fromWh,
          toWarehouseId: toWh,
          notes: 'Inter-facility inventory rebalance',
          lines: [{ productId: selectedProduct, quantityRequested: parseFloat(transferQty) || 1 }],
        }),
      });

      setShowCreateModal(false);
      setFeedback('New internal transfer created!');
      fetchTransfers();
    } catch (err: any) {
      alert(err.message || 'Failed to create transfer');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Internal Warehouse Transfers</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Scenario C Live
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Inter-facility logistics with strict multi-warehouse stock conservation and in-transit tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Transfers Table */}
      <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
              <tr>
                <th className="py-3 px-3.5">Transfer #</th>
                <th className="py-3 px-3">From Warehouse</th>
                <th className="py-3 px-3">To Warehouse</th>
                <th className="py-3 px-3">Item Transferred</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-muted">
                    Loading transfers...
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-muted">
                    No transfers found.
                  </td>
                </tr>
              ) : (
                transfers.map((t) => {
                  const line = t.lines[0];
                  return (
                    <tr key={t.id} className="hover:bg-brand-bg/60 transition-colors">
                      <td className="py-2.5 px-3.5 font-semibold text-brand-text">{t.transferNumber}</td>
                      <td className="py-2.5 px-3 text-brand-text font-medium">{t.fromWarehouse?.name}</td>
                      <td className="py-2.5 px-3 text-brand-text font-medium">{t.toWarehouse?.name}</td>
                      <td className="py-2.5 px-3 text-brand-muted">{line?.product?.name || 'Multiple items'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-brand-text">
                        {line?.quantityRequested || 0}
                      </td>
                      <td className="py-2.5 px-3">
                        {t.status === 'COMPLETED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            COMPLETED
                          </span>
                        ) : t.status === 'IN_TRANSIT' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            IN TRANSIT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {t.status}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {t.status === 'DRAFT' || t.status === 'RESERVED' ? (
                          <button
                            onClick={() => handleDispatch(t.id)}
                            className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            Dispatch Goods
                          </button>
                        ) : t.status === 'IN_TRANSIT' ? (
                          <button
                            onClick={() => handleReceive(t.id)}
                            className="px-2.5 py-1 bg-brand-active hover:bg-brand-teal text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            Receive Goods
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Received</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transfer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-bold text-brand-text">Create Internal Transfer</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-brand-muted hover:text-brand-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">Source Warehouse (From) *</label>
                <select
                  value={fromWh}
                  onChange={(e) => setFromWh(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">Destination Warehouse (To) *</label>
                <select
                  value={toWh}
                  onChange={(e) => setToWh(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">Select Product *</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">Transfer Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-brand-muted hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active transition-colors disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
