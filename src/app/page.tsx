import Link from "next/link";
import type { Metadata } from "next";
import { TopNav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Section, SectionHeader } from "@/components/section";
import { RotatingHeroTitle } from "@/components/rotating-hero-title";

export const metadata: Metadata = {
  title: "BuilderShip — Three-week hackathon, finals on the bay",
  description:
    "BuilderShip: a three-week remote hackathon with daily office hours. Submit by May 28. Top 30 builders earn a boat day on the Dragon Lady, May 30 — bay crossing, all-day 1:1 pitches at Plank, final presentations, sunset cruise, dinner at Farmhouse, the winner takes home $10k in credits and a DGX Spark, after-party on the yacht. Hosted by Composio, Nebius, Tavily, and OpenClaw.",
};

const timeline = [
  {
    num: "01",
    date: "Now → May 28",
    title: "Build remotely",
    body: "Three weeks to ship. Daily office hours online and in person. Sponsor credits and APIs available from day one.",
  },
  {
    num: "02",
    date: "Anytime → May 28",
    title: "Submit on GitHub",
    body: "Push your repo. AI judges review every submission. Want a deeper read? Schedule a live demo with human judges any time before the 28th.",
  },
  {
    num: "03",
    date: "May 29",
    title: "Finalists announced",
    body: "Top 30 builders named the night before. Twenty-four hours to polish your pitch and pack a jacket for the bay.",
  },
  {
    num: "04",
    date: "May 30",
    title: "Boat day",
    body: "Bay crossing, polish at Plank, an open kayak race on the Oakland waterfront, sunset cruise, dinner at Farmhouse, demos, judging, after-party on the yacht.",
  },
] as const;

const judges = [
  {
    who: "AI judges",
    when: "Reading every submission, May 8 → May 28",
    body: "Score every GitHub repo on usefulness, integration depth across the sponsor stack, and how working the working demo actually is.",
  },
  {
    who: "Sponsor teams",
    when: "Office hours, then on the boat",
    body: "Nebius, Composio, Tavily, and OpenClaw engineers have been at office hours all month — by May 30 they know your codebase. They stress-test the integration and weigh in on the score.",
  },
  {
    who: "Angel investors",
    when: "On the boat, May 30",
    body: "Real checks, real conversations. 1:1 sessions with every builder at Plank — between bowling frames, in the lounge, on the patio. Their reaction lands in your final score.",
  },
  {
    who: "VCs",
    when: "On the boat, May 30",
    body: "Bay Area funds in the room. 1:1s rolling all day, plus you'll see them at the final presentations. The boat day doubles as a soft pitch tour — and their vote counts toward who wins.",
  },
] as const;

const officeHourRoles = [
  {
    who: "Developer advocates",
    body: "Full-stack help: getting the SDKs running, code review, debugging your agent loop end-to-end.",
  },
  {
    who: "Solution architects",
    body: "Architecture sanity-check: how to wire compute, agent tools, and search for what you're actually trying to build.",
  },
  {
    who: "Field engineers",
    body: "When something's broken at the edge. They live in the issue tracker so you don't have to.",
  },
] as const;

