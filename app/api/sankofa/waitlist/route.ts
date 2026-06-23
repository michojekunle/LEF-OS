import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase();

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 },
      );
    }

    // Cast to `any` — sankofa_waitlist isn't in the generated Database types yet.
    // The table is created via SQL migration; types will be regenerated after.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin() as any;
    const { error } = await sb
      .from('sankofa_waitlist')
      .insert({ email, source: 'sankofa-coming-soon' });

    // Unique constraint violation — already registered
    if (error?.code === '23505') {
      return NextResponse.json({ message: 'already_registered' });
    }

    if (error) {
      console.error('[POST /api/sankofa/waitlist]', error);
      return NextResponse.json(
        { error: 'Failed to register. Please try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: 'success' }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/sankofa/waitlist]', err);
    return NextResponse.json(
      { error: 'Failed to process request.' },
      { status: 500 },
    );
  }
}
