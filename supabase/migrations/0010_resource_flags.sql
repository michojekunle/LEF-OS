-- ─────────────────────────────────────────────────────────────────────────────
-- 0010 · Resource flags — users can flag approved resources for review/removal
-- ─────────────────────────────────────────────────────────────────────────────

-- Extend the status enum to represent auto-flagged items
alter type public.submission_status add value if not exists 'flagged';

-- ── resource_flags ────────────────────────────────────────────────────────────
create table public.resource_flags (
  id              uuid primary key default gen_random_uuid(),
  submission_id   uuid not null references public.resource_submissions(id) on delete cascade,
  flagged_by      uuid references auth.users on delete set null,
  -- fingerprint for anonymous flags: hash of IP or session — optional extra deterrent
  fingerprint     text,
  reason          text check (reason is null or char_length(reason) <= 300),
  created_at      timestamptz not null default now(),
  -- one flag per user per resource (nulls excluded — anon flags by fingerprint)
  unique nulls not distinct (submission_id, flagged_by)
);

create index resource_flags_submission_idx on public.resource_flags (submission_id);
create index resource_flags_user_idx       on public.resource_flags (flagged_by);

-- RLS
alter table public.resource_flags enable row level security;

-- Anyone can insert a flag
create policy "Anyone can flag a resource"
  on public.resource_flags for insert
  with check (true);

-- Users can see their own flags
create policy "Users can see own flags"
  on public.resource_flags for select
  to authenticated
  using (auth.uid() = flagged_by);

-- Primary users can see all flags
create policy "Primary users can read all flags"
  on public.resource_flags for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_primary_user = true
    )
  );

-- Primary users can delete flags (e.g. dismiss false reports)
create policy "Primary users can delete flags"
  on public.resource_flags for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_primary_user = true
    )
  );

-- ── auto-flag trigger ─────────────────────────────────────────────────────────
-- When a resource accumulates FLAG_THRESHOLD flags, mark it 'flagged' so it
-- disappears from the public listing and appears in the admin review queue.
create or replace function public.tg_check_flag_threshold()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  flag_count integer;
  threshold  constant integer := 3;
begin
  select count(*) into flag_count
  from public.resource_flags
  where submission_id = NEW.submission_id;

  if flag_count >= threshold then
    update public.resource_submissions
    set status = 'flagged'
    where id = NEW.submission_id
      and status = 'approved';  -- only demote approved resources
  end if;

  return NEW;
end;
$$;

create trigger check_flag_threshold
  after insert on public.resource_flags
  for each row execute function public.tg_check_flag_threshold();

-- ── flag_count view (convenience for admin queries) ───────────────────────────
create or replace view public.resource_flag_counts as
  select submission_id, count(*)::integer as flag_count
  from public.resource_flags
  group by submission_id;
