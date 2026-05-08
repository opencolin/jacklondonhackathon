"use client";

import { useState } from "react";
import Link from "next/link";
import type { Event } from "@/lib/data";
import { EventCard } from "@/components/event-card";
import { formatDate, formatTime } from "@/lib/utils";

const formatLabel: Record<Event["format"], string> = {
  HACKATHON: "Hackathon",
  MEETUP: "Meetup",
  MINI_CONFERENCE: "Mini conference",
  OFFICE_HOURS: "Office hours",
};

type View = "grid" | "list";

const STORAGE_KEY = "cc-events-view";

function readView(): View {
  if (typeof window === "undefined") return "grid";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "list" ? "list" : "grid";
}

export function EventList({
  events,
  emptyLabel,
}: {
  events: Event[];
  emptyLabel?: string;
}) {
  const [view, setView] = useState<View>("grid");

  // Lazy hydrate from localStorage
  if (typeof window !== "undefined") {
    const stored = readView();
    if (stored !== view) {
      // setState in render is OK if only the first render after hydration
      // diverges; React handles it gracefully.
      queueMicrotask(() => setView(stored));
    }
  }

  function toggle(next: View) {
    setView(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }

  if (!events.length) {
    return (
      <p className="text-sm text-ink-500 dark:text-ink-400">{emptyLabel ?? "Nothing here yet."}</p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <div
          role="tablist"
          aria-label="Event view"
          className="inline-flex rounded-pill border border-ink-200 bg-white p-1 dark:border-ink-700 dark:bg-ink-900"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "grid"}
            onClick={() => toggle("grid")}
            className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-medium ${
              view === "grid"
                ? "bg-navy-700 text-white dark:bg-lime dark:text-navy-700"
                : "text-ink-700 hover:text-ink-900 dark:text-ink-200 dark:hover:text-ink-50"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
            Grid
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            onClick={() => toggle("list")}
            className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-medium ${
              view === "list"
                ? "bg-navy-700 text-white dark:bg-lime dark:text-navy-700"
                : "text-ink-700 hover:text-ink-900 dark:text-ink-200 dark:hover:text-ink-50"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <rect x="1" y="2" width="14" height="2" rx="1" />
              <rect x="1" y="7" width="14" height="2" rx="1" />
              <rect x="1" y="12" width="14" height="2" rx="1" />
            </svg>
            List
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-card border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
          {events.map((e, i) => (
            <li
              key={e.id}
              className={`grid grid-cols-1 items-center gap-3 px-5 py-4 sm:grid-cols-[180px_1fr_180px_120px] ${
                i !== events.length - 1 ? "border-b border-ink-200 dark:border-ink-700" : ""
              }`}
            >
              <div className="text-sm">
                <p className="font-mono font-semibold text-navy-700 dark:text-lime">
                  {formatDate(e.startDateTime)}
                </p>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  {formatTime(e.startDateTime)}
                  {e.endDateTime ? ` – ${formatTime(e.endDateTime)}` : ""}
                </p>
              </div>
              <div className="min-w-0">
                <Link
                  href={`/events/${e.slug}`}
                  className="text-sm font-semibold leading-snug text-ink-900 hover:text-navy-700 dark:text-ink-50 dark:hover:text-lime"
                >
                  {e.title}
                </Link>
                <p className="mt-0.5 line-clamp-1 text-xs text-ink-500 dark:text-ink-400">
                  {formatLabel[e.format]} · {e.partners.slice(0, 3).join(", ")}
                </p>
              </div>
              <p className="text-xs text-ink-500 dark:text-ink-400 sm:text-right">
                {e.isOnline ? "Online" : e.venue.split(",")[0]}
              </p>
              <div className="flex justify-start sm:justify-end">
                {e.rsvpUrl ? (
                  <a
                    href={e.rsvpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline text-xs"
                  >
                    RSVP ↗
                  </a>
                ) : (
                  <Link href={`/events/${e.slug}`} className="btn-outline text-xs">
                    Details →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
