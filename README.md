# Whiskers & Co.

<p align="center">
  <img src="public/favicon.png" alt="Whiskers & Co. icon" width="140" />
</p>

<p align="center">
  <img src="src/assets/kittens_in_basket.png" alt="Whiskers & Co. preview" width="720" />
</p>

Whiskers & Co. is a polished marketplace-style web app for a Maine Coon breeder. It combines a public-facing kitten listing experience with a hidden breeder dashboard that manages listings, bidding activity, image galleries, and Stripe checkout links.

## What This Project Is

For an interviewer or evaluator, this project demonstrates:

- a customer-facing commerce-style browsing experience
- a private admin workflow built into the same React app
- Supabase-backed data sync with a graceful local demo fallback
- Stripe payment-link integration without custom checkout code
- a lightweight but production-ready Vite + React + TypeScript frontend

## What The Repository Contains

- `src/components/MarketplaceView.tsx`: the public adoption/browsing experience
- `src/components/AdminDashboard.tsx`: the breeder dashboard for managing kittens and pricing
- `src/context/KittenContext.tsx`: shared application state, Supabase sync, and demo fallback behavior
- `src/lib/supabaseClient.ts`: environment-aware Supabase client setup
- `supabase/schema.sql`: database schema for kittens and bids
- `public/` and `src/assets/`: icons, manifest assets, and product imagery

## How It Works

Whiskers & Co. runs as a single React application with two modes:

1. Marketplace mode shows available kittens, pricing, traits, bidding, and checkout actions.
2. Admin mode exposes breeder tools for editing kitten records, image galleries, featured status, and Stripe links.

The app selects between demo mode and live mode automatically:

- If Supabase credentials are configured, the app syncs kittens and bids against the database.
- If credentials or tables are missing, it falls back to seeded demo data so the site still works for review and design evaluation.

Admin mode can be opened with `Ctrl + Shift + A` in development or by calling `window.whiskersAdmin()` from the browser console.

## Stack

- React 18
- TypeScript
- Vite 5
- Supabase
- Framer Motion
- Stripe Payment Links

## Required Environment Variables

Create a local `.env` from the example template:

```bash
cp .env.example .env
```

Set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Without these values, the app still runs in demo mode. Live breeder data sync requires a Supabase project with the schema from `supabase/schema.sql`.

## Run Locally

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Verified During Cleanup

The following commands were run successfully during public-readiness cleanup:

```bash
npm ci
npm run dev
npm run build
npm run lint
```

`npm run lint` currently reports two Fast Refresh warnings, but no errors.

## Notes For Evaluation

- The public site and the breeder dashboard share the same React application state.
- Supabase is optional for evaluation because the demo fallback is built into the data layer.
- Stripe integration is implemented through hosted Payment Links, not a custom payment form.
- Public-repo security files and monitoring config were added during cleanup.

## License

MIT
