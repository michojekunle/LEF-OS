'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  prevHref: string | null;
  nextHref: string | null;
};

/**
 * Listens for ← / → keypresses on the day page and navigates to prev/next day.
 * Only fires when no input/textarea/contenteditable is focused, so typing in
 * the log form, notes, or quiz answers isn't hijacked.
 */
export function DayKeyboardNav({ prevHref, nextHref }: Props) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      // Ignore when typing into form fields
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && prevHref) {
        e.preventDefault();
        router.push(prevHref);
      } else if (e.key === 'ArrowRight' && nextHref) {
        e.preventDefault();
        router.push(nextHref);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevHref, nextHref, router]);

  return null;
}
