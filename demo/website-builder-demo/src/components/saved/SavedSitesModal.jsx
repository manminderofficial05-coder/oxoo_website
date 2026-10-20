import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getPaletteById } from '../../data/palettes';
import { getLayoutById } from '../../data/layouts';
import {
  X,
  Bookmark,
  Trash2,
  ExternalLink,
  Inbox,
  Clock,
  ArrowRight,
  Globe,
  Sparkles,
  Phone,
  Mail,
  Building
} from 'lucide-react';

export const SavedSitesModal = () => {
  const {
    isSavedSitesOpen,
    setIsSavedSitesOpen,
    savedSites,
    loadSiteFromLibrary,
    removeSiteFromLibrary,
    leadEnquiries
  } = useBuilder();

  const [activeTab, setActiveTab] = useState('sites'); // 'sites' | 'leads'

  if (!isSavedSitesOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Website Studio Library</h3>
              <p className="text-xs text-slate-400">Manage saved demo configurations & client leads</p>
            </div>
          </div>

          <button
            onClick={() => setIsSavedSitesOpen(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sites')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'sites'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Saved Websites</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
              {savedSites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'leads'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Client Enquiries Inbox</span>
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px]">
              {leadEnquiries.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'sites' ? (
            savedSites.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-semibold text-slate-700">No saved websites yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Customize a website in the builder or editor, then click "Save Website" in the top bar to store your work here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedSites.map((site) => {
                  const palette = getPaletteById(site.paletteId);
                  const layout = getLayoutById(site.layoutId);
                  return (
                    <div
                      key={site.savedId}
                      className="border border-slate-200 rounded-xl p-4 bg-white hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {site.category || 'Website'}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 mt-1 truncate">{site.title}</h4>
                          </div>
                          <button
                            onClick={() => removeSiteFromLibrary(site.savedId)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{site.tagline || site.description}</p>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex gap-1">
                            {palette.swatches.map((color, idx) => (
                              <span
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            • {layout.name}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">
                          {site.savedAt ? new Date(site.savedAt).toLocaleDateString() : 'Recent'}
                        </span>
                        <button
                          onClick={() => loadSiteFromLibrary(site)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg font-medium transition flex items-center gap-1.5"
                        >
                          <span>Load Site</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            leadEnquiries.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-semibold text-slate-700">No client enquiries yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click "Client Enquiry" in the top bar or submit the contact form on any live website to simulate inbound leads.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leadEnquiries.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{lead.name}</h4>
                          {lead.company && (
                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                              {lead.company}
                            </span>
                          )}
                          <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                            {lead.websiteTitle || 'Demo Website'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {lead.timestamp ? new Date(lead.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-3 p-3 bg-white border border-slate-200/80 rounded-lg">
                      "{lead.message}"
                    </p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
