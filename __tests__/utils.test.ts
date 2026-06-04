import { describe, it, expect } from 'vitest';
import {
  toUTCDateOnly,
  getDayNumber,
  clampDay,
  getOverallProgress,
  getDomainProgress,
  getCurrentStreak,
  getLongestStreak,
  isEntryComplete,
  isoDate,
  type DailyEntry,
} from '../lib/utils';

// Cast helper to bypass DB nullable requirement details for testing purposes
function makeEntry(fields: Partial<DailyEntry>): DailyEntry {
  return {
    id: 'test-id',
    user_id: 'user-id',
    entry_date: '2026-06-01',
    day_number: 1,
    law_completed: false,
    economics_completed: false,
    finance_completed: false,
    study_rating: null,
    journal_text: null,
    share_insight: null,
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...fields,
  };
}

describe('utils math and date helpers', () => {
  it('toUTCDateOnly sets time to midnight UTC', () => {
    const d = new Date('2026-06-04T12:34:56Z');
    const utc = toUTCDateOnly(d);
    expect(utc.getUTCHours()).toBe(0);
    expect(utc.getUTCMinutes()).toBe(0);
    expect(utc.getUTCSeconds()).toBe(0);
    expect(utc.getUTCMilliseconds()).toBe(0);
    expect(utc.getUTCDate()).toBe(4);
    expect(utc.getUTCMonth()).toBe(5); // June (0-indexed index 5)
    expect(utc.getUTCFullYear()).toBe(2026);
  });

  it('isoDate formats Date to YYYY-MM-DD in UTC timezone context', () => {
    const d = new Date('2026-06-04T18:14:32Z');
    expect(isoDate(d)).toBe('2026-06-04');
  });

  it('getDayNumber calculates correct day index from course start', () => {
    // Course starts on June 1, 2026 (Day 1)
    const start = new Date(Date.UTC(2026, 5, 1, 10, 0, 0));
    expect(getDayNumber(start)).toBe(1);

    const day10 = new Date(Date.UTC(2026, 5, 10, 22, 0, 0));
    expect(getDayNumber(day10)).toBe(10);
  });

  it('clampDay keeps day within boundaries [1, 122]', () => {
    expect(clampDay(0)).toBe(1);
    expect(clampDay(50)).toBe(50);
    expect(clampDay(200)).toBe(122);
  });

  it('isEntryComplete returns true when any domain is completed', () => {
    expect(isEntryComplete(makeEntry({ law_completed: true }))).toBe(true);
    expect(isEntryComplete(makeEntry({ economics_completed: true }))).toBe(true);
    expect(isEntryComplete(makeEntry({ finance_completed: true }))).toBe(true);
    expect(
      isEntryComplete(
        makeEntry({ law_completed: false, economics_completed: false, finance_completed: false }),
      ),
    ).toBe(false);
    expect(
      isEntryComplete(
        makeEntry({ law_completed: true, economics_completed: true, finance_completed: true }),
      ),
    ).toBe(true);
  });

  it('getOverallProgress counts entries with at least one domain complete', () => {
    const entries = [
      makeEntry({ law_completed: true }),
      makeEntry({ economics_completed: true, finance_completed: true }),
      makeEntry({ law_completed: false, economics_completed: false, finance_completed: false }),
    ];
    expect(getOverallProgress(entries)).toBe(2);
  });

  it('getDomainProgress counts specific completions correctly', () => {
    const entries = [
      makeEntry({ law_completed: true, economics_completed: false }),
      makeEntry({ law_completed: true, economics_completed: true }),
      makeEntry({ law_completed: false, economics_completed: false }),
    ];
    expect(getDomainProgress(entries, 'law')).toBe(2);
    expect(getDomainProgress(entries, 'economics')).toBe(1);
    expect(getDomainProgress(entries, 'finance')).toBe(0);
  });

  it('getCurrentStreak calculates streak math accurately', () => {
    const today = new Date(Date.UTC(2026, 5, 5));

    expect(getCurrentStreak([], today)).toBe(0);

    const entriesA = [
      makeEntry({ entry_date: '2026-06-05', law_completed: true }),
      makeEntry({ entry_date: '2026-06-04', economics_completed: true }),
      makeEntry({ entry_date: '2026-06-03', finance_completed: true }),
    ];
    expect(getCurrentStreak(entriesA, today)).toBe(3);

    const entriesB = [
      makeEntry({ entry_date: '2026-06-04', economics_completed: true }),
      makeEntry({ entry_date: '2026-06-03', finance_completed: true }),
    ];
    expect(getCurrentStreak(entriesB, today)).toBe(2);

    const entriesC = [
      makeEntry({ entry_date: '2026-06-05', law_completed: true }),
      makeEntry({ entry_date: '2026-06-03', economics_completed: true }),
    ];
    expect(getCurrentStreak(entriesC, today)).toBe(1);
  });

  it('getLongestStreak calculates the best consecutive run', () => {
    expect(getLongestStreak([])).toBe(0);

    const entries = [
      makeEntry({ entry_date: '2026-06-01', law_completed: true }),
      makeEntry({ entry_date: '2026-06-02', economics_completed: true }),
      makeEntry({ entry_date: '2026-06-03', finance_completed: true }),
      makeEntry({ entry_date: '2026-06-05', law_completed: true }), // gap here
      makeEntry({ entry_date: '2026-06-06', law_completed: true }),
    ];
    expect(getLongestStreak(entries)).toBe(3); // Jun 1–3 is the longest

    expect(getLongestStreak([makeEntry({ law_completed: true })])).toBe(1);
    expect(getLongestStreak([makeEntry({}), makeEntry({})])).toBe(0);
  });
});
