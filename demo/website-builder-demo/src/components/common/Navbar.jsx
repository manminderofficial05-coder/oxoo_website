import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  Bookmark,
  MessageSquare,
  Sliders,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const {
    savedSites,
    leadEnquiries,
    setIsSavedSitesOpen,
    setIsEnquiryModalOpen,
    setStep
  } = useBuilder();

  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTemplatesPage = location.pathname.includes('/templates');

  const handleBrandClick = () => {
    navigate('/');
    setStep(1);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* WebsiteBuilder logo and brand name on the left */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
                  WebsiteBuilder
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Studio
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block leading-none mt-0.5">
                Standalone React Site Generator
              </p>
            </div>
          </button>
        </div>

        {/* Navigation actions on the right */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {/* Templates */}
          <button
            onClick={() => navigate('/templates')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isTemplatesPage
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Browse pre-built templates"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Templates</span>
          </button>

          {/* Library */}
          <button
            onClick={() => setIsSavedSitesOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer relative"
            title="My Saved Websites & Client Leads Library"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
            <span>Library</span>
            {(savedSites.length > 0 || leadEnquiries.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            )}
          </button>

          {/* Client Enquiry */}
          <button
            onClick={() => setIsEnquiryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors cursor-pointer border border-purple-200/60"
            title="Simulate sample client inquiry"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Client Enquiry</span>
          </button>

          {/* Customize */}
          <button
            onClick={() => navigate('/editor')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            title="Open Studio Editor"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => navigate('/editor')}
            className="px-2.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg"
          >
            Customize
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu containing only the allowed elements */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg">
          <button
            onClick={() => {
              navigate('/templates');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Templates</span>
          </button>
          <button
            onClick={() => {
              setIsSavedSitesOpen(true);
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            <Bookmark className="w-4 h-4 text-slate-500" />
            <span>Library</span>
          </button>
          <button
            onClick={() => {
              setIsEnquiryModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 rounded-lg"
          >
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span>Client Enquiry</span>
          </button>
          <button
            onClick={() => {
              navigate('/editor');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 rounded-lg"
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Customize</span>
          </button>
        </div>
      )}
    </header>
  );
};
