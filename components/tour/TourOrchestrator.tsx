'use client';

import { useTour } from './TourProvider';
import { TourOverlay } from './TourOverlay';
import { TourTooltip } from './TourTooltip';
import { TourWelcome } from './TourWelcome';
import { TourComplete } from './TourComplete';
import { TourProgress } from './TourProgress';
import { TourBeacon } from './TourBeacon';

export function TourOrchestrator() {
  const { state, isActive, currentStep, next, back, skip } = useTour();

  // Completed state — show celebration
  if (state.status === 'completed') {
    return <TourComplete />;
  }

  if (!isActive || !currentStep) return null;

  const isFullscreen = currentStep.fullscreen === true;
  const isWelcome = currentStep.index === 0;
  const isLastFullscreen = isFullscreen && !isWelcome;

  const hasCompletedInteraction = currentStep.interactionId
    ? state.completedInteractions.includes(currentStep.interactionId)
    : true;

  return (
    <>
      <TourOverlay />

      {/* Fullscreen welcome modal */}
      {isWelcome && <TourWelcome />}

      {/* Non-fullscreen regular steps */}
      {!isFullscreen && (
        <>
          {/* Beacon on target when there's an interaction to complete */}
          {currentStep.target && currentStep.interactionId && !hasCompletedInteraction && (
            <TourBeacon targetSelector={currentStep.target} />
          )}

          <TourTooltip
            step={currentStep}
            stepIndex={currentStep.index}
            onNext={next}
            onBack={back}
            onSkip={skip}
            spotlightRect={state.spotlightRect}
            hasCompletedInteraction={hasCompletedInteraction}
          />
        </>
      )}

      {/* Last fullscreen step — show celebration modal while still 'active' */}
      {isLastFullscreen && <TourComplete />}

      {/* Progress indicator */}
      {!isFullscreen && <TourProgress />}
    </>
  );
}
