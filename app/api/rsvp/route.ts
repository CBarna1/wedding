import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendMail } from "@/lib/mailer";
import { attendingEmail, declinedEmail, notifyCoupleEmail } from "@/lib/emails";

// Nodemailer needs the Node.js runtime (not Edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Field limits. Mirrored by CHECK constraints in supabase/schema.sql.
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_TEXT = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RsvpInput {
  name: string;
  email: string;
  attending: boolean;
  guest_count: number;
  dietary_restrictions: string | null;
  message: string | null;
}

/** Trim a value to a string, or null if it is empty or not a string. */
function optionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

/** Validate and normalize the request body. Returns an error message on failure. */
function parseBody(body: unknown): { data: RsvpInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";

  if (!name) return { error: "Please enter your name." };
  if (name.length > MAX_NAME) return { error: "Name is too long." };
  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (typeof b.attending !== "boolean") {
    return { error: "Please let us know if you can attend." };
  }

  const attending = b.attending;
  let guestCount = 1;
  if (attending) {
    guestCount = Number(b.guest_count ?? 1);
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 10) {
      return { error: "Number of guests must be between 1 and 10." };
    }
  }

  // Dietary restrictions only make sense for guests who are attending.
  const dietary = attending ? optionalText(b.dietary_restrictions) : null;
  const message = optionalText(b.message);
  if ((dietary?.length ?? 0) > MAX_TEXT || (message?.length ?? 0) > MAX_TEXT) {
    return { error: `Please keep text fields under ${MAX_TEXT} characters.` };
  }

  return {
    data: {
      name,
      email,
      attending,
      guest_count: guestCount,
      dietary_restrictions: dietary,
      message,
    },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = parseBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
  }
  const rsvp = parsed.data;

  // 1. Save the RSVP. Note: no `.select()` after insert, because the anon role
  //    has no SELECT policy and asking for the inserted row back would fail RLS.
  try {
    const { error } = await getSupabase().from("rsvps").insert(rsvp);
    if (error) {
      console.error("[rsvp] Supabase insert failed:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  } catch (err) {
    console.error("[rsvp] Supabase client error:", err);
    const message = err instanceof Error ? err.message : "Database error.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }

  // 2. Send emails. The RSVP is already saved, so failures are logged, not
  //    surfaced to the guest. We await here because Vercel may freeze the
  //    function as soon as the response is returned.
  const guestMail = sendMail({
    to: rsvp.email,
    subject: rsvp.attending
      ? "You're on the list! Ebenezer & Audrey · 19 January 2027"
      : "Thank you for your RSVP · Ebenezer & Audrey",
    html: rsvp.attending
      ? attendingEmail(rsvp.name, rsvp.guest_count, rsvp.dietary_restrictions)
      : declinedEmail(rsvp.name),
  });

  const coupleMail = sendMail({
    to: process.env.COUPLE_EMAIL || process.env.GMAIL_USER || "",
    subject: `RSVP: ${rsvp.name} ${rsvp.attending ? `is attending (${rsvp.guest_count})` : "declined"}`,
    replyTo: rsvp.email,
    html: notifyCoupleEmail({
      name: rsvp.name,
      email: rsvp.email,
      attending: rsvp.attending,
      guestCount: rsvp.guest_count,
      dietary: rsvp.dietary_restrictions,
      message: rsvp.message,
    }),
  });

  const results = await Promise.allSettled([guestMail, coupleMail]);
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[rsvp] Failed to send ${i === 0 ? "guest" : "couple"} email:`, result.reason);
    }
  });

  return NextResponse.json({ success: true });
}
