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

const tabs = ["Overview", "Team", "Project", "IDE", "Feedback", "Volunteer"] as const;

export default async function BuilderEventHub({ params }: { params: { id: string } }) {
  const session = await safeAuth();
  if (!session?.user) redirect("/builders/login");

  const trpc = await api();
  const event = await trpc.events.byId({ id: params.id });
  if (!event) return notFound();

  return (
    <>
      <AppHeader links={builderNav} />
      <main className="bg-ink-50">
        <section className={`relative overflow-hidden border-b border-ink-200 bg-gradient-to-br ${event.cover}`}>
          <div className="container-page py-10 text-navy-700">
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

        <section id="project" className="section bg-white">
          <div className="container-page">
            <h2 className="h-display text-2xl font-bold">Project submission</h2>
            <p className="mt-2 max-w-2xl text-ink-600">Fill once, edit until the deadline. The video step records inside the browser and uploads to the platform automatically.</p>
            <form className="mt-8 grid gap-5 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <label className="label" htmlFor="pname">Project name</label>
                <input id="pname" className="input" defaultValue="Muglife" />
              </div>
              <div className="lg:col-span-2">
                <label className="label" htmlFor="pdesc">Description</label>
                <textarea id="pdesc" rows={4} className="input" defaultValue="A Nebius-powered coffee-shop concierge agent that books, reorders, and routes loyalty perks across chains." />
                <p className="mt-1 text-xs text-ink-500">Clear descriptions make it much easier for organizers and judges to review your work.</p>
              </div>
              <div>
                <label className="label" htmlFor="techs">Technologies</label>
                <input id="techs" className="input" defaultValue="Token Factory, Contree, Tavily, Stripe" />
              </div>
              <div>
                <label className="label" htmlFor="other">Other technologies</label>
                <input id="other" className="input" placeholder="Anything we missed" />
              </div>
              <div>
                <label className="label" htmlFor="github">GitHub repository URL</label>
                <input id="github" className="input" placeholder="https://github.com/team/repo" />
              </div>
              <div>
                <label className="label" htmlFor="members">Team members</label>
                <input id="members" disabled className="input bg-ink-50" defaultValue="Colin Lowenberg, Priya Iyer" />
              </div>
              <div className="lg:col-span-2 flex items-start gap-3 rounded-lg border border-ink-200 bg-ink-50 p-4 text-sm">
                <input type="checkbox" id="contact" defaultChecked className="mt-0.5 h-4 w-4 accent-navy-700" />
                <label htmlFor="contact" className="text-ink-700">Allow partner companies to contact us beyond judging.</label>
              </div>
              <div className="lg:col-span-2 flex justify-between gap-2">
                <button type="button" className="btn-outline">Save draft</button>
                <button type="button" className="btn-lime">Save project</button>
              </div>
            </form>

            <div className="mt-12 card">
              <h3 className="text-lg font-semibold">Demo video</h3>
              <p className="text-sm text-ink-500">Required for judging. Records in-browser using your screen, camera, and mic.</p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50 p-5 text-center">
                  <p className="text-sm font-medium">1. Pick a screen</p>
                  <p className="mt-1 text-xs text-ink-500">Full screen recommended</p>
                </div>
                <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50 p-5 text-center">
                  <p className="text-sm font-medium">2. Camera + mic on</p>
                  <p className="mt-1 text-xs text-ink-500">We need to see and hear you</p>
                </div>
                <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50 p-5 text-center">
                  <p className="text-sm font-medium">3. Hit record</p>
                  <p className="mt-1 text-xs text-ink-500">90s minimum, 4 min max</p>
                </div>
              </div>
              <button className="btn-navy mt-6">Start recording</button>
            </div>
          </div>
        </section>

        <section id="feedback" className="section">
          <div className="container-page">
            <h2 className="h-display text-2xl font-bold">Feedback to partners</h2>
            <p className="mt-2 max-w-2xl text-ink-600">Bonus: thoughtful feedback enters you in the raffle. AI-grading filters low-effort responses.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {event.partners.map((p: string) => (
                <div key={p} className="card">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{p}</p>
                    <span className="pill-outline">not submitted</span>
                  </div>
                  <textarea rows={4} className="input mt-3" placeholder={`Tell ${p} what worked, what hurt, and what you'd want next quarter.`} />
                  <div className="mt-3 flex justify-end gap-2">
                    <button className="btn-outline text-xs">Save draft</button>
                    <button className="btn-lime text-xs">Submit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
