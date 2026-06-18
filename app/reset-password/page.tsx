'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token.');
  }, [token]);

  const submit = async () => {
    setError('');
    if (!password || !confirm) { setError('Please fill in both fields.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
    setDone(true);
    setTimeout(() => router.push('/login'), 3000);
  };

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      {done ? (
        <div className="card text-center py-10">
          <h1 className="font-display text-3xl font-semibold mb-3">Password updated!</h1>
          <p className="text-muted">Redirecting you to sign in…</p>
        </div>
      ) : (
        <>
          <h1 className="font-display text-4xl font-semibold mb-2">Set new password</h1>
          <p className="text-muted mb-8">Choose a new password for your account.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm password</label>
              <input
                className="input"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={submit}
              disabled={loading || !token}
              className="btn-primary w-full disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>

            <p className="text-sm text-center text-muted pt-2">
              <Link href="/login" className="text-clay hover:underline font-medium">Back to sign in</Link>
            </p>
          </div>
        </>
      )}
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<div className="max-w-md mx-auto px-6 py-16 text-muted">Loading…</div>}>
        <ResetForm />
      </Suspense>
    </>
  );
}
