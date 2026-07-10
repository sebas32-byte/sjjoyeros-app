-- SJ Joyeros v1.1: Product schema + RLS for official catalog publishing
-- Run in Supabase SQL Editor with privileged role.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text,
  category text,
  subcategory text,
  material text,
  description text,
  short_description text,
  price numeric(12,2) not null default 0,
  stock integer not null default 0,
  available boolean not null default true,
  featured boolean not null default false,
  image text,
  images text[] not null default '{}',
  family text,
  reference text,
  bead_size text,
  inventory_status text,
  description_template text,
  sales_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.products
  add column if not exists name text,
  add column if not exists slug text,
  add column if not exists sku text,
  add column if not exists category text,
  add column if not exists subcategory text,
  add column if not exists material text,
  add column if not exists description text,
  add column if not exists short_description text,
  add column if not exists price numeric(12,2) default 0,
  add column if not exists stock integer default 0,
  add column if not exists available boolean default true,
  add column if not exists featured boolean default false,
  add column if not exists image text,
  add column if not exists images text[] default '{}',
  add column if not exists family text,
  add column if not exists reference text,
  add column if not exists bead_size text,
  add column if not exists inventory_status text,
  add column if not exists description_template text,
  add column if not exists sales_count integer default 0,
  add column if not exists created_at timestamptz default now();

create unique index if not exists products_slug_unique_idx on public.products (slug);

alter table public.products enable row level security;

drop policy if exists "Products public read available" on public.products;
create policy "Products public read available"
on public.products
for select
to anon, authenticated
using (available is distinct from false);

drop policy if exists "Products admin read all" on public.products;
create policy "Products admin read all"
on public.products
for select
to authenticated
using (true);

drop policy if exists "Products admin insert" on public.products;
create policy "Products admin insert"
on public.products
for insert
to authenticated
with check (true);

drop policy if exists "Products admin update" on public.products;
create policy "Products admin update"
on public.products
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Products admin delete" on public.products;
create policy "Products admin delete"
on public.products
for delete
to authenticated
using (true);
