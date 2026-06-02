-- ─────────────────────────────────────────────────────────────────────────────
-- 0005 · Full-text search on journal + RPC for fast stats
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Generated tsvector column on daily_entries ────────────────────────────
alter table public.daily_entries
  add column if not exists search_doc tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(share_insight, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(journal_text, '')), 'B')
  ) stored;

create index if not exists daily_entries_search_idx
  on public.daily_entries using gin (search_doc);

-- ── RPC: search public journal ────────────────────────────────────────────
create or replace function public.search_journal(
  q text,
  result_limit int default 30,
  result_offset int default 0
)
returns table (
  id            uuid,
  user_id       uuid,
  entry_date    date,
  day_number    integer,
  share_insight text,
  is_public     boolean,
  rank          real
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    de.id,
    de.user_id,
    de.entry_date,
    de.day_number,
    de.share_insight,
    de.is_public,
    ts_rank(de.search_doc, websearch_to_tsquery('english', q)) as rank
  from public.daily_entries de
  where de.is_public = true
    and de.share_insight is not null
    and (q = '' or de.search_doc @@ websearch_to_tsquery('english', q))
  order by rank desc nulls last, de.entry_date desc
  limit greatest(1, least(result_limit, 100))
  offset greatest(0, result_offset);
$$;

grant execute on function public.search_journal(text, int, int) to anon, authenticated;

-- ── RPC: per-user stats snapshot ──────────────────────────────────────────
create or replace function public.user_stats(uid uuid)
returns table (
  days_logged        int,
  law_days           int,
  econ_days          int,
  finance_days       int,
  full_days          int,
  public_insights    int,
  avg_rating         numeric,
  longest_streak     int,
  current_streak     int,
  questions_open     int,
  questions_answered int,
  bookmarks_total    int,
  bookmarks_done     int
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_dates date[];
  v_curr  int := 0;
  v_long  int := 0;
  v_run   int := 0;
  v_prev  date;
  v_d     date;
  v_today date := (now() at time zone 'utc')::date;
begin
  -- streak math
  select array_agg(entry_date order by entry_date)
    into v_dates
  from public.daily_entries
  where user_id = uid
    and (law_completed or economics_completed or finance_completed);

  if v_dates is not null then
    foreach v_d in array v_dates loop
      if v_prev is null or v_d = v_prev + 1 then
        v_run := v_run + 1;
      else
        v_run := 1;
      end if;
      if v_run > v_long then v_long := v_run; end if;
      v_prev := v_d;
    end loop;
    if v_prev = v_today or v_prev = v_today - 1 then
      v_curr := v_run;
    end if;
  end if;

  return query
  select
    (select count(*)::int from public.daily_entries
       where user_id = uid
         and (law_completed or economics_completed or finance_completed)),
    (select count(*)::int from public.daily_entries where user_id = uid and law_completed),
    (select count(*)::int from public.daily_entries where user_id = uid and economics_completed),
    (select count(*)::int from public.daily_entries where user_id = uid and finance_completed),
    (select count(*)::int from public.daily_entries
       where user_id = uid and law_completed and economics_completed and finance_completed),
    (select count(*)::int from public.daily_entries
       where user_id = uid and is_public and share_insight is not null),
    (select round(avg(study_rating)::numeric, 2) from public.daily_entries
       where user_id = uid and study_rating is not null),
    v_long,
    v_curr,
    (select count(*)::int from public.questions where user_id = uid and not answered),
    (select count(*)::int from public.questions where user_id = uid and answered),
    (select count(*)::int from public.bookmarks where user_id = uid),
    (select count(*)::int from public.bookmarks where user_id = uid and done);
end;
$$;

grant execute on function public.user_stats(uuid) to authenticated;
