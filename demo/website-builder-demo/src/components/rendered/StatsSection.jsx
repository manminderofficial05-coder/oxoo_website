import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getPaletteById } from '../../data/palettes';

export const StatsSection = () => {
  const { config } = useBuilder();
  const palette = getPaletteById(config.paletteId);

  if (!config.stats || config.stats.length === 0) return null;

  return (
    <section className="py-12 border-y border-slate-200/80 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {config.stats.map((stat, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white border border-slate-100 shadow-xs">
              <div
                className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                style={{ color: palette.primary }}
              >
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
