-- ─────────────────────────────────────────────────────────────────────────────
-- 0006 · user_settings table, RLS, and email triggers
-- ─────────────────────────────────────────────────────────────────────────────

-- ── user_settings ────────────────────────────────────────────────────────────
create table if not exists public.user_settings (
  user_id                uuid primary key references public.profiles(id) on delete cascade,
  email                  text not null,
  daily_reminder_enabled boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Enable RLS
alter table public.user_settings enable row level security;

-- RLS policies
drop policy if exists "users can view own settings" on public.user_settings;
create policy "users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own settings" on public.user_settings;
create policy "users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own settings" on public.user_settings;
create policy "users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own settings" on public.user_settings;
create policy "users can delete own settings"
  on public.user_settings for delete
  using (auth.uid() = user_id);

-- ── update signup trigger to support Google full_name & settings creation ──
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Write profile row
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  -- Write settings row
  insert into public.user_settings (user_id, email)
  values (
    new.id,
    new.email
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Trigger set_updated_at for user_settings
drop trigger if exists set_updated_at on public.user_settings;
create trigger set_updated_at before update on public.user_settings
  for each row execute function public.tg_set_updated_at();
