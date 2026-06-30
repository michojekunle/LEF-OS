-- ════════════════════════════════════════════════════════════════
-- Sankofa Invite Tokens
-- Extends sankofa_waitlist with invite tracking fields.
-- ════════════════════════════════════════════════════════════════

alter table public.sankofa_waitlist
  add column if not exists invited_at timestamptz,
  add column if not exists invite_token text unique,
  add column if not exists invite_used_at timestamptz;

-- Index for fast token lookup on the join page
create index if not exists sankofa_waitlist_invite_token_idx
  on public.sankofa_waitlist (invite_token)
  where invite_token is not null;
