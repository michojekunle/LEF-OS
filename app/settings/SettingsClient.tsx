'use client';

import { useState, useTransition } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { getPublicEnv } from '@/lib/env';
import {
  Bell,
  Mail,
  Trash2,
  Plus,
  Loader2,
  Smartphone,
  Check,
  CheckCircle,
} from 'lucide-react';

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
  displayName: string | null;
  initialSettings: {
    daily_reminder_enabled: boolean;
    timezone: string;
  };
  initialReminders: CustomReminder[];
  hasActivePush: boolean;
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

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function SettingsClient({
  userId,
  email,
  displayName,
  initialSettings,
  initialReminders,
  hasActivePush,
}: Props) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // Settings states
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(
    initialSettings.daily_reminder_enabled
  );
  const [timezone, setTimezone] = useState(initialSettings.timezone);

  // Reminders lists
  const [reminders, setReminders] = useState<CustomReminder[]>(initialReminders);

  // Add reminder states
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newType, setNewType] = useState<'email' | 'in_app' | 'both'>('both');

  // Push subscription state
  const [pushRegistered, setPushRegistered] = useState(hasActivePush);
  const [registeringPush, setRegisteringPush] = useState(false);

  // ── Save global settings ──────────────────────────────────────────────────
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

  // ── Add a custom reminder ────────────────────────────────────────────────
  async function handleAddReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Time needs to be in format "HH:MM:SS"
    const reminderTime = `${newTime}:00`;

    try {
      const sb = supabaseBrowser();
      const { data, error } = await sb
        .from('custom_reminders')
        .insert({
          user_id: userId,
          title: newTitle.trim(),
          reminder_time: reminderTime,
          delivery_type: newType,
          enabled: true,
        })
        .select()
        .single();

      if (error) throw error;

      setReminders((prev) => [...prev, data as CustomReminder].sort((a, b) => a.reminder_time.localeCompare(b.reminder_time)));
      setNewTitle('');
      toast.success('Custom reminder scheduled.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to schedule reminder.');
    }
  }

  // ── Toggle reminder status ───────────────────────────────────────────────
  async function handleToggleReminder(id: string, currentVal: boolean) {
    try {
      const sb = supabaseBrowser();
      const { error } = await sb
        .from('custom_reminders')
        .update({ enabled: !currentVal })
        .eq('id', id);

      if (error) throw error;

      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: !currentVal } : r))
      );
      toast.success(`Reminder ${!currentVal ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status.');
    }
  }

  // ── Delete a reminder ────────────────────────────────────────────────────
  async function handleDeleteReminder(id: string) {
    try {
      const sb = supabaseBrowser();
      const { error } = await sb.from('custom_reminders').delete().eq('id', id);

      if (error) throw error;

      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success('Reminder removed.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete reminder.');
    }
  }

  // ── Push Notification registration ───────────────────────────────────────
  async function handleEnablePush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications are not supported on this device/browser.');
      return;
    }

    setRegisteringPush(true);
    try {
      // 1. Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission was denied.');
      }

      // 2. Fetch VAPID Key from environment
      const env = getPublicEnv();
      const vapidKey = env?.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        throw new Error('Web Push is currently missing environment keys on this server.');
      }

      // 3. Register push subscription via service worker
      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // 4. Save to Supabase
      const sb = supabaseBrowser();
      const { error } = await sb
        .from('push_subscriptions')
        .insert({
          user_id: userId,
          subscription: subscription.toJSON(),
        });

      if (error) throw error;

      setPushRegistered(true);
      toast.success('Push notifications successfully registered to this device.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown registration error';
      console.error('Push Registration failed:', err);
      toast.error(msg);
    } finally {
      setRegisteringPush(false);
    }
  }

  return (
    <div className="mx-auto max-w-content px-5 md:px-6 py-8 space-y-8 animate-fade-in">
      <header>
        <p className="text-[10px] uppercase tracking-[0.32em] text-text-secondary mb-1">
          Account & Preferences
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">Settings</h1>
        <p className="text-sm text-text-secondary mt-1 max-w-md">
          Configure notifications, custom reminders, and synchronize device parameters.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT COLUMN: GLOBAL PREFERENCES */}
        <div className="md:col-span-2 space-y-6">
          {/* GENERAL NOTIFICATION SETTINGS */}
          <section className="card p-6 space-y-5">
            <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Bell size={14} className="text-gold" />
              General Preferences
            </h2>
            
            <div className="space-y-4">
              {/* Daily Reminder Toggle */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dailyReminderEnabled}
                  onChange={(e) => setDailyReminderEnabled(e.target.checked)}
                  className="mt-1 accent-gold rounded border-border"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">Enable daily reminders</span>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Receive accountability emails and logs reminders matching your curriculum track.
                  </p>
                </div>
              </label>

              {/* Timezone Selector */}
              <div className="space-y-1.5">
                <label htmlFor="timezone" className="text-[10px] uppercase tracking-[0.18em] text-text-secondary block">
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

            <button
              onClick={handleSaveSettings}
              className="btn btn-primary text-xs px-4 py-2"
            >
              Save Preferences
            </button>
          </section>

          {/* CUSTOM REMINDERS CONFIG */}
          <section className="card p-6 space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Smartphone size={14} className="text-gold" />
                Scheduled Study Intervals
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Receive accountability pings at specified times throughout the day (e.g. morning, noon, peak afternoon, dusk).
              </p>
            </div>

            {/* List custom reminders */}
            <div className="space-y-3">
              {reminders.length === 0 ? (
                <p className="text-xs text-text-muted italic">No custom reminders scheduled.</p>
              ) : (
                reminders.map((reminder) => {
                  const [h, m] = reminder.reminder_time.split(':');
                  const timeStr = `${h}:${m}`;
                  
                  return (
                    <div
                      key={reminder.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        reminder.enabled ? 'border-border bg-surface-2/20' : 'border-border/40 opacity-60 bg-transparent'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-border">
                            {timeStr}
                          </span>
                          <span className="text-sm font-medium text-text-primary">{reminder.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-text-secondary uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            {reminder.delivery_type === 'email' || reminder.delivery_type === 'both' ? (
                              <Mail size={10} className="text-gold" />
                            ) : null}
                            {reminder.delivery_type === 'in_app' || reminder.delivery_type === 'both' ? (
                              <Bell size={10} className="text-gold" />
                            ) : null}
                            {reminder.delivery_type === 'both' ? 'Email & Device Push' : reminder.delivery_type === 'email' ? 'Email Only' : 'Device Push'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={reminder.enabled}
                            onChange={() => handleToggleReminder(reminder.id, reminder.enabled)}
                            className="accent-gold rounded"
                          />
                        </label>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="text-text-muted hover:text-red p-1 rounded-md hover:bg-surface-2 transition-all"
                          aria-label="Delete reminder"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Custom Reminder Form */}
            <form onSubmit={handleAddReminder} className="card-2 p-4 border-dashed border-border space-y-4">
              <h3 className="text-xs font-medium text-text-primary">Add Custom Scheduled Alert</h3>
              
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label htmlFor="rem-title" className="text-[9px] uppercase tracking-wider text-text-secondary">
                    Alert Title
                  </label>
                  <input
                    id="rem-title"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Afternoon Econ Log"
                    className="input py-1.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="rem-time" className="text-[9px] uppercase tracking-wider text-text-secondary">
                    Trigger Time
                  </label>
                  <input
                    id="rem-time"
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="input py-1.5 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="rem-type" className="text-[9px] uppercase tracking-wider text-text-secondary">
                    Delivery Method
                  </label>
                  <select
                    id="rem-type"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="select py-1.5 text-xs"
                  >
                    <option value="both">Both (Email & Push)</option>
                    <option value="email">Email only</option>
                    <option value="in_app">Push only</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-secondary text-xs px-3.5 py-1.5 w-full flex items-center justify-center gap-1.5 border-dashed"
              >
                <Plus size={13} /> Schedule Reminder
              </button>
            </form>
          </section>
        </div>

        {/* RIGHT COLUMN: PWA DEVICE SPECIFICS */}
        <div>
          <section className="card p-6 space-y-5">
            <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Smartphone size={14} className="text-gold" />
              Device Registration
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Enable push alerts on this specific device to receive remote account cues and study reminders even when the app is closed.
            </p>

            {pushRegistered ? (
              <div className="flex items-start gap-2 bg-accent-econ border border-border-accent-econ text-success p-3 rounded-lg text-xs">
                <CheckCircle size={15} className="shrink-0 mt-0.5 text-success" />
                <div>
                  <span className="font-semibold text-text-primary">Device registered</span>
                  <p className="text-text-secondary mt-0.5">
                    This browser is configured to receive remote alerts.
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleEnablePush}
                disabled={registeringPush}
                className="btn btn-primary text-xs w-full py-2 flex items-center justify-center gap-1.5"
              >
                {registeringPush ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Registering...
                  </>
                ) : (
                  <>
                    Enable Push on this Device
                  </>
                )}
              </button>
            )}

            <div className="border-t border-border/40 pt-4 text-[10px] text-text-muted space-y-2">
              <p>
                Web Push relies on browser service workers. If notifications are not displaying, check:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Browser permission settings.</li>
                <li>Device notification toggles (e.g. Do Not Disturb).</li>
                <li>Ensure you have run the app inside a secure context (HTTPS or localhost).</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
