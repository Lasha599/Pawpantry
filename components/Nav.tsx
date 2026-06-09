'use client';
import Link from 'next/link';
import { useStore, resetState } from '@/lib/store';
import { PawPrint, LogOut } from 'lucide-react';

export default function Nav() {
  const { state, hydrated } = useStore();
  return (
    <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <PawPrint className="w-6 h-6 text-clay group-hover:rotate-12 transition" />
          <span className="font-display text-xl font-semibold tracking-tight">PawPantry</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/catalog" className="btn-ghost text-sm">Catalog</Link>
          {hydrated && state.user ? (
            <Link href="/dashboard" className="btn-primary text-sm">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
              <Link href="/register" className="btn-primary text-sm">Get started</Link>
            </>
          )}
          {hydrated && state.user && (
            <button
              onClick={() => {
                resetState();
                window.location.href = '/';
              }}
              className="btn-ghost text-sm flex items-center gap-1.5 text-muted hover:text-ink"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
