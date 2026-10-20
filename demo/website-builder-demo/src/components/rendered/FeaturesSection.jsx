import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getPaletteById } from '../../data/palettes';
import {
  Compass,
  ShieldCheck,
  Users,
  Headphones,
  Sparkles,
  Truck,
  RotateCcw,
  Utensils,
  Wine,
  Flame,
  TrendingUp,
  Cpu,
  Layers,
  Shield,
  Activity,
  HeartHandshake,
  Stethoscope,
  ShieldAlert
} from 'lucide-react';

const ICON_MAP = {
  Compass,
  ShieldCheck,
  Users,
  Headphones,
  Sparkles,
  Truck,
  RotateCcw,
  Utensils,
  Wine,
  Flame,
  TrendingUp,
  Cpu,
  Layers,
  Shield,
  Activity,
  HeartHandshake,
  Stethoscope,
  ShieldAlert
};

export const FeaturesSection = () => {
  const { config } = useBuilder();
  const palette = getPaletteById(config.paletteId);

  if (!config.features || config.features.length === 0) return null;

  const renderIcon = (iconName) => {
    const IconComponent = ICON_MAP[iconName] || Sparkles;
    return <IconComponent className="w-6 h-6" style={{ color: palette.primary }} />;
  };

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
            style={{
              backgroundColor: palette.primaryLight,
              color: palette.primaryDark
            }}
          >
            Core Offerings
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {config.featuresTitle || 'Engineered For Distinct Quality'}
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Delivering consistency, thoughtfulness, and measurable distinction across all interactions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {config.features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: palette.primaryLight }}
                >
                  {renderIcon(feature.icon)}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold" style={{ color: palette.primary }}>
                <span>Learn details</span>
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
