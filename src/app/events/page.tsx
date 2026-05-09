import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { Section, SectionHeader } from "@/components/section";
import { EventList } from "@/components/event-list";
import { api } from "@/lib/trpc/server";
import type { Event } from "@/lib/data";

export const dynamic = "force-dynamic";

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
    body: "Bay crossing, polish on the waterfront, an open kayak race on the Oakland waterfront, sunset cruise, dinner at a Jack London Square restaurant, demos, judging, after-party on the yacht.",
  },
] as const;

const finalsDaySchedule = [
  { time: "9:00 AM", title: "Depart by yacht", where: "South Beach, SF" },
  { time: "10:00 AM", title: "Arrive in Oakland", where: "Jack London Square dock" },
  { time: "10:30 AM", title: "Coffee + first 1:1s with judges", where: "Jack London Square" },
  { time: "11:00 AM", title: "Lunch + 1:1 conversations begin", where: "Hackathon HQ" },
  { time: "1:00 PM", title: "1:1s · pitch refinement · bowling · arcade", where: "Hackathon HQ" },
  { time: "3:00 PM", title: "Coffee break", where: "Jack London Square" },
  { time: "3:30 PM", title: "Kayak race · open to everyone", where: "Jack London Square waterfront" },
  { time: "4:30 PM", title: "Final presentations", where: "Hackathon HQ" },
  { time: "6:00 – 8:00 PM", title: "Sunset cruise · celebration", where: "On the bay" },
  { time: "8:15 PM", title: "Dinner · winners announced", where: "Waterfront restaurant" },
  { time: "9:30 PM", title: "Winner walks the plank", where: "Back at the dock" },
  { time: "Late", title: "After-party on the yacht", where: "Docked yacht" },
] as const;

function items<T>(result: { items: T[] } | T[]): T[] {
  return Array.isArray(result) ? result : result.items;
}

export default async function EventsIndex() {
  const trpc = await api();
  const [liveRes, upcomingRes, pastRes] = await Promise.all([
    trpc.events.list({ state: "live", limit: 50 }),
    trpc.events.list({ state: "published", limit: 50 }),
    trpc.events.list({ state: "completed", limit: 50 }),
  ]);
  const live = items<Event>(liveRes);
  const upcoming = items<Event>(upcomingRes);
  const past = items<Event>(pastRes);

  return (
    <>
      <SiteHeader />
      <main>
        <Section bg="tint">
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

        {live.length ? (
          <section className="section bg-ink-50 dark:bg-ink-800">
            <div className="container-page">
              <div className="mb-8 flex items-end justify-between">
                <h2 className="h-display text-3xl font-bold text-ink-900 dark:text-ink-50">Live now</h2>
                <span className="pill-lime"><span className="live-dot" /> {live.length} live</span>
              </div>
              <EventList events={live} />
            </div>
          </section>
        ) : null}

        <section className="bg-white pb-20 pt-10 dark:bg-ink-900 sm:pb-24 lg:pb-28">
          <div className="container-page">
            <h2 className="mb-8 h-display text-3xl font-bold text-ink-900 dark:text-ink-50">Upcoming sessions</h2>
            <EventList events={upcoming} emptyLabel="No upcoming sessions." />
          </div>
        </section>

        <section className="border-t border-ink-200 bg-ink-50 pt-16 pb-20 dark:border-ink-800 dark:bg-ink-800 sm:pb-24 lg:pb-28">
          <div className="container-page">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700 dark:text-lime">Finals day · May 30</p>
            <h2 className="h-display text-3xl font-bold tracking-tight text-ink-900 md:text-4xl dark:text-ink-50">Cruise from South Beach to Jack London Square. Demos at dinner.</h2>
            <p className="mt-4 max-w-3xl text-base text-ink-600 dark:text-ink-300">The boat day is for the top 30 builders. Bay crossing, all-day 1:1 conversations and pitch refinement on the waterfront, final presentations before the sunset cruise, dinner at a Jack London Square restaurant where winners are announced, after-party on the docked yacht. Times are firm — the boat doesn't wait.</p>
            <ol className="mt-10 overflow-hidden rounded-card border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
              {finalsDaySchedule.map((row, i) => (
                <li
                  key={`${row.time}-${row.title}`}
                  className={`grid grid-cols-1 gap-1 px-6 py-5 sm:grid-cols-[180px_1fr_240px] sm:items-center sm:gap-6 ${
                    i !== finalsDaySchedule.length - 1 ? "border-b border-ink-200 dark:border-ink-700" : ""
                  }`}
                >
                  <span className="font-mono text-sm font-semibold text-navy-700 dark:text-lime">{row.time}</span>
                  <span className="text-base font-medium text-ink-900 dark:text-ink-50">{row.title}</span>
                  <span className="text-sm text-ink-500 dark:text-ink-400 sm:text-right">{row.where}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {past.length ? (
          <section className="section bg-ink-50 dark:bg-ink-800">
            <div className="container-page">
              <h2 className="mb-8 h-display text-3xl font-bold text-ink-900 dark:text-ink-50">Past sessions</h2>
              <EventList events={past} />
              <p className="mt-10 text-sm text-ink-500 dark:text-ink-400">
                Hosting an event? <Link className="underline-offset-4 hover:underline text-navy-700 font-medium dark:text-lime" href="/companies/login">Apply to host →</Link>
              </p>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
