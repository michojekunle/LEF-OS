import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getDayNumber,
  getTodayTopics,
  getCurrentStreak,
  clampDay,
  isoDate,
  isEntryComplete,
} from '@/lib/utils';
import webpush from 'web-push';
import { buildEmailLayout, sanitizeHtmlText, sendEmail as dispatchEmail } from '@/lib/email';
import { calculateLocalHour, matchCustomReminders, shouldSendReminder } from '@/lib/reminders';
import { getSiteUrl } from '@/lib/env';

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
      const localHour = calculateLocalHour(todayDate, timezone);

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
      const matchingReminders = matchCustomReminders(customReminders || [], localHour);

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

      const todayComplete = !!(todayLog && isEntryComplete(todayLog));
      const yesterdayComplete = !!(yesterdayLog && isEntryComplete(yesterdayLog));

      // Do not send reminders if today is already logged/complete
      if (
        !shouldSendReminder({ todayComplete, matchingRemindersCount: matchingReminders.length })
      ) {
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
          const siteUrl = getSiteUrl(new URL(request.url).origin);

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

          emailSent = await dispatchEmail({
            to: email,
            subject: `LEF OS · ${title} (Day ${todayDay})`,
            html: emailHtml,
            from: 'LEF OS Reminder <onboarding@resend.dev>',
          });
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
  const todayLaw = todayTopics.law
    ? sanitizeHtmlText(todayTopics.law)
    : 'Integration & sharing buffer';
  const todayEcon = todayTopics.economics
    ? sanitizeHtmlText(todayTopics.economics)
    : 'Integration & sharing buffer';
  const todayFin = todayTopics.finance
    ? sanitizeHtmlText(todayTopics.finance)
    : 'Integration & sharing buffer';

  const yesterdayHtml = !yesterdayComplete
    ? `
      <div style="border-top: 1px solid #2a2a2a; margin-top: 32px; padding-top: 24px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #cc7272; margin-bottom: 12px;">Yesterday was waiting (Day ${yesterdayDay})</div>
        <p style="font-size: 13px; color: #857e76; margin-bottom: 12px;">You haven't logged yesterday's study yet. Here is what you were to do:</p>
        <div class="card" style="border-left: 3px solid #c9ab70; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 6px 6px 0;">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #857e76; margin-bottom: 4px;">⚖️ Law</div>
          <p style="font-size: 14px; margin: 0; color: #ede8e0;">${yesterdayTopics.law ? sanitizeHtmlText(yesterdayTopics.law) : 'Integration & sharing buffer'}</p>
        </div>
        <div class="card" style="border-left: 3px solid #7C9E8F; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 6px 6px 0;">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #857e76; margin-bottom: 4px;">📊 Economics</div>
          <p style="font-size: 14px; margin: 0; color: #ede8e0;">${yesterdayTopics.economics ? sanitizeHtmlText(yesterdayTopics.economics) : 'Integration & sharing buffer'}</p>
        </div>
        <div class="card" style="border-left: 3px solid #8B9ECC; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 6px 6px 0;">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #857e76; margin-bottom: 4px;">💰 Finance</div>
          <p style="font-size: 14px; margin: 0; color: #ede8e0;">${yesterdayTopics.finance ? sanitizeHtmlText(yesterdayTopics.finance) : 'Integration & sharing buffer'}</p>
        </div>
      </div>`
    : '';

  const cardHtml = `
  <div class="card" style="text-align: center; padding: 16px;">
    <div style="font-size: 16px; font-weight: bold; color: #c9ab70;">
      ${streak > 0 ? `🔥 Current Streak: ${streak} Days` : '🌱 Start your study streak today!'}
    </div>
  </div>

  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #857e76; margin-top: 24px; margin-bottom: 12px;">Today's Topics (Day ${todayDay})</div>
  
  <div class="card" style="border-left: 3px solid #c9ab70; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 6px 6px 0;">
    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #857e76; margin-bottom: 4px;">⚖️ Law</div>
    <p style="font-size: 14px; margin: 0; color: #ede8e0;">${todayLaw}</p>
  </div>
  <div class="card" style="border-left: 3px solid #7C9E8F; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 6px 6px 0;">
    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #857e76; margin-bottom: 4px;">📊 Economics</div>
    <p style="font-size: 14px; margin: 0; color: #ede8e0;">${todayEcon}</p>
  </div>
  <div class="card" style="border-left: 3px solid #8B9ECC; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 6px 6px 0;">
    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #857e76; margin-bottom: 4px;">💰 Finance</div>
    <p style="font-size: 14px; margin: 0; color: #ede8e0;">${todayFin}</p>
  </div>

  ${yesterdayHtml}
  `;

  return buildEmailLayout({
    title: sanitizeHtmlText(title),
    badgeText: `Day ${todayDay} Study Reminder`,
    subTitle: sanitizeHtmlText(message),
    cardHtml,
    actionButton: {
      text: "Log Today's Progress",
      url: `${siteUrl}/dashboard`,
    },
    footerText: `This is an automated reminder from your LEF OS accountability companion.<br />To unsubscribe, edit your settings in the app.`,
  });
}
