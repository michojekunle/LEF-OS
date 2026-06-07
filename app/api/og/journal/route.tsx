import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const DOMAIN_COLOURS: Record<string, string> = {
  law: '#c9ab70',
  economics: '#80a394',
  finance: '#8fa3d0',
};

const DOMAIN_ICONS: Record<string, string> = {
  law: '⚖️',
  economics: '📊',
  finance: '💰',
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const insight = searchParams.get('insight') ?? '';
  const username = searchParams.get('username') ?? '';
  const day = searchParams.get('day') ?? '';
  const domain = (searchParams.get('domain') ?? 'law') as string;
  const theme = searchParams.get('theme') ?? 'dark';

  const isDark = theme !== 'light';
  const bg = isDark ? '#0e0e0e' : '#faf9f7';
  const textPrimary = isDark ? '#ede8e0' : '#18160f';
  const textMuted = isDark ? '#857e76' : '#716c65';
  const surfaceBg = isDark ? '#1e1e1e' : '#f2f0ec';
  const accentColour = DOMAIN_COLOURS[domain] ?? DOMAIN_COLOURS.law;
  const domainIcon = DOMAIN_ICONS[domain] ?? '⚖️';

  // Truncate insight to fit the card
  const displayInsight = insight.length > 220 ? insight.slice(0, 217) + '…' : insight;

  return new ImageResponse(
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
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${accentColour}, transparent)`,
        }}
      />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
            gap: '8px',
            background: surfaceBg,
            borderRadius: '12px',
            padding: '10px 18px',
          }}
        >
          <span style={{ fontSize: '22px' }}>{domainIcon}</span>
          <span
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: accentColour,
              letterSpacing: '0.08em',
            }}
          >
            {domain.charAt(0).toUpperCase() + domain.slice(1)}
          </span>
        </div>
      </div>

      {/* Insight — centred vertically in remaining space */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '32px 0',
        }}
      >
        {displayInsight ? (
          <p
            style={{
              fontSize: insight.length > 120 ? '26px' : '32px',
              fontWeight: 600,
              color: textPrimary,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            "{displayInsight}"
          </p>
        ) : (
          <p style={{ fontSize: '24px', color: textMuted, fontStyle: 'italic', margin: 0 }}>
            A daily study insight from LEF OS
          </p>
        )}
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {day && (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 700,
              color: accentColour,
              letterSpacing: '0.12em',
              background: `${accentColour}18`,
              padding: '6px 14px',
              borderRadius: '8px',
            }}
          >
            DAY {day}
          </span>
        )}
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}
        >
          {username && (
            <span style={{ fontSize: '14px', fontWeight: 600, color: textPrimary }}>
              @{username}
            </span>
          )}
          <span style={{ fontSize: '12px', color: textMuted, letterSpacing: '0.06em' }}>
            lef-os.vercel.app
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
