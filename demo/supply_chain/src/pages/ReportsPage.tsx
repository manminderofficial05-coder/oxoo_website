import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  RefreshCw,
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  Truck,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { apiRequest } from '../lib/api.js';

const PALETTE = ['#183F35', '#2F7259', '#CBD2B4', '#EED89A', '#D3ADA4', '#4875CF'];

export const ReportsPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [dash, sups] = await Promise.all([
        apiRequest('/dashboard/summary'),
        apiRequest<{ suppliers: any[] }>('/suppliers'),
      ]);
      setDashboardData(dash);
      setSuppliers(sups.suppliers || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const supplierLeadTimeChart = suppliers.map((s) => ({
    name: s.name.split(' ')[0],
    leadTime: s.leadTimeDays,
    rating: s.rating,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text">Reports &amp; Operational Analytics</h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Aggregated intelligence on inventory health, vendor lead times, production output, and fulfillment metrics.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Lead Time & Performance Chart */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-bold text-brand-text mb-1">Supplier Lead Time Benchmark (Days)</h3>
          <p className="text-xs text-brand-muted mb-4">Comparison of supplier replenishment turnaround</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierLeadTimeChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D7" vertical={false} />
                <XAxis dataKey="name" stroke="#7D8179" fontSize={11} />
                <YAxis stroke="#7D8179" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FCFBF7', borderColor: '#E4E0D7', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="leadTime" name="Lead Time (Days)" fill="#2F7259" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warehouse Stock Units Distribution */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-bold text-brand-text mb-1">Stock Units by Warehouse Distribution</h3>
          <p className="text-xs text-brand-muted mb-4">Physical unit inventory balanced across logistics nodes</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.charts?.warehouseDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D7" vertical={false} />
                <XAxis dataKey="name" stroke="#7D8179" fontSize={11} />
                <YAxis stroke="#7D8179" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FCFBF7', borderColor: '#E4E0D7', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="units" name="Stock Units" fill="#183F35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
