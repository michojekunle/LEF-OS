import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

type AchievementType =
  | 'perfect_day'
  | 'full_notes_day'
  | 'quiz_complete'
  | 'perfect_week'
  | 'week_complete'
  | 'streak';

const ACHIEVEMENT_META: Record<
  AchievementType,
  { emoji: string; title: string; subtitle: string; colour: string; gradient: [string, string] }
> = {
  perfect_day: {
    emoji: '🏆',
    title: 'Perfect Day',
    subtitle: 'Law · Economics · Finance — all three, one day.',
    colour: '#c9ab70',
    gradient: ['#c9ab7022', '#c9ab7008'],
  },
  full_notes_day: {
    emoji: '📝',
    title: 'Full Notes',
    subtitle: 'Every domain documented. Knowledge locked in.',
    colour: '#80a394',
    gradient: ['#80a39422', '#80a39408'],
  },
  quiz_complete: {
    emoji: '🧠',
    title: 'Quiz Complete',
    subtitle: 'All review questions answered. Solid recall.',
    colour: '#8fa3d0',
    gradient: ['#8fa3d022', '#8fa3d008'],
  },
  perfect_week: {
    emoji: '🔥',
    title: 'Perfect Week',
    subtitle: 'Seven days. Three domains. Zero gaps.',
    colour: '#c9ab70',
    gradient: ['#c9ab7030', '#80a39410'],
  },
  week_complete: {
    emoji: '✅',
    title: 'Week Complete',
    subtitle: 'Another week of the curriculum done.',
    colour: '#80a394',
    gradient: ['#80a39422', '#8fa3d010'],
  },
  streak: {
    emoji: '⚡',
    title: 'Streak Milestone',
    subtitle: 'Consistency is the compounding asset.',
    colour: '#c9ab70',
    gradient: ['#c9ab7025', '#c9ab7008'],
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = (searchParams.get('type') ?? 'perfect_day') as AchievementType;
  const day = searchParams.get('day') ?? '';
  const username = searchParams.get('username') ?? '';
  const streak = searchParams.get('streak') ?? '';
  const theme = searchParams.get('theme') ?? 'dark';

  const isDark = theme !== 'light';
  const bg = isDark ? '#0e0e0e' : '#faf9f7';
  const textPrimary = isDark ? '#ede8e0' : '#18160f';
  const textMuted = isDark ? '#857e76' : '#716c65';
  const surfaceBg = isDark ? '#1a1a1a' : '#f0ede8';

  const meta = ACHIEVEMENT_META[type] ?? ACHIEVEMENT_META.perfect_day;

  const streakLabel = streak && type === 'streak' ? `${streak}-day streak` : '';
  const subtitle = streakLabel ? `${streakLabel} — ${meta.subtitle}` : meta.subtitle;

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${meta.gradient[0]}, ${meta.gradient[1]}, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, transparent, ${meta.colour}, transparent)`,
        }}
      />

      {/* LEF wordmark — top left */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '56px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}
      >
        <span style={{ fontSize: '28px', fontWeight: 800, color: '#c9ab70', lineHeight: 1 }}>
          LEF
        </span>
        <span style={{ fontSize: '9px', color: textMuted, letterSpacing: '0.22em' }}>
          LAW · ECONOMICS · FINANCE
        </span>
      </div>

      {/* User — top right */}
      {username && (
        <div
          style={{
            position: 'absolute',
            top: '44px',
            right: '56px',
            fontSize: '14px',
            color: textMuted,
            letterSpacing: '0.06em',
          }}
        >
          @{username}
        </div>
      )}

      {/* Centre content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        {/* Emoji */}
        <div
          style={{
            fontSize: '96px',
            lineHeight: 1,
            filter: 'drop-shadow(0 0 32px ' + meta.colour + '66)',
          }}
        >
          {meta.emoji}
        </div>

        {/* Achievement name */}
        <div
          style={{
            fontSize: '52px',
            fontWeight: 800,
            color: meta.colour,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {meta.title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '20px',
            color: textMuted,
            maxWidth: '680px',
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>

        {/* Day pill */}
        {day && (
          <div
            style={{
              background: surfaceBg,
              border: `1px solid ${meta.colour}40`,
              borderRadius: '100px',
              padding: '8px 24px',
              fontSize: '14px',
              fontWeight: 600,
              color: textPrimary,
              letterSpacing: '0.12em',
              marginTop: '8px',
            }}
          >
            DAY {day}
          </div>
        )}
      </div>

      {/* Bottom URL */}
      <div
        style={{
          position: 'absolute',
          bottom: '36px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          color: textMuted,
          letterSpacing: '0.1em',
        }}
      >
        lef-os.vercel.app
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
