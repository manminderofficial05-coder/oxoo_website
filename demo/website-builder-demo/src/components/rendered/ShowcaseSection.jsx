import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getPaletteById } from '../../data/palettes';
import {
  Star,
  Clock,
  MapPin,
  Calendar,
  ShoppingBag,
  Check,
  Award,
  ArrowRight,
  UserCheck,
  Stethoscope
} from 'lucide-react';

export const ShowcaseSection = () => {
  const { config, addToCart, openBookingModal } = useBuilder();
  const palette = getPaletteById(config.paletteId);
  const [activeMenuTab, setActiveMenuTab] = useState('All');

  const isTravel = config.id?.includes('travel') || config.category?.toLowerCase().includes('travel');
  const isEcommerce = config.id?.includes('ecommerce') || config.category?.toLowerCase().includes('commerce') || config.type === 'E-commerce';
  const isRestaurant = config.id?.includes('restaurant') || config.category?.toLowerCase().includes('restaurant');
  const isCorporate = config.id?.includes('corporate') || config.category?.toLowerCase().includes('corporate');
  const isHealthcare = config.id?.includes('healthcare') || config.category?.toLowerCase().includes('health');

  // ==========================================
  // 1. TRAVEL & TOURISM SHOWCASE
  // ==========================================
  if (isTravel && config.destinations) {
    return (
      <section id="showcase" className="py-20 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
                style={{ backgroundColor: palette.primaryLight, color: palette.primaryDark }}
              >
                Signature Itineraries
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Featured World Expeditions
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-md mt-2 md:mt-0">
              Handcrafted small-group journeys led by local scholars, certified mountaineers, and native storytellers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.destinations.map((dest) => (
              <div
                key={dest.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span
                      className="absolute top-3 left-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm"
                      style={{ backgroundColor: palette.primary }}
                    >
                      {dest.tag}
                    </span>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-xs px-2 py-0.5 rounded">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{dest.location}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {dest.duration}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {dest.rating} ({dest.reviews})
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition">
                      {dest.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block">From</span>
                    <span className="text-lg font-extrabold text-slate-900">{dest.price}</span>
                  </div>

                  <button
                    onClick={() => openBookingModal('expedition', `Book ${dest.name}`)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition hover:opacity-95 shadow-xs"
                    style={{ backgroundColor: palette.primary }}
                  >
                    Reserve Spot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // 2. E-COMMERCE SHOWCASE
  // ==========================================
  if (isEcommerce && config.products) {
    return (
      <section id="showcase" className="py-20 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
                style={{ backgroundColor: palette.primaryLight, color: palette.primaryDark }}
              >
                Curated Collection
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Living & Home Essentials
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-md mt-2 md:mt-0">
              Sustainable materials, heirloom craftsmanship, and timeless minimalism for intentional everyday spaces.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {prod.badge && (
                      <span
                        className="absolute top-3 left-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs"
                        style={{ backgroundColor: palette.primary }}
                      >
                        {prod.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {prod.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {prod.description}
                    </p>

                    <div className="flex items-center gap-1 text-amber-500 text-xs font-medium mt-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{prod.rating}</span>
                      <span className="text-slate-400">({prod.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-extrabold text-slate-900">
                      ${prod.price.toFixed(2)}
                    </span>
                    {prod.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ${prod.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(prod)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition hover:opacity-95 shadow-xs"
                    style={{ backgroundColor: palette.primary }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // 3. RESTAURANT & FOOD SHOWCASE
  // ==========================================
  if (isRestaurant && config.dishes) {
    const tabs = ['All', 'Starters', 'Mains', 'Desserts'];
    const filteredDishes =
      activeMenuTab === 'All'
        ? config.dishes
        : config.dishes.filter((d) => d.category === activeMenuTab);

    return (
      <section id="showcase" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
              style={{ backgroundColor: palette.primaryLight, color: palette.primaryDark }}
            >
              Culinary Selections
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
              The Seasonal Tasting Menu
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Harmonizing coastal seafood, heritage wagyu, and biodynamic organic produce.
            </p>

            {/* Menu Tabs */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMenuTab(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                    activeMenuTab === tab
                      ? 'text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  style={activeMenuTab === tab ? { backgroundColor: palette.primary } : {}}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="flex gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition-all"
              >
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-bold text-base text-slate-900">
                        {dish.name}
                      </h4>
                      <span className="font-serif font-bold text-base" style={{ color: palette.primary }}>
                        {dish.price}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>
                  {dish.dietary && (
                    <span className="inline-block mt-2 self-start text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                      {dish.dietary}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Chef Spotlight */}
          {config.chef && (
            <div className="mt-16 p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl">
              <img
                src={config.chef.image}
                alt={config.chef.name}
                className="w-36 h-36 rounded-2xl object-cover border-2 border-white/20 shrink-0 shadow-lg"
              />
              <div className="flex-1 text-center md:text-left">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                  {config.chef.title}
                </span>
                <h3 className="text-2xl font-serif font-bold mt-1">{config.chef.name}</h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-2xl">
                  {config.chef.bio}
                </p>
              </div>
              <button
                onClick={() => openBookingModal('table', 'Book Chef Tasting Experience')}
                className="px-6 py-3 rounded-xl text-xs font-semibold text-white shrink-0 shadow-md transition hover:opacity-95"
                style={{ backgroundColor: palette.primary }}
              >
                Reserve Tasting Table
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ==========================================
  // 4. CORPORATE BUSINESS SHOWCASE
  // ==========================================
  if (isCorporate && config.caseStudies) {
    return (
      <section id="showcase" className="py-20 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-12">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
              style={{ backgroundColor: palette.primaryLight, color: palette.primaryDark }}
            >
              Proven Track Record
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Selected Impact Case Studies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {config.caseStudies.map((cs, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {cs.tag}
                  </span>
                  <div
                    className="text-2xl sm:text-3xl font-extrabold mt-4"
                    style={{ color: palette.primary }}
                  >
                    {cs.result}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">{cs.client}</h4>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{cs.summary}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Audited Strategic Outcome</span>
                  <span className="font-semibold" style={{ color: palette.primary }}>
                    Read Full Case Brief →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Leadership Team */}
          {config.team && (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Executive Leadership</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {config.team.map((member, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 p-6 flex flex-col items-center text-center shadow-xs"
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-slate-100 shadow-md"
                    />
                    <h4 className="font-bold text-base text-slate-900">{member.name}</h4>
                    <span className="text-xs font-semibold text-indigo-600 mt-0.5">{member.role}</span>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{member.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ==========================================
  // 5. HEALTHCARE & CLINIC SHOWCASE
  // ==========================================
  if (isHealthcare && config.doctors) {
    return (
      <section id="showcase" className="py-20 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
                style={{ backgroundColor: palette.primaryLight, color: palette.primaryDark }}
              >
                Board-Certified Staff
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Our Specialist Physicians
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-md mt-2 md:mt-0">
              Leading clinicians with advanced training from premier medical institutions dedicated to your family's health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-800 flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>{doc.availability}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      {doc.specialty}
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 mt-2">{doc.name}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">{doc.degrees}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{doc.experience}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Accepting Patients
                  </span>

                  <button
                    onClick={() => openBookingModal('appointment', `Consult with ${doc.name}`)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition hover:opacity-95 shadow-xs"
                    style={{ backgroundColor: palette.primary }}
                  >
                    Book Visit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback / Generic Showcase
  return null;
};
