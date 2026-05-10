import Link from "next/link";
import type { Event } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/utils";

const formatLabel: Record<Event["format"], string> = {
  HACKATHON: "Hackathon",
  MEETUP: "Meetup",
  MINI_CONFERENCE: "Mini conference",
  OFFICE_HOURS: "Office hours",
};

function StatePill({ state, startDateTime }: { state: Event["state"]; startDateTime: string }) {
  if (state === "LIVE") {
    return (
      <span className="pill-lime">
        <span className="live-dot" /> Live now
      </span>
    );
  }
  if (state === "COMPLETED") {
    return <span className="pill-ink">Completed</span>;
  }
  const ms = new Date(startDateTime).getTime() - Date.now();
  const days = Math.round(ms / 86_400_000);
  if (days >= 1 && days <= 7) {
    return <span className="pill-outline">In {days} day{days === 1 ? "" : "s"}</span>;
  }
  return <span className="pill-outline">{formatDate(startDateTime)}</span>;
}

export function EventCard({ event, href }: { event: Event; href?: string }) {
  return (
    <Link href={href ?? `/events/${event.slug}`} className="group flex h-full flex-col overflow-hidden rounded-card border border-ink-200 bg-white transition-all hover:border-ink-300 hover:shadow-soft dark:border-ink-700 dark:bg-ink-900 dark:hover:border-ink-600">
      <div className={`relative h-36 bg-gradient-to-br ${event.cover}`}>
        <div className="absolute left-4 top-4 flex gap-2">
          <StatePill state={event.state} startDateTime={event.startDateTime} />
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {event.rsvpUrl ? <span className="pill-outline text-[10px]">Luma</span> : null}
          <span className="pill bg-white/90 text-navy-700">{event.city}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-ink-500 dark:text-ink-400">
          {formatLabel[event.format]} · {formatDate(event.startDateTime)} · {formatTime(event.startDateTime)}
        </p>
        <h3 className="mb-2 text-base font-semibold leading-snug text-ink-900 group-hover:text-navy-700 dark:text-ink-50 dark:group-hover:text-lime">{event.title}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-ink-600 dark:text-ink-300">{event.description}</p>
        <div className="mt-auto flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
          <span className="truncate pr-4">{event.isOnline ? "Online" : event.venue.split(",")[0]}</span>
          {event.prizePool ? <span className="pill-lime">{event.prizePool}</span> : (
            <span className="text-ink-400 dark:text-ink-500">{event.registered}/{event.capacity}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
