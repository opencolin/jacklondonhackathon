import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-chrome";
import { MarkLoggedIn } from "@/components/mark-logged-in";
import { teamsAsLeader } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { safeAuth } from "@/server/lib/safe-auth";

export const dynamic = "force-dynamic";


const builderNav = [
  { label: "Console", href: "/builders/dashboard" },
  { label: "Schedule", href: "/events" },
  { label: "Teams", href: "/builders/teams" },
  { label: "Workshops", href: "/workshops" },
  { label: "Profile", href: "/builders/dashboard/profile" },
];

export default async function TeamsPage() {
  const session = await safeAuth();
  if (!session?.user) redirect("/builders/login");

  return (
    <>
      <MarkLoggedIn />
      <AppHeader links={builderNav} />
      <main className="bg-ink-50 dark:bg-ink-800">
        <section className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="container-page py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Teams</p>
            <h1 className="h-display mt-1 text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">Build with the right people.</h1>
            <p className="mt-2 max-w-2xl text-ink-600 dark:text-ink-300">Form one team per event you build at. Invite teammates by email or Discord handle. The team's project page auto-creates when you save your first draft.</p>
          </div>
        </section>

        <section className="section">
          <div className="container-page space-y-10">

            <div>
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-xl font-bold tracking-tight text-ink-900 dark:text-ink-50">Teams you lead</h2>
              </div>
              {teamsAsLeader.length === 0 ? (
                <div className="card text-sm text-ink-500 dark:text-ink-400">No teams yet. Pick an event and start one.</div>
              ) : (
                <div className="grid gap-4">
                  {teamsAsLeader.map((t) => (
                    <div key={t.id} className="card">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400">{t.event.title} · {formatDate(t.event.startDateTime)}</p>
                          <h3 className="mt-1 text-lg font-semibold">{t.name}</h3>
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {t.members.map((m) => (
                              <li key={m.name} className="pill-ink"><span className="font-medium">{m.name}</span> · {m.role}</li>
                            ))}
                            {t.invitations.map((i) => (
                              <li key={i.email} className="pill-outline">{i.email} · pending</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-shrink-0 gap-2">
                          <Link href={`/builders/dashboard/events/${t.event.id}/builder`} className="btn-navy text-xs">Open team →</Link>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-lg border border-ink-200 bg-ink-50 p-3 text-sm dark:border-ink-700 dark:bg-ink-800">
                        <span><span className="font-medium">{t.project.name}</span> · status: {t.project.status.toLowerCase()} · video: {t.project.hasVideo ? "ready" : "not yet recorded"}</span>
                        <Link href={`/builders/dashboard/events/${t.event.id}/builder#project`} className="text-xs font-medium text-navy-700 hover:underline dark:text-lime">Edit project →</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card bg-navy-700 text-white">
              <h3 className="text-lg font-semibold">Looking for teammates?</h3>
              <p className="mt-2 text-sm text-ink-100">Post what you're building and what you need on X — tag <span className="font-mono font-medium text-lime">@ship_builders @nebiusai @composio @tavilyai @openclaw</span>. Other builders find you there.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
