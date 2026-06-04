import { CURRICULUM, findDayMeta, TOTAL_CALENDAR_DAYS, type Domain } from '@/data/curriculum-data';
import type { DailyEntry } from './database.types';

export type { DailyEntry };

// Course window — Jun 1, 2026 (00:00 local) to Sep 30, 2026 inclusive.
// Use UTC date math to be deterministic across timezones; treat dates as date-only.
const START_DATE = new Date(Date.UTC(2026, 5, 1)); // June is month index 5
const END_DATE = new Date(Date.UTC(2026, 8, 30)); // September 30
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function toUTCDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function getDayNumber(date: Date = new Date()): number {
  const utc = toUTCDateOnly(date);
  const diff = utc.getTime() - START_DATE.getTime();
  return Math.floor(diff / MS_PER_DAY) + 1;
}

export function isBeforeCourse(date: Date = new Date()): boolean {
  return getDayNumber(date) < 1;
}

export function isAfterCourse(date: Date = new Date()): boolean {
  return getDayNumber(date) > TOTAL_CALENDAR_DAYS;
}

export function isInCourse(date: Date = new Date()): boolean {
  const n = getDayNumber(date);
  return n >= 1 && n <= TOTAL_CALENDAR_DAYS;
}

export function getMonthForDay(day: number): 1 | 2 | 3 | 4 {
  if (day <= 28) return 1;
  if (day <= 56) return 2;
  if (day <= 84) return 3;
  return 4;
}

export function getTodayTopics(day: number): {
  law: string | null;
  economics: string | null;
  finance: string | null;
} {
  return {
    law: findDayMeta('law', day)?.topic ?? null,
    economics: findDayMeta('economics', day)?.topic ?? null,
    finance: findDayMeta('finance', day)?.topic ?? null,
  };
}

export function isThursday(date: Date = new Date()): boolean {
  return date.getDay() === 4;
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', opts ?? { year: 'numeric', month: 'short', day: '2-digit' });
}

export function isoDate(date: Date = new Date()): string {
  const u = toUTCDateOnly(date);
  return u.toISOString().slice(0, 10);
}

export function dateFromDayNumber(day: number): Date {
  return new Date(START_DATE.getTime() + (day - 1) * MS_PER_DAY);
}

/**
 * Returns true if at least one domain was completed on this entry.
 * Single source of truth for the "any domain done" predicate.
 */
export function isEntryComplete(
  e: Pick<DailyEntry, 'law_completed' | 'economics_completed' | 'finance_completed'>,
): boolean {
  return e.law_completed || e.economics_completed || e.finance_completed;
}

export function getOverallProgress(entries: DailyEntry[]): number {
  return entries.filter(isEntryComplete).length;
}

/** Month day-number boundaries for the 4-month curriculum. */
export const MONTH_BOUNDARIES = [
  { month: 1 as const, start: 1, end: 28 },
  { month: 2 as const, start: 29, end: 56 },
  { month: 3 as const, start: 57, end: 84 },
  { month: 4 as const, start: 85, end: TOTAL_CALENDAR_DAYS },
] as const;

export function getDomainProgress(entries: DailyEntry[], domain: Domain): number {
  const key =
    domain === 'law'
      ? 'law_completed'
      : domain === 'economics'
        ? 'economics_completed'
        : 'finance_completed';
  return entries.filter((e) => e[key]).length;
}

export function getCurrentStreak(entries: DailyEntry[], today: Date = new Date()): number {
  if (entries.length === 0) return 0;
  const byDate = new Map<string, DailyEntry>();
  for (const e of entries) {
    if (isEntryComplete(e)) {
      byDate.set(e.entry_date, e);
    }
  }
  let streak = 0;
  const cursor = toUTCDateOnly(today);
  // If today not logged, allow yesterday to still count as the current streak base.
  if (!byDate.has(isoDate(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (byDate.has(isoDate(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/**
 * Calculates the longest consecutive study streak across all logged entries.
 * Extracted from StatsClient so it can be tested and reused.
 */
export function getLongestStreak(entries: DailyEntry[]): number {
  if (entries.length === 0) return 0;
  const loggedDates = new Set(entries.filter(isEntryComplete).map((e) => e.entry_date));
  if (loggedDates.size === 0) return 0;

  const dates = Array.from(loggedDates).sort();
  let longest = 0;
  let current = 0;
  let prevDate: Date | null = null;

  for (const dateStr of dates) {
    const currentDate = new Date(dateStr + 'T00:00:00Z');
    if (!prevDate) {
      current = 1;
    } else {
      const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / MS_PER_DAY);
      if (diffDays === 1) {
        current++;
      } else if (diffDays > 1) {
        longest = Math.max(longest, current);
        current = 1;
      }
    }
    prevDate = currentDate;
  }
  return Math.max(longest, current);
}

export function totalThursdays(): number {
  let count = 0;
  for (let i = 0; i < TOTAL_CALENDAR_DAYS; i++) {
    const d = new Date(START_DATE.getTime() + i * MS_PER_DAY);
    if (d.getUTCDay() === 4) count++;
  }
  return count;
}

export function getAllThursdays(): { day: number; date: Date }[] {
  const out: { day: number; date: Date }[] = [];
  for (let i = 0; i < TOTAL_CALENDAR_DAYS; i++) {
    const d = new Date(START_DATE.getTime() + i * MS_PER_DAY);
    if (d.getUTCDay() === 4) out.push({ day: i + 1, date: d });
  }
  return out;
}

export function clampDay(day: number): number {
  return Math.max(1, Math.min(TOTAL_CALENDAR_DAYS, day));
}

export type DayStatus = 'none' | 'partial' | 'full';

export function statusForEntry(entry: DailyEntry | undefined): DayStatus {
  if (!entry) return 'none';
  const count =
    (entry.law_completed ? 1 : 0) +
    (entry.economics_completed ? 1 : 0) +
    (entry.finance_completed ? 1 : 0);
  if (count === 0) return 'none';
  if (count === 3) return 'full';
  return 'partial';
}

export { CURRICULUM, START_DATE, END_DATE, MS_PER_DAY };
