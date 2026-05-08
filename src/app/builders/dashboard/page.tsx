import Link from "next/link";
import { AppHeader } from "@/components/app-chrome";
import { EventCard } from "@/components/event-card";
import { WorkshopCard } from "@/components/workshop-card";
import { MarkLoggedIn } from "@/components/mark-logged-in";
import { events, workshops, currentUser, liveStats } from "@/lib/data";

const builderNav = [
  { label: "Console", href: "/builders/dashboard" },
  { label: "Events", href: "/events" },
  { label: "Teams", href: "/builders/teams" },
  { label: "Workshops", href: "/workshops" },
  { label: "Profile", href: "/builders/dashboard/profile" },
];

export default function BuilderDashboard() {
  const upcoming = events.filter((e) => e.state !== "COMPLETED");
  const past = events.filter((e) => e.state === "COMPLETED");
  return (
    <>
      <MarkLoggedIn />
      <AppHeader links={builderNav} />
      <main className="bg-ink-50 dark:bg-ink-800">
        <section className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="container-page py-10">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Builder console</p>
                <h1 className="h-display mt-1 text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">Welcome back, {currentUser.name.split(" ")[0]}.</h1>
                <p className="mt-2 text-ink-600 dark:text-ink-300">{liveStats.eventsLive} events live · 3 sponsors hiring this week</p>
              </div>
              <div className="flex gap-2">
                <Link href="/ide" className="btn-navy">Open IDE →</Link>
                <Link href="/builders/teams" className="btn-outline">Teams</Link>
              </div>
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ["Total demos", "12"],
                ["Projects shipped", "8"],
                ["Workshop minutes", "184"],
                ["Rank", "#312"],
              ].map(([l, v]) => (
                <div key={l} className="card">
                  <dt className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">{l}</dt>
                  <dd className="mt-2 text-2xl font-bold text-navy-700 dark:text-lime">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="section">
          <div className="container-page">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="h-display text-2xl font-bold text-ink-900 dark:text-ink-50">Upcoming events</h2>
              <Link href="/events" className="btn-ghost text-sm">All events →</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => <EventCard key={e.id} event={e} href={`/builders/dashboard/events/${e.id}/builder`} />)}
            </div>
          </div>
        </section>

        <section className="section bg-white dark:bg-ink-900">
          <div className="container-page">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="h-display text-2xl font-bold text-ink-900 dark:text-ink-50">Watch next</h2>
              <Link href="/workshops" className="btn-ghost text-sm">All workshops →</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {workshops.map((w) => <WorkshopCard key={w.slug} workshop={w} />)}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-page">
            <h2 className="mb-6 h-display text-2xl font-bold text-ink-900 dark:text-ink-50">Past events</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => <EventCard key={e.id} event={e} href={`/builders/dashboard/events/${e.id}/builder`} />)}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
