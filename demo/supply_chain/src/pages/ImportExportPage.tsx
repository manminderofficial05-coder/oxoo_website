import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  AlertTriangle,
  Building,
  ShieldAlert,
  ArrowRight,
  X,
  FileText,
  Calculator,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const ImportExportPage: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form state
  const [newCustoms, setNewCustoms] = useState({
    type: 'IMPORT',
    originCountry: 'Germany',
    destinationCountry: 'United States',
    incoterms: 'FOB',
    portOfEntry: 'Port of Houston, TX',
    declaredValue: '45000',
    dutyRate: '0.05', // 5%
    taxRate: '0.08',  // 8%
    freightCharges: '2800',
    insuranceCharges: '450',
    hsCodes: '8542.31.0000, 9031.80.8085',
    inspectionRequired: false,
    notes: 'High-precision micro-sensors batch',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ shipments: any[] }>('/customs/shipments');
      const list = res.shipments || [];
      setShipments(list);
      if (list.length > 0 && !selectedShipment) {
        setSelectedShipment(list[0]);
      }
    } catch (err) {
      console.error('Failed to load customs shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDeclaration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ shipment: any }>('/customs/shipments', {
        method: 'POST',
        body: JSON.stringify({
          ...newCustoms,
          declaredValue: parseFloat(newCustoms.declaredValue),
          dutyRate: parseFloat(newCustoms.dutyRate),
          taxRate: parseFloat(newCustoms.taxRate),
          freightCharges: parseFloat(newCustoms.freightCharges),
          insuranceCharges: parseFloat(newCustoms.insuranceCharges),
        }),
      });
      setFeedback(`Customs declaration ${res.shipment.declarationNumber} filed! Landed cost calculated.`);
      setShowCreateModal(false);
      await fetchData();
      setSelectedShipment(res.shipment);
    } catch (err: any) {
      setFeedback(`Filing failed: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedShipment) return;
    try {
      const res = await apiRequest<{ shipment: any }>(`/customs/shipments/${selectedShipment.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setFeedback(`Customs shipment status updated to ${status}!`);
      setSelectedShipment(res.shipment);
      await fetchData();
    } catch (err: any) {
      setFeedback(`Status update failed: ${err.message}`);
    }
  };

  const filtered = shipments.filter((s) => {
    const matchesType = typeFilter === 'ALL' || s.type === typeFilter;
    const matchesSearch =
      s.declarationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.originCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destinationCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.portOfEntry && s.portOfEntry.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CLEARED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DUTY_PAID':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HELD':
        return 'bg-rose-50 text-rose-700 border-rose-200';
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
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Import &amp; Export</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Cross-Border Trade &amp; Customs
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Manage customs clearance declarations, Incoterms, HS tariffs, and automated landed-cost calculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>File Declaration</span>
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

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Total Customs Value</span>
            <Globe className="w-4 h-4 text-brand-active" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">
            ${shipments.reduce((sum, s) => sum + (s.declaredValue || 0), 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-brand-muted mt-0.5">Cross-border declared value</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Total Landed Cost</span>
            <Calculator className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">
            ${shipments.reduce((sum, s) => sum + (s.totalLandedCost || 0), 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Duties + Freight + Tax</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Customs Duties Paid</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">
            ${shipments.reduce((sum, s) => sum + (s.dutyAmount || 0), 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-brand-muted mt-0.5">Tariff schedules assessed</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Clearance Compliance</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">98.5%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Zero port seizure holds</div>
        </div>
      </div>

      {/* Main Grid: Declarations Table & Landed Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Declarations List */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search declaration #, country, or port of entry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {['ALL', 'IMPORT', 'EXPORT'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    typeFilter === t
                      ? 'bg-brand-active text-white'
                      : 'bg-brand-bg text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4">Declaration #</th>
                  <th className="py-3 px-3">Trade Lane</th>
                  <th className="py-3 px-3">Incoterms</th>
                  <th className="py-3 px-3 text-right">Declared Value</th>
                  <th className="py-3 px-3 text-right">Landed Cost</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filtered.map((s) => {
                  const isSelected = selectedShipment?.id === s.id;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedShipment(s)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-active/5 font-medium' : 'hover:bg-brand-bg/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-brand-text">{s.declarationNumber}</div>
                        <div className="text-[10px] text-brand-muted">{s.type}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-brand-text">
                          {s.originCountry} → {s.destinationCountry}
                        </div>
                        <div className="text-[10px] text-brand-muted truncate max-w-[140px]">{s.portOfEntry}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-semibold">
                          {s.incoterms}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-brand-text">
                        ${s.declaredValue?.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        ${s.totalLandedCost?.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(s.status)}`}>
                          {s.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Shipment: Landed Cost Calculation & Compliance Documents */}
        <div className="lg:col-span-1 space-y-4">
          {selectedShipment ? (
            <div className="bg-brand-card border border-brand-border rounded-xl shadow-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-brand-text font-mono">{selectedShipment.declarationNumber}</h2>
                  <span className="text-xs text-brand-muted">
                    {selectedShipment.originCountry} to {selectedShipment.destinationCountry}
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getStatusBadge(selectedShipment.status)}`}>
                  {selectedShipment.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Exact Landed Cost Breakdown Card */}
              <div>
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-brand-active" />
                  <span>Landed Cost Breakdown</span>
                </h3>
                <div className="p-3 bg-brand-bg rounded-lg border border-brand-border space-y-1.5 text-xs">
                  <div className="flex justify-between text-brand-muted">
                    <span>Base Declared Value:</span>
                    <span className="font-medium text-brand-text">${selectedShipment.declaredValue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>International Freight:</span>
                    <span className="font-medium text-brand-text">${selectedShipment.freightCharges?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Transit Insurance:</span>
                    <span className="font-medium text-brand-text">${selectedShipment.insuranceCharges?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Customs Tariff Duty ({(selectedShipment.dutyRate * 100).toFixed(0)}%):</span>
                    <span className="font-medium text-brand-text">${selectedShipment.dutyAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Import VAT / Taxes ({(selectedShipment.taxRate * 100).toFixed(0)}%):</span>
                    <span className="font-medium text-brand-text">${selectedShipment.taxAmount?.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-brand-border flex justify-between font-bold text-sm text-brand-text">
                    <span>Total Landed Cost:</span>
                    <span className="text-emerald-700">${selectedShipment.totalLandedCost?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Verified Documents Checklist */}
              <div>
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">Trade Documentation</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded bg-white border border-brand-border flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-brand-text">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Commercial Invoice
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">VERIFIED</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-brand-border flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-brand-text">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Bill of Lading / Ocean Waybill
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">VERIFIED</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-brand-border flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-brand-text">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Packing List &amp; HS Classifications
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">VERIFIED</span>
                  </div>
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900">
                    <span className="flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Certificate of Origin
                    </span>
                    <span className="text-[9px] font-bold bg-amber-200 px-1.5 py-0.2 rounded">EXTERNAL VERIF. REQ</span>
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="pt-2 border-t border-brand-border space-y-2">
                {selectedShipment.status !== 'CLEARED' && (
                  <button
                    onClick={() => handleUpdateStatus('CLEARED')}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Authorize Customs Clearance</span>
                  </button>
                )}
                {selectedShipment.status === 'UNDER_REVIEW' && (
                  <button
                    onClick={() => handleUpdateStatus('DUTY_PAID')}
                    className="w-full py-2 bg-white border border-brand-border text-brand-text rounded-lg text-xs font-semibold hover:bg-brand-bg transition-colors"
                  >
                    Post Duty Payment (${selectedShipment.dutyAmount?.toLocaleString()})
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-brand-card border border-brand-border rounded-xl text-brand-muted text-xs">
              Select a customs declaration to view landed-cost calculations.
            </div>
          )}
        </div>
      </div>

      {/* File Declaration Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">File Customs Declaration</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeclaration} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Declaration Type *</label>
                  <select
                    value={newCustoms.type}
                    onChange={(e) => setNewCustoms({ ...newCustoms, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white"
                  >
                    <option value="IMPORT">Import</option>
                    <option value="EXPORT">Export</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Incoterms *</label>
                  <select
                    value={newCustoms.incoterms}
                    onChange={(e) => setNewCustoms({ ...newCustoms, incoterms: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white"
                  >
                    <option value="FOB">FOB (Free on Board)</option>
                    <option value="CIF">CIF (Cost, Insurance &amp; Freight)</option>
                    <option value="DDP">DDP (Delivered Duty Paid)</option>
                    <option value="EXW">EXW (Ex Works)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Origin Country *</label>
                  <input
                    type="text"
                    required
                    value={newCustoms.originCountry}
                    onChange={(e) => setNewCustoms({ ...newCustoms, originCountry: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Destination Country *</label>
                  <input
                    type="text"
                    required
                    value={newCustoms.destinationCountry}
                    onChange={(e) => setNewCustoms({ ...newCustoms, destinationCountry: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Declared Value ($)</label>
                  <input
                    type="number"
                    required
                    value={newCustoms.declaredValue}
                    onChange={(e) => setNewCustoms({ ...newCustoms, declaredValue: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Freight ($)</label>
                  <input
                    type="number"
                    value={newCustoms.freightCharges}
                    onChange={(e) => setNewCustoms({ ...newCustoms, freightCharges: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Insurance ($)</label>
                  <input
                    type="number"
                    value={newCustoms.insuranceCharges}
                    onChange={(e) => setNewCustoms({ ...newCustoms, insuranceCharges: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Configurable Duty Rate (e.g. 0.05 = 5%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCustoms.dutyRate}
                    onChange={(e) => setNewCustoms({ ...newCustoms, dutyRate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Port of Entry</label>
                  <input
                    type="text"
                    value={newCustoms.portOfEntry}
                    onChange={(e) => setNewCustoms({ ...newCustoms, portOfEntry: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
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
                  Calculate &amp; File Declaration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
