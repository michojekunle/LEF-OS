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
      // eslint-disable-next-line no-console
      console.log('[AchievementProvider] Received lef-achievement event', achievement);
      if (achievement?.type) {
        queueAchievement([achievement]);
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          '[AchievementProvider] Event received but no valid achievement.type — ignoring',
        );
      }
    }
    window.addEventListener('lef-achievement', handle);
    // eslint-disable-next-line no-console
    console.log('[AchievementProvider] Listener registered');
    return () => window.removeEventListener('lef-achievement', handle);
  }, [queueAchievement]);

  if (!current) return null;

  return <AchievementModal achievement={current} onDismiss={dismiss} />;
}
