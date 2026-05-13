import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { AppHeader } from "@/components/app-chrome";
import { WorkshopCard } from "@/components/workshop-card";
import { workshops } from "@/lib/data";
import { safeAuth } from "@/server/lib/safe-auth";
import { db } from "@/server/db";
import { events, projects, teams } from "@/server/db/schema";

export const dynamic = "force-dynamic";


const builderNav = [
  { label: "Console", href: "/builders/dashboard" },
  { label: "Schedule", href: "/events" },
  { label: "Workshops", href: "/workshops" },
  { label: "Profile", href: "/builders/dashboard/profile" },
];

const SUBMISSION_DEADLINE = new Date("2026-05-28T23:59:59-07:00");
const FINALS_DAY = new Date("2026-05-30T09:00:00-07:00");

function daysUntil(target: Date): number {
  const ms = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default async function BuilderDashboard() {
  const session = await safeAuth();
  if (!session?.user) redirect("/builders/login");

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  // Resolve the BuilderShip event + the user's current project (if any).
  let buildershipId: string | null = null;
  let projectStatus: "none" | "draft" | "submitted" = "none";
  let projectName: string | null = null;
  let projectUpdatedAt: Date | null = null;
  try {
    const [event] = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, "buildership"))
      .limit(1);
    if (event) {
      buildershipId = event.id;
      const [team] = await db
        .select({ id: teams.id })
        .from(teams)
        .where(
          and(eq(teams.eventId, event.id), eq(teams.leaderId, session.user.id)),
        )
        .limit(1);
      if (team) {
        const [project] = await db
          .select({
            name: projects.name,
            status: projects.status,
            updatedAt: projects.updatedAt,
          })
          .from(projects)
          .where(
            and(eq(projects.teamId, team.id), eq(projects.eventId, event.id)),
          )
          .limit(1);
        if (project) {
          projectName = project.name;
          projectUpdatedAt = project.updatedAt as Date;
          projectStatus =
            project.status === "submitted" ? "submitted" : "draft";
        }
      }
    }
  } catch (err) {
    console.warn("[dashboard] project lookup failed", err);
  }

  const daysToDeadline = daysUntil(SUBMISSION_DEADLINE);
  const daysToFinals = daysUntil(FINALS_DAY);
  const projectHref = buildershipId
    ? `/builders/dashboard/events/${buildershipId}/builder#project`
    : "/events";

  return (
    <>
      <AppHeader links={builderNav} />
      <main className="bg-ink-50 dark:bg-ink-800">
        {/* Hero */}
        <section className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="container-page py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Builder console</p>
            <h1 className="h-display mt-1 text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-2 text-ink-600 dark:text-ink-300">
              {daysToDeadline > 0
                ? `${daysToDeadline} day${daysToDeadline === 1 ? "" : "s"} until submissions close.`
                : daysToFinals > 0
                ? "Submissions are closed. Finalists announced May 29."
                : "BuilderShip is in progress on the bay."}
            </p>
          </div>
        </section>

        {/* Submission status — the headline */}
        <section className="section">
          <div className="container-page grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className={`card ${projectStatus === "submitted" ? "border-2 border-lime/60 dark:border-lime/40" : ""}`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">Your BuilderShip submission</p>
              {projectStatus === "submitted" ? (
                <>
                  <h2 className="h-display mt-2 text-2xl font-bold text-ink-900 dark:text-ink-50">
                    {projectName ?? "Your project"} is in.
                  </h2>
                  <p className="mt-2 text-ink-600 dark:text-ink-300">
                    Submitted. Judges can see it now. You can keep editing until May 28 at midnight.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={projectHref} className="btn-navy">Edit submission →</Link>
                    <Link href="/#rubric" className="btn-outline">See the rubric</Link>
                  </div>
                </>
              ) : projectStatus === "draft" ? (
                <>
                  <h2 className="h-display mt-2 text-2xl font-bold text-ink-900 dark:text-ink-50">
                    {projectName ?? "Your project"} — draft saved.
                  </h2>
                  <p className="mt-2 text-ink-600 dark:text-ink-300">
                    Drafts aren't visible to judges yet. Submit when you're ready for the AI judges to start scoring.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={projectHref} className="btn-lime">Finish + submit →</Link>
                    <Link href="/#rubric" className="btn-outline">See the rubric</Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="h-display mt-2 text-2xl font-bold text-ink-900 dark:text-ink-50">
                    Start your submission.
                  </h2>
                  <p className="mt-2 text-ink-600 dark:text-ink-300">
                    Save a draft now, edit until the deadline, hit submit when you're ready for judges. Top 30 builders earn the boat day on May 30.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={projectHref} className="btn-lime">Open project form →</Link>
                    <Link href="/#rubric" className="btn-outline">Read the rubric first</Link>
                  </div>
                </>
              )}
              {projectUpdatedAt ? (
                <p className="mt-6 font-mono text-xs text-ink-500 dark:text-ink-400">
                  Last edit: {projectUpdatedAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4">
              <div className="card">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">Submit by</p>
                <p className="h-display mt-2 text-2xl font-bold text-navy-700 dark:text-lime">
                  May 28 · 11:59 PM PT
                </p>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                  AI judges read every repo continuously. Earlier submissions get more passes.
                </p>
              </div>
              <div className="card">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">Boat day</p>
                <p className="h-display mt-2 text-2xl font-bold text-navy-700 dark:text-lime">
                  May 30
                </p>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                  Top 30 finalists named May 29. Boat leaves South Beach at 9 AM May 30.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Build help — Discord, office hours, workshops */}
        <section className="section bg-white dark:bg-ink-900">
          <div className="container-page">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="h-display text-2xl font-bold text-ink-900 dark:text-ink-50">Stuck? Ask a sponsor.</h2>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                  Sponsor engineers live in Discord. Faster than office hours, fine for any-hour blockers.
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/events" className="btn-ghost text-sm">Office hours →</Link>
                <Link href="/workshops" className="btn-ghost text-sm">All workshops →</Link>
              </div>
            </div>
            <div className="mb-10 grid gap-4 md:grid-cols-2">
              <Link
                href="https://discord.com/invite/zBzz6X4QW"
                target="_blank"
                rel="noreferrer"
                className="card flex items-center justify-between gap-4 transition-colors hover:border-navy-700 dark:hover:border-lime"
              >
                <div>
                  <p className="text-xs font-mono font-semibold uppercase tracking-widest text-navy-700 dark:text-lime">Nebius Discord</p>
                  <p className="mt-1 text-base font-semibold text-ink-900 dark:text-ink-50">Token Factory + AI Cloud help</p>
                  <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">GPU instances, inference, Serverless deploy. Nebius DevRel reads channels live.</p>
                </div>
                <span className="font-mono text-sm text-navy-700 dark:text-lime">Join →</span>
              </Link>
              <Link
                href="https://discord.com/invite/cNruWaAhQk"
                target="_blank"
                rel="noreferrer"
                className="card flex items-center justify-between gap-4 transition-colors hover:border-navy-700 dark:hover:border-lime"
              >
                <div>
                  <p className="text-xs font-mono font-semibold uppercase tracking-widest text-navy-700 dark:text-lime">Composio Discord</p>
                  <p className="mt-1 text-base font-semibold text-ink-900 dark:text-ink-50">Tools, auth, integrations</p>
                  <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">Help with the 250+ tool catalog, auth flows, and tool schemas. Composio engineers active.</p>
                </div>
                <span className="font-mono text-sm text-navy-700 dark:text-lime">Join →</span>
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {workshops.slice(0, 3).map((w) => <WorkshopCard key={w.slug} workshop={w} />)}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
