import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';

const ReviewSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
});

// GET /api/resources/review  — list pending submissions (admin only)
export async function GET(): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await sb
      .from('profiles')
      .select('is_primary_user')
      .eq('id', user.user.id)
      .single();

    if (!profile?.is_primary_user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await sb
      .from('resource_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ submissions: data ?? [] });
  } catch (err) {
    console.error('[GET /api/resources/review]', err);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

// PATCH /api/resources/review  — approve or reject a submission (admin only)
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const { data: user } = await sb.auth.getUser();
    if (!user.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await sb
      .from('profiles')
      .select('is_primary_user')
      .eq('id', user.user.id)
      .single();

    if (!profile?.is_primary_user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: unknown = await req.json();
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 422 });
    }

    const { id, action } = parsed.data;
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { error } = await sb
      .from('resource_submissions')
      .update({
        status: newStatus,
        reviewed_by: user.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: `Submission ${newStatus}.` });
  } catch (err) {
    console.error('[PATCH /api/resources/review]', err);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}
