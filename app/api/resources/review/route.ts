import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';

const ReviewSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'remove']),
});

async function assertAdmin(sb: Awaited<ReturnType<typeof supabaseServer>>) {
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return null;
  const { data: profile } = await sb
    .from('profiles')
    .select('is_primary_user')
    .eq('id', user.user.id)
    .single();
  return profile?.is_primary_user ? user.user : null;
}

// GET /api/resources/review  — list pending + flagged submissions (admin only)
export async function GET(): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const admin = await assertAdmin(sb);
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [{ data: pending, error: e1 }, { data: flagged, error: e2 }, { data: recent, error: e3 }] =
      await Promise.all([
        sb
          .from('resource_submissions')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: true }),
        sb
          .from('resource_submissions')
          .select('*')
          .eq('status', 'flagged')
          .order('created_at', { ascending: false }),
        sb
          .from('resource_submissions')
          .select('*')
          .in('status', ['approved', 'rejected'])
          .order('reviewed_at', { ascending: false })
          .limit(20),
      ]);

    if (e1 ?? e2 ?? e3) throw e1 ?? e2 ?? e3;

    // Fetch flag counts for all flagged submissions
    const flaggedIds = (flagged ?? []).map((s) => s.id);
    const flagCounts: Record<string, number> = {};
    if (flaggedIds.length > 0) {
      const { data: counts } = await sb
        .from('resource_flags')
        .select('submission_id')
        .in('submission_id', flaggedIds);
      (counts ?? []).forEach((r) => {
        flagCounts[r.submission_id] = (flagCounts[r.submission_id] ?? 0) + 1;
      });
    }

    return NextResponse.json({
      pending: pending ?? [],
      flagged: (flagged ?? []).map((s) => ({ ...s, flag_count: flagCounts[s.id] ?? 0 })),
      recent: recent ?? [],
    });
  } catch (err) {
    console.error('[GET /api/resources/review]', err);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

// PATCH /api/resources/review  — approve / reject / remove a submission (admin only)
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const admin = await assertAdmin(sb);
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body: unknown = await req.json();
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 422 });
    }

    const { id, action } = parsed.data;
    // 'remove' is a hard reject that also clears flags — maps to 'rejected' status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { error } = await sb
      .from('resource_submissions')
      .update({
        status: newStatus,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    // If removing a flagged resource, also purge its flags so the log is clean
    if (action === 'remove') {
      await sb.from('resource_flags').delete().eq('submission_id', id);
    }

    const label = action === 'remove' ? 'removed' : newStatus;
    return NextResponse.json({ message: `Submission ${label}.` });
  } catch (err) {
    console.error('[PATCH /api/resources/review]', err);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}
