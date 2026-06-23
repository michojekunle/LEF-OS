'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { SankofaBird } from '@/components/sankofa/SankofaBird';

/* ──────────────────────────────────────────────────────────────────
   DOMAIN DATA
   ────────────────────────────────────────────────────────────────── */
const DOMAINS = [
  {
    id: 'africa',
    name: 'Africa',
    emoji: '🌍',
    color: 'var(--s-africa)',
    hex: '#2D5A3D',
    tagline: "The continent they didn't teach you.",
    preview: 'Day 1: The great kingdoms before colonialism',
  },
  {
    id: 'world',
    name: 'World',
    emoji: '🌐',
    color: 'var(--s-world)',
    hex: '#4A6B8A',
    tagline: 'Every civilization. Every era.',
    preview: 'Day 1: How Mesopotamia invented everything',
  },
  {
    id: 'economies',
    name: 'Economies',
    emoji: '⚖️',
    color: 'var(--s-gold)',
    hex: '#C4A24A',
    tagline: 'How wealth was built and stolen.',
    preview: 'Day 1: The first trade routes in human history',
  },
  {
    id: 'politics',
    name: 'Politics',
    emoji: '👑',
    color: 'var(--s-crimson)',
    hex: '#7A3A4A',
    tagline: 'Power, empire, resistance.',
    preview: 'Day 1: Why Rome fell and what it took with it',
  },
  {
    id: 'people',
    name: 'People',
    emoji: '✍️',
    color: 'var(--s-accent)',
    hex: '#C4633A',
    tagline: 'The figures behind the forces.',
    preview: 'Day 1: Mansa Musa — the richest person who ever lived',
  },
  {
    id: 'ideas',
    name: 'Ideas',
    emoji: '📜',
    color: 'var(--s-mahogany)',
    hex: '#8B6B3A',
    tagline: 'Religion, science, and philosophy.',
    preview: 'Day 1: How Islam spread faster than any army',
  },
] as const;

/* ──────────────────────────────────────────────────────────────────
   TIER DATA
   ────────────────────────────────────────────────────────────────── */
const TIERS = [
  { name: 'Learner', symbol: '○', threshold: 'Day 1' },
  { name: 'Chronicler', symbol: '◐', threshold: '30 lessons' },
  { name: 'Historian', symbol: '●', threshold: '100 lessons' },
  { name: 'Elder', symbol: '◉', threshold: '365 across 4+' },
  { name: 'Griot', symbol: '✦', threshold: 'All 6 domains' },
] as const;

/* ──────────────────────────────────────────────────────────────────
   INTERSECTION OBSERVER HOOK
   ────────────────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ──────────────────────────────────────────────────────────────────
   AFRICA SVG CONTINENT OUTLINE
   ────────────────────────────────────────────────────────────────── */
