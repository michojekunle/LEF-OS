'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Volume2,
  VolumeX,
  Share2,
  X,
  Link2,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { DOMAIN_META, type Domain } from '@/data/curriculum-data';
import { DOMAIN_ACCENT_TEXT } from '@/lib/domain';
import {
  hookFromEnriched,
  type EnrichedByDomain,
  type EnrichedData,
} from '@/lib/enriched-content';
import { readingTime, totalReadingTime } from '@/lib/reading-time';

type Props = {
  day: number;
  topics: Record<Domain, string | null>;
  enriched: EnrichedByDomain;
  preferredDomains: Domain[];
  isAuthed: boolean;
  username: string | null;
};

const ORDER: Domain[] = ['law', 'economics', 'finance'];

export function BriefDeck({
  day,
  topics,
  enriched,
  preferredDomains,
  isAuthed,
  username,
}: Props) {
  // Render only the user's preferred domains, but preserve canonical order.
  const cards = ORDER.filter((d) => preferredDomains.includes(d));

  // Track active card for the mobile dots indicator
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Scroll-snap → active dot. Recomputed on scroll.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const cardWidth = el.clientWidth;
      const i = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(i);
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="space-y-6">
      {/* Mobile: horizontal snap-scroll. Desktop: vertical stack. */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:snap-none md:grid-cols-1 md:gap-6 md:overflow-visible md:pb-0"
        style={{ scrollbarWidth: 'none' }}
      >
        {cards.map((domain) => (
          <BriefCard
            key={domain}
            domain={domain}
            day={day}
            topic={topics[domain]}
            entry={enriched[domain]}
            username={username}
          />
        ))}

        {/* Final card — reflection + CTA for anonymous readers */}
        <ReflectionCard
          day={day}
          enriched={enriched}
          preferredDomains={cards}
          isAuthed={isAuthed}
        />
      </div>

      {/* Mobile dots */}
      <div className="flex items-center justify-center gap-1.5 md:hidden">
        {[...cards, 'reflection'].map((_, i) => (
          <span
            key={i}
            className={`block h-1.5 w-1.5 rounded-full transition-all ${
              i === activeIndex ? 'w-5 bg-gold' : 'bg-surface-2'
            }`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

// ── Single domain card ────────────────────────────────────────────────────────

function BriefCard({
  domain,
  day,
  topic,
  entry,
  username,
}: {
  domain: Domain;
  day: number;
  topic: string | null;
  entry: EnrichedData | null;
  username: string | null;
}) {
  const meta = DOMAIN_META[domain];
  const accent = DOMAIN_ACCENT_TEXT[domain];
  const hook = hookFromEnriched(entry);
  const objective = entry?.objectives?.[0] ?? null;

  const cardReadingTime = totalReadingTime([topic, hook, objective]);

  return (
    <article
      className="card flex w-[88vw] shrink-0 snap-center flex-col gap-4 p-6 md:w-auto md:shrink"
      data-domain={domain}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            {meta.icon}
          </span>
          <span className={`text-sm font-semibold uppercase tracking-wider ${accent}`}>
            {meta.label}
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          {cardReadingTime.label}
        </span>
      </header>

      {/* Topic */}
      {topic ? (
        <h2 className="font-display text-xl font-bold leading-snug tracking-tight text-text-primary md:text-2xl">
          {topic}
        </h2>
      ) : (
        <p className="text-sm italic text-text-muted">
          Today is a review & integration day for {meta.label}.
        </p>
      )}

      {/* Hook */}
      {hook && (
        <p className="text-base leading-relaxed text-text-primary md:text-[17px]">{hook}</p>
      )}

      {/* Today you'll understand */}
      {objective && (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-surface-2/40 p-3 text-sm leading-snug text-text-secondary">
          <span className="font-semibold text-text-primary">📌 Today you&apos;ll understand:</span>{' '}
          {objective}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
        <Link
          href={`/day/${day}?domain=${domain}`}
          className={`inline-flex items-center gap-1.5 text-sm font-semibold ${accent} hover:underline`}
        >
          Read full lesson <ArrowRight size={14} />
        </Link>
        <div className="flex items-center gap-1">
          <ListenButton text={composeSpeechText(meta.label, topic, hook, objective)} />
          <ShareMenu
            day={day}
            domain={domain}
            topic={topic}
            hook={hook}
            username={username}
          />
        </div>
      </div>
    </article>
  );
}

function composeSpeechText(
  label: string,
  topic: string | null,
  hook: string | null,
  objective: string | null,
): string {
  return [
    `${label}.`,
    topic ? `Today's topic: ${topic}.` : '',
    hook ?? '',
    objective ? `Today you'll understand: ${objective}` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

// ── Reflection / sign-in card ─────────────────────────────────────────────────

function ReflectionCard({
  day,
  enriched,
  preferredDomains,
  isAuthed,
}: {
  day: number;
  enriched: EnrichedByDomain;
  preferredDomains: Domain[];
  isAuthed: boolean;
}) {
  // Use the first available question across the user's preferred domains
  const question =
    preferredDomains
      .map((d) => enriched[d]?.questions?.[0])
      .find((q): q is string => Boolean(q)) ?? null;

  return (
    <article className="card-2 flex w-[88vw] shrink-0 snap-center flex-col gap-4 border-gold/30 p-6 md:w-auto md:shrink">
      <header className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          🪞
        </span>
        <span className="text-sm font-semibold uppercase tracking-wider text-gold">
          Reflection
        </span>
      </header>

      {question ? (
        <>
          <p className="font-display text-lg font-medium leading-snug text-text-primary">
            “{question}”
          </p>
          <p className="text-sm text-text-secondary">
            Sit with this for a minute. Your honest answer is the lesson.
          </p>
        </>
      ) : (
        <p className="text-sm text-text-secondary">
          You&apos;ve read today&apos;s brief. The next step is to make it stick.
        </p>
      )}

      <div className="mt-auto space-y-2 border-t border-[var(--border-subtle)] pt-3">
        {isAuthed ? (
          <Link
            href={`/day/${day}#log-panel`}
            className="btn btn-primary inline-flex w-full items-center justify-center gap-2 text-sm"
          >
            Log today&apos;s insight <ArrowRight size={14} />
          </Link>
        ) : (
          <Link
            href={`/login?next=/day/${day}`}
            className="btn btn-primary inline-flex w-full items-center justify-center gap-2 text-sm"
          >
            Sign up to save your thinking <ArrowRight size={14} />
          </Link>
        )}
        <p className="text-center text-xs text-text-muted">
          {isAuthed
            ? 'Saves to your private journal.'
            : 'Free. Tracks your streak, saves your notes, unlocks LEF Counsel.'}
        </p>
      </div>
    </article>
  );
}

// ── Listen button — Web Speech API (Part 7) ───────────────────────────────────

function ListenButton({ text }: { text: string }) {
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setAvailable(typeof window !== 'undefined' && 'speechSynthesis' in window);
    // Stop speech if the user navigates away or the component unmounts
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggle = useCallback(() => {
    if (!available) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    window.speechSynthesis.cancel(); // clear any other in-flight speech
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-NG';
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.onend = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
    setPlaying(true);
  }, [available, playing, text]);

  if (!available) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={playing ? 'Stop reading' : 'Read aloud'}
      aria-label={playing ? 'Stop reading' : 'Read aloud'}
      className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
    >
      {playing ? <VolumeX size={14} /> : <Volume2 size={14} />}
    </button>
  );
}

// ── Share menu (Part 10) ──────────────────────────────────────────────────────

function ShareMenu({
  day,
  domain,
  topic,
  hook,
  username,
}: {
  day: number;
  domain: Domain;
  topic: string | null;
  hook: string | null;
  username: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const permalink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/day/${day}?domain=${domain}`
      : `/day/${day}?domain=${domain}`;

  const shareText = encodeURIComponent(
    `${topic ?? 'Today on LEF'} — ${hook ?? 'A 5-minute lesson'}\n\n${permalink}`,
  );
  const shareUrl = encodeURIComponent(permalink);

  const ogUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/og/brief?` +
        new URLSearchParams({
          day: String(day),
          domain,
          theme: localStorage.getItem('lef-theme') ?? 'dark',
          ...(username ? { username } : {}),
        })
      : '';

  const links = [
    {
      label: 'X',
      icon: <Twitter size={13} />,
      href: `https://twitter.com/intent/tweet?text=${shareText}`,
    },
    {
      label: 'LinkedIn',
      icon: <Linkedin size={13} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    },
    {
      label: 'WhatsApp',
      icon: <Share2 size={13} />,
      href: `https://wa.me/?text=${shareText}`,
    },
  ];

  async function copyLink() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(permalink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Share this lesson"
        aria-label="Share this lesson"
        className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
      >
        {open ? <X size={14} /> : <Share2 size={14} />}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-64 rounded-xl border border-[var(--border-subtle)] bg-surface p-3 shadow-2xl">
          {ogUrl && (
            <div className="mb-3 overflow-hidden rounded-md border border-[var(--border-subtle)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ogUrl}
                alt="Share preview"
                className="w-full"
                style={{ aspectRatio: '1200 / 630' }}
              />
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-surface-2 px-2.5 py-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
              >
                {l.icon} {l.label}
              </a>
            ))}
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-surface-2 px-2.5 py-1 text-xs text-text-secondary transition-colors hover:text-gold"
            >
              <Link2 size={13} /> {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Reading time util currently used inline above; export ref kept for tree-shaking
export { readingTime };
