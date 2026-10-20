import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { COLOR_PALETTES, getPaletteById } from '../../data/palettes';
import { ArrowRight, ArrowLeft, Palette, Check, Sparkles } from 'lucide-react';

export const Step3Palette = () => {
  const { config, updateConfigField, setStep } = useBuilder();

  const currentPalette = getPaletteById(config.paletteId);

  const handleSelect = (paletteId) => {
    updateConfigField('paletteId', paletteId);
  };

  return (
    <div className="py-10 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Step 3 of 5: Brand Aesthetics
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
          Select your brand color palette
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-xl mx-auto">
          Choose from 9 harmonic palettes. The live preview updates immediately so you can evaluate the visual impact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Palettes List (8 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {COLOR_PALETTES.map((palette) => {
              const isSelected = config.paletteId === palette.id;
              return (
                <div
                  key={palette.id}
                  onClick={() => handleSelect(palette.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative bg-white flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-900">
                        {palette.name}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mb-3">
                      {palette.category}
                    </span>

                    {/* Swatches dots */}
                    <div className="flex items-center gap-2 mb-2">
                      {palette.swatches.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-7 h-7 rounded-lg border border-slate-200 shadow-xs flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
                    {palette.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Mini Preview Card (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-xs text-slate-800">
                  Live Preview: {currentPalette.name}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase text-slate-400">
                {currentPalette.primary}
              </span>
            </div>

            {/* Mock website component */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-slate-50">
              {/* Header preview */}
              <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] text-white font-bold"
                    style={{ backgroundColor: currentPalette.primary }}
                  >
                    ●
                  </div>
                  <span className="font-bold text-xs text-slate-900 truncate max-w-[120px]">
                    {config.title || 'Your Brand'}
                  </span>
                </div>
                <div
                  className="px-2 py-0.5 rounded text-[10px] text-white font-semibold"
                  style={{ backgroundColor: currentPalette.primary }}
                >
                  Action
                </div>
              </div>

              {/* Hero preview */}
              <div
                className="p-5"
                style={{
                  background: `linear-gradient(180deg, ${currentPalette.primaryLight} 0%, #ffffff 100%)`
                }}
              >
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mb-2"
                  style={{
                    backgroundColor: currentPalette.primaryLight,
                    color: currentPalette.primaryDark
                  }}
                >
                  {config.category || 'Industry'}
                </span>
                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {config.title || 'Brand Headline'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {config.tagline || 'Experience unmatched distinction and elegance.'}
                </p>

                <div className="mt-3 flex gap-2">
                  <div
                    className="px-3 py-1.5 rounded-lg text-white font-semibold text-[11px] shadow-xs"
                    style={{ backgroundColor: currentPalette.primary }}
                  >
                    Primary Button
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[11px]">
                    Outline
                  </div>
                </div>
              </div>

              {/* Sample card preview */}
              <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div
                    className="text-base font-bold"
                    style={{ color: currentPalette.primary }}
                  >
                    99.4%
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase">Trust Rating</div>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div
                    className="text-base font-bold"
                    style={{ color: currentPalette.primary }}
                  >
                    24/7
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase">Live Concierge</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">
              Applied automatically across buttons, badges, highlights, links, and banners.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Info</span>
        </button>

        <button
          onClick={() => setStep(4)}
          className="flex items-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition transform hover:-translate-y-0.5"
        >
          <span>Choose Website Layout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
