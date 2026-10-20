import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { WEBSITE_TEMPLATES, getDefaultConfigForType } from '../../data/templates';
import { TemplateQuickPreviewModal } from './TemplateQuickPreviewModal';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  Zap,
  Layers,
  Settings2,
  Smartphone,
  Eye,
  Check,
  Plane,
  ShoppingCart,
  Utensils,
  Briefcase,
  HeartPulse,
  MapPin,
  Calendar,
  Users,
  Search,
  Ticket,
  Building2,
  Car,
  FileText
} from 'lucide-react';

export const Step1Type = () => {
  const { config, updateConfig, setStep, resetToScratch, loadTemplate } = useBuilder();
  const navigate = useNavigate();

  const websiteTypes = [
    'Business Website',
    'E-commerce',
    'Blog',
    'Event Website',
    'E-learning'
  ];

  const industryPurposes = [
    { label: 'Travel & Tourism', templateId: 'travel-tourism', icon: Plane },
    { label: 'E-commerce & Retail', templateId: 'ecommerce-retail', icon: ShoppingCart },
    { label: 'Restaurant & Fine Food', templateId: 'restaurant-food', icon: Utensils },
    { label: 'Corporate & Finance', templateId: 'corporate-business', icon: Briefcase },
    { label: 'Healthcare & Clinic', templateId: 'healthcare-clinic', icon: HeartPulse }
  ];

  const [selectedType, setSelectedType] = useState(config.type || 'Business Website');
  const [selectedIndustry, setSelectedIndustry] = useState(
    config.category || 'Travel & Tourism'
  );

  // Quick preview modal state
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const handleApplySentence = () => {
    const match = industryPurposes.find((i) => i.label === selectedIndustry);
    if (match) {
      loadTemplate(match.templateId);
    } else {
      const base = getDefaultConfigForType(selectedType);
      updateConfig({
        ...base,
        type: selectedType,
        category: selectedIndustry
      });
    }
    setStep(2);
  };

  const handleSelectTemplate = (templateId) => {
    loadTemplate(templateId);
    setStep(2);
  };

  // 4 Benefits matching reference
  const benefits = [
    {
      icon: Zap,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50 border border-emerald-100',
      title: 'Quick Setup',
      desc: 'Get started in minutes'
    },
    {
      icon: Layers,
      iconColor: 'text-pink-500',
      iconBg: 'bg-pink-50 border border-pink-100',
      title: 'Professional Templates',
      desc: 'Beautiful & modern designs'
    },
    {
      icon: Settings2,
      iconColor: 'text-sky-500',
      iconBg: 'bg-sky-50 border border-sky-100',
      title: 'Fully Customizable',
      desc: 'Edit content, images, colors'
    },
    {
      icon: Smartphone,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50 border border-amber-100',
      title: 'Responsive Design',
      desc: 'Looks great on all devices'
    }
  ];

  // Specific data matching the 5 cards in reference image
  const templateCardDetails = {
    'travel-tourism': {
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80',
      overlayTitle: 'Explore',
      overlaySubtitle: 'Beautiful Destinations',
      overlayTagline: 'Plan Your Dream Vacation',
      overlayBtn: null,
      icon: Plane,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50 border border-sky-100',
      title: 'Travel & Tourism',
      description: 'Perfect for travel agencies, tour operators and holiday packages.'
    },
    'ecommerce-retail': {
      image: 'https://images.unsplash.com/photo-1589135233689-d56d2524f331?auto=format&fit=crop&w=600&q=80',
      overlayTitle: 'Authentic',
      overlaySubtitle: 'Homemade Pickles',
      overlayTagline: 'Traditional Taste, Always with You',
      overlayBtn: 'Shop Now',
      overlayBtnColor: 'bg-amber-500 text-white',
      icon: ShoppingCart,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50 border border-amber-100',
      title: 'E-commerce',
      description: 'Modern online store for products and retail businesses.'
    },
    'restaurant-food': {
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      overlayTitle: 'Delicious Food',
      overlaySubtitle: 'For Every Mood',
      overlayTagline: 'Authentic Taste | Fresh Ingredients',
      overlayBtn: 'Book a Table',
      overlayBtnColor: 'bg-rose-600 text-white',
      icon: Utensils,
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-50 border border-rose-100',
      title: 'Restaurant & Food',
      description: 'Ideal for restaurants, cafes, food chains and cloud kitchens.'
    },
    'corporate-business': {
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
      overlayTitle: 'Smart Solutions',
      overlaySubtitle: 'For Growing Businesses',
      overlayTagline: 'Strategy | Technology | Innovation',
      overlayBtn: 'Get Started',
      overlayBtnColor: 'bg-blue-600 text-white',
      icon: Briefcase,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border border-indigo-100',
      title: 'Corporate Business',
      description: 'Professional website for companies, startups and service providers.'
    },
    'healthcare-clinic': {
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
      overlayTitle: 'Your Health',
      overlaySubtitle: 'Our Priority',
      overlayTagline: 'Expert Care For A Better Tomorrow',
      overlayBtn: 'Book Appointment',
      overlayBtnColor: 'bg-teal-600 text-white',
      icon: HeartPulse,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50 border border-teal-100',
      title: 'Healthcare & Clinic',
      description: 'Best for hospitals, clinics, doctors and healthcare services.'
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcff] flex flex-col relative overflow-hidden py-8 sm:py-10 px-4 sm:px-6">
      {/* Soft Purple Ambient Background Glows */}
      <div className="absolute top-0 right-1/4 w-[540px] h-[540px] bg-purple-200/25 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-36 left-12 w-[460px] h-[460px] bg-sky-200/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-[1380px] w-full mx-auto flex-1 flex flex-col justify-between">
        {/* ========================================================= */}
        {/* TOP SECTION: Hero Headline, Sentence Form & Mockup         */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center mb-10 sm:mb-12">
          {/* Left Column: Heading, Subtitle, Sentence Card & Benefits (7 cols) */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-indigo-200/70 shadow-2xs text-xs font-semibold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Create Your Website</span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                What would you like to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  create?
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mt-2.5 max-w-xl font-normal leading-relaxed">
                Choose your website type and industry to get started with a professionally designed template.
              </p>
            </div>

            {/* Sentence-Style Dropdown Card matching reference image */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 lg:p-8 border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="text-slate-900 text-base sm:text-lg font-bold flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 lg:gap-3.5 leading-relaxed">
                <span className="font-bold text-slate-900 shrink-0">I want a</span>

                {/* Dropdown 1: Website Type */}
                <div className="relative inline-flex items-center bg-white border border-indigo-200/90 hover:border-indigo-400 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 shadow-2xs transition-colors cursor-pointer group shrink-0">
                  <FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-600 mr-2 sm:mr-2.5 shrink-0 stroke-[2]" />
                  <span className="text-slate-900 font-bold text-sm sm:text-base mr-2 sm:mr-3 whitespace-nowrap">
                    {selectedType}
                  </span>
                  <ChevronDown className="w-4 h-4 text-indigo-600 shrink-0" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    {websiteTypes.map((t) => (
                      <option key={t} value={t} className="text-slate-900 font-medium text-sm">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="font-bold text-slate-900 shrink-0">website for</span>

                {/* Dropdown 2: Business Industry */}
                <div className="relative inline-flex items-center bg-white border border-indigo-200/90 hover:border-indigo-400 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 shadow-2xs transition-colors cursor-pointer group shrink-0">
                  <Plane className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-sky-500 mr-2 sm:mr-2.5 shrink-0 stroke-[2] -rotate-45" />
                  <span className="text-slate-900 font-bold text-sm sm:text-base mr-2 sm:mr-3 whitespace-nowrap">
                    {selectedIndustry}
                  </span>
                  <ChevronDown className="w-4 h-4 text-indigo-600 shrink-0" />
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    {industryPurposes.map((ind) => (
                      <option key={ind.label} value={ind.label} className="text-slate-900 font-medium text-sm">
                        {ind.label}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="font-bold text-slate-900 shrink-0">.</span>
              </div>

              {/* Action Button & Link Below Sentence */}
              <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-6 sm:gap-8">
                <button
                  onClick={handleApplySentence}
                  className="px-6 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-[#2b59f3] via-[#5c3bf5] to-[#9d1bf2] hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_8px_22px_-2px_rgba(79,70,229,0.42)] transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Continue to Business Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={resetToScratch}
                  className="text-xs sm:text-sm font-medium text-[#2563eb] hover:text-[#1d4ed8] hover:underline transition-colors cursor-pointer"
                >
                  Skip and start from scratch
                </button>
              </div>
            </div>

            {/* Four Benefits Row directly underneath sentence card matching reference */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              {benefits.map((b, idx) => {
                const Icon = b.icon;
                return (
                  <div key={idx} className="flex items-center gap-2.5 sm:gap-3">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${b.iconBg} ${b.iconColor}`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-[13px] text-slate-900 leading-tight">
                        {b.title}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Laptop & Smartphone Mockup (5 cols) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Top Right Floating Badge */}
            <div className="absolute -top-3 right-6 z-30 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md text-xs font-bold text-slate-800">
              <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Plane className="w-3.5 h-3.5 -rotate-45" />
              </div>
              <span>Build Beautiful Websites Without Coding</span>
            </div>

            {/* Dotted Airplane Flight Path SVG */}
            <svg
              className="absolute -top-2 right-0 w-24 h-24 pointer-events-none z-10 text-indigo-400"
              viewBox="0 0 100 100"
              fill="none"
            >
              <path
                d="M 10,80 Q 50,40 85,25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <polygon points="85,20 95,25 85,30" fill="currentColor" />
            </svg>

            {/* Container for mockups */}
            <div className="relative w-full max-w-[500px]">
              {/* LAPTOP MOCKUP */}
              <div className="relative mx-auto w-full bg-slate-900 rounded-t-2xl p-2 sm:p-2.5 border-4 border-slate-800 shadow-2xl">
                {/* Laptop Camera Dot */}
                <div className="flex justify-center items-center mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                </div>

                {/* Laptop Screen Content */}
                <div className="bg-white rounded-lg overflow-hidden border border-slate-800 relative text-slate-900">
                  {/* Website Nav */}
                  <div className="px-3.5 py-2 bg-white/95 border-b border-slate-100 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-[8px]">
                        ★
                      </div>
                      <span className="font-extrabold text-[10px] tracking-tight text-slate-900">
                        Sunil Tours & Travels
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-600 font-medium">
                      <span className="hidden sm:inline">Home</span>
                      <span className="hidden sm:inline">Packages</span>
                      <span className="hidden sm:inline">Destinations</span>
                      <span className="hidden sm:inline">About</span>
                      <span className="hidden sm:inline">Contact</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[8px]">
                        Book Now
                      </span>
                    </div>
                  </div>

                  {/* Travel Hero with Mountain Lake & Traveler */}
                  <div className="relative h-44 sm:h-52 overflow-hidden bg-slate-900">
                    <img
                      src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80"
                      alt="Traveler exploring world"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent flex flex-col justify-between p-3.5 sm:p-4 text-white">
                      <div>
                        <h4 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                          Explore<br />The World
                        </h4>
                        <p className="text-[9px] font-semibold text-slate-200 mt-1">
                          Your Journey, Our Priority
                        </p>
                        <p className="text-[7px] text-slate-300 hidden sm:block">
                          Comfortable Travel | Best Packages | Memorable Experience
                        </p>
                      </div>

                      {/* Search Bar Overlay */}
                      <div className="p-1.5 bg-white/95 backdrop-blur-md rounded-xl text-slate-800 shadow-md flex items-center gap-1 text-[8px]">
                        <div className="flex-1 flex items-center gap-1 px-1.5 border-r border-slate-200">
                          <MapPin className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                          <span className="truncate">Destination</span>
                        </div>
                        <div className="flex-1 flex items-center gap-1 px-1.5 border-r border-slate-200">
                          <Calendar className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                          <span className="truncate">Travel Date</span>
                        </div>
                        <div className="flex-1 flex items-center gap-1 px-1.5 border-r border-slate-200">
                          <Users className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                          <span>People</span>
                        </div>
                        <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[8px] flex items-center gap-1 shrink-0">
                          <span>Search</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Travel Service Icons Bar */}
                  <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 grid grid-cols-4 gap-1 text-center text-[8px]">
                    <div className="flex flex-col items-center">
                      <Ticket className="w-3 h-3 text-blue-600" />
                      <span className="font-semibold text-slate-700 mt-0.5">Tour Packages</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Building2 className="w-3 h-3 text-blue-600" />
                      <span className="font-semibold text-slate-700 mt-0.5">Hotel Booking</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Car className="w-3 h-3 text-blue-600" />
                      <span className="font-semibold text-slate-700 mt-0.5">Car Rental</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Plane className="w-3 h-3 text-blue-600" />
                      <span className="font-semibold text-slate-700 mt-0.5">Customised Trips</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Laptop Metallic Base Chassis */}
              <div className="h-3 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 rounded-b-xl border-t border-slate-400 relative shadow-lg">
                <div className="w-16 h-1 bg-slate-400 rounded-b-sm mx-auto"></div>
              </div>

              {/* SMARTPHONE MOCKUP (Overlapping on bottom right) */}
              <div className="absolute -bottom-6 -right-3 w-36 sm:w-40 bg-slate-900 rounded-[28px] p-2 border-2 border-slate-700 shadow-2xl z-20 hidden sm:block">
                {/* Dynamic island / notch */}
                <div className="w-10 h-2 bg-black rounded-full mx-auto mb-1"></div>

                {/* Mobile screen */}
                <div className="bg-white rounded-[20px] overflow-hidden text-slate-900 text-[8px]">
                  {/* Mobile header */}
                  <div className="px-2 py-1 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-extrabold text-[8px]">Sunil Tours & Travels</span>
                    <span className="text-[10px]">☰</span>
                  </div>
                  {/* Mobile hero */}
                  <div className="relative h-16 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80"
                      alt="Travel"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 p-1.5 flex flex-col justify-end text-white">
                      <span className="font-bold text-[9px] leading-tight">Explore<br />The World</span>
                    </div>
                  </div>
                  {/* Mobile search fields */}
                  <div className="p-1.5 space-y-1 bg-slate-50">
                    <div className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[7px] text-slate-600 flex items-center gap-1">
                      <MapPin className="w-2 h-2 text-blue-600" />
                      <span>Destination</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[7px] text-slate-600 flex items-center gap-1">
                      <Calendar className="w-2 h-2 text-blue-600" />
                      <span>Travel Date</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[7px] text-slate-600 flex items-center gap-1">
                      <Users className="w-2 h-2 text-blue-600" />
                      <span>People</span>
                    </div>
                    <button className="w-full py-1 bg-blue-600 text-white font-bold rounded text-[7px]">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* ========================================================= */}
        {/* TEMPLATE GALLERY SECTION                                  */}
        {/* ========================================================= */}
        <div className="space-y-4">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Or Pick One of Our Pre-Designed Templates</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Start with a professionally designed template
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Choose from our industry-specific templates and customize them for your business.
              </p>
            </div>

            <button
              onClick={() => navigate('/templates')}
              className="self-start sm:self-center px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-indigo-700 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>View All Templates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5 Cards in a Single Desktop Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {WEBSITE_TEMPLATES.map((tmpl) => {
              const isSelected = config.id === tmpl.id;
              const details = templateCardDetails[tmpl.id] || {
                image: tmpl.heroImage,
                overlayTitle: tmpl.title,
                overlaySubtitle: tmpl.category,
                overlayTagline: tmpl.tagline,
                icon: Layers,
                iconColor: 'text-indigo-600',
                iconBg: 'bg-indigo-50 border border-indigo-100',
                title: tmpl.title,
                description: tmpl.description
              };

              const CardIcon = details.icon;

              return (
                <div
                  key={tmpl.id}
                  className={`bg-white rounded-2xl p-3.5 border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 border-indigo-600 shadow-lg ring-2 ring-indigo-500/15'
                      : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Thumbnail with overlay typography & micro CTA */}
                    <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-slate-900 group">
                      <img
                        src={details.image}
                        alt={details.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 p-2.5 flex flex-col justify-between text-white select-none">
                        <div>
                          <h5 className="font-extrabold text-[11px] leading-tight drop-shadow-xs">
                            {details.overlayTitle}
                          </h5>
                          <h6 className="font-bold text-[10px] text-slate-100 leading-tight">
                            {details.overlaySubtitle}
                          </h6>
                        </div>

                        <div>
                          <p className="text-[8px] text-slate-200 font-medium line-clamp-1 mb-1">
                            {details.overlayTagline}
                          </p>
                          {details.overlayBtn && (
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold ${details.overlayBtnColor}`}
                            >
                              {details.overlayBtn}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Category Icon & Titles */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${details.iconBg} ${details.iconColor}`}
                      >
                        <CardIcon className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {details.title}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
                      {details.description}
                    </p>
                  </div>

                  {/* Dual Action Buttons: Preview & Select */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setPreviewTemplate(tmpl)}
                      className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs flex items-center justify-center cursor-pointer"
                      title="Preview this template"
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                      title="Select and configure this template"
                    >
                      Select
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Template Preview Modal */}
      <TemplateQuickPreviewModal
        template={previewTemplate}
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        onSelect={(templateId) => {
          handleSelectTemplate(templateId);
          setPreviewTemplate(null);
        }}
      />
    </div>
  );
};
