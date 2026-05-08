import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { eventPrizes, eventSpeakers } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/utils";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";


export default async function EventDetail({ params }: { params: { slug: string } }) {
  const trpc = await api();
  const event = await trpc.events.bySlug({ slug: params.slug });
  if (!event) return notFound();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div
            aria-hidden
            className={`absolute inset-0 bg-gradient-to-br ${event.cover} dark:opacity-30`}
          />
          <div className="container-page relative py-20 text-navy-700 dark:text-ink-50">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill bg-white/90 text-navy-700">{event.format.replace("_", " ").toLowerCase()}</span>
              {event.state === "LIVE" ? <span className="pill-navy"><span className="live-dot mr-1" /> Live now</span> : null}
              {event.state === "UPCOMING" ? <span className="pill bg-white/90 text-navy-700">Upcoming</span> : null}
              {event.state === "COMPLETED" ? <span className="pill bg-white/90 text-navy-700">Completed</span> : null}
            </div>
            <h1 className="h-display mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">{event.title}</h1>
            <p className="mt-5 max-w-2xl text-lg">{event.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {event.rsvpUrl ? (
                <a href={event.rsvpUrl} target="_blank" rel="noopener noreferrer" className="btn-navy">RSVP on Luma →</a>
              ) : (
                <Link href="/builders/login" className="btn-navy">Register →</Link>
              )}
              <Link href={`/builders/dashboard/events/${event.id}/builder`} className="btn-outline">View builder hub</Link>
              <Link href={`/events/${event.slug}#share`} className="btn-ghost">Share event link</Link>
            </div>
          </div>
        </section>

        <section className="section bg-white dark:bg-ink-900">
          <div className="container-page grid gap-10 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <div className="card">
                <h2 className="text-lg font-semibold">When &amp; where</h2>
                <dl className="mt-4 grid grid-cols-2 gap-y-4 text-sm">
                  <dt className="text-ink-500 dark:text-ink-400">Date</dt><dd className="text-ink-900 dark:text-ink-50">{formatDate(event.startDateTime)}</dd>
                  <dt className="text-ink-500 dark:text-ink-400">Start</dt><dd className="text-ink-900 dark:text-ink-50">{formatTime(event.startDateTime)}</dd>
                  {event.endDateTime ? (<><dt className="text-ink-500 dark:text-ink-400">Ends</dt><dd className="text-ink-900 dark:text-ink-50">{formatDate(event.endDateTime)} · {formatTime(event.endDateTime)}</dd></>) : null}
                  <dt className="text-ink-500 dark:text-ink-400">Format</dt><dd className="text-ink-900 dark:text-ink-50">{event.format.replace("_", " ").toLowerCase()}</dd>
                  <dt className="text-ink-500 dark:text-ink-400">Venue</dt><dd className="text-ink-900 dark:text-ink-50">{event.venue}</dd>
                  <dt className="text-ink-500 dark:text-ink-400">Capacity</dt><dd className="text-ink-900 dark:text-ink-50">{event.registered} / {event.capacity}</dd>
                </dl>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold">Schedule</h2>
                <ol className="mt-4 space-y-3 text-sm">
                  {[
                    ["Doors + check-in", "T+0:00"],
                    ["Sponsor lightning intros", "T+0:30"],
                    ["Workspace warm-up — Token Factory keys", "T+1:00"],
                    ["Build session", "T+1:30"],
                    ["Dinner break", "T+4:00"],
                    ["Demos on the base station", "T+6:00"],
                    ["Judging + prizes", "T+7:00"],
                  ].map(([label, t]) => (
                    <li key={label} className="flex items-start gap-3">
                      <span className="kbd mt-0.5">{t}</span>
                      <span className="text-ink-700 dark:text-ink-200">{label}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold">Prizes</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                  {eventPrizes.map((p) => (
                    <li key={p.title} className="rounded-lg border border-ink-200 bg-ink-50 p-4 dark:border-ink-700 dark:bg-ink-800">
                      <p className="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400">{p.title}</p>
                      <p className="mt-2 text-2xl font-bold text-navy-700 dark:text-lime">{p.value}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold">Speakers</h2>
                <ul className="mt-4 divide-y divide-ink-200 dark:divide-ink-700">
                  {eventSpeakers.map((s) => (
                    <li key={s.name} className="flex items-center justify-between py-3 text-sm">
                      <div>
                        <p className="font-medium text-ink-900 dark:text-ink-50">{s.name}</p>
                        <p className="text-ink-500 dark:text-ink-400">{s.company} · {s.talk}</p>
                      </div>
                      <span className={s.status === "APPROVED" ? "pill-lime" : "pill-outline"}>{s.status.toLowerCase()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="card">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">Partners</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {event.partners.map((p: string) => (
                    <li key={p} className="pill-outline">{p}</li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">What you'll get</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-700 dark:text-ink-200">
                  <li>✓ Pre-loaded Contree workspace</li>
                  <li>✓ Token Factory key (scoped)</li>
                  <li>✓ Sponsor SDK templates</li>
                  <li>✓ Demo capture by the base station</li>
                  <li>✓ Auto-recap with your project</li>
                </ul>
              </div>
              <div className="card bg-navy-700 text-white">
                <p className="text-sm font-semibold">Bring nothing.</p>
                <p className="mt-2 text-sm text-ink-100">Your laptop and an opinion. We'll preload the rest.</p>
                {event.rsvpUrl ? (
                  <a href={event.rsvpUrl} target="_blank" rel="noopener noreferrer" className="btn-lime mt-4 w-full">RSVP on Luma →</a>
                ) : (
                  <Link href="/builders/login" className="btn-lime mt-4 w-full">Register →</Link>
                )}
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
