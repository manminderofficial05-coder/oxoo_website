import React, { useState, useEffect } from 'react';
import {
  Warehouse as WarehouseIcon,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ArrowRight,
  Boxes,
  ShieldAlert,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';
import { useWarehouse } from '../context/WarehouseContext.js';

export const Warehouse360Page: React.FC = () => {
  const { warehouses, refreshWarehouses, selectedWarehouseId, setSelectedWarehouseId } = useWarehouse();
  const [enrichedWarehouses, setEnrichedWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [activeWarehouse, setActiveWarehouse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form state
  const [newWh, setNewWh] = useState({
    code: '',
    name: '',
    address: '',
    capacity: '10000',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ warehouses: any[] }>('/warehouses');
      setEnrichedWarehouses(res.warehouses || []);
      const current = (res.warehouses || []).find((w: any) => w.id === selectedWarehouseId) || res.warehouses[0];
      setActiveWarehouse(current || null);
      if (current) {
        const locRes = await apiRequest<{ locations: any[] }>(`/warehouses/${current.id}/locations`);
        setLocations(locRes.locations || []);
      }
    } catch (err) {
      console.error('Failed to load warehouse data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWarehouseId]);

  const handleSelectWarehouse = async (wh: any) => {
    setActiveWarehouse(wh);
    setSelectedWarehouseId(wh.id);
    try {
      const locRes = await apiRequest<{ locations: any[] }>(`/warehouses/${wh.id}/locations`);
      setLocations(locRes.locations || []);
    } catch (err) {
      console.error('Failed to load locations:', err);
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/warehouses', {
        method: 'POST',
        body: JSON.stringify(newWh),
      });
      setFeedback(`Warehouse ${newWh.name} created successfully with default staging zones!`);
      setShowAddModal(false);
      setNewWh({ code: '', name: '', address: '', capacity: '10000' });
      await refreshWarehouses();
      await fetchData();
    } catch (err: any) {
      setFeedback(`Creation failed: ${err.message}`);
    }
  };

  const filteredWarehouses = enrichedWarehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.address && w.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalStockVal = enrichedWarehouses.reduce((sum, w) => sum + (w.totalStockValue || 0), 0);
  const totalUnits = enrichedWarehouses.reduce((sum, w) => sum + (w.totalUnits || 0), 0);
  const totalLocations = enrichedWarehouses.reduce((sum, w) => sum + (w.locationCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Warehouse 360</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Multi-Facility Hub
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Monitor real-time facility capacity, manage bin locations, and orchestrate inbound/outbound material flows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Facility</span>
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

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Total Facilities</span>
            <Building2 className="w-4 h-4 text-brand-active" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">{enrichedWarehouses.length}</div>
          <div className="text-[11px] text-brand-muted mt-0.5">Active operational nodes</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Total Units On Hand</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">{totalUnits.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Across all storage bays</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Total Valuation</span>
            <span className="text-xs font-bold text-brand-muted">$</span>
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">${totalStockVal.toLocaleString()}</div>
          <div className="text-[11px] text-brand-muted mt-0.5">FIFO Standard Costing</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Configured Zones</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">{totalLocations}</div>
          <div className="text-[11px] text-brand-muted mt-0.5">Bays, docks &amp; QA holds</div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Facilities List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">Facilities Directory</h2>
            <span className="text-xs text-brand-muted">{enrichedWarehouses.length} nodes</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter facilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredWarehouses.map((wh) => {
              const isSelected = activeWarehouse?.id === wh.id;
              const capacityUsage = wh.capacity ? Math.min(100, Math.round(((wh.totalUnits || 0) / wh.capacity) * 100)) : 45;

              return (
                <div
                  key={wh.id}
                  onClick={() => handleSelectWarehouse(wh)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-card border-brand-active shadow-card ring-1 ring-brand-active'
                      : 'bg-white border-brand-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-brand-text text-sm">{wh.name}</span>
                      <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {wh.code}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-brand-muted mt-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{wh.address || 'Central Industrial Logistics Park'}</span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-brand-muted">Capacity Utilization</span>
                      <span className="font-semibold text-brand-text">{capacityUsage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          capacityUsage > 85 ? 'bg-red-500' : capacityUsage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${capacityUsage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-brand-border text-center">
                    <div>
                      <div className="text-[10px] text-brand-muted">Units</div>
                      <div className="font-semibold text-xs text-brand-text">{wh.totalUnits?.toLocaleString() || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-brand-muted">Value</div>
                      <div className="font-semibold text-xs text-brand-text">${wh.totalStockValue?.toLocaleString() || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-brand-muted">Zones</div>
                      <div className="font-semibold text-xs text-brand-text">{wh.locationCount || 0}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Warehouse Details & Location Topology */}
        <div className="lg:col-span-2 space-y-4">
          {activeWarehouse ? (
            <>
              {/* Selected Facility Overview Card */}
              <div className="p-5 bg-brand-card border border-brand-border rounded-xl shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-brand-text">{activeWarehouse.name}</h2>
                      <span className="px-2 py-0.5 text-xs font-mono bg-brand-bg text-brand-text rounded border border-brand-border">
                        {activeWarehouse.code}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted mt-1">{activeWarehouse.address || 'Primary Logistics Hub'}</p>
                  </div>

                  {/* Operational Shortcuts */}
                  <div className="flex items-center gap-2">
                    <Link
                      to="/warehouse/receipts"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-medium text-brand-text hover:bg-brand-bg transition-colors"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Inbound</span>
                    </Link>
                    <Link
                      to="/warehouse/transfers"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-medium text-brand-text hover:bg-brand-bg transition-colors"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                      <span>Transfers</span>
                    </Link>
                    <Link
                      to="/warehouse/deliveries"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-medium text-brand-text hover:bg-brand-bg transition-colors"
                    >
                      <ArrowUpFromLine className="w-3.5 h-3.5 text-brand-active" />
                      <span>Dispatch</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Location Topology Grid */}
              <div className="bg-brand-card border border-brand-border rounded-xl shadow-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">Storage Bays &amp; Staging Zones</h3>
                    <p className="text-xs text-brand-muted">Configured bin locations within {activeWarehouse.name}</p>
                  </div>
                  <span className="text-xs font-medium text-brand-muted">{locations.length} locations configured</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {locations.map((loc) => {
                    const balanceCount = loc.stockBalances?.length || 0;
                    const totalLocUnits = (loc.stockBalances || []).reduce((s: number, b: any) => s + b.onHandQty, 0);

                    const typeBadgeColor =
                      loc.type === 'RECEIVING'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : loc.type === 'SHIPPING'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : loc.type === 'QUALITY'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200';

                    return (
                      <div
                        key={loc.id}
                        className="p-3.5 rounded-lg border border-brand-border bg-white hover:border-brand-active/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-brand-text">{loc.code}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${typeBadgeColor}`}>
                              {loc.type || 'STORAGE'}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-brand-text">{totalLocUnits} units</span>
                        </div>

                        <div className="text-xs text-brand-text font-medium mt-1">{loc.name}</div>

                        {/* Stored products preview */}
                        <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-brand-muted">
                          {balanceCount > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(loc.stockBalances || []).slice(0, 3).map((b: any) => (
                                <span
                                  key={b.id}
                                  className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[10px]"
                                >
                                  {b.product?.sku}: {b.onHandQty}
                                </span>
                              ))}
                              {balanceCount > 3 && (
                                <span className="text-[10px] text-brand-muted">+{balanceCount - 3} more</span>
                              )}
                            </div>
                          ) : (
                            <span className="italic text-slate-400">Bay empty (ready for put-away)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-brand-card border border-brand-border rounded-xl">
              <WarehouseIcon className="w-8 h-8 text-brand-muted mx-auto mb-2" />
              <p className="text-xs text-brand-muted">Select a warehouse from the list to view zone topologies.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Facility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Add New Warehouse Facility</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Facility Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WH-SOUTH-01"
                  value={newWh.code}
                  onChange={(e) => setNewWh({ ...newWh, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Southern Regional Distribution Center"
                  value={newWh.name}
                  onChange={(e) => setNewWh({ ...newWh, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. 888 Logistics Blvd, Austin, TX"
                  value={newWh.address}
                  onChange={(e) => setNewWh({ ...newWh, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Rated Storage Capacity (Units)</label>
                <input
                  type="number"
                  value={newWh.capacity}
                  onChange={(e) => setNewWh({ ...newWh, capacity: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
                <span className="text-[10px] text-brand-muted mt-1 block">
                  Default inbound dock, QA hold, and storage bays will be automatically generated.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Create Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
