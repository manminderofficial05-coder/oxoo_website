import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileText,
  ShoppingCart,
  ExternalLink,
  CheckCircle2,
  X,
  Star,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';

export const Vendor360Page: React.FC = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New vendor form state
  const [newVendor, setNewVendor] = useState({
    code: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    leadTimeDays: '7',
    paymentTerms: 'Net 30',
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ suppliers: any[] }>('/suppliers');
      const list = res.suppliers || [];
      setSuppliers(list);
      if (list.length > 0 && !selectedSupplier) {
        setSelectedSupplier(list[0]);
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ supplier: any }>('/suppliers', {
        method: 'POST',
        body: JSON.stringify(newVendor),
      });
      setFeedback(`Supplier ${res.supplier.name} added to approved vendor list!`);
      setShowAddModal(false);
      setNewVendor({
        code: '',
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        leadTimeDays: '7',
        paymentTerms: 'Net 30',
      });
      await fetchSuppliers();
      setSelectedSupplier(res.supplier);
    } catch (err: any) {
      setFeedback(`Creation failed: ${err.message}`);
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Vendor 360</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Supplier Intelligence Hub
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Manage vendor profiles, contracts, lead-time scorecards, and supplier performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vendor</span>
          </button>
          <button
            onClick={fetchSuppliers}
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

      {/* High-Level Supplier Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Active Suppliers</span>
            <Users className="w-4 h-4 text-brand-active" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">{suppliers.length}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">100% compliance certified</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Avg On-Time Delivery</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">94.8%</div>
          <div className="text-[11px] text-brand-muted mt-0.5">Target &gt; 92.0%</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Avg Lead Time</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">6.4 Days</div>
          <div className="text-[11px] text-brand-muted mt-0.5">Order-to-receipt cycle</div>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-muted">Quality Acceptance</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-brand-text mt-1">99.1%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">PPM Defect &lt; 250</div>
        </div>
      </div>

      {/* Main Grid: Supplier Table & Selected Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Suppliers */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by vendor name, code, contact or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
              />
            </div>
            <span className="text-xs text-brand-muted whitespace-nowrap">{filtered.length} suppliers listed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Lead Time</th>
                  <th className="py-3 px-3">Terms</th>
                  <th className="py-3 px-3 text-center">Orders</th>
                  <th className="py-3 px-3 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filtered.map((s) => {
                  const isSelected = selectedSupplier?.id === s.id;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedSupplier(s)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-active/5 font-medium' : 'hover:bg-brand-bg/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-brand-text">{s.name}</div>
                        <div className="text-[11px] font-mono text-brand-muted">{s.code}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-brand-text">{s.contactPerson || 'Account Rep'}</div>
                        <div className="text-[11px] text-brand-muted">{s.email || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                          {s.leadTimeDays || 7} Days
                        </span>
                      </td>
                      <td className="py-3 px-3 text-brand-muted">{s.paymentTerms || 'Net 30'}</td>
                      <td className="py-3 px-3 text-center font-bold text-brand-text">
                        {s._count?.purchaseOrders || 0}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>4.9</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Supplier Profile Detail Panel */}
        <div className="lg:col-span-1 space-y-4">
          {selectedSupplier ? (
            <div className="bg-brand-card border border-brand-border rounded-xl shadow-card p-5 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-brand-text">{selectedSupplier.name}</h2>
                  <span className="font-mono text-xs text-brand-muted">{selectedSupplier.code}</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  TIER-1 VENDOR
                </span>
              </div>

              {/* Contact Card */}
              <div className="p-3 bg-brand-bg rounded-lg border border-brand-border space-y-2 text-xs">
                <div className="flex items-center gap-2 text-brand-text font-medium">
                  <Users className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                  <span>{selectedSupplier.contactPerson || 'Head of Commercial Sales'}</span>
                </div>
                {selectedSupplier.email && (
                  <div className="flex items-center gap-2 text-brand-muted">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedSupplier.email}</span>
                  </div>
                )}
                {selectedSupplier.phone && (
                  <div className="flex items-center gap-2 text-brand-muted">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedSupplier.phone}</span>
                  </div>
                )}
                {selectedSupplier.address && (
                  <div className="flex items-center gap-2 text-brand-muted">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedSupplier.address}</span>
                  </div>
                )}
              </div>

              {/* Scorecard KPIs */}
              <div>
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">Performance Scorecard</h3>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg border border-brand-border bg-white">
                    <div className="text-[10px] text-brand-muted">Standard Lead Time</div>
                    <div className="font-bold text-sm text-brand-text mt-0.5">{selectedSupplier.leadTimeDays || 7} Days</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-brand-border bg-white">
                    <div className="text-[10px] text-brand-muted">Payment Terms</div>
                    <div className="font-bold text-sm text-brand-text mt-0.5">{selectedSupplier.paymentTerms || 'Net 30'}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-brand-border bg-white">
                    <div className="text-[10px] text-brand-muted">Purchase Orders</div>
                    <div className="font-bold text-sm text-brand-text mt-0.5">{selectedSupplier._count?.purchaseOrders || 0}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-brand-border bg-white">
                    <div className="text-[10px] text-brand-muted">Historical Receipts</div>
                    <div className="font-bold text-sm text-brand-text mt-0.5">{selectedSupplier._count?.receipts || 0}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-brand-border">
                <Link
                  to={`/purchase?supplierId=${selectedSupplier.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Create Purchase Order</span>
                </Link>

                <Link
                  to={`/rfq?supplierId=${selectedSupplier.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-brand-border text-brand-text rounded-lg text-xs font-semibold hover:bg-brand-bg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Invite to RFQ Tender</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-brand-card border border-brand-border rounded-xl text-brand-muted text-xs">
              Select a vendor from the list to view profile details.
            </div>
          )}
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border bg-brand-bg">
              <h3 className="font-bold text-brand-text text-sm">Add Approved Supplier</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Precision Components Inc."
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Supplier Code</label>
                  <input
                    type="text"
                    placeholder="Auto or SUP-004"
                    value={newVendor.code}
                    onChange={(e) => setNewVendor({ ...newVendor, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={newVendor.leadTimeDays}
                    onChange={(e) => setNewVendor({ ...newVendor, leadTimeDays: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Primary Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={newVendor.contactPerson}
                  onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="orders@vendor.com"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2831"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Payment Terms</label>
                  <select
                    value={newVendor.paymentTerms}
                    onChange={(e) => setNewVendor({ ...newVendor, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active bg-white"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Address / Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Munich, Germany"
                    value={newVendor.address}
                    onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
                  />
                </div>
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
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
