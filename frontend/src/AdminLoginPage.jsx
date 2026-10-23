import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, ArrowRight, CheckCircle2, Lock, KeyRound, Cpu, AlertTriangle } from 'lucide-react';
import { Header, Footer, Logo } from './components';
import { loginAdminUser } from './api';

export default function AdminLoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('manminder.singh@primepro.ai');
  const [password, setPassword] = useState('oxoo123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleQuickFill = () => {
    setErrorMsg('');
    setEmail('manminder.singh@primepro.ai');
    setPassword('oxoo123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both admin email and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await loginAdminUser(email, password);
      if (res && res.token) {
        // Strictly save into isolated Admin storage keys
        localStorage.setItem('oxoo_admin_token', res.token);
        localStorage.setItem('oxoo_admin_user', JSON.stringify(res.user));
        window.dispatchEvent(new Event('oxoo_admin_auth_change'));
        setSuccessMsg(`Welcome, ${res.user?.name || 'Administrator'}! Authorizing console...`);
        setTimeout(() => {
          if (typeof onLoginSuccess === 'function') {
            onLoginSuccess(res.user);
          } else {
            navigate('/admin');
          }
        }, 500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="signin-page admin-login-page" style={{
        minHeight: '80vh',
        display: 'grid',
        placeItems: 'center',
        padding: '50px 20px',
        background: 'radial-gradient(ellipse at 50% 15%, #ede9fe, #f8fafc 65%)'
      }}>
        <div className="signin-card" style={{
          width: 'min(100%, 440px)',
          background: '#ffffff',
          border: '1.5px solid #ddd6fe',
          borderRadius: '22px',
          padding: '38px 34px',
          boxShadow: '0 18px 45px rgba(113, 75, 103, 0.1)'
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
              background: '#f5f3ff',
              border: '1px solid #c4b5fd',
              color: '#714b67',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '8px'
            }}>
              <ShieldCheck size={13} /> Admin Governance Console
            </div>
            <h1 style={{
              fontSize: '25px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '12px 0 6px',
              fontFamily: 'Manrope, sans-serif'
            }}>
              Administrator Sign In
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Privileged access for system administrators to oversee multi-tenant telemetry, user roles, and security audits.
            </p>
          </div>

          {/* 1-Click Demo Shortcut */}
          <div style={{
            background: '#faf5ff',
            border: '1px dashed #d8b4fe',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#714b67' }}>
                🛡️ Demo Admin Account
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Root Administrator (Oxoo Core)
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              style={{
                background: '#714b67',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 600,
                padding: '6px 11px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Auto-Fill
            </button>
          </div>

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
              Administrator Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@oxoo.ai"
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

            <label style={{ display: 'block', marginBottom: '18px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Master Security Key / Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                background: '#714b67',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(113, 75, 103, 0.28)',
                transition: 'all 0.15s ease'
              }}
            >
              {loading ? 'Authorizing...' : 'Sign In to Admin Console ➔'}
            </button>
          </form>

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
            <Lock size={12} color="#714b67" />
            <span>Encrypted Admin Console • ISO 27001 & SOC-2 Audited</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
