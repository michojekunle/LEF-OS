'use client';

// Module-level constant — not recreated on every render
const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/register',
  '/auth',
  '/forgot-password',
  '/reset-password',
];

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TOUR_STEPS, type TourStep } from './tour-steps';
import {
  getSavedTourStep,
  markTourComplete,
  saveTourStep,
  shouldShowTour,
  TOUR_KEY,
} from '@/lib/tour';

// ─── State ───────────────────────────────────────────────────────────────────

export type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type TourStatus = 'idle' | 'active' | 'completed' | 'skipped';

export type TourState = {
  status: TourStatus;
  currentStep: number;
  completedInteractions: string[];
  spotlightRect: SpotlightRect | null;
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'START'; step?: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SKIP' }
  | { type: 'COMPLETE_INTERACTION'; interactionId: string }
  | { type: 'UPDATE_SPOTLIGHT'; rect: SpotlightRect | null }
  | { type: 'RESET' };

const INITIAL_STATE: TourState = {
  status: 'idle',
  currentStep: 0,
  completedInteractions: [],
  spotlightRect: null,
};

function reducer(state: TourState, action: Action): TourState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        status: 'active',
        currentStep: action.step ?? 0,
        completedInteractions: [],
        spotlightRect: null,
      };

    case 'NEXT': {
      const next = state.currentStep + 1;
      if (next >= TOUR_STEPS.length) {
        return { ...state, status: 'completed', spotlightRect: null };
      }
      return {
        ...state,
        currentStep: next,
        completedInteractions: [],
        spotlightRect: null,
      };
    }

    case 'BACK': {
      const prev = Math.max(0, state.currentStep - 1);
      return {
        ...state,
        currentStep: prev,
        completedInteractions: [],
        spotlightRect: null,
      };
    }

    case 'SKIP':
      return { ...state, status: 'skipped', spotlightRect: null };

    case 'COMPLETE_INTERACTION':
      if (state.completedInteractions.includes(action.interactionId)) return state;
      return {
        ...state,
        completedInteractions: [...state.completedInteractions, action.interactionId],
      };

    case 'UPDATE_SPOTLIGHT':
      return { ...state, spotlightRect: action.rect };

    case 'RESET':
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

export type TourCtx = {
  state: TourState;
  steps: TourStep[];
  currentStep: TourStep | null;
  start: (fromStep?: number) => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  isActive: boolean;
};

const TourContext = createContext<TourCtx | null>(null);

