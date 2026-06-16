import nodemailer from "nodemailer";

const FROM_NAME = "CleanAlert";
const FROM_EMAIL = process.env.GMAIL_USER || "tboyztablegames@gmail.com";
const ADMIN_EMAIL = process.env.ADMIN_ALERT_EMAIL || "tboyztablegames@gmail.com";

function getTransport() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — emails disabled");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// ─── Templates ────────────────────────────────────────────────────────────────

function baseTemplate(title, body) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#0A1628;padding:24px 32px;">
      <span style="color:#00D4FF;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Clean</span><span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Alert</span>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;color:#0A1628;font-size:20px;font-weight:800;">${title}</h2>
      ${body}
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;background:#fafafa;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">You're receiving this because you have a CleanAlert account.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Email senders ─────────────────────────────────────────────────────────────

export async function emailNewBid({ buyerEmail, buyerName, businessName, cleanerName, cleanerCompany, bidMessage }) {
  const body = `
    <p style="color:#374151;font-size:15px;line-height:1.6;">Hi ${buyerName || "there"},</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;">
      <strong>${cleanerName}${cleanerCompany ? ` (${cleanerCompany})` : ""}</strong> submitted a bid on your contract for <strong>${businessName}</strong>.
    </p>
    ${bidMessage ? `<div style="background:#f8fafc;border-left:3px solid #00D4FF;padding:12px 16px;border-radius:4px;margin:16px 0;color:#374151;font-size:14px;font-style:italic;">"${bidMessage}"</div>` : ""}
    <a href="https://cleanalert-production.up.railway.app/buyer" style="display:inline-block;margin-top:16px;background:#00D4FF;color:#0A1628;font-weight:800;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Review the Bid →</a>
    <p style="color:#6b7280;font-size:13px;margin-top:20px;">Log in to view their full profile, message them, and accept or pass.</p>
  `;
  return send({ to: buyerEmail, subject: `New bid on ${businessName} — CleanAlert`, html: baseTemplate(`New bid on ${businessName}`, body) });
}

export async function emailBidAccepted({ cleanerEmail, cleanerName, businessName, buyerName, buyerEmail, buyerPhone }) {
  const body = `
    <p style="color:#374151;font-size:15px;line-height:1.6;">Congrats ${cleanerName || ""}! 🎉</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;">
      Your bid on <strong>${businessName}</strong> was accepted. The client's contact info is now unlocked in your dashboard.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 4px;color:#166534;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">🔓 Client Contact</p>
      <p style="margin:0;color:#0c4a6e;font-size:15px;font-weight:600;">${buyerName}</p>
      <p style="margin:4px 0 0;color:#374151;font-size:14px;">${buyerEmail}${buyerPhone ? ` · ${buyerPhone}` : ""}</p>
    </div>
    <a href="https://cleanalert-production.up.railway.app/cleaner" style="display:inline-block;margin-top:8px;background:#00D4FF;color:#0A1628;font-weight:800;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Go to My Active Contracts →</a>
    <p style="color:#6b7280;font-size:13px;margin-top:20px;">You can also message the client directly through CleanAlert's in-app messaging.</p>
  `;
  return send({ to: cleanerEmail, subject: `🎉 You got the job — ${businessName}`, html: baseTemplate(`You got the job — ${businessName}`, body) });
}

export async function emailAdminDealAlert({ businessName, facilityType, budget, buyerName, buyerEmail, buyerPhone, cleanerName, cleanerEmail, cleanerPhone, cleanerCompany }) {
  const body = `
    <p style="color:#374151;font-size:15px;">A new deal was closed on CleanAlert.</p>
    <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 4px;color:#92400e;font-weight:800;font-size:16px;">${businessName}</p>
      <p style="margin:0;color:#78350f;font-size:13px;">${facilityType || ""}${budget ? ` · ${budget}` : ""}</p>
    </div>
    <div style="background:#f8fafc;padding:12px;border-radius:6px;margin-bottom:8px;">
      <p style="margin:0 0 2px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;">Buyer</p>
      <p style="margin:0;color:#0A1628;font-size:14px;font-weight:600;">${buyerName} · ${buyerEmail}${buyerPhone ? ` · ${buyerPhone}` : ""}</p>
    </div>
    <div style="background:#f8fafc;padding:12px;border-radius:6px;margin-bottom:16px;">
      <p style="margin:0 0 2px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;">Cleaner</p>
      <p style="margin:0;color:#0A1628;font-size:14px;font-weight:600;">${cleanerName}${cleanerCompany ? ` (${cleanerCompany})` : ""} · ${cleanerEmail}${cleanerPhone ? ` · ${cleanerPhone}` : ""}</p>
    </div>
    <a href="https://cleanalert-production.up.railway.app/admin" style="display:inline-block;background:#0A1628;color:#00D4FF;font-weight:800;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Open Admin Panel →</a>
  `;
  return send({ to: ADMIN_EMAIL, subject: `🤝 New deal: ${businessName} — CleanAlert`, html: baseTemplate("New deal closed on CleanAlert", body) });
}

// ─── Internal helper ──────────────────────────────────────────────────────────

async function send({ to, subject, html }) {
  const transport = getTransport();
  if (!transport) return;
  try {
    await transport.sendMail({ from: `"${FROM_NAME}" <${FROM_EMAIL}>`, to, subject, html });
  } catch (err) {
    console.error("[email] Failed to send to", to, "—", err.message);
  }
}
