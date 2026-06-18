'use client';
import { useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { PawPrint } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true);

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
    setSent(true);
  };

  return (
    <>
      <Nav />
      <main className="max-w-md mx-auto px-6 py-16">
        {sent ? (
          <div className="card text-center py-10">
            <PawPrint className="w-12 h-12 text-clay mx-auto mb-4" />
            <h1 className="font-display text-3xl font-semibold mb-3">Check your inbox</h1>
            <p className="text-muted mb-6">
              If an account exists for <strong>{email}</strong>, we sent a password reset link.
              It expires in 1 hour.
            </p>
            <Link href="/login" className="btn-primary inline-block">Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-4xl font-semibold mb-2">Forgot password?</h1>
            <p className="text-muted mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="anna@example.com"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                onClick={submit}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>

              <p className="text-sm text-center text-muted pt-2">
                Remembered it?{' '}
                <Link href="/login" className="text-clay hover:underline font-medium">Sign in</Link>
              </p>
            </div>
          </>
        )}
      </main>
    </>
  );
}
