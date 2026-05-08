import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { EventList } from "@/components/event-list";
import { EventFilters } from "@/components/event-filters";
import { api } from "@/lib/trpc/server";
import type { Event } from "@/lib/data";

export const dynamic = "force-dynamic";

const cities = ["All", "SF", "NYC", "LA", "London", "Berlin", "Remote"] as const;
const formats = [
  "All",
  "Office hours",
  "Hackathon",
  "Meetup",
  "Mini conference",
] as const;

const finalsDaySchedule = [
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
        <section className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="container-page pt-16 pb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Schedule</p>
            <h1 className="h-display text-4xl font-bold tracking-tight text-ink-900 md:text-5xl dark:text-ink-50">Every session, in order.</h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-600 dark:text-ink-300">Office hours, ClawCamp, and the May 30 boat day — RSVP via Luma where it's linked, or just show up.</p>
            <EventFilters cities={cities} formats={formats} />
          </div>
        </section>

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
            <p className="mt-4 max-w-3xl text-base text-ink-600 dark:text-ink-300">The boat day is for the top 30 builders. Bay crossing, all-day 1:1 conversations and pitch refinement at Plank, final presentations before the sunset cruise, dinner at Farmhouse where winners are announced, after-party on the docked yacht. Times are firm — the boat doesn't wait.</p>
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
