import Link from "next/link";
import type { Metadata } from "next";
import { TopNav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Section, SectionHeader } from "@/components/section";

export const metadata: Metadata = {
  title: "Co-host BuilderShip — sponsor pitch",
  description: "Co-host BuilderShip with Composio and Nebius. 40 hand-picked builders, three weeks of daily integration time, one boat day. Internal preview.",
  robots: { index: false, follow: false, nocache: true },
};

const differentiators = [
  {
    eyebrow: "Curated, not mass-market",
    title: "40 builders. Hand-picked.",
    body: "Public application is 'show us your claws' — post something you've built, tag the sponsors, we read everything. We hand-pick 40 finalists from the best builders in the Bay. No spray-and-pray crowd, no resume noise.",
  },
  {
    eyebrow: "Time you can't buy",
    title: "Three weeks of office hours.",
    body: "Your engineers run daily office hours from May 8 → 28. Builders integrate your SDK with real support, not a docs URL. By boat day your team knows every codebase by name — and so does the rest of the room.",
  },
  {
    eyebrow: "Real conversations",
    title: "All-day 1:1s, not 5-minute booth pitches.",
    body: "On May 30 your team spends the whole day in 1:1 conversations with every finalist — over breakfast at Plank, between bowling frames, on the bay. The pitch sharpens with each conversation. Your judges weigh in on the score.",
  },
  {
    eyebrow: "PR that actually lands",
    title: "A boat day is unforgettable.",
    body: "Demos at sunset on an 80-foot yacht. The winner walks the plank into Oakland's harbor. Photographer, videographer, post-production. The recap content has legs your blog post never will.",
  },
];

const audience = [
  { stat: "40", label: "Hand-picked finalists" },
  { stat: "3 weeks", label: "Of daily integration time" },
  { stat: "100+", label: "Expected applicants" },
  { stat: "$10k", label: "Grand prize + DGX Spark" },
];

const benefits = [
  "Logo on every page of the marketing site, every email, every demo recap",
  "Engineering team running office hours — multiple slots per week, your call",
  "Custom sponsor track prize — your problem space, your rubric, your check",
  "Sponsor judges weigh in on the final score (your vote counts equally)",
  "Boat seats for your team + plus-ones (subject to manifest cap)",
  "1:1 introductions to every finalist on May 30 — pre-vetted talent funnel",
  "Co-branding on the floor takeover at Plank (Hackathon HQ all day)",
  "Post-event recap with attribution: which builders called your SDK, what they shipped",
  "Right to publish demo videos and project recaps under your channels",
];

const tiers = [
  {
    name: "Title host",
    price: "$50k",
    available: "1 slot left",
    pitch: "Anchor partner. Logo first in every stack. 4 boat seats, judge seat, custom prize, demo slot at the sunset presentations.",
    highlights: [
      "Top-of-stack billing — site, email, signage, recap",
      "4 boat seats + 4 plus-ones at Farmhouse",
      "Custom $5k+ sponsor track prize",
      "Live demo slot during sunset presentations",
      "Engineering team at office hours every week",
    ],
    accent: "navy",
  },
  {
    name: "Co-host",
    price: "$25k",
    available: "Open",
    pitch: "Equal billing with the other co-hosts. 2 boat seats, judge seat, sponsor track prize, full integration support week.",
    highlights: [
      "Logo in the host stack across all surfaces",
      "2 boat seats + 2 plus-ones at Farmhouse",
      "Custom $2.5k sponsor track prize",
      "One dedicated office-hours week",
      "Sponsor judge seat",
    ],
    accent: "lime",
  },
  {
    name: "Friend of the boat",
    price: "$10k",
    available: "Open",
    pitch: "Logo + credits + office-hours support. Builders get your stack out of the box, you get talent intros without the boat seat.",
    highlights: [
      "Logo in the supporting tier",
      "Credits or API access bundled into the SDK perks",
      "Two office-hours sessions during the build period",
      "Talent intros with consenting finalists post-event",
    ],
    accent: "navy",
  },
];

