-- ─────────────────────────────────────────────────────────────────────────────
-- 0007 · Custom Reminders, In-App Notifications, and Push Subscriptions
-- ─────────────────────────────────────────────────────────────────────────────

-- Alter user_settings to add timezone with default value
alter table public.user_settings add column if not exists timezone text not null default 'Africa/Lagos';

-- ── custom_reminders ────────────────────────────────────────────────────────
create table if not exists public.custom_reminders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  title         text not null,
  reminder_time time not null, -- format HH:MM:SS
  delivery_type text not null check (delivery_type in ('email', 'in_app', 'both')),
  enabled       boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.custom_reminders enable row level security;

create policy "users can view own reminders"
  on public.custom_reminders for select
  using (auth.uid() = user_id);

create policy "users can insert own reminders"
  on public.custom_reminders for insert
  with check (auth.uid() = user_id);

create policy "users can update own reminders"
  on public.custom_reminders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own reminders"
  on public.custom_reminders for delete
  using (auth.uid() = user_id);

-- ── in_app_notifications ─────────────────────────────────────────────────────
create table if not exists public.in_app_notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.in_app_notifications enable row level security;

create policy "users can view own notifications"
  on public.in_app_notifications for select
  using (auth.uid() = user_id);

create policy "users can update own notifications"
  on public.in_app_notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own notifications"
  on public.in_app_notifications for delete
  using (auth.uid() = user_id);

-- ── push_subscriptions ────────────────────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  subscription jsonb not null, -- holds endpoint, keys (p256dh, auth)
  created_at   timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "users can view own push subscriptions"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "users can insert own push subscriptions"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "users can delete own push subscriptions"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- ── update signup trigger to seed default reminders ──────────────────────────
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

  -- Seed default reminders
  insert into public.custom_reminders (user_id, title, reminder_time, delivery_type)
  values
    (new.id, 'Morning Law Study', '08:00:00', 'both'),
    (new.id, 'Noon Economics Focus', '13:00:00', 'in_app'),
    (new.id, 'Dusk Finance Review', '19:00:00', 'both')
  on conflict do nothing;

  return new;
end;
$$;

-- Trigger set_updated_at for custom_reminders
drop trigger if exists set_updated_at on public.custom_reminders;
create trigger set_updated_at before update on public.custom_reminders
  for each row execute function public.tg_set_updated_at();
