import React from 'react';
import { useBuilder } from '../context/BuilderContext';
import { useNavigate } from 'react-router-dom';
import { EditorSidebar } from '../components/editor/EditorSidebar';
import { DeviceFrame } from '../components/common/DeviceFrame';
import { RenderedWebsite } from '../components/rendered/RenderedWebsite';
import { exportWebsiteAsZip } from '../utils/zipExport';
import {
  ArrowLeft,
  Save,
  Download,
  Eye,
  Sliders,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const EditorPage = () => {
  const { config, saveCurrentSite, showToast, loadTemplate } = useBuilder();
  const navigate = useNavigate();

  const handleExportZip = async () => {
    try {
      showToast('Generating standalone website ZIP package...', 'info');
      await exportWebsiteAsZip(config);
      showToast('ZIP exported successfully!', 'success');
    } catch (err) {
      showToast('Failed to export ZIP', 'error');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset this website to its original template defaults?')) {
      loadTemplate(config.id || 'travel-tourism');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Editor Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Wizard</span>
          </button>

          <div className="h-4 w-px bg-slate-200"></div>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900">{config.title}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Studio Editor (Step 6)
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Reset to Template Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={saveCurrentSite}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition"
          >
            <Save className="w-3.5 h-3.5 text-indigo-600" />
            <span>Save Changes</span>
          </button>

          <button
            onClick={handleExportZip}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ZIP</span>
          </button>

          <button
            onClick={() => navigate('/preview')}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview (Step 7)</span>
          </button>
        </div>
      </div>

      {/* Main Studio Editor Body: Sidebar + Device Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Sidebar */}
        <EditorSidebar />

        {/* Live Device Viewport */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col">
          <DeviceFrame title={config.title}>
            <RenderedWebsite />
          </DeviceFrame>
        </div>
      </div>
    </div>
  );
};
