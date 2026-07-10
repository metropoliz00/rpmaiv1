-- ====================================================================
-- SUPABASE SQL SCHEMA: Kelas, Mata Pelajaran, dan Materi
-- ====================================================================
-- Jalankan skrip ini di SQL Editor Supabase Anda untuk membuat tabel
-- dan data referensi Kelas, Mata Pelajaran, serta Materi.
-- ====================================================================

create table if not exists public.db_kelas (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.db_mata_pelajaran (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.db_materi (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.db_kelas enable row level security;
alter table public.db_mata_pelajaran enable row level security;
alter table public.db_materi enable row level security;

-- Public read policies so users can fetch options
create policy "Allow read db_kelas" on public.db_kelas for select using (true);
create policy "Allow read db_mata_pelajaran" on public.db_mata_pelajaran for select using (true);
create policy "Allow read db_materi" on public.db_materi for select using (true);

-- Sample Data
insert into public.db_kelas (name) values ('I'), ('II'), ('III'), ('IV'), ('V'), ('VI');
insert into public.db_mata_pelajaran (name) values ('Pendidikan Agama Islam'), ('Pendidikan Pancasila'), ('Bahasa Indonesia'), ('Matematika'), ('IPAS'), ('PJOK'), ('Seni Budaya'), ('Bahasa Inggris');
insert into public.db_materi (name) values ('Bilangan Cacat sampai 100'), ('Pancasila dalam Kehidupan Sehari-hari'), ('Aku dan Kebutuhanku'), ('Wujud Zat dan Perubahannya');
