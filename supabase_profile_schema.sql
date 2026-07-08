-- ====================================================================
-- SUPABASE SQL SCHEMA: User Profiles for RPM / Modul Ajar Generator
-- ====================================================================
-- Jalankan skrip ini di SQL Editor Supabase Anda untuk membuat tabel
-- penyimpanan profil pengguna (Nama Sekolah, Kepala Sekolah, NIP, Guru, dsb).
-- ====================================================================

create table if not exists public.user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  email text,
  nama_sekolah text,
  nama_kepala_sekolah text,
  nip_kepala_sekolah text,
  nama_penyusun text,
  nip_penyusun text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Aktifkan Row Level Security (RLS) untuk keamanan data pengguna
alter table public.user_profiles enable row level security;

-- Kebijakan Akses (RLS Policies)
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

-- Fungsi otomatis update timestamp 'updated_at'
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_user_profile_updated
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();
