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
    <ul className="hidden items-center gap-0.5 text-xs md:flex lg:gap-1 lg:text-sm">
      {LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={`rounded-md px-2 py-1 transition-colors lg:px-3 lg:py-1.5 ${
                active
                  ? 'bg-surface-2/60 text-gold'
                  : 'hover:bg-surface-2/60 text-text-secondary hover:text-text-primary'
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
