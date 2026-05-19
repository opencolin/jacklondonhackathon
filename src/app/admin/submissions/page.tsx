import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { AppHeader } from "@/components/app-chrome";
import { db } from "@/server/db";
import { events, projects, teams, users } from "@/server/db/schema";
import { safeAuth } from "@/server/lib/safe-auth";

export const dynamic = "force-dynamic";

const adminNav = [
  { label: "Console", href: "/builders/dashboard" },
  { label: "Schedule", href: "/events" },
  { label: "Admin", href: "/admin/submissions" },
];

type SearchParams = { status?: string };

export default async function AdminSubmissions({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const session = await safeAuth();
  if (!session?.user) redirect("/builders/login");
  if (!session.user.isAdmin) {
    return (
      <>
        <AppHeader links={adminNav} />
        <main className="bg-ink-50 dark:bg-ink-800">
          <section className="container-page py-16">
            <h1 className="h-display text-3xl font-bold text-ink-900 dark:text-ink-50">
              Not authorized.
            </h1>
            <p className="mt-3 text-ink-600 dark:text-ink-300">
              This page is for BuilderShip admins. If that's you, add your email to{" "}
              <span className="font-mono">ADMIN_EMAILS</span> in Vercel env and sign back in.
            </p>
          </section>
        </main>
      </>
    );
  }

  const filter = searchParams?.status === "draft" ? "draft" : searchParams?.status === "all" ? "all" : "submitted";

  const rows = await db
    .select({
      projectId: projects.id,
      name: projects.name,
      summary: projects.summary,
      repoUrl: projects.repoUrl,
      demoUrl: projects.demoUrl,
      status: projects.status,
      updatedAt: projects.updatedAt,
      teamName: teams.name,
      leaderName: users.name,
      leaderEmail: users.email,
      eventTitle: events.title,
      eventSlug: events.slug,
    })
    .from(projects)
    .innerJoin(teams, eq(projects.teamId, teams.id))
    .innerJoin(users, eq(teams.leaderId, users.id))
    .innerJoin(events, eq(projects.eventId, events.id))
    .orderBy(desc(projects.updatedAt));

  const filtered =
    filter === "all"
      ? rows
      : rows.filter((r) => r.status === filter);

  const submittedCount = rows.filter((r) => r.status === "submitted").length;
  const draftCount = rows.filter((r) => r.status === "draft").length;
  const totalCount = rows.length;

  return (
    <>
      <AppHeader links={adminNav} />
      <main className="bg-ink-50 dark:bg-ink-800">
        <section className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="container-page py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Admin</p>
            <h1 className="h-display mt-1 text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
              Submissions
            </h1>
            <p className="mt-2 text-ink-600 dark:text-ink-300">
              {submittedCount} submitted · {draftCount} draft · {totalCount} total
            </p>
            <nav className="mt-6 flex flex-wrap gap-2">
              {[
                { key: "submitted", label: `Submitted (${submittedCount})` },
                { key: "draft", label: `Draft (${draftCount})` },
                { key: "all", label: `All (${totalCount})` },
              ].map((f) => (
                <Link
                  key={f.key}
                  href={f.key === "submitted" ? "/admin/submissions" : `/admin/submissions?status=${f.key}`}
                  className={f.key === filter ? "btn-navy text-xs" : "btn-outline text-xs"}
                  scroll={false}
                >
                  {f.label}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <section className="section">
          <div className="container-page">
            {filtered.length === 0 ? (
              <p className="text-sm text-ink-500 dark:text-ink-400">
                No projects with status <span className="font-mono">{filter}</span> yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-card border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
                {filtered.map((r, i) => (
                  <article
                    key={r.projectId}
                    className={`grid gap-3 p-6 sm:grid-cols-[1fr_220px] sm:items-start sm:gap-6 ${
                      i !== filtered.length - 1
                        ? "border-b border-ink-200 dark:border-ink-700"
                        : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-50">
                          {r.name}
                        </h2>
                        <span
                          className={
                            r.status === "submitted"
                              ? "pill-lime"
                              : "pill-outline"
                          }
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                        {r.leaderName ?? "—"} ({r.leaderEmail}) · team {r.teamName} · {r.eventTitle}
                      </p>
                      {r.summary ? (
                        <p className="mt-3 text-sm leading-relaxed text-ink-700 dark:text-ink-200 line-clamp-4">
                          {r.summary}
                        </p>
                      ) : (
                        <p className="mt-3 text-sm italic text-ink-500 dark:text-ink-400">
                          No description provided.
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs">
                        {r.repoUrl ? (
                          <Link
                            href={r.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-navy-700 underline-offset-2 hover:underline dark:text-lime"
                          >
                            repo ↗
                          </Link>
                        ) : (
                          <span className="font-mono text-ink-400 dark:text-ink-500">no repo</span>
                        )}
                        {r.demoUrl ? (
                          <Link
                            href={r.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-navy-700 underline-offset-2 hover:underline dark:text-lime"
                          >
                            demo ↗
                          </Link>
                        ) : (
                          <span className="font-mono text-ink-400 dark:text-ink-500">no demo</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-ink-500 dark:text-ink-400 sm:text-right">
                      <p className="font-mono">
                        {r.updatedAt
                          ? (r.updatedAt as Date).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
