'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`btn btn-secondary rounded-md p-1.5 transition-colors md:p-2 ${className}`}
    >
      {isDark ? (
        <Sun size={14} className="text-gold" />
      ) : (
        <Moon size={14} className="text-slate-blue" />
      )}
    </button>
  );
}