export function useTour(): TourCtx {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used inside TourProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TourProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const pathname = usePathname();
  const router = useRouter();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const pollingRafRef = useRef<number | null>(null);
  const pollingStartRef = useRef<number | null>(null);

  const currentStep = state.status === 'active' ? (TOUR_STEPS[state.currentStep] ?? null) : null;
  const isActive = state.status === 'active';

  // ─── Start / navigation helpers ──────────────────────────────────────────

  const start = useCallback((fromStep?: number) => {
    dispatch({ type: 'START', step: fromStep ?? 0 });
  }, []);

  const back = useCallback(() => dispatch({ type: 'BACK' }), []);
  const skip = useCallback(() => dispatch({ type: 'SKIP' }), []);

  // ─── Initialisation: auto-start or offer resume ───────────────────────────
  //
  // DO NOT guard with a ref here. React Strict Mode double-invokes effects:
  //   1. Effect fires → timer scheduled
  //   2. Cleanup fires → timer cleared
  //   3. Effect fires again → timer scheduled (this is the real one)
  // A `hasInitialised` guard breaks on step 3 and the tour never starts.
  // Proper cleanup in the return function is sufficient — React handles idempotency.

  useEffect(() => {
    // Never auto-start the tour on auth screens — wrong moment, wrong audience
    if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) return;

    const savedStep = getSavedTourStep();
    if (!shouldShowTour()) return;

    if (savedStep > 0) {
      // Offer resume — fire a custom event that a sibling component can toast
      const t = setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('lef-tour-resume-prompt', { detail: { step: savedStep } }),
        );
      }, 2000);
      return () => clearTimeout(t);
    }

    // Fresh first visit — auto-start after a short breathing gap
    const t = setTimeout(() => {
      dispatch({ type: 'START', step: 0 });
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Onboarding→tour handoff ─────────────────────────────────────────────
  // The OnboardingShell fires 'lef-tour-start' after the wizard completes.
  // We listen here so the tour starts regardless of the localStorage state
  // (a brand-new user who just finished onboarding has shouldShowTour()=true).

  useEffect(() => {
    function handleTourStart() {
      dispatch({ type: 'START', step: 0 });
    }
    window.addEventListener('lef-tour-start', handleTourStart);
    return () => window.removeEventListener('lef-tour-start', handleTourStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Resume prompt listener ───────────────────────────────────────────────

  useEffect(() => {
    function handleResumePrompt(e: Event) {
      const ev = e as CustomEvent<{ step: number }>;
      const step = ev.detail.step;
      // Dispatch a DOM event to show a toast. TourResumeToast listens for this.
      window.dispatchEvent(
        new CustomEvent('lef-tour-show-resume', {
          detail: {
            step,
            onResume: () => dispatch({ type: 'START', step }),
            onDismiss: () => {
              try {
                localStorage.setItem(TOUR_KEY, 'true');
              } catch {
                // ignore
              }
            },
          },
        }),
      );
    }

    window.addEventListener('lef-tour-resume-prompt', handleResumePrompt);
    return () => window.removeEventListener('lef-tour-resume-prompt', handleResumePrompt);
  }, []);

  // ─── Save step on change ──────────────────────────────────────────────────

  useEffect(() => {
    if (state.status === 'active') {
      saveTourStep(state.currentStep);
    }
    if (state.status === 'completed' || state.status === 'skipped') {
      markTourComplete();
    }
  }, [state.status, state.currentStep]);

  // ─── Auto-navigate when the current step requires a different page ──────────
  //
  // A ref prevents the effect from re-firing when the pathname itself
  // changes in response to the navigation (which would cause a loop).

  const didNavigateRef = useRef(false);

  // Reset the flag each time the step changes
  useEffect(() => {
    didNavigateRef.current = false;
  }, [state.currentStep]);

  useEffect(() => {
    if (!isActive) return;
    if (didNavigateRef.current) return; // already navigated for this step

    const step = TOUR_STEPS[state.currentStep];
    if (!step || step.page === '*') return;

    if (step.page !== pathname) {
      didNavigateRef.current = true;
      router.push(step.page);
    }
  }, [state.currentStep, isActive, pathname, router]);

  // ─── Spotlight tracking ───────────────────────────────────────────────────

  const clearPolling = useCallback(() => {
    if (pollingRafRef.current !== null) {
      cancelAnimationFrame(pollingRafRef.current);
      pollingRafRef.current = null;
    }
    pollingStartRef.current = null;
  }, []);

  const clearResizeObserver = useCallback(() => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
  }, []);

  const PAD = 12; // spotlight padding in px

  const measureElement = useCallback(
    (el: Element) => {
      const rect = el.getBoundingClientRect();
      dispatch({
        type: 'UPDATE_SPOTLIGHT',
        rect: {
          top: rect.top - PAD,
          left: rect.left - PAD,
          width: rect.width + PAD * 2,
          height: rect.height + PAD * 2,
        },
      });
    },
    // PAD is a constant — no dep needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const attachResizeObserver = useCallback(
    (el: Element) => {
      clearResizeObserver();
      measureElement(el);
      const ro = new ResizeObserver(() => {
        requestAnimationFrame(() => measureElement(el));
      });
      ro.observe(el);
      resizeObserverRef.current = ro;
    },
    [clearResizeObserver, measureElement],
  );

  const scanForTarget = useCallback(
    (selector: string) => {
      clearPolling();
      pollingStartRef.current = performance.now();

      function poll() {
        const el = document.querySelector(`[data-tour="${selector}"]`);
        if (el) {
          // Scroll element into view if it's off-screen, then measure
          const r = el.getBoundingClientRect();
          const navH = 72; // approximate sticky nav height
          const inView = r.top >= navH && r.bottom <= window.innerHeight - navH;

          if (!inView) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Wait for the smooth scroll to settle before measuring
            setTimeout(() => {
              attachResizeObserver(el);
            }, 450);
          } else {
            attachResizeObserver(el);
          }
          return;
        }
        const elapsed = performance.now() - (pollingStartRef.current ?? 0);
        if (elapsed < 4000) {
          pollingRafRef.current = requestAnimationFrame(poll);
        } else {
          dispatch({ type: 'UPDATE_SPOTLIGHT', rect: null });
        }
      }

      pollingRafRef.current = requestAnimationFrame(poll);
    },
    [clearPolling, attachResizeObserver],
  );

  useEffect(() => {
    if (!isActive) {
      clearPolling();
      clearResizeObserver();
      return;
    }

    const step = TOUR_STEPS[state.currentStep];
    if (!step) return;

    if (step.target === null || step.fullscreen) {
      dispatch({ type: 'UPDATE_SPOTLIGHT', rect: null });
      clearPolling();
      clearResizeObserver();
      return;
    }

    // If the step requires a specific page and we're not there, don't scan yet
    if (step.page !== '*' && step.page !== pathname) {
      dispatch({ type: 'UPDATE_SPOTLIGHT', rect: null });
      return;
    }

    scanForTarget(step.target);

    return () => {
      clearPolling();
      clearResizeObserver();
    };
  }, [state.currentStep, isActive, pathname, scanForTarget, clearPolling, clearResizeObserver]);

  // Update spotlight on scroll/resize
  useEffect(() => {
    if (!isActive) return;
    const step = TOUR_STEPS[state.currentStep];
    if (!step?.target || step.fullscreen) return;

    function onScrollOrResize() {
      if (!step?.target) return;
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        requestAnimationFrame(() => measureElement(el));
      }
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [isActive, state.currentStep, measureElement]);

  // ─── Global click listener for data-tour-action ───────────────────────────

  useEffect(() => {
    if (!isActive) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (!target) return;
      const actionEl = target.closest('[data-tour-action]') as HTMLElement | null;
      if (!actionEl) return;
      const interactionId = actionEl.dataset.tourAction;
      if (!interactionId) return;
      dispatch({ type: 'COMPLETE_INTERACTION', interactionId });
    }

    document.addEventListener('click', handleClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [isActive]);

  // ─── Keyboard navigation ──────────────────────────────────────────────────

  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault();
          dispatch({ type: 'NEXT' });
          break;
        case 'ArrowLeft':
        case 'Backspace':
          e.preventDefault();
          dispatch({ type: 'BACK' });
          break;
        case 'Escape':
          e.preventDefault();
          dispatch({ type: 'SKIP' });
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  // ─── Next — dispatch and let auto-nav handle page transitions ───────────────

  const nextWithNav = useCallback(() => {
    dispatch({ type: 'NEXT' });
    // Auto-navigation is handled by the useEffect that watches state.currentStep
  }, []);

  const ctxValue: TourCtx = {
    state,
    steps: TOUR_STEPS,
    currentStep,
    start,
    next: nextWithNav,
    back,
    skip,
    isActive,
  };

  return <TourContext.Provider value={ctxValue}>{children}</TourContext.Provider>;
}

// ─── TourTrigger ──────────────────────────────────────────────────────────────

export function TourTrigger({ className }: { className?: string }) {
  const { start } = useTour();
  return (
    <button type="button" onClick={() => start(0)} className={className}>
      Take the tour
    </button>
  );
}
