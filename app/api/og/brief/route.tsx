import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { findDayMeta, type Domain } from '@/data/curriculum-data';

export const runtime = 'edge';

const DOMAIN_COLOURS: Record<Domain, string> = {
  law: '#c9ab70',
  economics: '#80a394',
  finance: '#8fa3d0',
};

const DOMAIN_ICONS: Record<Domain, string> = {
  law: '⚖️',
  economics: '📊',
  finance: '💰',
};

const DOMAIN_LABELS: Record<Domain, string> = {
  law: 'Law',
  economics: 'Economics',
  finance: 'Finance',
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const day = Number(searchParams.get('day') ?? 1);
  const domain = (searchParams.get('domain') ?? 'law') as Domain;
  const theme = searchParams.get('theme') ?? 'dark';
  const username = searchParams.get('username') ?? '';

  const isDark = theme !== 'light';
  const bg = isDark ? '#0e0e0e' : '#faf9f7';
  const textPrimary = isDark ? '#ede8e0' : '#18160f';
  const textMuted = isDark ? '#857e76' : '#716c65';
  const surfaceBg = isDark ? '#1e1e1e' : '#f2f0ec';
  const accent = DOMAIN_COLOURS[domain] ?? DOMAIN_COLOURS.law;
  const icon = DOMAIN_ICONS[domain] ?? '⚖️';
  const label = DOMAIN_LABELS[domain] ?? 'Law';
  const topic = findDayMeta(domain, day)?.topic ?? 'Today on LEF';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: bg,
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 64px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top accent line in domain colour */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${accent}, transparent)`,
          }}
        />

        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {/* LEF wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '42px', fontWeight: 800, color: '#c9ab70', lineHeight: 1 }}>
              LEF
            </span>
            <div style={{ display: 'flex', gap: '6px', fontSize: '11px', letterSpacing: '0.2em' }}>
              <span style={{ color: '#c9ab70' }}>LAW</span>
              <span style={{ color: textMuted }}>·</span>
              <span style={{ color: '#80a394' }}>ECONOMICS</span>
              <span style={{ color: textMuted }}>·</span>
              <span style={{ color: '#8fa3d0' }}>FINANCE</span>
            </div>
          </div>

          {/* Domain badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: surfaceBg,
              borderRadius: '12px',
              padding: '10px 18px',
            }}
          >
            <span style={{ fontSize: '24px' }}>{icon}</span>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: accent,
                letterSpacing: '0.08em',
              }}
            >
              {label}
            </span>
          </div>
        </div>

        {/* Centre: topic */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px 0',
            gap: '24px',
          }}
        >
          <span
            style={{
              display: 'flex',
              fontSize: '12px',
              fontWeight: 700,
              color: accent,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
            }}
          >
            Today&apos;s 5-minute lesson
          </span>
          <p
            style={{
              fontSize: topic.length > 50 ? '52px' : '64px',
              fontWeight: 700,
              color: textPrimary,
              lineHeight: 1.15,
              margin: 0,
              maxWidth: '1000px',
            }}
          >
            {topic}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              display: 'flex',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 700,
              color: accent,
              letterSpacing: '0.12em',
              background: `${accent}18`,
              padding: '8px 16px',
              borderRadius: '8px',
            }}
          >
            DAY {day}  ·  ~5 MIN READ
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '3px',
            }}
          >
            {username && (
              <span style={{ display: 'flex', fontSize: '14px', fontWeight: 600, color: textPrimary }}>
                @{username}
              </span>
            )}
            <span
              style={{
                display: 'flex',
                fontSize: '12px',
                color: textMuted,
                letterSpacing: '0.06em',
              }}
            >
              lef-os.vercel.app/brief
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
