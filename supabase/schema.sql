create extension if not exists "pgcrypto";

create table if not exists public.kittens (
  id text primary key,
  name text not null,
  tagline text,
  birthdate timestamptz not null,
  gender text not null check (gender in ('male', 'female')),
  color text,
  weight_lbs numeric,
  description text,
  traits text[] default '{}',
  grooming_needs text,
  health_notes text,
  price numeric not null,
  deposit_amount numeric not null,
  deposit_checkout_url text,
  buy_now_checkout_url text,
  status text not null default 'available',
  hero_image text,
  gallery text[] default '{}',
  featured boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  kitten_id text not null references public.kittens(id) on delete cascade,
  bidder_name text not null,
  amount numeric not null check (amount > 0),
  message text,
  placed_at timestamptz not null default now()
);

create index if not exists bids_kitten_id_idx on public.bids (kitten_id);

alter table public.kittens enable row level security;
alter table public.bids enable row level security;

create policy if not exists "Kittens are viewable by everyone"
  on public.kittens for select using (true);

create policy if not exists "Kittens are manageable by everyone"
  on public.kittens for insert with check (true);

create policy if not exists "Kittens can be updated by everyone"
  on public.kittens for update using (true) with check (true);

create policy if not exists "Bids are viewable by everyone"
  on public.bids for select using (true);

create policy if not exists "Bids can be inserted by everyone"
  on public.bids for insert with check (true);

create policy if not exists "Bids can be updated by everyone"
  on public.bids for update using (true) with check (true);
