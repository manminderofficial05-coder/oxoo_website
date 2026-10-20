import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getPaletteById } from '../../data/palettes';
import { ChevronDown } from 'lucide-react';

export const FaqSection = () => {
  const { config } = useBuilder();
  const palette = getPaletteById(config.paletteId);
  const [openIndex, setOpenIndex] = useState(0);

  if (!config.faqs || config.faqs.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50/70 border-t border-slate-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
            style={{ backgroundColor: palette.primaryLight, color: palette.primaryDark }}
          >
            Questions & Clarity
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Everything you need to know about our services, process, and guarantees.
          </p>
        </div>

        <div className="space-y-4">
          {config.faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-base text-slate-900">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-slate-100' : 'bg-slate-50'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
