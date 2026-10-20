import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Package,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const ReplenishmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ recommendations: any[] }>('/purchase-orders/replenishment/recommendations');
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error('Failed to load replenishment recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Scenario D: Generate Purchase Order from Replenishment Recommendation
  const handleGeneratePO = async (rec: any) => {
    setGeneratingId(rec.productId);
    try {
      const res = await apiRequest<{ purchaseOrder: any }>('/purchase-orders/replenishment/generate-po', {
        method: 'POST',
        body: JSON.stringify({
          productId: rec.productId,
          suggestedQuantity: rec.suggestedQuantity,
          supplierId: rec.preferredSupplier?.id,
        }),
      });

      setFeedback(`Draft Purchase Order ${res.purchaseOrder.poNumber} generated successfully!`);
      setTimeout(() => {
        navigate(`/purchase`);
      }, 1500);
    } catch (err: any) {
      alert(`PO Generation failed: ${err.message}`);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">
              Replenishment &amp; Demand Forecasting
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Scenario D Live
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Automatic stockout protection. Calculates projected inventory (On-Hand + Inbound - Outbound) against safety minimums.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-brand-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-active" />
            Calculating multi-warehouse replenishment recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="col-span-full bg-brand-card border border-brand-border rounded-xl p-12 text-center shadow-card">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-brand-text">All Stock Above Safety Levels</h3>
            <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
              Projected inventory across all tracked stockable products meets or exceeds minimum reorder thresholds.
            </p>
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.productId}
              className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-4 hover:border-brand-active transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    Reorder Required
                  </span>
                  <h3 className="text-sm font-bold text-brand-text mt-1.5 leading-snug">{rec.productName}</h3>
                  <div className="text-xs font-mono text-brand-muted">{rec.sku}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-brand-muted uppercase font-bold">Suggested Qty</div>
                  <div className="text-xl font-bold text-brand-teal">{rec.suggestedQuantity} units</div>
                </div>
              </div>

              {/* Quantities Breakdown */}
              <div className="grid grid-cols-4 gap-1 p-2.5 bg-white border border-brand-border rounded-lg text-center text-xs">
                <div>
                  <div className="text-[10px] text-brand-muted font-semibold">On-Hand</div>
                  <div className="font-bold text-brand-text">{rec.onHand}</div>
                </div>
                <div>
                  <div className="text-[10px] text-brand-muted font-semibold">Inbound</div>
                  <div className="font-bold text-blue-700">+{rec.incoming}</div>
                </div>
                <div>
                  <div className="text-[10px] text-brand-muted font-semibold">Outbound</div>
                  <div className="font-bold text-amber-700">-{rec.outgoing}</div>
                </div>
                <div>
                  <div className="text-[10px] text-brand-muted font-semibold">Projected</div>
                  <div className="font-bold text-rose-800">{rec.projected}</div>
                </div>
              </div>

              {/* Reason Explanation */}
              <p className="text-xs text-brand-muted">{rec.reason}</p>

              {/* Preferred Supplier & Estimated Cost */}
              <div className="pt-2 border-t border-brand-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-brand-muted block text-[10px]">Supplier:</span>
                  <strong className="text-brand-text">{rec.preferredSupplier?.name || 'Unassigned'}</strong>
                </div>
                <div className="text-right">
                  <span className="text-brand-muted block text-[10px]">Est. Cost:</span>
                  <strong className="text-brand-teal">${rec.estimatedCost?.toFixed(2)}</strong>
                </div>
              </div>

              {/* Generate Draft PO Action */}
              <button
                onClick={() => handleGeneratePO(rec)}
                disabled={generatingId === rec.productId}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active transition-colors shadow-xs disabled:opacity-50"
              >
                {generatingId === rec.productId ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShoppingCart className="w-3.5 h-3.5" />
                )}
                <span>Generate Draft Purchase Order</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
