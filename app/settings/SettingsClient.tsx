'use client';

import Link from 'next/link';
import { User, Download } from 'lucide-react';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { PreferencesForm } from '@/components/settings/PreferencesForm';
import { RemindersList } from '@/components/settings/RemindersList';
import { DeviceRegistration } from '@/components/settings/DeviceRegistration';

type CustomReminder = {
  id: string;
  title: string;
  reminder_time: string;
  delivery_type: 'email' | 'in_app' | 'both';
  enabled: boolean;
};

type Props = {
  userId: string;
  email: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  defaultPublic: boolean;
  initialSettings: {
    daily_reminder_enabled: boolean;
    timezone: string;
    course_start_date?: string | null;
    course_duration_months?: number | null;
    preferred_domains?: string[] | null;
  };
  initialReminders: CustomReminder[];
  hasActivePush: boolean;
};

export function SettingsClient({
  userId,
  username,
  displayName,
  bio,
  defaultPublic,
  initialSettings,
  initialReminders,
  hasActivePush,
}: Props) {
  return (
    <div className="mx-auto max-w-content animate-fade-in space-y-8 px-5 py-8 md:px-6">
      <header>
        <p className="mb-1 text-xs uppercase tracking-[0.32em] text-text-secondary">
          Account & Preferences
        </p>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">Settings</h1>
        <p className="mt-1 max-w-md text-sm text-text-secondary">
          Configure notifications, custom reminders, and synchronize device parameters.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT COLUMN: GLOBAL PREFERENCES */}
        <div className="space-y-6 md:col-span-2">
          {/* PROFILE SETTINGS FORM */}
          <ProfileForm
            username={username}
            displayName={displayName}
            bio={bio}
            defaultPublic={defaultPublic}
          />

          {/* GENERAL NOTIFICATION SETTINGS */}
          <PreferencesForm
            userId={userId}
            initialReminderEnabled={initialSettings.daily_reminder_enabled}
            initialTimezone={initialSettings.timezone}
            initialCourseStartDate={initialSettings.course_start_date}
            initialCourseDurationMonths={initialSettings.course_duration_months}
            initialPreferredDomains={initialSettings.preferred_domains}
          />

          {/* CUSTOM REMINDERS CONFIG */}
          <RemindersList userId={userId} initialReminders={initialReminders} />
        </div>

        {/* RIGHT COLUMN: PWA DEVICE SPECIFICS */}
        <div className="space-y-6">
          <DeviceRegistration userId={userId} initialHasActivePush={hasActivePush} />

          <section className="card space-y-5 p-6">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
              <User size={14} className="text-gold" />
              Account Actions
            </h2>
            <div className="flex flex-col gap-3">
              {username ? (
                <Link
                  href={`/u/${username}`}
                  className="btn btn-secondary flex w-full items-center justify-center gap-1.5 py-2 text-xs"
                >
                  <User size={13} /> View Public Profile
                </Link>
              ) : (
                <div className="text-center text-xs text-text-secondary">
                  Set a username in your profile to enable public links.
                </div>
              )}
              <Link
                href="/export"
                className="btn btn-secondary flex w-full items-center justify-center gap-1.5 py-2 text-xs"
              >
                <Download size={13} /> Export Journal Data
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
