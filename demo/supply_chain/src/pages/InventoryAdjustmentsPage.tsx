import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useWarehouse } from '../context/WarehouseContext.js';

export const InventoryAdjustmentsPage: React.FC = () => {
  const { warehouses, selectedWarehouseId } = useWarehouse();
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBalance, setSelectedBalance] = useState<any | null>(null);
  const [countedQty, setCountedQty] = useState('');
  const [reason, setReason] = useState('Physical cycle count discrepancy');
  const [adjusting, setAdjusting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const url = selectedWarehouseId ? `/inventory/balances?warehouseId=${selectedWarehouseId}` : '/inventory/balances';
      const res = await apiRequest<{ balances: any[] }>(url);
      setBalances(res.balances || []);
    } catch (err) {
      console.error('Failed to load balances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [selectedWarehouseId]);

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBalance || countedQty === '' || !reason) {
      alert('Please enter counted quantity and mandatory reason.');
      return;
    }

    setAdjusting(true);
    try {
      await apiRequest('/inventory/adjustments', {
        method: 'POST',
        body: JSON.stringify({
          warehouseId: selectedBalance.warehouseId,
          locationCode: selectedBalance.location.code,
          productId: selectedBalance.productId,
          countedQuantity: parseFloat(countedQty),
          reason,
        }),
      });

      setFeedback(`Inventory adjustment applied for ${selectedBalance.product.name}. System stock updated.`);
      setSelectedBalance(null);
      fetchBalances();
    } catch (err: any) {
      alert(`Adjustment error: ${err.message}`);
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Inventory Adjustments &amp; Cycle Counts</h1>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Compare physical cycle counts with book inventory. Adjustments require mandatory operational reasoning and write to the audit ledger.
          </p>
        </div>

        <button
          onClick={fetchBalances}
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

      {/* Stock Balances for Counting */}
      <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
              <tr>
                <th className="py-3 px-3.5">Product &amp; SKU</th>
                <th className="py-3 px-3">Warehouse</th>
                <th className="py-3 px-3">Location Code</th>
                <th className="py-3 px-3 text-right">System Stock</th>
                <th className="py-3 px-3 text-right">Unit Cost</th>
                <th className="py-3 px-3 text-right">Total Value</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-muted">
                    Loading inventory records...
                  </td>
                </tr>
              ) : balances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-muted">
                    No balances found.
                  </td>
                </tr>
              ) : (
                balances.map((b) => (
                  <tr key={b.id} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-brand-text">{b.product?.name}</div>
                      <div className="text-[10px] font-mono text-brand-muted">{b.product?.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-brand-text">{b.warehouse?.name}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-brand-active">{b.location?.code}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-text">{b.onHandQty}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-brand-muted">
                      ${b.product?.costPrice?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-teal">${b.stockValue?.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedBalance(b);
                          setCountedQty(String(b.onHandQty));
                        }}
                        className="px-2.5 py-1 bg-brand-teal text-white rounded text-[11px] font-semibold hover:bg-brand-active transition-colors shadow-2xs"
                      >
                        Adjust / Count
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {selectedBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-bold text-brand-text">Apply Inventory Adjustment</h3>
              <button onClick={() => setSelectedBalance(null)} className="text-brand-muted hover:text-brand-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-brand-bg rounded-lg text-xs space-y-1">
              <div>
                <strong>Product:</strong> {selectedBalance.product?.name} ({selectedBalance.product?.sku})
              </div>
              <div>
                <strong>Warehouse:</strong> {selectedBalance.warehouse?.name} ({selectedBalance.location?.code})
              </div>
              <div>
                <strong>Current System Stock:</strong>{' '}
                <span className="font-bold text-brand-teal">{selectedBalance.onHandQty} units</span>
              </div>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">Physical Counted Quantity *</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={countedQty}
                  onChange={(e) => setCountedQty(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active font-bold"
                />
              </div>

              {countedQty !== '' && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between">
                  <span>Quantity Difference:</span>
                  <strong
                    className={
                      parseFloat(countedQty) - selectedBalance.onHandQty >= 0
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }
                  >
                    {parseFloat(countedQty) - selectedBalance.onHandQty >= 0 ? '+' : ''}
                    {(parseFloat(countedQty) - selectedBalance.onHandQty).toFixed(2)} units
                  </strong>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">Reason for Adjustment *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                >
                  <option>Physical cycle count discrepancy</option>
                  <option>Damaged stock identified during inspection</option>
                  <option>Found unrecorded inventory</option>
                  <option>Warehouse reorganization recount</option>
                  <option>Supplier shortage adjustment</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setSelectedBalance(null)}
                  className="px-4 py-2 text-xs font-medium text-brand-muted hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-4 py-2 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active transition-colors disabled:opacity-50"
                >
                  {adjusting ? 'Applying...' : 'Apply Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
