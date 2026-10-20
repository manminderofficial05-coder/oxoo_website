import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Mail } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AuthField from '../components/AuthField';

export default function ForgotPassword() {
  const { user } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const value = identifier.trim();
    if (!value) {
      setError('Enter your email or employee ID');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // The server always answers the same way, so this page never reveals whether an account exists
      await api.post('/auth/forgot-password', { identifier: value });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const backToSignIn = (
    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
      <ArrowLeft size={16} /> Back to sign in
    </Link>
  );

  if (sent) {
    return (
      <AuthLayout>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <Check size={24} strokeWidth={3} />
        </span>
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">Check your email</h2>
        <p className="mt-2 text-sm leading-relaxed text-black/55">
          If an account matches, a reset link has been sent to its registered email address. The link works once and
          expires in 15 minutes.
        </p>
        <p className="mt-4 text-sm text-black/55">
          Nothing arrived? Check your spam folder, or{' '}
          <button type="button" onClick={() => setSent(false)} className="font-semibold text-brand hover:underline">
            try again
          </button>
          .
        </p>
        <div className="mt-8">{backToSignIn}</div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-3xl font-extrabold tracking-tight text-ink">Forgot your password?</h2>
      <p className="mt-2 text-sm text-black/55">
        Enter your work email or employee ID and we will send you a link to set a new password.
      </p>

      <form onSubmit={submit} noValidate className="light-fields mt-8 space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        <AuthField
          id="forgot-id"
          label="Email or Employee ID"
          icon={Mail}
          name="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          autoFocus
          placeholder="you@company.com or employee ID"
        />

        <button
          type="submit"
          disabled={submitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-orange-500 text-sm font-bold text-white shadow-lg shadow-accent/25 transition hover:shadow-xl hover:shadow-accent/30 disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Sending…
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <div className="mt-8">{backToSignIn}</div>
    </AuthLayout>
  );
}