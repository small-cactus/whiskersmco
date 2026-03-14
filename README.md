# Whiskers & Co.

<p align="center">
  <img src="public/favicon.png" alt="Whiskers & Co. icon" width="140" />
</p>

<p align="center">
  <img src="src/assets/kittens_in_basket.png" alt="Whiskers & Co. preview" width="720" />
</p>

<p align="center">
  Marketplace frontend and breeder dashboard for a Maine Coon cattery, built with React, Vite, and Supabase.
</p>

## Quick Start

1. Create a local environment file.

   ```bash
   cp .env.example .env
   ```

2. Install dependencies.

   ```bash
   npm ci
   ```

3. Start the app.

   ```bash
   npm start
   ```

4. Open the local Vite URL shown in the terminal.

5. To connect your own backend, add these values to `.env`.

   ```bash
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

## What This Repository Contains

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Top-level app shell that swaps between marketplace and admin views |
| `src/components/MarketplaceView.tsx` | Customer-facing catalog, listing cards, and purchase actions |
| `src/components/AdminDashboard.tsx` | Breeder dashboard for editing listings, pricing, gallery images, and checkout links |
| `src/context/KittenContext.tsx` | Shared data layer, Supabase sync, and seeded catalog fallback |
| `src/lib/supabaseClient.ts` | Environment-aware Supabase client bootstrap |
| `src/data/seed.ts` | Built-in sample listings used by the frontend out of the box |
| `supabase/schema.sql` | Schema for kittens and bids in the live backend |

## Product Overview

Whiskers & Co. is designed as a single frontend that serves two audiences:

- families browsing available kittens
- the breeder managing listings behind the scenes

Instead of splitting those into separate applications, the repo keeps both experiences in the same React tree and shares data through a single context-backed state layer.

## How The App Works

### View switching

`src/App.tsx` mounts the app inside `KittenProvider` and switches between:

- `MarketplaceView` for the public browsing experience
- `AdminDashboard` for the internal listing-management workflow

The app also exposes `window.whiskersAdmin()` and a development keyboard shortcut (`Ctrl + Shift + A`) for opening the dashboard directly.

### Shared data layer

`src/context/KittenContext.tsx` is the core of the application. It owns:

- kitten records
- bid activity
- create, update, and delete operations
- image gallery handling
- the decision about whether the app is using live Supabase data or the built-in seeded catalog

This keeps the marketplace and dashboard in sync without duplicating fetch or mutation logic across components.

### Marketplace flow

`src/components/MarketplaceView.tsx` renders the public side of the product. It presents the available kittens, status messaging, pricing, and checkout actions while reading the same shared context the admin tools use.

### Admin workflow

`src/components/AdminDashboard.tsx` gives the breeder tools to:

- add and edit kitten records
- upload and organize listing images
- control featured status and listing visibility
- attach Stripe Payment Links for deposits or direct purchase flows

The payment integration is intentionally lightweight: the frontend stores and surfaces hosted Stripe links rather than embedding a custom card form.

### Live data and sample data

The repository includes a ready-to-run catalog in `src/data/seed.ts`, so the frontend starts immediately after install. When Supabase credentials are present and the schema from `supabase/schema.sql` is applied, the same UI switches over to live data automatically through `src/lib/supabaseClient.ts` and `KittenContext`.

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key used by the browser client |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Vite development server |
| `npm run build` | Type-check and build the production bundle |
| `npm run lint` | Run ESLint across the project |
| `npm run preview` | Serve the production build locally |

## Stack

- React 18
- TypeScript
- Vite 5
- Supabase
- Framer Motion
- Stripe Payment Links

## License

MIT
