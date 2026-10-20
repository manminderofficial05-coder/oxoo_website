import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Unlock,
  Plus,
  X,
  FileCheck2,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const QualityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checks' | 'issues'>('checks');
  const [checks, setChecks] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Release hold modal
  const [selectedHoldCheck, setSelectedHoldCheck] = useState<any | null>(null);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [releasing, setReleasing] = useState(false);

  const fetchQuality = async () => {
    setLoading(true);
    try {
      const [chkRes, issRes] = await Promise.all([
        apiRequest<{ checks: any[] }>('/quality/checks'),
        apiRequest<{ issues: any[] }>('/quality/issues'),
      ]);
      setChecks(chkRes.checks || []);
      setIssues(issRes.issues || []);
    } catch (err) {
      console.error('Failed to load quality data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuality();
  }, []);

  // Scenario F: Authorized Release Quality Hold
  const handleReleaseHold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHoldCheck) return;
    setReleasing(true);
    try {
      await apiRequest(`/quality/checks/${selectedHoldCheck.id}/release-hold`, {
        method: 'POST',
        body: JSON.stringify({ releaseNotes }),
      });
      setFeedback(`Quality Hold released for ${selectedHoldCheck.product.name}. Inventory is now unblocked.`);
      setSelectedHoldCheck(null);
      setReleaseNotes('');
      fetchQuality();
    } catch (err: any) {
      alert(`Release error: ${err.message}`);
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Quality Control &amp; Quarantine</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Scenario F Active
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Incoming &amp; production inspections. Failed checks automatically lock lots in quarantine, preventing unauthorized dispatch.
          </p>
        </div>

        <button
          onClick={fetchQuality}
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

      {/* Tabs */}
      <div className="flex border-b border-brand-border space-x-1">
        <button
          onClick={() => setActiveTab('checks')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'checks'
              ? 'border-brand-active text-brand-active'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Quality Inspections ({checks.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'issues'
              ? 'border-brand-active text-brand-active'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Open Quality Issues ({issues.length})</span>
        </button>
      </div>

      {activeTab === 'checks' && (
        <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-3.5">Check #</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Threshold / Benchmark</th>
                  <th className="py-3 px-3">Result</th>
                  <th className="py-3 px-3">Quarantine Hold</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {checks.map((chk) => (
                  <tr key={chk.id} className="hover:bg-brand-bg/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-brand-text">{chk.checkNumber}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-brand-text">{chk.product?.name}</div>
                      <div className="text-[10px] font-mono text-brand-muted">{chk.product?.sku}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {chk.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted max-w-xs truncate">{chk.threshold || 'Standard specs'}</td>
                    <td className="py-2.5 px-3">
                      {chk.status === 'PASSED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          PASSED
                        </span>
                      ) : chk.status === 'FAILED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          FAILED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {chk.holdActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-700 text-white flex items-center gap-1 w-max">
                          <ShieldAlert className="w-3 h-3" />
                          <span>QUARANTINE ACTIVE</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-brand-muted">Released</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {chk.holdActive ? (
                        <button
                          onClick={() => setSelectedHoldCheck(chk)}
                          className="px-2.5 py-1 bg-brand-active hover:bg-brand-teal text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>Release Hold</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issues.map((iss) => (
            <div key={iss.id} className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                  {iss.issueNumber} ({iss.severity})
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {iss.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-brand-text">{iss.title}</h3>
              <p className="text-xs text-brand-muted">{iss.description}</p>
              <div className="pt-2 border-t border-brand-border text-xs text-brand-muted space-y-1">
                <div>
                  <strong>Product:</strong> {iss.qualityCheck?.product?.name}
                </div>
                <div>
                  <strong>Corrective Action:</strong> {iss.correctiveAction || 'Quarantine pending investigation'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Release Hold Modal */}
      {selectedHoldCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-bold text-brand-text">Authorized Quality Hold Release</h3>
              <button onClick={() => setSelectedHoldCheck(null)} className="text-brand-muted hover:text-brand-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
              <div>
                <strong>Product:</strong> {selectedHoldCheck.product?.name}
              </div>
              <div>
                <strong>Reason for Hold:</strong> {selectedHoldCheck.notes || 'Inspection benchmark failure'}
              </div>
            </div>

            <form onSubmit={handleReleaseHold} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">
                  Corrective Action / Release Justification *
                </label>
                <textarea
                  required
                  rows={3}
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="e.g. Sample re-tested and passed secondary verification after calibration."
                  className="w-full p-2.5 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:outline-none focus:border-brand-active"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setSelectedHoldCheck(null)}
                  className="px-4 py-2 text-xs font-medium text-brand-muted hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={releasing}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors disabled:opacity-50"
                >
                  {releasing ? 'Releasing...' : 'Confirm Release from Hold'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
