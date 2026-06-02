# Law · Economics · Finance — LEF OS

A 4-month founder's curriculum in Nigerian and global **Law, Economics, and Finance**,
shipped as a mobile-first, installable PWA. June 1 – September 30, 2026.

- 122 calendar days · 111 study days · 3 domains · 16 weekly reviews
- Public roadmap, public journal, private daily tracker
- Per-day notes, open question stack, bookmarks, public reactions
- Email + in-app + push reminders, custom reminder schedules
- AI study companion (LEF Counsel)
- Markdown / CSV export of your archive
- Command palette (⌘K) and keyboard-first navigation
- Dark editorial design, installable PWA, offline-friendly

## Stack

- **Next.js 15** (App Router, server actions, middleware)
- **Tailwind CSS** with hand-tuned editorial palette
- **Supabase** — Postgres + Auth (email/password & Google) + RLS + RPC
- **next-pwa** — service worker, manifest, install prompt
- **web-push** + **Resend** — push & email reminders
- **Gemini** — AI companion (optional)

## Quick start

```bash
git clone <your-repo> lef-os
cd lef-os
npm install
cp .env.example .env.local      # fill in Supabase + (optional) Resend/Gemini/VAPID
npm run dev
```

Open <http://localhost:3000>.

## Environment

Required:

| Var                             | Purpose              |
| ------------------------------- | -------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key    |

Optional (server-side features):

| Var                            | Powers                                       |
| ------------------------------ | -------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`    | Cron job daily reminder (server-only)        |
| `RESEND_API_KEY`               | Email reminders                              |
| `CRON_SECRET`                  | Auth header for `/api/cron/*` endpoints      |
| `NEXT_PUBLIC_SITE_URL`         | Override origin (e.g. for non-default ports) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web push subscription                        |
| `VAPID_PRIVATE_KEY`            | Web push signing                             |
| `GEMINI_API_KEY`               | LEF Counsel AI companion                     |

## Supabase

See [`supabase/README.md`](supabase/README.md) for the full migration set and how to
apply it. Seven numbered SQL files cover everything from `profiles` through
`custom_reminders` and push subscriptions.

```bash
# CLI (recommended)
npm run db:push

# or paste each file in the dashboard SQL editor, in order:
ls supabase/migrations
```

## Scripts

```bash
npm run dev          # local dev (PWA disabled)
npm run build        # production build (with service worker)
npm run start        # serve production build
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run lint:fix     # next lint --fix
npm run format       # prettier write
npm run format:check # prettier check (CI)
npm run check        # typecheck + lint + format:check
npm run icons        # regenerate PWA placeholder icons
npm run db:push      # supabase db push (requires `supabase link`)
```

## Routes

| Path                | Auth   | What                                              |
| ------------------- | ------ | ------------------------------------------------- |
| `/`                 | public | Landing                                           |
| `/roadmap`          | public | 4-month / 3-domain curriculum browser             |
| `/day/[n]`          | mixed  | Any day's topics, your notes, log form, prev/next |
| `/today`            | mixed  | Redirects to `/day/<current>`                     |
| `/journal`          | public | Public insights · search · reactions · pagination |
| `/u/[username]`     | public | Public profile + stats + public stream            |
| `/dashboard`        | auth   | Today's log, streak, heatmap, recent entries      |
| `/stats`            | auth   | Full stats snapshot (server RPC)                  |
| `/settings`         | auth   | Display name, username, bio, reminders, push      |
| `/export`           | auth   | Download Markdown or CSV bundle                   |
| `/login`, `/signup` | public | Email/password (`?next=` supported)               |
| `/auth/callback`    | —      | OAuth / email-confirm handoff                     |

## Architecture notes

- **Server actions** under `app/actions/*` mediate every write. They validate,
  enforce ownership, and call `revalidatePath` for the affected routes.
- **Middleware** refreshes the Supabase session on every request and gates
  protected paths (redirects to `/login?next=…`).
- **Strong typing** — `lib/database.types.ts` mirrors the migrations and is
  threaded through the Supabase client as a generic.
- **Toast + Command Palette** are wired into the root layout
  (`ToastProvider`, `CommandPaletteProvider`) — accessible from any client
  component via hooks.
- **Per-day notes & questions** live on `/day/[n]` and autosave via server actions.
- **Reactions** (clap / brain / fire / bookmark) are powered by an aggregate
  view (`journal_reaction_counts`) — one query per page, optimistic UI.

## Design

Dark editorial. Playfair Display for headings, DM Sans for body. Domain accents:

- Law — gold `#C8A96E`
- Economics — sage `#7C9E8F`
- Finance — slate blue `#8B9ECC`
- Synthesis / alerts — red `#C86E6E`

Surfaces stay close to true black with a fixed subtle grain texture and a faint
gold/blue radial wash. No rounded corners larger than 10px. No purple gradients.

## Deploy

1. Push to GitHub.
2. Import the repo on Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (plus any
   optional ones you want).
4. In Supabase, add your deployed origin under **Authentication → URL
   Configuration → Site URL** and **Redirect URLs**.
5. Deploy. The PWA service worker is auto-wired in production builds.

## License

Personal project. Curriculum content © its author; code MIT.
