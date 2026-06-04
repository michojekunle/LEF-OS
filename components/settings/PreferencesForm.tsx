'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

type Props = {
  userId: string;
  initialReminderEnabled: boolean;
  initialTimezone: string;
};

const TIMEZONES = [
  { value: 'Africa/Lagos', label: 'Lagos (West Africa Time - UTC+1)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Europe/London', label: 'London (GMT/BST - UTC+0/+1)' },
  { value: 'America/New_York', label: 'New York (EST/EDT - UTC-5/-4)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT - UTC-8/-7)' },
  { value: 'Asia/Dubai', label: 'Dubai (Gulf Standard Time - UTC+4)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT - UTC+8)' },
];

export function PreferencesForm({ userId, initialReminderEnabled, initialTimezone }: Props) {
  const toast = useToast();
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(initialReminderEnabled);
  const [timezone, setTimezone] = useState(initialTimezone);

  async function handleSaveSettings() {
    try {
      const sb = supabaseBrowser();
      const { error } = await sb
        .from('user_settings')
        .update({
          daily_reminder_enabled: dailyReminderEnabled,
          timezone: timezone,
        })
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('Preferences saved successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings.');
    }
  }

  return (
    <section className="card space-y-5 p-6">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
        <Bell size={14} className="text-gold" />
        General Preferences
      </h2>

      <div className="space-y-4">
        <label className="flex cursor-pointer select-none items-start gap-3">
          <input
            type="checkbox"
            checked={dailyReminderEnabled}
            onChange={(e) => setDailyReminderEnabled(e.target.checked)}
            className="mt-1 rounded border-border accent-gold"
          />
          <div>
            <span className="text-sm font-medium text-text-primary">Enable daily reminders</span>
            <p className="mt-0.5 text-xs text-text-secondary">
              Receive accountability emails and logs reminders matching your curriculum track.
            </p>
          </div>
        </label>

        <div className="space-y-1.5">
          <label
            htmlFor="timezone"
            className="block text-xs uppercase tracking-[0.18em] text-text-secondary"
          >
            Timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="select max-w-md"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={handleSaveSettings} className="btn btn-primary px-4 py-2 text-xs">
        Save Preferences
      </button>
    </section>
  );
}
