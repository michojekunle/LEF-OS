import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail, buildEmailLayout } from '@/lib/email';
import { randomUUID } from 'crypto';

const ADMIN_EMAIL = process.env.SANKOFA_ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'http://localhost:3000';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify caller is the admin
    const sb = await supabaseServer();
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (ADMIN_EMAIL && u.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const waitlistId: string = body?.id?.trim();
    if (!waitlistId) {
      return NextResponse.json({ error: 'Waitlist entry id is required.' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin() as any;

    // Fetch the waitlist row
    const { data: row, error: fetchErr } = await admin
      .from('sankofa_waitlist')
      .select('id, email, invited_at')
      .eq('id', waitlistId)
      .single();

    if (fetchErr || !row) {
      return NextResponse.json({ error: 'Waitlist entry not found.' }, { status: 404 });
    }

    if (row.invited_at) {
      return NextResponse.json({ message: 'already_invited' });
    }

    const token = randomUUID();
    const { error: updateErr } = await admin
      .from('sankofa_waitlist')
      .update({ invite_token: token, invited_at: new Date().toISOString() })
      .eq('id', waitlistId);

    if (updateErr) {
      console.error('[sankofa/invite]', updateErr);
      return NextResponse.json({ error: 'Failed to generate invite.' }, { status: 500 });
    }

    const joinUrl = `${SITE_URL}/sankofa/join?token=${token}`;

    const html = buildEmailLayout({
      title: 'You have been invited to the Sankofa Archive.',
      badgeText: 'SANKOFA · PHASE 02 KORAE',
      subTitle: 'The vault is open.',
      cardHtml: `
        <p style="font-size:1.1rem;line-height:1.7;margin-bottom:24px;">
          You joined the waitlist to reconstruct history from the inside.
          The archive is ready for you.
        </p>
        <p style="font-size:0.95rem;opacity:0.7;line-height:1.7;">
          Click the button below to claim your access. This link is unique to you and
          expires once used.
        </p>
      `,
      actionButton: { text: 'ENTER THE ARCHIVE', url: joinUrl },
      footerText: 'Sankofa · The archive of what was left behind.',
    });

    await sendEmail({
      to: row.email,
      subject: 'Your Sankofa Archive Access',
      html,
      from: 'Sankofa <onboarding@resend.dev>',
    });

    return NextResponse.json({ message: 'invited' }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/sankofa/admin/invite]', err);
    return NextResponse.json({ error: 'Failed to process invite.' }, { status: 500 });
  }
}
