'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  targetSelector: string;
  color?: string;
};

type BeaconPosition = { top: number; left: number };

export function TourBeacon({ targetSelector, color = 'var(--gold)' }: Props) {
  const [position, setPosition] = useState<BeaconPosition | null>(null);
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef<number | null>(null);
  // Tracks whether this component instance is still alive — prevents setState after unmount
  const alive = useRef(true);

  useEffect(() => {
    setMounted(true);
    alive.current = true;
    return () => {
      setMounted(false);
      alive.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Local flag stops this particular effect's RAF if the effect is cleaned up
    // (e.g. targetSelector changes) even before the component unmounts.
    let active = true;

    function update() {
      if (!alive.current || !active) return;

      const el = document.querySelector(`[data-tour="${targetSelector}"]`);
      if (!el) {
        setPosition(null);
        rafRef.current = requestAnimationFrame(update);
        return;
      }

      const rect = el.getBoundingClientRect();
      setPosition({ top: rect.top - 6, left: rect.right - 6 });
      // Element found — stop RAF, rely on scroll/resize events from here
    }

    function onScrollOrResize() {
      if (!alive.current) return;
      const el = document.querySelector(`[data-tour="${targetSelector}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setPosition({ top: rect.top - 6, left: rect.right - 6 });
      }
    }

    rafRef.current = requestAnimationFrame(update);
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      active = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [targetSelector]);

  if (!mounted || position === null) return null;

  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 73,
        pointerEvents: 'none',
        width: '8px',
        height: '8px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-4px',
          left: '-4px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          border: `2px solid ${color}`,
          animation: 'tour-beacon-pulse 1.8s ease-out infinite',
        }}
      />
      <style>{`
        @keyframes tour-beacon-pulse {
          0%   { transform: scale(0.8); opacity: 1; }
          70%  { transform: scale(2);   opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
