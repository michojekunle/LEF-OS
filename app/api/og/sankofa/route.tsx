import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getStoryById, SANKOFA_DOMAIN_META } from '@/lib/sankofa-content';

export const runtime = 'edge';

export async function GET(req: NextRequest): Promise<ImageResponse | Response> {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id') ?? '';

  const story = getStoryById(id);
  if (!story) {
    return new Response('Story not found', { status: 404 });
  }

  const meta = SANKOFA_DOMAIN_META[story.domain];
  const bg = '#0A0A0A';
  const textPrimary = '#F4F0EA';
  const textMuted = '#4a4540';

  const truncatedTitle = story.title.length > 80 ? story.title.slice(0, 77) + '…' : story.title;
  const truncatedTldr = story.tldr.length > 180 ? story.tldr.slice(0, 177) + '…' : story.tldr;

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        padding: '56px 64px',
        fontFamily: 'serif',
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
          height: '3px',
          background: meta.colour,
          display: 'flex',
        }}
      />

      {/* Faint background text — domain name */}
      <div
        style={{
          position: 'absolute',
          bottom: '-20px',
          right: '-10px',
          fontSize: '220px',
          fontFamily: 'sans-serif',
          fontWeight: 900,
          color: meta.colour,
          opacity: 0.04,
          letterSpacing: '-0.05em',
          display: 'flex',
        }}
      >
        {story.domain.toUpperCase()}
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* SANKOFA wordmark */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: meta.colour,
              lineHeight: 1,
              fontFamily: 'sans-serif',
              letterSpacing: '0.2em',
            }}
          >
            SANKOFA
          </span>
          <span
            style={{
              fontSize: '10px',
              color: textMuted,
              letterSpacing: '0.3em',
              fontFamily: 'monospace',
            }}
          >
            ARCHIVE
          </span>
        </div>

        {/* Domain badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#161616',
            border: `1px solid ${meta.colour}30`,
            borderRadius: '4px',
            padding: '8px 18px',
          }}
        >
          <span style={{ fontSize: '16px' }}>{meta.icon}</span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: meta.colour,
              letterSpacing: '0.2em',
              fontFamily: 'monospace',
            }}
          >
            {meta.label.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Era */}
      <div
        style={{
          marginTop: '40px',
          fontSize: '13px',
          color: meta.colour,
          letterSpacing: '0.25em',
          fontFamily: 'monospace',
          display: 'flex',
        }}
      >
        {story.era}
      </div>

      {/* Title */}
      <div
        style={{
          marginTop: '16px',
          fontSize: truncatedTitle.length > 60 ? '36px' : '44px',
          fontWeight: 700,
          color: textPrimary,
          lineHeight: 1.15,
          maxWidth: '900px',
          display: 'flex',
        }}
      >
        {truncatedTitle}
      </div>

      {/* TL;DR */}
      <div
        style={{
          marginTop: '24px',
          fontSize: '16px',
          color: textPrimary,
          opacity: 0.55,
          lineHeight: 1.65,
          maxWidth: '780px',
          fontStyle: 'italic',
          display: 'flex',
        }}
      >
        {truncatedTldr}
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '48px',
          left: '64px',
          right: '64px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '24px' }}>
          {story.figures.slice(0, 3).map((f) => (
            <span
              key={f}
              style={{
                fontSize: '11px',
                color: textMuted,
                letterSpacing: '0.1em',
                fontFamily: 'monospace',
              }}
            >
              {f}
            </span>
          ))}
        </div>
        <span
          style={{
            fontSize: '11px',
            color: textMuted,
            letterSpacing: '0.15em',
            fontFamily: 'monospace',
          }}
        >
          sankofa.archive
        </span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
