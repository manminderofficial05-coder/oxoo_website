import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Building2,
  DollarSign,
  FileCheck2,
  AlertCircle,
  X,
  Send,
  Check,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useWarehouse } from '../context/WarehouseContext.js';

export const PurchasingPage: React.FC = () => {
  const { user, isProcurementManager, isAdmin } = useAuth();
  const { warehouses } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New PO Modal
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [lines, setLines] = useState([{ productId: '', quantity: '20', unitPrice: '45.00' }]);
  const [poLoading, setPoLoading] = useState(false);

  const fetchPurchasingData = async () => {
    setLoading(true);
    try {
      const [poRes, supRes] = await Promise.all([
        apiRequest<{ purchaseOrders: any[] }>('/purchase-orders'),
        apiRequest<{ suppliers: any[] }>('/suppliers'),
      ]);
      setPurchaseOrders(poRes.purchaseOrders || []);
      setSuppliers(supRes.suppliers || []);
    } catch (err) {
      console.error('Failed to load purchasing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasingData();
    apiRequest<{ products: any[] }>('/products?limit=50').then((res) => {
      setProducts(res.products || []);
      if (res.products[0]) {
        setLines([{ productId: res.products[0].id, quantity: '20', unitPrice: String(res.products[0].costPrice) }]);
      }
    });
  }, []);

  useEffect(() => {
    if (suppliers[0]) setSelectedSupplier(suppliers[0].id);
    if (warehouses[0]) setSelectedWarehouse(warehouses[0].id);
  }, [suppliers, warehouses]);

  // Submit PO
  const handleSubmitPO = async (poId: string) => {
    try {
      await apiRequest(`/purchase-orders/${poId}/submit`, { method: 'POST' });
      setFeedback('Purchase Order submitted! Evaluated against approval limit ($5,000).');
      fetchPurchasingData();
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    }
  };

  // Approve PO (Scenario D & Separation of duties test)
  const handleApprovePO = async (poId: string) => {
    try {
      await apiRequest(`/purchase-orders/${poId}/approve`, { method: 'POST' });
      setFeedback('Purchase Order approved by authorized manager.');
      fetchPurchasingData();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  // Create PO
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setPoLoading(true);
    try {
      await apiRequest('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify({
          supplierId: selectedSupplier,
          warehouseId: selectedWarehouse,
          lines: lines.map((l) => ({
            productId: l.productId,
            quantity: parseFloat(l.quantity) || 1,
            unitPrice: parseFloat(l.unitPrice) || 0,
          })),
        }),
      });

      setShowPOModal(false);
      setFeedback('Draft Purchase Order created successfully!');
      fetchPurchasingData();
    } catch (err: any) {
      alert(`Failed to create PO: ${err.message}`);
    } finally {
      setPoLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Purchase &amp; Procurement</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Approvals Enabled
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Full procurement lifecycle: RFQs, draft purchase orders, role-based approvals (&gt; $5,000 threshold), and receipt tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPOModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Purchase Order</span>
          </button>
        </div>
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
          <ShoppingCart className="w-4 h-4" />
          <span>Purchase Orders ({purchaseOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'suppliers'
              ? 'border-brand-active text-brand-active'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Suppliers Directory ({suppliers.length})</span>
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-3.5">PO #</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3">Warehouse</th>
                  <th className="py-3 px-3">Order Date</th>
                  <th className="py-3 px-3 text-right">Items</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                  <th className="py-3 px-3">Approval / Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-brand-muted">
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-brand-text">{po.poNumber}</td>
                    <td className="py-2.5 px-3 text-brand-muted font-medium">{po.supplier?.name}</td>
                    <td className="py-2.5 px-3 text-brand-muted">{po.warehouse?.name}</td>
                    <td className="py-2.5 px-3 text-brand-muted">{new Date(po.orderDate).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-text">{po.lines?.length || 0}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-teal">
                      ${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3">
                      {po.status === 'SUBMITTED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting Approval</span>
                        </span>
                      ) : po.status === 'APPROVED' || po.status === 'ORDERED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                          <Check className="w-3 h-3" />
                          <span>{po.status}</span>
                        </span>
                      ) : po.status === 'RECEIVED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          RECEIVED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {po.status}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      {po.status === 'DRAFT' && (
                        <button
                          onClick={() => handleSubmitPO(po.id)}
                          className="px-2.5 py-1 bg-brand-active text-white rounded text-[11px] font-semibold hover:bg-brand-teal transition-colors"
                        >
                          Submit
                        </button>
                      )}
                      {po.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleApprovePO(po.id)}
                          className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[11px] font-semibold hover:bg-emerald-800 transition-colors shadow-2xs"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-brand-card border border-brand-border rounded-xl p-4 shadow-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">{s.code}</span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  ★ {s.rating}
                </span>
              </div>
              <h3 className="text-sm font-bold text-brand-text">{s.name}</h3>
              <p className="text-xs text-brand-muted">Contact: {s.contactPerson || s.email || 'N/A'}</p>
              <div className="pt-2 border-t border-brand-border flex items-center justify-between text-xs text-brand-muted">
                <span>Lead Time: <strong>{s.leadTimeDays} days</strong></span>
                <span>Terms: <strong>{s.paymentTerms}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-bold text-brand-text">Create Draft Purchase Order</h3>
              <button onClick={() => setShowPOModal(false)} className="text-brand-muted hover:text-brand-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Supplier *</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Destination Warehouse *</label>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order Lines */}
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5 uppercase tracking-wide">
                  Product Lines
                </label>
                {lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-center">
                    <div className="col-span-6">
                      <select
                        value={line.productId}
                        onChange={(e) => {
                          const p = products.find((prod) => prod.id === e.target.value);
                          const updated = [...lines];
                          updated[idx].productId = e.target.value;
                          if (p) updated[idx].unitPrice = String(p.costPrice);
                          setLines(updated);
                        }}
                        className="w-full h-8 px-2 text-xs bg-white border border-brand-border rounded-md text-brand-text focus:outline-none focus:border-brand-active"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={line.quantity}
                        onChange={(e) => {
                          const updated = [...lines];
                          updated[idx].quantity = e.target.value;
                          setLines(updated);
                        }}
                        className="w-full h-8 px-2 text-xs bg-white border border-brand-border rounded-md text-brand-text focus:outline-none focus:border-brand-active"
                      />
                    </div>

                    <div className="col-span-3 text-xs font-bold text-brand-teal text-right">
                      ${(parseFloat(line.quantity || '0') * parseFloat(line.unitPrice || '0')).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 text-xs font-medium text-brand-muted hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={poLoading}
                  className="px-4 py-2 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active transition-colors disabled:opacity-50"
                >
                  {poLoading ? 'Creating...' : 'Create Draft PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
