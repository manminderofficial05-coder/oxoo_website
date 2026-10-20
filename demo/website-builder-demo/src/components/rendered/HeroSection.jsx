import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getPaletteById } from '../../data/palettes';
import { getLayoutById } from '../../data/layouts';
import { ArrowRight, Sparkles, CheckCircle2, Star, ShieldCheck, Play } from 'lucide-react';

export const HeroSection = () => {
  const { config, openBookingModal, setIsCartOpen } = useBuilder();
  const palette = getPaletteById(config.paletteId);
  const layout = getLayoutById(config.layoutId);

  const isEcommerce = config.category?.toLowerCase().includes('commerce') || config.type === 'E-commerce';
  const isRestaurant = config.category?.toLowerCase().includes('restaurant') || config.id?.includes('restaurant');
  const isHealthcare = config.category?.toLowerCase().includes('health') || config.id?.includes('health');

  const handlePrimaryCta = () => {
    if (isEcommerce) {
      const el = document.getElementById('products') || document.getElementById('showcase');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (isRestaurant) {
      openBookingModal('table', 'Reserve Your Table');
    } else if (isHealthcare) {
      openBookingModal('appointment', 'Book a Consultation');
    } else {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSecondaryCta = () => {
    const el = document.getElementById('features') || document.getElementById('services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Creative Full Bleed Layout
  if (layout.id === 'creative-image') {
    return (
      <section className="relative min-h-[560px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Background visual */}
        <div className="absolute inset-0 z-0">
          <img
            src={config.heroImage}
            alt={config.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30"></div>
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{config.category || 'Curated Experiences'}</span>
          </div>

          <h1 className="text-3.5xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-md">
            {config.title}
          </h1>

          <p className="mt-4 text-lg sm:text-xl font-medium text-slate-200 max-w-2xl mx-auto">
            {config.tagline}
          </p>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {config.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handlePrimaryCta}
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition transform hover:-translate-y-0.5"
              style={{ backgroundColor: palette.primary }}
            >
              {isRestaurant ? 'Book a Table' : isHealthcare ? 'Book Appointment' : 'Explore Offerings'}
            </button>
            <button
              onClick={handleSecondaryCta}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition"
            >
              View Highlights
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 2. Premium & Luxury Layout (Editorial Centered)
  if (layout.id === 'premium-luxury') {
    return (
      <section className="relative py-20 lg:py-28 overflow-hidden bg-white border-b border-amber-900/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-amber-600/40"></div>
            <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold">
              {config.category || 'Haute Hospitality & Cuisine'}
            </span>
            <div className="w-12 h-px bg-amber-600/40"></div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
            {config.title}
          </h1>

          <p className="mt-5 text-xl font-serif italic text-amber-900/80 max-w-2xl mx-auto">
            "{config.tagline}"
          </p>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {config.description}
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={handlePrimaryCta}
              className="px-8 py-3.5 rounded-none font-semibold text-xs tracking-widest uppercase text-white shadow-md transition"
              style={{ backgroundColor: palette.primary }}
            >
              Reserve an Experience
            </button>
            <button
              onClick={handleSecondaryCta}
              className="px-8 py-3.5 rounded-none font-semibold text-xs tracking-widest uppercase border border-slate-300 text-slate-700 hover:border-slate-800 transition"
            >
              The Tasting Menu
            </button>
          </div>

          <div className="mt-12 relative max-w-3xl mx-auto">
            <img
              src={config.heroImage}
              alt={config.title}
              className="w-full h-80 sm:h-96 object-cover shadow-2xl border-4 border-white"
            />
          </div>
        </div>
      </section>
    );
  }

  // 3. Default Modern Split / Corporate / Ecommerce Layout
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: palette.primaryLight,
                borderColor: `${palette.primary}40`,
                color: palette.primaryDark
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.category || 'Official Website'}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-5.5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              {config.title}
            </h1>

            <p className="text-lg sm:text-xl font-semibold leading-snug" style={{ color: palette.primary }}>
              {config.tagline}
            </p>

            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              {config.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handlePrimaryCta}
                className="px-7 py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition transform hover:-translate-y-0.5 flex items-center gap-2"
                style={{ backgroundColor: palette.primary }}
              >
                <span>
                  {isEcommerce
                    ? 'Explore Catalog'
                    : isRestaurant
                    ? 'Reserve a Table'
                    : isHealthcare
                    ? 'Book Appointment'
                    : 'Get In Touch'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleSecondaryCta}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Learn More
              </button>
            </div>

            {/* Trust points */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Verified Excellence
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                4.9/5 Rating
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                Dedicated Support
              </span>
            </div>
          </div>

          {/* Right Image Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative gradient glow behind image */}
              <div
                className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl transition duration-500"
                style={{ backgroundColor: palette.primary }}
              ></div>

              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white">
                <img
                  src={config.heroImage}
                  alt={config.title}
                  className="w-full h-[380px] sm:h-[420px] object-cover hover:scale-105 transition duration-500"
                />

                {/* Floating highlight card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-white/60 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Featured In
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 mt-0.5">
                      {config.title} Excellence
                    </h5>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: palette.primary }}
                  >
                    ★ 5.0
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
