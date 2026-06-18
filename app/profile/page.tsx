'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { useStore } from '@/lib/store';
import type { Address } from '@/lib/store';
import { PRODUCTS } from '@/lib/products';
import { User, MapPin, Dog, ShoppingBag, CheckCircle2, Package, Pencil } from 'lucide-react';

const EMPTY_ADDRESS: Address = { street: '', city: '', zip: '', country: '' };

export default function ProfilePage() {
  const router = useRouter();
  const { state, update, hydrated } = useStore();

  const [addrForm, setAddrForm] = useState<Address>(EMPTY_ADDRESS);
  const [addrSaved, setAddrSaved] = useState(false);
  const [addrEditing, setAddrEditing] = useState(false);

  useEffect(() => {
    if (hydrated && !state.user) router.push('/login');
  }, [hydrated, state.user, router]);

  useEffect(() => {
    if (hydrated && state.address) {
      setAddrForm(state.address);
    }
  }, [hydrated, state.address]);

  if (!hydrated || !state.user) return null;

  const saveAddress = () => {
    if (!addrForm.street || !addrForm.city || !addrForm.country) return;
    update(s => ({ ...s, address: addrForm }));
    setAddrSaved(true);
    setAddrEditing(false);
    setTimeout(() => setAddrSaved(false), 3000);
  };

  const hasAddress = state.address && state.address.street;
  const showForm = addrEditing || !hasAddress;

  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="font-display text-4xl font-semibold">My Profile</h1>
          <p className="text-muted mt-1">Manage your account, address and orders.</p>
        </div>

        {/* Account info */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center">
              <User className="w-5 h-5 text-muted" />
            </div>
            <h2 className="font-semibold text-lg">Account</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted mb-1">Name</p>
              <p className="font-medium">{state.user.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Email</p>
              <p className="font-medium">{state.user.email}</p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-ink/10">
            <Link href="/forgot-password" className="text-sm text-clay hover:underline font-medium">
              Change password
            </Link>
          </div>
        </section>

        {/* Delivery address */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center">
                <MapPin className="w-5 h-5 text-muted" />
              </div>
              <h2 className="font-semibold text-lg">Delivery Address</h2>
            </div>
            {hasAddress && !showForm && (
              <button
                onClick={() => setAddrEditing(true)}
                className="btn-ghost text-sm flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          {hasAddress && !showForm ? (
            <div className="bg-sand/40 rounded-xl p-4 text-sm space-y-0.5">
              <p className="font-medium">{state.address!.street}</p>
              <p className="text-muted">{state.address!.city}{state.address!.zip ? `, ${state.address!.zip}` : ''}</p>
              <p className="text-muted">{state.address!.country}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Street address</label>
                <input
                  className="input"
                  placeholder="123 Main Street, Apt 4B"
                  value={addrForm.street}
                  onChange={e => setAddrForm(f => ({ ...f, street: e.target.value }))}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    className="input"
                    placeholder="Tbilisi"
                    value={addrForm.city}
                    onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal code</label>
                  <input
                    className="input"
                    placeholder="0100"
                    value={addrForm.zip}
                    onChange={e => setAddrForm(f => ({ ...f, zip: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  className="input"
                  placeholder="Georgia"
                  value={addrForm.country}
                  onChange={e => setAddrForm(f => ({ ...f, country: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={saveAddress}
                  disabled={!addrForm.street || !addrForm.city || !addrForm.country}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  Save address
                </button>
                {addrEditing && (
                  <button onClick={() => setAddrEditing(false)} className="btn-ghost text-sm">
                    Cancel
                  </button>
                )}
              </div>
              {addrSaved && (
                <p className="text-sm text-green-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Address saved!
                </p>
              )}
            </div>
          )}
        </section>

        {/* My dogs */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center">
                <Dog className="w-5 h-5 text-muted" />
              </div>
              <h2 className="font-semibold text-lg">My Dogs</h2>
            </div>
            <Link href="/onboarding" className="btn-ghost text-sm flex items-center gap-1.5">
              + Add dog
            </Link>
          </div>

          {state.dogs.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <p className="mb-3">No dogs added yet.</p>
              <Link href="/onboarding" className="btn-primary text-sm inline-block">Add your first dog</Link>
            </div>
          ) : (
            <div className="divide-y divide-ink/10">
              {state.dogs.map(dog => {
                const sub = state.subscriptions.find(s => s.dogId === dog.id);
                const product = sub ? PRODUCTS.find(p => p.id === sub.productId) : null;
                return (
                  <div key={dog.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dog.name}</p>
                      <p className="text-sm text-muted">
                        {dog.breed} · {dog.ageYears > 0 ? `${dog.ageYears}y ` : ''}{dog.ageMonths > 0 ? `${dog.ageMonths}mo` : ''} · {dog.weightKg} kg
                      </p>
                    </div>
                    <div className="text-right">
                      {product ? (
                        <>
                          <p className="text-sm font-medium">{product.name}</p>
                          <span className={`chip text-xs ${sub?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-sand text-muted'}`}>
                            {sub?.status === 'active' ? 'Active' : 'Paused'}
                          </span>
                        </>
                      ) : (
                        <Link href="/catalog" className="text-sm text-clay hover:underline">Choose plan</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Order history */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-muted" />
            </div>
            <h2 className="font-semibold text-lg">Order History</h2>
          </div>

          {state.history.length === 0 ? (
            <div className="text-center py-10 text-muted">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No orders yet. Your deliveries will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-muted text-left">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">Dog</th>
                    <th className="pb-2 font-medium">Delivered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {state.history.slice().reverse().map(item => {
                    const product = PRODUCTS.find(p => p.id === item.productId);
                    const dog = state.dogs.find(d => d.id === item.dogId);
                    return (
                      <tr key={item.id}>
                        <td className="py-3 pr-4">
                          <p className="font-medium">{product?.name ?? 'Unknown product'}</p>
                          <p className="text-muted text-xs">{product?.brand}</p>
                        </td>
                        <td className="py-3 pr-4 text-muted">{dog?.name ?? '—'}</td>
                        <td className="py-3 text-muted">
                          {new Date(item.deliveredAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
