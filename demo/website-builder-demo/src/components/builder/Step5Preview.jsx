import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { useNavigate } from 'react-router-dom';
import { RenderedWebsite } from '../rendered/RenderedWebsite';
import { DeviceFrame } from '../common/DeviceFrame';
import { exportWebsiteAsZip } from '../../utils/zipExport';
import {
  ArrowLeft,
  Sliders,
  Eye,
  Save,
  Download,
  CheckCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const Step5Preview = () => {
  const { config, setStep, saveCurrentSite, showToast } = useBuilder();
  const navigate = useNavigate();

  const handleExportZip = async () => {
    try {
      showToast('Preparing standalone code package...', 'info');
      await exportWebsiteAsZip(config);
      showToast('ZIP exported successfully!', 'success');
    } catch (err) {
      showToast('Failed to export ZIP', 'error');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Banner Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep(4)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Layout</span>
          </button>

          <div className="h-4 w-px bg-slate-200"></div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">{config.title}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Step 5: Generated Preview
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={saveCurrentSite}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition"
          >
            <Save className="w-3.5 h-3.5 text-indigo-600" />
            <span>Save Configuration</span>
          </button>

          <button
            onClick={handleExportZip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ZIP</span>
          </button>

          <button
            onClick={() => navigate('/editor')}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Website (Step 6)</span>
          </button>

          <button
            onClick={() => navigate('/preview')}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview (Step 7)</span>
          </button>
        </div>
      </div>

      {/* Main Viewport with Device Frame */}
      <div className="flex-1 overflow-hidden">
        <DeviceFrame title={config.title}>
          <RenderedWebsite />
        </DeviceFrame>
      </div>
    </div>
  );
};
