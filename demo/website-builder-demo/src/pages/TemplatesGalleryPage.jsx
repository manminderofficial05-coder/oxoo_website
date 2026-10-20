import React from 'react';
import { useBuilder } from '../context/BuilderContext';
import { useNavigate } from 'react-router-dom';
import { WEBSITE_TEMPLATES } from '../data/templates';
import { getPaletteById } from '../data/palettes';
import { getLayoutById } from '../data/layouts';
import {
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  CheckCircle2,
  Sparkles,
  Palette,
  Layout
} from 'lucide-react';

export const TemplatesGalleryPage = () => {
  const { loadTemplate, showToast } = useBuilder();
  const navigate = useNavigate();

  const handleUseTemplate = (templateId, directToPreview = false) => {
    loadTemplate(templateId);
    if (directToPreview) {
      navigate('/preview');
    } else {
      navigate('/editor');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Pre-Built Templates</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            5 Distinct Industry Demonstrations
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Each template is fully configured with customized branding, harmonious palettes, authentic high-resolution photography, and industry-tailored interactive components.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {WEBSITE_TEMPLATES.map((tmpl) => {
            const palette = getPaletteById(tmpl.paletteId);
            const layout = getLayoutById(tmpl.layoutId);

            return (
              <div
                key={tmpl.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Hero Thumbnail */}
                  <div className="relative h-64 overflow-hidden bg-slate-900">
                    <img
                      src={tmpl.heroImage}
                      alt={tmpl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white text-slate-900 shadow-md">
                        {tmpl.category}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-extrabold tracking-tight">
                        {tmpl.title}
                      </h3>
                      <p className="text-xs text-slate-200 mt-1 line-clamp-1 font-medium">
                        {tmpl.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {tmpl.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center gap-1">
                          <Palette className="w-3 h-3 text-indigo-500" />
                          Color Palette
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {palette.swatches.map((color, idx) => (
                              <span
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-slate-800">
                            {palette.name}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center gap-1">
                          <Layout className="w-3 h-3 text-indigo-500" />
                          Layout Style
                        </span>
                        <span className="text-xs font-semibold text-slate-800 block truncate">
                          {layout.name}
                        </span>
                      </div>
                    </div>

                    {/* Desired Pages Badges */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                        Included Custom Pages
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tmpl.desiredPages?.map((page, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium"
                          >
                            {page}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
                  <button
                    onClick={() => handleUseTemplate(tmpl.id, true)}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </button>

                  <button
                    onClick={() => handleUseTemplate(tmpl.id, false)}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Customize in Studio</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
