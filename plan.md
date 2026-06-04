# PawPantry — Project Plan

## Vision

Dog owners frequently run out of pet food because they forget to reorder. PawPantry solves this with **automatic, recurring pet food delivery**: the owner registers, selects a brand/formula and a delivery frequency, and the food arrives on schedule without further action.

For owners who don't know what to buy, the app **recommends food** based on the dog's breed, age, weight, activity level, and allergies. Product data is (eventually) **scraped from partner pet food stores** so prices and availability stay current.

## Problem

- Owners forget to reorder food, leading to last-minute store runs or hungry dogs.
- Choosing the right food is overwhelming — too many brands, life stages, and ingredient profiles.
- Prices vary across stores; manually comparing is tedious.

## Target user

Dog owners (especially multi-dog households) who want a low-effort, set-and-forget feeding routine.

## Current state — Frontend MVP (this build)

A working Next.js 14 application, deployable to Vercel, with **no backend**. All user data persists to the browser's `localStorage`. The product catalog is hardcoded mock data styled to look like it was scraped from real stores.

### What works today

- **Landing page** — hero, three-step explainer, CTAs.
- **Registration** — name, email, password stored locally (no real auth).
- **4-step onboarding wizard**:
  1. Dog profile: name, breed (30+ options), age, weight, activity level, allergies.
  2. Path choice: browse catalog yourself, or get a recommendation.
  3. Product selection: filterable catalog, or top-3 algorithmic recommendations.
  4. Frequency selection (2/3/4/6/8 weeks), auto-suggested based on weight × bag size.
- **Dashboard** — per-dog cards showing next delivery countdown, "running low" indicator, order history, and actions (skip, deliver sooner, pause/resume, cancel).
- **Catalog browse** — filter by brand, life stage, grain-free.
- **Multi-dog support** — add as many dogs as you want.
- **Reset demo data** — button in nav wipes `localStorage`.

### Recommendation logic (client-side, deterministic)

- **Life stage**: age < 12 months → puppy; age ≥ 7 years → senior; else adult.
- **Breed size**: weight < 10 kg → small; 10–25 kg → medium; > 25 kg → large.
- **Allergy filtering**: products containing flagged proteins or ingredients are excluded.
- **Activity bonus**: high → favor high-protein formulas; low → favor weight-control formulas.
- Returns the top 3 matches, scored by criteria overlap.

### Frequency suggestion

- Daily intake estimate: `weight_kg × 25 g/day` (rough rule of thumb, **not** veterinary advice).
- `daysPerBag = bagSize_g / dailyGrams`, rounded down to nearest interval in [2, 3, 4, 6, 8] weeks.

### Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (no UI library — handcrafted components)
- lucide-react for icons
- Custom localStorage-backed state hook (no Zustand/Redux)
- Deploys to Vercel with zero config

## Out of scope for the MVP

The following are deliberately **not** built yet, but the UI has hooks ready for each:

- Real authentication (no password hashing, no sessions)
- Real payments (no Stripe, no card validation)
- Real shipping (no address validation, no carrier integration)
- Real product data (the catalog is mock; the "Price from PetMart · updated 2h ago" labels are placeholders)
- Email or SMS notifications
- A real delivery scheduler

## Roadmap — Backend Phase

When the frontend has been validated with real users, the next phase adds:

### Phase 2: Real data layer

- **Database**: Vercel Postgres or Supabase. Tables for users, dogs, products, subscriptions, orders.
- **Auth**: NextAuth.js or Clerk for real sign-up/login.
- **Migration**: replace `localStorage` reads with API calls.

### Phase 3: Real product catalog (scraping)

- **Approach**: a Vercel Cron job runs daily, hitting partner sources:
  - Chewy / Amazon affiliate APIs (preferred — legal and structured)
  - Direct scraping with Playwright as a fallback for stores without APIs
- Scraper writes to the `products` table with price, stock, and `scrapedAt` timestamp.
- Frontend reads from `/api/products` instead of the hardcoded array.

### Phase 4: Payments and real subscriptions

- **Stripe Subscriptions** — recurring billing on the same cadence as deliveries.
- Webhook handlers for `invoice.paid` (trigger delivery), `subscription.canceled`, etc.

### Phase 5: Delivery scheduler

- **Vercel Cron** runs hourly, checks subscriptions where `nextDeliveryISO <= now`.
- Generates an order, charges Stripe, sends confirmation email (Resend or Postmark), advances `nextDeliveryISO` by `frequencyWeeks`.

### Phase 6: Notifications and polish

- Email reminders 2 days before each delivery
- "Running low?" SMS via Twilio if the user logged early consumption
- Native mobile app (React Native / Expo) reusing the same API

## Open questions

- **Geography**: which countries to launch in? Affects partner stores and shipping carriers.
- **Pricing model**: markup on retail price, flat subscription fee, or both?
- **Vet partnerships**: should recommendations be reviewed by a licensed vet to add credibility?
- **Inventory**: do we hold stock, or fulfill via drop-shipping from partners?

## Success metrics (for the MVP demo)

- A friend / colleague / potential investor can complete the full flow (register → onboard → dashboard) in under 3 minutes without help.
- The "Recommend for me" path produces a sensible match for at least 5 distinct dog profiles tested.
- The frontend deploys to Vercel from a fresh GitHub repo with zero configuration.
