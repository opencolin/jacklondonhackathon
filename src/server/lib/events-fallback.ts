import "server-only";
import { events as mockEvents } from "@/lib/data";
import type { Event as LegacyEvent, EventState } from "@/lib/data";

/**
 * Map the schema's lowercase event state to the legacy uppercase state used by
 * the mock data + the consumer pages.
 */
const SCHEMA_TO_LEGACY: Record<string, EventState> = {
  live: "LIVE",
  published: "UPCOMING",
  draft: "UPCOMING",
  completed: "COMPLETED",
  cancelled: "COMPLETED",
};

export function mockEventsByState(state?: string | null): LegacyEvent[] {
  if (!state) return [...mockEvents];
  const legacyState = SCHEMA_TO_LEGACY[state];
  if (!legacyState) return [];
  return mockEvents.filter((e) => e.state === legacyState);
}

export function mockEventBySlug(slug: string): LegacyEvent | null {
  return mockEvents.find((e) => e.slug === slug) ?? null;
}

export function mockEventById(id: string): LegacyEvent | null {
  return mockEvents.find((e) => e.id === id) ?? null;
}

/**
 * True when the configured DB URL looks like the placeholder we fall back to
 * when DATABASE_URL is missing.
 */
export function isDbPlaceholder(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return url.includes("placeholder") || url === "";
}
