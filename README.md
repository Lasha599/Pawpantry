# PawPantry — auto-delivery pet food (frontend MVP)

A Next.js demo of a pet-food subscription site. Frontend only — all data lives in your browser's `localStorage`. No backend, no payments, no real shipping.

## Run locally

You need **Node.js 18.17+** (check with `node -v`).

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## What's included

- Landing page with hero
- Registration (mock, stored locally)
- 4-step onboarding wizard: dog profile → choose path → pick food → set frequency
- Smart food recommender based on age, size, activity, allergies
- Auto-suggested delivery frequency based on dog weight and bag size
- Dashboard with countdown, skip/sooner/pause/cancel actions, order history
- Catalog browse with brand and life-stage filters
- "Reset demo" button in the nav (top-right) to wipe `localStorage`

## Project structure

```
app/
  page.tsx            Landing
  register/           Sign-up
  onboarding/         4-step wizard
  dashboard/          Subscription management
  catalog/            Browse products
components/
  Nav.tsx
lib/
  products.ts         Mock catalog (replace later with real data)
  recommend.ts        Recommendation + frequency logic
  store.ts            localStorage state hook
```

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Go to vercel.com → New Project → import the repo.
3. Click Deploy. No env vars needed.

## Backend phase (when you're ready)

Search for `TODO` in the codebase. The main hooks:

- `lib/products.ts` — swap hardcoded array for `fetch('/api/products')` against a scraping cron job
- `lib/store.ts` — move from `localStorage` to a real DB (Vercel Postgres, Supabase)
- Add Stripe for subscriptions, Vercel Cron for the delivery scheduler

## License

MIT. Use freely.
