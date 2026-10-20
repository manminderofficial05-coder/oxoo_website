import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getPaletteById } from '../../data/palettes';
import { Send, Heart, Sparkles } from 'lucide-react';

export const FooterSection = () => {
  const { config, showToast } = useBuilder();
  const palette = getPaletteById(config.paletteId);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      showToast('Subscribed to VIP updates!', 'success');
      setNewsletterEmail('');
    }
  };

  const pages = config.desiredPages || ['Home', 'About Us', 'Services', 'Pricing', 'Contact'];

  return (
    <footer className="bg-slate-950 text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-md"
                style={{ backgroundColor: palette.primary }}
              >
                {config.title ? config.title.charAt(0) : 'W'}
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                {config.title}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {config.tagline || config.description}
            </p>

            <div className="flex items-center gap-3 pt-2 text-slate-400 text-xs">
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">
                {config.category || 'Professional Business'}
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Navigation & Pages
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {pages.map((p, idx) => (
                <li key={idx}>
                  <a
                    href="#services"
                    className="hover:text-white transition"
                  >
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter box */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Stay Informed
            </h4>
            <p className="text-xs text-slate-400">
              Subscribe to receive exclusive insights, new drops, and seasonal updates.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 text-xs px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition hover:opacity-95"
                style={{ backgroundColor: palette.primary }}
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {config.title}. All rights reserved.</p>

          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="font-semibold text-slate-300">Website Builder Studio</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
