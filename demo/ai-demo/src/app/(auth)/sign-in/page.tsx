'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../../demo/session';

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid email or password');
        return;
      }

      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect && redirect.startsWith('/dashboard') ? redirect : '/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.13), transparent 35%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.10), transparent 35%), #0a0a0f',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.08)',
          filter: 'blur(100px)',
          top: '-180px',
          left: '-120px',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={160}
              height={38}
              style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
              priority
            />
          </Link>

          <p
            style={{
              marginTop: '12px',
              color: 'rgba(255,255,255,0.45)',
              fontSize: '13px',
            }}
          >
            AI-powered business automation
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(18,18,25,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '36px',
            boxShadow:
              '0 25px 80px rgba(0,0,0,0.45), 0 0 40px rgba(99,102,241,0.06)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ marginBottom: '28px' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: 650,
                letterSpacing: '-0.5px',
              }}
            >
              Welcome back
            </h1>

            <p
              style={{
                margin: '8px 0 0',
                color: 'rgba(255,255,255,0.45)',
                fontSize: '14px',
              }}
            >
              Sign in to your hospital account (demo credentials are pre-filled)
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#fca5a5',
                borderRadius: '10px',
                padding: '11px 13px',
                marginBottom: '18px',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                border: 'none',
                borderRadius: '10px',
                padding: '13px 16px',
                background: loading
                  ? 'rgba(99,102,241,0.5)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 25px rgba(99,102,241,0.25)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div
            style={{
              height: '1px',
              background: 'rgba(255,255,255,0.07)',
              margin: '28px 0',
            }}
          />

          <p
            style={{
              margin: 0,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.45)',
              fontSize: '13px',
            }}
          >
            Demo environment — fictional data only. Email <b>demo@hospitalcart.demo</b> · Password <b>demo1234</b>
          </p>
        </div>

        <p
          style={{
            textAlign: 'center',
            marginTop: '22px',
            color: 'rgba(255,255,255,0.2)',
            fontSize: '11px',
          }}
        >
          © {new Date().getFullYear()} OXOO.ai
        </p>
      </div>
    </main>
  );
}