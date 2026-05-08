import "server-only";
import type { Event as LegacyEvent, EventFormat, EventState } from "@/lib/data";
import type { events as eventsTable, venues as venuesTable } from "@/server/db/schema";

type DbEvent = typeof eventsTable.$inferSelect;
type DbVenue = typeof venuesTable.$inferSelect;

const STATE_MAP: Record<DbEvent["state"], EventState> = {
  draft: "UPCOMING",
  published: "UPCOMING",
  live: "LIVE",
  completed: "COMPLETED",
  cancelled: "COMPLETED",
};

const DEFAULT_COVER = "from-lime-100 via-lime-200 to-lime-300";

export function toLegacyEvent(
  row: DbEvent,
  venue?: DbVenue | null,
  registeredCount?: number,
): LegacyEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    format: row.format as EventFormat,
    state: STATE_MAP[row.state],
    startDateTime: row.startsAt.toISOString(),
    endDateTime: row.endsAt ? row.endsAt.toISOString() : undefined,
    city: venue?.city ?? "Remote",
    venue: venue?.name ?? "Online",
    isOnline: venue?.isOnline ?? false,
    cover: row.coverGradient ?? DEFAULT_COVER,
    capacity: row.capacity,
    registered: registeredCount ?? row.registered,
    partners: row.partnersJson ?? [],
    prizePool: row.prizeSummary ?? undefined,
    rsvpUrl: row.rsvpUrl ?? undefined,
  };
}
