import nodemailer from 'nodemailer';
import { getSettings } from './settings.js';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function getMailConfig() {
  const s = await getSettings();
  const db = s.smtp || {};
  const host = db.host || process.env.SMTP_HOST;
  const user = db.user || process.env.SMTP_USER;
  const pass = db.pass || process.env.SMTP_PASS;
  const port = Number(db.host ? db.port : process.env.SMTP_PORT) || 587;
  const secure = db.host ? !!db.secure : process.env.SMTP_SECURE === 'true';
  return {
    settings: s,
    configured: !!(host && user && pass),
    transport: { host, port, secure, auth: { user, pass } },
    from: `"${db.fromName || process.env.MAIL_FROM_NAME || s.general.siteName}" <${
      db.fromEmail || process.env.MAIL_FROM_EMAIL || user
    }>`,
    notify: db.notifyEmail || process.env.ADMIN_NOTIFY_EMAIL || s.contact.email,
  };
}

export function layout(settings, title, bodyHtml) {
  const t = settings.theme || {};
  const g = settings.general || {};
  const c = settings.contact || {};
  return `<!doctype html><html><body style="margin:0;background:#f4f6fa;font-family:Arial,Helvetica,sans-serif;color:#1d2939">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0"><tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
    <tr><td style="background:${t.secondary || '#0a1a33'};padding:22px 28px;color:#fff">
      <div style="font-size:20px;font-weight:bold">${esc(g.siteName)}</div>
      <div style="font-size:12px;color:${t.accent || '#f5a524'};margin-top:4px">${esc(g.tagline)}</div>
    </td></tr>
    <tr><td style="padding:28px">
      <h2 style="margin:0 0 16px;font-size:20px;color:${t.primary || '#0b4fa8'}">${esc(title)}</h2>
      ${bodyHtml}
    </td></tr>
    <tr><td style="padding:16px 28px;background:#f4f6fa;font-size:12px;color:#667085">
      ${esc(c.address)}<br/>${esc(c.phone)} · ${esc(c.email)}
    </td></tr>
  </table></td></tr></table></body></html>`;
}

export function detailsTable(rows) {
  return `<table cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">${rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="border-bottom:1px solid #eaecf0;color:#667085;width:140px;vertical-align:top">${esc(
          k
        )}</td><td style="border-bottom:1px solid #eaecf0;white-space:pre-wrap">${esc(v)}</td></tr>`
    )
    .join('')}</table>`;
}

/**
 * Send an email. Never throws — returns { sent, skipped, error }.
 * `to: 'admin'` sends to the configured notification address.
 */
export async function sendMail({ to, subject, html, replyTo, attachments }) {
  try {
    const cfg = await getMailConfig();
    const recipient = to === 'admin' ? cfg.notify : to;
    if (!cfg.configured) {
      console.log(`✉️  [email skipped – SMTP not configured] to=${recipient} subject="${subject}"`);
      return { sent: false, skipped: true };
    }
    const transporter = nodemailer.createTransport(cfg.transport);
    await transporter.sendMail({ from: cfg.from, to: recipient, subject, html, replyTo, attachments });
    return { sent: true };
  } catch (error) {
    console.error('✉️  Email error:', error.message);
    return { sent: false, error: error.message };
  }
}

export async function verifySmtp() {
  const cfg = await getMailConfig();
  if (!cfg.configured) throw new Error('SMTP is not configured');
  await nodemailer.createTransport(cfg.transport).verify();
  return cfg;
}

export { esc, getMailConfig };
