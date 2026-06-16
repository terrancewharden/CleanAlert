import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "CleanAlert <notifications@cleanalert.com>";

// ─── Templates ────────────────────────────────────────────────────────────────

function baseTemplate(title, preheader, body) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:#0A1628;padding:24px 32px;display:flex;align-items:center;">
      <span style="color:#00D4FF;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Clean</span>
      <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Alert</span>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;color:#0A1628;font-size:20px;font-weight:800;">${title}</h2>
      ${body}
    </div>
    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;background:#fafafa;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">You're receiving this because you have a CleanAlert account. Log in to manage your notifications.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Email senders ─────────────────────────────────────────────────────────────

/**
 * Notify buyer: a cleaner just bid on their contract
 */
export async function emailNewBid({ buyerEmail, buyerName, businessName, cleanerName, cleanerCompany, bidMessage }) {
  const body = `
    <p style="color:#374151;font-size:15px;line-height:1.6;">Hi ${buyerName || "there"},</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;">
      <strong>${cleanerName}${cleanerCompany ? ` (${cleanerCompany})` : ""}</strong> submitted a bid on your contract for
      <strong>${businessName}</strong>.
    </p>
    ${bidMessage ? `<div style="background:#f8fafc;border-left:3px solid #00D4FF;padding:12px 16px;border-radius:4px;margin:16px 0;color:#374151;font-size:14px;font-style:italic;">"${bidMessage}"</div>` : ""}
    <a href="https://cleanalert.com/buyer" style="display:inline-block;margin-top:16px;background:#00D4FF;color:#0A1628;font-weight:800;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
      Review the Bid →
    </a>
    <p style="color:#6b7280;font-size:13px;margin-top:20px;">Log in to view their full profile, message them, and accept or pass.</p>
  `;
  return send({
    to: buyerEmail,
    subject: `New bid on ${businessName} — CleanAlert`,
    html: baseTemplate(`New bid on ${businessName}`, `${cleanerName} wants the job`, body),
  });
}

/**
 * Notify cleaner: their bid was accepted
 */
export async function emailBidAccepted({ cleanerEmail, cleanerName, businessName, buyerName, buyerEmail, buyerPhone }) {
  const body = `
    <p style="color:#374151;font-size:15px;line-height:1.6;">Congrats ${cleanerName || ""}! 🎉</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;">
      Your bid on <strong>${businessName}</strong> was accepted. The client's contact info is now unlocked in your dashboard.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 6px;color:#166534;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">🔓 Client Contact</p>
      <p style="margin:0;color:#0c4a6e;font-size:15px;font-weight:600;">${buyerName}</p>
      <p style="margin:4px 0 0;color:#374151;font-size:14px;">${buyerEmail}${buyerPhone ? ` · ${buyerPhone}` : ""}</p>
    </div>
    <a href="https://cleanalert.com/cleaner" style="display:inline-block;margin-top:8px;background:#00D4FF;color:#0A1628;font-weight:800;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
      Go to My Active Contracts →
    </a>
    <p style="color:#6b7280;font-size:13px;margin-top:20px;">You can also message the client directly through CleanAlert's in-app messaging.</p>
  `;
  return send({
    to: cleanerEmail,
    subject: `🎉 You got the job — ${businessName}`,
    html: baseTemplate(`You got the job — ${businessName}`, "Your bid was accepted", body),
  });
}

/**
 * Notify admin: a deal was made
 */
export async function emailAdminDealAlert({ businessName, facilityType, budget, buyerName, buyerEmail, buyerPhone, cleanerName, cleanerEmail, cleanerPhone, cleanerCompany }) {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || "terrancewharden@gmail.com";
  const body = `
    <p style="color:#374151;font-size:15px;">A new deal was closed on CleanAlert.</p>
    <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 4px;color:#92400e;font-weight:800;font-size:16px;">${businessName}</p>
      <p style="margin:0;color:#78350f;font-size:13px;">${facilityType}${budget ? ` · ${budget}` : ""}</p>
    </div>
    <div style="display:grid;gap:8px;margin:16px 0;">
      <div style="background:#f8fafc;padding:12px;border-radius:6px;">
        <p style="margin:0 0 2px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;">Buyer</p>
        <p style="margin:0;color:#0A1628;font-size:14px;font-weight:600;">${buyerName} · ${buyerEmail}${buyerPhone ? ` · ${buyerPhone}` : ""}</p>
      </div>
      <div style="background:#f8fafc;padding:12px;border-radius:6px;">
        <p style="margin:0 0 2px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;">Cleaner</p>
        <p style="margin:0;color:#0A1628;font-size:14px;font-weight:600;">${cleanerName}${cleanerCompany ? ` (${cleanerCompany})` : ""} · ${cleanerEmail}${cleanerPhone ? ` · ${cleanerPhone}` : ""}</p>
      </div>
    </div>
    <a href="https://cleanalert.com/admin" style="display:inline-block;background:#0A1628;color:#00D4FF;font-weight:800;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
      Open Admin Panel →
    </a>
  `;
  return send({
    to: adminEmail,
    subject: `🤝 New deal: ${businessName} — CleanAlert`,
    html: baseTemplate(`New deal closed`, "Follow up within 24 hours", body),
  });
}

// ─── Internal helper ──────────────────────────────────────────────────────────

async function send({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", to);
    return;
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) console.error("[email] Resend error:", error);
  } catch (err) {
    console.error("[email] Failed to send:", err.message);
  }
}