const sponsors = [
  {
    name: "Nebius",
    role: "Compute & Token Factory",
    blurb:
      "AI cloud built for builders. GPU instances, Token Factory inference, and Nebius Serverless deploys. Every team gets credits and Token Factory keys ready to go.",
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
  {
    name: "OpenClaw",
    role: "Open agent runtime",
    blurb:
      "Open-source agent framework for building, deploying, and operating agents on your terms. Local-first install, ships to Nebius Serverless in one command, plays nicely with Composio and Tavily out of the box.",
    site: "https://github.com/opencolin/openclaw-deploy",
    docs: "https://github.com/opencolin/openclaw-deploy#readme",
    accent: "lime",
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
    image: "/boat/rainbow-cruising.jpg",
    imageAlt: "Dragon Lady cruising on the bay with rainbow flag flying",
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
    image: "/venues/plank/hub-bar-bowling.jpg",
    imageAlt: "Plank's hub bar and bowling lanes with screens overhead",
  },
  {
    name: "Bicycle Coffee",
    role: "Coffee tickets · Jack London Square stroll",
    blurb:
      "Oakland-roasted coffee a short walk from Plank. Builders get redeemable tickets, an excuse to stretch, and a chance to actually see Jack London Square between rounds of hacking.",
    href: "https://www.bicyclecoffeeco.com/",
    cta: "bicyclecoffeeco.com",
    image: "/venues/bicycle/hero.jpg",
    imageAlt: "Bicycle Coffee branded coffee bag",
  },
  {
    name: "Farmhouse Kitchen Thai",
    role: "Dinner · presentations",
    blurb:
      "Award-winning Thai restaurant in Jack London Square. Where we sit down after the sunset cruise for a real dinner and project presentations on the screens — chef-driven food, family-style tables, room for fifty.",
    href: "https://farmhousethai.com/oakland",
    cta: "farmhousethai.com/oakland",
    image: "/venues/farmhouse/hero.jpg",
    imageAlt: "Farmhouse Kitchen Thai feast on banana leaves — lobster, fried chicken, blue rice",
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
    tag: "Open to everyone",
    title: "Kayak race",
    body: "Open-water sprint between Jack London Square and the Dragon Lady's mooring. Builders, judges, sponsors — anyone can paddle. Winning team takes a bonus prize.",
  },
  {
    tag: "Dragon Lady",
    title: "After-party on the yacht",
    body: "Boat stays docked. Top deck, hot tub running, sunset still in your eyes — and someone always brings a bottle.",
  },
] as const;

const sdkPerks = [
  "Nebius Token Factory keys for the full three weeks",
  "Nebius GPU credits for inference & deploy",
  "OpenClaw runtime ready to install",
  "Composio + Tavily API access for the day",
] as const;

const schedule = [
  { time: "9:00 AM", title: "Depart on Dragon Lady", where: "South Beach, SF" },
  { time: "10:00 AM", title: "Arrive in Oakland", where: "Jack London Square dock" },
  { time: "10:30 AM", title: "Coffee + first 1:1s with judges", where: "Bicycle Coffee" },
  { time: "11:00 AM", title: "Lunch + 1:1 conversations begin", where: "Plank" },
  { time: "1:00 PM", title: "1:1s · pitch refinement · bowling · arcade", where: "Plank" },
  { time: "3:00 PM", title: "Coffee break", where: "Bicycle Coffee" },
  { time: "3:30 PM", title: "Kayak race · open to everyone", where: "Jack London Square waterfront" },
  { time: "4:30 PM", title: "Final presentations", where: "Plank" },
  { time: "6:00 – 8:00 PM", title: "Sunset cruise · celebration", where: "Dragon Lady" },
  { time: "8:15 PM", title: "Dinner · winners announced", where: "Farmhouse Kitchen Thai" },
  { time: "9:30 PM", title: "Winner walks the plank", where: "Dragon Lady (back at the dock)" },
  { time: "Late", title: "After-party on the yacht", where: "Dragon Lady (docked)" },
] as const;

const faqs = [
  {
    q: "How do I apply?",
    a: "Post something you've built — agent, demo, repo, video, weird side project — publicly on X, LinkedIn, or wherever you live. Tag @openclaw and the sponsor stack so we see it. We're picking the best builders of the bay, and the post is the whole signal: no essay, no resume. Drop the link in our Discord too if you want a deeper read.",
  },
  {
    q: "What's the format?",
    a: "Solo or teams of up to 4. Three weeks to build remotely, with daily office hours from sponsor teams. Submit your GitHub repo any time before May 28 — AI judges read every entry, and you can schedule a live demo with human judges before the deadline if you want a deeper read.",
  },
  {
    q: "How does scoring work?",
    a: "Two phases. AI judges read every GitHub submission during the three weeks and pick the top 30 builders. On May 30, your score is a blend: AI judges, sponsor teams, plus the angel investors and VCs in the room. Everyone you talk to that day is voting.",
  },
  {
    q: "What happens on May 30?",
    a: "Finals day in Jack London Square — and there's no five-minute stage pitch. You spend the whole day in 1:1 conversations: angels and VCs over breakfast at Plank, sponsor judges over lunch and bowling, more 1:1s through the afternoon. A kayak race on the Oakland waterfront — open to anyone who shows up — runs before final presentations. Sunset cruise, dinner at Farmhouse, winners announced, the winner takes home $10k in credits and a DGX Spark. After-party back on the docked yacht.",
  },
  {
    q: "What does \"walking the plank\" mean?",
    a: "Exactly what it sounds like. The winner of the hackathon walks the plank off the Dragon Lady and jumps into the water. Towels and a hot tub on standby.",
  },
  {
    q: "What if I can't make it to the boat?",
    a: "Submissions are still welcome — you can build remotely and skip the boat day. If you make the top 30 and can't travel, we'll provide a land route to your final presentation. Boat capacity caps the in-person cohort.",
  },
  {
    q: "What should I bring on May 30?",
    a: "Laptop, charger, jacket for the cruise. We'll have power, Wi-Fi, and our own Starlink running on Plank's patio. No hardware projects this time.",
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
        <section className="relative -mt-16 overflow-hidden border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900 md:-mt-[72px]">
          <img
            src="/boat/bow-sunset-bridge.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-90 dark:opacity-80"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/55 to-white/0 dark:from-ink-900/95 dark:via-ink-900/55 dark:to-ink-900/0"
            aria-hidden
          />
          <div className="absolute -right-24 -top-24 h-[460px] w-[460px] rounded-full bg-lime/40 blur-3xl dark:bg-lime/20" aria-hidden />
          <div className="absolute -left-24 bottom-0 h-[320px] w-[320px] rounded-full bg-navy-700/10 blur-3xl dark:bg-lime/10" aria-hidden />
          <div className="container-page relative pt-20 pb-24 sm:pt-28 sm:pb-28 lg:pt-36">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill-lime">
                <span className="live-dot" /> Office hours running
              </span>
              <span className="pill-outline">Submit by May 28</span>
              <span className="pill-outline">Boat day May 30</span>
            </div>
            <RotatingHeroTitle className="mt-6" />
            <p className="mt-7 max-w-2xl text-xl text-ink-600 dark:text-ink-300">
              Best builders of the bay. 30 of you on the boat — building, bowling, beer, beluga caviar, sunset cruise.
              Winner takes home $10k in credits and a DGX Spark.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Hosted by</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/composio-wordmark.svg"
                alt="Composio"
                className="h-7 w-auto invert dark:invert-0"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/nebius-wordmark.svg"
                alt="Nebius"
                className="h-8 w-auto"
              />
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="#apply" className="btn-lime px-6 py-3.5 text-sm">
                Show us your claws →
              </Link>
              <Link href="#how-it-works" className="btn-outline px-6 py-3.5 text-sm">
                Schedule
              </Link>
              <Link href="#sponsors" className="btn-ghost text-sm">
                Sponsors & stack →
              </Link>
            </div>
            <dl className="mt-16 grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-y-0">
              {[
                ["Build", "3 weeks remote"],
                ["Submit by", "May 28"],
                ["Boat day", "May 30"],
                ["Finalists", "30 max"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">{label}</dt>
                  <dd className="mt-2 text-2xl font-bold text-navy-700 dark:text-lime">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Apply */}
        <Section id="apply">
          <SectionHeader
            eyebrow="Show us your claws"
            title={<>Post something cool you've built.<br />Tag us. That's your application.</>}
            body="No essay, no resume, no five-paragraph cover letter. Show us why we should take you by showing us something you've already shipped — an agent, a demo, a weird side project. We're picking the best builders of the bay. Local-ish preference but anyone can fly in."
          />
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="card flex flex-col gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-navy-700 dark:text-lime">How to apply</p>
                <ol className="mt-3 grid gap-3 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
                  <li><span className="font-mono font-semibold text-navy-700 dark:text-lime">01.</span> Post something you built — an agent, demo, repo, video, anything. Public post on X, LinkedIn, or wherever you live.</li>
                  <li><span className="font-mono font-semibold text-navy-700 dark:text-lime">02.</span> Tag <span className="font-semibold">@openclaw</span> and the sponsor stack so we see it. That's the whole signal.</li>
                  <li><span className="font-mono font-semibold text-navy-700 dark:text-lime">03.</span> If you want a deeper read, drop the link in our Discord too.</li>
                </ol>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href="https://x.com/intent/tweet?text=Show%20us%20your%20claws%20%40openclaw" className="btn-lime text-sm" target="_blank" rel="noreferrer">
                  Post on X →
                </Link>
                <Link href="https://www.linkedin.com/" className="btn-outline text-sm" target="_blank" rel="noreferrer">
                  Post on LinkedIn →
                </Link>
                <Link href="#" className="btn-ghost text-sm">
                  Drop in Discord →
                </Link>
              </div>
            </div>
            <div className="card bg-navy-700 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-lime">The bar</p>
              <p className="mt-3 text-base leading-relaxed text-ink-100">
                We pick 30 builders for the boat. Selection is on-going as posts come in — no deadline drama.
                If you make the cut, you're already the best of the bay. Plus-ones can meet you on the dock at sunset.
              </p>
              <ul className="mt-5 grid gap-2 text-sm text-ink-100">
                <li>· 30 builders. That's it.</li>
                <li>· Submissions read continuously through May 28.</li>
                <li>· Finalists announced May 29.</li>
                <li>· Boat leaves South Beach 9 AM May 30.</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Schedule */}
        <Section id="how-it-works" bg="tint">
          <SectionHeader
            eyebrow="Schedule"
            title={<>Three weeks. Thirty builders.<br />One day on the bay.</>}
            body="The hackathon is mostly remote. The boat day is the celebration — and the finals."
          />
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {timeline.map((s) => (
              <li key={s.num} className="card flex h-full flex-col">
                <span className="font-mono text-xs font-semibold text-navy-700 dark:text-lime">{s.num}</span>
                <span className="pill-lime mt-3 self-start">{s.date}</span>
                <h3 className="h-display mt-3 text-xl font-bold text-ink-900 dark:text-ink-50">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Office hours */}
        <Section id="office-hours">
          <SectionHeader
            eyebrow="Office hours"
            title="Stuck? We're online every day until May 30."
            body="Office hours run daily — online and in person — for the whole three weeks. Drop in, ask anything, ship faster. Sponsor teams cycle through across the day."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {officeHourRoles.map((p) => (
              <div key={p.who} className="card">
                <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-50">{p.who}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-card border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">Schedule</p>
              <p className="mt-1 text-base font-medium text-ink-900 dark:text-ink-50">
                Daily through May 30 — online plus in person across SF and Oakland.
              </p>
            </div>
            <Link href="/builders/login" className="btn-lime text-xs px-5 py-2.5">
              RSVP for office hours →
            </Link>
          </div>
        </Section>

        {/* Boat gallery */}
        <Section>
          <SectionHeader
            eyebrow="The boat"
            title="Meet the Dragon Lady."
            body="80 feet of motor yacht docked at the Jack London Square marina. Five staterooms, six heads, hot tub on the top deck, and a main salon big enough to host the cruise crowd. Built 1979 in Long Beach. Chartered through Jerry's Faeries."
          />
          <div className="overflow-hidden rounded-card border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
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
              <figure key={p.src} className="overflow-hidden rounded-card border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
                <img
                  src={p.src}
                  alt={p.alt}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="px-4 py-3 text-xs text-ink-600 dark:text-ink-300">{p.caption}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900 px-6 py-5">
            <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {[
                ["80 ft", "Length"],
                ["20 ft", "Beam"],
                ["5", "Staterooms"],
                ["1979", "Built · Long Beach"],
              ].map(([value, label]) => (
                <div key={label} className="flex items-baseline gap-2">
                  <dt className="font-bold text-navy-700 dark:text-lime">{value}</dt>
                  <dd className="text-ink-500 dark:text-ink-400">{label}</dd>
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
            title="Build something real."
            body="Each sponsor is an organizer — their teams are on the boat, in the room at Plank, and judging at the end. Bring an idea, leave with credits and a working agent."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">{s.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{s.blurb}</p>
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

        {/* Who's in the room */}
        <Section id="judges">
          <SectionHeader
            eyebrow="Who's scoring you"
            title="Not just a 5-minute pitch. Demo and connect one-on-one with conversations all day."
            body="The score on May 30 is a blend. AI judges read your code over the three weeks. Sponsor teams, angels, and VCs do 1:1s with every builder all day at Plank — your pitch sharpens with each conversation. Final presentations before the sunset cruise. Everyone's vote counts."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {judges.map((j) => (
              <div key={j.who} className="card flex h-full flex-col">
                <h3 className="h-display text-xl font-bold text-ink-900 dark:text-ink-50">{j.who}</h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">{j.when}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{j.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Finals day schedule */}
        <Section id="schedule">
          <SectionHeader
            eyebrow="Finals day · May 30"
            title="Cruise from South Beach to Jack London Square. Demos at dinner."
            body="The boat day is for the top 30 builders. Bay crossing, all-day 1:1 conversations and pitch refinement at Plank, final presentations before the sunset cruise, dinner at Farmhouse where winners are announced, after-party on the docked yacht. Times are firm — the boat doesn't wait."
          />
          <ol className="overflow-hidden rounded-card border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
            {schedule.map((row, i) => (
              <li
                key={`${row.time}-${row.title}`}
                className={`grid grid-cols-1 gap-1 px-6 py-5 sm:grid-cols-[180px_1fr_240px] sm:items-center sm:gap-6 ${
                  i !== schedule.length - 1 ? "border-b border-ink-200 dark:border-ink-700" : ""
                }`}
              >
                <span className="font-mono text-sm font-semibold text-navy-700 dark:text-lime">{row.time}</span>
                <span className="text-base font-medium text-ink-900 dark:text-ink-50">{row.title}</span>
                <span className="text-sm text-ink-500 dark:text-ink-400 sm:text-right">{row.where}</span>
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
              <div key={v.name} className="card flex h-full flex-col overflow-hidden p-0">
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

        {/* Perks */}
        <Section>
          <SectionHeader
            eyebrow="Finalist perks"
            title="Make finals, win the boat day."
            body="Only the top 30 — best of the best — earn the trip. Six experience perks on the house, plus the sponsor stack (that one's available to every builder from day one). Win the whole thing and you walk the plank."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {perks.map((p) => (
              <div key={p.title} className="card flex flex-col">
                <span className="pill-lime self-start">{p.tag}</span>
                <h3 className="h-display mt-4 text-2xl font-bold text-ink-900 dark:text-ink-50">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-card border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">And the sponsor stack</p>
            <ul className="grid gap-3 sm:grid-cols-3">
              {sdkPerks.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-ink-800 dark:text-ink-100">
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
        <Section id="faq" bg="tint">
          <SectionHeader eyebrow="Logistics" title="Things to know before you board." />
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q} className="card">
                <h3 className="text-base font-semibold text-ink-900 dark:text-ink-50">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Final CTA */}
        <Section bg="navy">
          <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-lime">Show us your claws</p>
              <h2 className="h-display text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl">
                Three weeks. Thirty finalists. One walk off the plank.
              </h2>
              <p className="mt-5 max-w-xl text-lg text-ink-100">
                Post something you built, tag <strong className="font-semibold text-white">@openclaw</strong> and the sponsors,
                and we'll see it. Submissions close <strong className="font-semibold text-white">May 28</strong>.
                Finalists announced <strong className="font-semibold text-white">May 29</strong>.
                Boat leaves South Beach at 9 AM <strong className="font-semibold text-white">May 30</strong>.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="#apply" className="btn-lime px-6 py-3.5 text-sm">
                Show us your claws →
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
