# Whiskers & Co. – Maine Coon Marketplace

Simple, light-themed adoption site inspired by classic social feeds. Families can browse kittens, place bids, or jump straight to Stripe-hosted checkout links. A hidden breeder dashboard syncs listings, bids, and statuses with Supabase as soon as credentials are supplied.

## Highlights

- React + Vite + TypeScript for speedy, mobile-first UI with an easy-to-scan layout.
- Supabase-backed kittens and bids (auto-fallback to local demo data if env vars are missing).
- Stripe Payment Link handoff for deposits and buy-now purchases (opens in a new tab).
- Breeder dashboard for managing kittens, galleries (stored as base64 strings), pricing, and statuses.
- Hidden admin access (Ctrl + Shift + A) so the public never sees login controls.

## Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.  
Press **Ctrl + Shift + A** (or call `window.whiskersAdmin()` from DevTools) to toggle the breeder dashboard. The shortcut is disabled in production by default.

## Supabase Sync

Add the following environment variables (Vercel automatically exposes both `VITE_…` and plain keys when configured):

```
VITE_SUPABASE_URL        // or SUPABASE_URL
VITE_SUPABASE_ANON_KEY   // or SUPABASE_ANON_KEY
```

Tables (JSON columns use `text[]` or `jsonb` depending on preference):

```sql
create table public.kittens (
  id text primary key,
  name text not null,
  tagline text,
  birthdate text,
  gender text,
  color text,
  weightLbs numeric,
  description text,
  traits jsonb default '[]'::jsonb,
  groomingNeeds text,
  healthNotes text,
  price numeric,
  depositAmount numeric,
  depositCheckoutUrl text,
  buyNowCheckoutUrl text,
  status text default 'available',
  heroImage text,
  gallery jsonb default '[]'::jsonb,
  featured boolean default false,
  createdAt timestamptz default now(),
  updatedAt timestamptz default now()
);

create table public.bids (
  id uuid primary key default gen_random_uuid(),
  kittenId text references public.kittens(id) on delete cascade,
  bidderName text not null,
  amount numeric not null,
  message text,
  placedAt timestamptz default now()
);
```

> Ensure your row-level security policies allow the anon key to `select` kittens/bids and that authenticated breeder users can `insert`/`update`/`delete` as required.

Without Supabase keys the app falls back to the bundled demo kittens (stored in-memory).

## Stripe Payment Links

1. Create two Stripe [Payment Links](https://dashboard.stripe.com/payment-links) per kitten (deposit + buy-now).
2. Paste them into the breeder dashboard fields:
   - `Stripe deposit link`
   - `Stripe buy-now link`
3. Families are taken directly to Stripe’s hosted checkout in a new tab.

## Image Handling

- JPG/PNG uploads are converted to base64 data URIs and stored with each kitten record.
- When using Supabase, ensure the column type (`gallery`) accepts a JSON array of strings.

## Build & Deploy

```bash
npm run build
npm run preview
```

Deploy the generated `dist/` folder with your preferred host (Vercel, Netlify, static bucket, etc.).
