# Ebenezer & Audrey · Wedding Website

An elegant wedding invitation site with an RSVP form. Responses are saved to
**Supabase** and confirmation emails are sent through **Gmail** (Nodemailer +
App Password). No third-party email service required.

**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind CSS · Supabase · Nodemailer · Vercel

```
app/
  page.tsx                 Landing page (hero + RSVP section)
  layout.tsx               Fonts, metadata
  components/RSVPForm.tsx  Client-side RSVP form
  api/rsvp/route.ts        POST handler: validate → insert → send emails
lib/
  supabase.ts              Server-only Supabase client (publishable key)
  mailer.ts                Gmail transport + sendMail() helper
  emails.ts                Inline-CSS HTML email templates
supabase/schema.sql        Table, constraints, RLS policy
```

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local   # then fill in real values (see below)
npm run dev                  # http://localhost:3000
```

| Variable             | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `GMAIL_USER`         | Gmail address that sends the emails                          |
| `GMAIL_APP_PASSWORD` | 16-character Google App Password                             |
| `COUPLE_EMAIL`       | Where RSVP notifications are delivered                       |
| `SUPABASE_URL`       | `https://<project-ref>.supabase.co`                          |
| `SUPABASE_ANON_KEY`  | The **publishable** key (`sb_publishable_...`)               |

> These variables are intentionally **not** prefixed with `NEXT_PUBLIC_`, so
> they are only available on the server and never shipped to the browser.
> Never use the secret key (`sb_secret_...`) in this project. The app refuses
> to start the Supabase client if it detects one.

---

## 2. Get a Gmail App Password

App Passwords require **2-Step Verification** on the Google account.

1. Sign in to the Gmail account you want to send from (a dedicated account like
   `ourwedding2026@gmail.com` is recommended).
2. Go to <https://myaccount.google.com/security> and turn on **2-Step Verification**.
3. Open <https://myaccount.google.com/apppasswords>. (If you don't see it,
   2-Step Verification isn't on yet, or the account is a Workspace account
   whose admin has disabled App Passwords.)
4. Enter a name such as `Wedding Website` and click **Create**.
5. Copy the 16-character password into `GMAIL_APP_PASSWORD`. Spaces are fine,
   since the app strips them.

**Limits:** a regular Gmail account can send roughly 500 emails a day. Each
RSVP sends 2, which is plenty for a wedding. Changing the Google account
password revokes all App Passwords, so you'd need to make a new one.

---

## 3. Set up Supabase

1. Create a free project at <https://supabase.com/dashboard> → **New project**.
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This:
   - creates the `rsvps` table,
   - adds CHECK constraints (guest count 1–10, length limits),
   - **enables RLS** and adds one policy: `INSERT` for role `anon` with
     `WITH CHECK (true)`,
   - adds **no SELECT policy**, so the guest list can't be read with the public key.

   <details>
   <summary>Prefer the dashboard UI for the policy?</summary>

   Table Editor → `rsvps` → **RLS policies** → *Enable RLS* → *Create policy* →
   Policy command: **INSERT**, Target roles: **anon**, WITH CHECK expression: `true` → Save.
   </details>

3. Go to **Project Settings → API Keys** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `SUPABASE_ANON_KEY`
4. View responses any time under **Table Editor → rsvps**, or export to CSV from there.

---

## 4. Deploy to Vercel

1. Push this folder to a GitHub/GitLab/Bitbucket repo (`.env.local` is git-ignored).
2. At <https://vercel.com/new>, import the repo. The framework preset is
   detected as **Next.js** automatically.
3. Before deploying, expand **Environment Variables** and add all five
   variables from the table above (for Production, plus Preview if you like).
4. Click **Deploy**.
5. Later changes to env vars need a redeploy: **Deployments → ⋯ → Redeploy**.

Or with the CLI:

```bash
npm i -g vercel
vercel                      # link + preview deploy
vercel env add GMAIL_USER   # repeat for each variable
vercel --prod
```

---

## How the RSVP flow works

1. The guest submits the form → `POST /api/rsvp`.
2. The server validates and normalizes input (required fields, email format,
   guests 1–10, length limits).
3. The row is inserted with the publishable key. On failure the route returns
   **500** with the error message.
4. Two emails are sent in parallel:
   - **Guest:** a warm "see you there" email or a gracious "we'll miss you" email.
   - **Couple:** a summary with `Reply-To` set to the guest, so hitting Reply
     goes straight to them.
5. If sending fails, the error is logged (Vercel → Logs) but the guest still
   sees success, because their RSVP is already saved.

## Notes and possible hardening

- **Duplicate submissions** are allowed (a guest may update their reply). To
  allow one row per email instead, add
  `alter table rsvps add constraint rsvps_email_unique unique (email);`.
- **Spam:** the publishable key allows anonymous inserts by design. If you get
  bot traffic, consider adding a honeypot field, Cloudflare Turnstile, or
  Vercel's firewall rate limiting on `/api/rsvp`.
- Fonts (Cormorant Garamond + Inter) are self-hosted by `next/font` at build time.
