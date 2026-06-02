# Law · Economics · Finance — LEF OS

A 4-month founder's curriculum in Nigerian and global **Law, Economics, and Finance**, June 1 – September 30, 2026. A production-grade mobile-first **PWA** for daily study tracking and learning in public.

- 122 calendar days · 111 study days · 3 domains · 16 weekly reviews
- Public curriculum browser (no login)
- Private dashboard with streaks, calendar heatmap, per-domain progress
- Public journal of shared insights
- Installable PWA, dark editorial design

## Stack

- **Next.js 15** (App Router) — `app/` directory, RSC + client components
- **Tailwind CSS** with custom CSS variables for the editorial palette
- **Supabase** — Postgres + Auth (email/password), Row Level Security
- **next-pwa** — service worker, offline support, install prompt
- **Google Fonts** — Playfair Display (display) + DM Sans (body)
- **Lucide React** — icons

## Setup

```bash
git clone https://github.come/michojekunle/lef-os
cd lef-os
npm install
cp .env.example .env.local
# fill in environment variables
npm run dev
```

Open <http://localhost:3000>.

### Supabase setup

1. Create a project at <https://supabase.com>.
2. Copy the **Project URL** and **anon public** key into `.env.local`.
3. In the SQL editor, run the schema below.
4. (Optional) under **Authentication → Providers → Email**, disable email confirmation while you're developing.

```sql
-- profiles
create table if not exists profiles (
  id uuid references auth.users primary key,
  username text unique,
  display_name text,
  avatar_url text,
  is_primary_user boolean default false,
  created_at timestamptz default now()
);

-- daily_entries
create table if not exists daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  entry_date date not null,
  day_number integer not null,
  law_completed boolean default false,
  economics_completed boolean default false,
  finance_completed boolean default false,
  study_rating integer check (study_rating between 1 and 5),
  journal_text text,
  share_insight text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, entry_date)
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row-Level Security
alter table profiles enable row level security;
alter table daily_entries enable row level security;

create policy "Public profiles are viewable"
  on profiles for select using (true);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Public entries viewable"
  on daily_entries for select
  using (is_public = true or auth.uid() = user_id);
create policy "Users can insert own entries"
  on daily_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own entries"
  on daily_entries for update using (auth.uid() = user_id);
create policy "Users can delete own entries"
  on daily_entries for delete using (auth.uid() = user_id);
```

## Scripts

```bash
npm run dev        # local dev (PWA disabled)
npm run build      # production build (with service worker)
npm run start      # serve production build
npm run typecheck  # tsc --noEmit
npm run icons      # regenerate placeholder PWA icons
```

## Project structure

```
app/
  page.tsx              # landing
  roadmap/              # public 122-day curriculum browser
  dashboard/            # authenticated daily tracker
  journal/              # public shared entries
  login/, signup/, auth/AuthForm.tsx
  layout.tsx, globals.css
components/
  curriculum-data.ts    # SINGLE SOURCE OF TRUTH for all 111 study days
  DayCard, DomainBadge, ProgressBar, CalendarHeatmap,
  WeekAccordion, DailyLogForm, EntryCard,
  Nav, Footer, MobileTabBar, SignOutButton
lib/
  supabase.ts           # browser + server clients
  utils.ts              # date math, streak, progress helpers
public/
  manifest.json, icon-192.png, icon-512.png
scripts/
  generate-icons.mjs    # placeholder PWA icon generator (zero deps)
```

## Deploy to Vercel

1. Push to GitHub.
2. In Vercel, import the repo.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` env vars.
4. Deploy. The PWA service worker is automatically wired in production builds.

## Curriculum

The full curriculum lives in [`components/curriculum-data.ts`](components/curriculum-data.ts). To tune a day's topic, edit it there — every page reads from that one source of truth.

- Month 1 · June · Foundations & Frameworks · Days 1–28
- Month 2 · July · Intermediate Depth & Nigerian Context · Days 29–56
- Month 3 · August · Advanced Mastery & Global Depth · Days 57–84
- Month 4 · September · Integration, Application & Teaching · Days 85–111
- Days 112–122 · integration & public-sharing buffer (calendar slack)

## Design

Dark editorial. Playfair Display for headings, DM Sans for body. Domain accents:

- Law — gold `#C8A96E`
- Economics — sage `#7C9E8F`
- Finance — slate blue `#8B9ECC`
- Synthesis / alerts — red `#C86E6E`

Surfaces stay close to true black with a fixed subtle grain texture and a faint gold/blue radial wash. No rounded corners larger than 10px. No purple gradients.

## License

Personal project. Curriculum content © its author; code MIT.
