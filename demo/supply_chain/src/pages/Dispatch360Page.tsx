import React, { useState, useEffect } from 'react';
import {
  ArrowUpFromLine,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Truck,
  ShieldAlert,
  Layers,
  X,
  AlertTriangle,
  Package,
  ScanBarcode,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useWarehouse } from '../context/WarehouseContext.js';

export const Dispatch360Page: React.FC = () => {
  const { warehouses, selectedWarehouseId } = useWarehouse();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [newDelivery, setNewDelivery] = useState({
    warehouseId: '',
    orderReference: 'ORD-2026-DISP-01',
    lines: [{ productId: '', quantityOrdered: '10' }],
  });

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const url = selectedWarehouseId ? `/deliveries?warehouseId=${selectedWarehouseId}` : '/deliveries';
      const [delRes, prodRes] = await Promise.all([
        apiRequest<{ deliveries: any[] }>(url),
        apiRequest<{ products: any[] }>('/products'),
      ]);
      const list = delRes.deliveries || [];
      setDeliveries(list);
      setProducts(prodRes.products || []);

      if (list.length > 0 && !selectedDelivery) {
        setSelectedDelivery(list[0]);
      }
      if (prodRes.products?.length > 0 && !newDelivery.lines[0].productId) {
        setNewDelivery((prev) => ({
          ...prev,
          lines: [{ ...prev.lines[0], productId: prodRes.products[0].id }],
        }));
      }
      if (warehouses.length > 0 && !newDelivery.warehouseId) {
        setNewDelivery((prev) => ({ ...prev, warehouseId: warehouses[0].id }));
      }
    } catch (err) {
      console.error('Failed to load dispatch deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWarehouseId, warehouses]);

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const res = await apiRequest<{ delivery: any }>('/deliveries', {
        method: 'POST',
        body: JSON.stringify(newDelivery),
      });
      setFeedback(`Outbound delivery order ${res.delivery.deliveryNumber} generated!`);
      setShowCreateModal(false);
      await fetchData();
      setSelectedDelivery(res.delivery);
    } catch (err: any) {
      setErrorMessage(`Creation failed: ${err.message}`);
    }
  };

  const handleValidateAndDispatch = async (id: string) => {
    setErrorMessage(null);
    setFeedback(null);
    try {
      const res = await apiRequest<{ delivery: any }>(`/deliveries/${id}/validate`, {
        method: 'POST',
      });
      setFeedback(`Outbound shipment verified & dispatched! Physical stock decremented via Transaction Engine.`);
      await fetchData();
      if (res.delivery) setSelectedDelivery(res.delivery);
    } catch (err: any) {
      setErrorMessage(err.message || 'Dispatch validation error');
    }
  };

  const filtered = deliveries.filter((d) => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesSearch =
      d.deliveryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.orderReference && d.orderReference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.customer?.name && d.customer.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SHIPPED':
      case 'DONE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'READY':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DRAFT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
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
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Dispatch 360</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Outbound Fulfillment Hub
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Orchestrate pick-pack-ship operations, enforce QA hold blocking, and dispatch customer shipments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Outbound Order</span>
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
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outbound Deliveries Table */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search delivery #, customer, order reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {['ALL', 'DRAFT', 'READY', 'SHIPPED'].map((st) => (
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
                  <th className="py-3 px-4">Delivery #</th>
                  <th className="py-3 px-3">Facility</th>
                  <th className="py-3 px-3">Order Ref</th>
                  <th className="py-3 px-3">Lines</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filtered.map((d) => {
                  const isSelected = selectedDelivery?.id === d.id;
                  return (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDelivery(d)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-active/5 font-medium' : 'hover:bg-brand-bg/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-brand-text">{d.deliveryNumber}</div>
                        <div className="text-[10px] text-brand-muted">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-brand-text">{d.warehouse?.name || 'Central Facility'}</td>
                      <td className="py-3 px-3 font-mono text-brand-muted">{d.orderReference || 'N/A'}</td>
                      <td className="py-3 px-3 font-semibold text-brand-text">{d.lines?.length || 0} items</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Delivery Details & Fulfillment Action */}
        <div className="lg:col-span-1 space-y-4">
          {selectedDelivery ? (
            <div className="bg-brand-card border border-brand-border rounded-xl shadow-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-brand-text font-mono">{selectedDelivery.deliveryNumber}</h2>
                  <span className="text-xs text-brand-muted">{selectedDelivery.warehouse?.name}</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getStatusBadge(selectedDelivery.status)}`}>
                  {selectedDelivery.status}
                </span>
              </div>

              {/* Order Reference */}
              <div className="p-3 bg-brand-bg rounded-lg border border-brand-border space-y-1.5 text-xs">
                <div className="flex justify-between text-brand-muted">
                  <span>Customer Reference:</span>
                  <span className="font-medium text-brand-text">{selectedDelivery.orderReference || 'Direct Order'}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Fulfillment Dock:</span>
                  <span className="font-medium text-brand-text">Bay Outbound-1</span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">Order Items to Pick</h3>
                <div className="space-y-2">
                  {(selectedDelivery.lines || []).map((line: any) => (
                    <div key={line.id} className="p-2.5 rounded-lg border border-brand-border bg-white text-xs">
                      <div className="flex items-center justify-between font-semibold text-brand-text">
                        <span>{line.product?.name || 'Catalog Item'}</span>
                        <span>{line.quantityOrdered} units</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-brand-muted mt-1">
                        <span className="font-mono">{line.product?.sku}</span>
                        {line.lotNumber && <span className="font-mono">Lot: {line.lotNumber}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispatch Action */}
              <div className="pt-2 border-t border-brand-border space-y-2">
                {selectedDelivery.status !== 'SHIPPED' && selectedDelivery.status !== 'DONE' ? (
                  <button
                    onClick={() => handleValidateAndDispatch(selectedDelivery.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
                  >
                    <ArrowUpFromLine className="w-3.5 h-3.5" />
                    <span>Validate QA &amp; Dispatch Outbound</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-800 text-center">
                    Shipment verified and dispatched from warehouse dock.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-brand-card border border-brand-border rounded-xl text-brand-muted text-xs">
              Select an outbound delivery to view items.
            </div>
          )}
        </div>
      </div>

      {/* New Outbound Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Create Outbound Delivery Order</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDelivery} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Dispatching Facility *</label>
                <select
                  value={newDelivery.warehouseId}
                  onChange={(e) => setNewDelivery({ ...newDelivery, warehouseId: e.target.value })}
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
                <label className="block text-xs font-semibold text-brand-text mb-1">Customer / Order Reference</label>
                <input
                  type="text"
                  required
                  value={newDelivery.orderReference}
                  onChange={(e) => setNewDelivery({ ...newDelivery, orderReference: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active font-mono"
                />
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-8">
                  <label className="block text-xs font-semibold text-brand-text mb-1">Product</label>
                  <select
                    value={newDelivery.lines[0].productId}
                    onChange={(e) =>
                      setNewDelivery({
                        ...newDelivery,
                        lines: [{ ...newDelivery.lines[0], productId: e.target.value }],
                      })
                    }
                    className="w-full px-2 py-1.5 text-xs bg-white border border-brand-border rounded focus:outline-none focus:border-brand-active"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-4">
                  <label className="block text-xs font-semibold text-brand-text mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newDelivery.lines[0].quantityOrdered}
                    onChange={(e) =>
                      setNewDelivery({
                        ...newDelivery,
                        lines: [{ ...newDelivery.lines[0], quantityOrdered: e.target.value }],
                      })
                    }
                    className="w-full px-2 py-1.5 text-xs bg-white border border-brand-border rounded focus:outline-none focus:border-brand-active"
                  />
                </div>
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
                  Create Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
