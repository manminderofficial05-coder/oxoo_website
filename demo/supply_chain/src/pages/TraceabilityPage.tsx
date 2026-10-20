import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SearchCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ShieldCheck,
  Factory,
  RotateCcw,
  RefreshCw,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const TraceabilityPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || 'LOT-2026-SENS-01');
  const [traceData, setTraceData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTrace = async (searchVal: string) => {
    if (!searchVal.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest(`/traceability/search?query=${encodeURIComponent(searchVal.trim())}`);
      setTraceData(res);
    } catch (err: any) {
      setTraceData(null);
      setError(err.message || 'Trace search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      executeTrace(q);
    } else {
      executeTrace('LOT-2026-SENS-01');
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
    executeTrace(query);
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'INBOUND_RECEIPT':
        return <ArrowDownToLine className="w-4 h-4 text-emerald-700" />;
      case 'QUALITY_INSPECTION':
        return <ShieldCheck className="w-4 h-4 text-brand-teal" />;
      case 'INTERNAL_TRANSFER':
        return <ArrowLeftRight className="w-4 h-4 text-purple-700" />;
      case 'MANUFACTURING_OUTPUT':
        return <Factory className="w-4 h-4 text-indigo-700" />;
      case 'OUTBOUND_DELIVERY':
        return <ArrowUpFromLine className="w-4 h-4 text-blue-700" />;
      case 'CUSTOMER_RETURN':
        return <RotateCcw className="w-4 h-4 text-amber-700" />;
      default:
        return <Layers className="w-4 h-4 text-brand-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Traceability &amp; Batch Journey</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Scenario G Active
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Full end-to-end forward and backward genealogy for tracked lots, serials, and components.
          </p>
        </div>
      </div>

      {/* Trace Query Search Box */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4 shadow-card">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Lot Number, Serial Number, SKU, or Barcode (e.g. LOT-2026-SENS-01)..."
              className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-active font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 bg-brand-teal text-white text-xs font-semibold rounded-lg hover:bg-brand-active transition-colors shadow-xs disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <SearchCode className="w-3.5 h-3.5" />}
            <span>Trace Product Journey</span>
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-brand-border text-xs">
          <span className="text-brand-muted font-bold text-[11px] uppercase">Seeded Trace Samples:</span>
          {['LOT-2026-SENS-01', 'LOT-2026-SENS-EXPIRING', 'SN-MTR-9001', '8901000000011', 'SKU-ASSY-021'].map(
            (sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setQuery(sample);
                  setSearchParams({ q: sample });
                  executeTrace(sample);
                }}
                className="px-2.5 py-1 font-mono text-[11px] bg-white border border-brand-border rounded hover:border-brand-active text-brand-text transition-colors"
              >
                {sample}
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {traceData && (
        <div className="space-y-6">
          {/* Identity & Current Balance Strip */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  Genealogy Target
                </span>
                <h2 className="text-xl font-bold text-brand-text">{traceData.product.name}</h2>
                <div className="flex items-center gap-4 text-xs font-mono text-brand-muted mt-1">
                  <span>SKU: {traceData.product.sku}</span>
                  <span>Barcode: {traceData.product.barcode}</span>
                  {traceData.lot && <span className="text-brand-teal font-bold">Lot: {traceData.lot.lotNumber}</span>}
                  {traceData.serial && (
                    <span className="text-brand-teal font-bold">Serial: {traceData.serial.serialNumber}</span>
                  )}
                </div>
              </div>

              {/* Current Storage Location */}
              <div className="p-3 bg-white border border-brand-border rounded-lg text-xs">
                <span className="text-brand-muted block text-[10px] uppercase font-bold">Current Physical Location</span>
                <span className="font-semibold text-brand-text flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-active" />
                  {traceData.lot?.location || traceData.serial?.location || 'Central Distribution Center (A1-RACK-01)'}
                </span>
              </div>
            </div>
          </div>

          {/* Forward & Backward Genealogy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backward Trace: Origin */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4 text-brand-active" />
                <span>Backward Trace (Where did this come from?)</span>
              </h3>
              <div className="p-3 bg-white border border-brand-border rounded-lg text-xs space-y-1.5">
                <div>
                  <strong>Primary Supplier Origin:</strong> {traceData.backwardTrace?.supplier}
                </div>
                <div>
                  <strong>Inbound Receipts:</strong>{' '}
                  {traceData.backwardTrace?.originReceipts?.join(', ') || 'Direct Procurement'}
                </div>
                <div>
                  <strong>BOM Hierarchy:</strong> {traceData.backwardTrace?.parentBOM}
                </div>
              </div>
            </div>

            {/* Forward Trace: Destination */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-brand-active" />
                <span>Forward Trace (Where did this batch go?)</span>
              </h3>
              <div className="p-3 bg-white border border-brand-border rounded-lg text-xs space-y-1.5">
                <div>
                  <strong>Customer Deliveries:</strong>{' '}
                  {traceData.forwardTrace?.deliveries?.length > 0
                    ? traceData.forwardTrace.deliveries.map((d: any) => `${d.deliveryNumber} (${d.customer})`).join(', ')
                    : 'Remains in physical warehouse stock'}
                </div>
                <div>
                  <strong>Assemblies Used In:</strong>{' '}
                  {traceData.forwardTrace?.manufacturingOrdersUsedIn?.length > 0
                    ? traceData.forwardTrace.manufacturingOrdersUsedIn.map((m: any) => m.moNumber).join(', ')
                    : 'Direct inventory or standalone unit'}
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Product Journey Timeline */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
            <h3 className="text-sm font-bold text-brand-text mb-4">Chronological Operational Journey</h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border">
              {traceData.journey?.map((step: any, idx: number) => (
                <div key={idx} className="relative">
                  {/* Timeline icon node */}
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white border-2 border-brand-active flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-active" />
                  </div>

                  <div className="bg-white border border-brand-border rounded-lg p-3.5 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        {getStageIcon(step.stage)}
                        <h4 className="text-xs font-bold text-brand-text">{step.title}</h4>
                      </div>
                      <span className="text-[11px] text-brand-muted font-mono">
                        {new Date(step.date).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-brand-text">{step.description}</p>
                    <div className="text-[11px] text-brand-muted mt-1 font-mono">Reference: {step.reference}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
