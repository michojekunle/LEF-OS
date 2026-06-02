import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getDayNumber,
  getTodayTopics,
  getCurrentStreak,
  clampDay,
  isoDate,
} from '@/lib/utils';

export async function GET(request: Request) {
  // Verify authorization secret
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('secret') ?? request.headers.get('Authorization')?.replace('Bearer ', '');
  const secret = process.env.CRON_SECRET;

  if (secret && key !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 });
  }

  const todayDate = new Date();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(todayDate.getDate() - 1);

  const todayIso = isoDate(todayDate);
  const yesterdayIso = isoDate(yesterdayDate);

  const todayDay = clampDay(getDayNumber(todayDate));
  const yesterdayDay = clampDay(getDayNumber(yesterdayDate));

  const todayTopics = getTodayTopics(todayDay);
  const yesterdayTopics = getTodayTopics(yesterdayDay);

  try {
    const sb = supabaseAdmin();

    // 1. Fetch user settings for active notifications
    const { data: settingsList, error: settingsError } = await sb
      .from('user_settings')
      .select('user_id, email, daily_reminder_enabled')
      .eq('daily_reminder_enabled', true);

    if (settingsError) throw settingsError;
    if (!settingsList || settingsList.length === 0) {
      return NextResponse.json({ message: 'No users subscribed to reminders' });
    }

    const results = [];

    // 2. Process reminders for each user
    for (const setting of settingsList) {
      const userId = setting.user_id;
      const email = setting.email;

      // Fetch today's and yesterday's log for this user
      const { data: logs, error: logsError } = await sb
        .from('daily_entries')
        .select('*')
        .eq('user_id', userId)
        .in('entry_date', [todayIso, yesterdayIso]);

      if (logsError) {
        console.error(`Error fetching logs for user ${userId}:`, logsError);
        continue;
      }

      const todayLog = logs?.find((l) => l.entry_date === todayIso);
      const yesterdayLog = logs?.find((l) => l.entry_date === yesterdayIso);

      const todayComplete = todayLog && (todayLog.law_completed || todayLog.economics_completed || todayLog.finance_completed);
      const yesterdayComplete = yesterdayLog && (yesterdayLog.law_completed || yesterdayLog.economics_completed || yesterdayLog.finance_completed);

      // If they have completed today, they don't need a reminder!
      if (todayComplete) {
        continue;
      }

      // Fetch all user entries to calculate their current streak
      const { data: allEntries } = await sb
        .from('daily_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false });

      const streak = getCurrentStreak(allEntries ?? [], todayDate);

      // Send the email via Resend API
      const reqUrl = new URL(request.url);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        ? (process.env.NEXT_PUBLIC_SITE_URL.includes('http') ? process.env.NEXT_PUBLIC_SITE_URL : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : reqUrl.origin.includes('localhost') ? reqUrl.origin : 'http://localhost:3001';

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LEF OS Daily Study Reminder</title>
  <style>
    body {
      background-color: #0D0D0D;
      color: #F0EAE0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      background-color: #0D0D0D;
      padding: 32px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #141414;
      border: 1px solid #262626;
      border-radius: 8px;
      padding: 32px;
    }
    .header {
      border-bottom: 1px solid #262626;
      padding-bottom: 20px;
      margin-bottom: 24px;
      text-align: center;
    }
    .title {
      font-family: Georgia, serif;
      font-size: 24px;
      color: #C8A96E;
      letter-spacing: -0.01em;
      margin: 0;
    }
    .subtitle {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #8A8070;
      margin-top: 4px;
    }
    .streak-box {
      background-color: #1C1C1C;
      border: 1px solid #262626;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
      margin-bottom: 24px;
    }
    .streak-val {
      font-size: 20px;
      font-weight: bold;
      color: #C8A96E;
      margin: 0;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #8A8070;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    .topic-card {
      background-color: #1C1C1C;
      border-left: 3px solid #C8A96E;
      padding: 12px 16px;
      margin-bottom: 12px;
      border-radius: 0 6px 6px 0;
    }
    .topic-card.law { border-left-color: #C8A96E; }
    .topic-card.econ { border-left-color: #7C9E8F; }
    .topic-card.fin { border-left-color: #8B9ECC; }
    .domain-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #8A8070;
      margin-bottom: 4px;
    }
    .topic-text {
      font-size: 14px;
      margin: 0;
      color: #F0EAE0;
    }
    .btn {
      display: inline-block;
      background-color: #C8A96E;
      color: #1a1308;
      font-weight: 500;
      font-size: 13px;
      text-decoration: none;
      padding: 10px 18px;
      border-radius: 6px;
      margin-top: 16px;
      text-align: center;
    }
    .btn-secondary {
      display: inline-block;
      background-color: transparent;
      border: 1px solid #262626;
      color: #F0EAE0;
      font-weight: 500;
      font-size: 13px;
      text-decoration: none;
      padding: 10px 18px;
      border-radius: 6px;
      margin-top: 16px;
      text-align: center;
      margin-left: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      font-size: 11px;
      color: #444444;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="title">Law · Economics · Finance</h1>
        <div class="subtitle">Founder's 4-Month Curriculum</div>
      </div>
      
      <div class="streak-box">
        <p class="streak-val">${streak > 0 ? `🔥 Current Streak: ${streak} Days` : '🌱 Start your study streak today!'}</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #8A8070; margin-bottom: 20px;">
        Hi there! Don't let your learning slide. Here are your topics for today:
      </p>

      <div class="section-title">Today's Topics (Day ${todayDay})</div>
      <div class="topic-card law">
        <div class="domain-label">⚖️ Law</div>
        <p class="topic-text">${todayTopics.law ?? 'Integration & sharing buffer'}</p>
      </div>
      <div class="topic-card econ">
        <div class="domain-label">📊 Economics</div>
        <p class="topic-text">${todayTopics.economics ?? 'Integration & sharing buffer'}</p>
      </div>
      <div class="topic-card fin">
        <div class="domain-label">💰 Finance</div>
        <p class="topic-text">${todayTopics.finance ?? 'Integration & sharing buffer'}</p>
      </div>

      <div style="text-align: center;">
        <a href="${siteUrl}/dashboard" class="btn">Log Today's Progress</a>
      </div>

      ${!yesterdayComplete ? `
      <div style="border-top: 1px solid #262626; margin-top: 32px; padding-top: 24px;">
        <div class="section-title" style="color: #C86E6E;">Yesterday was waiting (Day ${yesterdayDay})</div>
        <p style="font-size: 13px; color: #8A8070; margin-bottom: 12px;">You haven't logged yesterday's study yet. Here is what you were to do:</p>
        <div class="topic-card law">
          <div class="domain-label">⚖️ Law</div>
          <p class="topic-text">${yesterdayTopics.law ?? 'Integration & sharing buffer'}</p>
        </div>
        <div class="topic-card econ">
          <div class="domain-label">📊 Economics</div>
          <p class="topic-text">${yesterdayTopics.economics ?? 'Integration & sharing buffer'}</p>
        </div>
        <div class="topic-card fin">
          <div class="domain-label">💰 Finance</div>
          <p class="topic-text">${yesterdayTopics.finance ?? 'Integration & sharing buffer'}</p>
        </div>
        <div style="text-align: center;">
          <a href="${siteUrl}/dashboard" class="btn btn-secondary">Log Yesterday's Progress</a>
        </div>
      </div>
      ` : ''}

      <div class="footer">
        This is an automated reminder from your LEF OS accountability companion.<br>
        To unsubscribe, edit your settings in the app.
      </div>
    </div>
  </div>
</body>
</html>
      `;

      // Make Resend API request
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'LEF OS Reminder <onboarding@resend.dev>',
          to: email,
          subject: `LEF OS · Day ${todayDay} Study Reminder`,
          html: emailHtml,
        }),
      });

      if (emailRes.ok) {
        results.push({ email, status: 'sent' });
      } else {
        const errorText = await emailRes.text();
        console.error(`Failed to send email to ${email}:`, errorText);
        results.push({ email, status: 'failed', error: errorText });
      }
    }

    return NextResponse.json({ ok: true, processed: results });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