const venues = [
  {
    name: "Dragon Lady",
    role: "Bay crossing · sunset cruise · floating workshop",
    blurb:
      "80-foot motor yacht docked at the Jack London Square marina. Five staterooms, hot tub on the top deck, salon for the cruise crowd. Morning bay crossing from South Beach, sunset networking cruise, and demo space when she's docked.",
    href: "https://jerrysfaeries.com/toi-toi-toi/",
    cta: "Boat listing",
    image: "/boat/rainbow-cruising.jpg",
    imageAlt: "Dragon Lady cruising on the bay with rainbow flag flying",
  },
  {
    name: "Plank",
    role: "Hackathon HQ · lunch · arcade · bowling",
    blurb:
      "Two-floor restaurant and event space steps from the marina. Indoor tables, covered heated patio, arcade rooms, and a bowling alley — all yours for the day. Outside cable run for our own Starlink confirmed.",
    href: "https://www.plankoakland.com/",
    cta: "plankoakland.com",
    secondary: {
      label: "2025 event guide (PDF)",
      href: "https://www.plankoakland.com/wp-content/uploads/2025/11/Plank-Event-Guide-2025-interactive.pdf",
    },
    image: "/venues/plank/hub-bar-bowling.jpg",
    imageAlt: "Plank's hub bar and bowling lanes with screens overhead",
  },
  {
    name: "Bicycle Coffee",
    role: "Coffee tickets · Jack London Square stroll",
    blurb:
      "Oakland-roasted coffee a short walk from Plank. Builders get redeemable tickets, an excuse to stretch, and a reason to actually see Jack London Square between rounds of hacking.",
    href: "https://www.bicyclecoffeeco.com/",
    cta: "bicyclecoffeeco.com",
    image: "/venues/bicycle/hero.jpg",
    imageAlt: "Bicycle Coffee branded coffee bag",
  },
  {
    name: "Farmhouse Kitchen Thai",
    role: "Dinner · presentations · winner reveal",
    blurb:
      "Award-winning Thai restaurant in Jack London Square. Where we sit down after the sunset cruise for dinner, project presentations on the screens, and the winner reveal — chef-driven food, family-style tables, room for fifty.",
    href: "https://farmhousethai.com/oakland",
    cta: "farmhousethai.com/oakland",
    image: "/venues/farmhouse/hero.jpg",
    imageAlt: "Farmhouse Kitchen Thai feast on banana leaves",
  },
] as const;

const timeline = [
  { date: "Now → May 28", title: "Build period", body: "Daily office hours. Your team is in the room." },
  { date: "May 28 → 29", title: "Judging", body: "AI judges read every repo. Top 40 finalists named the night of the 29th." },
  { date: "May 30", title: "Boat day", body: "Bay crossing, all-day 1:1s at Plank, sunset demos, dinner at Farmhouse, winner walks the plank, after-party on the docked yacht." },
];

