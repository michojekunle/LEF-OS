import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth, conflict, notFound, badRequest, serverError } from '@/lib/api';
import { buildEmailLayout, sanitizeHtmlText, sendAdminEmail } from '@/lib/email';
import { ResourceFlagSchema } from '@/lib/schemas';
import { DOMAIN_LABELS } from '@/lib/domain';
import { getSiteUrl } from '@/lib/env';
import type { Domain } from '@/data/curriculum-data';

const FLAG_THRESHOLD = 3;

// POST /api/resources/flag
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const user = await requireAuth(sb);

    const parsed = ResourceFlagSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest('Invalid input');

    const { submission_id, reason } = parsed.data;

    // Resource must exist and be approved
    const { data: submission } = await sb
      .from('resource_submissions')
      .select('id, status, title, day_number, domain, url')
      .eq('id', submission_id)
      .maybeSingle();

    if (!submission) return notFound('Resource not found.');
    if (submission.status !== 'approved') {
      return conflict('Only approved resources can be flagged.');
    }

    // Prevent duplicate flag from the same authenticated user
    if (user) {
      const { data: existing } = await sb
        .from('resource_flags')
        .select('id')
        .eq('submission_id', submission_id)
        .eq('flagged_by', user.id)
        .maybeSingle();
      if (existing) return conflict('You have already flagged this resource.');
    }

    const { error: insertError } = await sb.from('resource_flags').insert({
      submission_id,
      flagged_by: user?.id ?? null,
      reason: reason ?? null,
    });

    if (insertError) {
      if (insertError.code === '23505') return conflict('You have already flagged this resource.');
      throw insertError;
    }

    const { count } = await sb
      .from('resource_flags')
      .select('*', { count: 'exact', head: true })
      .eq('submission_id', submission_id);

    const currentCount = count ?? 0;
    const thresholdReached = currentCount >= FLAG_THRESHOLD;

    if (thresholdReached) {
      void sendFlagThresholdEmail({ submission, flagCount: currentCount });
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
    return serverError('Failed to submit flag.');
  }
}

async function sendFlagThresholdEmail(params: {
  submission: { title: string; day_number: number; domain: string; url: string };
  flagCount: number;
}): Promise<void> {
  const reviewUrl = `${getSiteUrl()}/admin/resources`;
  const { submission, flagCount } = params;
  const domainLabel = DOMAIN_LABELS[submission.domain as Domain] ?? submission.domain;

  const cardHtml = `
  <div class="card" style="text-align:center;padding:24px;">
    <div class="count">${flagCount}</div>
    <div class="count-label">flags from users</div>
  </div>
  <div class="card">
    <div class="row"><div class="lbl">Day</div><div class="val">Day ${submission.day_number}</div></div>
    <div class="row"><div class="lbl">Domain</div><div class="val">${domainLabel}</div></div>
    <div class="row"><div class="lbl">Title</div><div class="val">${sanitizeHtmlText(submission.title)}</div></div>
    <div class="row"><div class="lbl">URL</div><div class="val"><a href="${submission.url}">${sanitizeHtmlText(submission.url)}</a></div></div>
  </div>`;

  await sendAdminEmail({
    subject: `[LEF OS] ⚑ Resource flagged ${flagCount}× — Day ${submission.day_number} ${submission.domain}`,
    html: buildEmailLayout({
      title: `Resource flagged ${flagCount} times`,
      badgeText: '⚑ Flag Threshold Reached',
      subTitle:
        'This resource has been automatically hidden from public view and needs your attention.',
      cardHtml,
      actionButton: { text: 'Review & Remove →', url: reviewUrl },
      footerText: `Visit <a href="${reviewUrl}" style="color:#857e76">/admin/resources</a> to manage flagged submissions.`,
    }),
  });
}
