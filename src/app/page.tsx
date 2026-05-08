import Link from "next/link";
import type { Metadata } from "next";
import { TopNav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Section, SectionHeader } from "@/components/section";

export const metadata: Metadata = {
  title: "Hack Jack London Square — Nebius Builders Boat Hackathon",
  description:
    "A one-day boat hackathon across Jack London Square. Sponsored by Nebius, Composio, and Tavily. Cross the bay on the Dragon Lady, hack at Plank, dinner at Farmhouse, after-party back on the yacht.",
};

const sponsors = [
  {
    name: "Nebius",
    role: "Compute & Token Factory",
    blurb:
      "AI cloud built for builders. GPU instances, Token Factory inference, and Nebius Serverless deploys. Every team gets credits and a warm Contree workspace pre-loaded with keys.",
    site: "https://nebius.com",
    docs: "https://docs.nebius.com",
    accent: "navy",
  },
  {
    name: "Composio",
    role: "Agent tools & integrations",
    blurb:
      "One SDK to plug your agent into 250+ apps — Gmail, Slack, GitHub, Linear, Notion — with auth, function schemas, and tool-calling already wired. Bring your agent, ship the workflow.",
    site: "https://composio.dev",
    docs: "https://docs.composio.dev",
    accent: "lime",
  },
  {
    name: "Tavily",
    role: "Search & web extraction for agents",
    blurb:
      "Real-time search API tuned for LLMs. Clean, ranked, citable results plus structured web extraction — the retrieval layer for any agent that needs to know what just happened on the internet.",
    site: "https://www.tavily.com",
    docs: "https://docs.tavily.com",
    accent: "navy",
  },
] as const;

const venues = [
  {
    name: "Dragon Lady",
    role: "Bay crossing · sunset cruise · floating workshop",
    blurb:
      "80-foot motor yacht docked at the Jack London Square marina. Five staterooms, hot tub on the top deck, and a salon big enough to host the cruise crowd. Morning bay crossing from South Beach, sunset networking cruise, and hacking space when she's docked.",
    href: "https://jerrysfaeries.com/toi-toi-toi/",
    cta: "Boat listing",
  },
  {
    name: "Plank",
    role: "Hackathon HQ · lunch · arcade · bowling",
    blurb:
      "Two-floor restaurant and event space steps from the marina. Indoor tables, a covered heated patio, arcade rooms, and a bowling alley — all yours for the day. Outside cable run for our own Starlink confirmed.",
    href: "https://www.plankoakland.com/",
    cta: "plankoakland.com",
    secondary: {
      label: "2025 event guide (PDF)",
      href: "https://www.plankoakland.com/wp-content/uploads/2025/11/Plank-Event-Guide-2025-interactive.pdf",
    },
  },
  {
    name: "Bicycle Coffee",
    role: "Coffee tickets · Jack London Square stroll",
    blurb:
      "Oakland-roasted coffee a short walk from Plank. Builders get redeemable tickets, an excuse to stretch, and a chance to actually see Jack London Square between rounds of hacking.",
    href: "https://www.bicyclecoffeeco.com/",
    cta: "bicyclecoffeeco.com",
  },
  {
    name: "Farmhouse Kitchen Thai",
    role: "Dinner · presentations",
    blurb:
      "Award-winning Thai restaurant in Jack London Square. Where we sit down after the sunset cruise for a real dinner and project presentations on the screens — chef-driven food, family-style tables, room for fifty.",
    href: "https://farmhousethai.com/oakland",
    cta: "farmhousethai.com/oakland",
  },
] as const;

