/**
 * lib/email.ts
 * Single place for all email sending and templating.
 *
 * sendEmail()        — thin wrapper over Resend API, returns boolean
 * buildEmailLayout() — shared dark-themed HTML template shell
 * sanitizeHtmlText() — XSS-safe text → HTML
 */

export function sanitizeHtmlText(str: string): string {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function buildEmailLayout(params: {
  title: string;
  badgeText: string;
  subTitle: string;
  cardHtml: string;
  actionButton?: {
    text: string;
    url: string;
  } | null;
  footerText: string;
}): string {
  const { title, badgeText, subTitle, cardHtml, actionButton, footerText } = params;

  const btnHtml = actionButton
    ? `<div class="cta">
         <a class="btn" href="${actionButton.url}" target="_blank" rel="noopener noreferrer">
           ${actionButton.text}
         </a>
       </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body{margin:0;padding:0;background:#0e0e0e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
  .wrap{max-width:560px;margin:0 auto;padding:40px 24px;}
  .logo{color:#c9ab70;font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;border-bottom:1px solid #2a2a2a;padding-bottom:20px;margin-bottom:28px;}
  .badge{display:inline-block;background:#c9ab7022;color:#c9ab70;border:1px solid #c9ab7040;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px;}
  .badge.alert{background:#cc727222;color:#cc7272;border:1px solid #cc727240;}
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
  .id { font-family: monospace; color: #857e76; font-size: 11px; }
  .count { font-size:32px; font-weight:700; color:#cc7272; line-height:1; margin-bottom:4px; text-align:center; }
  .count-label { color:#857e76; font-size:12px; text-align:center; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">LEF OS</div>
  <div class="badge ${badgeText.includes('Flag') || badgeText.includes('Threshold') ? 'alert' : ''}">${badgeText}</div>
  <h1>${title}</h1>
  <p class="sub">${subTitle}</p>

  ${cardHtml}

  ${btnHtml}

  <div class="footer">
    ${footerText}
  </div>
</div>
</body>
</html>`;
}

/**
 * Send a transactional email via Resend.
 * Returns true on success, false on any error (never throws).
 * Silently no-ops when RESEND_API_KEY or the recipient is unset.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  /** Override sender — defaults to 'LEF OS <onboarding@resend.dev>' */
  from?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !params.to) return false;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: params.from ?? 'LEF OS <onboarding@resend.dev>',
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });
    if (!res.ok) {
      console.error('[email] Resend error:', await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] Failed to send:', err);
    return false;
  }
}

/**
 * Convenience: send to the admin (ADMIN_EMAIL env var).
 * No-op when ADMIN_EMAIL is unset.
 */
export async function sendAdminEmail(params: {
  subject: string;
  html: string;
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  return sendEmail({ to: adminEmail, ...params });
}
