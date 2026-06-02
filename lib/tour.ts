export const TOUR_KEY = 'lef_tour_completed';
export const TOUR_STEP_KEY = 'lef_tour_step';

export function shouldShowTour(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(TOUR_KEY) !== 'true';
  } catch {
    return false;
  }
}

export function markTourComplete(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOUR_KEY, 'true');
    localStorage.removeItem(TOUR_STEP_KEY);
  } catch {
    // localStorage may be unavailable in some environments
  }
}

export function saveTourStep(step: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOUR_STEP_KEY, String(step));
  } catch {
    // localStorage may be unavailable
  }
}

export function getSavedTourStep(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(TOUR_STEP_KEY);
    if (raw === null) return 0;
    const n = parseInt(raw, 10);
    return isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}

export function resetTour(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOUR_KEY);
    localStorage.removeItem(TOUR_STEP_KEY);
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Expose resetTour on window in dev so you can replay the tour from the
 * browser console without opening DevTools storage panel:
 *
 *   window.__lefResetTour()
 *
 * Then refresh the page.
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as Window & { __lefResetTour?: () => void }).__lefResetTour = () => {
    resetTour();
    console.info('[LEF] Tour reset. Refresh the page to see it again.');
  };
}