const perks = [
  {
    tag: "On the water",
    title: "Sunset cruise",
    body: "Two hours on the bay aboard the 80-foot Dragon Lady. The calmest networking time you will ever have.",
  },
  {
    tag: "Plank",
    title: "Free bowling",
    body: "Plank's lanes are part of the takeover. Strikes between commits, frame counters by the pizza.",
  },
  {
    tag: "Plank",
    title: "Arcade games",
    body: "Fifteen dollars in arcade credits per builder. Skee-ball-driven development, officially endorsed.",
  },
  {
    tag: "All day",
    title: "Amazing food",
    body: "Lunch at Plank, dinner at Farmhouse Kitchen Thai. Real meals, no pizza fatigue.",
  },
  {
    tag: "Bicycle Coffee",
    title: "Coffee on tap",
    body: "Tickets you can redeem any time you need to walk and think. Oakland-roasted, ten minutes from the dock.",
  },
  {
    tag: "Dragon Lady",
    title: "After-party on the yacht",
    body: "Boat stays docked. Top deck, hot tub running, sunset still in your eyes — and someone always brings a bottle.",
  },
] as const;

const sdkPerks = [
  "Contree workspace + Token Factory keys",
  "Nebius GPU credits for inference & deploy",
  "Composio + Tavily API access for the day",
] as const;

const schedule = [
  { time: "9:00 AM", title: "Depart on Dragon Lady", where: "South Beach, SF" },
  { time: "10:00 AM", title: "Arrive in Oakland", where: "Jack London Square dock" },
  { time: "10:30 AM", title: "Coffee tickets redeem", where: "Bicycle Coffee" },
  { time: "11:00 AM", title: "Lunch · hackathon kickoff", where: "Plank" },
  { time: "3:00 PM", title: "Coffee break", where: "Bicycle Coffee" },
  { time: "6:00 – 8:00 PM", title: "Sunset networking cruise", where: "Dragon Lady" },
  { time: "8:15 PM", title: "Dinner · demos · judging", where: "Farmhouse Kitchen Thai" },
  { time: "Late", title: "After-party on the yacht", where: "Dragon Lady (docked)" },
] as const;

const faqs = [
  {
    q: "How big is the event?",
    a: "Capped at 50 builders — that's the Dragon Lady's max. If you'd rather skip the boat and meet us at Plank, that's fine; we just need a confirmed headcount on the manifest.",
  },
  {
    q: "What should I bring?",
    a: "Laptop, charger, jacket for the cruise. We'll have power, Wi-Fi, and our own Starlink running on Plank's patio. No hardware projects this time.",
  },
  {
    q: "What's the format?",
    a: "Solo or teams of up to 4. Build something on the day using one or more of the sponsor SDKs (Nebius Token Factory, Composio, Tavily). Demos are 3 minutes after the sunset cruise.",
  },
  {
    q: "Drinks?",
    a: "Self-pay at Plank and Farmhouse. BYOB on the boat (cheaper that way). After-party drinks back on the docked Dragon Lady — sponsors picking up that tab.",
  },
] as const;

