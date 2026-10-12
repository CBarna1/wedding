"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full rounded-xl border border-rose-light bg-white px-4 py-3 text-ink placeholder:text-ink/40 " +
  "transition focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20";
const labelClass = "mb-2 block text-sm font-medium tracking-wide text-ink/80";

export default function RSVPForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [dietary, setDietary] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (attending === null) {
      setError("Please let us know if you can attend.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          attending,
          guest_count: attending ? guestCount : 1,
          dietary_restrictions: attending ? dietary : "",
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status >= 500) {
        // Server/database errors aren't meaningful to guests; keep details in the console.
        console.error("RSVP failed:", data.error);
        throw new Error("We couldn't save your RSVP right now. Please try again in a moment.");
      }
      if (!res.ok || !data.success) {
        // 4xx validation messages are written for guests, so show them as-is.
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-rose-light/60 bg-white px-6 py-14 text-center shadow-sm" role="status">
        <p className="font-serif text-4xl text-rose">Thank you! 💌</p>
        <p className="mx-auto mt-4 max-w-sm text-ink/70">
          {attending
            ? "We can't wait to celebrate with you. A confirmation is on its way to your inbox."
            : "We'll miss you dearly. Thank you for letting us know."}
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-rose-light/60 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10"
    >
      <div>
        <label htmlFor="name" className={labelClass}>Full Name</label>
        <input
          id="name"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input
          id="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="jane@example.com"
        />
      </div>

      <fieldset>
        <legend className={labelClass}>Will you attend?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { value: true, label: "Joyfully accepts" },
            { value: false, label: "Regretfully declines" },
          ].map((opt) => {
            const selected = attending === opt.value;
            return (
              <label
                key={opt.label}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  selected
                    ? "border-rose bg-rose/5 text-ink"
                    : "border-rose-light text-ink/70 hover:border-rose/60 hover:bg-cream"
                }`}
              >
                <input
                  type="radio"
                  name="attending"
                  required
                  checked={selected}
                  onChange={() => setAttending(opt.value)}
                  className="h-4 w-4 accent-rose"
                />
                <span className="font-serif text-lg">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {attending && (
        <div className="space-y-6">
          <div>
            <label htmlFor="guests" className={labelClass}>Number of guests (including you)</label>
            <select
              id="guests"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className={inputClass}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dietary" className={labelClass}>
              Dietary restrictions <span className="font-normal text-ink/50">(optional)</span>
            </label>
            <input
              id="dietary"
              type="text"
              maxLength={2000}
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className={inputClass}
              placeholder="Vegetarian, nut allergy…"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="message" className={labelClass}>
          Message to the couple <span className="font-normal text-ink/50">(optional)</span>
        </label>
        <textarea
          id="message"
          rows={4}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} resize-y`}
          placeholder="Share your well wishes…"
        />
      </div>

      {status === "error" && error && (
        <p className="rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose-dark" role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-6 py-4 font-serif text-lg tracking-wide text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-dark hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
        )}
        {submitting ? "Sending…" : "Send RSVP"}
      </button>
    </form>
  );
}
