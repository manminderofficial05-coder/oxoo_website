import React, { useState, useEffect } from 'react';
import {
  ArrowUpFromLine,
  CheckCircle2,
  AlertCircle,
  Truck,
  RefreshCw,
  X,
  ShieldAlert,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useWarehouse } from '../context/WarehouseContext.js';

export const WarehouseDeliveriesPage: React.FC = () => {
  const { selectedWarehouseId } = useWarehouse();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [validating, setValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const url = selectedWarehouseId ? `/deliveries?warehouseId=${selectedWarehouseId}` : '/deliveries';
      const res = await apiRequest<{ deliveries: any[] }>(url);
      setDeliveries(res.deliveries || []);
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [selectedWarehouseId]);

  // Scenario F: Validate Delivery with Quality Hold check
  const handleValidateDelivery = async (deliveryId: string) => {
    setValidating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await apiRequest(`/deliveries/${deliveryId}/validate`, { method: 'POST' });
      setSuccessMessage(`Delivery ${res.delivery.deliveryNumber} validated and shipped! Stock decremented.`);
      fetchDeliveries();
      if (selectedDelivery && selectedDelivery.id === deliveryId) {
        setSelectedDelivery(res.delivery);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Delivery validation blocked.');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Outbound Deliveries &amp; Shipping</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Scenario F Protected
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Customer shipments, picking validation, and automated quality hold enforcement.
          </p>
        </div>

        <button
          onClick={fetchDeliveries}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Prominent Quality Hold Alert Banner if triggered */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-900">DISPATCH BLOCKED: Quality Quarantine Enforcement</h4>
            <p className="text-xs text-rose-800 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Deliveries Table */}
      <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
              <tr>
                <th className="py-3 px-3.5">Delivery #</th>
                <th className="py-3 px-3">Customer Order Ref</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Warehouse</th>
                <th className="py-3 px-3 text-right">Items</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-muted">
                    Loading outbound orders...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-muted">
                    No deliveries found for selected warehouse.
                  </td>
                </tr>
              ) : (
                deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-brand-text">{d.deliveryNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-brand-muted">{d.orderReference || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-brand-muted">{d.customer?.name || 'Direct Customer'}</td>
                    <td className="py-2.5 px-3 text-brand-muted">{d.warehouse?.name}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-text">{d.lines?.length || 0}</td>
                    <td className="py-2.5 px-3">
                      {d.status === 'SHIPPED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          SHIPPED
                        </span>
                      ) : d.status === 'PACKED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          PACKED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {d.status}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedDelivery(d)}
                        className="px-2.5 py-1 bg-white border border-brand-border rounded text-[11px] font-semibold text-brand-text hover:bg-brand-bg"
                      >
                        Details
                      </button>
                      {d.status !== 'SHIPPED' && (
                        <button
                          onClick={() => handleValidateDelivery(d.id)}
                          disabled={validating}
                          className="px-2.5 py-1 bg-brand-active text-white rounded text-[11px] font-semibold hover:bg-brand-teal transition-colors disabled:opacity-50"
                        >
                          Ship Order
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Delivery Drawer */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div>
                <h3 className="text-base font-bold text-brand-text">Delivery: {selectedDelivery.deliveryNumber}</h3>
                <p className="text-xs text-brand-muted">
                  Customer: {selectedDelivery.customer?.name} | Warehouse: {selectedDelivery.warehouse?.name}
                </p>
              </div>
              <button onClick={() => setSelectedDelivery(null)} className="text-brand-muted hover:text-brand-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-brand-text mb-2 uppercase tracking-wide">Shipment Line Items</h4>
              <div className="border border-brand-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                    <tr>
                      <th className="py-2 px-3">Product</th>
                      <th className="py-2 px-3 text-right">Quantity</th>
                      <th className="py-2 px-3">Lot / Serial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40">
                    {selectedDelivery.lines?.map((l: any) => (
                      <tr key={l.id}>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-brand-text">{l.product?.name}</div>
                          <div className="text-[10px] font-mono text-brand-muted">{l.product?.sku}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-brand-text">{l.quantityOrdered}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-brand-muted">
                          {l.lotNumber || l.serialNumber || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-brand-border">
              <span className="text-xs text-brand-muted">
                Status: <strong className="text-brand-text font-bold uppercase">{selectedDelivery.status}</strong>
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="px-4 py-2 text-xs font-medium text-brand-muted hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                {selectedDelivery.status !== 'SHIPPED' && (
                  <button
                    onClick={() => handleValidateDelivery(selectedDelivery.id)}
                    disabled={validating}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-teal transition-colors disabled:opacity-50"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Confirm Shipment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
