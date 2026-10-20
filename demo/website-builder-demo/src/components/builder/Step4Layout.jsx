import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { WEBSITE_LAYOUTS, getLayoutById } from '../../data/layouts';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Star,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';

export const Step4Layout = () => {
  const { config, updateConfigField, setStep, showToast } = useBuilder();

  const handleSelect = (layoutId) => {
    updateConfigField('layoutId', layoutId);
    const layout = getLayoutById(layoutId);
    showToast(`Selected "${layout.name}" layout!`, 'info', 1800);
  };

  const handleContinue = () => {
    setStep(5);
  };

  const currentLayout = getLayoutById(config.layoutId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fe] via-[#fafaff] to-[#f4f6fc] flex flex-col relative overflow-hidden py-8 sm:py-10 px-4 sm:px-6">
      {/* Decorative Lavender & Indigo Glow Shapes */}
      <div className="absolute top-10 left-1/3 w-[520px] h-[520px] bg-purple-200/35 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-40 right-10 w-[460px] h-[460px] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-10 w-[420px] h-[420px] bg-sky-200/25 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-[1360px] w-full mx-auto flex-1 flex flex-col justify-between">
        {/* ========================================================= */}
        {/* PAGE HEADING AREA                                         */}
        {/* ========================================================= */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-indigo-200/70 shadow-2xs text-xs font-bold text-indigo-700 tracking-wider backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>DESIGN YOUR WEBSITE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight mt-2.5 leading-tight">
            Choose your website style
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium">
            Select a design that brings your brand to life.
          </p>
        </div>

        {/* ========================================================= */}
        {/* LAYOUT CARDS: 3-Column Desktop Grid                       */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-10">
          {WEBSITE_LAYOUTS.map((layout) => {
            const isSelected = config.layoutId === layout.id;

            return (
              <div
                key={layout.id}
                onClick={() => handleSelect(layout.id)}
                className={`group cursor-pointer p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 relative ${
                  isSelected ? 'clay-card-selected' : 'clay-card'
                }`}
              >
                <div>
                  {/* Card Header: Badge & Selection Checkmark */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {layout.badge}
                    </span>

                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full border border-slate-300 bg-white/80 group-hover:border-indigo-400 transition-colors flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-indigo-300 transition-colors"></div>
                      </span>
                    )}
                  </div>

                  {/* ========================================================= */}
                  {/* DETAILED MINIATURE WEBSITE THUMBNAIL PREVIEW               */}
                  {/* ========================================================= */}
                  <div className="h-44 rounded-2xl overflow-hidden mb-4.5 border border-slate-200/90 shadow-inner bg-slate-50 relative select-none">
                    {/* 1. MODERN & CLEAN MINIATURE WEBSITE */}
                    {layout.id === 'modern-clean' && (
                      <div className="h-full w-full flex flex-col bg-white">
                        {/* Micro Browser Bar */}
                        <div className="bg-slate-100/90 px-2.5 py-1 border-b border-slate-200 flex items-center justify-between text-[8px] text-slate-400">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          </div>
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500 font-mono text-[7px]">
                            modern-clean.co
                          </span>
                        </div>
                        {/* Micro Header */}
                        <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-md bg-indigo-600 flex items-center justify-center text-[7px] text-white font-bold">●</span>
                            <span className="font-extrabold text-[8px] text-slate-900">Nova</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[7px] text-slate-500 font-medium">
                            <span>Product</span>
                            <span>Pricing</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold">Get Started</span>
                          </div>
                        </div>
                        {/* Micro Split Hero */}
                        <div className="p-2.5 flex-1 grid grid-cols-12 gap-2 items-center bg-gradient-to-b from-indigo-50/40 to-white">
                          <div className="col-span-7 space-y-1">
                            <span className="inline-block px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 text-[6px] font-bold">STARTUP READY</span>
                            <div className="h-2.5 w-full bg-slate-900 rounded-sm"></div>
                            <div className="h-2 w-3/4 bg-indigo-600 rounded-sm"></div>
                            <div className="h-1.5 w-5/6 bg-slate-300 rounded-xs"></div>
                            <div className="pt-0.5 flex gap-1">
                              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[7px] font-bold">Explore</span>
                              <span className="px-2 py-0.5 rounded border border-slate-200 text-slate-600 text-[7px]">Demo</span>
                            </div>
                          </div>
                          <div className="col-span-5 relative">
                            <div className="h-16 rounded-lg bg-indigo-100 border border-indigo-200 overflow-hidden relative shadow-2xs">
                              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=300&q=80" alt="Dashboard" className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 right-1 bg-white/95 text-slate-800 text-[6px] font-bold px-1 rounded shadow-xs">★ 4.9</span>
                            </div>
                          </div>
                        </div>
                        {/* Micro Cards Row */}
                        <div className="px-2.5 py-1.5 bg-slate-50/70 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-[6px]">
                          <div className="p-1 rounded bg-white border border-slate-200 text-center">
                            <span className="font-bold text-indigo-600 block">Fast Sync</span>
                            <span className="text-slate-400">Cloud active</span>
                          </div>
                          <div className="p-1 rounded bg-white border border-slate-200 text-center">
                            <span className="font-bold text-indigo-600 block">Secure</span>
                            <span className="text-slate-400">256-Bit</span>
                          </div>
                          <div className="p-1 rounded bg-white border border-slate-200 text-center">
                            <span className="font-bold text-indigo-600 block">Modular</span>
                            <span className="text-slate-400">API First</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. PREMIUM & LUXURY MINIATURE WEBSITE */}
                    {layout.id === 'premium-luxury' && (
                      <div className="h-full w-full flex flex-col bg-[#0d0f17] text-amber-100">
                        {/* Micro Browser Bar */}
                        <div className="bg-black/60 px-2.5 py-1 border-b border-amber-900/40 flex items-center justify-between text-[7px] text-amber-500/70">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-700"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          </div>
                          <span className="font-serif italic tracking-widest text-[8px]">MAISON LUXE</span>
                        </div>
                        {/* Micro Centered Luxury Hero */}
                        <div className="p-3 flex-1 flex flex-col justify-between text-center border-b border-amber-900/30 bg-gradient-to-b from-[#141826] to-[#0d0f17]">
                          <div className="flex items-center justify-center gap-1.5 text-[6px] tracking-widest text-amber-400 uppercase">
                            <span className="w-4 h-px bg-amber-500/40"></span>
                            <span>HAUTE HERITAGE</span>
                            <span className="w-4 h-px bg-amber-500/40"></span>
                          </div>
                          <div className="my-1">
                            <h5 className="font-serif text-[11px] font-bold text-amber-100 tracking-wide">Timeless Grandeur</h5>
                            <p className="font-serif italic text-[7px] text-amber-200/70 mt-0.5">"Artistry perfected over generations"</p>
                          </div>
                          {/* Luxury Image Preview */}
                          <div className="h-14 w-full rounded border border-amber-500/30 overflow-hidden relative shadow-md">
                            <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80" alt="Luxury Plating" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-1">
                              <span className="px-2 py-0.5 text-[6px] tracking-widest uppercase bg-amber-500 text-black font-bold">Reserve Salon</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1 text-[6px] text-amber-300/80">
                            <span className="border-t border-amber-500/20 pt-0.5">Michelin Listed</span>
                            <span className="border-t border-amber-500/20 pt-0.5">Private Cellar</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. CREATIVE & IMAGE FOCUSED MINIATURE WEBSITE */}
                    {layout.id === 'creative-image' && (
                      <div className="h-full w-full flex flex-col bg-slate-900 text-white relative">
                        {/* Full-bleed visual hero with mountain & lake */}
                        <div className="relative h-24 overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" alt="Alpine lake" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30 p-2 flex flex-col justify-between">
                            <div className="flex justify-between items-center text-[7px]">
                              <span className="font-extrabold tracking-wider">AURA STUDIO</span>
                              <span className="px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs font-semibold text-[6px]">Visual ✦</span>
                            </div>
                            <div>
                              <span className="text-[6px] text-indigo-300 font-bold uppercase">CINEMATIC EXPEDITIONS</span>
                              <h5 className="text-[10px] font-extrabold leading-tight">Into The Alpine Wilds</h5>
                            </div>
                          </div>
                        </div>
                        {/* Asymmetrical Photo Tiles */}
                        <div className="p-2 grid grid-cols-3 gap-1.5 flex-1 bg-slate-950">
                          <div className="h-14 rounded-md overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=200&q=80" alt="Bali" className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 left-0.5 text-[6px] bg-black/60 px-1 rounded font-bold">Bali</span>
                          </div>
                          <div className="h-14 rounded-md overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=200&q=80" alt="Swiss" className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 left-0.5 text-[6px] bg-black/60 px-1 rounded font-bold">Alps</span>
                          </div>
                          <div className="h-14 rounded-md overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=200&q=80" alt="Kyoto" className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 left-0.5 text-[6px] bg-black/60 px-1 rounded font-bold">Kyoto</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. E-COMMERCE STYLE MINIATURE WEBSITE */}
                    {layout.id === 'ecommerce-style' && (
                      <div className="h-full w-full flex flex-col bg-white">
                        {/* Micro Announcement Bar */}
                        <div className="bg-slate-900 text-white text-[6px] py-0.5 text-center font-bold tracking-wider">
                          SPRING SALE: 20% OFF WITH CODE "SAVE20"
                        </div>
                        {/* Micro Store Header */}
                        <div className="px-2.5 py-1 border-b border-slate-100 flex items-center justify-between">
                          <span className="font-extrabold text-[8px] text-slate-900">LUXE STORE</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[7px] text-slate-500">Living</span>
                            <span className="text-[7px] text-slate-500">Home</span>
                            <div className="w-3.5 h-3.5 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                              <ShoppingBag className="w-2 h-2 text-indigo-600" />
                            </div>
                          </div>
                        </div>
                        {/* Micro Product Grid */}
                        <div className="p-2 grid grid-cols-3 gap-1.5 flex-1 bg-slate-50/50">
                          <div className="bg-white rounded-lg p-1 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                            <div className="h-11 rounded bg-slate-100 overflow-hidden relative">
                              <img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80" alt="Ceramic" className="w-full h-full object-cover" />
                              <span className="absolute top-0.5 left-0.5 bg-indigo-600 text-white text-[5px] font-bold px-1 rounded">HOT</span>
                            </div>
                            <div className="pt-0.5">
                              <span className="text-[7px] font-bold text-slate-900 block truncate">Pour-Over</span>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-[7px] font-extrabold text-indigo-600">$68</span>
                                <span className="text-[5px] font-bold bg-slate-900 text-white px-1 rounded">Add</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-1 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                            <div className="h-11 rounded bg-slate-100 overflow-hidden relative">
                              <img src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=200&q=80" alt="Lamp" className="w-full h-full object-cover" />
                            </div>
                            <div className="pt-0.5">
                              <span className="text-[7px] font-bold text-slate-900 block truncate">Brass Lamp</span>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-[7px] font-extrabold text-indigo-600">$145</span>
                                <span className="text-[5px] font-bold bg-slate-900 text-white px-1 rounded">Add</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-1 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                            <div className="h-11 rounded bg-slate-100 overflow-hidden relative">
                              <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=200&q=80" alt="Chair" className="w-full h-full object-cover" />
                            </div>
                            <div className="pt-0.5">
                              <span className="text-[7px] font-bold text-slate-900 block truncate">Oak Chair</span>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-[7px] font-extrabold text-indigo-600">$420</span>
                                <span className="text-[5px] font-bold bg-slate-900 text-white px-1 rounded">Add</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 5. PORTFOLIO STYLE MINIATURE WEBSITE */}
                    {layout.id === 'portfolio-style' && (
                      <div className="h-full w-full flex flex-col bg-slate-50">
                        {/* Micro Header */}
                        <div className="px-3 py-1 bg-white border-b border-slate-200 flex items-center justify-between">
                          <span className="font-mono font-bold text-[8px] text-slate-900">ALEX_STUDIO</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[6px] font-mono">Available For Q4</span>
                        </div>
                        {/* Micro Bento Grid Showcase */}
                        <div className="p-2 grid grid-cols-12 gap-1.5 flex-1">
                          {/* Big Case Study Tile */}
                          <div className="col-span-7 rounded-lg bg-white border border-slate-200 p-1.5 shadow-2xs flex flex-col justify-between">
                            <div>
                              <span className="text-[5px] uppercase font-bold text-indigo-600 tracking-wider">FEATURED CASE</span>
                              <h6 className="font-bold text-[8px] text-slate-900 mt-0.5">FinTech 2.0 System</h6>
                              <div className="h-10 rounded mt-1 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80" alt="Analytics" className="w-full h-full object-cover" />
                              </div>
                            </div>
                            <div className="pt-1 flex gap-1 text-[5px]">
                              <span className="px-1 rounded bg-slate-100 text-slate-600">React</span>
                              <span className="px-1 rounded bg-slate-100 text-slate-600">TypeScript</span>
                            </div>
                          </div>
                          {/* Right Stacked Tiles */}
                          <div className="col-span-5 flex flex-col gap-1.5">
                            <div className="p-1.5 rounded-lg bg-indigo-600 text-white text-center flex-1 flex flex-col justify-center">
                              <span className="text-[11px] font-black leading-none">48+</span>
                              <span className="text-[6px] text-indigo-200 mt-0.5">Projects Built</span>
                            </div>
                            <div className="p-1 rounded-lg bg-white border border-slate-200 text-center flex-1 flex flex-col justify-center">
                              <span className="text-[8px] font-bold text-slate-900">★ 5.0 Rating</span>
                              <span className="text-[5px] text-slate-400">Client Reviews</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6. CORPORATE STYLE MINIATURE WEBSITE */}
                    {layout.id === 'corporate-style' && (
                      <div className="h-full w-full flex flex-col bg-white">
                        {/* Micro Corporate Top Bar */}
                        <div className="bg-slate-900 text-slate-300 text-[6px] px-2.5 py-0.5 flex justify-between">
                          <span>Global Strategic Advisory</span>
                          <span>+1 (800) 840-7700</span>
                        </div>
                        {/* Micro Header */}
                        <div className="px-2.5 py-1.5 border-b border-slate-200 flex items-center justify-between">
                          <span className="font-bold text-[8px] tracking-tight text-slate-900">APEX ADVISORY</span>
                          <div className="flex gap-1.5 text-[6px] text-slate-600">
                            <span>Services</span>
                            <span>Case Studies</span>
                            <span className="px-1.5 py-0.5 bg-indigo-600 text-white font-bold rounded">Consult</span>
                          </div>
                        </div>
                        {/* Corporate Split Hero */}
                        <div className="p-2.5 flex-1 bg-gradient-to-b from-slate-50 to-white flex flex-col justify-between">
                          <div>
                            <span className="text-[6px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded">
                              INSTITUTIONAL ADVISORY
                            </span>
                            <h6 className="font-extrabold text-[9px] text-slate-900 mt-0.5 leading-snug">
                              Empowering Next-Gen Enterprise Capital
                            </h6>
                          </div>
                          {/* Structured Key Metrics Bar */}
                          <div className="grid grid-cols-3 gap-1 my-1 text-center bg-slate-50 p-1 rounded-md border border-slate-200">
                            <div>
                              <span className="font-black text-[8px] text-indigo-700 block">$4.2B+</span>
                              <span className="text-[5px] text-slate-500 uppercase">Advised</span>
                            </div>
                            <div>
                              <span className="font-black text-[8px] text-indigo-700 block">98.6%</span>
                              <span className="text-[5px] text-slate-500 uppercase">Retention</span>
                            </div>
                            <div>
                              <span className="font-black text-[8px] text-indigo-700 block">7 Offices</span>
                              <span className="text-[5px] text-slate-500 uppercase">Global</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[6px] text-slate-400">
                            <Shield className="w-2.5 h-2.5 text-indigo-600" />
                            <span>SEC & FINRA Audited Framework</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Layout Title and Subtitle Description */}
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {layout.name}
                  </h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                    {layout.subtitle}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {layout.description}
                  </p>

                  {/* Feature Tags with Claymorphic Pills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {layout.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-lg clay-pill text-slate-700"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clear Select Layout Button */}
                <div className="mt-5 pt-3.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(layout.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'clay-button-selected text-white'
                        : 'clay-button-unselected text-slate-700 hover:text-indigo-600'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Selected Style</span>
                      </>
                    ) : (
                      <>
                        <span>Select Layout</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* BOTTOM NAVIGATION ACTIONS                                 */}
        {/* ========================================================= */}
        <div className="pt-6 border-t border-indigo-100/70 flex items-center justify-between gap-4">
          <button
            onClick={() => setStep(3)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Palette</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Current selection:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
              {currentLayout.name}
            </span>
          </div>

          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-7 py-3 rounded-xl clay-button-selected text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Continue to Preview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
