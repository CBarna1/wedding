/**
 * HTML email templates.
 *
 * Inline CSS only: Gmail, Outlook and most other clients strip <style> tags.
 * Table-based layout is used for consistent rendering across clients.
 * All user-supplied values are HTML-escaped to prevent markup injection.
 */

const ROSE = "#b76e79";
const CREAM = "#fffaf9";
const INK = "#3a3a3a";
const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const EVENT = {
  couple: "Ebenezer &amp; Audrey",
  date: "19 January 2027 · 2:00 PM",
  venue: "Sunset Garden, Kitwe",
};

/** Escape characters that have meaning in HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escape and keep the guest's line breaks. */
function multiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

/** Shared wrapper for the two guest-facing, serif-styled emails. */
function guestLayout(heading: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:${CREAM};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${CREAM};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border:1px solid #f0dfe1;border-radius:12px;">
          <tr>
            <td align="center" style="padding:40px 32px 8px 32px;">
              <p style="margin:0;font-family:${SERIF};font-size:13px;letter-spacing:3px;text-transform:uppercase;color:${ROSE};">${EVENT.couple}</p>
              <h1 style="margin:16px 0 0 0;font-family:${SERIF};font-size:30px;font-weight:normal;line-height:1.3;color:${INK};">${heading}</h1>
              <div style="width:48px;height:1px;background-color:${ROSE};margin:24px auto 0 auto;line-height:1px;font-size:1px;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 40px 32px;font-family:${SERIF};font-size:17px;line-height:1.7;color:${INK};">
              ${body}
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0 0;font-family:${SERIF};font-size:13px;color:#8a8a8a;">${EVENT.date}<br />${EVENT.venue}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Confirmation for guests who accepted. */
export function attendingEmail(name: string, guestCount: number, dietary?: string | null): string {
  const partyLabel = guestCount === 1 ? "1 guest" : `${guestCount} guests`;
  const dietaryRow = dietary
    ? `<tr>
        <td style="padding:6px 0;font-family:${SERIF};font-size:15px;color:#7a7a7a;width:130px;vertical-align:top;">Dietary notes</td>
        <td style="padding:6px 0;font-family:${SERIF};font-size:15px;color:${INK};">${multiline(dietary)}</td>
      </tr>`
    : "";

  return guestLayout(
    "We can't wait to celebrate with you!",
    `<p style="margin:0 0 16px 0;">Dear ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px 0;">Thank you so much for your RSVP. It means the world to us that you'll be there as we say &ldquo;I do.&rdquo; Here is what we have for you:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;background-color:${CREAM};border-left:3px solid ${ROSE};border-radius:6px;">
      <tr><td style="padding:16px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:6px 0;font-family:${SERIF};font-size:15px;color:#7a7a7a;width:130px;">When</td>
            <td style="padding:6px 0;font-family:${SERIF};font-size:15px;color:${INK};">${EVENT.date}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-family:${SERIF};font-size:15px;color:#7a7a7a;">Where</td>
            <td style="padding:6px 0;font-family:${SERIF};font-size:15px;color:${INK};">${EVENT.venue}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-family:${SERIF};font-size:15px;color:#7a7a7a;">Party size</td>
            <td style="padding:6px 0;font-family:${SERIF};font-size:15px;color:${INK};">${partyLabel}</td>
          </tr>
          ${dietaryRow}
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 16px 0;">If anything changes, just reply to this email and let us know.</p>
    <p style="margin:24px 0 0 0;">With love,<br /><span style="font-size:22px;color:${ROSE};">Ebenezer &amp; Audrey</span></p>`
  );
}

/** Confirmation for guests who declined. */
export function declinedEmail(name: string): string {
  return guestLayout(
    "We'll miss you!",
    `<p style="margin:0 0 16px 0;">Dear ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px 0;">Thank you for letting us know. We're sorry you can't join us, but we're so grateful you took the time to reply, and we'll be thinking of you on our big day.</p>
    <p style="margin:0 0 16px 0;">If your plans change, just reply to this email and we'll do our best to make room for you.</p>
    <p style="margin:24px 0 0 0;">With love,<br /><span style="font-size:22px;color:${ROSE};">Ebenezer &amp; Audrey</span></p>`
  );
}

export interface CoupleNotification {
  name: string;
  email: string;
  attending: boolean;
  guestCount: number;
  dietary?: string | null;
  message?: string | null;
}

/** Plain, scannable summary sent to the couple for each RSVP. */
export function notifyCoupleEmail({
  name,
  email,
  attending,
  guestCount,
  dietary,
  message,
}: CoupleNotification): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-family:${SANS};font-size:14px;color:#777777;width:140px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-family:${SANS};font-size:14px;color:${INK};vertical-align:top;">${value}</td>
    </tr>`;

  const status = attending
    ? `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background-color:#e7f4ea;color:#2f7a45;font-weight:600;">Attending</span>`
    : `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background-color:#f6e8ea;color:${ROSE};font-weight:600;">Declined</span>`;

  const safeEmail = escapeHtml(email);
  const rows = [
    row("Name", escapeHtml(name)),
    row("Email", `<a href="mailto:${safeEmail}" style="color:${ROSE};text-decoration:none;">${safeEmail}</a>`),
    row("Response", status),
    attending ? row("Guests", String(guestCount)) : "",
    attending ? row("Dietary", dietary ? multiline(dietary) : `<span style="color:#aaaaaa;">None</span>`) : "",
    row("Message", message ? multiline(message) : `<span style="color:#aaaaaa;">None</span>`),
  ].join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;">
          <tr>
            <td style="padding:28px 28px 8px 28px;font-family:${SANS};">
              <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${ROSE};font-weight:600;">New RSVP</p>
              <h1 style="margin:6px 0 0 0;font-size:20px;font-weight:600;color:${INK};">${escapeHtml(name)} ${attending ? "is coming 🎉" : "can't make it"}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 28px 28px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
              <p style="margin:20px 0 0 0;font-family:${SANS};font-size:12px;color:#999999;">Reply to this email to respond directly to ${escapeHtml(name)}.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
