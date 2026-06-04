-- ─────────────────────────────────────────────────────────────────────────────
-- 0009 · Resource submissions — community-contributed links per study day
-- ─────────────────────────────────────────────────────────────────────────────

create type public.resource_type as enum ('video', 'article', 'tool', 'other');
create type public.submission_status as enum ('pending', 'approved', 'rejected');

create table public.resource_submissions (
  id          uuid primary key default gen_random_uuid(),
  day_number  integer not null check (day_number between 1 and 111),
  domain      public.lef_domain not null,
  type        public.resource_type not null default 'article',
  title       text not null check (char_length(title) between 3 and 200),
  url         text not null check (url ~ '^https?://'),
  note        text check (note is null or char_length(note) <= 500),
  submitted_by uuid references auth.users on delete set null,
  status      public.submission_status not null default 'pending',
  reviewed_by uuid references auth.users on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);

create index resource_submissions_day_domain_status_idx
  on public.resource_submissions (day_number, domain, status);
create index resource_submissions_status_created_idx
  on public.resource_submissions (status, created_at desc);
create index resource_submissions_user_idx
  on public.resource_submissions (submitted_by);

-- RLS
alter table public.resource_submissions enable row level security;

-- Anyone (including anon) can read approved resources
create policy "Read approved submissions"
  on public.resource_submissions for select
  using (status = 'approved');

-- Authenticated users can submit
create policy "Authenticated users can submit"
  on public.resource_submissions for insert
  to authenticated
  with check (auth.uid() = submitted_by);

-- Authenticated users can see their own pending/rejected submissions
create policy "Users can see own submissions"
  on public.resource_submissions for select
  to authenticated
  using (auth.uid() = submitted_by);

-- Primary users (admin) can do everything
create policy "Primary users have full access"
  on public.resource_submissions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_primary_user = true
    )
  );
