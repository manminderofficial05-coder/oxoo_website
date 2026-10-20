import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getPaletteById } from '../../data/palettes';
import { getLayoutById } from '../../data/layouts';
import { HeaderSection } from './HeaderSection';
import { HeroSection } from './HeroSection';
import { StatsSection } from './StatsSection';
import { FeaturesSection } from './FeaturesSection';
import { ShowcaseSection } from './ShowcaseSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FaqSection } from './FaqSection';
import { ContactSection } from './ContactSection';
import { FooterSection } from './FooterSection';
import { CartDrawer } from './CartDrawer';
import { BookingModal } from './BookingModal';
import { EnquiryModal } from './EnquiryModal';

export const RenderedWebsite = ({ isFullPreview = false }) => {
  const { config } = useBuilder();
  const palette = getPaletteById(config.paletteId);
  const layout = getLayoutById(config.layoutId);

  const visible = config.sectionsVisible || {
    hero: true,
    stats: true,
    features: true,
    showcase: true,
    testimonials: true,
    faq: true,
    contact: true,
    footer: true
  };

  const dynamicStyle = {
    fontFamily: layout.fontFamily || "'Plus Jakarta Sans', sans-serif",
    '--primary': palette.primary,
    '--primary-light': palette.primaryLight,
    '--primary-dark': palette.primaryDark,
    '--accent': palette.accent,
    '--bg': palette.background,
    '--surface': palette.surface,
    '--text': palette.text,
    '--muted': palette.muted,
    '--border': palette.border
  };

  return (
    <div
      className="w-full min-h-screen text-slate-900 bg-white selection:bg-indigo-500 selection:text-white"
      style={dynamicStyle}
    >
      {/* Dynamic Header */}
      <HeaderSection />

      {/* Sections */}
      {visible.hero !== false && <HeroSection />}
      {visible.stats !== false && <StatsSection />}
      {visible.features !== false && <FeaturesSection />}
      {visible.showcase !== false && <ShowcaseSection />}
      {visible.testimonials !== false && <TestimonialsSection />}
      {visible.faq !== false && <FaqSection />}
      {visible.contact !== false && <ContactSection />}
      {visible.footer !== false && <FooterSection />}

      {/* Modals & Interactive Drawers */}
      <CartDrawer />
      <BookingModal />
      <EnquiryModal />
    </div>
  );
};
