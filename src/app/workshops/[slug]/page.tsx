import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { workshops } from "@/lib/data";
import { formatDate, formatDuration } from "@/lib/utils";

export function generateStaticParams() {
  return workshops.map((w) => ({ slug: w.slug }));
}

function secsToTimestamp(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function WorkshopDetail({ params }: { params: { slug: string } }) {
  const w = workshops.find((x) => x.slug === params.slug);
  if (!w) return notFound();

  return (
    <>
      <SiteHeader />
      <main className="bg-white dark:bg-ink-900">
        <section className="container-page pt-12 pb-6">
          <Link href="/workshops" className="text-sm text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200">← All workshops</Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Workshop · {formatDate(w.recordedAt)} · {formatDuration(w.durationSeconds)}</p>
          <h1 className="h-display mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink-900 md:text-5xl dark:text-ink-50">{w.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-600 dark:text-ink-300">
            {w.hosts.map((h) => (
              <span key={h.name} className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-lime text-xs font-semibold text-navy-700">{h.name[0]}</span>
                <span><strong className="text-ink-900 dark:text-ink-50">{h.name}</strong> · {h.role}, {h.company}</span>
              </span>
            ))}
          </div>
        </section>

        <section className="container-page grid gap-8 pb-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="aspect-video overflow-hidden rounded-card border border-ink-200 bg-navy-700 dark:border-ink-700">
              <a href={w.videoUrl} target="_blank" rel="noreferrer" className="group flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-700 via-navy-600 to-lime/40">
                <div className="flex flex-col items-center gap-3 text-white">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-navy-700 shadow-soft transition group-hover:scale-105">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <p className="text-sm">{w.videoProvider === "ZOOM" ? "Watch on Zoom" : "Play"}</p>
                  <p className="text-xs text-ink-100/80">{formatDuration(w.durationSeconds)} · {w.watchCount.toLocaleString()} watches</p>
                </div>
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={w.ctaUrl} className="btn-lime">{w.ctaLabel}</Link>
              <Link href="/ide" className="btn-outline">Open a workspace from this lesson</Link>
              <a href={w.videoUrl} target="_blank" rel="noreferrer" className="btn-ghost">Open video in new tab ↗</a>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-bold tracking-tight text-ink-900 dark:text-ink-50">About this workshop</h2>
              <p className="mt-3 whitespace-pre-line text-ink-700 dark:text-ink-200">{w.description}</p>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-bold tracking-tight text-ink-900 dark:text-ink-50">Recommended reading</h2>
              <ul className="mt-3 grid gap-2 text-sm text-ink-700 dark:text-ink-200">
                <li><a className="underline-offset-4 hover:underline" href="https://github.com/opencolin/openclaw-deploy">opencolin/openclaw-deploy</a> — local install, Docker, Nebius CPU & GPU paths</li>
                <li><a className="underline-offset-4 hover:underline" href="https://docs.contree.dev/">docs.contree.dev</a> — sandboxed workspaces with Git-like branching</li>
                <li><a className="underline-offset-4 hover:underline" href="/docs/openclaw/token-factory">Token Factory docs</a> — model catalog &amp; cost patterns</li>
              </ul>
            </div>
          </div>
          <aside className="space-y-6">
            <div className="card">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">Chapters</h3>
              <ol className="mt-3 space-y-2 text-sm">
                {w.chapters.map((c) => (
                  <li key={c.startSec} className="flex items-start gap-3">
                    <span className="kbd">{secsToTimestamp(c.startSec)}</span>
                    <span className="text-ink-700 dark:text-ink-200">{c.title}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">Tags</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {w.tags.map((t) => (<li key={t} className="pill-outline">{t}</li>))}
              </ul>
            </div>
            <div className="card bg-navy-700 text-white">
              <p className="text-sm font-semibold">Run it on Nebius.</p>
              <p className="mt-2 text-sm text-ink-100">Spin a Contree workspace preloaded for this workshop. Token Factory key included.</p>
              <Link href="/ide" className="btn-lime mt-4 w-full">Open workspace</Link>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
