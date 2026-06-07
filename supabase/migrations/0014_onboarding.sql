-- Add onboarding tracking and domain preferences to user_settings
alter table public.user_settings
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists preferred_domains text[] not null default array['law','economics','finance'];

comment on column public.user_settings.onboarding_completed is
  'True once the user has completed the immersive onboarding wizard.';

comment on column public.user_settings.preferred_domains is
  'Domains the user chose to focus on during onboarding (subset of law, economics, finance).';
