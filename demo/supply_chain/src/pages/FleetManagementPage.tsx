import React, { useState, useEffect } from 'react';
import {
  Car,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  MapPin,
  Fuel,
  Wrench,
  AlertTriangle,
  User,
  DollarSign,
  X,
  Gauge,
  Navigation,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const FleetManagementPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forms
  const [newVehicle, setNewVehicle] = useState({
    vehicleCode: '',
    registrationNumber: '',
    make: 'Ford',
    model: 'F-650 Commercial Hauler',
    year: '2024',
    capacityKg: '7500',
    assignedDriverName: 'Marcus Vance',
    assignedDriverPhone: '+1 (555) 482-1923',
    operatingCostPerKm: '0.92',
  });

  const [tripForm, setTripForm] = useState({
    vehicleId: '',
    origin: 'Central Logistics Hub (WH-MAIN-01)',
    destination: 'Metro Distribution Center Bay 4',
    cargoDescription: 'Palletized sensors and component subassemblies',
    cargoWeightKg: '3200',
    driverName: '',
  });

  const [fuelForm, setFuelForm] = useState({
    fuelLiters: '85',
    fuelCost: '145.00',
    odometerKm: '45200',
    station: 'Shell Commercial Terminal 3',
  });

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiRequest<{ vehicles: any[] }>('/fleet/vehicles');
      const list = res.vehicles || [];
      setVehicles(list);

      if (list.length > 0 && !selectedVehicle) {
        setSelectedVehicle(list[0]);
      }
      if (list.length > 0 && !tripForm.vehicleId) {
        setTripForm((prev) => ({
          ...prev,
          vehicleId: list[0].id,
          driverName: list[0].assignedDriverName || 'Fleet Operator',
        }));
      }
    } catch (err) {
      console.error('Failed to load fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ vehicle: any }>('/fleet/vehicles', {
        method: 'POST',
        body: JSON.stringify(newVehicle),
      });
      setFeedback(`Vehicle ${res.vehicle.vehicleCode} added to active fleet!`);
      setShowAddVehicleModal(false);
      await fetchData();
      setSelectedVehicle(res.vehicle);
    } catch (err: any) {
      setErrorMessage(`Failed to add vehicle: ${err.message}`);
    }
  };

  const handleDispatchTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const res = await apiRequest<{ trip: any }>('/fleet/trips', {
        method: 'POST',
        body: JSON.stringify(tripForm),
      });
      setFeedback(`Trip ${res.trip.tripNumber} scheduled! Vehicle status updated to ON_TRIP.`);
      setShowDispatchModal(false);
      await fetchData();
      if (selectedVehicle?.id === tripForm.vehicleId) {
        const updated = await apiRequest<{ vehicles: any[] }>('/fleet/vehicles');
        const v = updated.vehicles.find((veh) => veh.id === tripForm.vehicleId);
        if (v) setSelectedVehicle(v);
      }
    } catch (err: any) {
      setErrorMessage(`Dispatch conflict error: ${err.message}`);
    }
  };

  const handleCompleteTrip = async (tripId: string) => {
    setErrorMessage(null);
    try {
      await apiRequest(`/fleet/trips/${tripId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ finalOdometer: 46000 }),
      });
      setFeedback(`Trip marked as completed! Vehicle returned to AVAILABLE status.`);
      await fetchData();
      if (selectedVehicle) {
        const updated = await apiRequest<{ vehicles: any[] }>('/fleet/vehicles');
        const v = updated.vehicles.find((veh) => veh.id === selectedVehicle.id);
        if (v) setSelectedVehicle(v);
      }
    } catch (err: any) {
      setErrorMessage(`Completion failed: ${err.message}`);
    }
  };

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    try {
      await apiRequest(`/fleet/vehicles/${selectedVehicle.id}/fuel`, {
        method: 'POST',
        body: JSON.stringify(fuelForm),
      });
      setFeedback(`Fuel log recorded for vehicle ${selectedVehicle.vehicleCode}!`);
      setShowFuelModal(false);
      await fetchData();
    } catch (err: any) {
      setErrorMessage(`Fuel logging failed: ${err.message}`);
    }
  };

  const filtered = vehicles.filter(
    (v) =>
      v.vehicleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ON_TRIP':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'MAINTENANCE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DECOMMISSIONED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const availableCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const onTripCount = vehicles.filter((v) => v.status === 'ON_TRIP').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Fleet Management</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Transport Assets
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Vehicle fleet tracking, conflict-free trip dispatching, driver assignments, and fuel efficiency telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDispatchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Dispatch Trip</span>
          </button>
          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
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

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fleet KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Total Fleet Assets</span>
            <Car className="w-4 h-4 text-brand-active" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">{vehicles.length}</div>
          <div className="text-[11px] text-brand-muted mt-0.5">Commercial transport units</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Available for Trip</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{availableCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Ready for dispatch</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Active On-Trip</span>
            <Navigation className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{onTripCount}</div>
          <div className="text-[11px] text-brand-muted mt-0.5">In transit deliveries</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Avg Operating Cost</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">$0.88 / km</div>
          <div className="text-[11px] text-brand-muted mt-0.5">Fuel &amp; scheduled service</div>
        </div>
      </div>

      {/* Main Grid: Vehicles Table & Selected Vehicle Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicles Directory */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search vehicle code, license plate, driver or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
              />
            </div>
            <span className="text-xs text-brand-muted">{filtered.length} vehicles registered</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-3">Make &amp; Model</th>
                  <th className="py-3 px-3">Capacity</th>
                  <th className="py-3 px-3">Assigned Driver</th>
                  <th className="py-3 px-3 text-right">Cost/km</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filtered.map((v) => {
                  const isSelected = selectedVehicle?.id === v.id;
                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVehicle(v)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-active/5 font-medium' : 'hover:bg-brand-bg/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-brand-text">{v.vehicleCode}</div>
                        <div className="text-[10px] font-mono text-brand-muted">{v.registrationNumber}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-brand-text">{v.make} {v.model}</div>
                        <div className="text-[10px] text-brand-muted">{v.year} Model</div>
                      </td>
                      <td className="py-3 px-3 text-brand-text font-medium">
                        {v.capacityKg ? `${v.capacityKg.toLocaleString()} kg` : 'N/A'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-brand-text">{v.assignedDriverName || 'Unassigned'}</div>
                        <div className="text-[10px] text-brand-muted">{v.assignedDriverPhone || ''}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-brand-text">
                        ${v.operatingCostPerKm?.toFixed(2) || '0.85'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(v.status)}`}>
                          {v.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Vehicle Profile & Trip History */}
        <div className="lg:col-span-1 space-y-4">
          {selectedVehicle ? (
            <div className="bg-brand-card border border-brand-border rounded-xl shadow-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-brand-text font-mono">{selectedVehicle.vehicleCode}</h2>
                  <span className="text-xs text-brand-muted">{selectedVehicle.make} {selectedVehicle.model}</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getStatusBadge(selectedVehicle.status)}`}>
                  {selectedVehicle.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Technical Specifications */}
              <div className="p-3 bg-brand-bg rounded-lg border border-brand-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted">License Plate:</span>
                  <span className="font-mono font-bold text-brand-text">{selectedVehicle.registrationNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted">Payload Capacity:</span>
                  <span className="font-semibold text-brand-text">{selectedVehicle.capacityKg?.toLocaleString()} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted">Operating Cost:</span>
                  <span className="font-bold text-brand-text">${selectedVehicle.operatingCostPerKm?.toFixed(2)} / km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted">Driver:</span>
                  <span className="font-medium text-brand-text">{selectedVehicle.assignedDriverName || 'Pool Driver'}</span>
                </div>
              </div>

              {/* Recent Trips */}
              <div>
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">Recent Trips</h3>
                <div className="space-y-2">
                  {(selectedVehicle.trips || []).slice(0, 3).map((trip: any) => (
                    <div key={trip.id} className="p-2.5 rounded-lg border border-brand-border bg-white text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-brand-text">{trip.tripNumber}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            trip.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {trip.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-brand-muted truncate">To: {trip.destination}</div>
                      {trip.status === 'DISPATCHED' && (
                        <button
                          onClick={() => handleCompleteTrip(trip.id)}
                          className="w-full mt-1 py-1 bg-emerald-600 text-white rounded text-[10px] font-semibold hover:bg-emerald-700"
                        >
                          Mark Trip Completed
                        </button>
                      )}
                    </div>
                  ))}
                  {(!selectedVehicle.trips || selectedVehicle.trips.length === 0) && (
                    <div className="text-xs text-brand-muted italic py-1">No recorded trips.</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-brand-border space-y-2">
                <button
                  onClick={() => setShowFuelModal(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-white border border-brand-border text-brand-text rounded-lg text-xs font-semibold hover:bg-brand-bg transition-colors"
                >
                  <Fuel className="w-3.5 h-3.5 text-amber-600" />
                  <span>Log Fuel Refill</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-brand-card border border-brand-border rounded-xl text-brand-muted text-xs">
              Select a vehicle to view driver assignment and trips.
            </div>
          )}
        </div>
      </div>

      {/* Dispatch Trip Modal (With Real Conflict Prevention) */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Schedule &amp; Dispatch Vehicle Trip</h3>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDispatchTrip} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Select Vehicle Asset *</label>
                <select
                  value={tripForm.vehicleId}
                  onChange={(e) => {
                    const veh = vehicles.find((v) => v.id === e.target.value);
                    setTripForm({
                      ...tripForm,
                      vehicleId: e.target.value,
                      driverName: veh?.assignedDriverName || tripForm.driverName,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleCode} - {v.make} ({v.status}) {v.status !== 'AVAILABLE' ? '⚠️ CONFLICT' : ''}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-brand-muted mt-1 block">
                  Note: The transaction engine strictly rejects assignments to vehicles currently ON_TRIP or in MAINTENANCE.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Assigned Driver</label>
                <input
                  type="text"
                  required
                  value={tripForm.driverName}
                  onChange={(e) => setTripForm({ ...tripForm, driverName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Trip Origin</label>
                  <input
                    type="text"
                    required
                    value={tripForm.origin}
                    onChange={(e) => setTripForm({ ...tripForm, origin: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Trip Destination</label>
                  <input
                    type="text"
                    required
                    value={tripForm.destination}
                    onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Cargo Description</label>
                  <input
                    type="text"
                    value={tripForm.cargoDescription}
                    onChange={(e) => setTripForm({ ...tripForm, cargoDescription: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Payload Weight (kg)</label>
                  <input
                    type="number"
                    value={tripForm.cargoWeightKg}
                    onChange={(e) => setTripForm({ ...tripForm, cargoWeightKg: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Register Fleet Vehicle</h3>
              <button onClick={() => setShowAddVehicleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Vehicle Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRK-004"
                    value={newVehicle.vehicleCode}
                    onChange={(e) => setNewVehicle({ ...newVehicle, vehicleCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">License Plate *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7XYZ-892"
                    value={newVehicle.registrationNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Make</label>
                  <input
                    type="text"
                    required
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Payload Capacity (kg)</label>
                  <input
                    type="number"
                    value={newVehicle.capacityKg}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacityKg: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Operating Cost / km</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newVehicle.operatingCostPerKm}
                    onChange={(e) => setNewVehicle({ ...newVehicle, operatingCostPerKm: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Fuel Modal */}
      {showFuelModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Log Fuel: {selectedVehicle.vehicleCode}</h3>
              <button onClick={() => setShowFuelModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogFuel} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Fuel (Liters) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={fuelForm.fuelLiters}
                    onChange={(e) => setFuelForm({ ...fuelForm, fuelLiters: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Total Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={fuelForm.fuelCost}
                    onChange={(e) => setFuelForm({ ...fuelForm, fuelCost: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Odometer Reading (km)</label>
                <input
                  type="number"
                  value={fuelForm.odometerKm}
                  onChange={(e) => setFuelForm({ ...fuelForm, odometerKm: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Fuel Station Location</label>
                <input
                  type="text"
                  value={fuelForm.station}
                  onChange={(e) => setFuelForm({ ...fuelForm, station: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowFuelModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold hover:bg-brand-active/90 shadow-xs"
                >
                  Save Fuel Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