export default function SponsorsOnlyPage() {
  return (
    <>
      <TopNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="absolute -right-24 -top-24 h-[460px] w-[460px] rounded-full bg-lime/40 blur-3xl dark:bg-lime/20" aria-hidden />
          <div className="absolute -left-24 bottom-0 h-[320px] w-[320px] rounded-full bg-navy-700/10 blur-3xl dark:bg-lime/10" aria-hidden />
          <div className="container-page relative pt-20 pb-20 sm:pt-28 sm:pb-24 lg:pt-32">
            <span className="pill-lime">Co-host invitation · internal</span>
            <h1 className="h-display mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-ink-900 md:text-6xl dark:text-ink-50">
              Get in front of the best builders<br />of the Bay.
            </h1>
            <p className="mt-7 max-w-2xl text-xl text-ink-600 dark:text-ink-300">
              40 hand-picked finalists. Three weeks of daily integration time with your engineers. One day on a yacht in
              Oakland's harbor. Co-host BuilderShip with Composio and Nebius — May 8 → 30, 2026.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="#tiers" className="btn-lime px-6 py-3.5 text-sm">
                See tiers →
              </Link>
              <Link href="mailto:hello@ship.builders?subject=BuilderShip co-host" className="btn-outline px-6 py-3.5 text-sm">
                Email the team
              </Link>
            </div>
            <dl className="mt-16 grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-y-0">
              {audience.map(({ stat, label }) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">{label}</dt>
                  <dd className="mt-2 text-2xl font-bold text-navy-700 dark:text-lime">{stat}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* The pitch */}
        <Section bg="tint">
          <SectionHeader
            eyebrow="Why this is different"
            title="A logo on a swag bag is not what you're buying."
            body="Most hackathon sponsorships are a 24-hour hallway with badge scans. BuilderShip is three weeks of real integration time, then a curated day with the best of the best."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {differentiators.map((d) => (
              <div key={d.title} className="card flex h-full flex-col">
                <p className="text-xs font-semibold uppercase tracking-widest text-navy-700 dark:text-lime">{d.eyebrow}</p>
                <h3 className="h-display mt-3 text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50">{d.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{d.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* What you get */}
        <Section>
          <SectionHeader
            eyebrow="What's in it for you"
            title="Concrete benefits, not vague exposure."
            body="Every co-host gets these by default. Anchor sponsors get more depth on each line."
          />
          <ul className="grid gap-3 md:grid-cols-2">
            {benefits.map((line) => (
              <li key={line} className="flex items-start gap-3 rounded-card border border-ink-200 bg-white p-4 text-sm text-ink-800 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100">
                <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-lime text-navy-700">
                  <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
                    <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Tiers */}
        <Section id="tiers" bg="tint">
          <SectionHeader
            eyebrow="Tiers"
            title="Pick how loud you want to be."
            body="Numbers below are starting points — happy to shape a custom package around your team's actual goals."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`card flex h-full flex-col ${t.accent === "navy" ? "bg-navy-700 text-white" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-semibold uppercase tracking-widest ${t.accent === "navy" ? "text-lime" : "text-navy-700 dark:text-lime"}`}>{t.name}</p>
                  <span className={`pill ${t.accent === "navy" ? "bg-white/15 text-white" : "pill-outline"}`}>{t.available}</span>
                </div>
                <p className="h-display mt-3 text-4xl font-bold tracking-tight">{t.price}</p>
                <p className={`mt-3 text-sm leading-relaxed ${t.accent === "navy" ? "text-ink-100" : "text-ink-700 dark:text-ink-200"}`}>{t.pitch}</p>
                <ul className="mt-5 grid gap-2 text-sm">
                  {t.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <span className={`mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full ${t.accent === "navy" ? "bg-lime" : "bg-navy-700 dark:bg-lime"}`} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Link
                    href={`mailto:hello@ship.builders?subject=BuilderShip ${t.name}`}
                    className={t.accent === "navy" ? "btn-lime w-full text-sm" : "btn-navy w-full text-sm"}
                  >
                    Lock in {t.name.toLowerCase()} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Already in */}
        <Section>
          <SectionHeader
            eyebrow="Already on the boat"
            title="You'd be in good company."
            body="Composio and Nebius are co-hosting. Tavily and OpenClaw are running office hours. We're holding one anchor slot for the right partner."
          />
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 rounded-card border border-ink-200 bg-white px-8 py-10 dark:border-ink-700 dark:bg-ink-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/composio-wordmark.svg" alt="Composio" className="h-8 w-auto invert dark:invert-0" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/nebius-wordmark.svg" alt="Nebius" className="h-9 w-auto" />
            <span className="h-display text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50">Tavily</span>
            <span className="h-display text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50">OpenClaw</span>
          </div>
        </Section>

        {/* Timeline */}
        <Section bg="tint">
          <SectionHeader
            eyebrow="The arc"
            title="Three weeks. Forty builders. One day on the bay."
          />
          <ol className="grid gap-4 md:grid-cols-3">
            {timeline.map((s, i) => (
              <li key={s.title} className="card flex h-full flex-col">
                <span className="font-mono text-xs font-semibold text-navy-700 dark:text-lime">0{i + 1}</span>
                <span className="pill-lime mt-3 self-start">{s.date}</span>
                <h3 className="h-display mt-3 text-xl font-bold text-ink-900 dark:text-ink-50">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Venues — proof of execution */}
        <Section>
          <SectionHeader
            eyebrow="Venue partners"
            title="Local Jack London Square businesses. The best spots right on the waterfront."
            body="The wedge of this hackathon is the place. Every venue is walking distance from the dock — and every one of them is locked in on the program."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {venues.map((v) => (
              <div key={v.name} className="card flex h-full flex-col overflow-hidden p-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.image}
                  alt={v.imageAlt}
                  className="aspect-[16/9] w-full object-cover"
                  loading="lazy"
                />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="h-display text-2xl font-bold text-ink-900 dark:text-ink-50">{v.name}</h3>
                    <span className="pill-ink whitespace-nowrap">{v.role.split("·")[0].trim()}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">{v.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{v.blurb}</p>
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
              </div>
            ))}
          </div>
        </Section>

        {/* Final CTA */}
        <Section bg="navy">
          <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-lime">Lock it in</p>
              <h2 className="h-display text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl">
                Office hours start May 8. The boat leaves May 30.
              </h2>
              <p className="mt-5 max-w-xl text-lg text-ink-100">
                We're closing co-host slots once the marketing site goes live to applicants. If you want top-of-stack
                billing, the call is now. Custom packages are on the table — tell us what your team is actually trying
                to learn.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="mailto:hello@ship.builders?subject=BuilderShip co-host"
                className="btn-lime px-6 py-3.5 text-sm"
              >
                Email hello@ship.builders →
              </Link>
              <Link
                href="https://cal.com/colinlowenberg/buildership"
                className="btn bg-white text-navy-700 hover:bg-ink-100 px-6 py-3.5 text-sm"
              >
                Book a 15-min call
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
