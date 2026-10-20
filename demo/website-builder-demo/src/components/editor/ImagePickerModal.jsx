import React, { useState } from 'react';
import { X, Image as ImageIcon, Check, Link as LinkIcon, Search } from 'lucide-react';
import { SAMPLE_IMAGES } from '../../data/sampleImages';

export const ImagePickerModal = ({ isOpen, onClose, onSelectImage, currentImage }) => {
  const [customUrl, setCustomUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  const curatedImages = [
    { category: 'Travel & Nature', url: SAMPLE_IMAGES.travel.hero, label: 'Alpine Mountain Landscape' },
    { category: 'Travel & Nature', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', label: 'Tropical Ocean Sunset' },
    { category: 'Travel & Nature', url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80', label: 'Misty Forest Fjord' },
    { category: 'Products & Living', url: SAMPLE_IMAGES.ecommerce.hero, label: 'Modern Minimalist Interior' },
    { category: 'Products & Living', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80', label: 'Artisan Ceramic Pottery' },
    { category: 'Products & Living', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', label: 'Designer Lounge Furniture' },
    { category: 'Food & Dining', url: SAMPLE_IMAGES.restaurant.hero, label: 'Fine Dining Ambient Restaurant' },
    { category: 'Food & Dining', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', label: 'Gourmet Culinary Plating' },
    { category: 'Corporate & Tech', url: SAMPLE_IMAGES.corporate.hero, label: 'Architectural Modern Skyscraper' },
    { category: 'Corporate & Tech', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80', label: 'Executive Workspace' },
    { category: 'Healthcare & Wellness', url: SAMPLE_IMAGES.healthcare.hero, label: 'Modern Medical Facility' },
    { category: 'Healthcare & Wellness', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80', label: 'Clinical Care Specialists' }
  ];

  const categories = ['all', 'Travel & Nature', 'Products & Living', 'Food & Dining', 'Corporate & Tech', 'Healthcare & Wellness'];

  const filteredImages =
    selectedCategory === 'all'
      ? curatedImages
      : curatedImages.filter((img) => img.category === selectedCategory);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelectImage(customUrl.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Curated Media Library</h3>
              <p className="text-xs text-slate-400">Select an ultra-high resolution hero image or input a custom URL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom URL Input Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                placeholder="Paste any custom image URL (e.g. Unsplash, Cloudinary, etc.)..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
            >
              Use Custom URL
            </button>
          </form>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Images' : cat}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredImages.map((item, idx) => {
              const isSelected = currentImage === item.url;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectImage(item.url);
                    onClose();
                  }}
                  className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition shadow-xs hover:shadow-lg ${
                    isSelected ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.label}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <span className="text-[11px] font-bold text-white leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-indigo-300 uppercase mt-0.5">
                      {item.category}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
