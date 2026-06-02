# Supabase — LEF OS

Numbered SQL migrations are the source of truth for the database. Run them in
order against any Supabase project.

## Files

| #    | File                           | What it adds                                                              |
| ---- | ------------------------------ | ------------------------------------------------------------------------- |
| 0001 | `0001_initial.sql`             | `profiles`, `daily_entries`, RLS, auto-profile trigger on sign-up         |
| 0002 | `0002_notes_and_questions.sql` | `day_notes` (per-domain), `questions` (research stack), `lef_domain` enum |
| 0003 | `0003_bookmarks.sql`           | `bookmarks` table                                                         |
| 0004 | `0004_reactions.sql`           | `journal_reactions` + `journal_reaction_counts` view                      |
| 0005 | `0005_search_and_stats.sql`    | tsvector + GIN index, `search_journal()` + `user_stats()` RPCs            |

## Running them

### Option A — Supabase Dashboard (zero install)

1. Open your project → **SQL editor**.
2. For each file in order (0001 → 0005), paste the contents and **Run**.

### Option B — Supabase CLI

```bash
# one-time
brew install supabase/tap/supabase
supabase link --project-ref <your-ref>

# push every migration in order
supabase db push
```

### Option C — psql

```bash
for f in supabase/migrations/*.sql; do
  psql "$DATABASE_URL" -f "$f"
done
```

## Re-running

Every migration is idempotent (`if not exists`, `drop policy if exists`,
`create or replace`). Safe to re-run after edits.

## After the schema

In **Authentication → Providers → Email**, disable "Confirm email" while you
develop. Re-enable for production — the `/auth/callback` route handles the
confirmation hand-off.

## Tables at a glance

```
profiles                — one per auth user (auto-created)
daily_entries           — completion + journal + insight, one per (user, date)
day_notes               — per-domain notes, one per (user, day, domain)
questions               — open + answered research questions
bookmarks               — saved links (unique per user+url)
journal_reactions       — clap/brain/fire/bookmark on public entries
journal_reaction_counts — view, aggregate counts per entry/kind
```
