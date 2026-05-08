import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { EventCard } from "@/components/event-card";
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Events</p>
            <h1 className="h-display text-4xl font-bold tracking-tight text-ink-900 md:text-5xl dark:text-ink-50">Find an event. Show up. Ship.</h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-600 dark:text-ink-300">Every event below has a Contree workspace ready, Token Factory keys loaded, and a base station for live demos.</p>
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{live.map((e) => <EventCard key={e.id} event={e} />)}</div>
            </div>
          </section>
        ) : null}

        <section className="bg-white pb-20 pt-10 dark:bg-ink-900 sm:pb-24 lg:pb-28">
          <div className="container-page">
            <h2 className="mb-8 h-display text-3xl font-bold text-ink-900 dark:text-ink-50">Upcoming events</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{upcoming.map((e) => <EventCard key={e.id} event={e} />)}</div>
          </div>
        </section>

        <section className="section bg-ink-50 dark:bg-ink-800">
          <div className="container-page">
            <h2 className="mb-8 h-display text-3xl font-bold text-ink-900 dark:text-ink-50">Past events</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{past.map((e) => <EventCard key={e.id} event={e} />)}</div>
            <p className="mt-10 text-sm text-ink-500 dark:text-ink-400">
              Hosting an event? <Link className="underline-offset-4 hover:underline text-navy-700 font-medium dark:text-lime" href="/companies/login">Apply to host →</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
