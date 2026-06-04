'use client';

import { useState } from 'react';
import { Smartphone, CheckCircle, Loader2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { getPublicEnv } from '@/lib/env';

type Props = {
  userId: string;
  initialHasActivePush: boolean;
};

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

export function DeviceRegistration({ userId, initialHasActivePush }: Props) {
  const toast = useToast();
  const [pushRegistered, setPushRegistered] = useState(initialHasActivePush);
  const [registeringPush, setRegisteringPush] = useState(false);

  async function handleEnablePush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications are not supported on this device/browser.');
      return;
    }

    setRegisteringPush(true);

    try {
      const doRegister = async () => {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission was denied.');
        }

        const env = getPublicEnv();
        const vapidKey = env?.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          throw new Error('Web Push is currently missing environment keys on this server.');
        }

        const existingRegistration = await navigator.serviceWorker.getRegistration();
        if (!existingRegistration) {
          try {
            await navigator.serviceWorker.register('/sw.js');
          } catch {
            throw new Error(
              'Failed to register Service Worker. If you are on localhost, ensure your next.config.js PWA settings allow development mode.',
            );
          }
        }

        const registration = await navigator.serviceWorker.ready;
        const applicationServerKey = urlBase64ToUint8Array(vapidKey);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        });

        const sb = supabaseBrowser();
        const { error } = await sb.from('push_subscriptions').insert({
          user_id: userId,
          subscription: subscription.toJSON(),
        });

        if (error) throw error;
      };

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                'Registration timed out (10s). Your browser might be silently blocking the request, or your connection dropped.',
              ),
            ),
          10000,
        );
      });

      await Promise.race([doRegister(), timeoutPromise]);

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
    <section className="card space-y-5 p-6">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
        <Smartphone size={14} className="text-gold" />
        Device Registration
      </h2>
      <p className="text-xs leading-relaxed text-text-secondary">
        Enable push alerts on this specific device to receive remote account cues and study
        reminders even when the app is closed.
      </p>

      {pushRegistered ? (
        <div className="bg-accent-econ border-border-accent-econ flex items-start gap-2 rounded-lg border p-3 text-xs text-success">
          <CheckCircle size={15} className="mt-0.5 shrink-0 text-success" />
          <div>
            <span className="font-semibold text-text-primary">Device registered</span>
            <p className="mt-0.5 text-text-secondary">
              This browser is configured to receive remote alerts.
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={handleEnablePush}
          disabled={registeringPush}
          className="btn btn-primary flex w-full items-center justify-center gap-1.5 py-2 text-xs"
        >
          {registeringPush ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Registering...
            </>
          ) : (
            <>Enable Push on this Device</>
          )}
        </button>
      )}

      <div className="space-y-2 border-t border-[var(--border-dim)] pt-4 text-xs text-text-muted">
        <p>
          Web Push relies on browser service workers. If notifications are not displaying, check:
        </p>
        <ul className="list-disc space-y-1 pl-4">
          <li>Browser permission settings.</li>
          <li>Device notification toggles (e.g. Do Not Disturb).</li>
          <li>Ensure you have run the app inside a secure context (HTTPS or localhost).</li>
        </ul>
      </div>
    </section>
  );
}
