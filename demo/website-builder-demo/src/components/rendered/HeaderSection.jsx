import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getPaletteById } from '../../data/palettes';
import { ShoppingBag, Menu, X, Phone, Calendar } from 'lucide-react';

export const HeaderSection = () => {
  const { config, setIsCartOpen, cartItems, openBookingModal } = useBuilder();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const palette = getPaletteById(config.paletteId);

  const pages = config.desiredPages || ['Home', 'About', 'Services', 'Contact'];
  const isEcommerce = config.category?.toLowerCase().includes('commerce') || config.type === 'E-commerce';
  const isRestaurant = config.category?.toLowerCase().includes('restaurant') || config.id?.includes('restaurant');
  const isHealthcare = config.category?.toLowerCase().includes('health') || config.id?.includes('health');

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const scrollToSection = (pageName) => {
    setMobileMenuOpen(false);
    const targetId = pageName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const element = document.getElementById(targetId) || document.getElementById('services') || document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      {/* Optional Top Emergency / Announcement Bar */}
      {isHealthcare && config.contactInfo?.emergencyPhone && (
        <div className="bg-rose-600 text-white text-[11px] font-semibold py-1 px-4 text-center flex items-center justify-center gap-2">
          <span>🚨 24/7 Medical Hotline & Triage:</span>
          <a href={`tel:${config.contactInfo.emergencyPhone}`} className="underline font-bold tracking-wide">
            {config.contactInfo.emergencyPhone}
          </a>
        </div>
      )}

      {isEcommerce && (
        <div
          className="text-white text-[11px] font-semibold py-1.5 px-4 text-center tracking-wide"
          style={{ backgroundColor: palette.primaryDark }}
        >
          ✨ Enjoy Free Carbon-Neutral Shipping on orders over $100 • Use code <span className="underline">SAVE20</span> for 20% off
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition group-hover:scale-105"
              style={{ backgroundColor: palette.primary }}
            >
              {config.title ? config.title.charAt(0) : 'W'}
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block leading-tight">
                {config.title || 'Brand Name'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[200px]">
                {config.category || 'Official Website'}
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          {pages.slice(0, 5).map((page, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSection(page)}
              className="hover:text-slate-900 transition-colors cursor-pointer py-1"
            >
              {page}
            </button>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Icon for Ecommerce */}
          {isEcommerce && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: palette.primary }}
                >
                  {totalCartCount}
                </span>
              )}
            </button>
          )}

          {/* Reservation / Booking trigger */}
          {isRestaurant && (
            <button
              onClick={() => openBookingModal('table', 'Reserve a Table')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
              style={{ backgroundColor: palette.primary }}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reserve Table</span>
            </button>
          )}

          {isHealthcare && (
            <button
              onClick={() => openBookingModal('appointment', 'Schedule Clinic Visit')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
              style={{ backgroundColor: palette.primary }}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          )}

          {!isRestaurant && !isHealthcare && (
            <button
              onClick={() => {
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
              style={{ backgroundColor: palette.primary }}
            >
              Get in Touch
            </button>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {pages.map((page, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSection(page)}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              {page}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100">
            {isRestaurant ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBookingModal('table', 'Reserve a Table');
                }}
                className="w-full py-2.5 text-center text-xs font-semibold text-white rounded-xl shadow-xs"
                style={{ backgroundColor: palette.primary }}
              >
                Reserve Table
              </button>
            ) : isHealthcare ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBookingModal('appointment', 'Schedule Clinic Visit');
                }}
                className="w-full py-2.5 text-center text-xs font-semibold text-white rounded-xl shadow-xs"
                style={{ backgroundColor: palette.primary }}
              >
                Book Appointment
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 text-center text-xs font-semibold text-white rounded-xl shadow-xs"
                style={{ backgroundColor: palette.primary }}
              >
                Get in Touch
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
