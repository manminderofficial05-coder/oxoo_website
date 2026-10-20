import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ArrowUpDown,
  AlertTriangle,
  Package,
  CheckCircle2,
  X,
  RefreshCw,
  ExternalLink,
  ScanBarcode,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useWarehouse } from '../context/WarehouseContext.js';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedWarehouseId } = useWarehouse();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [uoms, setUoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // New Product Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    uomId: '',
    type: 'STOCKABLE',
    costPrice: '0',
    salesPrice: '0',
    minStock: '10',
    maxStock: '100',
    reorderQty: '20',
    initialQuantity: '0',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        ...(search ? { search } : {}),
        ...(selectedCategory ? { categoryId: selectedCategory } : {}),
        ...(selectedWarehouseId ? { warehouseId: selectedWarehouseId } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      });

      const res = await apiRequest<{ products: any[]; pagination: any }>(`/products?${params.toString()}`);
      setProducts(res.products || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      apiRequest<{ categories: any[] }>('/products/categories'),
      apiRequest<{ uoms: any[] }>('/products/uoms'),
    ]).then(([catRes, uomRes]) => {
      setCategories(catRes.categories || []);
      setUoms(uomRes.uoms || []);
      if (catRes.categories[0]) setCreateForm((prev) => ({ ...prev, categoryId: catRes.categories[0].id }));
      if (uomRes.uoms[0]) setCreateForm((prev) => ({ ...prev, uomId: uomRes.uoms[0].id }));
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategory, statusFilter, selectedWarehouseId]);

  // CSV Export
  const exportCSV = () => {
    const headers = ['Name', 'SKU', 'Barcode', 'Category', 'Type', 'Cost', 'Sales Price', 'On Hand', 'Min Stock'];
    const rows = products.map((p) => [
      `"${p.name}"`,
      p.sku,
      p.barcode,
      p.category?.name || '',
      p.type,
      p.costPrice,
      p.salesPrice,
      p.onHandQty,
      p.minStock,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flowstock_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create Product handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    try {
      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify({
          ...createForm,
          initialWarehouseId: selectedWarehouseId || undefined,
        }),
      });

      setShowCreateModal(false);
      setCreateForm({
        name: '',
        sku: '',
        barcode: '',
        categoryId: categories[0]?.id || '',
        uomId: uoms[0]?.id || '',
        type: 'STOCKABLE',
        costPrice: '0',
        salesPrice: '0',
        minStock: '10',
        maxStock: '100',
        reorderQty: '20',
        initialQuantity: '0',
      });
      fetchProducts();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create product');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Product Inventory Catalog</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              {products.length} Loaded
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Real-time stock balance, reorder thresholds, valuation, and physical tracking across warehouses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-3.5 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, SKU, or barcode..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-active"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-medium text-brand-text">
            <Filter className="w-3.5 h-3.5 text-brand-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none text-xs focus:outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-medium text-brand-text">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Stock Statuses</option>
              <option value="low_stock">Low Stock Alerts (&lt; Min)</option>
              <option value="out_of_stock">Out of Stock (= 0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dense Operational Products Table */}
      <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-bg/80 text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Product &amp; SKU</th>
                <th className="py-3 px-3">Barcode</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Cost Price</th>
                <th className="py-3 px-3 text-right">Sales Price</th>
                <th className="py-3 px-3 text-right">On-Hand</th>
                <th className="py-3 px-3 text-right">Available</th>
                <th className="py-3 px-3 text-right">Min Stock</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-brand-muted">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-active" />
                    Loading inventory records...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-brand-muted">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/inventory/products/${p.id}`)}
                    className="hover:bg-brand-bg/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-brand-text group-hover:text-brand-active">
                        {p.name}
                      </div>
                      <div className="text-[10px] font-mono text-brand-muted">{p.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-brand-text">{p.barcode}</td>
                    <td className="py-2.5 px-3 text-brand-muted">{p.category?.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {p.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-brand-text">
                      ${p.costPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-brand-text">
                      ${p.salesPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-text">{p.onHandQty}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-800">
                      {p.availableQty}
                    </td>
                    <td className="py-2.5 px-3 text-right text-brand-muted">{p.minStock}</td>
                    <td className="py-2.5 px-3 text-center">
                      {p.isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Out of Stock
                        </span>
                      ) : p.isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/inventory/products/${p.id}`)}
                        className="px-2 py-1 bg-white border border-brand-border rounded text-[11px] font-semibold text-brand-teal hover:bg-brand-bg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-brand-card border-t border-brand-border text-xs text-brand-muted">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 bg-white border border-brand-border rounded hover:bg-brand-bg disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1 bg-white border border-brand-border rounded hover:bg-brand-bg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create Product Modal with Automatic SKU Generation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-bold text-brand-text">Create New Operational Product</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-brand-muted hover:text-brand-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Optical Distance Sensor 50mm"
                  className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">
                    SKU <span className="text-brand-muted font-normal">(Leave blank to auto-generate)</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.sku}
                    onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
                    placeholder="Auto: SKU-CAT-001"
                    className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">
                    Barcode <span className="text-brand-muted font-normal">(Leave blank to auto-generate)</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.barcode}
                    onChange={(e) => setCreateForm({ ...createForm, barcode: e.target.value })}
                    placeholder="Auto: 890xxxxxxxxxx"
                    className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Category *</label>
                  <select
                    value={createForm.categoryId}
                    onChange={(e) => setCreateForm({ ...createForm, categoryId: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Unit of Measure *</label>
                  <select
                    value={createForm.uomId}
                    onChange={(e) => setCreateForm({ ...createForm, uomId: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                  >
                    {uoms.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.costPrice}
                    onChange={(e) => setCreateForm({ ...createForm, costPrice: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Sales Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.salesPrice}
                    onChange={(e) => setCreateForm({ ...createForm, salesPrice: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Min Safety Stock</label>
                  <input
                    type="number"
                    value={createForm.minStock}
                    onChange={(e) => setCreateForm({ ...createForm, minStock: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                  />
                </div>
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
                  {createLoading ? 'Creating...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
