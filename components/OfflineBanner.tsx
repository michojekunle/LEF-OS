'use client';

import { useEffect, useRef, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * Shows a banner at the top of the viewport when the device goes offline.
 * Briefly shows a "back online" confirmation before disappearing.
 */
export function OfflineBanner() {
  const [status, setStatus] = useState<'online' | 'offline' | 'restored'>('online');
  // Holds the "restored → online" cleanup timer so we can cancel it on unmount
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Read real state on mount — may already be offline
    if (!navigator.onLine) setStatus('offline');

    function goOffline() {
      setStatus('offline');
    }

    function goOnline() {
      setStatus('restored');
      // Clear any previous restore timer before scheduling a new one
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
      restoreTimerRef.current = setTimeout(() => setStatus('online'), 3000);
    }

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      // Cancel the restore timer if the component unmounts mid-countdown
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
    };
  }, []);

  if (status === 'online') return null;

  const isOffline = status === 'offline';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ zIndex: 99 }}
      className={`fixed inset-x-0 top-0 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium ${
        isOffline
          ? 'bg-[rgba(200,110,110,0.96)] text-white'
          : 'bg-[rgba(110,158,124,0.96)] text-white'
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff size={13} className="shrink-0" />
          You&apos;re offline — roadmap and cached pages still work
        </>
      ) : (
        <>
          <Wifi size={13} className="shrink-0" />
          Back online — data will refresh automatically
        </>
      )}
    </div>
  );
}
