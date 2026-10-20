import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  X,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Package,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const Logistics360Page: React.FC = () => {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddShipmentModal, setShowAddShipmentModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showPodModal, setShowPodModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Forms
  const [newShipment, setNewShipment] = useState({
    carrierId: '',
    trackingNumber: '',
    shipmentType: 'OUTBOUND',
    origin: 'Central DC (WH-MAIN-01)',
    destination: 'Apex Distribution Hub, Dallas, TX',
    freightCost: '350.00',
    weightKg: '240',
    estimatedArrival: '',
  });

  const [milestoneForm, setMilestoneForm] = useState({
    status: 'IN_TRANSIT',
    location: 'Regional Sorting Facility',
    description: 'Cargo scanned through central hub sortation line',
  });

  const [podForm, setPodForm] = useState({
    receivedBy: 'Operations Receiving Clerk',
    notes: 'Received in good condition, seal intact',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [carrierRes, shipRes] = await Promise.all([
        apiRequest<{ carriers: any[] }>('/logistics/carriers'),
        apiRequest<{ shipments: any[] }>('/logistics/shipments'),
      ]);
      setCarriers(carrierRes.carriers || []);
      const shipList = shipRes.shipments || [];
      setShipments(shipList);

      if (shipList.length > 0 && !selectedShipment) {
        setSelectedShipment(shipList[0]);
      }
      if (carrierRes.carriers?.length > 0 && !newShipment.carrierId) {
        setNewShipment((prev) => ({ ...prev, carrierId: carrierRes.carriers[0].id }));
      }
    } catch (err) {
      console.error('Failed to load logistics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ shipment: any }>('/logistics/shipments', {
        method: 'POST',
        body: JSON.stringify(newShipment),
      });
      setFeedback(`Freight shipment ${res.shipment.trackingNumber} booked successfully!`);
      setShowAddShipmentModal(false);
      await fetchData();
      setSelectedShipment(res.shipment);
    } catch (err: any) {
      setFeedback(`Booking failed: ${err.message}`);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      const res = await apiRequest<{ shipment: any }>(`/logistics/shipments/${selectedShipment.id}/milestones`, {
        method: 'POST',
        body: JSON.stringify(milestoneForm),
      });
      setFeedback(`Milestone logged for shipment ${res.shipment.trackingNumber}!`);
      setShowMilestoneModal(false);
      setSelectedShipment(res.shipment);
      await fetchData();
    } catch (err: any) {
      setFeedback(`Milestone update failed: ${err.message}`);
    }
  };

  const handleConfirmPod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      const res = await apiRequest<{ shipment: any }>(`/logistics/shipments/${selectedShipment.id}/pod`, {
        method: 'POST',
        body: JSON.stringify(podForm),
      });
      setFeedback(`Proof of delivery recorded! Shipment marked as DELIVERED.`);
      setShowPodModal(false);
      setSelectedShipment(res.shipment);
      await fetchData();
    } catch (err: any) {
      setFeedback(`POD recording failed: ${err.message}`);
    }
  };

  const filtered = shipments.filter((s) => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesSearch =
      s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.carrier?.name && s.carrier.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_TRANSIT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'BOOKED':
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
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Logistics 360</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Freight &amp; Carrier Orchestration
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Manage carriers, shipment waybills, freight costs, milestone tracking, and verified proofs of delivery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddShipmentModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Shipment</span>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Active Freight Shipments</span>
            <Truck className="w-4 h-4 text-brand-active" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">{shipments.length}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Live tracking enabled</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Integrated Carriers</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">{carriers.length}</div>
          <div className="text-[11px] text-brand-muted mt-0.5">DHL, FedEx, Maersk, BlueDart</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Total Freight Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">
            ${shipments.reduce((sum, s) => sum + (s.freightCost || 0), 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-brand-muted mt-0.5">Calculated actual freight costs</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">On-Time Delivery</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">96.2%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">SLA adherence rate</div>
        </div>
      </div>

      {/* Main Grid: Shipments List & Milestone Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipments Table */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tracking #, origin, destination or carrier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {['ALL', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-brand-active text-white'
                      : 'bg-brand-bg text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4">Tracking #</th>
                  <th className="py-3 px-3">Carrier</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">ETA</th>
                  <th className="py-3 px-3 text-right">Freight</th>
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
                        <div className="font-mono font-bold text-brand-text">{s.trackingNumber}</div>
                        <div className="text-[10px] text-brand-muted">{s.shipmentType}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-brand-text">{s.carrier?.name || 'Carrier'}</div>
                        <div className="text-[10px] font-mono text-brand-muted">{s.carrier?.serviceType}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-brand-text truncate max-w-[140px]">{s.destination}</div>
                        <div className="text-[10px] text-brand-muted truncate max-w-[140px]">From: {s.origin}</div>
                      </td>
                      <td className="py-3 px-3 text-brand-muted">
                        {s.estimatedArrival ? new Date(s.estimatedArrival).toLocaleDateString() : 'Pending'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-brand-text">
                        ${s.freightCost?.toFixed(2) || '0.00'}
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

        {/* Selected Shipment Details & Milestones Timeline */}
        <div className="lg:col-span-1 space-y-4">
          {selectedShipment ? (
            <div className="bg-brand-card border border-brand-border rounded-xl shadow-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-brand-text font-mono">{selectedShipment.trackingNumber}</h2>
                  <span className="text-xs text-brand-muted">{selectedShipment.carrier?.name}</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getStatusBadge(selectedShipment.status)}`}>
                  {selectedShipment.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Waybill Summary Card */}
              <div className="p-3 bg-brand-bg rounded-lg border border-brand-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted">Origin:</span>
                  <span className="font-medium text-brand-text text-right">{selectedShipment.origin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted">Destination:</span>
                  <span className="font-medium text-brand-text text-right">{selectedShipment.destination}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted">Gross Weight:</span>
                  <span className="font-medium text-brand-text">{selectedShipment.weightKg || 100} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted">Freight Charge:</span>
                  <span className="font-bold text-brand-text">${selectedShipment.freightCost?.toFixed(2)}</span>
                </div>
              </div>

              {/* Proof of Delivery Banner if Delivered */}
              {selectedShipment.status === 'DELIVERED' && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Proof of Delivery (POD)</span>
                  </div>
                  <div className="text-[11px]">
                    <span className="font-semibold">Signer:</span> {selectedShipment.receivedBy || 'Authorized Agent'}
                  </div>
                  {selectedShipment.deliveredAt && (
                    <div className="text-[11px] text-emerald-700">
                      Delivered at: {new Date(selectedShipment.deliveredAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Milestone Timeline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">Tracking Milestones</h3>
                  {selectedShipment.status !== 'DELIVERED' && (
                    <button
                      onClick={() => setShowMilestoneModal(true)}
                      className="text-[11px] font-semibold text-brand-active hover:underline"
                    >
                      + Add Update
                    </button>
                  )}
                </div>

                <div className="space-y-3 pl-2 border-l-2 border-brand-border">
                  {(selectedShipment.milestones || []).map((m: any, idx: number) => (
                    <div key={m.id || idx} className="relative pl-3 text-xs">
                      <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-brand-active border-2 border-white ring-1 ring-brand-active" />
                      <div className="flex items-center justify-between font-semibold text-brand-text">
                        <span>{m.status.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-brand-muted">
                          {new Date(m.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-brand-muted text-[11px] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-brand-muted" />
                        <span>{m.location}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{m.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selectedShipment.status !== 'DELIVERED' && (
                <div className="pt-3 border-t border-brand-border space-y-2">
                  <button
                    onClick={() => setShowPodModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Proof of Delivery (POD)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-brand-card border border-brand-border rounded-xl text-brand-muted text-xs">
              Select a freight shipment to view milestone timeline.
            </div>
          )}
        </div>
      </div>

      {/* Book Shipment Modal */}
      {showAddShipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Book Freight Carrier Shipment</h3>
              <button onClick={() => setShowAddShipmentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Carrier Provider *</label>
                <select
                  value={newShipment.carrierId}
                  onChange={(e) => setNewShipment({ ...newShipment, carrierId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white"
                >
                  {carriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.serviceType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Tracking / Waybill Number</label>
                <input
                  type="text"
                  placeholder="Auto-generated or custom e.g. DHL-992831"
                  value={newShipment.trackingNumber}
                  onChange={(e) => setNewShipment({ ...newShipment, trackingNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Origin *</label>
                  <input
                    type="text"
                    required
                    value={newShipment.origin}
                    onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={newShipment.destination}
                    onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Freight Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newShipment.freightCost}
                    onChange={(e) => setNewShipment({ ...newShipment, freightCost: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={newShipment.weightKg}
                    onChange={(e) => setNewShipment({ ...newShipment, weightKg: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowAddShipmentModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Log Tracking Milestone</h3>
              <button onClick={() => setShowMilestoneModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Milestone Event *</label>
                <select
                  value={milestoneForm.status}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white"
                >
                  <option value="PICKED_UP">Picked Up from Shipper</option>
                  <option value="IN_TRANSIT">In Transit Hub</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="CUSTOMS_HOLD">Customs Clearance Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={milestoneForm.location}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Event Description</label>
                <input
                  type="text"
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof of Delivery Modal */}
      {showPodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Record Proof of Delivery</h3>
              <button onClick={() => setShowPodModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPod} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Received By (Signer) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe, Receiving Lead"
                  value={podForm.receivedBy}
                  onChange={(e) => setPodForm({ ...podForm, receivedBy: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Receipt Notes / Inspection</label>
                <input
                  type="text"
                  value={podForm.notes}
                  onChange={(e) => setPodForm({ ...podForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowPodModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Confirm Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
