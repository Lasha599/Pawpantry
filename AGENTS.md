# PawPantry AI agent guidance

This file helps AI coding agents work with the PawPantry repo. It is intentionally short and points to the existing codebase guide in `claude.md`.

## Read first

- `claude.md` — the primary repo orientation document. Read it before making changes.

## What this project is

- Frontend-only Next.js 14 app using the App Router.
- No backend, no real auth, no payments, no shipping.
- All app state is stored in browser `localStorage` under `pawpantry:state:v1`.
- Mock product catalog is in `lib/products.ts`.
- Recommendation logic lives in `lib/recommend.ts`.
- Local state hook lives in `lib/store.ts`.

## Key files

- `app/layout.tsx` — root layout and fonts.
- `app/page.tsx` — landing page.
- `app/register/page.tsx` — signup flow.
- `app/onboarding/page.tsx` — 4-step wizard.
- `app/dashboard/page.tsx` — subscription management.
- `app/catalog/page.tsx` — product browsing.
- `components/Nav.tsx` — shared header.
- `lib/store.ts` — state hook, hydration, persistence.
- `lib/recommend.ts` — product scoring and frequency suggestion.
- `lib/products.ts` — hardcoded product catalog.
- `plan.md` — product vision and roadmap.

## Project conventions

- Use `'use client'` for interactive pages/components.
- Client components should import `useStore()` from `@/lib/store`.
- Check `hydrated` before rendering state-dependent UI to avoid SSR/CSR mismatch.
- `update()` in `useStore()` must be used immutably; do not mutate previous state.
- Tailwind CSS is the styling system; reusable CSS utilities exist in `app/globals.css`.
- Use the existing design tokens and classes (`.btn-primary`, `.card`, `.chip`, `bg-clay`, `text-muted`, etc.).
- Avoid adding form tags with default submit behavior unless a controlled submit handler is present.

## Build and run

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`

Requires Node.js 18.17+.

## When extending the app

- Adding a page: create `app/<name>/page.tsx`, use App Router routing, import `Nav` from `@/components/Nav` if needed.
- Adding product catalog data: edit `lib/products.ts`.
- Changing recommendation behavior: update `lib/recommend.ts` and ensure new criteria are reflected where needed.
- Changing state schema: update `lib/store.ts` and preserve the hook API.

## Search guidance

Prioritize references to:

- `useStore`
- `hydrated`
- `recommendProducts`
- `PRODUCTS`
- `localStorage`
- `next.config.js`

## Notes for Claude-style agents

- The repository already includes a dedicated AI orientation file: `claude.md`.
- Use `AGENTS.md` for quick guidance and `claude.md` for deeper context.
