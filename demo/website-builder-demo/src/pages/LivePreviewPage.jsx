import React from 'react';
import { useBuilder } from '../context/BuilderContext';
import { useNavigate } from 'react-router-dom';
import { RenderedWebsite } from '../components/rendered/RenderedWebsite';
import { exportWebsiteAsZip } from '../utils/zipExport';
import {
  Sliders,
  Save,
  Download,
  PlusCircle,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  Globe,
  Share2
} from 'lucide-react';

export const LivePreviewPage = () => {
  const {
    config,
    saveCurrentSite,
    setIsEnquiryModalOpen,
    resetToScratch,
    showToast,
    setStep
  } = useBuilder();

  const navigate = useNavigate();

  const handleExportZip = async () => {
    try {
      showToast('Generating standalone website ZIP package...', 'info');
      await exportWebsiteAsZip(config);
      showToast('ZIP exported successfully! Unpack and double-click index.html', 'success');
    } catch (err) {
      showToast('Failed to export ZIP', 'error');
    }
  };

  const handleStartNew = () => {
    if (window.confirm('Start a new website? You can always reload your saved sites from the Library.')) {
      navigate('/');
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Floating / Sticky Demo Preview Banner */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Responsive Preview
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">
              Simulating production deployment of <strong className="text-slate-200">{config.title}</strong>
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* Edit Website */}
            <button
              onClick={() => navigate('/editor')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
              title="Edit in Studio Editor"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Website</span>
            </button>

            {/* Save Site */}
            <button
              onClick={saveCurrentSite}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
              title="Save to My Saved Library"
            >
              <Save className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Save Site</span>
            </button>

            {/* Client Enquiry Simulation */}
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg transition"
              title="Submit Sample Client Enquiry"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Client Enquiry</span>
            </button>

            {/* Export ZIP */}
            <button
              onClick={handleExportZip}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition"
              title="Export Standalone Website Source ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ZIP</span>
            </button>

            {/* Start New Website */}
            <button
              onClick={handleStartNew}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
              title="Start a new website"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">New Website</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Full Screen Live Website */}
      <main className="flex-1">
        <RenderedWebsite isFullPreview={true} />
      </main>
    </div>
  );
};
