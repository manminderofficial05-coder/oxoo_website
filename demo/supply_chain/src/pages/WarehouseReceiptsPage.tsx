import React, { useState, useEffect } from 'react';
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Truck,
  Package,
  X,
  ExternalLink,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useWarehouse } from '../context/WarehouseContext.js';

export const WarehouseReceiptsPage: React.FC = () => {
  const { selectedWarehouseId } = useWarehouse();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [validating, setValidating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const url = selectedWarehouseId ? `/receipts?warehouseId=${selectedWarehouseId}` : '/receipts';
      const res = await apiRequest<{ receipts: any[] }>(url);
      setReceipts(res.receipts || []);
    } catch (err) {
      console.error('Failed to load receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [selectedWarehouseId]);

  // Scenario B: Validate Receipt
  const handleValidateReceipt = async (receiptId: string) => {
    setValidating(true);
    setFeedback(null);
    try {
      const res = await apiRequest(`/receipts/${receiptId}/validate`, { method: 'POST' });
      setFeedback(`Receipt ${res.receipt.receiptNumber} validated! Physical stock increased and PO updated.`);
      fetchReceipts();
      if (selectedReceipt && selectedReceipt.id === receiptId) {
        setSelectedReceipt(res.receipt);
      }
    } catch (err: any) {
      setFeedback(`Validation error: ${err.message}`);
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
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Goods Receipts &amp; Inbound Dock</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Scenario B Active
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Verify arriving deliveries, scan product lots, and validate receipts to increment physical inventory.
          </p>
        </div>

        <button
          onClick={fetchReceipts}
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

      {/* Receipts List */}
      <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
              <tr>
                <th className="py-3 px-3.5">Receipt #</th>
                <th className="py-3 px-3">Purchase Order</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">Warehouse</th>
                <th className="py-3 px-3 text-right">Lines</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-muted">
                    Loading receipts...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-muted">
                    No receipts found for selected warehouse.
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-brand-text">{r.receiptNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-brand-muted">
                      {r.po ? r.po.poNumber : <span className="text-slate-400">Direct Inbound</span>}
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted">{r.supplier?.name || 'Direct Procurement'}</td>
                    <td className="py-2.5 px-3 text-brand-muted">{r.warehouse?.name}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-text">{r.lines?.length || 0}</td>
                    <td className="py-2.5 px-3">
                      {r.status === 'VALIDATED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          VALIDATED
                        </span>
                      ) : r.status === 'PENDING_INSPECTION' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          QA HOLD
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          DRAFT
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedReceipt(r)}
                        className="px-2.5 py-1 bg-white border border-brand-border rounded text-[11px] font-semibold text-brand-text hover:bg-brand-bg"
                      >
                        Inspect
                      </button>
                      {r.status !== 'VALIDATED' && (
                        <button
                          onClick={() => handleValidateReceipt(r.id)}
                          disabled={validating}
                          className="px-2.5 py-1 bg-brand-active text-white rounded text-[11px] font-semibold hover:bg-brand-teal transition-colors disabled:opacity-50"
                        >
                          Validate
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

      {/* Selected Receipt Modal Drawer */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-brand-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div>
                <h3 className="text-base font-bold text-brand-text">
                  Goods Receipt: {selectedReceipt.receiptNumber}
                </h3>
                <p className="text-xs text-brand-muted">
                  Warehouse: {selectedReceipt.warehouse?.name} | Supplier: {selectedReceipt.supplier?.name || 'N/A'}
                </p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-brand-muted hover:text-brand-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Expected Lines Table */}
            <div>
              <h4 className="text-xs font-bold text-brand-text mb-2 uppercase tracking-wide">
                Received Product Lines
              </h4>
              <div className="border border-brand-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                    <tr>
                      <th className="py-2 px-3">Product</th>
                      <th className="py-2 px-3">Location</th>
                      <th className="py-2 px-3 text-right">Expected</th>
                      <th className="py-2 px-3 text-right">Received</th>
                      <th className="py-2 px-3">Lot / Serial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40">
                    {selectedReceipt.lines?.map((l: any) => (
                      <tr key={l.id}>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-brand-text">{l.product?.name}</div>
                          <div className="text-[10px] font-mono text-brand-muted">{l.product?.sku}</div>
                        </td>
                        <td className="py-2.5 px-3 text-brand-muted font-mono">{l.locationCode || 'REC-01'}</td>
                        <td className="py-2.5 px-3 text-right text-brand-muted">{l.quantityExpected}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-800">
                          {selectedReceipt.status === 'VALIDATED' ? l.quantityReceived : l.quantityExpected}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-brand-active">
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
                Status:{' '}
                <strong className="text-brand-text font-bold uppercase">{selectedReceipt.status}</strong>
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 text-xs font-medium text-brand-muted hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                {selectedReceipt.status !== 'VALIDATED' && (
                  <button
                    onClick={() => handleValidateReceipt(selectedReceipt.id)}
                    disabled={validating}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-teal transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Validate Receipt (Update Stock)</span>
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
