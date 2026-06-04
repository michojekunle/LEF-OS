'use client';

import { useState } from 'react';
import { Smartphone, Mail, Bell, Trash2, Plus, Loader2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

type CustomReminder = {
  id: string;
  title: string;
  reminder_time: string;
  delivery_type: 'email' | 'in_app' | 'both';
  enabled: boolean;
};

type Props = {
  userId: string;
  initialReminders: CustomReminder[];
};

export function RemindersList({ userId, initialReminders }: Props) {
  const toast = useToast();
  const [reminders, setReminders] = useState<CustomReminder[]>(initialReminders);

  // Add reminder states
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newType, setNewType] = useState<'email' | 'in_app' | 'both'>('both');
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  // Add custom reminder
  async function handleAddReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || isAddingReminder) return;

    const reminderTime = `${newTime}:00`;

    setIsAddingReminder(true);
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

      setReminders((prev) =>
        [...prev, data as CustomReminder].sort((a, b) =>
          a.reminder_time.localeCompare(b.reminder_time),
        ),
      );
      setNewTitle('');
      toast.success('Custom reminder scheduled.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to schedule reminder.');
    } finally {
      setIsAddingReminder(false);
    }
  }

  // Toggle reminder status
  async function handleToggleReminder(id: string, currentVal: boolean) {
    try {
      const sb = supabaseBrowser();
      const { error } = await sb
        .from('custom_reminders')
        .update({ enabled: !currentVal })
        .eq('id', id);

      if (error) throw error;

      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !currentVal } : r)));
      toast.success(`Reminder ${!currentVal ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status.');
    }
  }

  // Delete a reminder
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

  return (
    <section className="card space-y-6 p-6">
      <div>
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
          <Smartphone size={14} className="text-gold" />
          Scheduled Study Intervals
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          Receive accountability pings at specified times throughout the day (e.g. morning, noon,
          peak afternoon, dusk).
        </p>
      </div>

      {/* List custom reminders */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <p className="text-xs italic text-text-muted">No custom reminders scheduled.</p>
        ) : (
          reminders.map((reminder) => {
            const [h, m] = reminder.reminder_time.split(':');
            const timeStr = `${h}:${m}`;

            return (
              <div
                key={reminder.id}
                className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                  reminder.enabled
                    ? 'border-border'
                    : 'border-[var(--border-dim)] bg-transparent opacity-60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-xs font-bold text-text-primary">
                      {timeStr}
                    </span>
                    <span className="text-sm font-medium text-text-primary">{reminder.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-text-secondary">
                    <span className="flex items-center gap-1">
                      {reminder.delivery_type === 'email' || reminder.delivery_type === 'both' ? (
                        <Mail size={10} className="text-gold" />
                      ) : null}
                      {reminder.delivery_type === 'in_app' || reminder.delivery_type === 'both' ? (
                        <Bell size={10} className="text-gold" />
                      ) : null}
                      {reminder.delivery_type === 'both'
                        ? 'Email & Device Push'
                        : reminder.delivery_type === 'email'
                          ? 'Email Only'
                          : 'Device Push'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer select-none items-center">
                    <input
                      type="checkbox"
                      checked={reminder.enabled}
                      onChange={() => handleToggleReminder(reminder.id, reminder.enabled)}
                      className="rounded accent-gold"
                    />
                  </label>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="rounded-md p-1 text-text-muted transition-all hover:bg-surface-2 hover:text-red"
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
      <form
        onSubmit={handleAddReminder}
        className="card-2 space-y-4 border-dashed border-border p-4"
      >
        <h3 className="text-xs font-medium text-text-primary">Add Custom Scheduled Alert</h3>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label
              htmlFor="rem-title"
              className="text-xs uppercase tracking-wider text-text-secondary"
            >
              Alert Title
            </label>
            <input
              id="rem-title"
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Afternoon Econ Log"
              disabled={isAddingReminder}
              className="input py-1.5 text-xs disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="rem-time"
              className="text-xs uppercase tracking-wider text-text-secondary"
            >
              Trigger Time
            </label>
            <input
              id="rem-time"
              type="time"
              required
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              disabled={isAddingReminder}
              className="input py-1.5 font-mono text-xs disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="rem-type"
              className="text-xs uppercase tracking-wider text-text-secondary"
            >
              Delivery Method
            </label>
            <select
              id="rem-type"
              value={newType}
              onChange={(e) => setNewType(e.target.value as 'email' | 'in_app' | 'both')}
              disabled={isAddingReminder}
              className="select py-1.5 text-xs disabled:opacity-50"
            >
              <option value="both">Both (Email & Push)</option>
              <option value="email">Email only</option>
              <option value="in_app">Push only</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isAddingReminder}
          className="btn btn-secondary flex w-full items-center justify-center gap-1.5 border-dashed px-3.5 py-1.5 text-xs disabled:opacity-50"
        >
          {isAddingReminder ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Scheduling...
            </>
          ) : (
            <>
              <Plus size={13} /> Schedule Reminder
            </>
          )}
        </button>
      </form>
    </section>
  );
}
