-- Adds opt-in column for the daily 5-minute brief email.
-- Default false so existing users aren't auto-subscribed to a new channel.

alter table public.user_settings
  add column if not exists daily_brief_email_enabled boolean not null default false;

comment on column public.user_settings.daily_brief_email_enabled is
  'Send the 5-minute lesson brief by email each morning (per-user opt-in).';
