import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShieldCheck, ArrowRight, CheckCircle2, Lock, Sparkles, Building2 } from 'lucide-react';
import { Header, Footer, Logo } from './components';
import { loginUser } from './api';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('priya@retailmart.in');
  const [password, setPassword] = useState('oxoo123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleQuickFill = () => {
    setErrorMsg('');
    setEmail('priya@retailmart.in');
    setPassword('oxoo123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res && res.token) {
        localStorage.setItem('oxoo_token', res.token);
        localStorage.setItem('oxoo_user', JSON.stringify(res.user));
        window.dispatchEvent(new Event('oxoo_auth_change'));
        setSuccessMsg(`Welcome, ${res.user?.name || 'Customer'}! Redirecting to your dashboard...`);
        setTimeout(() => {
          navigate('/dashboard');
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

          {/* 1-Click Demo Shortcut */}
          <div style={{
            background: '#f8fafc',
            border: '1px dashed #93c5fd',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
                ⚡ Demo Customer Account
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Priya Sharma (RetailMart Solutions)
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              style={{
                background: '#0284c7',
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
              Customer Email Address
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@company.com"
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
              Password
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

          {/* Quick Direct Bypass */}
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <Link
              to="/dashboard"
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#0284c7',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Enter Customer Portal directly without login <ArrowRight size={13} />
            </Link>
          </div>

          {/* Switch to Admin Login */}
          <div style={{
            marginTop: '12px',
            padding: '10px',
            borderRadius: '8px',
            background: '#f8fafc',
            textAlign: 'center',
            fontSize: '12px',
            color: '#64748b'
          }}>
            Need administrator controls?{' '}
            <Link to="/admin/login" style={{ color: '#714b67', fontWeight: 700, textDecoration: 'none' }}>
              Go to Admin Login ➔
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
