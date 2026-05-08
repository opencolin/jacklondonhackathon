import Link from "next/link";
import type { Workshop } from "@/lib/data";
import { formatDate, formatDuration } from "@/lib/utils";

export function WorkshopCard({ workshop, featured = false }: { workshop: Workshop; featured?: boolean }) {
  return (
    <Link
      href={`/workshops/${workshop.slug}`}
      className={`group flex flex-col overflow-hidden rounded-card border border-ink-200 bg-white transition-all hover:border-ink-300 hover:shadow-soft dark:border-ink-700 dark:bg-ink-900 dark:hover:border-ink-600 ${featured ? "md:flex-row" : ""}`}
    >
      <div className={`relative aspect-video bg-gradient-to-br from-navy-700 via-navy-600 to-lime ${featured ? "md:aspect-auto md:w-1/2" : ""}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-white/95 px-5 py-3 text-sm font-semibold text-navy-700">▶ Watch · {formatDuration(workshop.durationSeconds)}</div>
        </div>
        <div className="absolute right-3 top-3 pill-navy">{workshop.tags[0]}</div>
      </div>
      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:p-8" : ""}`}>
        <p className="text-xs font-medium uppercase tracking-wider text-ink-500 dark:text-ink-400">
          Workshop · {formatDate(workshop.recordedAt)}
        </p>
        <h3 className={`mt-2 font-semibold leading-snug text-ink-900 dark:text-ink-50 group-hover:text-navy-700 ${featured ? "text-2xl" : "text-base"}`}>
          {workshop.title}
        </h3>
        <p className={`mt-3 text-sm text-ink-600 dark:text-ink-300 ${featured ? "line-clamp-4" : "line-clamp-2"}`}>
          {workshop.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-500 dark:text-ink-400">
          {workshop.hosts.map((h) => (
            <span key={h.name} className="flex items-center gap-1">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-lime text-[10px] font-semibold text-navy-700">{h.name[0]}</span>
              {h.name} · {h.company}
            </span>
          ))}
        </div>
        {featured ? (
          <div className="mt-6 flex items-center gap-3">
            <span className="btn-lime pointer-events-none">{workshop.ctaLabel}</span>
            <span className="text-xs text-ink-500 dark:text-ink-400">{workshop.watchCount.toLocaleString()} watches</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
