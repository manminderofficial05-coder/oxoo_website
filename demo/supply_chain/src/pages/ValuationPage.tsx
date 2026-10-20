import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Download,
  RefreshCw,
  PieChart as PieIcon,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const ValuationPage: React.FC = () => {
  const [valuationData, setValuationData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchValuation = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/inventory/valuation');
      setValuationData(res);
    } catch (err) {
      console.error('Failed to load valuation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValuation();
  }, []);

  const exportValuationCSV = () => {
    if (!valuationData?.valuationReport) return;
    const headers = ['Product', 'SKU', 'Category', 'On Hand Units', 'Unit Cost', 'Total Valuation'];
    const rows = valuationData.valuationReport.map((r: any) => [
      `"${r.name}"`,
      r.sku,
      `"${r.category}"`,
      r.onHandQuantity,
      r.unitCost,
      r.totalValuation,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `inventory_valuation_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text">Inventory Valuation &amp; Asset Ledger</h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Real-time balance valuation using weighted average cost and standard costing methodologies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportValuationCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Valuation CSV</span>
          </button>
          <button
            onClick={fetchValuation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* KPI Total Card */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
            Total Company Physical Inventory Valuation
          </span>
          <div className="text-3xl font-extrabold text-brand-teal mt-1">
            ${valuationData?.totalInventoryValuation?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="text-xs text-brand-muted mt-1 font-mono">
            Accounting Standard: {valuationData?.method || 'Standard Costing'} (USD)
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-brand-muted">
          <div className="p-3 bg-white border border-brand-border rounded-lg text-center">
            <span className="block text-[10px] uppercase font-bold text-brand-muted">Products Valued</span>
            <span className="text-base font-bold text-brand-text">
              {valuationData?.valuationReport?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Valuation Breakdown Table */}
      <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
              <tr>
                <th className="py-3 px-3.5">Product &amp; SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Physical On-Hand</th>
                <th className="py-3 px-3 text-right">Standard Unit Cost</th>
                <th className="py-3 px-3 text-right">Total Balance Valuation</th>
                <th className="py-3 px-3">Warehouse Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-muted">
                    Computing inventory balance values...
                  </td>
                </tr>
              ) : (
                valuationData?.valuationReport?.map((row: any) => (
                  <tr key={row.productId} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-brand-text">{row.name}</div>
                      <div className="text-[10px] font-mono text-brand-muted">{row.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted">{row.category}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-text">{row.onHandQuantity}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-brand-muted">
                      ${row.unitCost.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-teal">
                      ${row.totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted">
                      {row.warehouseBreakdown?.map((wb: any) => `${wb.warehouse} (${wb.qty})`).join(', ') || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
