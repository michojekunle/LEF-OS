import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get('userId');

  // Simple regex validation for UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[45][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!userId || !uuidRegex.test(userId)) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invalid Request — LEF</title>
  <style>
    body { background: #0e0e0e; color: #ede8e0; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #161616; border: 1px solid #cc727233; padding: 40px 32px; border-radius: 12px; max-width: 400px; text-align: center; }
    h1 { color: #cc7272; font-size: 22px; margin-top: 0; margin-bottom: 12px; }
    p { color: #b8afa4; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    a { background: #c9ab70; color: #0e0e0e; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Invalid Unsubscribe Link</h1>
    <p>This unsubscribe link is invalid or expired. Please manage your email preferences inside your account settings.</p>
    <a href="/settings">Account Settings</a>
  </div>
</body>
</html>`,
      {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      },
    );
  }

  try {
    const sb = supabaseAdmin();
    // Update daily brief email settings to false for the specified user
    const { error } = await sb
      .from('user_settings')
      .update({ daily_brief_email_enabled: false } as any)
      .eq('user_id', userId);

    if (error) throw error;

    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Unsubscribed — LEF</title>
  <style>
    body { background: #0e0e0e; color: #ede8e0; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #161616; border: 1px solid #2a2a2a; padding: 40px 32px; border-radius: 12px; max-width: 400px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    h1 { color: #c9ab70; font-size: 22px; margin-top: 0; margin-bottom: 12px; }
    p { color: #b8afa4; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    a { background: #c9ab70; color: #0e0e0e; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block; transition: background 0.2s; }
    a:hover { background: #b89d62; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Unsubscribed Successfully</h1>
    <p>You have been unsubscribed from the LEF daily brief emails. You can re-enable this anytime from your account settings.</p>
    <a href="/">Go to LEF-OS</a>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      },
    );
  } catch (err) {
    console.error('[unsubscribe] Failed to disable emails:', err);
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Error — LEF</title>
  <style>
    body { background: #0e0e0e; color: #ede8e0; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #161616; border: 1px solid #cc727233; padding: 40px 32px; border-radius: 12px; max-width: 400px; text-align: center; }
    h1 { color: #cc7272; font-size: 22px; margin-top: 0; margin-bottom: 12px; }
    p { color: #b8afa4; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    a { background: #c9ab70; color: #0e0e0e; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Service Error</h1>
    <p>An unexpected error occurred while processing your unsubscribe request. Please try again or manage your email preferences inside settings.</p>
    <a href="/settings">Account Settings</a>
  </div>
</body>
</html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      },
    );
  }
}
