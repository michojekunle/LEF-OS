import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getStoriesByDomain,
  SANKOFA_DOMAIN_META,
  type SankofaDomain,
} from '@/lib/sankofa-content';
import { StoryCard } from '@/components/sankofa/StoryCard';

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
          <div style={{ border: '1px solid #1e1e1e' }}>
            {stories.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} size="lg" showIndex />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
