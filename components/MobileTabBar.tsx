'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, LayoutDashboard, BookOpen } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/roadmap', label: 'Roadmap', Icon: Map },
  { href: '/dashboard', label: 'Today', Icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', Icon: BookOpen },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="tabbar md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-bg/95 backdrop-blur-md"
    >
      <ul className="grid grid-cols-4 px-1 pt-2">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-md transition-colors ${
                  active ? 'text-gold' : 'text-text-secondary'
                }`}
              >
                <Icon size={18} />
                <span className="text-[10px] tracking-wide">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
