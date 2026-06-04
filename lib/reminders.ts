/**
 * SOLID helpers for Cron and Alert scheduling business logic.
 * Decouples timezone formatting, trigger conditions, and scheduling checks.
 */

export interface CustomReminder {
  reminder_time: string;
  enabled: boolean;
  delivery_type: 'email' | 'in_app' | 'both';
  title?: string | null;
}

export function calculateLocalHour(date: Date, timezone: string): number {
  let localHourStr = '';
  try {
    localHourStr = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      hour12: false,
      timeZone: timezone,
    }).format(date);
  } catch {
    // Fallback to UTC if timezone is invalid
    localHourStr = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }).format(date);
  }
  return parseInt(localHourStr, 10);
}

export function matchCustomReminders<T extends CustomReminder>(
  reminders: T[],
  localHour: number,
): T[] {
  return (reminders || []).filter((r) => {
    if (!r.reminder_time) return false;
    const reminderHour = parseInt(r.reminder_time.split(':')[0], 10);
    return reminderHour === localHour;
  });
}

export function shouldSendReminder(params: {
  todayComplete: boolean;
  matchingRemindersCount: number;
}): boolean {
  if (params.todayComplete) return false;
  return params.matchingRemindersCount > 0;
}
