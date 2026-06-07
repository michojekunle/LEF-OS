'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Map, LayoutDashboard, BookOpen, BarChart3 } from 'lucide-react';
import { getDayNumber, isInCourse } from '@/lib/utils';
import { useCourse } from './CourseContext';

const tabs = [
  {
    href: '/today',
    label: 'Study',
    Icon: GraduationCap,
    matchPrefixes: ['/today', '/day/'],
    /** Show a live day-number badge so users always know where they are */
    showDayBadge: true,
  },
  {
    href: '/roadmap',
    label: 'Roadmap',
    Icon: Map,
    matchPrefixes: ['/roadmap'],
    showDayBadge: false,
  },
  {
    href: '/dashboard',
    label: 'Progress',
    Icon: LayoutDashboard,
    matchPrefixes: ['/dashboard'],
    showDayBadge: false,
  },
  {
    href: '/journal',
    label: 'Journal',
    Icon: BookOpen,
    matchPrefixes: ['/journal'],
    showDayBadge: false,
  },
  {
    href: '/stats',
    label: 'Stats',
    Icon: BarChart3,
    matchPrefixes: ['/stats'],
    showDayBadge: false,
  },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  const course = useCourse();
  const dayNumber = isInCourse(new Date(), course) ? getDayNumber(new Date(), course) : null;

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="tabbar fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-tabbar)] backdrop-blur-md md:hidden"
    >
      <ul className="grid h-[3.75rem] grid-cols-5">
        {tabs.map(({ href, label, Icon, matchPrefixes, showDayBadge }) => {
          const active = matchPrefixes.some((p) => pathname === p || pathname.startsWith(p));

          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative mx-0.5 flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-md transition-colors ${
                  active ? 'text-gold' : 'text-text-secondary active:text-text-primary'
                }`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={active ? 2 : 1.75} />
                  {/* Live day badge — only on the Study tab during the course */}
                  {showDayBadge && dayNumber !== null && (
                    <span
                      className={`absolute -right-3 -top-1.5 min-w-[16px] rounded px-1 py-px text-center font-mono text-[9px] font-bold leading-none ${
                        active ? 'bg-gold text-bg' : 'bg-surface-2 text-text-muted'
                      }`}
                    >
                      {dayNumber}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium tracking-wide ${active ? 'text-gold' : ''}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
