'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { useStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const { update } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = () => {
    if (!name || !email || !password) {
      alert('Please fill in all fields.');
      return;
    }
    update(s => ({ ...s, user: { name, email } }));
    router.push('/onboarding');
  };

  return (
    <>
      <Nav />
      <main className="max-w-md mx-auto px-6 py-16">
        <h1 className="font-display text-4xl font-semibold mb-2">Create your account</h1>
        <p className="text-muted mb-8">No credit card required for this demo.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Anna Petrova" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="anna@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            <p className="text-xs text-muted mt-1">Demo only — stored locally in your browser.</p>
          </div>
          <button onClick={submit} className="btn-primary w-full mt-4">Continue</button>
        </div>
      </main>
    </>
  );
}