export default function HackJackLondonSquarePage() {
  return (
    <>
      <TopNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-ink-200 bg-white">
          <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
          <div className="absolute -right-24 -top-24 h-[460px] w-[460px] rounded-full bg-lime/40 blur-3xl" aria-hidden />
          <div className="absolute -left-24 bottom-0 h-[320px] w-[320px] rounded-full bg-navy-700/10 blur-3xl" aria-hidden />
          <div className="container-page relative pt-20 pb-24 sm:pt-28 sm:pb-28 lg:pt-36">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill-lime">
                <span className="live-dot" /> Applications open
              </span>
              <span className="pill-outline">Boat hackathon · Oakland</span>
              <span className="pill-outline">50 builders · 1 day</span>
            </div>
            <h1 className="h-display mt-6 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight text-ink-900 sm:text-6xl lg:text-7xl">
              Hack{" "}
              <span className="relative inline-block">
                <span className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-lime/80" aria-hidden />
                <span className="relative">Jack London Square</span>
              </span>
              .
            </h1>
            <p className="mt-7 max-w-2xl text-xl text-ink-600">
              Cross the bay on an 80-foot yacht. Build all day at Plank. Ship something with Nebius,
              Composio, and Tavily. Sunset networking cruise, dinner at Farmhouse Kitchen Thai, demos,
              and an after-party back on the docked yacht with the hot tub running.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/builders/login" className="btn-lime px-6 py-3.5 text-sm">
                Apply to build →
              </Link>
              <Link href="#schedule" className="btn-outline px-6 py-3.5 text-sm">
                See the day
              </Link>
              <Link href="#sponsors" className="btn-ghost text-sm">
                Sponsors & SDKs →
              </Link>
            </div>
            <dl className="mt-16 grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-y-0">
              {[
                ["Where", "Jack London Sq, Oakland"],
                ["Capacity", "50 builders"],
                ["Format", "Solo or teams ≤ 4"],
                ["Cost", "Free for builders"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-ink-500">{label}</dt>
                  <dd className="mt-2 text-2xl font-bold text-navy-700">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Boat gallery */}
        <Section>
          <SectionHeader
            eyebrow="The boat"
            title="Meet the Dragon Lady."
            body="80 feet of motor yacht docked at the Jack London Square marina. Five staterooms, six heads, hot tub on the top deck, and a main salon big enough to host the cruise crowd. Built 1979 in Long Beach. Chartered through Jerry's Faeries."
          />
          <div className="overflow-hidden rounded-card border border-ink-200 bg-white">
            {/* Hero photo */}
            <img
              src="/boat/bow-sunset-bridge.jpg"
              alt="Three builders on the bow of the Dragon Lady at sunset under the Bay Bridge, San Francisco skyline behind"
              className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[560px]"
              loading="eager"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              {
                src: "/boat/rainbow-cruising.jpg",
                alt: "Dragon Lady cruising with rainbow flag flying",
                caption: "Pride flag flying off the mast",
              },
              {
                src: "/boat/bay-profile.jpg",
                alt: "Dragon Lady out on the bay between sailboats",
                caption: "Out on the bay",
              },
              {
                src: "/boat/night-lights.jpg",
                alt: "Dragon Lady docked at night with colorful underwater and deck lights",
                caption: "After-party glow",
              },
              {
                src: "/boat/aerial-docked.jpg",
                alt: "Top-down aerial of Dragon Lady at the dock",
                caption: "Aerial — 80ft on her berth",
              },
              {
                src: "/boat/galley-interior.jpg",
                alt: "Main salon and galley with wood paneling and bar stools",
                caption: "Main salon and galley",
              },
              {
                src: "/boat/marina-sunset.jpg",
                alt: "Sunset over the marina, masts silhouetted against orange sky",
                caption: "Marina sunset, demo time",
              },
            ].map((p) => (
              <figure key={p.src} className="overflow-hidden rounded-card border border-ink-200 bg-white">
                <img
                  src={p.src}
                  alt={p.alt}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="px-4 py-3 text-xs text-ink-600">{p.caption}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-ink-200 bg-white px-6 py-5">
            <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {[
                ["80 ft", "Length"],
                ["20 ft", "Beam"],
                ["5", "Staterooms"],
                ["1979", "Built · Long Beach"],
              ].map(([value, label]) => (
                <div key={label} className="flex items-baseline gap-2">
                  <dt className="font-bold text-navy-700">{value}</dt>
                  <dd className="text-ink-500">{label}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="https://jerrysfaeries.com/toi-toi-toi/"
              className="btn-outline text-xs"
              target="_blank"
              rel="noreferrer"
            >
              More on Jerry's Faeries ↗
            </Link>
          </div>
        </Section>

        {/* Sponsors */}
        <Section id="sponsors" bg="tint">
          <SectionHeader
            eyebrow="Sponsors & organizers"
            title="Three SDKs. One day. Build something real."
            body="Each sponsor is an organizer — their teams are on the boat, in the room at Plank, and judging at the end. Bring an idea, leave with credits and a working agent."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {sponsors.map((s) => (
              <div key={s.name} className="card flex flex-col">
                <div
                  className={`mb-5 flex h-24 items-center justify-center rounded-card ${
                    s.accent === "lime" ? "bg-lime" : "bg-navy-700"
                  }`}
                >
                  <span
                    className={`h-display text-3xl font-bold tracking-tight ${
                      s.accent === "lime" ? "text-navy-700" : "text-white"
                    }`}
                  >
                    {s.name}
                  </span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-500">{s.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">{s.blurb}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  <Link href={s.site} className="btn-outline text-xs" target="_blank" rel="noreferrer">
                    Website ↗
                  </Link>
                  <Link href={s.docs} className="btn-navy text-xs" target="_blank" rel="noreferrer">
                    Read the docs →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Schedule */}
        <Section id="schedule">
          <SectionHeader
            eyebrow="The day"
            title="One ride across the bay, eight hours of building, one sunset."
            body="Hack on the boat, hack at Plank, demo on the water. Times are firm; the boat doesn't wait."
          />
          <ol className="overflow-hidden rounded-card border border-ink-200 bg-white">
            {schedule.map((row, i) => (
              <li
                key={`${row.time}-${row.title}`}
                className={`grid grid-cols-1 gap-1 px-6 py-5 sm:grid-cols-[180px_1fr_240px] sm:items-center sm:gap-6 ${
                  i !== schedule.length - 1 ? "border-b border-ink-200" : ""
                }`}
              >
                <span className="font-mono text-sm font-semibold text-navy-700">{row.time}</span>
                <span className="text-base font-medium text-ink-900">{row.title}</span>
                <span className="text-sm text-ink-500 sm:text-right">{row.where}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* Venues */}
        <Section bg="tint">
          <SectionHeader
            eyebrow="Venue partners"
            title="Only Jack London Square businesses. The whole day in one neighborhood."
            body="The wedge of this hackathon is the place. Every venue is walking distance from the dock — and every one of them is on the program."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {venues.map((v) => (
              <div key={v.name} className="card flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="h-display text-2xl font-bold text-ink-900">{v.name}</h3>
                  <span className="pill-ink whitespace-nowrap">{v.role.split("·")[0].trim()}</span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-ink-500">{v.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">{v.blurb}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  <Link href={v.href} className="btn-outline text-xs" target="_blank" rel="noreferrer">
                    {v.cta} ↗
                  </Link>
                  {"secondary" in v && v.secondary ? (
                    <Link
                      href={v.secondary.href}
                      className="btn-ghost text-xs"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {v.secondary.label} ↗
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Perks */}
        <Section>
          <SectionHeader
            eyebrow="Awesome perks"
            title="Free for builders. Sponsors picked up the tab."
            body="Apply, get accepted, show up at South Beach with a laptop. Six perks on the house, plus the SDKs."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {perks.map((p) => (
              <div key={p.title} className="card flex flex-col">
                <span className="pill-lime self-start">{p.tag}</span>
                <h3 className="h-display mt-4 text-2xl font-bold text-ink-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-card border border-ink-200 bg-white p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-500">And the SDKs</p>
            <ul className="grid gap-3 sm:grid-cols-3">
              {sdkPerks.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-ink-800">
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-lime text-navy-700">
                    <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
                      <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* FAQ */}
        <Section bg="tint">
          <SectionHeader eyebrow="Logistics" title="Things to know before you board." />
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q} className="card">
                <h3 className="text-base font-semibold text-ink-900">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Final CTA */}
        <Section bg="navy">
          <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-lime">Apply now</p>
              <h2 className="h-display text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl">
                50 seats. One yacht. Bring something to ship.
              </h2>
              <p className="mt-5 max-w-xl text-lg text-ink-100">
                Applications close two weeks before the event or when the manifest fills, whichever
                comes first. Sponsors review every submission.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/builders/login" className="btn-lime px-6 py-3.5 text-sm">
                Apply to build →
              </Link>
              <Link
                href="mailto:events@agenthack.ai"
                className="btn bg-white text-navy-700 hover:bg-ink-100 px-6 py-3.5 text-sm"
              >
                Sponsor inquiry →
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
