'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CommandPaletteTrigger } from './CommandPalette';

const LINKS = [
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/today', label: 'Today' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/journal', label: 'Journal' },
  { href: '/stats', label: 'Stats' },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="hidden md:flex items-center gap-0.5 lg:gap-1 text-xs lg:text-sm">
      {LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-md transition-colors ${
                active
                  ? 'text-gold bg-surface-2/60'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/60'
              }`}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NavTrigger() {
  return <CommandPaletteTrigger />;
}
