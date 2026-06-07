# Future Plan: Immersive Onboarding + Timeline Reset

## Context

The app currently has a tour (which fires after sign-in on `/`) but no onboarding flow that explains
the product before the user commits to using it. A new user lands on the dashboard with no context
about what LEF is, what the three domains are, or how to set up their learning schedule. The tour
is a feature walkthrough — not an onboarding experience.

Additionally, the "Course Timeline" settings (start date, duration) are buried in Settings. Changing
them after initial setup does not reset the CourseContext in the current session without a hard reload,
and there is no clear "reschedule" affordance.

---

## 1 — Timeline Reset (fix for current implementation)

**Problem**: When a user saves new `course_start_date` / `course_duration_months` in
`PreferencesForm`, the page doesn't re-fetch from the DB. The `CourseProvider` in `app/layout.tsx`
receives values at request time (server render), so a client-side save doesn't update the context
until the next full navigation.

**Fix**:

- After a successful save in `PreferencesForm`, call `router.refresh()` (Next.js App Router) to
  re-run the server component tree and re-fetch the updated `user_settings`. This re-renders
  `CourseProvider` with the new values without a full page reload.
- Add a brief "Reloading your course..." toast before the refresh.
- `useCourse()` consumers (NavLinks, MobileTabBar, DashboardClient) will all update automatically
  because the context value changes.

---

## 2 — Immersive Onboarding Flow

### What it replaces / supplements

- The current `TourWelcome.tsx` (step 0) is a generic splash. It stays but is preceded by onboarding.
- The tour runs AFTER onboarding completes and the user has configured their setup.

### Flow (screen-by-screen)

**Screen 1 — What is LEF?**
Full-screen modal/page. Animated reveal.

- Headline: "Law. Economics. Finance."
- Subtext: "A founder's curriculum for understanding how power, money, and rules actually work."
- Three domain cards slide in: ⚖️ Law / 📊 Economics / 💰 Finance — each with a one-line description.
- CTA: "Set up my learning path →"

**Screen 2 — Pick your domains**

- Heading: "What do you want to learn?"
- Three toggleable cards (Law, Economics, Finance) — multi-select, minimum 1.
- Each card expands on selection to show 3 bullet-point sample topics.
- "All three" pre-selected by default with an "All three" shortcut button.
- Note: curriculum content is fixed (all 3 are always available) but this primes the user mentally
  and stores their declared intent (new `user_settings.learning_focus text[]` column).
- CTA: "Next →"

**Screen 3 — Set your timeline**

- Heading: "When do you want to start?"
- Date picker: "Start date" (default: today or next Monday)
- Duration selector: same 4–12 month segmented control as in Settings
- Live computed: "Ends [date] · [N] calendar days"
- CTA: "This works for me →"
- Saves `course_start_date` and `course_duration_months` to `user_settings`.

**Screen 4 — Set up reminders**

- Heading: "When should we nudge you?"
- Three preset times (morning / midday / evening) as toggleable chips
- Toggle for daily reminder email on/off
- CTA: "Save and continue →"
- Saves `custom_reminders` and `daily_reminder_enabled`.

**Screen 5 — You're set**

- Celebration moment (confetti burst, same CSS as AchievementModal)
- "Day 1 starts [date]" or "Day 1 is today — let's go."
- Single CTA: "Take the tour →" → marks onboarding complete, triggers existing tour at step 0.
- Or: "Skip tour" → marks both onboarding and tour complete, goes to dashboard.

### Storage

- Onboarding completed: `localStorage('lef_onboarding_done')` + new `user_settings.onboarding_completed boolean` column (so it persists across devices).
- `TourProvider` should check onboarding is done before starting the tour. If onboarding is not done, defer the tour until onboarding completes.

### Where it lives

- New `components/onboarding/OnboardingFlow.tsx` — multi-step modal overlay
- New `components/onboarding/steps/` — one file per screen
- Triggered from `app/layout.tsx` (or a new `OnboardingShell`) after auth, before `TourShell`:
  if user is authed AND `onboarding_completed = false` → show `OnboardingFlow`.

### Migration

```sql
-- 0014_onboarding.sql
alter table user_settings
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists learning_focus text[] default '{}';
```

Existing users: backfill `onboarding_completed = true` so they don't see the onboarding again.

```sql
update user_settings set onboarding_completed = true where created_at < now();
```

---

## Implementation order

1. Fix timeline reset (router.refresh() in PreferencesForm) — 30 min
2. Migration 0014 — 10 min
3. OnboardingFlow scaffold + step components — 2–3 hours
4. Wire into layout.tsx — 30 min
5. Backfill migration for existing users — 10 min
6. Update TourProvider to defer until onboarding done — 15 min
