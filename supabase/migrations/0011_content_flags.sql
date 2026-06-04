-- ─────────────────────────────────────────────────────────────────────────────
-- 0011 · Content flags — users can flag broken/wrong videos and articles
--        in the enriched study content (enriched-content.json)
-- ─────────────────────────────────────────────────────────────────────────────

create table public.content_flags (
  id           uuid primary key default gen_random_uuid(),
  -- The URL being flagged
  url          text not null check (char_length(url) <= 2000),
  title        text not null check (char_length(title) <= 300),
  day_number   integer check (day_number between 1 and 111),
  domain       public.lef_domain,
  -- 'video' | 'article'
  content_type text not null check (content_type in ('video', 'article')),
  flagged_by   uuid references auth.users on delete set null,
  reason       text check (reason is null or char_length(reason) <= 300),
  -- Admin marks resolved after fixing the content
  resolved     boolean not null default false,
  resolved_by  uuid references auth.users on delete set null,
  resolved_at  timestamptz,
  created_at   timestamptz not null default now(),
  -- One flag per user per URL (nulls not counted as duplicates)
  unique nulls not distinct (url, flagged_by)
);

create index content_flags_url_idx       on public.content_flags (url);
create index content_flags_resolved_idx  on public.content_flags (resolved, created_at desc);
create index content_flags_day_idx       on public.content_flags (day_number, domain);
create index content_flags_user_idx      on public.content_flags (flagged_by);

alter table public.content_flags enable row level security;

-- Anyone can insert a flag
create policy "Anyone can flag content"
  on public.content_flags for insert
  with check (true);

-- Users can see their own flags
create policy "Users see own content flags"
  on public.content_flags for select
  to authenticated
  using (auth.uid() = flagged_by);

-- Primary users (admin) have full access
create policy "Primary users full access to content flags"
  on public.content_flags for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_primary_user = true
    )
  );
