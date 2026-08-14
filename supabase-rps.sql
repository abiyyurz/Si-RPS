-- ============================================================
-- SETUP SUPABASE UNTUK APLIKASI SI-RPS — MODE PERSONAL (tanpa login)
-- Jalankan SEKALI di Supabase SQL Editor pada project khusus RPS.
-- Menyimpan SATU "kotak" data RPS bersama (owner_id = 'personal') supaya
-- data tetap ada saat berpindah browser/perangkat.
--
-- CATATAN KEAMANAN: mode ini TANPA login, jadi aksesnya dibuka untuk anon —
-- siapa pun yang tahu alamat website + anon key bisa membaca/mengubah data ini.
-- Cukup untuk pemakaian pribadi/testing. Untuk multi-user nanti, ganti ke
-- Supabase Auth + RLS per-akun (owner_id = auth.uid()).
-- ============================================================

-- DATA RPS (satu baris jsonb). Aplikasi memakai owner_id tetap = 'personal'.
create table if not exists rps_stores (
  owner_id   text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- RLS: izinkan penuh untuk anon (aplikasi memakai anon key, tanpa login).
alter table rps_stores enable row level security;
drop policy if exists "allow all (personal)" on rps_stores;
create policy "allow all (personal)" on rps_stores for all using (true) with check (true);

-- Grant ke anon (project Supabase baru kadang belum memberi grant).
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
