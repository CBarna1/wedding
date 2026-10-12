import RSVPForm from "./components/RSVPForm";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {/* Soft decorative glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-light/30 blur-3xl"
        />

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.4em] text-rose sm:text-sm">Together with their families</p>

          <h1 className="mt-8 font-serif text-6xl font-normal leading-none text-ink sm:text-8xl">
            Ebenezer
            <span className="my-2 block font-serif text-4xl italic text-rose sm:my-3 sm:text-6xl">&amp;</span>
            Audrey
          </h1>

          <p className="mt-8 text-sm uppercase tracking-[0.3em] text-ink/60">request the pleasure of your company</p>

          <div className="mx-auto my-10 h-px w-16 bg-rose/60" />

          <p className="font-serif text-2xl text-ink sm:text-3xl">19 January 2027 · 2:00 PM</p>
          <p className="mt-2 font-serif text-xl italic text-ink/70 sm:text-2xl">Sunset Garden, Kitwe</p>

          <a
            href="#rsvp"
            className="mt-12 inline-block rounded-full border border-rose px-8 py-3 font-serif text-lg tracking-wide text-rose transition hover:bg-rose hover:text-white"
          >
            RSVP
          </a>
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp" className="scroll-mt-8 px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-xl">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-4xl text-ink sm:text-5xl">Kindly Reply</h2>
            <p className="mt-3 text-ink/60">We would be honored to have you with us.</p>
          </div>
          <RSVPForm />
        </div>
      </section>

      <footer className="pb-12 text-center font-serif text-lg italic text-rose">E &amp; A · 19.01.2027</footer>
    </main>
  );
}
