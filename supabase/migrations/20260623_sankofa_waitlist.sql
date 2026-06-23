-- ════════════════════════════════════════════════════════════════
-- Sankofa Waitlist Table
-- Run in Supabase SQL Editor or via `supabase db push`
-- ════════════════════════════════════════════════════════════════

create table if not exists sankofa_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text default 'sankofa-coming-soon',
  created_at timestamptz default now()
);

-- Row Level Security
alter table sankofa_waitlist enable row level security;

-- Nobody can read the waitlist via the client SDK (admin-only via service role)
create policy "Only service role can read sankofa waitlist"
  on sankofa_waitlist for select
  using (false);

-- Anyone can join the waitlist (the API route uses the admin client, but
-- this policy ensures safety if the anon key is ever used directly)
create policy "Anyone can join sankofa waitlist"
  on sankofa_waitlist for insert
  with check (true);
