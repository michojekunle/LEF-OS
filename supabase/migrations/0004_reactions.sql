-- ─────────────────────────────────────────────────────────────────────────────
-- 0004 · Journal reactions — anyone signed-in can react to a public entry
-- ─────────────────────────────────────────────────────────────────────────────

create type public.reaction_kind as enum ('clap', 'brain', 'fire', 'bookmark');

create table if not exists public.journal_reactions (
  id          uuid primary key default gen_random_uuid(),
  entry_id    uuid not null references public.daily_entries(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        public.reaction_kind not null,
  created_at  timestamptz not null default now(),
  unique (entry_id, user_id, kind)
);

create index if not exists journal_reactions_entry_idx
  on public.journal_reactions (entry_id);
create index if not exists journal_reactions_user_idx
  on public.journal_reactions (user_id, created_at desc);

alter table public.journal_reactions enable row level security;

-- Anyone (authed or anon) can read reactions on PUBLIC entries.
drop policy if exists "reactions readable on public entries" on public.journal_reactions;
create policy "reactions readable on public entries"
  on public.journal_reactions for select using (
    exists (
      select 1 from public.daily_entries de
      where de.id = entry_id and (de.is_public = true or de.user_id = auth.uid())
    )
  );

drop policy if exists "authed users react to public entries" on public.journal_reactions;
create policy "authed users react to public entries"
  on public.journal_reactions for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.daily_entries de
      where de.id = entry_id and de.is_public = true
    )
  );

drop policy if exists "users delete own reactions" on public.journal_reactions;
create policy "users delete own reactions"
  on public.journal_reactions for delete using (auth.uid() = user_id);

-- ── Aggregate view: reactions per entry per kind ──────────────────────────
create or replace view public.journal_reaction_counts as
  select
    entry_id,
    kind,
    count(*)::int as count
  from public.journal_reactions
  group by entry_id, kind;

grant select on public.journal_reaction_counts to anon, authenticated;
