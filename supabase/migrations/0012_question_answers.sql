-- ─────────────────────────────────────────────────────────────────────────────
-- 0012 · Question answers — users' written responses to enriched review questions
-- ─────────────────────────────────────────────────────────────────────────────

create table public.question_answers (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users on delete cascade,
  day_number     integer not null check (day_number between 1 and 111),
  domain         public.lef_domain not null,
  question_index integer not null check (question_index >= 0 and question_index <= 9),
  answer         text not null check (char_length(answer) between 1 and 5000),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, day_number, domain, question_index)
);

create index question_answers_user_day_idx
  on public.question_answers (user_id, day_number);

create trigger set_updated_at before update on public.question_answers
  for each row execute function public.tg_set_updated_at();

alter table public.question_answers enable row level security;

create policy "Users manage their own answers"
  on public.question_answers for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
