import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { COLOR_PALETTES } from '../../data/palettes';
import { WEBSITE_LAYOUTS } from '../../data/layouts';
import { ImagePickerModal } from './ImagePickerModal';
import {
  FileText,
  Image as ImageIcon,
  Palette,
  Eye,
  EyeOff,
  Type,
  Layout,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  RotateCcw,
  Check
} from 'lucide-react';

export const EditorSidebar = () => {
  const { config, updateConfigField, updateNestedField, showToast } = useBuilder();

  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'hero' | 'styling' | 'sections'
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);

  const fontOptions = [
    { label: 'Plus Jakarta Sans (Modern & Clean)', value: "'Plus Jakarta Sans', sans-serif" },
    { label: 'Inter (High-Conversion SaaS)', value: "'Inter', sans-serif" },
    { label: 'Playfair Display (Haute Luxury Serif)', value: "'Playfair Display', serif" },
    { label: 'Outfit (Creative & Bold)', value: "'Outfit', sans-serif" },
    { label: 'DM Sans (Corporate Executive)', value: "'DM Sans', sans-serif" },
    { label: 'Space Grotesk (Digital & Tech)', value: "'Space Grotesk', sans-serif" }
  ];

  const sectionsList = [
    { key: 'hero', label: 'Hero Header Section' },
    { key: 'stats', label: 'Quantifiable Metrics (Stats)' },
    { key: 'features', label: 'Core Offerings & Features' },
    { key: 'showcase', label: 'Industry Showcase (Products / Menu / Tours / Doctors)' },
    { key: 'testimonials', label: 'Client Reviews & Endorsements' },
    { key: 'faq', label: 'Frequently Asked Questions' },
    { key: 'contact', label: 'Contact Details & Inquiries' },
    { key: 'footer', label: 'Footer & Newsletter' }
  ];

  const toggleSection = (sectionKey) => {
    const current = config.sectionsVisible || {};
    const updated = {
      ...current,
      [sectionKey]: current[sectionKey] === false ? true : false
    };
    updateConfigField('sectionsVisible', updated);
    showToast(`Toggled ${sectionKey} visibility`, 'info', 1500);
  };

  const visible = config.sectionsVisible || {};

  return (
    <div className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden shadow-xs">
      {/* Sidebar Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'content'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Content Details"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Content</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'hero'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Hero Visuals"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Hero</span>
        </button>

        <button
          onClick={() => setActiveTab('styling')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'styling'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Design, Colors & Fonts"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Design</span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'sections'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Sections Toggle"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Sections</span>
        </button>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* ================= CONTENT TAB ================= */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Primary Identity
              </span>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website / Business Title
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateConfigField('title', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tagline / Value Proposition
              </label>
              <input
                type="text"
                value={config.tagline || ''}
                onChange={(e) => updateConfigField('tagline', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category / Badge
              </label>
              <input
                type="text"
                value={config.category || ''}
                onChange={(e) => updateConfigField('category', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Description
              </label>
              <textarea
                rows="3"
                value={config.description || ''}
                onChange={(e) => updateConfigField('description', e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-3">
                Contact Details
              </span>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={config.contactInfo?.phone || ''}
                    onChange={(e) => updateNestedField('contactInfo', 'phone', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={config.contactInfo?.email || ''}
                    onChange={(e) => updateNestedField('contactInfo', 'email', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={config.contactInfo?.address || ''}
                    onChange={(e) => updateNestedField('contactInfo', 'address', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Business Hours
                  </label>
                  <input
                    type="text"
                    value={config.contactInfo?.hours || ''}
                    onChange={(e) => updateNestedField('contactInfo', 'hours', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= HERO TAB ================= */}
        {activeTab === 'hero' && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                Hero Image Visual
              </span>

              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs mb-3">
                <img
                  src={config.heroImage}
                  alt="Current hero"
                  className="w-full h-40 object-cover"
                />
              </div>

              <button
                onClick={() => setIsImagePickerOpen(true)}
                className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Browse Curated Media Library</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Direct Image URL
              </label>
              <input
                type="url"
                value={config.heroImage || ''}
                onChange={(e) => updateConfigField('heroImage', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Features Title Headline
              </label>
              <input
                type="text"
                value={config.featuresTitle || ''}
                onChange={(e) => updateConfigField('featuresTitle', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* ================= STYLING TAB ================= */}
        {activeTab === 'styling' && (
          <div className="space-y-6">
            {/* Color Palette */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Color Palette
                </label>
                <span className="text-[11px] text-indigo-600 font-semibold">9 Options</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {COLOR_PALETTES.map((palette) => {
                  const isSelected = config.paletteId === palette.id;
                  return (
                    <button
                      key={palette.id}
                      onClick={() => updateConfigField('paletteId', palette.id)}
                      className={`p-2 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex gap-1 mb-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: palette.primary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: palette.accent }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 truncate block">
                        {palette.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography Font Pairing */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Typography Font Family
              </label>
              <select
                value={config.fontFamily || "'Plus Jakarta Sans', sans-serif"}
                onChange={(e) => updateConfigField('fontFamily', e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
              >
                {fontOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Layout Switcher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Website Layout Style
              </label>
              <div className="space-y-2">
                {WEBSITE_LAYOUTS.map((layout) => {
                  const isSelected = config.layoutId === layout.id;
                  return (
                    <button
                      key={layout.id}
                      onClick={() => updateConfigField('layoutId', layout.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 ring-1 ring-indigo-500 bg-indigo-50/50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">
                          {layout.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[220px]">
                          {layout.tagline}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTIONS TAB ================= */}
        {activeTab === 'sections' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-4">
              Show or hide individual sections with one click to streamline or expand your page.
            </p>

            {sectionsList.map((sec) => {
              const isVisible = visible[sec.key] !== false;
              return (
                <div
                  key={sec.key}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition"
                >
                  <span className="text-xs font-semibold text-slate-800">
                    {sec.label}
                  </span>
                  <button
                    onClick={() => toggleSection(sec.key)}
                    className={`p-1.5 rounded-lg transition ${
                      isVisible
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                    title={isVisible ? 'Visible (Click to hide)' : 'Hidden (Click to show)'}
                  >
                    {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        currentImage={config.heroImage}
        onSelectImage={(newUrl) => updateConfigField('heroImage', newUrl)}
      />
    </div>
  );
};
