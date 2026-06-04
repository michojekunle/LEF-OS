import { describe, it, expect } from 'vitest';
import {
  calculateLocalHour,
  matchCustomReminders,
  shouldSendReminder,
  type CustomReminder,
} from '../lib/reminders';

describe('cron and alert scheduling business logic', () => {
  it('calculateLocalHour handles timezone hour extraction', () => {
    // 2026-06-04 at 18:00:00 UTC
    const d = new Date('2026-06-04T18:00:00Z');

    // Africa/Lagos (West Africa Time, UTC+1) -> should be 19
    expect(calculateLocalHour(d, 'Africa/Lagos')).toBe(19);

    // Europe/London (British Summer Time in June, UTC+1) -> should be 19
    expect(calculateLocalHour(d, 'Europe/London')).toBe(19);

    // UTC -> should be 18
    expect(calculateLocalHour(d, 'UTC')).toBe(18);

    // Fallback on invalid timezone -> UTC -> should be 18
    expect(calculateLocalHour(d, 'Invalid/Timezone_Name')).toBe(18);
  });

  it('matchCustomReminders filters matching hours correctly', () => {
    const reminders: CustomReminder[] = [
      { reminder_time: '08:00:00', enabled: true, delivery_type: 'email' },
      { reminder_time: '18:00:00', enabled: true, delivery_type: 'in_app' },
      { reminder_time: '19:30:00', enabled: true, delivery_type: 'both' },
    ];

    const hour18Matches = matchCustomReminders(reminders, 18);
    expect(hour18Matches.length).toBe(1);
    expect(hour18Matches[0].reminder_time).toBe('18:00:00');
    expect(hour18Matches[0].delivery_type).toBe('in_app');

    const hour8Matches = matchCustomReminders(reminders, 8);
    expect(hour8Matches.length).toBe(1);
    expect(hour8Matches[0].reminder_time).toBe('08:00:00');

    const hour19Matches = matchCustomReminders(reminders, 19);
    expect(hour19Matches.length).toBe(1);
    expect(hour19Matches[0].reminder_time).toBe('19:30:00'); // Splits by colon, parses '19'

    const hour12Matches = matchCustomReminders(reminders, 12);
    expect(hour12Matches.length).toBe(0);
  });

  it('shouldSendReminder evaluates reminder triggers properly', () => {
    // If today is completed, never send reminders
    expect(shouldSendReminder({ todayComplete: true, matchingRemindersCount: 1 })).toBe(false);
    expect(shouldSendReminder({ todayComplete: true, matchingRemindersCount: 0 })).toBe(false);

    // If today is not completed, send only if there are matching reminders
    expect(shouldSendReminder({ todayComplete: false, matchingRemindersCount: 2 })).toBe(true);
    expect(shouldSendReminder({ todayComplete: false, matchingRemindersCount: 0 })).toBe(false);
  });
});
