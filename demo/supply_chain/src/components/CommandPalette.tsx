import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Package, ShoppingCart, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Wrench, Hash } from 'lucide-react';
import { apiRequest } from '../lib/api.js';

interface SearchResult {
  category: string;
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiRequest<{ results: SearchResult[] }>(
          `/search?q=${encodeURIComponent(query)}`
        );
        setResults(res.results || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
    setQuery('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Products':
        return <Package className="w-4 h-4 text-brand-teal" />;
      case 'Purchase Orders':
        return <ShoppingCart className="w-4 h-4 text-brand-warning" />;
      case 'Receipts':
        return <ArrowDownToLine className="w-4 h-4 text-brand-success" />;
      case 'Deliveries':
        return <ArrowUpFromLine className="w-4 h-4 text-brand-info" />;
      case 'Internal Transfers':
        return <ArrowLeftRight className="w-4 h-4 text-purple-600" />;
      case 'Lots & Batches':
        return <Hash className="w-4 h-4 text-brand-muted" />;
      default:
        return <Wrench className="w-4 h-4 text-brand-muted" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white border border-brand-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-border bg-brand-card">
          <Search className="w-5 h-5 text-brand-muted shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, SKUs, barcodes, POs, lots, receipts..."
            autoFocus
            className="w-full bg-transparent text-sm text-brand-text placeholder-brand-muted focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-brand-muted hover:text-brand-text">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-brand-border/40">
          {loading && (
            <div className="p-6 text-center text-xs text-brand-muted">
              Searching enterprise index...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-brand-text">No records found</p>
              <p className="text-xs text-brand-muted mt-1">
                Try searching for demo barcodes like <strong>8901000000011</strong> or SKU <strong>SKU-ELEC-001</strong>
              </p>
            </div>
          )}

          {!loading && !query && (
            <div className="p-6 text-center text-xs text-brand-muted">
              Type at least 2 characters to search across products, shipments, lots, and orders.
            </div>
          )}

          {results.map((item) => (
            <button
              key={`${item.category}-${item.id}`}
              onClick={() => handleSelect(item.url)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left hover:bg-brand-bg transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-md bg-white border border-brand-border shrink-0 shadow-2xs">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-brand-text group-hover:text-brand-active truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-brand-muted truncate">{item.subtitle}</div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                {item.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
