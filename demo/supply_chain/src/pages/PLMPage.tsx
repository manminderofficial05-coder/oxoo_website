import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  CheckCircle2,
  Plus,
  RefreshCw,
  Clock,
  ArrowRight,
  X,
  FileCheck2,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const PLMPage: React.FC = () => {
  const [ecos, setEcos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchEcos = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ ecos: any[] }>('/plm/ecos');
      setEcos(res.ecos || []);
    } catch (err) {
      console.error('Failed to load ECOs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEcos();
  }, []);

  const handleApplyEco = async (ecoId: string) => {
    try {
      await apiRequest(`/plm/ecos/${ecoId}/apply`, { method: 'POST' });
      setFeedback('Engineering Change Order applied! Bill of Materials updated to new engineering revision.');
      fetchEcos();
    } catch (err: any) {
      alert(`Apply failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text">Product Lifecycle Management (PLM)</h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Engineering Change Requests &amp; Orders (ECO), component revision control, and historical versioning.
          </p>
        </div>

        <button
          onClick={fetchEcos}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ECO Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ecos.map((eco) => (
          <div key={eco.id} className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-brand-muted uppercase">{eco.ecoNumber}</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  eco.status === 'APPLIED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : eco.status === 'UNDER_REVIEW'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {eco.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-brand-text leading-snug">{eco.title}</h3>
            <p className="text-xs text-brand-muted">{eco.description}</p>

            <div className="p-3 bg-white border border-brand-border rounded-lg text-xs space-y-1">
              <div>
                <strong>Reason:</strong> {eco.reason}
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono">
                <span>Version:</span>
                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-bold">v{eco.oldVersion}</span>
                <ArrowRight className="w-3 h-3 text-brand-muted" />
                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded font-bold">
                  v{eco.newVersion}
                </span>
              </div>
              {eco.affectedProduct && (
                <div className="text-[11px] text-brand-muted pt-1">
                  Affected Assembly: <strong>{eco.affectedProduct.name}</strong>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-brand-border flex items-center justify-between">
              <span className="text-xs text-brand-muted">Requested by: {eco.requestedBy || 'Engineering'}</span>
              {eco.status !== 'APPLIED' ? (
                <button
                  onClick={() => handleApplyEco(eco.id)}
                  className="px-3 py-1.5 bg-brand-active hover:bg-brand-teal text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Approve &amp; Apply Revision
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Revision Active</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
