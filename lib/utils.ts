import { CURRICULUM, findDayMeta, TOTAL_CALENDAR_DAYS, type Domain } from '@/data/curriculum-data';
import type { DailyEntry } from './database.types';

export type { DailyEntry };

// ── Course window ─────────────────────────────────────────────────────────────
// The default cohort runs June 1 – Sep 30, 2026 (4 months / 122 calendar days).
// Users can override start date and duration (4–12 months) in Settings.
// All date utilities accept an optional CourseWindow so server components can
// pass user-specific values; call sites that pass nothing get the global default.

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const DEFAULT_COURSE_START = new Date(Date.UTC(2026, 5, 1)); // June 1, 2026
export const DEFAULT_DURATION_MONTHS = 4;

export type CourseWindow = {
  start: Date;
  end: Date;
  totalDays: number;
};

/** Build a course window from a start date + duration in months (clamped 4–12). */
export function getCourseWindow(
  startDate?: Date | string | null,
  durationMonths?: number | null,
): CourseWindow {
  const start = startDate
    ? typeof startDate === 'string'
      ? new Date(startDate)
      : startDate
    : DEFAULT_COURSE_START;

  const months = Math.min(Math.max(durationMonths ?? DEFAULT_DURATION_MONTHS, 4), 12);

  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + months);
  end.setUTCDate(end.getUTCDate() - 1); // inclusive last day

  const totalDays = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  return { start, end, totalDays };
}

// Singleton default window — used when no user override is provided.
// Evaluated lazily to avoid module-level side effects in edge runtimes.
let _defaultWindow: CourseWindow | null = null;
function defaultWindow(): CourseWindow {
  if (!_defaultWindow) _defaultWindow = getCourseWindow();
  return _defaultWindow;
}

/** Fixed number of curriculum content days — always 111 regardless of timeline. */
export const TOTAL_CURRICULUM_DAYS = 111;

/**
 * Maps a calendar day number (1…course.totalDays) to a curriculum topic day (1…111).
 *
 * When the course window is longer than 111 days, topics are spread evenly so
 * the user studies at a slower pace — e.g. a 244-day (8-month) window spaces
 * one new topic every ~2.2 calendar days.
 *
 * When the window is ≤111 days, it's a 1:1 mapping (original 4-month behaviour).
 */
export function toCurriculumDay(calendarDay: number, totalCalendarDays: number): number {
  if (totalCalendarDays <= TOTAL_CURRICULUM_DAYS) {
    return Math.min(calendarDay, TOTAL_CURRICULUM_DAYS);
  }
  return Math.min(
    Math.floor(((calendarDay - 1) * TOTAL_CURRICULUM_DAYS) / totalCalendarDays) + 1,
    TOTAL_CURRICULUM_DAYS,
  );
}

export function toUTCDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function getDayNumber(date: Date = new Date(), window?: CourseWindow): number {
  const w = window ?? defaultWindow();
  const utc = toUTCDateOnly(date);
  const diff = utc.getTime() - w.start.getTime();
  return Math.floor(diff / MS_PER_DAY) + 1;
}

export function isBeforeCourse(date: Date = new Date(), window?: CourseWindow): boolean {
  return getDayNumber(date, window) < 1;
}

export function isAfterCourse(date: Date = new Date(), window?: CourseWindow): boolean {
  return getDayNumber(date, window) > (window ?? defaultWindow()).totalDays;
}

export function isInCourse(date: Date = new Date(), window?: CourseWindow): boolean {
  const n = getDayNumber(date, window);
  return n >= 1 && n <= (window ?? defaultWindow()).totalDays;
}

/**
 * Compute a human-readable date range for a curriculum phase (e.g. Month 1: days 1–28)
 * relative to the user's actual course start date and total calendar days.
 *
 * The curriculum has 4 fixed phases. When the user's timeline is longer than 4 months
 * the phases are spread proportionally across the calendar window.
 */
export function getPhaseCalendarRange(
  phaseStartDay: number,
  phaseEndDay: number,
  courseStart: Date,
  totalCalendarDays: number,
): string {
  // Map curriculum day → calendar offset using the same proportional spread as toCurriculumDay
  const startOffset =
    totalCalendarDays <= TOTAL_CURRICULUM_DAYS
      ? phaseStartDay - 1
      : Math.round(((phaseStartDay - 1) * totalCalendarDays) / TOTAL_CURRICULUM_DAYS);

  const endOffset =
    totalCalendarDays <= TOTAL_CURRICULUM_DAYS
      ? phaseEndDay - 1
      : Math.round((phaseEndDay * totalCalendarDays) / TOTAL_CURRICULUM_DAYS) - 1;

  const start = new Date(courseStart);
  start.setUTCDate(start.getUTCDate() + startOffset);

  const end = new Date(courseStart);
  end.setUTCDate(end.getUTCDate() + endOffset);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return `${fmt(start)} – ${fmt(end)}`;
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

export function dateFromDayNumber(day: number, window?: CourseWindow): Date {
  const start = window ? window.start : DEFAULT_COURSE_START;
  return new Date(start.getTime() + (day - 1) * MS_PER_DAY);
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

export function totalThursdays(window?: CourseWindow): number {
  const w = window ?? defaultWindow();
  let count = 0;
  for (let i = 0; i < w.totalDays; i++) {
    const d = new Date(w.start.getTime() + i * MS_PER_DAY);
    if (d.getUTCDay() === 4) count++;
  }
  return count;
}

export function getAllThursdays(window?: CourseWindow): { day: number; date: Date }[] {
  const w = window ?? defaultWindow();
  const out: { day: number; date: Date }[] = [];
  for (let i = 0; i < w.totalDays; i++) {
    const d = new Date(w.start.getTime() + i * MS_PER_DAY);
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

export { CURRICULUM, MS_PER_DAY };
