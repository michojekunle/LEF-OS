'use client';

import { useEffect } from 'react';
import { AchievementModal } from './AchievementModal';
import { useAchievement } from '@/hooks/useAchievement';
import type { Achievement } from '@/lib/achievements';

/**
 * Global achievement listener mounted in layout.
 * Any component on any page can fire:
 *   window.dispatchEvent(new CustomEvent('lef-achievement', { detail: achievement }))
 * and this provider will queue and display the modal.
 */
export function AchievementProvider() {
  const { current, queueAchievement, dismiss } = useAchievement();

  useEffect(() => {
    function handle(e: Event) {
      const achievement = (e as CustomEvent<Achievement>).detail;
      if (achievement?.type) {
        queueAchievement([achievement]);
      }
    }
    window.addEventListener('lef-achievement', handle);
    return () => window.removeEventListener('lef-achievement', handle);
  }, [queueAchievement]);

  if (!current) return null;

  return <AchievementModal achievement={current} onDismiss={dismiss} />;
}
