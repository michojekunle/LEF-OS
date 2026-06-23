'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import { getDayNumber, isInCourse } from '@/lib/utils';
import { useCourse } from './CourseContext';
import { CommandPaletteTrigger } from './CommandPalette';
import { SankofaBird } from '@/components/sankofa/SankofaBird';

const NAV_LINKS = [
  {
    href: '/today',
    label: 'Study',
    matchPrefixes: ['/today', '/day/'],
    showDayBadge: true,
  },
  {
    href: '/roadmap',
    label: 'Roadmap',
    matchPrefixes: ['/roadmap'],
    showDayBadge: false,
  },
  {
    href: '/dashboard',
    label: 'Progress',
    matchPrefixes: ['/dashboard'],
    showDayBadge: false,
  },
  {
    href: '/journal',
    label: 'Journal',
    matchPrefixes: ['/journal'],
    showDayBadge: false,
  },
  {
    href: '/stats',
    label: 'Stats',
    matchPrefixes: ['/stats'],
    showDayBadge: false,
  },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  const course = useCourse();
  const dayNumber = isInCourse(new Date(), course) ? getDayNumber(new Date(), course) : null;
  const isSankofa = pathname.startsWith('/sankofa');

  return (
    <div className="hidden items-center gap-1 md:flex">
      <ul className="flex items-center gap-0.5 lg:gap-1">
        {NAV_LINKS.map(({ href, label, matchPrefixes, showDayBadge }) => {
          const active = matchPrefixes.some(
            (prefix) => pathname === prefix || pathname.startsWith(prefix),
          );

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-surface-2 text-gold'
                    : 'hover:bg-surface-2/50 text-text-secondary hover:text-text-primary'
                }`}
              >
                {label === 'Stats' && <BarChart3 size={13} />}
                {label}
                {showDayBadge && dayNumber !== null && (
                  <span
                    className={`rounded px-1 py-px font-mono text-xs font-bold ${
                      active ? 'bg-gold/20 text-gold' : 'bg-surface-2 text-text-muted'
                    }`}
                  >
                    {dayNumber}
                  </span>
                )}
              </Link>
            </li>
          );
        })}

        {/* Sankofa — sibling app teaser */}
        <li>
          <Link
            href="/sankofa"
            aria-current={isSankofa ? 'page' : undefined}
            className="sankofa-nav-link inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium"
          >
            <SankofaBird size={14} color="currentColor" />
            <span>Sankofa</span>
            <span className="sankofa-coming-soon-badge">COMING SOON</span>
          </Link>
        </li>
      </ul>

      {/* ⌘K shortcut hint — surfaces the command palette to desktop users */}
      <CommandPaletteTrigger className="ml-1 hidden items-center gap-1 rounded-md border border-[var(--border-subtle)] px-2 py-1 text-xs text-text-muted transition-colors hover:border-[var(--border)] hover:text-text-primary lg:flex">
        <span>⌘K</span>
      </CommandPaletteTrigger>
    </div>
  );
}

