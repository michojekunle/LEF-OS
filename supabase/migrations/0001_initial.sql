-- ─────────────────────────────────────────────────────────────────────────────
-- 0001 · Initial schema — profiles, daily entries, RLS, signup trigger
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        citext unique,
  display_name    text,
  bio             text,
  avatar_url      text,
  default_public  boolean not null default false,
  is_primary_user boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint profiles_username_format
    check (username is null or username ~ '^[a-z0-9_]{3,24}$')
);

create index if not exists profiles_username_idx on public.profiles (username);

-- ── daily_entries ──────────────────────────────────────────────────────────
create table if not exists public.daily_entries (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  entry_date            date not null,
  day_number            integer not null,
  law_completed         boolean not null default false,
  economics_completed   boolean not null default false,
  finance_completed     boolean not null default false,
  study_rating          integer check (study_rating between 1 and 5),
  journal_text          text,
  share_insight         text,
  is_public             boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index if not exists daily_entries_user_date_idx
  on public.daily_entries (user_id, entry_date desc);
create index if not exists daily_entries_public_idx
  on public.daily_entries (is_public, entry_date desc)
  where is_public = true;
create index if not exists daily_entries_user_day_idx
  on public.daily_entries (user_id, day_number);

-- ── updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at on public.daily_entries;
create trigger set_updated_at before update on public.daily_entries
  for each row execute function public.tg_set_updated_at();

-- ── auto-create profile on sign-up ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.daily_entries  enable row level security;

drop policy if exists "profiles are viewable by everyone" on public.profiles;
create policy "profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "entries viewable if public or owner" on public.daily_entries;
create policy "entries viewable if public or owner"
  on public.daily_entries for select
  using (is_public = true or auth.uid() = user_id);

drop policy if exists "users insert own entries" on public.daily_entries;
create policy "users insert own entries"
  on public.daily_entries for insert with check (auth.uid() = user_id);

drop policy if exists "users update own entries" on public.daily_entries;
create policy "users update own entries"
  on public.daily_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users delete own entries" on public.daily_entries;
create policy "users delete own entries"
  on public.daily_entries for delete using (auth.uid() = user_id);
