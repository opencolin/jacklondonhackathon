import Link from "next/link";
import { TopNav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { EventCard } from "@/components/event-card";
import { events } from "@/lib/data";

const cities = ["All", "SF", "NYC", "LA", "London", "Berlin", "Remote"];
const formats = ["All", "Office hours", "Hackathon", "Hack day", "Hack night", "Meetup", "Mini conference", "Demo night"];

export default function EventsIndex() {
  const live = events.filter((e) => e.state === "LIVE");
  const upcoming = events.filter((e) => e.state === "UPCOMING");
  const past = events.filter((e) => e.state === "COMPLETED");

  return (
    <>
      <TopNav />
      <main>
        <section className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="container-page py-16">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Events</p>
            <h1 className="h-display text-4xl font-bold tracking-tight text-ink-900 md:text-5xl dark:text-ink-50">Find an event. Show up. Ship.</h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-600 dark:text-ink-300">Every event below has a Contree workspace ready, Token Factory keys loaded, and a base station for live demos.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="card flex w-full items-center gap-2 p-2 sm:w-auto">
                <span className="px-2 text-xs font-medium uppercase tracking-widest text-ink-500 dark:text-ink-400">City</span>
                {cities.map((c) => (
                  <button key={c} className={c === "All" ? "btn-navy text-xs" : "btn-ghost text-xs"}>{c}</button>
                ))}
              </div>
              <div className="card flex w-full items-center gap-2 p-2 sm:w-auto">
                <span className="px-2 text-xs font-medium uppercase tracking-widest text-ink-500 dark:text-ink-400">Format</span>
                {formats.map((f) => (
                  <button key={f} className={f === "All" ? "btn-navy text-xs" : "btn-ghost text-xs"}>{f}</button>
                ))}
              </div>
            </div>
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

        <section className="section bg-white dark:bg-ink-900">
          <div className="container-page">
            <h2 className="mb-8 h-display text-3xl font-bold text-ink-900 dark:text-ink-50">Upcoming</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{upcoming.map((e) => <EventCard key={e.id} event={e} />)}</div>
          </div>
        </section>

        <section className="section bg-ink-50">
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
