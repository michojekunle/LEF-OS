'use client';

import { useEffect, useState, useRef } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useToast } from './Toast';
import { Bell, X, Check, CheckCheck } from 'lucide-react';

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

type Props = {
  userId: string;
};

export function NotificationCenter({ userId }: Props) {
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const sb = supabaseBrowser();
        const { data, error } = await sb
          .from('in_app_notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    }

    loadNotifications();
  }, [userId]);

  // Subscribe to realtime database inserts
  useEffect(() => {
    const sb = supabaseBrowser();
    const channel = sb
      .channel(`in_app_notifications:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          // Trigger a clean in-app toast alert!
          toast.info(`${newNotif.title}: ${newNotif.message}`, 4500);

          // Prepend to state
          setNotifications((prev) => [newNotif, ...prev]);
        },
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [userId, toast]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark single notification as read
  async function handleMarkAsRead(id: string) {
    try {
      const sb = supabaseBrowser();
      const { error } = await sb.from('in_app_notifications').update({ read: true }).eq('id', id);

      if (error) throw error;
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  }

  // Mark all notifications as read
  async function handleMarkAllRead() {
    if (unreadCount === 0) return;
    try {
      const sb = supabaseBrowser();
      const { error } = await sb
        .from('in_app_notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      console.error(err);
    }
  }

  // Clear/delete all notifications
  async function handleClearAll() {
    if (notifications.length === 0) return;
    try {
      const sb = supabaseBrowser();
      const { error } = await sb.from('in_app_notifications').delete().eq('user_id', userId);

      if (error) throw error;
      setNotifications([]);
      toast.success('Notification center cleared.');
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* BELL TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="btn btn-secondary relative flex items-center justify-center rounded-md p-1.5 text-xs hover:border-gold md:p-2"
      >
        <Bell size={14} className={unreadCount > 0 ? 'animate-wiggle text-gold' : ''} />
        {unreadCount > 0 && (
          <span className="bg-accent-synthesis absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-border text-[9px] font-bold text-red">
            {unreadCount}
          </span>
        )}
      </button>

      {/* FLOATING DRAWER */}
      {isOpen && (
        <div className="card-2 reveal absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border-border bg-surface shadow-2xl md:w-96">
          <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-muted">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[10px] text-text-secondary transition-colors hover:text-gold"
                  title="Mark all as read"
                >
                  <CheckCheck size={12} />
                  Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[10px] text-text-muted transition-colors hover:text-red"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-0.5 text-text-muted hover:text-text-primary"
              >
                <X size={12} />
              </button>
            </div>
          </header>

          <ul className="divide-border/40 max-h-[60vh] divide-y overflow-y-auto py-1">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-xs italic text-text-muted">
                All clear. No notifications.
              </li>
            ) : (
              notifications.map((n) => {
                const date = new Date(n.created_at);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <li
                    key={n.id}
                    onClick={() => !n.read && handleMarkAsRead(n.id)}
                    className={`flex cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors ${
                      n.read
                        ? 'hover:bg-surface-2/20 bg-transparent'
                        : 'bg-surface-2/40 hover:bg-surface-2/60'
                    }`}
                  >
                    {!n.read && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-text-primary">{n.title}</span>
                        <span className="font-mono text-[9px] text-text-muted">{timeStr}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-text-secondary">{n.message}</p>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
