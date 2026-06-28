-- Creates user_quizzes table to store AI quiz grades.
create table if not exists public.user_quizzes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  day_number  integer not null,
  domain      text not null,
  score       integer not null,
  total       integer not null,
  created_at  timestamptz not null default now()
);

-- Enable RLS
alter table public.user_quizzes enable row level security;

-- RLS policies
drop policy if exists "users can view own quizzes" on public.user_quizzes;
create policy "users can view own quizzes"
  on public.user_quizzes for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own quizzes" on public.user_quizzes;
create policy "users can insert own quizzes"
  on public.user_quizzes for insert
  with check (auth.uid() = user_id);

-- Performance index
create index if not exists user_quizzes_user_day_idx on public.user_quizzes(user_id, day_number);
