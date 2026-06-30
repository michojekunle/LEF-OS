import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getStoriesByDomain,
  SANKOFA_DOMAIN_META,
  type SankofaDomain,
} from '@/lib/sankofa-content';

export const dynamic = 'force-dynamic';

const VALID_DOMAINS: SankofaDomain[] = ['africa', 'world', 'economies', 'politics', 'people', 'ideas'];

type Props = { params: Promise<{ domain: string }> };

export async function generateMetadata({ params }: Props) {
  const { domain } = await params;
  if (!VALID_DOMAINS.includes(domain as SankofaDomain)) return {};
  const meta = SANKOFA_DOMAIN_META[domain as SankofaDomain];
  return { title: `${meta.label} — Sankofa Archive` };
}

export default async function DomainArchivePage({ params }: Props) {
  const { domain } = await params;
  if (!VALID_DOMAINS.includes(domain as SankofaDomain)) notFound();

  const d = domain as SankofaDomain;
  const meta = SANKOFA_DOMAIN_META[d];
  const stories = getStoriesByDomain(d);

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F4F0EA' }}>
      {/* Header */}
      <div
        style={{
          padding: 'clamp(60px, 10vw, 100px) clamp(24px, 8vw, 80px) 40px',
          borderBottom: '1px solid #1e1e1e',
        }}
      >
        <Link
          href="/sankofa/vault"
          style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: meta.colour, textDecoration: 'none', display: 'inline-block', marginBottom: '32px' }}
        >
          ← VAULT
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <span style={{ fontSize: '3rem' }}>{meta.icon}</span>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: meta.colour, marginBottom: '6px' }}>
              SANKOFA ARCHIVE
            </div>
            <h1
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(3rem, 7vw, 6rem)',
                fontWeight: 700,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {meta.label}
            </h1>
          </div>
        </div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', opacity: 0.4, letterSpacing: '0.1em', marginTop: '16px' }}>
          {stories.length} {stories.length === 1 ? 'ENTRY' : 'ENTRIES'} IN THE ARCHIVE
        </p>
      </div>

      {/* Stories list */}
      <div style={{ padding: 'clamp(24px, 6vw, 60px) clamp(24px, 8vw, 80px)' }}>
        {stories.length === 0 ? (
          <div style={{ opacity: 0.3, fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.1em', paddingTop: '60px' }}>
            THE ARCHIVE IS BEING ASSEMBLED. CHECK BACK SOON.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid #1e1e1e' }}>
            {stories.map((story, i) => (
              <Link
                key={story.id}
                href={`/sankofa/vault/story/${story.id}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <article
                  style={{
                    padding: '32px',
                    borderBottom: i < stories.length - 1 ? '1px solid #1e1e1e' : 'none',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    gap: '32px',
                    alignItems: 'start',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.15em', opacity: 0.3, paddingTop: '6px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: meta.colour, marginBottom: '10px' }}>
                      {story.era}
                    </div>
                    <h2
                      style={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: '#F4F0EA',
                        margin: '0 0 12px',
                      }}
                    >
                      {story.title}
                    </h2>
                    <p
                      style={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: '1rem',
                        lineHeight: 1.7,
                        opacity: 0.6,
                        margin: '0 0 16px',
                        maxWidth: '600px',
                      }}
                    >
                      {story.tldr.slice(0, 120)}…
                    </p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {story.figures.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          style={{ fontFamily: 'monospace', fontSize: '0.6rem', opacity: 0.35, letterSpacing: '0.08em' }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
