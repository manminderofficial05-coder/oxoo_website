import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShieldCheck, ArrowRight, CheckCircle2, Lock, Sparkles, Building2, KeyRound, Mail, X, Globe2, Eye, EyeOff } from 'lucide-react';
import { Header, Footer, Logo } from './components';
import { loginUser, forgotPassword } from './api';
import { authStorage } from './authStorage';
import { useRegionPricing } from './RegionPricingContext';

export default function CustomerLoginPage() {
  const { currentRegion, isOutsideIndia } = useRegionPricing();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Sync region restriction state when client location changes
  useEffect(() => {
    try {
      const regionErr = sessionStorage.getItem('oxoo_region_auth_error');
      if (regionErr) {
        setErrorMsg(regionErr);
        sessionStorage.removeItem('oxoo_region_auth_error');
      }
    } catch {}
    if (isOutsideIndia && email.trim().toLowerCase() === 'priya@retailmart.in') {
      setEmail('');
      setPassword('');
    }
  }, [isOutsideIndia]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotInput) {
      setForgotError('Please enter your account email or Storage ID.');
      return;
    }
    setForgotError('');
    setForgotMsg('');
    setForgotLoading(true);
    try {
      const res = await forgotPassword(forgotInput.trim());
      setForgotMsg(res.message || 'Password reset link sent to your registered email!');
    } catch (err) {
      setForgotError(err.message || 'Could not send reset link. Please check your input.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    // Block Indian accounts when client is outside India
    if (isOutsideIndia && authStorage.isIndianAccount(cleanEmail)) {
      setErrorMsg(
        `Access Restricted: Indian accounts (INR ₹) cannot be used outside India (${currentRegion.countryName} — USD $). Please sign in or create an International (USD) account.`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(cleanEmail, password, currentRegion.regionCode);
      if (res && res.token) {
        if (isOutsideIndia && authStorage.isIndianAccount(res.user)) {
          setErrorMsg(
            `Access Restricted: Indian accounts (INR ₹) cannot be used outside India (${currentRegion.countryName} — USD $). Please sign in or create an International (USD) account.`
          );
          return;
        }
        authStorage.setCustomerSession(res.token, res.user);
        window.dispatchEvent(new Event('oxoo_auth_change'));
        setSuccessMsg(`Welcome, ${res.user?.name || 'Customer'}! Redirecting to your dashboard...`);
        setTimeout(() => {
          navigate('/customer');
        }, 600);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify customer credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="signin-page customer-login-page" style={{
        minHeight: '80vh',
        display: 'grid',
        placeItems: 'center',
        padding: '50px 20px',
        background: 'radial-gradient(ellipse at 50% 15%, #e0f2fe, #f8fafc 65%)'
      }}>
        <div className="signin-card" style={{
          width: 'min(100%, 440px)',
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '22px',
          padding: '38px 34px',
          boxShadow: '0 18px 45px rgba(2, 132, 199, 0.08)'
        }}>
          {/* Header & Logo */}
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <Logo stacked={true} />
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: '#f0f9ff',
              border: '1px solid #7dd3fc',
              color: '#0284c7',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '8px'
            }}>
              <User size={13} /> Customer Portal Access
            </div>
            <h1 style={{
              fontSize: '25px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '12px 0 6px',
              fontFamily: 'Manrope, sans-serif'
            }}>
              Customer Sign In
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Access your active multi-app subscriptions, billing history, invoices, and support tickets.
            </p>
          </div>

                    {/* 1-Click Demo Shortcut (Only shown in India Sign In mode) or International Access Notice */}
          

          {isOutsideIndia && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '11.5px',
              color: '#1e40af',
              lineHeight: 1.45
            }}>
              <strong style={{ display: 'block', marginBottom: '2px', color: '#1d4ed8' }}>
                🌐 International Region ({currentRegion?.countryName || currentRegion?.regionCode} • USD $)
              </strong>
              Indian customer accounts (INR ₹) cannot be used outside India. Please sign in or register with an International (USD $) account.
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              fontSize: '12.5px',
              marginBottom: '16px',
              borderRadius: '8px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c'
            }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '10px 14px',
              fontSize: '12.5px',
              marginBottom: '16px',
              borderRadius: '8px',
              background: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: '14px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Customer Email Address or Storage ID
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@company.com"
                style={{
                  width: '100%',
                  marginTop: '5px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  boxSizing: 'border-box'
                }}
              />
            </label>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Password</span>
                
                  <button
                    type="button"
                    onClick={() => {
                      setForgotInput(email.includes('@') || email.startsWith('STG-') ? email : '');
                      setForgotError('');
                      setForgotMsg('');
                      setShowForgotModal(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '12px',
                      color: '#0284c7',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Forgot password?
                  </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 42px 10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In to Customer Portal ➔'}
            </button>
          </form>

          {/* Bottom link: info that accounts are created after purchase */}
          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#64748b' }}>
            <span>
              Don't have an account?{' '}
              <Link
                to="/pricing"
                style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}
              >
                Choose a plan to get started ➔
              </Link>
            </span>
          </div>

          {/* FORGOT PASSWORD MODAL */}
          {showForgotModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'grid',
              placeItems: 'center',
              padding: '20px'
            }}>
              <div style={{
                width: 'min(100%, 420px)',
                background: '#ffffff',
                borderRadius: '18px',
                padding: '28px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                border: '1.5px solid #bae6fd'
              }}>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  <X size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'grid',
                    placeItems: 'center'
                  }}>
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Reset Password
                    </h2>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Account Recovery Service</span>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  Enter your registered <strong>Customer Email</strong> or <strong>Storage ID</strong>. We will email you a secure link to reset your password.
                </p>

                {forgotError && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: '12.5px',
                    marginBottom: '14px'
                  }}>
                    {forgotError}
                  </div>
                )}

                {forgotMsg && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    fontSize: '12.5px',
                    marginBottom: '14px',
                    lineHeight: 1.4
                  }}>
                    <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px' }} />
                    {forgotMsg}
                  </div>
                )}

                {!forgotMsg ? (
                  <form onSubmit={handleForgotPassword}>
                    <label style={{ display: 'block', marginBottom: '16px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Email Address or Storage ID
                      <input
                        type="text"
                        required
                        value={forgotInput}
                        onChange={(e) => setForgotInput(e.target.value)}
                        placeholder="e.g. name@company.com or STG-08643413"
                        style={{
                          width: '100%',
                          marginTop: '6px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </label>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(false)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                          border: 'none',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        style={{
                          flex: 2,
                          padding: '10px',
                          borderRadius: '8px',
                          background: '#0284c7',
                          border: 'none',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: forgotLoading ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                        }}
                      >
                        {forgotLoading ? 'Sending link...' : 'Send Reset Link →'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Security Assurance Footer */}
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
            fontSize: '11.5px',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <Lock size={12} color="#0284c7" />
            <span>Secure 256-Bit SSL Customer Portal • Protected by OXOO Shield</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
