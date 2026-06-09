'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { useStore, setToken } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { update } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }

    setToken(data.token);
    update(s => ({ ...s, user: { id: data.user.id, name: data.user.name, email: data.user.email } }));
    router.push('/dashboard');
  };

  return (
    <>
      <Nav />
      <main className="max-w-md mx-auto px-6 py-16">
        <h1 className="font-display text-4xl font-semibold mb-2">Welcome back</h1>
        <p className="text-muted mb-8">Sign in to manage your deliveries.</p>

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
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button onClick={submit} disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-sm text-center text-muted pt-2">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-clay hover:underline font-medium">Create one</Link>
          </p>
        </div>
      </main>
    </>
  );
}
