'use client';

import { useEffect, useRef } from 'react';

interface SankofaBirdProps {
  size?: number;
  color?: string;
  animated?: boolean;
  className?: string;
}

/**
 * The Sankofa bird mark — the brand symbol.
 *
 * A stylised bird whose body and head face backward while its feet point forward,
 * an egg held in its open beak. The egg is the past you carry with you.
 *
 * Stroke-based (no fill), 1.5px stroke weight.
 * When `animated` is true, the bird draws itself via stroke-dasharray over 1800ms.
 */
export function SankofaBird({
  size = 40,
  color = 'currentColor',
  animated = false,
  className = '',
}: SankofaBirdProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const eggRef = useRef<SVGEllipseElement>(null);

  useEffect(() => {
    if (!animated) return;

    const path = pathRef.current;
    const egg = eggRef.current;
    if (!path || !egg) return;

    // Measure the total path length for stroke-dasharray animation
    const pathLength = path.getTotalLength();
    const eggCircumference = Math.PI * 2 * 4; // approximate

    // Set initial state — fully hidden
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;
    egg.style.strokeDasharray = `${eggCircumference}`;
    egg.style.strokeDashoffset = `${eggCircumference}`;

    // Trigger animation
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 1800ms cubic-bezier(0.4, 0, 0.2, 1)';
      path.style.strokeDashoffset = '0';

      egg.style.transition = 'stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1) 1400ms';
      egg.style.strokeDashoffset = '0';
    });
  }, [animated]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sankofa bird — go back and fetch it"
      role="img"
    >
      {/* Bird body — faces backward (left) while feet point forward (right) */}
      <path
        ref={pathRef}
        d={[
          // Head facing backward (left), looking over its shoulder
          'M 18 20',
          'C 14 18, 10 20, 10 24',      // Top of head curve
          'C 10 27, 12 29, 15 29',       // Lower jaw
          'L 18 28',                      // Jaw to beak connection
          // Neck curves back toward the body
          'C 20 30, 22 32, 24 34',
          'C 26 36, 28 36, 30 35',       // Neck-to-body transition
          // Body — full, rounded
          'C 34 33, 38 30, 40 28',       // Upper body
          'C 44 24, 46 22, 46 26',       // Back arch
          'C 46 30, 44 34, 42 38',       // Lower body / tail area
          // Tail feathers — swept backward elegantly
          'C 40 42, 36 46, 32 48',
          'C 28 50, 24 50, 22 48',
          // Legs — feet point forward (right), body faces left
          'M 36 38',
          'L 38 48',                      // Right leg down
          'L 42 50',                      // Right foot forward
          'M 32 40',
          'L 33 48',                      // Left leg down
          'L 37 50',                      // Left foot forward
          // Wing detail on body
          'M 30 30',
          'C 32 28, 36 28, 38 30',
          'C 40 32, 40 36, 38 38',
          // Eye
          'M 14 23',
          'C 14.5 22.5, 15.5 22.5, 16 23',
          'C 15.5 23.5, 14.5 23.5, 14 23',
          // Upper beak line (open, holding egg)
          'M 10 22',
          'L 6 20',
          // Lower beak
          'M 10 26',
          'L 6 27',
        ].join(' ')}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* The egg — held in the open beak */}
      <ellipse
        ref={eggRef}
        cx={5}
        cy={23.5}
        rx={3}
        ry={4}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        transform="rotate(-10, 5, 23.5)"
      />
    </svg>
  );
}
