-- ─────────────────────────────────────────────────────────────────────────────
-- 0002 · Per-domain notes + questions
-- A daily_entry already captures completion + an insight; this adds richer notes
-- for spaced-repetition study and an open question stack to research later.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── per-domain study notes (one row per (user, day, domain)) ──────────────
create type public.lef_domain as enum ('law', 'economics', 'finance');

create table if not exists public.day_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  day_number  integer not null,
  domain      public.lef_domain not null,
  body        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, day_number, domain),
  constraint day_notes_body_len check (char_length(body) between 1 and 8000)
);

create index if not exists day_notes_user_day_idx
  on public.day_notes (user_id, day_number);

drop trigger if exists set_updated_at on public.day_notes;
create trigger set_updated_at before update on public.day_notes
  for each row execute function public.tg_set_updated_at();

alter table public.day_notes enable row level security;

drop policy if exists "users read own notes" on public.day_notes;
create policy "users read own notes"
  on public.day_notes for select using (auth.uid() = user_id);

drop policy if exists "users write own notes" on public.day_notes;
create policy "users write own notes"
  on public.day_notes for insert with check (auth.uid() = user_id);

drop policy if exists "users update own notes" on public.day_notes;
create policy "users update own notes"
  on public.day_notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users delete own notes" on public.day_notes;
create policy "users delete own notes"
  on public.day_notes for delete using (auth.uid() = user_id);

-- ── open questions (research stack) ───────────────────────────────────────
create table if not exists public.questions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  day_number  integer,                                -- optional anchor day
  domain      public.lef_domain,                      -- optional domain
  body        text not null,
  answered    boolean not null default false,
  answer      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint questions_body_len check (char_length(body) between 1 and 1000)
);

create index if not exists questions_user_open_idx
  on public.questions (user_id, answered, created_at desc);

drop trigger if exists set_updated_at on public.questions;
create trigger set_updated_at before update on public.questions
  for each row execute function public.tg_set_updated_at();

alter table public.questions enable row level security;

drop policy if exists "users read own questions" on public.questions;
create policy "users read own questions"
  on public.questions for select using (auth.uid() = user_id);

drop policy if exists "users write own questions" on public.questions;
create policy "users write own questions"
  on public.questions for insert with check (auth.uid() = user_id);

drop policy if exists "users update own questions" on public.questions;
create policy "users update own questions"
  on public.questions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users delete own questions" on public.questions;
create policy "users delete own questions"
  on public.questions for delete using (auth.uid() = user_id);
