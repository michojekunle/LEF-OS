import type { DailyEntry } from './database.types';

export type AchievementType =
  | 'perfect_day'
  | 'full_notes_day'
  | 'quiz_complete'
  | 'perfect_week'
  | 'week_complete'
  | 'streak';

export type Achievement = {
  type: AchievementType;
  day?: number;
  streak?: number;
};

const SEEN_KEY = 'lef_achievements_seen';

function seenKey(type: AchievementType, day?: number, streak?: number): string {
  return `${type}:${day ?? ''}:${streak ?? ''}`;
}

function markSeen(key: string): void {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as string[];
    if (!seen.includes(key)) {
      seen.push(key);
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    }
  } catch {
    // ignore
  }
}

function hasSeen(key: string): boolean {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as string[];
    return seen.includes(key);
  } catch {
    return false;
  }
}

/** Check after a daily log save. Returns any newly earned achievements. */
export function checkDailyAchievements(
  entry: DailyEntry,
  allEntries: DailyEntry[],
  weekDayNumbers: number[],
): Achievement[] {
  const results: Achievement[] = [];
  const day = entry.day_number;

  // Perfect Day — all 3 domains completed
  if (entry.law_completed && entry.economics_completed && entry.finance_completed) {
    const k = seenKey('perfect_day', day);
    if (!hasSeen(k)) {
      results.push({ type: 'perfect_day', day });
      markSeen(k);
    }
  }

  // Perfect Week — all days in the week have all 3 domains
  if (weekDayNumbers.length > 0) {
    const byDay = new Map(allEntries.map((e) => [e.day_number, e]));
    const weekPerfect = weekDayNumbers.every((d) => {
      const e = byDay.get(d);
      return e && e.law_completed && e.economics_completed && e.finance_completed;
    });
    if (weekPerfect) {
      const k = seenKey('perfect_week', weekDayNumbers[0]);
      if (!hasSeen(k)) {
        results.push({ type: 'perfect_week', day: weekDayNumbers[0] });
        markSeen(k);
      }
    }

    // Week Complete — all days in the week have at least one domain
    const weekDone = weekDayNumbers.every((d) => {
      const e = byDay.get(d);
      return e && (e.law_completed || e.economics_completed || e.finance_completed);
    });
    if (weekDone) {
      const k = seenKey('week_complete', weekDayNumbers[0]);
      if (!hasSeen(k)) {
        results.push({ type: 'week_complete', day: weekDayNumbers[0] });
        markSeen(k);
      }
    }
  }

  return results;
}

/** Check after a notes save. Returns newly earned achievements. */
export function checkNotesAchievement(
  day: number,
  lawBody: string,
  econBody: string,
  finBody: string,
): Achievement[] {
  const allFilled =
    lawBody.trim().length > 0 && econBody.trim().length > 0 && finBody.trim().length > 0;
  if (!allFilled) return [];
  const k = seenKey('full_notes_day', day);
  if (hasSeen(k)) return [];
  markSeen(k);
  return [{ type: 'full_notes_day', day }];
}

/**
 * Check after a quiz is detected. Returns the achievement object every time
 * (no localStorage dedup) — every quiz attempt is worth celebrating, and the
 * AI conversation already provides its own "you've taken this quiz" continuity.
 *
 * The `day` arg is still recorded in the result so the achievement card can
 * render the correct day number, but it isn't used as a uniqueness key.
 */
export function checkQuizAchievement(day: number): Achievement[] {
  // Use sessionStorage to throttle to one fire per browser session per day —
  // prevents the modal stacking if Gemini accidentally re-sends a quiz format
  // in the same conversation, but resets on tab close so users can re-experience
  // the celebration in a new session.
  if (typeof window !== 'undefined') {
    try {
      const sessionKey = `lef_quiz_seen_session:${Number.isFinite(day) ? day : 'unknown'}`;
      if (sessionStorage.getItem(sessionKey)) return [];
      sessionStorage.setItem(sessionKey, '1');
    } catch {
      // sessionStorage blocked (private mode in some browsers) → just fire
    }
  }
  return [{ type: 'quiz_complete', day }];
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90];

/** Check streak milestones after a save. */
export function checkStreakAchievement(streak: number): Achievement[] {
  if (!STREAK_MILESTONES.includes(streak)) return [];
  const k = seenKey('streak', undefined, streak);
  if (hasSeen(k)) return [];
  markSeen(k);
  return [{ type: 'streak', streak }];
}
