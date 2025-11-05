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

### Create the tables

1. Open the Supabase SQL editor for your project.
2. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it once.
   - The script creates the `kittens` and `bids` tables, adds simple RLS policies that mirror the demo behaviour, and enables UUID generation for bids.
   - Adjust the policies before production if you need stricter access control.

If the tables are missing, the app automatically falls back to the bundled demo kittens and surfaces a warning in the UI.

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
