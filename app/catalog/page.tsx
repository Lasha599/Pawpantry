'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { PRODUCTS, BRANDS } from '@/lib/products';

export default function CatalogPage() {
  const [brandFilter, setBrandFilter] = useState('All');
  const [stage, setStage] = useState('All');
  const [grainFreeOnly, setGrainFreeOnly] = useState(false);

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p =>
      (brandFilter === 'All' || p.brand === brandFilter) &&
      (stage === 'All' || p.lifeStage === stage) &&
      (!grainFreeOnly || p.grainFree)
    );
  }, [brandFilter, stage, grainFreeOnly]);

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-display text-5xl font-semibold mb-2">Catalog</h1>
        <p className="text-muted mb-8">Prices pulled from partner stores. Updated continuously.</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <select className="input max-w-xs" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
            <option>All</option>
            {BRANDS.map(b => <option key={b}>{b}</option>)}
          </select>
          <select className="input max-w-xs" value={stage} onChange={e => setStage(e.target.value)}>
            <option value="All">All life stages</option>
            <option value="puppy">Puppy</option>
            <option value="adult">Adult</option>
            <option value="senior">Senior</option>
          </select>
          <label className="inline-flex items-center gap-2 px-4 py-3 border border-ink/15 rounded-lg cursor-pointer bg-white/50">
            <input type="checkbox" checked={grainFreeOnly} onChange={e => setGrainFreeOnly(e.target.checked)} />
            Grain-free only
          </label>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => (
            <div key={p.id} className="card">
              <img src={p.image} alt="" className="w-full h-40 object-cover rounded-lg mb-3" />
              <div className="text-xs text-muted">{p.brand}</div>
              <div className="font-display text-lg font-semibold leading-tight">{p.name}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="chip">{p.lifeStage}</span>
                <span className="chip">{p.breedSize}</span>
                {p.grainFree && <span className="chip">grain-free</span>}
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="font-display text-xl font-semibold">${p.price.toFixed(2)}</div>
                <div className="text-xs text-muted">{(p.bagSize_g / 1000).toFixed(0)}kg</div>
              </div>
              <div className="text-xs text-muted mt-2 mb-3">
                Price from {p.store} · updated {p.scrapedAt}
              </div>
              <Link href="/register" className="btn-primary w-full block text-center text-sm">
                Subscribe
              </Link>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card text-center text-muted">No products match these filters.</div>
        )}
      </main>
    </>
  );
}
