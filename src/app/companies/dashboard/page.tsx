import Link from "next/link";
import { AppHeader } from "@/components/app-chrome";
import { events } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const companyNav = [
  { label: "Dashboard", href: "/companies/dashboard" },
  { label: "Events", href: "/companies/dashboard" },
  { label: "DevRel toolkit", href: "/companies/dashboard#devrel" },
  { label: "Plan", href: "/companies/dashboard#plan" },
];

export default function CompanyDashboard() {
  const ourEvents = events.slice(0, 4);
  return (
    <>
      <AppHeader links={companyNav} />
      <main className="bg-ink-50">
        <section className="border-b border-ink-200 bg-white">
          <div className="container-page py-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Company portal</p>
                <h1 className="h-display mt-1 text-3xl font-bold tracking-tight">Nebius — host dashboard</h1>
                <p className="mt-2 text-ink-600">Verified · Pro plan · Q3 2026 cycle</p>
              </div>
              <div className="flex gap-2">
                <Link href="/events/openmind-om1-build-night/manage" className="btn-navy">+ New event</Link>
                <button className="btn-outline">Invite teammate</button>
              </div>
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ["Events this month", "4 / 15"],
                ["Workspace minutes", "812 / 1,000"],
                ["Telemetry events", "184k"],
                ["Avg LLM-score", "7.6"],
              ].map(([l, v]) => (
                <div key={l} className="card">
                  <dt className="text-xs font-semibold uppercase tracking-widest text-ink-500">{l}</dt>
                  <dd className="mt-2 text-2xl font-bold text-navy-700">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="section">
          <div className="container-page">
            <h2 className="mb-6 h-display text-2xl font-bold">Your events</h2>
            <div className="overflow-hidden rounded-card border border-ink-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-xs font-semibold uppercase tracking-widest text-ink-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Event</th>
                    <th className="px-4 py-3 text-left">When</th>
                    <th className="px-4 py-3 text-left">City</th>
                    <th className="px-4 py-3 text-left">Registered</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200">
                  {ourEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-ink-50">
                      <td className="px-4 py-3 font-medium text-ink-900">{e.title}</td>
                      <td className="px-4 py-3 text-ink-700">{formatDate(e.startDateTime)}</td>
                      <td className="px-4 py-3 text-ink-700">{e.city}</td>
                      <td className="px-4 py-3 text-ink-700">{e.registered}/{e.capacity}</td>
                      <td className="px-4 py-3">
                        {e.state === "LIVE" ? <span className="pill-lime"><span className="live-dot" /> Live</span> :
                         e.state === "UPCOMING" ? <span className="pill-outline">Upcoming</span> :
                         <span className="pill-ink">Completed</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/events/${e.slug}/manage`} className="text-sm font-medium text-navy-700 hover:underline">Manage →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="devrel" className="section bg-white">
          <div className="container-page">
            <h2 className="h-display text-2xl font-bold">DevRel toolkit</h2>
            <p className="mt-2 max-w-2xl text-ink-600">Everything we surface so your DevRel team can act on what shipped at your event.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { t: "Builder lists", b: "Export builders by event, partner SDK called, or feedback they left." },
                { t: "Integration telemetry", b: "Per-project SDK calls, p50 latency, deploy events, model usage." },
                { t: "Follow-up templates", b: "LinkedIn shout-out drafts, recruiter notes, and post-event recaps." },
                { t: "Project library", b: "Browse, filter, and bookmark every project that called your SDK." },
                { t: "Feedback CSV", b: "Download AI-graded feedback by partner and event." },
                { t: "Sponsor branding", b: "Add your logo, challenge URL, and Discord channel to event pages." },
              ].map((f) => (
                <div key={f.t} className="card">
                  <h3 className="text-base font-semibold">{f.t}</h3>
                  <p className="mt-2 text-sm text-ink-600">{f.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="plan" className="section">
          <div className="container-page">
            <h2 className="h-display text-2xl font-bold">Plan &amp; usage</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="card lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-ink-500">Current plan</p>
                    <p className="mt-1 text-2xl font-bold">Pro · $2,000/mo</p>
                    <p className="text-sm text-ink-500">15 events / month · 1,000 IDE minutes</p>
                  </div>
                  <Link href="/pricing" className="btn-outline">Compare plans</Link>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-ink-500">Events used this cycle</p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100"><div className="h-2 bg-navy-700" style={{ width: "26%" }} /></div>
                    <p className="mt-1 text-xs text-ink-500">4 of 15</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">IDE workspace minutes</p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100"><div className="h-2 bg-lime" style={{ width: "81%" }} /></div>
                    <p className="mt-1 text-xs text-ink-500">812 of 1,000</p>
                  </div>
                </div>
              </div>
              <div className="card bg-navy-700 text-white">
                <p className="text-xs uppercase tracking-widest text-lime">Upgrade</p>
                <p className="mt-2 text-xl font-semibold">Hit 81% IDE usage?</p>
                <p className="mt-2 text-sm text-ink-100">Move to Scale for 2,000 minutes and unlock NemoClaw on Nebius GPU.</p>
                <Link href="/pricing" className="btn-lime mt-4 w-full">See Scale →</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
