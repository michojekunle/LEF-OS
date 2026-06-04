import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';
import type { LefDomain, ResourceType } from '@/lib/database.types';

const SubmitSchema = z.object({
  day_number: z.number().int().min(1).max(111),
  domain: z.enum(['law', 'economics', 'finance']),
  type: z.enum(['video', 'article', 'tool', 'other']).default('article'),
  title: z.string().min(3).max(200).trim(),
  url: z.string().url().max(2000),
  note: z.string().max(500).trim().optional(),
});

const DOMAIN_LABEL: Record<string, string> = {
  law: '⚖️ Law',
  economics: '📊 Economics',
  finance: '💰 Finance',
};

const TYPE_LABEL: Record<string, string> = {
  video: '▶ Video',
  article: '📄 Article',
  tool: '🔧 Tool',
  other: '🔗 Other',
};

function buildNotificationEmail(params: {
  submissionId: string;
  day_number: number;
  domain: string;
  type: string;
  title: string;
  url: string;
  note?: string | null;
  submittedBy: string;
  reviewUrl: string;
}): string {
  const { submissionId, day_number, domain, type, title, url, note, submittedBy, reviewUrl } =
    params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New Resource Submission — LEF OS</title>
<style>
  body { margin: 0; padding: 0; background: #0e0e0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
  .header { border-bottom: 1px solid #2a2a2a; padding-bottom: 20px; margin-bottom: 28px; }
  .logo { color: #c9ab70; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
  .badge { display: inline-block; background: #c9ab7022; color: #c9ab70; border: 1px solid #c9ab7040; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; }
  h1 { color: #ede8e0; font-size: 20px; font-weight: 700; margin: 0 0 6px; }
  .sub { color: #b8afa4; font-size: 13px; margin: 0; }
  .card { background: #161616; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; margin: 24px 0; }
  .row { display: flex; gap: 12px; margin-bottom: 14px; }
  .row:last-child { margin-bottom: 0; }
  .label { color: #857e76; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; min-width: 72px; padding-top: 2px; }
  .val { color: #ede8e0; font-size: 14px; line-height: 1.5; word-break: break-all; }
  .val a { color: #c9ab70; text-decoration: none; }
  .val a:hover { text-decoration: underline; }
  .note-block { background: #1e1e1e; border: 1px solid #2a2a2a; border-radius: 6px; padding: 12px 14px; margin-top: 14px; color: #b8afa4; font-size: 13px; font-style: italic; line-height: 1.6; }
  .cta { text-align: center; margin: 28px 0; }
  .btn { display: inline-block; background: #c9ab70; color: #0e0e0e; font-size: 13px; font-weight: 700; letter-spacing: 0.04em; padding: 12px 28px; border-radius: 6px; text-decoration: none; }
  .footer { border-top: 1px solid #2a2a2a; padding-top: 20px; margin-top: 32px; color: #857e76; font-size: 11px; line-height: 1.6; }
  .id { font-family: monospace; color: #857e76; font-size: 11px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">LEF OS</div>
  </div>

  <div class="badge">New Submission</div>
  <h1>Resource waiting for review</h1>
  <p class="sub">Someone submitted a new resource link. Review and approve or reject it below.</p>

  <div class="card">
    <div class="row">
      <div class="label">Day</div>
      <div class="val">Day ${day_number}</div>
    </div>
    <div class="row">
      <div class="label">Domain</div>
      <div class="val">${DOMAIN_LABEL[domain] ?? domain}</div>
    </div>
    <div class="row">
      <div class="label">Type</div>
      <div class="val">${TYPE_LABEL[type] ?? type}</div>
    </div>
    <div class="row">
      <div class="label">Title</div>
      <div class="val">${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
    <div class="row">
      <div class="label">URL</div>
      <div class="val"><a href="${url}" target="_blank" rel="noopener noreferrer">${url.replace(/</g, '&lt;')}</a></div>
    </div>
    <div class="row">
      <div class="label">From</div>
      <div class="val">${submittedBy}</div>
    </div>
    ${
      note
        ? `<div class="note-block">"${note.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"</div>`
        : ''
    }
  </div>

  <div class="cta">
    <a class="btn" href="${reviewUrl}" target="_blank" rel="noopener noreferrer">
      Review Submission →
    </a>
  </div>

  <div class="footer">
    Submission ID: <span class="id">${submissionId}</span><br />
    Visit <a href="${reviewUrl}" style="color:#857e76">/admin/resources</a> to manage all pending submissions.
  </div>
</div>
</body>
</html>`;
}

async function sendAdminNotification(params: {
  submissionId: string;
  day_number: number;
  domain: string;
  type: string;
  title: string;
  url: string;
  note?: string | null;
  submittedBy: string;
}): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!resendKey || !adminEmail) {
    // Silently skip — don't block submissions if notification isn't configured
    return;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')
        ? process.env.NEXT_PUBLIC_SITE_URL
        : `https://${process.env.NEXT_PUBLIC_SITE_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

  const reviewUrl = `${siteUrl}/admin/resources`;

  const html = buildNotificationEmail({ ...params, reviewUrl });

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
        subject: `[LEF OS] New resource submitted — Day ${params.day_number} ${params.domain}`,
        html,
      }),
    });

    if (!res.ok) {
      console.error('[resource notification] Resend error:', await res.text());
    }
  } catch (err) {
    console.error('[resource notification] Failed to send:', err);
  }
}

// GET /api/resources?day=N&domain=X  — fetch approved resources for a day
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const day = Number(searchParams.get('day'));
  const domain = searchParams.get('domain') as LefDomain | null;

  if (!day || day < 1 || day > 111) {
    return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
  }

  try {
    const sb = await supabaseServer();
    let query = sb
      .from('resource_submissions')
      .select('id, day_number, domain, type, title, url, note, created_at')
      .eq('day_number', day)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (domain) query = query.eq('domain', domain);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ resources: data ?? [] });
  } catch (err) {
    console.error('[GET /api/resources]', err);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

// POST /api/resources  — submit a new resource
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const { data: userData } = await sb.auth.getUser();

    const body: unknown = await req.json();
    const parsed = SubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const { day_number, domain, type, title, url, note } = parsed.data;

    // Prevent obvious spam: same url + day_number + domain combo already pending/approved
    const { data: existing } = await sb
      .from('resource_submissions')
      .select('id, status')
      .eq('day_number', day_number)
      .eq('domain', domain)
      .eq('url', url)
      .in('status', ['pending', 'approved'])
      .maybeSingle();

    if (existing) {
      const msg =
        existing.status === 'approved'
          ? 'This resource is already listed for this day.'
          : 'This resource is already pending review.';
      return NextResponse.json({ error: msg }, { status: 409 });
    }

    const { data, error } = await sb
      .from('resource_submissions')
      .insert({
        day_number,
        domain: domain as LefDomain,
        type: type as ResourceType,
        title,
        url,
        note: note ?? null,
        submitted_by: userData.user?.id ?? null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;

    // Fire notification email — non-blocking, never fails the submission
    void sendAdminNotification({
      submissionId: data.id,
      day_number,
      domain,
      type,
      title,
      url,
      note,
      submittedBy: userData.user?.email ?? 'anonymous',
    });

    return NextResponse.json(
      { id: data.id, message: 'Submitted for review — thank you!' },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/resources]', err);
    return NextResponse.json({ error: 'Failed to submit resource' }, { status: 500 });
  }
}
