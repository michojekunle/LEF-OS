'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const OnboardingFlow = dynamic(() => import('./OnboardingFlow').then((m) => m.OnboardingFlow), {
  ssr: false,
});

type Props = {
  userId: string;
  needsOnboarding: boolean;
};

export function OnboardingShell({ userId, needsOnboarding }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show once mounted on the client to avoid hydration mismatch
    setShow(needsOnboarding);
  }, [needsOnboarding]);

  // After onboarding completes (router.refresh() fires), needsOnboarding becomes
  // false on the next server render. Until then, hide manually so the user isn't
  // stuck. Also fire the tour auto-start event so the tour begins right after.
  function handleDone() {
    setShow(false);
    // Small delay — let the page settle before tour begins
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('lef-tour-start'));
    }, 600);
  }

  if (!show) return null;

  return <OnboardingFlow userId={userId} onDone={handleDone} />;
}
