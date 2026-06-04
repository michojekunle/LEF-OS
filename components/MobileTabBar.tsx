'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, LayoutDashboard, BookOpen, BarChart3, Search } from 'lucide-react';
import { useCommandPalette } from './CommandPalette';

const tabs = [
  { href: '/', label: 'Home', Icon: Home, exact: true },
  { href: '/roadmap', label: 'Roadmap', Icon: Map, exact: false },
  { href: '/dashboard', label: 'Today', Icon: LayoutDashboard, exact: false },
  { href: '/journal', label: 'Journal', Icon: BookOpen, exact: false },
  { href: '/stats', label: 'Stats', Icon: BarChart3, exact: false },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { open } = useCommandPalette();

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="tabbar fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-tabbar)] backdrop-blur-md md:hidden"
    >
      <ul className="grid h-[3.75rem] grid-cols-6">
        {tabs.map(({ href, label, Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`mx-0.5 flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-md transition-colors ${
                  active ? 'text-gold' : 'text-text-secondary active:text-text-primary'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.75} />
                <span
                  className={`text-xs font-medium tracking-wide ${active ? 'text-gold' : ''}`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="flex">
          <button
            type="button"
            onClick={open}
            aria-label="Open command palette"
            className="mx-0.5 flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-md text-text-secondary transition-colors active:text-text-primary"
          >
            <Search size={20} strokeWidth={1.75} />
            <span className="text-xs font-medium tracking-wide">Search</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
