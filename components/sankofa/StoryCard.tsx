import Link from 'next/link';
import { SANKOFA_DOMAIN_META, type SankofaStory } from '@/lib/sankofa-content';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  story: SankofaStory;
  index?: number;
  size?: Size;
  showIndex?: boolean;
};

export function StoryCard({ story, index, size = 'md', showIndex = false }: Props) {
  const meta = SANKOFA_DOMAIN_META[story.domain];

  const padding = size === 'sm' ? '20px' : size === 'lg' ? '40px 32px' : '28px 24px';
  const titleSize = size === 'sm' ? '1rem' : size === 'lg' ? 'clamp(1.4rem, 2.5vw, 2rem)' : '1.2rem';

  return (
    <Link href={`/sankofa/vault/story/${story.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        style={{
          padding,
          borderBottom: '1px solid #1e1e1e',
          cursor: 'pointer',
          display: showIndex ? 'grid' : 'block',
          gridTemplateColumns: showIndex ? '64px 1fr' : undefined,
          gap: showIndex ? '24px' : undefined,
          alignItems: 'start',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#111')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      >
        {showIndex && (
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              opacity: 0.25,
              paddingTop: '4px',
            }}
          >
            {index !== undefined ? String(index + 1).padStart(2, '0') : '—'}
          </div>
        )}

        <div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              color: meta.colour,
              marginBottom: '8px',
            }}
          >
            {meta.icon} {meta.label.toUpperCase()} · {story.era}
          </div>

          <h3
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#F4F0EA',
              margin: '0 0 10px',
            }}
          >
            {story.title}
          </h3>

          {size !== 'sm' && (
            <p
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                opacity: 0.55,
                margin: '0 0 14px',
              }}
            >
              {story.tldr.slice(0, 100)}…
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {story.figures.slice(0, size === 'sm' ? 2 : 3).map((f) => (
              <span
                key={f}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.55rem',
                  opacity: 0.3,
                  letterSpacing: '0.06em',
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
