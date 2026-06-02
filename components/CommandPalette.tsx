'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  Home,
  Map,
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Settings,
  CalendarDays,
  LogOut,
  Compass,
  Sparkles,
  Download,
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';
import {
  CURRICULUM,
  TOTAL_CALENDAR_DAYS,
  type Domain,
} from './curriculum-data';

type Command = {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  group: string;
  Icon: React.ComponentType<any>;
  run: () => void | Promise<void>;
};

type Ctx = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
};

const CmdCtx = createContext<Ctx | null>(null);

export function useCommandPalette() {
  const c = useContext(CmdCtx);
  if (!c) {
    return { open: () => {}, close: () => {}, toggle: () => {}, isOpen: false };
  }
  return c;
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape' && isOpen) {
        close();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, close, isOpen]);

  const ctx = useMemo<Ctx>(() => ({ open, close, toggle, isOpen }), [open, close, toggle, isOpen]);

  return (
    <CmdCtx.Provider value={ctx}>
      {children}
      {isOpen ? <Palette onClose={close} /> : null}
    </CmdCtx.Provider>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands: Command[] = useMemo(() => {
    const base: Command[] = [
      { id: 'home', group: 'Navigate', label: 'Home', Icon: Home, run: () => router.push('/') },
      { id: 'roadmap', group: 'Navigate', label: 'Roadmap', Icon: Map, run: () => router.push('/roadmap') },
      { id: 'today', group: 'Navigate', label: 'Today', Icon: Sparkles, run: () => router.push('/today') },
      { id: 'dashboard', group: 'Navigate', label: 'Dashboard', Icon: LayoutDashboard, run: () => router.push('/dashboard') },
      { id: 'journal', group: 'Navigate', label: 'Journal', Icon: BookOpen, run: () => router.push('/journal') },
      { id: 'stats', group: 'Navigate', label: 'Stats', Icon: BarChart3, run: () => router.push('/stats') },
      { id: 'settings', group: 'Navigate', label: 'Settings', Icon: Settings, run: () => router.push('/settings') },
      {
        id: 'export',
        group: 'Tools',
        label: 'Export my entries (Markdown)',
        Icon: ArrowRight,
        run: () => router.push('/export'),
      },
      ...((typeof window !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      )) ? [] : [{
        id: 'install-pwa',
        group: 'Tools',
        label: 'Install LEF OS (Web App)',
        Icon: Download,
        run: () => {
          localStorage.removeItem('lef-pwa-dismissed');
          window.dispatchEvent(new CustomEvent('show-install-prompt'));
        },
      }]),
      {
        id: 'signout',
        group: 'Account',
        label: 'Sign out',
        Icon: LogOut,
        run: async () => {
          const sb = supabaseBrowser();
          await sb.auth.signOut();
          router.push('/');
          router.refresh();
        },
      },
    ];

    // Months
    for (const m of CURRICULUM) {
      base.push({
        id: `month-${m.month}`,
        group: 'Months',
        label: `Month ${m.month} · ${m.monthName} — ${m.theme}`,
        hint: m.dateRange,
        Icon: Compass,
        keywords: m.monthName + ' ' + m.theme,
        run: () => router.push(`/roadmap?month=${m.month}`),
      });
    }

    // Domains
    (['law', 'economics', 'finance'] as Domain[]).forEach((d) => {
      base.push({
        id: `domain-${d}`,
        group: 'Domains',
        label: `Browse ${d}`,
        Icon: Compass,
        keywords: d,
        run: () => router.push(`/roadmap?domain=${d}`),
      });
    });

    // Jump to day N — handled separately below for live numeric input.
    return base;
  }, [router]);

  const dayNumber = useMemo(() => {
    const m = q.trim().match(/^d(?:ay)?\s*(\d{1,3})$/i) || q.trim().match(/^(\d{1,3})$/);
    if (!m) return null;
    const n = Number(m[1]);
    if (!Number.isFinite(n) || n < 1 || n > TOTAL_CALENDAR_DAYS) return null;
    return n;
  }, [q]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(term) ||
        (c.keywords ?? '').toLowerCase().includes(term) ||
        c.group.toLowerCase().includes(term),
    );
  }, [commands, q]);

  const items: Command[] = useMemo(() => {
    if (dayNumber !== null) {
      return [
        {
          id: 'jump-day',
          group: 'Jump',
          label: `Open Day ${dayNumber}`,
          Icon: CalendarDays,
          run: () => router.push(`/day/${dayNumber}`),
        },
        ...filtered,
      ];
    }
    if (q.trim().length > 1) {
      return [
        {
          id: 'search-journal',
          group: 'Search',
          label: `Search journal for "${q.trim()}"`,
          Icon: Search,
          run: () => router.push(`/journal?q=${encodeURIComponent(q.trim())}`),
        },
        ...filtered,
      ];
    }
    return filtered;
  }, [filtered, q, dayNumber, router]);

  useEffect(() => {
    setActiveIdx(0);
  }, [q]);

  useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = items[activeIdx];
      if (cmd) {
        void cmd.run();
        onClose();
      }
    }
  }

  // Group items in render order while preserving filter order.
  const grouped: { group: string; items: { cmd: Command; absIdx: number }[] }[] = [];
  items.forEach((cmd, absIdx) => {
    const last = grouped[grouped.length - 1];
    if (last && last.group === cmd.group) {
      last.items.push({ cmd, absIdx });
    } else {
      grouped.push({ group: cmd.group, items: [{ cmd, absIdx }] });
    }
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[90] flex items-start justify-center p-4 md:pt-[14vh]"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-xl card-2 border-border rounded-xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] overflow-hidden reveal">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search size={16} className="text-text-secondary shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search or type a day number…"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-text-muted"
            aria-label="Command input"
          />
          {/* Close button — visible on mobile; keyboard shortcut shown on desktop */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-text-muted hover:text-text-primary p-1 rounded shrink-0"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.749.749 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.749.749 0 1 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>
          <kbd className="hidden md:inline text-[10px] text-text-muted font-mono bg-surface-2 border border-border px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        {/* List: shorter on mobile so on-screen keyboard doesn't hide results */}
        <ul ref={listRef} className="max-h-[45vh] md:max-h-[60vh] overflow-y-auto py-1">
          {grouped.map((g) => (
            <li key={g.group}>
              <div className="px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] text-text-muted">
                {g.group}
              </div>
              <ul>
                {g.items.map(({ cmd, absIdx }) => {
                  const active = absIdx === activeIdx;
                  return (
                    <li key={cmd.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIdx(absIdx)}
                        onClick={() => {
                          void cmd.run();
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 md:py-2 text-sm text-left transition-colors ${
                          active ? 'bg-surface text-gold' : 'text-text-primary'
                        }`}
                      >
                        <cmd.Icon size={14} className={active ? 'text-gold' : 'text-text-secondary'} />
                        <span className="flex-1">{cmd.label}</span>
                        {cmd.hint && (
                          <span className="text-[10px] text-text-muted hidden sm:inline">{cmd.hint}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-text-secondary">
              Nothing matches.
            </li>
          )}
        </ul>
        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[10px] text-text-muted">
          <span className="hidden md:inline">↑↓ navigate · ↵ run · ESC close</span>
          <span className="md:hidden">Tap to run a command</span>
          <span className="hidden md:inline">⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
}

/** Small icon button — opens the palette. Use anywhere in the app. */
export function CommandPaletteTrigger({ className = '' }: { className?: string }) {
  const { open } = useCommandPalette();
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open command palette"
      className={`inline-flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-text-primary border border-border rounded-md p-1.5 md:p-2 lg:px-2.5 lg:py-1.5 transition-colors shrink-0 ${className}`}
    >
      <Search size={14} className="lg:w-3 lg:h-3" />
      <span className="hidden lg:inline">Search · </span>
      <kbd className="hidden lg:inline font-mono text-[10px] text-text-muted">⌘K</kbd>
    </button>
  );
}
