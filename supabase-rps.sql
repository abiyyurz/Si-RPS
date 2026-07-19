-- ============================================================
-- SETUP SUPABASE UNTUK APLIKASI RPS (MERPS) — PROJECT TERPISAH
-- Jalankan SEKALI di Supabase SQL Editor pada project BARU (khusus RPS,
-- terpisah dari Si-BHP). Membuat tabel akun (users) + data RPKPS (rps_stores).
-- ============================================================

-- 1. AKUN / LOGIN (skema sama seperti Si-BHP agar auth kompatibel)
create table if not exists users (
  id text primary key,
  first_name text,
  last_name text,
  name text not null,
  username text unique,
  password text,                       -- hash SHA-256+salt
  email text,
  role text default 'user',            -- 'admin' | 'user'
  user_type text default 'dosen',      -- 'mahasiswa' | 'dosen' | 'admin'
  avatar text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. DATA RPKPS PER-AKUN (satu baris jsonb per dosen; owner_id = users.id)
create table if not exists rps_stores (
  owner_id   text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 3. RLS: sementara diizinkan penuh untuk anon (aplikasi pakai anon key).
alter table users enable row level security;
alter table rps_stores enable row level security;

drop policy if exists "allow all (sementara)" on users;
drop policy if exists "allow all (sementara)" on rps_stores;
create policy "allow all (sementara)" on users for all using (true) with check (true);
create policy "allow all (sementara)" on rps_stores for all using (true) with check (true);

-- 4. Grant ke anon (project Supabase baru kadang belum memberi grant ke anon)
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
