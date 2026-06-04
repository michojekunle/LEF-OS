import Link from 'next/link';
import { WifiOff, CheckCircle2, Clock } from 'lucide-react';

export const metadata = { title: 'Offline — LEF OS' };

/**
 * Served by the service worker when the user requests a page that is not
 * in any cache AND the network is unavailable. Pages the user has visited
 * before (roadmap, day pages, dashboard) will still load from cache and
 * will NOT reach this page — this is the absolute last resort.
 */
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-content px-5 py-16 md:px-6 md:py-24">
      <div className="flex max-w-lg flex-col items-start gap-10">
        {/* Icon + heading */}
        <div className="space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-surface-2">
            <WifiOff size={24} className="text-text-muted" />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-text-secondary">
              No connection
            </p>
            <h1 className="font-display text-3xl tracking-tight md:text-4xl">
              You&apos;re offline.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-text-secondary">
              The page you tried to open hasn&apos;t been cached on this device yet. Once you visit
              a page while online, it&apos;s stored for offline use automatically.
            </p>
          </div>
        </div>

        {/* Always-available (precached at install) */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="shrink-0 text-success" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">
              Always available — no prior visit needed
            </p>
          </div>
          <p className="pl-5 text-xs leading-relaxed text-text-muted">
            The service worker precaches these at install time.
          </p>
          <div className="space-y-2 pl-1">
            {[
              { href: '/', label: 'Home', desc: 'Landing page and curriculum overview' },
              {
                href: '/roadmap',
                label: 'Roadmap',
                desc: 'Full 122-day curriculum — all 3 domains',
              },
            ].map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="card hover:border-gold/50 group flex items-center gap-4 p-4 transition-colors"
              >
                <CheckCircle2 size={14} className="shrink-0 text-success" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  <p className="truncate text-xs text-text-muted">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Available after a prior visit */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={13} className="shrink-0 text-gold" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">
              Available if visited before
            </p>
          </div>
          <p className="pl-5 text-xs leading-relaxed text-text-muted">
            The service worker caches these on first load. They show your last-loaded data.
          </p>
          <div className="space-y-2 pl-1">
            {[
              {
                href: '/dashboard',
                label: 'Dashboard',
                desc: 'Your last-loaded study log and streak',
              },
              { href: '/stats', label: 'Stats', desc: 'Your last-synced progress snapshot' },
              { href: '/journal', label: 'Journal', desc: 'Last-loaded public insights' },
              {
                href: '/day/1',
                label: 'Day pages (e.g. /day/1)',
                desc: 'Any day page you have opened before',
              },
            ].map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="card hover:border-gold/50 group flex items-center gap-4 p-4 transition-colors"
              >
                <Clock size={14} className="shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  <p className="truncate text-xs text-text-muted">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Reconnect note */}
        <div className="card w-full p-4">
          <p className="text-xs leading-relaxed text-text-secondary">
            <span className="font-semibold text-text-primary">When you reconnect,</span> reload any
            page and everything syncs automatically. Any changes you made are submitted from the
            local cache when the connection is restored.
          </p>
        </div>
      </div>
    </div>
  );
}
