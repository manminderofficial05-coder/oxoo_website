import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { Monitor, Tablet, Smartphone, ExternalLink, RefreshCw } from 'lucide-react';

export const DeviceFrame = ({ children, title = 'Preview' }) => {
  const { deviceMode, setDeviceMode } = useBuilder();

  return (
    <div className="flex flex-col h-full w-full">
      {/* Device Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                deviceMode === 'tablet'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                deviceMode === 'mobile'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            {deviceMode === 'desktop' && '100% Responsive'}
            {deviceMode === 'tablet' && '768 x 1024px'}
            {deviceMode === 'mobile' && '390 x 844px'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live React Preview
          </span>
        </div>
      </div>

      {/* Frame Container */}
      <div
        className={`flex-1 min-h-0 ${
          deviceMode === 'desktop'
            ? 'w-full h-full bg-white p-0 overflow-y-auto'
            : 'bg-slate-100 overflow-y-auto p-4 sm:p-6 flex justify-center items-start'
        }`}
      >
        {deviceMode === 'desktop' && (
          <div className="w-full min-h-full bg-white transition-all duration-300">
            {children}
          </div>
        )}

        {deviceMode === 'tablet' && (
          <div className="w-[768px] max-w-full my-auto bg-slate-900 rounded-[36px] p-3 shadow-2xl border-4 border-slate-800 transition-all duration-300">
            <div className="bg-white rounded-[26px] overflow-hidden h-[860px] overflow-y-auto relative">
              <div className="sticky top-0 z-30 bg-slate-900 text-white text-[10px] px-6 py-1 flex justify-between items-center select-none">
                <span>9:41 AM</span>
                <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></div>
                <span>100% 🔋</span>
              </div>
              {children}
            </div>
          </div>
        )}

        {deviceMode === 'mobile' && (
          <div className="w-[390px] max-w-full my-auto bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 transition-all duration-300">
            <div className="bg-white rounded-[34px] overflow-hidden h-[760px] overflow-y-auto relative">
              {/* iPhone style dynamic island / notch */}
              <div className="sticky top-0 z-30 bg-slate-900 text-white text-[11px] px-6 py-2 flex justify-between items-center select-none">
                <span>9:41</span>
                <div className="w-20 h-4 bg-black rounded-full flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                </div>
                <span>5G 100%</span>
              </div>
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
