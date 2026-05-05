import Link from "next/link";

const proofPoints = [
  { value: "48h", label: "Prototype turnaround" },
  { value: "12", label: "Launches this quarter" },
  { value: "94%", label: "Client retention" },
];

const services = [
  {
    name: "Product Direction",
    description:
      "Sharp positioning, message architecture, and launch narratives that hold up under scrutiny.",
  },
  {
    name: "Interface Systems",
    description:
      "Web experiences with strong typography, durable design tokens, and motion that earns its keep.",
  },
  {
    name: "Delivery Support",
    description:
      "Short feedback loops for teams that need working code, not a gallery of static mockups.",
  },
];

const principles = [
  "Build a point of view before building components.",
  "Keep the system legible enough to move fast later.",
  "Make the first screen memorable without turning the rest into noise.",
];

export default function Home() {
  console.log("home disini");
  return (
    <main className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(234,117,52,0.18),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(62,114,84,0.18),_transparent_24%),linear-gradient(180deg,_#f8f1e5_0%,_#efe6d7_42%,_#e7dbc8_100%)] text-stone-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(22,22,22,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(22,22,22,0.05)_1px,transparent_1px)] bg-[size:120px_120px] opacity-40" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-8 sm:px-10 lg:px-12 lg:py-12">
        <header className="flex flex-col gap-6 rounded-[2rem] border border-stone-900/10 bg-[#fdf8ef]/90 px-6 py-5 shadow-[0_18px_60px_rgba(74,50,24,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              Northstar Atelier
            </p>
            <h1 className="mt-2 max-w-xl font-[family-name:var(--font-display)] text-4xl leading-none sm:text-5xl lg:text-6xl">
              Products with a sharper first impression.
            </h1>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-stone-700">
            <Link
              href="/about"
              className="rounded-full border border-stone-900/15 px-4 py-2 transition hover:border-stone-900 hover:bg-stone-950 hover:text-stone-50"
            >
              Meet the team
            </Link>
            <a
              href="mailto:studio@northstaratelier.dev"
              className="rounded-full bg-stone-950 px-4 py-2 text-stone-50 transition hover:bg-stone-800"
            >
              Book a working session
            </a>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <section className="rounded-[2.5rem] border border-stone-900/10 bg-[#fffdf8]/80 p-8 shadow-[0_24px_80px_rgba(49,34,17,0.08)] backdrop-blur sm:p-12">
            <p className="text-sm uppercase tracking-[0.32em] text-stone-500">
              Strategy, interface, and launch support
            </p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_12rem] lg:items-end">
              <div>
                <h2 className="max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[0.92] text-balance sm:text-6xl lg:text-7xl">
                  We turn early-stage ambition into something people can trust
                  on first contact.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
                  Editorial composition, decisive messaging, and
                  production-ready frontend work for teams that want launch
                  momentum without generic startup visuals.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-stone-900/10 bg-[#e87334] p-5 text-[#fff6ed] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <p className="text-xs uppercase tracking-[0.3em] text-[#fff1e5]/70">
                  This month
                </p>
                <p className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-none">
                  07
                </p>
                <p className="mt-3 text-sm leading-6 text-[#fff4ec]">
                  active builds moving from concept decks to working UI.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="mailto:studio@northstaratelier.dev?subject=Homepage%20Inquiry"
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
              >
                Start a project
              </a>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-stone-900/15 px-6 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-900 hover:bg-stone-100"
              >
                See how we work
              </Link>
            </div>
          </section>

          <aside className="grid gap-4">
            {proofPoints.map((point) => (
              <article
                key={point.label}
                className="rounded-[1.75rem] border border-stone-900/10 bg-[#fffaf2]/85 p-6 shadow-[0_18px_48px_rgba(52,40,18,0.06)]"
              >
                <p className="font-[family-name:var(--font-display)] text-5xl leading-none text-stone-950">
                  {point.value}
                </p>
                <p className="mt-3 text-sm uppercase tracking-[0.22em] text-stone-500">
                  {point.label}
                </p>
              </article>
            ))}
          </aside>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-stone-900/10 bg-[#213a31] p-8 text-stone-100 shadow-[0_18px_60px_rgba(24,40,34,0.18)] sm:p-10">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-100/60">
              Operating principle
            </p>
            <h3 className="mt-4 max-w-sm font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-5xl">
              Taste matters when the market is crowded.
            </h3>
            <div className="mt-8 space-y-4 text-sm leading-7 text-emerald-50/80">
              {principles.map((principle) => (
                <p key={principle} className="border-t border-white/10 pt-4">
                  {principle}
                </p>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.name}
                className="flex min-h-64 flex-col justify-between rounded-[2rem] border border-stone-900/10 bg-[#fff9f0]/85 p-6 shadow-[0_18px_54px_rgba(67,44,20,0.07)]"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
                    Service
                  </p>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight text-stone-950">
                    {service.name}
                  </h3>
                </div>
                <p className="mt-8 text-sm leading-7 text-stone-700">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-stone-900/10 bg-[#fffdf8]/85 p-8 shadow-[0_24px_80px_rgba(49,34,17,0.08)] sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                What gets delivered
              </p>
              <h3 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-5xl">
                A homepage system that feels authored, not assembled.
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-stone-900/10 bg-stone-950 p-6 text-stone-50">
                <p className="text-xs uppercase tracking-[0.32em] text-stone-400">
                  Deliverable 01
                </p>
                <p className="mt-4 text-lg leading-8 text-stone-200">
                  Messaging hierarchy tuned for skimming, demos, and
                  decision-maker reviews.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-stone-900/10 bg-[#e9ddcc] p-6 text-stone-900">
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
                  Deliverable 02
                </p>
                <p className="mt-4 text-lg leading-8 text-stone-800">
                  Reusable sections with enough structure for teams to extend
                  later without losing tone.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-stone-900/10 bg-[#f5eee0] p-6 text-stone-900 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
                  Deliverable 03
                </p>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-800">
                  A launch-ready front page with distinctive visual rhythm,
                  clear calls to action, and implementation detail the product
                  team can keep shipping on top of.
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
