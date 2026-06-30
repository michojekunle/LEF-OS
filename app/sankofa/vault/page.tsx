import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { hasSupabaseConfig } from '@/lib/supabase';
import {
  getAllStories,
  getFeaturedStory,
  SANKOFA_DOMAIN_META,
  type SankofaDomain,
} from '@/lib/sankofa-content';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sankofa Vault' };

const DOMAIN_ORDER: SankofaDomain[] = ['africa', 'world', 'economies', 'politics', 'people', 'ideas'];

export default async function SankofaVaultPage() {
  if (hasSupabaseConfig()) {
    const sb = await supabaseServer();
    const { data: u } = await sb.auth.getUser();
    if (!u.user) redirect('/login?next=/sankofa/vault');
  }

  const featured = getFeaturedStory();
  const all = getAllStories();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        color: '#F4F0EA',
        padding: '0',
      }}
    >
      {/* Nav bar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid #1e1e1e',
          background: '#0A0A0A',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/sankofa" style={{ color: '#c9ab70', textDecoration: 'none', fontFamily: 'monospace', fontSize: '0.75rem', letterSpacing: '0.25em' }}>
          SANKOFA
        </Link>
        <div style={{ display: 'flex', gap: '32px' }}>
          {DOMAIN_ORDER.map((d) => (
            <Link
              key={d}
              href={`/sankofa/vault/${d}`}
              style={{ color: '#F4F0EA', opacity: 0.5, textDecoration: 'none', fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.15em', transition: 'opacity 0.2s' }}
            >
              {d.toUpperCase()}
            </Link>
          ))}
        </div>
      </nav>

      {/* Featured story */}
      <Link
        href={`/sankofa/vault/story/${featured.id}`}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <section
          style={{
            padding: 'clamp(60px, 10vw, 120px) clamp(24px, 8vw, 80px)',
            borderBottom: '1px solid #1e1e1e',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.25em', color: SANKOFA_DOMAIN_META[featured.domain].colour, marginBottom: '24px' }}>
            TODAY&apos;S STORY · {SANKOFA_DOMAIN_META[featured.domain].label.toUpperCase()} · {featured.era}
          </div>
          <h1
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: '#F4F0EA',
              maxWidth: '900px',
              margin: '0 0 32px',
            }}
          >
            {featured.title}
          </h1>
          <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              lineHeight: 1.8,
              color: '#F4F0EA',
              opacity: 0.7,
              maxWidth: '700px',
              margin: '0 0 40px',
            }}
          >
            {featured.tldr}
          </p>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.15em', color: '#c9ab70' }}>
              READ THE FULL ARCHIVE →
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', opacity: 0.4, letterSpacing: '0.1em' }}>
              {featured.figures.slice(0, 3).join(' · ')}
            </span>
          </div>
        </section>
      </Link>

      {/* Domain grid */}
      <section style={{ padding: 'clamp(40px, 6vw, 80px) clamp(24px, 8vw, 80px)' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.25em', opacity: 0.4, marginBottom: '40px' }}>
          THE ARCHIVE · {all.length} ENTRIES
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1px',
            border: '1px solid #1e1e1e',
          }}
        >
          {DOMAIN_ORDER.map((domain) => {
            const meta = SANKOFA_DOMAIN_META[domain];
            const domainStories = all.filter((s) => s.domain === domain);
            return (
              <Link
                key={domain}
                href={`/sankofa/vault/${domain}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    padding: '40px 32px',
                    borderRight: '1px solid #1e1e1e',
                    borderBottom: '1px solid #1e1e1e',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{meta.icon}</div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '0.25em',
                      color: meta.colour,
                      marginBottom: '12px',
                    }}
                  >
                    {domain.toUpperCase()}
                  </div>
                  <h3
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#F4F0EA',
                      margin: '0 0 12px',
                      lineHeight: 1.2,
                    }}
                  >
                    {meta.label}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.65rem',
                      opacity: 0.4,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {domainStories.length} {domainStories.length === 1 ? 'ENTRY' : 'ENTRIES'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
