import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  DollarSign,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileCheck2,
  Factory,
  ShieldAlert,
  Plus,
  ScanBarcode,
  ArrowLeftRight,
  ShoppingCart,
  Calendar,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { apiRequest } from '../lib/api.js';
import { useWarehouse } from '../context/WarehouseContext.js';
import { DemoActionsBar } from '../components/DemoActionsBar.js';

const PALETTE = ['#183F35', '#2F7259', '#CBD2B4', '#EED89A', '#D3ADA4', '#4875CF'];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedWarehouseId } = useWarehouse();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const url = selectedWarehouseId
        ? `/dashboard/summary?warehouseId=${selectedWarehouseId}`
        : '/dashboard/summary';
      const res = await apiRequest(url);
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedWarehouseId]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-active animate-spin mx-auto" />
          <p className="text-sm font-medium text-brand-muted">Calculating real-time supply chain metrics...</p>
        </div>
      </div>
    );
  }

  const { kpis, charts, operational } = data || {
    kpis: {},
    charts: { stockMovement: [], categoryDistribution: [], warehouseDistribution: [], poStatus: [], moStatus: [] },
    operational: { lowStockAlerts: [], expiringLots: [], pendingApprovals: [], recentMovements: [] },
  };

  return (
    <div className="space-y-6">
      {/* 9 Interactive Demo Buttons Bar */}
      <DemoActionsBar onDataMutated={fetchDashboard} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text">
            Good morning, Admin
          </h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Your supply chain at a glance. Monitor stock, purchasing, production, and warehouse performance.
          </p>
        </div>

        {/* Controls: Date Filter & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-card border border-brand-border rounded-lg text-xs font-medium text-brand-text shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-brand-muted" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
            </select>
          </div>

          <button
            onClick={fetchDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 8 Live Database KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Total Products */}
        <div
          onClick={() => navigate('/inventory')}
          className="bg-brand-card border border-brand-border rounded-xl p-3.5 shadow-card hover:border-brand-active transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">Products</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-brand-teal group-hover:scale-110 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-brand-text mt-2">{kpis.totalProducts ?? 0}</div>
          <div className="text-[10px] text-brand-muted mt-0.5">Active SKUs</div>
        </div>

        {/* 2. Inventory Value */}
        <div
          onClick={() => navigate('/valuation')}
          className="bg-brand-card border border-brand-border rounded-xl p-3.5 shadow-card hover:border-brand-active transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">Value</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-brand-text mt-2">
            ${(kpis.inventoryValue ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-emerald-800 font-medium mt-0.5">Physical Stock</div>
        </div>

        {/* 3. Low Stock Items */}
        <div
          onClick={() => navigate('/inventory?status=low_stock')}
          className="bg-brand-card border border-brand-border rounded-xl p-3.5 shadow-card hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">Low Stock</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-900 mt-2">{kpis.lowStockItems ?? 0}</div>
          <div className="text-[10px] text-amber-700 font-medium mt-0.5">&lt; Reorder Level</div>
        </div>

        {/* 4. Pending Receipts */}
        <div
          onClick={() => navigate('/warehouse/receipts')}
          className="bg-brand-card border border-brand-border rounded-xl p-3.5 shadow-card hover:border-brand-active transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">Receipts</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 group-hover:scale-110 transition-transform">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-brand-text mt-2">{kpis.pendingReceipts ?? 0}</div>
          <div className="text-[10px] text-brand-muted mt-0.5">Inbound Pending</div>
        </div>

        {/* 5. Pending Deliveries */}
        <div
          onClick={() => navigate('/warehouse/deliveries')}
          className="bg-brand-card border border-brand-border rounded-xl p-3.5 shadow-card hover:border-brand-active transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">Deliveries</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 group-hover:scale-110 transition-transform">
              <ArrowUpFromLine className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-brand-text mt-2">{kpis.pendingDeliveries ?? 0}</div>
          <div className="text-[10px] text-brand-muted mt-0.5">Outbound Orders</div>
        </div>

        {/* 6. POs Awaiting Approval */}
        <div
          onClick={() => navigate('/purchase')}
          className="bg-brand-card border border-brand-border rounded-xl p-3.5 shadow-card hover:border-brand-active transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">PO Approvals</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-purple-900 mt-2">{kpis.poAwaitingApproval ?? 0}</div>
          <div className="text-[10px] text-purple-700 font-medium mt-0.5">&gt; Threshold</div>
        </div>

        {/* 7. Active Manufacturing Orders */}
        <div
          onClick={() => navigate('/manufacturing')}
          className="bg-brand-card border border-brand-border rounded-xl p-3.5 shadow-card hover:border-brand-active transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">Active MOs</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 group-hover:scale-110 transition-transform">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-brand-text mt-2">{kpis.activeMfgOrders ?? 0}</div>
          <div className="text-[10px] text-brand-muted mt-0.5">In Assembly</div>
        </div>

        {/* 8. Quality Issues */}
        <div
          onClick={() => navigate('/quality')}
          className="bg-brand-card border border-brand-border rounded-xl p-3.5 shadow-card hover:border-rose-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">QA Issues</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-900 mt-2">{kpis.qualityIssues ?? 0}</div>
          <div className="text-[10px] text-rose-700 font-medium mt-0.5">Holds &amp; Reviews</div>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-brand-card border border-brand-border rounded-xl">
        <span className="text-xs font-bold text-brand-muted uppercase tracking-wider mr-2">Quick Actions:</span>
        <button
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-bg hover:bg-slate-200/80 text-brand-text text-xs font-semibold rounded-lg border border-brand-border transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-brand-active" />
          <span>New Product</span>
        </button>
        <button
          onClick={() => navigate('/warehouse/receipts')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-bg hover:bg-slate-200/80 text-brand-text text-xs font-semibold rounded-lg border border-brand-border transition-colors"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 text-brand-active" />
          <span>Receive Goods</span>
        </button>
        <button
          onClick={() => navigate('/purchase')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-bg hover:bg-slate-200/80 text-brand-text text-xs font-semibold rounded-lg border border-brand-border transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-brand-active" />
          <span>Create PO</span>
        </button>
        <button
          onClick={() => navigate('/warehouse/transfers')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-bg hover:bg-slate-200/80 text-brand-text text-xs font-semibold rounded-lg border border-brand-border transition-colors"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-brand-active" />
          <span>Transfer Stock</span>
        </button>
        <button
          onClick={() => navigate('/barcode-scanner')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal text-white text-xs font-semibold rounded-lg hover:bg-brand-active transition-colors shadow-xs"
        >
          <ScanBarcode className="w-3.5 h-3.5" />
          <span>Scan Barcode</span>
        </button>
        <button
          onClick={() => navigate('/manufacturing')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-bg hover:bg-slate-200/80 text-brand-text text-xs font-semibold rounded-lg border border-brand-border transition-colors"
        >
          <Factory className="w-3.5 h-3.5 text-brand-active" />
          <span>Create MO</span>
        </button>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stock Movements Over Time (2 cols) */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-brand-text">Stock Movement Trends</h3>
              <p className="text-xs text-brand-muted">Inbound receipts vs. Outbound deliveries &amp; consumption</p>
            </div>
            <span className="text-[11px] font-semibold text-brand-active bg-brand-active/10 px-2 py-0.5 rounded-full">
              Live Movements
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.stockMovement}>
                <defs>
                  <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F7259" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2F7259" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outboundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EED89A" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#EED89A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D7" vertical={false} />
                <XAxis dataKey="date" stroke="#7D8179" fontSize={11} />
                <YAxis stroke="#7D8179" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FCFBF7', borderColor: '#E4E0D7', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="inbound" name="Inbound Stock" stroke="#2F7259" strokeWidth={2} fillOpacity={1} fill="url(#inboundGrad)" />
                <Area type="monotone" dataKey="outbound" name="Outbound Stock" stroke="#D49A30" strokeWidth={2} fillOpacity={1} fill="url(#outboundGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Inventory Value by Category (1 col) */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-brand-text">Value by Category</h3>
              <p className="text-xs text-brand-muted">Distribution across product lines</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {charts.categoryDistribution.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Value']}
                  contentStyle={{ backgroundColor: '#FCFBF7', borderColor: '#E4E0D7', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Alert Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-amber-50 text-amber-800">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-text">Critical Low-Stock Alerts</h3>
                <p className="text-xs text-brand-muted">Items at or below safety reorder threshold</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/replenishment')}
              className="text-xs font-semibold text-brand-active hover:underline flex items-center gap-1"
            >
              <span>Replenish</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg/60 text-brand-muted uppercase text-[10px] font-semibold border-y border-brand-border">
                <tr>
                  <th className="py-2 px-2.5">Product &amp; SKU</th>
                  <th className="py-2 px-2.5">Warehouse</th>
                  <th className="py-2 px-2.5 text-right">On-Hand</th>
                  <th className="py-2 px-2.5 text-right">Min Stock</th>
                  <th className="py-2 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {operational.lowStockAlerts.map((item: any) => (
                  <tr key={item.id} className="hover:bg-brand-bg/40 transition-colors">
                    <td className="py-2.5 px-2.5">
                      <div className="font-semibold text-brand-text">{item.productName}</div>
                      <div className="text-[10px] text-brand-muted">{item.sku}</div>
                    </td>
                    <td className="py-2.5 px-2.5 text-brand-muted">{item.warehouseName}</td>
                    <td className="py-2.5 px-2.5 text-right font-bold text-amber-800">{item.onHandQty}</td>
                    <td className="py-2.5 px-2.5 text-right text-brand-muted">{item.minStock}</td>
                    <td className="py-2.5 px-2.5 text-right">
                      <button
                        onClick={() => navigate(`/replenishment`)}
                        className="px-2 py-0.5 text-[11px] font-medium bg-brand-active text-white rounded hover:bg-brand-teal transition-colors"
                      >
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals & Quality Holds */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-purple-50 text-purple-800">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-text">Pending Approvals &amp; Quality Holds</h3>
                <p className="text-xs text-brand-muted">Purchases &gt; $5,000 and quarantined lots</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/purchase')}
              className="text-xs font-semibold text-brand-active hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {operational.pendingApprovals.map((app: any) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 rounded-lg border border-brand-border bg-white"
              >
                <div>
                  <div className="text-xs font-semibold text-brand-text">{app.title}</div>
                  <div className="text-[11px] text-brand-muted">
                    Requested by {app.requestedBy?.firstName} {app.requestedBy?.lastName} | Amount: ${app.amount?.toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/purchase`)}
                  className="px-2.5 py-1 text-xs font-semibold bg-brand-active text-white rounded-md hover:bg-brand-teal transition-colors"
                >
                  Review
                </button>
              </div>
            ))}

            {operational.expiringLots.map((lot: any) => (
              <div
                key={lot.lotNumber}
                className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50"
              >
                <div>
                  <div className="text-xs font-semibold text-amber-900">
                    Expiring Lot: {lot.lotNumber} ({lot.productName})
                  </div>
                  <div className="text-[11px] text-amber-700">
                    Qty: {lot.quantity} in {lot.warehouse} | Expiry: {new Date(lot.expirationDate).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/traceability?q=${lot.lotNumber}`)}
                  className="px-2.5 py-1 text-xs font-semibold bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors"
                >
                  Trace
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
