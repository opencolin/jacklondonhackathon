import "server-only";

import { addWeeks } from "date-fns";
import { and, eq, inArray } from "drizzle-orm";
import { rrulestr } from "rrule";

import { db as defaultDb, type Db } from "@/server/db";
import { events, officeHoursSessions } from "@/server/db/schema";

const HORIZON_WEEKS = 6;
// Default office-hours session length when the parent event doesn't specify one.
const DEFAULT_DURATION_MS = 60 * 60 * 1000;

export interface MaterializeResult {
  parentEventId: string;
  inserted: number;
  skipped: number;
}

/**
 * Expand the parent event's rrule into office_hours_sessions for the next
 * ~6 weeks. Idempotent: skips rows that already exist for the same
 * (parentEventId, startsAt) pair.
 */
export async function materializeOfficeHoursForEvent(
  parentEventId: string,
  db: Db = defaultDb,
): Promise<MaterializeResult> {
  const parent = await db.query.events.findFirst({
    where: eq(events.id, parentEventId),
  });
  if (!parent) {
    throw new Error(`materializeOfficeHoursForEvent: parent ${parentEventId} not found`);
  }
  if (!parent.rrule) {
    return { parentEventId, inserted: 0, skipped: 0 };
  }

  const now = new Date();
  const horizon = addWeeks(now, HORIZON_WEEKS);

  // rrulestr parses both raw "FREQ=WEEKLY;..." and "RRULE:FREQ=..." forms,
  // optionally with a DTSTART line. Anchor unanchored rules to the parent
  // event's startsAt so DAY-OF-WEEK / TIME-OF-DAY semantics are preserved.
  let rule;
  try {
    rule = rrulestr(parent.rrule, { dtstart: parent.startsAt });
  } catch (err) {
    throw new Error(
      `Failed to parse rrule for event ${parentEventId}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }

  // Pull occurrences from now through the horizon, inclusive of both edges.
  const occurrences = rule.between(now, horizon, true);

  // Compute session duration from parent's startsAt..endsAt if available.
  const duration =
    parent.endsAt && parent.startsAt
      ? Math.max(0, parent.endsAt.getTime() - parent.startsAt.getTime())
      : DEFAULT_DURATION_MS;

  if (occurrences.length === 0) {
    return { parentEventId, inserted: 0, skipped: 0 };
  }

  // Find which startsAt values already exist so we can skip them.
  const existing = await db
    .select({ startsAt: officeHoursSessions.startsAt })
    .from(officeHoursSessions)
    .where(
      and(
        eq(officeHoursSessions.parentEventId, parentEventId),
        inArray(officeHoursSessions.startsAt, occurrences),
      ),
    );

  const seen = new Set(existing.map((r) => r.startsAt.getTime()));

  const toInsert = occurrences
    .filter((d) => !seen.has(d.getTime()))
    .map((startsAt) => ({
      parentEventId,
      startsAt,
      endsAt: new Date(startsAt.getTime() + duration),
      venueId: parent.venueId ?? null,
      hostUserId: parent.createdById ?? null,
      capacity: parent.capacity ?? 100,
      status: "upcoming" as const,
    }));

  if (toInsert.length > 0) {
    await db.insert(officeHoursSessions).values(toInsert);
  }

  return {
    parentEventId,
    inserted: toInsert.length,
    skipped: occurrences.length - toInsert.length,
  };
}
