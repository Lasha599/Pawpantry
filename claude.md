# CLAUDE.md — Codebase Guide for AI Assistants

This file orients Claude Code (or any AI assistant) to the PawPantry codebase. Read this before making changes.

## Project at a glance

**PawPantry** is a frontend-only Next.js 14 demo of a pet food auto-delivery subscription service. See `plan.md` for product vision and roadmap.

- **No backend**: all data persists to browser `localStorage` under key `pawpantry:state:v1`.
- **No real auth**: registration just stores a `{name, email}` object.
- **No real payments or shipping**: deliveries are simulated by advancing a date in localStorage.
- **Product catalog is mock data**: hardcoded array in `lib/products.ts`. UI is built to make swapping in real scraped data trivial later.

## How to run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (sanity check before deploy)
```

Requires Node.js 18.17+.

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | All pages under `app/`, file-based routing |
| Language | TypeScript (strict) | `tsconfig.json` has strict mode on |
| Styling | Tailwind CSS 3 | Custom colors in `tailwind.config.js` |
| Icons | lucide-react | Tree-shaken, only what's imported |
| State | Custom hook (`lib/store.ts`) | `useStore()` wraps localStorage |
| Fonts | Google Fonts via `<link>` | Fraunces (display) + Inter (body) |
| UI library | None | Components are handcrafted Tailwind |

Deliberate non-choices: no Zustand, no Redux, no shadcn/ui, no Prisma. Add them only when complexity demands it.

## File map

```
pawpantry/
├── app/
│   ├── layout.tsx           Root layout + Google Fonts
│   ├── globals.css          Tailwind directives + custom classes (.btn-primary, .card, etc.)
│   ├── page.tsx             Landing page
│   ├── register/page.tsx    Sign-up form
│   ├── onboarding/page.tsx  4-step wizard (the most complex page)
│   ├── dashboard/page.tsx   Subscription management
│   └── catalog/page.tsx     Browse products (read-only)
├── components/
│   └── Nav.tsx              Sticky top nav, used by all pages
├── lib/
│   ├── products.ts          Mock product catalog (12 products, exports PRODUCTS and BRANDS)
│   ├── recommend.ts         Recommendation algorithm, frequency suggestion, BREEDS, ALLERGY_OPTIONS
│   └── store.ts             localStorage hook (useStore), types (User, Dog, Subscription, OrderHistoryItem)
├── plan.md                  Product vision and roadmap
├── README.md                User-facing setup instructions
├── package.json
├── tailwind.config.js       Custom palette: cream, clay, forest, sand, ink, muted
├── tsconfig.json            Path alias: @/* → ./*
├── next.config.js           Image domains: placedog.net, images.unsplash.com
└── postcss.config.js
```

## Core data model

All defined in `lib/store.ts` and `lib/recommend.ts`:

```ts
type User = { name: string; email: string };

type Dog = {
  id: string;
  name: string;
  breed: string;
  ageYears: number;
  ageMonths: number;
  weightKg: number;
  activity: 'low' | 'medium' | 'high';
  allergies: string[];
};

type Subscription = {
  id: string;
  dogId: string;
  productId: string;
  frequencyWeeks: number;
  nextDeliveryISO: string;   // ISO date string
  status: 'active' | 'paused';
  createdAt: string;
};

type OrderHistoryItem = {
  id: string;
  dogId: string;
  productId: string;
  deliveredAt: string;
};

type State = {
  user: User | null;
  dogs: Dog[];
  subscriptions: Subscription[];
  history: OrderHistoryItem[];
};
```

The entire app state is one `State` object. Subscriptions link to dogs and products by id.

## State management pattern

Use the `useStore()` hook from `lib/store.ts`:

```tsx
'use client';
import { useStore } from '@/lib/store';

export default function MyPage() {
  const { state, update, hydrated } = useStore();

  if (!hydrated) return null;   // avoid SSR/CSR mismatch

  return (
    <button onClick={() => update(s => ({ ...s, dogs: [...s.dogs, newDog] }))}>
      Add dog
    </button>
  );
}
```

Key points:

- **Always check `hydrated`** before rendering data-dependent UI. The hook returns the initial empty state during SSR and the real state after mount.
- **`update()` takes a function** `(prev: State) => State`. It auto-persists to localStorage.
- **Never mutate state directly** — always return a new object.
- **Pages that require a logged-in user** redirect to `/register` in a `useEffect` once `hydrated` is true. See `dashboard/page.tsx` and `onboarding/page.tsx` for the pattern.

## Recommendation algorithm

In `lib/recommend.ts`:

- `getLifeStage(dog)` → `'puppy' | 'adult' | 'senior'`
- `getBreedSize(dog)` → `'small' | 'medium' | 'large'`
- `recommendProducts(dog)` → top 3 products, scored by criteria match. Allergens hard-exclude.
- `suggestFrequencyWeeks(dog, bagSize_g)` → nearest interval from `[2, 3, 4, 6, 8]` based on `weight_kg × 25 g/day` daily intake estimate.

When extending: add new scoring criteria inside `recommendProducts`. The function is pure and easy to test.

## Design system

Defined in `tailwind.config.js` and `app/globals.css`.

### Colors

| Token | Hex | Usage |
|---|---|---|
| `cream` | `#F5EFE4` | Page background |
| `clay` | `#C84B31` | Primary CTA, accents |
| `clayDark` | `#A23A24` | CTA hover |
| `forest` | `#2C3E2D` | Secondary accent (chips) |
| `sand` | `#E8DCC4` | Section backgrounds, neutral surfaces |
| `ink` | `#1A1A1A` | Text |
| `muted` | `#6B6157` | Secondary text |

Use these as Tailwind classes: `bg-clay`, `text-muted`, `border-ink/10`, etc.

### Typography

- **Display font** (`font-display`): Fraunces — used for headings, prices, brand
- **Body font**: Inter (default) — used everywhere else
- Heading sizes: prefer `text-4xl`/`text-5xl`/`text-6xl` with `font-display font-semibold`
- Pair with `tracking-tight` for large headlines

### Reusable component classes (in `globals.css`)

- `.btn-primary` — clay-filled rounded CTA
- `.btn-secondary` — outlined alternative
- `.btn-ghost` — transparent for tertiary actions
- `.input` — form field
- `.card` — white/70 + backdrop-blur + rounded-2xl panel
- `.chip` — small pill badge (sand background, forest text)
- `.grain` — adds subtle SVG noise overlay
- `.fade-up`, `.delay-1`, `.delay-2`, `.delay-3` — staggered entrance animation

**Important:** Tailwind opacity modifiers must use values from `[5, 10, 20, 25, 30, ...]`. Custom values like `border-ink/8` will fail to compile. Use `/10` instead.

## Common tasks — how to do them

### Add a new product to the catalog

Edit `lib/products.ts` — append to the `PRODUCTS` array. Required fields are typed in `Product`. Use Unsplash image URLs (already whitelisted in `next.config.js`).

### Add a new page

```bash
mkdir app/new-page
# create app/new-page/page.tsx
```

Use the App Router conventions. For pages with interactivity, add `'use client'` at the top. Import `Nav` from `@/components/Nav` to get the sticky header.

### Add a new field to the dog profile

1. Update the `Dog` type in `lib/recommend.ts`.
2. Add the input in `app/onboarding/page.tsx` step 1.
3. If it affects recommendations, update `recommendProducts` scoring.
4. If it should display, update `app/dashboard/page.tsx`.

### Wire up a real backend (Phase 2)

When migrating away from localStorage:

1. Replace `loadState()` / `saveState()` in `lib/store.ts` with `fetch('/api/state')` calls.
2. Add route handlers under `app/api/*/route.ts`.
3. Keep the `useStore()` hook interface stable — pages won't need to change.

## Patterns and conventions

- **Client components** (`'use client'`) for anything interactive. Server components for pure rendering.
- **No `<form>` tags with default submit** — use `onClick` handlers and call `update()` manually. (Form tags also conflict with some artifact environments, harmless here but kept as a habit.)
- **Image URLs**: use Unsplash for product photos, placedog.net for dog photos (both already in `next.config.js` allowlist).
- **Date math**: `addWeeks(iso, weeks)` and `daysUntil(iso)` helpers live in `lib/store.ts`.
- **Confirm destructive actions**: cancel/reset use `window.confirm()`.
- **No external state libraries** unless absolutely justified. The custom hook is enough.

## Known limitations / things to be aware of

- **No SSR for personalized data** — pages flash empty before hydration. The `hydrated` guard prevents flicker but content arrives client-side.
- **No optimistic UI** — `update()` is synchronous against localStorage, so it doesn't matter today. Will matter when a real backend is added.
- **No tests yet** — the recommendation logic in `lib/recommend.ts` is the highest-value target for the first test suite.
- **Hardcoded product images** point to Unsplash URLs; if any go 404 over time, swap them out in `lib/products.ts`.

## When in doubt

- Read `plan.md` for product intent.
- Look at `app/onboarding/page.tsx` for the most thorough example of forms + state updates + multi-step UX.
- Look at `app/dashboard/page.tsx` for the cleanest example of mutating state via `update()`.

## TODOs scattered in the code

Search for `TODO` in the codebase. Main hotspots:

- `lib/products.ts` — top of file, notes the backend migration path for the catalog.
