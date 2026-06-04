import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';

const FlagSchema = z.object({
  submission_id: z.string().uuid(),
  reason: z.string().max(300).trim().optional(),
});

const FLAG_THRESHOLD = 3;

// POST /api/resources/flag
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const { data: userData } = await sb.auth.getUser();

    const body: unknown = await req.json();
    const parsed = FlagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 422 });
    }

    const { submission_id, reason } = parsed.data;

    // Confirm the resource exists and is approved (can't flag pending/rejected/already-flagged)
    const { data: submission } = await sb
      .from('resource_submissions')
      .select('id, status, title, day_number, domain, url')
      .eq('id', submission_id)
      .maybeSingle();

    if (!submission) {
      return NextResponse.json({ error: 'Resource not found.' }, { status: 404 });
    }
    if (submission.status !== 'approved') {
      return NextResponse.json(
        { error: 'Only approved resources can be flagged.' },
        { status: 409 },
      );
    }

    // Check for duplicate flag from this user
    if (userData.user) {
      const { data: existingFlag } = await sb
        .from('resource_flags')
        .select('id')
        .eq('submission_id', submission_id)
        .eq('flagged_by', userData.user.id)
        .maybeSingle();

      if (existingFlag) {
        return NextResponse.json(
          { error: 'You have already flagged this resource.' },
          { status: 409 },
        );
      }
    }

    // Insert the flag
    const { error: insertError } = await sb.from('resource_flags').insert({
      submission_id,
      flagged_by: userData.user?.id ?? null,
      reason: reason ?? null,
    });

    if (insertError) {
      // Unique constraint violation = already flagged
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already flagged this resource.' },
          { status: 409 },
        );
      }
      throw insertError;
    }

    // Count current flags
    const { count: flagCount } = await sb
      .from('resource_flags')
      .select('*', { count: 'exact', head: true })
      .eq('submission_id', submission_id);

    const currentCount = flagCount ?? 0;
    const thresholdReached = currentCount >= FLAG_THRESHOLD;

    // Notify admin if threshold just crossed (trigger handles DB status update)
    if (thresholdReached) {
      void notifyAdminFlagThreshold({
        submission,
        flagCount: currentCount,
      });
    }

    return NextResponse.json(
      {
        flagged: true,
        message: 'Resource flagged for review. Thank you.',
        threshold_reached: thresholdReached,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/resources/flag]', err);
    return NextResponse.json({ error: 'Failed to submit flag.' }, { status: 500 });
  }
}

async function notifyAdminFlagThreshold(params: {
  submission: { title: string; day_number: number; domain: string; url: string; id: string };
  flagCount: number;
}): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!resendKey || !adminEmail) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')
      ? process.env.NEXT_PUBLIC_SITE_URL
      : `https://${process.env.NEXT_PUBLIC_SITE_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

  const reviewUrl = `${siteUrl}/admin/resources`;
  const { submission, flagCount } = params;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  body { margin:0; padding:0; background:#0e0e0e; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  .wrap { max-width:560px; margin:0 auto; padding:40px 24px; }
  .logo { color:#c9ab70; font-size:13px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; border-bottom:1px solid #2a2a2a; padding-bottom:20px; margin-bottom:28px; }
  .badge { display:inline-block; background:#cc727222; color:#cc7272; border:1px solid #cc727240; border-radius:4px; padding:2px 8px; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; margin-bottom:12px; }
  h1 { color:#ede8e0; font-size:20px; font-weight:700; margin:0 0 6px; }
  .sub { color:#b8afa4; font-size:13px; margin:0 0 24px; }
  .card { background:#161616; border:1px solid #2a2a2a; border-radius:8px; padding:20px; margin:0 0 24px; }
  .row { display:flex; gap:12px; margin-bottom:12px; }
  .row:last-child { margin-bottom:0; }
  .lbl { color:#857e76; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; min-width:72px; padding-top:2px; }
  .val { color:#ede8e0; font-size:14px; line-height:1.5; word-break:break-all; }
  .val a { color:#c9ab70; text-decoration:none; }
  .count { font-size:32px; font-weight:700; color:#cc7272; line-height:1; margin-bottom:4px; }
  .count-label { color:#857e76; font-size:12px; }
  .btn { display:inline-block; background:#c9ab70; color:#0e0e0e; font-size:13px; font-weight:700; padding:12px 28px; border-radius:6px; text-decoration:none; }
  .footer { border-top:1px solid #2a2a2a; padding-top:20px; margin-top:32px; color:#857e76; font-size:11px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">LEF OS</div>
  <div class="badge">⚑ Flag Threshold Reached</div>
  <h1>Resource flagged ${flagCount} times</h1>
  <p class="sub">This resource has been automatically hidden from public view and needs your attention.</p>

  <div class="card" style="text-align:center;padding:24px;">
    <div class="count">${flagCount}</div>
    <div class="count-label">flags from users</div>
  </div>

  <div class="card">
    <div class="row"><div class="lbl">Day</div><div class="val">Day ${submission.day_number}</div></div>
    <div class="row"><div class="lbl">Domain</div><div class="val">${submission.domain}</div></div>
    <div class="row"><div class="lbl">Title</div><div class="val">${submission.title.replace(/</g, '&lt;')}</div></div>
    <div class="row"><div class="lbl">URL</div><div class="val"><a href="${submission.url}">${submission.url.replace(/</g, '&lt;')}</a></div></div>
  </div>

  <p style="text-align:center;">
    <a class="btn" href="${reviewUrl}">Review & Remove →</a>
  </p>

  <div class="footer">Visit <a href="${reviewUrl}" style="color:#857e76">/admin/resources</a> to manage flagged submissions.</div>
</div>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'LEF OS <onboarding@resend.dev>',
        to: adminEmail,
        subject: `[LEF OS] ⚑ Resource flagged ${flagCount}× — Day ${submission.day_number} ${submission.domain}`,
        html,
      }),
    });
    if (!res.ok) console.error('[flag notification] Resend error:', await res.text());
  } catch (err) {
    console.error('[flag notification] Failed to send:', err);
  }
}
