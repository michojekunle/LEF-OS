-- ─────────────────────────────────────────────────────────────────────────────
-- 0003 · Bookmarks — track resources/links you want to read or have completed
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  url         text not null,
  title       text,
  note        text,
  domain      public.lef_domain,
  day_number  integer,
  done        boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, url),
  constraint bookmarks_url_format
    check (url ~* '^https?://')
);

create index if not exists bookmarks_user_done_idx
  on public.bookmarks (user_id, done, created_at desc);
create index if not exists bookmarks_user_domain_idx
  on public.bookmarks (user_id, domain);

drop trigger if exists set_updated_at on public.bookmarks;
create trigger set_updated_at before update on public.bookmarks
  for each row execute function public.tg_set_updated_at();

alter table public.bookmarks enable row level security;

drop policy if exists "users read own bookmarks" on public.bookmarks;
create policy "users read own bookmarks"
  on public.bookmarks for select using (auth.uid() = user_id);

drop policy if exists "users write own bookmarks" on public.bookmarks;
create policy "users write own bookmarks"
  on public.bookmarks for insert with check (auth.uid() = user_id);

drop policy if exists "users update own bookmarks" on public.bookmarks;
create policy "users update own bookmarks"
  on public.bookmarks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users delete own bookmarks" on public.bookmarks;
create policy "users delete own bookmarks"
  on public.bookmarks for delete using (auth.uid() = user_id);
