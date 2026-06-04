import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';
import type { LefDomain } from '@/lib/database.types';

const FlagSchema = z.object({
  url: z.string().url().max(2000),
  title: z.string().min(1).max(300).trim(),
  day_number: z.number().int().min(1).max(111).optional(),
  domain: z.enum(['law', 'economics', 'finance']).optional(),
  content_type: z.enum(['video', 'article']),
  reason: z.string().max(300).trim().optional(),
});

const DOMAIN_LABEL: Record<string, string> = {
  law: '⚖️ Law',
  economics: '📊 Economics',
  finance: '💰 Finance',
};

// POST /api/content/flag
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const { data: userData } = await sb.auth.getUser();

    const body: unknown = await req.json();
    const parsed = FlagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 422 });
    }

    const { url, title, day_number, domain, content_type, reason } = parsed.data;

    // Prevent duplicate flag from same authenticated user
    if (userData.user) {
      const { data: existing } = await sb
        .from('content_flags')
        .select('id')
        .eq('url', url)
        .eq('flagged_by', userData.user.id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: 'You have already flagged this resource.' },
          { status: 409 },
        );
      }
    }

    const { data, error } = await sb
      .from('content_flags')
      .insert({
        url,
        title,
        day_number: day_number ?? null,
        domain: (domain ?? null) as LefDomain | null,
        content_type,
        flagged_by: userData.user?.id ?? null,
        reason: reason ?? null,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You have already flagged this resource.' },
          { status: 409 },
        );
      }
      throw error;
    }

    // Every flag on curated content fires an email — no threshold needed
    void sendContentFlagEmail({
      flagId: data.id,
      url,
      title,
      day_number,
      domain,
      content_type,
      reason,
      flaggedBy: userData.user?.email ?? 'anonymous',
    });

    return NextResponse.json({ flagged: true, message: 'Flagged for review. Thank you.' }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/content/flag]', err);
    return NextResponse.json({ error: 'Failed to submit flag.' }, { status: 500 });
  }
}

// PATCH /api/content/flag  — admin marks a flag resolved
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const { data: userData } = await sb.auth.getUser();
    if (!userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await sb
      .from('profiles')
      .select('is_primary_user')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.is_primary_user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await req.json()) as { id?: string };
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 422 });

    const { error } = await sb
      .from('content_flags')
      .update({
        resolved: true,
        resolved_by: userData.user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', body.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Marked resolved.' });
  } catch (err) {
    console.error('[PATCH /api/content/flag]', err);
    return NextResponse.json({ error: 'Failed to resolve flag.' }, { status: 500 });
  }
}

async function sendContentFlagEmail(params: {
  flagId: string;
  url: string;
  title: string;
  day_number?: number;
  domain?: string;
  content_type: string;
  reason?: string;
  flaggedBy: string;
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

  const adminUrl = `${siteUrl}/admin/content-flags`;
  const { url, title, day_number, domain, content_type, reason, flaggedBy } = params;

  const typeIcon = content_type === 'video' ? '▶' : '📄';
  const typeLabel = content_type === 'video' ? 'Video' : 'Article';
  const dayLine = day_number
    ? `Day ${day_number}${domain ? ` · ${DOMAIN_LABEL[domain] ?? domain}` : ''}`
    : 'Unknown day';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  body{margin:0;padding:0;background:#0e0e0e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
  .wrap{max-width:560px;margin:0 auto;padding:40px 24px;}
  .logo{color:#c9ab70;font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;border-bottom:1px solid #2a2a2a;padding-bottom:20px;margin-bottom:28px;}
  .badge{display:inline-block;background:#c9ab7022;color:#c9ab70;border:1px solid #c9ab7040;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px;}
  h1{color:#ede8e0;font-size:20px;font-weight:700;margin:0 0 6px;}
  .sub{color:#b8afa4;font-size:13px;margin:0 0 24px;}
  .card{background:#161616;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin:0 0 24px;}
  .row{display:flex;gap:12px;margin-bottom:12px;}
  .row:last-child{margin-bottom:0;}
  .lbl{color:#857e76;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;min-width:80px;padding-top:2px;flex-shrink:0;}
  .val{color:#ede8e0;font-size:14px;line-height:1.5;word-break:break-all;}
  .val a{color:#c9ab70;text-decoration:none;}
  .reason{background:#1e1e1e;border:1px solid #2a2a2a;border-radius:6px;padding:12px 14px;margin-top:14px;color:#b8afa4;font-size:13px;font-style:italic;line-height:1.6;}
  .cta{text-align:center;margin:28px 0;}
  .btn{display:inline-block;background:#c9ab70;color:#0e0e0e;font-size:13px;font-weight:700;padding:12px 28px;border-radius:6px;text-decoration:none;}
  .footer{border-top:1px solid #2a2a2a;padding-top:20px;margin-top:32px;color:#857e76;font-size:11px;line-height:1.6;}
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">LEF OS</div>
  <div class="badge">⚑ Content Flagged</div>
  <h1>${typeIcon} Study resource flagged as broken or wrong</h1>
  <p class="sub">A user flagged a ${typeLabel.toLowerCase()} link in the enriched study content. Review and update <code>enriched-content.json</code> if needed.</p>

  <div class="card">
    <div class="row"><div class="lbl">Type</div><div class="val">${typeIcon} ${typeLabel}</div></div>
    <div class="row"><div class="lbl">Location</div><div class="val">${dayLine}</div></div>
    <div class="row"><div class="lbl">Title</div><div class="val">${title.replace(/</g, '&lt;')}</div></div>
    <div class="row"><div class="lbl">URL</div><div class="val"><a href="${url}">${url.replace(/</g, '&lt;')}</a></div></div>
    <div class="row"><div class="lbl">Flagged by</div><div class="val">${flaggedBy}</div></div>
    ${reason ? `<div class="reason">"${reason.replace(/</g, '&lt;')}"</div>` : ''}
  </div>

  <div class="cta">
    <a class="btn" href="${adminUrl}">View all flagged content →</a>
  </div>

  <div class="footer">
    Update <code>data/enriched-content.json</code> to replace the broken link, then mark this flag resolved in the admin panel.<br />
    <a href="${adminUrl}" style="color:#857e76">${adminUrl}</a>
  </div>
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
        subject: `[LEF OS] ⚑ ${typeLabel} flagged — Day ${day_number ?? '?'} ${domain ?? ''}`,
        html,
      }),
    });
    if (!res.ok) console.error('[content flag email] Resend error:', await res.text());
  } catch (err) {
    console.error('[content flag email] Failed:', err);
  }
}
