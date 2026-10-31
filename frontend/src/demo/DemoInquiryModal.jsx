import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, AlertCircle, Building2, User, Mail, Phone,
  FileText, ShieldCheck, ArrowRight, Sparkles, Send, Layers, HelpCircle
} from 'lucide-react';
import { submitInquiry } from '../api';

export default function DemoInquiryModal({
  isOpen,
  onClose,
  category = 'Website & Apps',
  productName = 'OXOO Website Builder & Digital Studio',
  defaultPlan = 'Growth Plan',
  availablePlans = ['Starter Plan', 'Growth Plan', 'Business Pro Plan', 'Enterprise Solution']
}) {
  const [contactPerson, setContactPerson] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!contactPerson.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg('Please enter your company or organization name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid business email address.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 8) {
      setErrorMsg('Please enter a valid phone number with country/area code.');
      return;
    }
    if (!consent) {
      setErrorMsg('Please accept the consent terms to submit your inquiry.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitInquiry({
        contact_person: contactPerson.trim(),
        company_name: companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        category,
        product_name: productName,
        selected_plan: selectedPlan,
        message: message.trim(),
        consent
      });

      setSuccessData(res);
    } catch (err) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="oxoo-plans-modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
        <motion.div
          className="oxoo-inquiry-modal-card"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '580px',
            width: '92%',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '22px 26px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
              color: '#ffffff',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.2)', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 600, color: '#bae6fd', marginBottom: '8px' }}>
              <Sparkles size={12} /> Inquiry-Based Purchase Journey
            </div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Inquire About {productName}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: 1.45 }}>
              Custom delivery, dedicated server hosting, custom integrations, and team onboarding. Fill out this brief form and our solution architect will contact you.
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 26px', maxHeight: '72vh', overflowY: 'auto' }}>
            {successData ? (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Inquiry Registered Successfully!
                </h3>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', maxWidth: '380px', margin: '14px auto', fontSize: '13.5px', color: '#334155' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Reference Number</div>
                  <strong style={{ fontSize: '17px', color: '#0284c7', fontFamily: 'monospace' }}>
                    {successData.inquiry_ref}
                  </strong>
                </div>
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, margin: '14px 0 24px' }}>
                  Thank you! We have sent a confirmation email to <strong>{email}</strong>. Our enterprise team will review your specifications and contact you with a customized solution and timeline.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Return to Demo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {errorMsg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Contact Name *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        required
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 34px', fontSize: '13.5px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Company Name *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Apex Retail Pvt Ltd"
                        required
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 34px', fontSize: '13.5px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Business Email *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        required
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 34px', fontSize: '13.5px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Phone / WhatsApp *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 34px', fontSize: '13.5px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Product Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      readOnly
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: '13.5px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', borderRadius: '8px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Interested Plan / Tier
                    </label>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: '13.5px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', outline: 'none' }}
                    >
                      {availablePlans.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Specific Requirements or Project Scope
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your team size, expected traffic, custom integrations, or launch timeline..."
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      style={{ marginTop: '2px' }}
                    />
                    <span>
                      I authorize OXOO to contact me regarding this inquiry and understand that this submission creates a sales consultation record, not an immediate recurring charge.
                    </span>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '9px 18px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '9px 22px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: '#ffffff',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)'
                    }}
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <Send size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
