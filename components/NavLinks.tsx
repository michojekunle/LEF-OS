'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const TOP_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/journal', label: 'Journal' },
];

const EXPLORE_LINKS = [
  { href: '/roadmap', label: 'Roadmap', desc: 'Curriculum & learning paths' },
  { href: '/today', label: 'Today', desc: 'Focus & daily context' },
  { href: '/stats', label: 'Stats', desc: 'Your learning metrics' },
];

export function NavLinks() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ul className="hidden items-center gap-1 text-sm md:flex lg:gap-2">
      {TOP_LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                active
                  ? 'bg-surface-2 text-gold'
                  : 'hover:bg-surface-2/50 text-text-secondary hover:text-text-primary'
              }`}
            >
              {l.label}
            </Link>
          </li>
        );
      })}

      {/* Explore Dropdown */}
      <li
        className="group relative"
        ref={dropdownRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 rounded-md px-3 py-1.5 font-medium transition-colors ${
            isOpen || EXPLORE_LINKS.some((l) => pathname === l.href)
              ? 'bg-surface-2/30 text-gold'
              : 'hover:bg-surface-2/50 text-text-secondary hover:text-text-primary'
          }`}
        >
          Explore{' '}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Panel */}
        <div
          className={`absolute left-0 top-full mt-1 w-56 origin-top-left rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-nav)] p-1.5 shadow-lg backdrop-blur-xl transition-all duration-200 ${
            isOpen
              ? 'visible translate-y-0 scale-100 opacity-100'
              : 'invisible -translate-y-2 scale-95 opacity-0'
          }`}
        >
          <div className="flex flex-col">
            {EXPLORE_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 transition-colors ${
                    active ? 'bg-surface-2 text-gold' : 'text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <span className="font-medium">{l.label}</span>
                  <span className="text-[11px] text-text-muted">{l.desc}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </li>
    </ul>
  );
}
