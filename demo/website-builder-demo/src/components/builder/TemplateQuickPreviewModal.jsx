import React from 'react';
import { getPaletteById } from '../../data/palettes';
import { getLayoutById } from '../../data/layouts';
import { X, Check, Star, ArrowRight, Layers, Eye, Sparkles } from 'lucide-react';

export const TemplateQuickPreviewModal = ({ template, isOpen, onClose, onSelect }) => {
  if (!isOpen || !template) return null;

  const palette = getPaletteById(template.paletteId);
  const layout = getLayoutById(template.layoutId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: palette.primary }}
            >
              {template.category}
            </span>
            <div>
              <h3 className="font-bold text-base text-white">{template.title}</h3>
              <p className="text-xs text-slate-400">{template.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSelect(template.id);
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Use This Template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Hero Banner Representation */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 h-64 sm:h-72">
            <img
              src={template.heroImage}
              alt={template.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                {template.type}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">{template.title}</h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
                {template.description}
              </p>
            </div>
          </div>

          {/* Metadata Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Color Palette
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  {palette.swatches.map((color, idx) => (
                    <span
                      key={idx}
                      className="w-3 h-3 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="font-semibold text-slate-800">{palette.name}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Layout Style
              </span>
              <span className="font-semibold text-slate-800 block truncate">
                {layout.name}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Target Audience
              </span>
              <span className="font-medium text-slate-700 block truncate">
                {template.targetAudience}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Included Pages
              </span>
              <span className="font-semibold text-indigo-600 block">
                {template.desiredPages?.length || 5} Ready Pages
              </span>
            </div>
          </div>

          {/* Included Features List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Key Features & Components Included
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {template.features?.slice(0, 4).map((f, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: palette.primaryLight }}
                  >
                    <Check className="w-3.5 h-3.5" style={{ color: palette.primaryDark }} />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{f.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Review */}
          {template.testimonials?.[0] && (
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3">
              <img
                src={template.testimonials[0].avatar}
                alt={template.testimonials[0].author}
                className="w-10 h-10 rounded-full object-cover border border-indigo-200 shrink-0"
              />
              <div className="text-xs">
                <div className="flex items-center gap-1 text-amber-500 mb-0.5">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                </div>
                <p className="italic text-slate-700">"{template.testimonials[0].quote}"</p>
                <span className="font-bold text-slate-900 mt-1 block">
                  {template.testimonials[0].author} – {template.testimonials[0].location}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Clicking select will load this template into the setup wizard.
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onSelect(template.id);
                onClose();
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
            >
              Select Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
