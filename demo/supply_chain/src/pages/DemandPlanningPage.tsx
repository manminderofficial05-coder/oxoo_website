import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  ShoppingCart,
  Calendar,
  Layers,
  BarChart3,
  CheckCircle2,
  X,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';

export const DemandPlanningPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [horizonDays, setHorizonDays] = useState('30');
  const [activeScenario, setActiveScenario] = useState<'BASELINE' | 'CONSERVATIVE' | 'AGGRESSIVE'>('BASELINE');
  const [searchQuery, setSearchQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ products: any[] }>('/demand-planning/summary');
      const list = res.products || [];
      setProducts(list);
      if (list.length > 0 && !selectedProduct) {
        setSelectedProduct(list[0]);
      }
    } catch (err) {
      console.error('Failed to load demand planning summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateForecasts = async () => {
    setGenerating(true);
    try {
      const res = await apiRequest<{ forecasts: any[] }>('/demand-planning/forecasts', {
        method: 'POST',
        body: JSON.stringify({ horizonDays: parseInt(horizonDays) || 30 }),
      });
      setFeedback(`Generated multi-scenario demand forecasts for ${res.forecasts?.length || 0} items!`);
      await fetchData();
    } catch (err: any) {
      setFeedback(`Forecast generation error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shortages = products.filter((p) => p.isShortageProjected);

  // Scenario multipliers
  const scenarioMultiplier = activeScenario === 'CONSERVATIVE' ? 0.9 : activeScenario === 'AGGRESSIVE' ? 1.35 : 1.1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Demand Planning &amp; Forecasting</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Predictive Inventory Intelligence
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Compare actual historical consumption against projected demand scenarios to preempt stockout shortages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateForecasts}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{generating ? 'Forecasting...' : 'Compute Scenarios'}</span>
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

      {/* Shortage Alert Banner if shortages detected */}
      {shortages.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="font-bold text-xs sm:text-sm">
                Shortage Alert: {shortages.length} catalog items projected to breach safety buffer!
              </div>
              <div className="text-xs text-amber-800 mt-0.5">
                Demand forecast exceeds current stock + open incoming purchase orders.
              </div>
            </div>
          </div>
          <Link
            to="/replenishment"
            className="px-3 py-1.5 bg-amber-700 text-white rounded-lg text-xs font-semibold hover:bg-amber-800 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Launch Replenishment Orders
          </Link>
        </div>
      )}

      {/* Forecast Scenario Selector & Horizon */}
      <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Scenario Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-brand-text uppercase tracking-wider mr-1">Forecast Scenario:</span>
          {(['CONSERVATIVE', 'BASELINE', 'AGGRESSIVE'] as const).map((sc) => (
            <button
              key={sc}
              onClick={() => setActiveScenario(sc)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeScenario === sc
                  ? 'bg-brand-active text-white shadow-xs'
                  : 'bg-white border border-brand-border text-brand-muted hover:text-brand-text'
              }`}
            >
              {sc === 'CONSERVATIVE' && 'Conservative (-10%)'}
              {sc === 'BASELINE' && 'Baseline (+10% Trend)'}
              {sc === 'AGGRESSIVE' && 'Aggressive Growth (+35%)'}
            </button>
          ))}
        </div>

        {/* Horizon Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-brand-muted">Horizon:</span>
          <select
            value={horizonDays}
            onChange={(e) => setHorizonDays(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
          >
            <option value="30">Next 30 Days</option>
            <option value="60">Next 60 Days</option>
            <option value="90">Next 90 Days</option>
            <option value="180">Next 180 Days (Semi-Annual)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Products Table & Deep Dive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand Matrix Table */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-brand-border flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search catalog item or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
              />
            </div>
            <span className="text-xs text-brand-muted whitespace-nowrap">{filtered.length} products analyzed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3 text-right">Actual Historical (90d)</th>
                  <th className="py-3 px-3 text-right">On Hand</th>
                  <th className="py-3 px-3 text-right">Incoming PO</th>
                  <th className="py-3 px-3 text-right">Projected Demand</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filtered.map((p) => {
                  const isSelected = selectedProduct?.id === p.id;
                  const scenarioDemand = Math.round(p.baselineMonthly * scenarioMultiplier);
                  const scenarioNet = p.currentStock + p.incomingStock - scenarioDemand;
                  const isShortage = scenarioNet < p.minStock;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-active/5 font-medium' : 'hover:bg-brand-bg/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-brand-text">{p.name}</div>
                        <div className="text-[10px] font-mono text-brand-muted">{p.sku} • {p.category}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-brand-muted">
                        {p.actualPastConsumption} {p.uom}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-brand-text">
                        {p.currentStock} {p.uom}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-blue-700">
                        +{p.incomingStock}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-brand-text">
                        {scenarioDemand} {p.uom}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isShortage ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            DEFICIT RISK
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            OPTIMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Product Forecast Deep-Dive */}
        <div className="lg:col-span-1 space-y-4">
          {selectedProduct ? (
            <div className="bg-brand-card border border-brand-border rounded-xl shadow-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-brand-text">{selectedProduct.name}</h2>
                  <span className="text-xs font-mono text-brand-muted">{selectedProduct.sku}</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-brand-bg border border-brand-border text-brand-text">
                  {selectedProduct.category}
                </span>
              </div>

              {/* Historical vs Projected Breakdown */}
              <div className="p-3 bg-brand-bg rounded-lg border border-brand-border space-y-2 text-xs">
                <div className="flex justify-between text-brand-muted">
                  <span>Actual Consumption (Past 90d):</span>
                  <span className="font-semibold text-brand-text">
                    {selectedProduct.actualPastConsumption} {selectedProduct.uom}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Current Physical Stock:</span>
                  <span className="font-semibold text-brand-text">
                    {selectedProduct.currentStock} {selectedProduct.uom}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Open Scheduled Receipts:</span>
                  <span className="font-semibold text-blue-700">
                    +{selectedProduct.incomingStock} {selectedProduct.uom}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Configured Safety Stock Buffer:</span>
                  <span className="font-semibold text-brand-text">
                    {selectedProduct.minStock} {selectedProduct.uom}
                  </span>
                </div>
                <div className="pt-2 border-t border-brand-border flex justify-between font-bold text-sm text-brand-text">
                  <span>Projected {activeScenario} Demand:</span>
                  <span className="text-brand-active">
                    {Math.round(selectedProduct.baselineMonthly * scenarioMultiplier)} {selectedProduct.uom}
                  </span>
                </div>
              </div>

              {/* Projected Position Warning/Success */}
              {selectedProduct.currentStock +
                selectedProduct.incomingStock -
                Math.round(selectedProduct.baselineMonthly * scenarioMultiplier) <
              selectedProduct.minStock ? (
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Projected Stockout Detected!</span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Stock balance is projected to fall below minimum safety reserve during the selected horizon.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Adequate inventory coverage to satisfy projected demand without shortage.</span>
                </div>
              )}

              {/* Action */}
              <div className="pt-2 border-t border-brand-border">
                <Link
                  to="/replenishment"
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-brand-active text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-active/90 transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Create Replenishment Order</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-brand-card border border-brand-border rounded-xl text-brand-muted text-xs">
              Select a catalog product to review demand projections.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