function AfricaOutline() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = mq.matches ? '0' : `${len}`;

    if (!mq.matches) {
      requestAnimationFrame(() => {
        path.style.transition = 'stroke-dashoffset 3000ms cubic-bezier(0.4, 0, 0.2, 1)';
        path.style.strokeDashoffset = '0';
      });
    }
  }, []);

  return (
    <svg
      viewBox="0 0 400 500"
      className="sankofa-africa-outline"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d={[
          'M 200 30',
          'C 230 28, 260 30, 280 40',
          'C 310 55, 330 70, 340 90',
          'C 350 110, 345 130, 340 150',
          'C 335 165, 325 175, 320 190',
          'C 315 205, 320 220, 325 240',
          'C 332 260, 338 280, 340 300',
          'C 342 320, 338 340, 330 360',
          'C 320 380, 305 395, 290 410',
          'C 275 425, 260 435, 250 450',
          'C 240 460, 225 468, 210 470',
          'C 195 472, 180 465, 170 455',
          'C 155 440, 140 420, 130 400',
          'C 118 375, 105 350, 95 320',
          'C 85 290, 80 260, 78 230',
          'C 76 200, 80 170, 90 145',
          'C 100 120, 115 100, 130 85',
          'C 145 70, 165 50, 180 38',
          'C 190 32, 195 30, 200 30',
          'Z',
        ].join(' ')}
        stroke="var(--s-border)"
        strokeWidth={1}
        fill="none"
      />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────
   DOMAIN ICON SVG (abstract shape per domain)
   ────────────────────────────────────────────────────────────────── */
function DomainIcon({ id, color }: { id: string; color: string }) {
  const shapes: Record<string, React.ReactNode> = {
    africa: (
      <path
        d="M 20 4 C 28 6, 34 14, 34 22 C 34 30, 28 36, 20 38 C 14 36, 8 30, 6 22 C 6 14, 12 6, 20 4 Z"
        stroke={color} strokeWidth={1.5} fill="none"
      />
    ),
    world: (
      <>
        <circle cx={20} cy={20} r={15} stroke={color} strokeWidth={1.5} fill="none" />
        <ellipse cx={20} cy={20} rx={8} ry={15} stroke={color} strokeWidth={1} fill="none" />
        <line x1={5} y1={20} x2={35} y2={20} stroke={color} strokeWidth={1} />
      </>
    ),
    economies: (
      <>
        <line x1={8} y1={34} x2={8} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <line x1={16} y1={34} x2={16} y2={10} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <line x1={24} y1={34} x2={24} y2={22} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <line x1={32} y1={34} x2={32} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
      </>
    ),
    politics: (
      <>
        <polygon points="20,4 6,16 14,16 14,36 26,36 26,16 34,16" stroke={color} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
      </>
    ),
    people: (
      <>
        <circle cx={20} cy={14} r={7} stroke={color} strokeWidth={1.5} fill="none" />
        <path d="M 6 36 C 6 26, 12 22, 20 22 C 28 22, 34 26, 34 36" stroke={color} strokeWidth={1.5} fill="none" />
      </>
    ),
    ideas: (
      <>
        <circle cx={20} cy={16} r={10} stroke={color} strokeWidth={1.5} fill="none" />
        <line x1={20} y1={26} x2={20} y2={34} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <line x1={15} y1={36} x2={25} y2={36} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </>
    ),
  };

  return (
    <svg width={40} height={40} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {shapes[id]}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────
   SANKOFA COMING SOON PAGE
   ────────────────────────────────────────────────────────────────── */
export default function SankofaPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  // Hero entrance stagger
  useEffect(() => {
    setMounted(true);
  }, []);

  // Section observers
  const domains = useInView(0.15);
  const howItWorks = useInView(0.15);
  const twoPaths = useInView(0.15);
  const griotPath = useInView(0.15);
  const waitlist = useInView(0.15);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || formState === 'loading') return;

    setFormState('loading');

    try {
      const res = await fetch('/api/sankofa/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.message === 'already_registered') {
        setFormState('duplicate');
      } else if (res.ok) {
        setFormState('success');
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  }, [email, formState]);

  return (
    <div data-theme="sankofa" className="sankofa-page">
      {/* ── SVG Grain Filter Definition ────────────────────────── */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="sankofa-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={3} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
      </svg>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 1 — HERO
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="sankofa-hero" id="sankofa-hero">
        {/* Grain overlay */}
        <div className="sankofa-grain" aria-hidden="true" />
        {/* Africa outline behind text */}
        <AfricaOutline />

        <div className="sankofa-hero-content">
          {/* Badge */}
          <div
            className="sankofa-badge"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 400ms ease, transform 400ms ease',
              transitionDelay: '200ms',
            }}
          >
            <span>⚗</span> COMING SOON &nbsp;·&nbsp; SANKOFA
          </div>

          {/* Sankofa Bird */}
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transition: 'opacity 600ms ease',
              transitionDelay: '400ms',
            }}
          >
            <SankofaBird size={72} color="var(--s-accent)" animated={mounted} />
          </div>

          {/* Main heading */}
          <h1 className="sankofa-h1">
            <span
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 500ms ease, transform 500ms ease',
                transitionDelay: '600ms',
                display: 'block',
              }}
            >
              Every day,
            </span>
            <em
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 500ms ease, transform 500ms ease',
                transitionDelay: '800ms',
                display: 'block',
              }}
            >
              one true story.
            </em>
          </h1>

          {/* Be the griot */}
          <p
            className="sankofa-griot-tagline"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 500ms ease, transform 500ms ease',
              transitionDelay: '1000ms',
            }}
          >
            <span className="sankofa-quote-mark" aria-hidden="true">&ldquo;</span>
            Be the griot.
            <span className="sankofa-quote-mark" aria-hidden="true">&rdquo;</span>
          </p>

          {/* Subheading */}
          <p
            className="sankofa-subheading"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 500ms ease, transform 500ms ease',
              transitionDelay: '1200ms',
            }}
          >
            A daily practice in world history. Africa, civilizations, empires,
            economies, and the people who shaped them all.
          </p>

          {/* Three-beat closer */}
          <div
            className="sankofa-three-beat"
            style={{
              opacity: mounted ? 1 : 0,
              transition: 'opacity 500ms ease',
              transitionDelay: '1400ms',
            }}
          >
            {['Go back.', 'Fetch it.', 'Carry it forward.'].map((line, i) => (
              <p
                key={line}
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 400ms ease, transform 400ms ease',
                  transitionDelay: `${1400 + i * 150}ms`,
                }}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Hero decorative rule */}
          <div className="sankofa-hero-rule" aria-hidden="true" />

          {/* Earned promise */}
          <p
            className="sankofa-promise"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 500ms ease, transform 500ms ease',
              transitionDelay: '1900ms',
            }}
          >
            After a year, you&rsquo;ll walk into any conversation about Africa,
            empire, power, money, or civilization — and you&rsquo;ll have
            something real to say.
          </p>

          {/* CTA block */}
          <div
            className="sankofa-hero-cta"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 500ms ease, transform 500ms ease',
              transitionDelay: '2100ms',
            }}
          >
            <a href="#sankofa-waitlist" className="sankofa-btn-primary">
              Join the Waitlist →
            </a>
            <Link href="/" className="sankofa-btn-secondary">
              Back to LEF-OS
            </Link>
          </div>
        </div>
      </section>

      <div className="sankofa-divider" aria-hidden="true" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 2 — THE SIX DOMAINS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        ref={domains.ref}
        className={`sankofa-section sankofa-domains ${domains.visible ? 'in-view' : ''}`}
        id="sankofa-domains"
      >
        <div className="sankofa-container">
          <h2 className="sankofa-h2">Six lenses. One living world.</h2>
          <div className="sankofa-domain-grid">
            {DOMAINS.map((d, i) => (
              <div
                key={d.id}
                className="sankofa-domain-card"
                style={{
                  '--domain-color': d.color,
                  transitionDelay: domains.visible ? `${i * 60}ms` : '0ms',
                } as React.CSSProperties}
              >
                <DomainIcon id={d.id} color={d.hex} />
                <h3
                  className="sankofa-domain-name"
                  style={{ color: d.color }}
                >
                  {d.emoji} {d.name}
                </h3>
                <p className="sankofa-domain-tagline">{d.tagline}</p>
                <span className="sankofa-domain-preview">{d.preview}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sankofa-divider" aria-hidden="true" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 3 — HOW IT WORKS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        ref={howItWorks.ref}
        className={`sankofa-section sankofa-how ${howItWorks.visible ? 'in-view' : ''}`}
        id="sankofa-how"
      >
        <div className="sankofa-container">
          <h2 className="sankofa-h2">Learn like the ancients taught.</h2>
          <p className="sankofa-section-sub">A daily ritual, not a curriculum.</p>

          <div className="sankofa-how-grid">
            <div className="sankofa-how-card">
              <div className="sankofa-how-icon-wrap">
                <span className="sankofa-how-icon" aria-hidden="true">☀️</span>
              </div>
              <h3 className="sankofa-h3">3 minutes every morning</h3>
              <p className="sankofa-body">
                One true historical story. One fact that changes how you see
                today. Bite-sized. Made to be read before coffee.
              </p>
            </div>
            <div className="sankofa-how-card">
              <div className="sankofa-how-icon-wrap">
                <span className="sankofa-how-icon" aria-hidden="true">📖</span>
              </div>
              <h3 className="sankofa-h3">Go deeper when it calls you</h3>
              <p className="sankofa-body">
                Behind every story is a full resource trail — the documentary,
                the book, the Substack, the academic paper. Follow the thread as
                far as you want.
              </p>
            </div>
            <div className="sankofa-how-card">
              <div className="sankofa-how-icon-wrap">
                <span className="sankofa-how-icon" aria-hidden="true">🗺️</span>
              </div>
              <h3 className="sankofa-h3">Guided or self-directed</h3>
              <p className="sankofa-body">
                Let the AI build your curriculum based on what you want to know,
                or navigate the full archive yourself. Both paths are valid.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="sankofa-divider" aria-hidden="true" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 4 — THE TWO PATHS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        ref={twoPaths.ref}
        className={`sankofa-section sankofa-paths ${twoPaths.visible ? 'in-view' : ''}`}
        id="sankofa-paths"
      >
        <div className="sankofa-container">
          <h2 className="sankofa-h2">Two ways to travel.</h2>
          <div className="sankofa-paths-grid">
            {/* Guided Path */}
            <div className="sankofa-path-card" style={{ '--path-color': 'var(--s-africa)' } as React.CSSProperties}>
              <span className="sankofa-path-badge" style={{ color: 'var(--s-africa)' }}>STRUCTURED</span>
              <h3 className="sankofa-h3">Let the curriculum lead</h3>
              <p className="sankofa-body">
                A curated sequence from ancient to modern, continent by
                continent. Perfect for beginners who don&rsquo;t know where to
                start.
              </p>
              <div className="sankofa-path-tags">
                <span>365 daily lessons</span>
                <span>Logical sequence</span>
                <span>Zero decision fatigue</span>
              </div>
              <div className="sankofa-path-status sankofa-path-status--active">
                Building now
              </div>
            </div>

            {/* Explorer's Path */}
            <div className="sankofa-path-card" style={{ '--path-color': 'var(--s-world)' } as React.CSSProperties}>
              <span className="sankofa-path-badge" style={{ color: 'var(--s-world)' }}>ADAPTIVE AI</span>
              <h3 className="sankofa-h3">Build your own obsession</h3>
              <p className="sankofa-body">
                Tell the AI what fascinates you — African kingdoms, Cold War,
                the Ottoman Empire, the history of money — and it builds your
                learning trail.
              </p>
              <div className="sankofa-path-tags">
                <span>AI-curated</span>
                <span>Community-sourced</span>
                <span>Infinitely deep</span>
              </div>
              <div className="sankofa-path-status sankofa-path-status--future">
                Coming in v2
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sankofa-divider" aria-hidden="true" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 5 — THE PATH TO GRIOT
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        ref={griotPath.ref}
        className={`sankofa-section sankofa-griot ${griotPath.visible ? 'in-view' : ''}`}
        id="sankofa-griot"
      >
        <div className="sankofa-container">
          <h2 className="sankofa-h2">
            Learner. Chronicler. Historian. Elder.{' '}
            <em style={{ color: 'var(--s-accent)' }}>Griot.</em>
          </h2>
          <p className="sankofa-section-sub" style={{ maxWidth: 560 }}>
            The journey has five tiers. Complete the year across all six domains
            and you earn the title only oral historians carried —{' '}
            <strong>Griot</strong>. Keeper. The one who holds and shares the
            memory.
          </p>

          <div className="sankofa-tiers">
            {TIERS.map((tier, i) => {
              const isGriot = tier.name === 'Griot';
              return (
                <React.Fragment key={tier.name}>
                  <div
                    className={`sankofa-tier ${isGriot ? 'sankofa-tier--griot' : ''}`}
                    style={{
                      transitionDelay: griotPath.visible ? `${i * 200}ms` : '0ms',
                    }}
                  >
                    <div className={`sankofa-tier-seal ${isGriot ? 'sankofa-tier-seal--griot' : ''}`}>
                      {isGriot ? (
                        <SankofaBird size={32} color="var(--s-text-primary)" />
                      ) : (
                        <span className="sankofa-tier-symbol">{tier.symbol}</span>
                      )}
                    </div>
                    <span className="sankofa-tier-name">{tier.name}</span>
                    <span className="sankofa-tier-threshold">{tier.threshold}</span>
                  </div>
                  {i < TIERS.length - 1 && (
                    <span className="sankofa-tier-arrow" aria-hidden="true">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      <div className="sankofa-divider" aria-hidden="true" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 6 — WAITLIST SIGNUP
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        ref={waitlist.ref}
        className={`sankofa-section sankofa-waitlist ${waitlist.visible ? 'in-view' : ''}`}
        id="sankofa-waitlist"
      >
        <div className="sankofa-container">
          {formState === 'success' || formState === 'duplicate' ? (
            <div className="sankofa-waitlist-success">
              <p className="sankofa-waitlist-confirm">
                {formState === 'duplicate'
                  ? "You're already on the list."
                  : "You're on the list. The archive is waiting."}
              </p>
              <div className="sankofa-three-beat sankofa-three-beat--small">
                <p>Go back.</p>
                <p>Fetch it.</p>
                <p>Carry it forward.</p>
              </div>
            </div>
          ) : (
            <>
              <SankofaBird size={40} color="var(--s-gold)" className="sankofa-waitlist-bird" />
              <h2 className="sankofa-h2 sankofa-h2--light">
                History rewards the curious.
              </h2>
              <p className="sankofa-waitlist-sub">
                Be first to walk the path. Be first to become a griot.
              </p>
              <form onSubmit={handleSubmit} className="sankofa-waitlist-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="sankofa-waitlist-input"
                  id="sankofa-email-input"
                  aria-label="Email address for Sankofa waitlist"
                />
                <button
                  type="submit"
                  disabled={formState === 'loading'}
                  className="sankofa-waitlist-btn"
                  id="sankofa-join-btn"
                >
                  {formState === 'loading' ? 'Joining...' : 'Join Waitlist →'}
                </button>
              </form>
              {formState === 'error' && (
                <p className="sankofa-waitlist-error">
                  Something went wrong. Please try again.
                </p>
              )}
              <p className="sankofa-waitlist-note">
                No spam. Just history. Unsubscribe any day.
              </p>
            </>
          )}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 7 — FOOTER
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="sankofa-footer" id="sankofa-footer">
        <div className="sankofa-footer-inner">
          <span className="sankofa-footer-brand"><SankofaBird size={16} color="var(--s-text-muted)" /> Sankofa · Part of the LEF-OS family</span>
          <Link href="/" className="sankofa-footer-link">
            ← Back to Law · Economics · Finance
          </Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
