-- Storage setup for SJ Joyeros admin image uploads
-- Run this in Supabase SQL Editor with a privileged role.

-- 1) Ensure products bucket exists and is public for catalog images.
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do update set public = excluded.public;

-- 2) Keep RLS enabled on storage.objects.
alter table storage.objects enable row level security;

-- 3) Policies: authenticated admins can manage objects only in productos bucket.
drop policy if exists "Productos bucket upload (authenticated)" on storage.objects;
create policy "Productos bucket upload (authenticated)"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'productos');

drop policy if exists "Productos bucket update (authenticated)" on storage.objects;
create policy "Productos bucket update (authenticated)"
on storage.objects
for update
to authenticated
using (bucket_id = 'productos')
with check (bucket_id = 'productos');

drop policy if exists "Productos bucket delete (authenticated)" on storage.objects;
create policy "Productos bucket delete (authenticated)"
on storage.objects
for delete
to authenticated
using (bucket_id = 'productos');

-- Optional: allow authenticated listing for admin tooling.
drop policy if exists "Productos bucket read (authenticated)" on storage.objects;
create policy "Productos bucket read (authenticated)"
on storage.objects
for select
to authenticated
using (bucket_id = 'productos');
