import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import {
  ArrowRight,
  ArrowLeft,
  Building,
  Tag,
  FileText,
  Users,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';

export const Step2Info = () => {
  const { config, updateConfigField, setStep, showToast } = useBuilder();

  const [errors, setErrors] = useState({});

  const availablePages = [
    'Home',
    'About Us',
    'Services',
    'Products',
    'Menu',
    'Pricing',
    'Blog',
    'Testimonials',
    'FAQ',
    'Gallery',
    'Contact'
  ];

  const togglePage = (pageName) => {
    const current = config.desiredPages || ['Home', 'About Us', 'Services', 'Contact'];
    let updated;
    if (current.includes(pageName)) {
      if (current.length <= 1) {
        showToast('At least one page is required', 'error');
        return;
      }
      updated = current.filter((p) => p !== pageName);
    } else {
      updated = [...current, pageName];
    }
    updateConfigField('desiredPages', updated);
  };

  const handleNext = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!config.title || !config.title.trim()) {
      newErrors.title = 'Business name is required';
    }
    if (!config.tagline || !config.tagline.trim()) {
      newErrors.tagline = 'Tagline or headline is required';
    }
    if (!config.description || !config.description.trim()) {
      newErrors.description = 'Please provide a short description';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please complete all required fields', 'error');
      return;
    }

    setErrors({});
    setStep(3);
  };

  return (
    <div className="py-10 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Step 2 of 5: Brand Fundamentals
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
          Tell us about your business
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          This information dynamically populates your headings, navigation menus, and messaging.
        </p>
      </div>

      <form onSubmit={handleNext} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
        {/* Business Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-indigo-600" />
            <span>Business / Brand Name *</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Wanderlust Expeditions or LuxeAura Living"
            value={config.title || ''}
            onChange={(e) => {
              updateConfigField('title', e.target.value);
              if (errors.title) setErrors({ ...errors, title: null });
            }}
            className={`w-full text-sm px-4 py-3 rounded-xl border bg-slate-50/50 transition focus:outline-none focus:bg-white ${
              errors.title
                ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500'
            }`}
          />
          {errors.title && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Industry / Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>Industry or Sector</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Travel & Hospitality, E-commerce"
              value={config.category || ''}
              onChange={(e) => updateConfigField('category', e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Target Audience</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Modern homeowners, enterprise leaders"
              value={config.targetAudience || ''}
              onChange={(e) => updateConfigField('targetAudience', e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tagline / One-Line Value Proposition *</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Discover Extraordinary Journeys Across The Globe"
            value={config.tagline || ''}
            onChange={(e) => {
              updateConfigField('tagline', e.target.value);
              if (errors.tagline) setErrors({ ...errors, tagline: null });
            }}
            className={`w-full text-sm px-4 py-3 rounded-xl border bg-slate-50/50 transition focus:outline-none focus:bg-white ${
              errors.tagline
                ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500'
            }`}
          />
          {errors.tagline && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              {errors.tagline}
            </p>
          )}
        </div>

        {/* Business Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            About The Business & What Makes It Unique *
          </label>
          <textarea
            rows="3"
            placeholder="Describe your history, bespoke philosophy, client guarantees, or signature products..."
            value={config.description || ''}
            onChange={(e) => {
              updateConfigField('description', e.target.value);
              if (errors.description) setErrors({ ...errors, description: null });
            }}
            className={`w-full text-sm p-4 rounded-xl border bg-slate-50/50 transition focus:outline-none focus:bg-white ${
              errors.description
                ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500'
            }`}
          ></textarea>
          {errors.description && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Desired Pages multi-select chips */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Desired Website Pages
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Select the pages to include in the primary navigation header and sitemap.
          </p>

          <div className="flex flex-wrap gap-2">
            {availablePages.map((page) => {
              const isSelected = (config.desiredPages || []).includes(page);
              return (
                <button
                  type="button"
                  key={page}
                  onClick={() => togglePage(page)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{page}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Type</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition transform hover:-translate-y-0.5"
          >
            <span>Proceed to Color Palette</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
