import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Boxes,
  TrendingUp,
  History,
  Hash,
  Truck,
  DollarSign,
  ScanBarcode,
  MapPin,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'forecast' | 'movements' | 'lots' | 'suppliers'>('overview');

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ product: any }>(`/products/${id}`);
      setProduct(res.product);
    } catch (err) {
      console.error('Failed to load product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-brand-active animate-spin" />
      </div>
    );
  }

  const { stock, movements = [], lots = [], serials = [], purchaseHistory = [] } = product;

  return (
    <div className="space-y-6">
      {/* Back button & Page Header */}
      <div>
        <button
          onClick={() => navigate('/inventory')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-text mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Catalog</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-card border border-brand-border rounded-xl shrink-0 shadow-xs">
              <Package className="w-8 h-8 text-brand-teal" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-brand-text">{product.name}</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-700">
                  {product.type}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-brand-muted mt-1">
                <span>SKU: {product.sku}</span>
                <span>Barcode: {product.barcode}</span>
                <span>Category: {product.category?.name}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/barcode-scanner?barcode=${product.barcode}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal text-white text-xs font-semibold rounded-lg hover:bg-brand-active transition-colors shadow-xs"
          >
            <ScanBarcode className="w-3.5 h-3.5" />
            <span>Scan Terminal</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-brand-card border border-brand-border rounded-xl p-3 shadow-card">
          <div className="text-[10px] font-bold text-brand-muted uppercase">On-Hand Stock</div>
          <div className="text-xl font-bold text-brand-text mt-1">{stock?.totalOnHand ?? 0}</div>
          <div className="text-[10px] text-brand-muted">Physical Inventory</div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-3 shadow-card">
          <div className="text-[10px] font-bold text-brand-muted uppercase">Available Stock</div>
          <div className="text-xl font-bold text-emerald-800 mt-1">{stock?.available ?? 0}</div>
          <div className="text-[10px] text-emerald-700">Ready to Ship/Use</div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-3 shadow-card">
          <div className="text-[10px] font-bold text-brand-muted uppercase">Incoming (POs)</div>
          <div className="text-xl font-bold text-blue-800 mt-1">{stock?.totalIncoming ?? 0}</div>
          <div className="text-[10px] text-blue-700">Expected Receipts</div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-3 shadow-card">
          <div className="text-[10px] font-bold text-brand-muted uppercase">Outgoing (Orders)</div>
          <div className="text-xl font-bold text-amber-800 mt-1">{stock?.totalOutgoing ?? 0}</div>
          <div className="text-[10px] text-amber-700">Reserved for Delivery</div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-3 shadow-card">
          <div className="text-[10px] font-bold text-brand-muted uppercase">Projected Stock</div>
          <div className="text-xl font-bold text-purple-900 mt-1">{stock?.projected ?? 0}</div>
          <div className="text-[10px] text-purple-700 font-medium">On-Hand + In - Out</div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-brand-border space-x-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Boxes },
          { id: 'inventory', label: 'Warehouse Balances', icon: MapPin },
          { id: 'forecast', label: 'Stock Forecast', icon: TrendingUp },
          { id: 'movements', label: 'Movements Ledger', icon: History },
          { id: 'lots', label: 'Lots & Serials', icon: Hash },
          { id: 'suppliers', label: 'Procurement History', icon: Truck },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-brand-active text-brand-active'
                  : 'border-transparent text-brand-muted hover:text-brand-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-3">
            <h3 className="text-sm font-bold text-brand-text">Product Specifications</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-brand-muted block">Internal Reference:</span>
                <span className="font-semibold text-brand-text">{product.internalRef || 'N/A'}</span>
              </div>
              <div>
                <span className="text-brand-muted block">Tracking Method:</span>
                <span className="font-semibold text-brand-text">{product.trackingMethod}</span>
              </div>
              <div>
                <span className="text-brand-muted block">Cost Price:</span>
                <span className="font-semibold text-brand-text">${product.costPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-brand-muted block">Sales Price:</span>
                <span className="font-semibold text-brand-text">${product.salesPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-brand-muted block">Preferred Supplier:</span>
                <span className="font-semibold text-brand-text">
                  {product.preferredSupplier?.name || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-brand-muted block">Supplier Lead Time:</span>
                <span className="font-semibold text-brand-text">{product.supplierLeadDays} days</span>
              </div>
            </div>
            <div className="pt-2 text-xs">
              <span className="text-brand-muted block">Description:</span>
              <p className="text-brand-text mt-1">{product.description || 'No description provided.'}</p>
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-3">
            <h3 className="text-sm font-bold text-brand-text">Stock Reorder Policy</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-brand-bg rounded-lg">
                <div className="text-[10px] text-brand-muted uppercase font-bold">Minimum Stock</div>
                <div className="text-base font-bold text-brand-text mt-1">{product.minStock}</div>
              </div>
              <div className="p-3 bg-brand-bg rounded-lg">
                <div className="text-[10px] text-brand-muted uppercase font-bold">Reorder Qty</div>
                <div className="text-base font-bold text-brand-teal mt-1">{product.reorderQty}</div>
              </div>
              <div className="p-3 bg-brand-bg rounded-lg">
                <div className="text-[10px] text-brand-muted uppercase font-bold">Maximum Stock</div>
                <div className="text-base font-bold text-brand-text mt-1">{product.maxStock}</div>
              </div>
            </div>
            <p className="text-xs text-brand-muted">
              When projected inventory drops below {product.minStock} units, the replenishment engine generates a
              suggested order of {product.reorderQty} units.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-bold text-brand-text mb-3">Warehouse &amp; Bin Locations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-y border-brand-border">
                <tr>
                  <th className="py-2.5 px-3">Warehouse</th>
                  <th className="py-2.5 px-3">Location Code</th>
                  <th className="py-2.5 px-3">Aisle / Shelf / Bin</th>
                  <th className="py-2.5 px-3 text-right">On-Hand</th>
                  <th className="py-2.5 px-3 text-right">Reserved</th>
                  <th className="py-2.5 px-3 text-right">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {stock?.balances?.map((b: any) => (
                  <tr key={b.id}>
                    <td className="py-2.5 px-3 font-semibold text-brand-text">{b.warehouse.name}</td>
                    <td className="py-2.5 px-3 font-mono text-brand-active font-medium">{b.location.code}</td>
                    <td className="py-2.5 px-3 text-brand-muted">
                      {b.location.aisle ? `Aisle ${b.location.aisle}` : ''}{' '}
                      {b.location.shelf ? `Shelf ${b.location.shelf}` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-text">{b.onHandQty}</td>
                    <td className="py-2.5 px-3 text-right text-amber-700">{b.reservedQty}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-800">
                      {Math.max(0, b.onHandQty - b.reservedQty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-brand-text">Stock Movement Ledger</h3>
              <p className="text-xs text-brand-muted">
                Mathematical audit log explaining how physical stock was calculated.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-y border-brand-border">
                <tr>
                  <th className="py-2.5 px-3">Movement #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3">Destination / Source</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 font-mono">
                {movements.map((m: any) => (
                  <tr key={m.id} className="hover:bg-brand-bg/40">
                    <td className="py-2.5 px-3 font-semibold text-brand-text">{m.movementNumber}</td>
                    <td className="py-2.5 px-3 text-brand-muted font-sans">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {m.type}
                      </span>
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold font-sans ${
                        m.type.includes('RECEIPT') || m.type.includes('IN') || m.type.includes('PRD')
                          ? 'text-emerald-800'
                          : 'text-amber-800'
                      }`}
                    >
                      {m.type.includes('RECEIPT') || m.type.includes('IN') || m.type.includes('PRD') ? '+' : '-'}
                      {m.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted font-sans">
                      {m.destWarehouse?.name || m.sourceWarehouse?.name || m.destLocation || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted font-sans">{m.referenceType || '-'}</td>
                    <td className="py-2.5 px-3 text-brand-muted font-sans">{m.performedBy || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'lots' && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-6">
          <div>
            <h3 className="text-sm font-bold text-brand-text mb-2">Tracked Batches &amp; Lots</h3>
            {lots.length === 0 ? (
              <p className="text-xs text-brand-muted">No lots recorded for this product.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-y border-brand-border">
                    <tr>
                      <th className="py-2.5 px-3">Lot Number</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3">Expiration Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40">
                    {lots.map((l: any) => (
                      <tr key={l.id}>
                        <td className="py-2.5 px-3 font-mono font-bold text-brand-text">{l.lotNumber}</td>
                        <td className="py-2.5 px-3 text-brand-muted">{l.location?.name || 'Storage'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-brand-text">{l.quantity}</td>
                        <td className="py-2.5 px-3 text-brand-muted">
                          {l.expirationDate ? new Date(l.expirationDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3">
                          {l.isBlocked ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              Blocked: {l.blockReason || 'QA Hold'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-bold text-brand-text mb-3">Procurement &amp; PO History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-y border-brand-border">
                <tr>
                  <th className="py-2.5 px-3">PO Number</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Qty Ordered</th>
                  <th className="py-2.5 px-3 text-right">Qty Received</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {purchaseHistory.map((l: any) => (
                  <tr key={l.id}>
                    <td className="py-2.5 px-3 font-semibold text-brand-text">{l.po.poNumber}</td>
                    <td className="py-2.5 px-3 text-brand-muted">{l.po.supplier.name}</td>
                    <td className="py-2.5 px-3 text-brand-muted">
                      {new Date(l.po.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-text">{l.quantityOrdered}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-800 font-semibold">{l.quantityReceived}</td>
                    <td className="py-2.5 px-3 text-right">${l.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {l.po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
