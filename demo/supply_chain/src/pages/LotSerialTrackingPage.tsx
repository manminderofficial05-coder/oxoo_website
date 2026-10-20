import React, { useState, useEffect } from 'react';
import {
  SearchCode,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  X,
  Calendar,
  Lock,
  Unlock,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';

export const LotSerialTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'LOTS' | 'SERIALS'>('LOTS');
  const [lots, setLots] = useState<any[]>([]);
  const [serials, setSerials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lotsRes, serRes] = await Promise.all([
        apiRequest<{ lots: any[] }>('/traceability/lots'),
        apiRequest<{ serials: any[] }>('/traceability/serials'),
      ]);
      setLots(lotsRes.lots || []);
      setSerials(serRes.serials || []);
    } catch (err) {
      console.error('Failed to load lot/serial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleBlock = async (lotId: string, currentBlocked: boolean) => {
    try {
      const res = await apiRequest<{ message: string }>(`/traceability/lots/${lotId}/toggle-block`, {
        method: 'POST',
        body: JSON.stringify({ reason: currentBlocked ? '' : 'Manual Quality Quarantine Block' }),
      });
      setFeedback(res.message);
      await fetchData();
    } catch (err: any) {
      setFeedback(`Toggle failed: ${err.message}`);
    }
  };

  const filteredLots = lots.filter(
    (l) =>
      l.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.product?.name && l.product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.product?.sku && l.product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSerials = serials.filter(
    (s) =>
      s.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.product?.name && s.product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.product?.sku && s.product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Lot &amp; Serial Tracking</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Full Unit Traceability
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Monitor batch lot expiration dates, enforce quarantine holds, and trace individual serialized units.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
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

      {/* Tabs and Search Bar */}
      <div className="p-4 bg-brand-card border border-brand-border rounded-xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('LOTS')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'LOTS'
                ? 'bg-brand-active text-white shadow-xs'
                : 'bg-white border border-brand-border text-brand-muted hover:text-brand-text'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tracked Lots ({lots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SERIALS')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'SERIALS'
                ? 'bg-brand-active text-white shadow-xs'
                : 'bg-white border border-brand-border text-brand-muted hover:text-brand-text'
            }`}
          >
            <SearchCode className="w-3.5 h-3.5" />
            <span>Serialized Units ({serials.length})</span>
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'LOTS' ? 'Search lot # or product...' : 'Search serial #...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg focus:outline-none focus:border-brand-active"
          />
        </div>
      </div>

      {/* Content Tables */}
      <div className="bg-brand-card border border-brand-border rounded-xl shadow-card overflow-hidden">
        {activeTab === 'LOTS' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4">Lot Batch #</th>
                  <th className="py-3 px-3">Product Catalog Item</th>
                  <th className="py-3 px-3">Storage Location</th>
                  <th className="py-3 px-3 text-right">Remaining Balance</th>
                  <th className="py-3 px-3">Expiration Date</th>
                  <th className="py-3 px-3 text-center">Quality Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredLots.map((lot) => {
                  const isExpired = lot.expirationDate && new Date(lot.expirationDate).getTime() < Date.now();

                  return (
                    <tr key={lot.id} className="hover:bg-brand-bg/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-brand-text">{lot.lotNumber}</div>
                        <div className="text-[10px] text-brand-muted">
                          Created: {new Date(lot.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-brand-text">{lot.product?.name}</div>
                        <div className="text-[10px] font-mono text-brand-muted">{lot.product?.sku}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-brand-text">
                          {lot.location?.warehouse?.name || 'Central Facility'} ({lot.location?.code || 'STORAGE'})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-brand-text">
                        {lot.quantity} {lot.product?.uom?.code || 'units'}
                      </td>
                      <td className="py-3 px-3">
                        {lot.expirationDate ? (
                          <div>
                            <div className="text-brand-text">{new Date(lot.expirationDate).toLocaleDateString()}</div>
                            {isExpired && (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                                EXPIRED
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-brand-muted italic">Non-perishable</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {lot.isBlocked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            QUALITY HOLD
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            RELEASED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleBlock(lot.id, lot.isBlocked)}
                            className={`px-2 py-1 rounded text-xs font-semibold border flex items-center gap-1 ${
                              lot.isBlocked
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {lot.isBlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{lot.isBlocked ? 'Release' : 'Hold'}</span>
                          </button>

                          <Link
                            to={`/traceability?q=${encodeURIComponent(lot.lotNumber)}`}
                            className="px-2 py-1 bg-white border border-brand-border rounded text-xs font-semibold text-brand-text hover:bg-brand-bg flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Trace</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg text-brand-muted uppercase text-[10px] font-bold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4">Serial Number</th>
                  <th className="py-3 px-3">Product Item</th>
                  <th className="py-3 px-3">Location Bay</th>
                  <th className="py-3 px-3 text-center">Unit Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredSerials.map((s) => (
                  <tr key={s.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-text">{s.serialNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-brand-text">{s.product?.name}</div>
                      <div className="text-[10px] font-mono text-brand-muted">{s.product?.sku}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-brand-muted">
                      {s.location?.warehouse?.name || 'Central Facility'} ({s.location?.code || 'MAIN'})
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/traceability?q=${encodeURIComponent(s.serialNumber)}`}
                        className="px-2.5 py-1 bg-white border border-brand-border rounded text-xs font-semibold text-brand-text hover:bg-brand-bg inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Trace Unit</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
