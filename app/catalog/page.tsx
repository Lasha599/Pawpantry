'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { PRODUCTS, BRANDS } from '@/lib/products';
import { ExternalLink, RefreshCw } from 'lucide-react';

type RealProduct = {
  _id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  url: string;
  store: string;
  weight: string;
  brand: string;
  scrapedAt: string;
};

export default function CatalogPage() {
  const [brandFilter, setBrandFilter] = useState('All');
  const [stage, setStage] = useState('All');
  const [grainFreeOnly, setGrainFreeOnly] = useState(false);
  const [realProducts, setRealProducts] = useState<RealProduct[]>([]);
  const [loadingReal, setLoadingReal] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setRealProducts(d.products ?? []))
      .catch(() => {})
      .finally(() => setLoadingReal(false));
  }, []);

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

        {/* ── Real Georgian Products ── */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-3xl font-semibold">Available in Georgia</h2>
            {loadingReal && <RefreshCw className="w-4 h-4 animate-spin text-muted" />}
          </div>
          <p className="text-muted mb-6">
            Live prices from Georgian pet stores — ZooMart &amp; PetFood.
          </p>

          {!loadingReal && realProducts.length === 0 && (
            <div className="card text-center text-muted py-8">
              No products scraped yet. The first scrape runs tonight at 2 AM.
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {realProducts.map(p => (
              <div key={p._id} className="card flex flex-col">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-40 object-contain rounded-lg mb-3 bg-sand"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-40 rounded-lg mb-3 bg-sand flex items-center justify-center text-muted text-xs">
                    No image
                  </div>
                )}
                {p.brand && <div className="text-xs text-muted">{p.brand}</div>}
                <div className="font-display text-base font-semibold leading-tight flex-1">{p.name}</div>
                {p.weight && <span className="chip mt-2 self-start">{p.weight}</span>}
                <div className="flex items-center justify-between mt-3">
                  <div className="font-display text-xl font-semibold">
                    {p.price > 0 ? `${p.price.toFixed(2)} ₾` : 'See store'}
                  </div>
                  <span className="text-xs text-muted">{p.store}</span>
                </div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full text-center text-sm mt-3 flex items-center justify-center gap-1.5"
                >
                  Buy on {p.store}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ── PawPantry Subscription Catalog ── */}
        <h2 className="font-display text-3xl font-semibold mb-2">Subscribe &amp; Save</h2>
        <p className="text-muted mb-6">Auto-delivered on your schedule. Never run out.</p>

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
