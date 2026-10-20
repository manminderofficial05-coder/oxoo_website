import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Users,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'warehouses' | 'users' | 'categories'>('warehouses');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [whRes, userRes, catRes] = await Promise.all([
        apiRequest<{ warehouses: any[] }>('/warehouses'),
        apiRequest<{ users: any[] }>('/auth/users'),
        apiRequest<{ categories: any[] }>('/products/categories'),
      ]);
      setWarehouses(whRes.warehouses || []);
      setUsers(userRes.users || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text">Administration &amp; Master Configuration</h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Configure warehouses, bins, role permissions, approval thresholds, and enterprise hierarchies.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Config</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-border space-x-1">
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'warehouses'
              ? 'border-brand-active text-brand-active'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Warehouses &amp; Locations ({warehouses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-brand-active text-brand-active'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users &amp; Roles ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-brand-active text-brand-active'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Product Categories ({categories.length})</span>
        </button>
      </div>

      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {warehouses.map((wh) => (
            <div key={wh.id} className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-brand-muted uppercase">{wh.code}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded">
                  Active Facility
                </span>
              </div>
              <h3 className="text-base font-bold text-brand-text">{wh.name}</h3>
              <p className="text-xs text-brand-muted">{wh.address || 'Address on file'}</p>

              <div className="pt-2 border-t border-brand-border space-y-1.5 text-xs text-brand-muted">
                <div className="flex justify-between">
                  <span>Locations / Aisles:</span>
                  <strong className="text-brand-text">{wh.locationCount || 0} configured</strong>
                </div>
                <div className="flex justify-between">
                  <span>Stocked Items:</span>
                  <strong className="text-brand-text">{wh.productCount || 0} products</strong>
                </div>
                <div className="flex justify-between">
                  <span>Inventory Valuation:</span>
                  <strong className="text-brand-teal">${wh.totalStockValue?.toFixed(2) || '0.00'}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-3.5">User</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-brand-text">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-brand-muted">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-active text-white">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted">{u.department || 'Operations'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-brand-card border border-brand-border rounded-xl p-4 shadow-card space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-brand-muted">{c.code}</span>
              <h3 className="text-sm font-bold text-brand-text">{c.name}</h3>
              <p className="text-xs text-brand-muted">{c.description || 'Standard product classification.'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
