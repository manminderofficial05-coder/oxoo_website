import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getPaletteById } from '../../data/palettes';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContactSection = () => {
  const { config, submitEnquiry, showToast } = useBuilder();
  const palette = getPaletteById(config.paletteId);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitEnquiry(form);
    setSubmitted(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 }
    });
    setTimeout(() => {
      setSubmitted(false);
      setForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: 'General Inquiry',
        message: ''
      });
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: palette.primaryLight, color: palette.primaryDark }}
            >
              Get In Touch
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Start The Conversation
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Have questions or ready to launch your next endeavor? Our team is available to discuss custom engagements, bookings, or inquiries.
            </p>

            <div className="space-y-4 pt-4">
              {config.contactInfo?.phone && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: palette.primaryLight }}
                  >
                    <Phone className="w-5 h-5" style={{ color: palette.primary }} />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Call Us
                    </span>
                    <a
                      href={`tel:${config.contactInfo.phone}`}
                      className="text-sm font-bold text-slate-900 hover:underline"
                    >
                      {config.contactInfo.phone}
                    </a>
                  </div>
                </div>
              )}

              {config.contactInfo?.email && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: palette.primaryLight }}
                  >
                    <Mail className="w-5 h-5" style={{ color: palette.primary }} />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${config.contactInfo.email}`}
                      className="text-sm font-bold text-slate-900 hover:underline"
                    >
                      {config.contactInfo.email}
                    </a>
                  </div>
                </div>
              )}

              {config.contactInfo?.address && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: palette.primaryLight }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: palette.primary }} />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Headquarters
                    </span>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {config.contactInfo.address}
                    </span>
                  </div>
                </div>
              )}

              {config.contactInfo?.hours && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: palette.primaryLight }}
                  >
                    <Clock className="w-5 h-5" style={{ color: palette.primary }} />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Operating Hours
                    </span>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {config.contactInfo.hours}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: palette.primary }}
              ></div>

              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Thank You!</h3>
                  <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                    Your inquiry has been submitted and recorded in your local Lead Inbox. Our team will review and reply promptly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    Send Direct Inquiry
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Fill out the form below. Inquiries are automatically saved in your demo lead library.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Michael Vance"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="michael@company.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 234-5678"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Organization / Topic
                      </label>
                      <input
                        type="text"
                        placeholder="Vance Enterprises"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Message / Project Details *
                    </label>
                    <textarea
                      rows="4"
                      required
                      placeholder="Tell us what you are looking to achieve..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 hover:opacity-95"
                    style={{ backgroundColor: palette.primary }}
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Client Enquiry</span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Strict confidentiality assured • Responses within 24 hours</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
