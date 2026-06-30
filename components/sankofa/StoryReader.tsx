'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Bebas_Neue } from 'next/font/google';
import type { SankofaStory } from '@/lib/sankofa-content';
import { SANKOFA_DOMAIN_META } from '@/lib/sankofa-content';
import { readingTime } from '@/lib/reading-time';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
});
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

type Props = { story: SankofaStory; related: SankofaStory[] };

export function StoryReader({ story, related }: Props) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  const meta = SANKOFA_DOMAIN_META[story.domain];
  const { label: readLabel } = readingTime(story.body);

  // Reading progress bar
  useEffect(() => {
    function onScroll() {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // TTS
  function toggleListen() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const text = `${story.title}. ${story.tldr}. ${story.body.replace(/#+\s/g, '').replace(/\*\*/g, '')}`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-NG';
    utter.rate = 0.95;
    utter.onend = () => setIsPlaying(false);
    utter.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utter);
    setIsPlaying(true);
  }

  const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return (
    <div style={{ background: '#0A0A0A', color: '#F4F0EA', minHeight: '100vh' }}>
      {/* Progress bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '2px',
          width: `${progress}%`,
          background: meta.colour,
          zIndex: 100,
          transition: 'width 0.1s linear',
        }}
      />

      {/* Top nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid #1e1e1e',
          background: 'rgba(10,10,10,0.95)',
          backdropFilter: 'blur(8px)',
          padding: '14px clamp(24px, 8vw, 80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <Link
          href={`/sankofa/vault/${story.domain}`}
          style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: meta.colour, textDecoration: 'none' }}
        >
          ← {story.domain.toUpperCase()}
        </Link>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {hasSpeech && (
            <button
              type="button"
              onClick={toggleListen}
              style={{
                background: isPlaying ? meta.colour : 'transparent',
                border: `1px solid ${isPlaying ? meta.colour : '#333'}`,
                color: isPlaying ? '#0A0A0A' : '#F4F0EA',
                padding: '6px 14px',
                fontFamily: 'monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isPlaying ? '■ STOP' : '▶ LISTEN'}
            </button>
          )}
          <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', opacity: 0.35, letterSpacing: '0.1em' }}>
            {readLabel.toUpperCase()}
          </span>
        </div>
      </nav>

      {/* Article */}
      <article ref={articleRef}>
        {/* Hero header */}
        <header
          style={{
            padding: 'clamp(60px, 10vw, 120px) clamp(24px, 8vw, 80px) clamp(40px, 6vw, 80px)',
            borderBottom: '1px solid #1e1e1e',
            maxWidth: '1000px',
          }}
        >
          <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: meta.colour, marginBottom: '24px' }}>
            {meta.icon} {meta.label.toUpperCase()} · {story.era}
          </div>
          <h1
            className={cormorant.className}
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              margin: '0 0 40px',
              letterSpacing: '-0.01em',
            }}
          >
            {story.title}
          </h1>
          <p
            className={cormorant.className}
            style={{
              fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)',
              lineHeight: 1.8,
              fontStyle: 'italic',
              opacity: 0.75,
              maxWidth: '680px',
              fontWeight: 300,
            }}
          >
            {story.tldr}
          </p>

          {/* Figures */}
          {story.figures.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '32px' }}>
              {story.figures.map((f) => (
                <span
                  key={f}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.08em',
                    background: '#1a1a1a',
                    padding: '4px 10px',
                    opacity: 0.6,
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Body */}
        <div
          style={{
            padding: 'clamp(40px, 8vw, 80px) clamp(24px, 8vw, 80px)',
            maxWidth: '800px',
          }}
        >
          <StoryBody body={story.body} domainColour={meta.colour} className={cormorant.className} />
        </div>

        {/* Sources */}
        {story.sources.length > 0 && (
          <div
            style={{
              padding: '40px clamp(24px, 8vw, 80px)',
              borderTop: '1px solid #1e1e1e',
              maxWidth: '800px',
            }}
          >
            <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: meta.colour, marginBottom: '16px' }}>
              SOURCES
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              {story.sources.map((s, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    opacity: 0.5,
                    marginBottom: '6px',
                  }}
                >
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                      {s.label}
                    </a>
                  ) : (
                    s.label
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </article>

      {/* Related stories */}
      {related.length > 0 && (
        <section
          style={{
            padding: 'clamp(40px, 8vw, 80px) clamp(24px, 8vw, 80px)',
            borderTop: '1px solid #1e1e1e',
          }}
        >
          <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', opacity: 0.4, marginBottom: '32px' }}>
            YOU MIGHT ALSO READ
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1px',
              border: '1px solid #1e1e1e',
            }}
          >
            {related.map((r) => {
              const rm = SANKOFA_DOMAIN_META[r.domain];
              return (
                <Link
                  key={r.id}
                  href={`/sankofa/vault/story/${r.id}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div
                    style={{
                      padding: '28px 24px',
                      borderRight: '1px solid #1e1e1e',
                      borderBottom: '1px solid #1e1e1e',
                    }}
                  >
                    <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: rm.colour, marginBottom: '10px' }}>
                      {rm.label.toUpperCase()} · {r.era}
                    </div>
                    <h3
                      style={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        color: '#F4F0EA',
                        margin: 0,
                      }}
                    >
                      {r.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        style={{
          padding: '40px clamp(24px, 8vw, 80px)',
          borderTop: '1px solid #1e1e1e',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <Link
          href="/sankofa/vault"
          style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: meta.colour, textDecoration: 'none' }}
        >
          ← BACK TO VAULT
        </Link>
        <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', opacity: 0.25, letterSpacing: '0.15em' }}>
          SANKOFA · PHASE 02 KORAE
        </div>
      </footer>
    </div>
  );
}

// Lightweight inline markdown-to-JSX renderer (no external dependency)
function StoryBody({ body, domainColour, className }: { body: string; domainColour: string; className: string }) {
  const lines = body.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(1.3rem, 2vw, 1.8rem)', letterSpacing: '0.1em', color: domainColour, margin: '56px 0 20px', fontWeight: 400 }}>
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)', fontWeight: 700, fontStyle: 'italic', margin: '40px 0 16px', color: '#F4F0EA' }}>
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} style={{ borderLeft: `3px solid ${domainColour}`, margin: '32px 0', paddingLeft: '24px', fontStyle: 'italic', opacity: 0.8 }}>
          <p style={{ fontSize: 'clamp(1rem, 1.4vw, 1.1rem)', lineHeight: 1.8, margin: 0 }}>{line.slice(2)}</p>
        </blockquote>,
      );
    } else if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ paddingLeft: '24px', marginBottom: '24px' }}>
          {items.map((item, j) => (
            <li key={j} style={{ fontSize: 'clamp(1rem, 1.4vw, 1.1rem)', lineHeight: 1.8, marginBottom: '8px', opacity: 0.85 }}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>,
      );
      continue;
    } else if (line.trim() !== '') {
      elements.push(
        <p key={i} style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.2rem)', lineHeight: 1.9, marginBottom: '24px', color: '#F4F0EA', opacity: 0.85 }}>
          <InlineMarkdown text={line} />
        </p>,
      );
    }
    i++;
  }

  return <div className={className}>{elements}</div>;
}

// Handles **bold** inline markdown
function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} style={{ color: '#F4F0EA', fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
