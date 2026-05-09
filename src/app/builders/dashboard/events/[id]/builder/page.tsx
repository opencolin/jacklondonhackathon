import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-chrome";
import { eventBlasts, eventPrizes } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/utils";
import { safeAuth } from "@/server/lib/safe-auth";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";


const builderNav = [
  { label: "Console", href: "/builders/dashboard" },
  { label: "Schedule", href: "/events" },
  { label: "Teams", href: "/builders/teams" },
  { label: "Workshops", href: "/workshops" },
  { label: "Profile", href: "/builders/dashboard/profile" },
];

const tabs = ["Overview", "Project"] as const;

export default async function BuilderEventHub({ params }: { params: { id: string } }) {
  const session = await safeAuth();
  if (!session?.user) redirect("/builders/login");

  const trpc = await api();
  let event: Awaited<ReturnType<typeof trpc.events.byId>> | null = null;
  try {
    event = await trpc.events.byId({ id: params.id });
  } catch {
    // events.byId throws TRPCError NOT_FOUND when no event exists.
    // Convert to a clean 404 so the route doesn't bubble up as a
    // server-component render error.
    return notFound();
  }
  if (!event) return notFound();

  return (
    <>
      <AppHeader links={builderNav} />
      <main className="bg-ink-50 dark:bg-ink-800">
        <section className={`relative overflow-hidden border-b border-ink-200 bg-gradient-to-br ${event.cover}`}>
          <div className="container-page py-10 text-white drop-shadow-sm">
            <Link href="/builders/dashboard" className="text-sm hover:underline">← Console</Link>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {event.state === "LIVE" ? <span className="pill-navy"><span className="live-dot mr-1" /> Live now</span> : <span className="pill bg-white/90 text-navy-700">{event.state.toLowerCase()}</span>}
              <span className="pill bg-white/90 text-navy-700">{event.format.replace("_", " ").toLowerCase()}</span>
              <span className="pill bg-white/90 text-navy-700">{event.city}</span>
            </div>
            <h1 className="h-display mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">{event.title}</h1>
            <p className="mt-2 text-sm">{formatDate(event.startDateTime)} · {formatTime(event.startDateTime)} · {event.venue}</p>
          </div>
          <nav className="border-t border-navy-700/10 bg-white/85 backdrop-blur">
            <div className="container-page flex gap-1 overflow-x-auto py-2">
              {tabs.map((t, i) => (
                <a key={t} href={`#${t.toLowerCase()}`} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${i === 0 ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100"}`}>{t}</a>
              ))}
            </div>
          </nav>
        </section>

        <section id="overview" className="section">
          <div className="container-page grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="card">
                <h2 className="text-lg font-semibold">Resources</h2>
                <ul className="mt-3 grid gap-2 text-sm">
                  <li>📦 Token Factory key — auto-loaded into your IDE</li>
                  <li>🧰 Sponsor SDK templates — Stripe, Tavily, Qdrant, MotherDuck</li>
                  <li>📡 Discord — #{event.slug}</li>
                  <li>🏆 Judging rubric — speed of demo, soundness, partner integration</li>
                </ul>
              </div>
              <div className="card">
                <h2 className="text-lg font-semibold">Blasts</h2>
                <ol className="mt-3 divide-y divide-ink-200">
                  {eventBlasts.map((b) => (
                    <li key={b.id} className="py-3 text-sm">
                      <p className="text-xs uppercase tracking-widest text-ink-500">{formatTime(b.sentAt)}</p>
                      <p className="mt-1 text-ink-800">{b.body}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="card">
                <h2 className="text-lg font-semibold">Prizes</h2>
                <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                  {eventPrizes.map((p) => (
                    <li key={p.title} className="rounded-lg border border-ink-200 bg-ink-50 p-3">
                      <p className="text-xs uppercase tracking-widest text-ink-500">{p.title}</p>
                      <p className="mt-1 text-xl font-bold text-navy-700">{p.value}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="card bg-navy-700 text-white">
                <p className="text-xs uppercase tracking-widest text-lime">Open IDE</p>
                <p className="mt-2 text-sm">Your workspace is warm. Token Factory key scoped. Snapshot baseline pinned.</p>
                <Link href="/ide" className="btn-lime mt-4 w-full">Open workspace →</Link>
                <p className="mt-3 text-xs text-ink-100/80">Opens at code-server in a Contree sandbox.</p>
              </div>
              <div className="card">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-ink-500">Team</h3>
                <p className="mt-2 text-sm font-medium">Muglife</p>
                <p className="text-xs text-ink-500">2 members · 1 invite pending</p>
                <Link href="/builders/teams" className="mt-3 block text-sm font-medium text-navy-700 hover:underline">Manage team →</Link>
              </div>
              <div className="card">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-ink-500">Demo slot</h3>
                <p className="mt-2 text-sm">Slot 4 · 9:14 PM</p>
                <p className="text-xs text-ink-500">Pin a snapshot before you walk up to the base station.</p>
              </div>
            </aside>
          </div>
        </section>

        <section id="project" className="section bg-white dark:bg-ink-900">
          <div className="container-page">
            <h2 className="h-display text-2xl font-bold text-ink-900 dark:text-ink-50">How to submit your project</h2>
            <p className="mt-2 max-w-2xl text-ink-600 dark:text-ink-300">
              Until in-app submission opens, post your project publicly and tag the sponsors — that's the application.
            </p>
            <ol className="mt-8 grid gap-4 md:grid-cols-2">
              <li className="card">
                <p className="text-xs font-mono font-semibold text-navy-700 dark:text-lime">01</p>
                <h3 className="mt-2 text-lg font-semibold text-ink-900 dark:text-ink-50">Push your repo to GitHub</h3>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">Public preferred so AI judges can read it. Private is fine if you can grant access during finals.</p>
              </li>
              <li className="card">
                <p className="text-xs font-mono font-semibold text-navy-700 dark:text-lime">02</p>
                <h3 className="mt-2 text-lg font-semibold text-ink-900 dark:text-ink-50">Post a demo + repo link on X</h3>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">90 seconds is plenty. Tag <span className="font-mono font-medium">@ship_builders @nebiusai @composio @tavilyai @openclaw</span>.</p>
              </li>
              <li className="card">
                <p className="text-xs font-mono font-semibold text-navy-700 dark:text-lime">03</p>
                <h3 className="mt-2 text-lg font-semibold text-ink-900 dark:text-ink-50">Want a live read?</h3>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">Show up to office hours any weekday before May 28 and walk a sponsor engineer through it.</p>
              </li>
              <li className="card">
                <p className="text-xs font-mono font-semibold text-navy-700 dark:text-lime">04</p>
                <h3 className="mt-2 text-lg font-semibold text-ink-900 dark:text-ink-50">May 29</h3>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">Top 30 finalists named the night of the 29th. If you're in, the boat leaves South Beach at 9 AM May 30.</p>
              </li>
            </ol>
          </div>
        </section>
      </main>
    </>
  );
}
