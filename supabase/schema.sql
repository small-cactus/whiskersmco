-- Whiskers & Co. Supabase schema
-- Run this once in the Supabase SQL editor to provision the kittens + bids tables.

create extension if not exists "pgcrypto";

drop table if exists public.bids cascade;
drop table if exists public.kittens cascade;

create table public.kittens (
  "id" text primary key,
  "name" text not null,
  "tagline" text,
  "birthdate" timestamptz not null default now(),
  "gender" text not null check ("gender" in ('male', 'female')) default 'female',
  "color" text,
  "weightLbs" numeric,
  "description" text,
  "traits" text[] default '{}',
  "groomingNeeds" text,
  "healthNotes" text,
  "price" numeric not null,
  "depositAmount" numeric not null,
  "depositCheckoutUrl" text,
  "buyNowCheckoutUrl" text,
  "status" text not null default 'available',
  "heroImage" text,
  "gallery" text[] default '{}',
  "featured" boolean default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.bids (
  "id" uuid primary key default gen_random_uuid(),
  "kittenId" text not null references public.kittens("id") on delete cascade,
  "bidderName" text not null,
  "amount" numeric not null check ("amount" > 0),
  "message" text,
  "placedAt" timestamptz not null default now()
);

create index bids_kitten_id_idx on public.bids ("kittenId");

alter table public.kittens enable row level security;
alter table public.bids enable row level security;

create policy "Kittens are viewable by everyone"
  on public.kittens
  for select
  using (true);

create policy "Kittens can be inserted by anyone"
  on public.kittens
  for insert
  with check (true);

create policy "Kittens can be updated by anyone"
  on public.kittens
  for update
  using (true)
  with check (true);

create policy "Bids are viewable by everyone"
  on public.bids
  for select
  using (true);

create policy "Bids can be inserted by anyone"
  on public.bids
  for insert
  with check (true);

create policy "Bids can be updated by anyone"
  on public.bids
  for update
  using (true)
  with check (true);
