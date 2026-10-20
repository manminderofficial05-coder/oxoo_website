import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getPaletteById } from '../../data/palettes';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection = () => {
  const { config } = useBuilder();
  const palette = getPaletteById(config.paletteId);

  if (!config.testimonials || config.testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
            style={{ backgroundColor: palette.primaryLight, color: palette.primaryDark }}
          >
            Endorsements
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loved By Industry Leaders & Clients
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Real feedback from discerning clients who expect nothing less than perfection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {config.testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-base text-slate-700 italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-200/60">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{t.author}</h4>
                  <span className="text-xs text-slate-500">{t.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
