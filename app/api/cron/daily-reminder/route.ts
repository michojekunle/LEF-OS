import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getDayNumber, getTodayTopics, getCurrentStreak, clampDay, isoDate } from '@/lib/utils';
import webpush from 'web-push';

export async function GET(request: Request) {
  // ── Auth: CRON_SECRET must be set and must match the Authorization header ──
  // Vercel cron jobs send: Authorization: Bearer <CRON_SECRET>
  // Without CRON_SECRET set, anyone could trigger mass email sends.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // No secret configured → block all requests to prevent abuse.
    // Set CRON_SECRET in your environment variables.
    console.error('[cron] CRON_SECRET is not set — request blocked for safety.');
    return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
  }

  // Accept the secret via header only — query params appear in logs/CDN traces.
  const authHeader = request.headers.get('Authorization') ?? '';
  const provided = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (provided !== secret) {
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

    // Fetch user settings for active notifications (with timezone)
    const { data: settingsList, error: settingsError } = await sb
      .from('user_settings')
      .select('user_id, email, timezone, daily_reminder_enabled')
      .eq('daily_reminder_enabled', true);

    if (settingsError) throw settingsError;
    if (!settingsList || settingsList.length === 0) {
      return NextResponse.json({ message: 'No users subscribed to reminders' });
    }

    const results = [];

    // Setup web-push details if VAPID keys are configured
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const hasVapid = Boolean(vapidPublicKey && vapidPrivateKey);
    if (hasVapid) {
      webpush.setVapidDetails('mailto:support@lef-os.com', vapidPublicKey!, vapidPrivateKey!);
    }

    // Process reminders for each user
    for (const setting of settingsList) {
      const userId = setting.user_id;
      const email = setting.email;
      const timezone = setting.timezone || 'Africa/Lagos';

      // 1. Calculate user's current hour in their timezone
      let localHourStr = '';
      try {
        localHourStr = new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          hour12: false,
          timeZone: timezone,
        }).format(todayDate);
      } catch {
        // Invalid timezone string — fall back to UTC
        localHourStr = new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          hour12: false,
          timeZone: 'UTC',
        }).format(todayDate);
      }

      const localHour = parseInt(localHourStr, 10);

      // 2. Fetch custom reminders for this user
      const { data: customReminders, error: remindersError } = await sb
        .from('custom_reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true);

      if (remindersError) {
        console.error(`Error fetching custom reminders for user ${userId}:`, remindersError);
        continue;
      }

      // Filter reminders matching the current hour
      const matchingReminders = (customReminders || []).filter((r) => {
        const reminderHour = parseInt(r.reminder_time.split(':')[0], 10);
        return reminderHour === localHour;
      });

      if (matchingReminders.length === 0) {
        continue;
      }

      // Fetch logs to check completion status
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

      const todayComplete =
        todayLog &&
        (todayLog.law_completed || todayLog.economics_completed || todayLog.finance_completed);
      const yesterdayComplete =
        yesterdayLog &&
        (yesterdayLog.law_completed ||
          yesterdayLog.economics_completed ||
          yesterdayLog.finance_completed);

      // Do not send reminders if today is already logged/complete
      if (todayComplete) {
        continue;
      }

      const { data: allEntries } = await sb
        .from('daily_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false });

      const streak = getCurrentStreak(allEntries ?? [], todayDate);

      // 3. Trigger each matching reminder
      for (const reminder of matchingReminders) {
        const title = reminder.title || 'LEF OS Study Reminder';
        const message = `Day ${todayDay} awaits: Law, Economics, and Finance. Keep your ${streak}-day streak going!`;

        let emailSent = false;
        let inAppSent = false;
        let pushSent = false;

        const sendEmail = reminder.delivery_type === 'email' || reminder.delivery_type === 'both';
        const sendInApp = reminder.delivery_type === 'in_app' || reminder.delivery_type === 'both';

        // --- EMAIL NOTIFICATION ---
        if (sendEmail) {
          const reqUrl = new URL(request.url);
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
            ? process.env.NEXT_PUBLIC_SITE_URL.includes('http')
              ? process.env.NEXT_PUBLIC_SITE_URL
              : `https://${process.env.NEXT_PUBLIC_SITE_URL}`
            : process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : reqUrl.origin.includes('localhost')
                ? reqUrl.origin
                : 'http://localhost:3001';

          const emailHtml = getReminderEmailHtml(
            title,
            message,
            streak,
            todayDay,
            todayTopics,
            yesterdayDay,
            yesterdayTopics,
            Boolean(yesterdayComplete),
            siteUrl,
          );

          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'LEF OS Reminder <onboarding@resend.dev>',
              to: email,
              subject: `LEF OS · ${title} (Day ${todayDay})`,
              html: emailHtml,
            }),
          });

          emailSent = emailRes.ok;
          if (!emailRes.ok) {
            console.error(`Failed to send email to ${email}:`, await emailRes.text());
          }
        }

        // --- IN-APP & DEVICE PUSH NOTIFICATION ---
        if (sendInApp) {
          const { error: insertError } = await sb.from('in_app_notifications').insert({
            user_id: userId,
            title: title,
            message: message,
          });

          inAppSent = !insertError;
          if (insertError) {
            console.error('Error creating in-app notification:', insertError);
          }

          if (hasVapid) {
            const { data: subscriptions } = await sb
              .from('push_subscriptions')
              .select('*')
              .eq('user_id', userId);

            if (subscriptions && subscriptions.length > 0) {
              const pushPayload = JSON.stringify({
                title: title,
                body: message,
                url: '/dashboard',
              });

              for (const subRecord of subscriptions) {
                // endpoint is always present in real push subscriptions —
                // the browser PushSubscriptionJSON type marks it optional for spec correctness
                if (!subRecord.subscription.endpoint) continue;
                try {
                  await webpush.sendNotification(
                    subRecord.subscription as webpush.PushSubscription,
                    pushPayload,
                  );
                  pushSent = true;
                } catch (pushErr) {
                  const statusCode = (pushErr as { statusCode?: number }).statusCode;
                  if (statusCode === 404 || statusCode === 410) {
                    await sb.from('push_subscriptions').delete().eq('id', subRecord.id);
                  }
                  console.error(`Web Push failed for subscription ${subRecord.id}:`, pushErr);
                }
              }
            }
          }
        }

        results.push({
          email,
          reminder_title: title,
          hour: localHour,
          email_sent: emailSent,
          in_app_sent: inAppSent,
          push_sent: pushSent,
        });
      }
    }

    return NextResponse.json({ ok: true, processed: results });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

function getReminderEmailHtml(
  title: string,
  message: string,
  streak: number,
  todayDay: number,
  todayTopics: { law?: string | null; economics?: string | null; finance?: string | null },
  yesterdayDay: number,
  yesterdayTopics: { law?: string | null; economics?: string | null; finance?: string | null },
  yesterdayComplete: boolean,
  siteUrl: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
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
        ${message}
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

      ${
        !yesterdayComplete
          ? `
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
      `
          : ''
      }

      <div class="footer">
        This is an automated reminder from your LEF OS accountability companion.<br>
        To unsubscribe, edit your settings in the app.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
