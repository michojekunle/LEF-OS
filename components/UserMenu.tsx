'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  Settings,
  LogOut,
  Search,
  Moon,
  Sun,
  Monitor,
  Download,
  User,
  BarChart3,
} from 'lucide-react';
import { SignOutButton } from './SignOutButton';
import { useTheme } from './ThemeProvider';
import { CommandPaletteTrigger } from './CommandPalette';

type Props = {
  isAuthed: boolean;
  username?: string | null;
};

export function UserMenu({ isAuthed, username }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

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
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
        aria-label="User menu"
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>

      {/* Dropdown Panel */}
      <div
        className={`absolute right-0 top-full mt-1 w-56 origin-top-right rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-nav)] p-1.5 shadow-lg backdrop-blur-xl transition-all duration-200 ${
          isOpen
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible -translate-y-2 scale-95 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-1">
          {/* Theme Toggle (Inline) */}
          <div className="px-3 py-2">
            <p className="mb-2 text-xs uppercase tracking-widest text-text-muted">Theme</p>
            <div className="flex rounded-md border border-[var(--border-subtle)] bg-surface p-0.5">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 rounded py-1 transition-colors ${theme === 'light' ? 'bg-surface-2 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <Sun size={14} className="mx-auto" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 rounded py-1 transition-colors ${theme === 'dark' ? 'bg-surface-2 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <Moon size={14} className="mx-auto" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 rounded py-1 transition-colors ${theme === 'system' ? 'bg-surface-2 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <Monitor size={14} className="mx-auto" />
              </button>
            </div>
          </div>

          <div className="my-1 h-px w-full bg-[var(--border-subtle)]" />

          {/* NavTrigger (Command Palette) */}
          <div className="w-full px-1" onClick={() => setIsOpen(false)}>
            <CommandPaletteTrigger className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary">
              <Search size={15} /> Search / Commands
            </CommandPaletteTrigger>
          </div>

          {isAuthed ? (
            <>
              <Link
                href="/stats"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
              >
                <BarChart3 size={15} /> Stats
              </Link>

              {username ? (
                <Link
                  href={`/u/${username}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
                >
                  <User size={15} /> Public Profile
                </Link>
              ) : (
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
                >
                  <User size={15} /> Setup Profile
                </Link>
              )}

              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
              >
                <Settings size={15} /> Settings
              </Link>

              <Link
                href="/export"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
              >
                <Download size={15} /> Export Data
              </Link>

              <div className="my-1 h-px w-full bg-[var(--border-subtle)]" />

              <div className="w-full px-1" onClick={() => setIsOpen(false)}>
                <SignOutButton className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-lef-red">
                  <LogOut size={15} /> Sign out
                </SignOutButton>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="mt-1 flex items-center justify-center rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-[var(--border-subtle)]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
