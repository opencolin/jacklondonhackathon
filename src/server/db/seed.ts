import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  sponsors,
  venues,
  events,
  eventSponsors,
  officeHoursSessions,
} from "./schema";
import { eq, sql } from "drizzle-orm";

async function main() {
  const url =
    process.env.DATABASE_URL_DIRECT ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required");
  const sqlClient = postgres(url, {
    max: 1,
    connect_timeout: 60,
    prepare: false,
  });
  const db = drizzle(sqlClient);

  // Idempotency guard — skip the whole seed if the BuilderShip event row
  // already exists. Lets us run db:seed on every Vercel build safely.
  const existing = await db
    .select()
    .from(events)
    .where(eq(events.slug, "buildership"))
    .limit(1);
  if (existing.length > 0) {
    console.log("Seed: BuilderShip event already exists, skipping.");
    return;
  }

  console.log("Seeding sponsors…");
  const [nebius, composio, tavily] = await db
    .insert(sponsors)
    .values([
      {
        slug: "nebius",
        name: "Nebius",
        primaryColor: "#052B42",
        siteUrl: "https://nebius.com",
        docUrl: "https://docs.nebius.com",
      },
      {
        slug: "composio",
        name: "Composio",
        primaryColor: "#E0FF4F",
        siteUrl: "https://composio.dev",
        docUrl: "https://docs.composio.dev",
      },
      {
        slug: "tavily",
        name: "Tavily",
        primaryColor: "#052B42",
        siteUrl: "https://www.tavily.com",
        docUrl: "https://docs.tavily.com",
      },
    ])
    .onConflictDoNothing({ target: sponsors.slug })
    .returning();

  console.log("Seeding venues…");
  const [southBeach, jackLondon, plank, bicycle, farmhouse, frontier, homebrew] =
    await db
      .insert(venues)
      .values([
        { name: "South Beach Marina", city: "San Francisco", region: "CA", country: "US", isOnline: false },
        { name: "Jack London Square Marina", city: "Oakland", region: "CA", country: "US", isOnline: false },
        { name: "Plank", address: "472 Water St", city: "Oakland", region: "CA", country: "US", isOnline: false, capacity: 200 },
        { name: "Bicycle Coffee", city: "Oakland", region: "CA", country: "US", isOnline: false },
        { name: "Farmhouse Kitchen Thai", city: "Oakland", region: "CA", country: "US", isOnline: false, capacity: 60 },
        { name: "Frontier Tower", city: "San Francisco", region: "CA", country: "US", isOnline: false, capacity: 40 },
        { name: "Homebrew", city: "San Francisco", region: "CA", country: "US", isOnline: false, capacity: 30 },
        { name: "Online (Zoom)", isOnline: true, capacity: 100 },
      ])
      .returning();

  console.log("Seeding BuilderShip event…");
  const [codeCruise] = await db
    .insert(events)
    .values({
      slug: "buildership",
      title: "BuilderShip",
      description:
        "Three-week remote hackathon culminating in a finals day on the bay, May 30. Top 30 builders earn the boat day. Compete for $10k and a DGX Spark.",
      format: "HACKATHON",
      state: "live",
      startsAt: new Date("2026-05-07T09:00:00-07:00"),
      endsAt: new Date("2026-05-30T23:59:00-07:00"),
      venueId: jackLondon?.id,
      capacity: 30,
      coverGradient: "from-navy-500 via-navy-600 to-navy-700",
      prizeSummary: "$10k in credits + a DGX Spark + a walk off the plank",
      partnersJson: ["Nebius", "Composio", "Tavily"],
      scoringConfigJson: {
        ai_weight: 0.4,
        sponsor_weight: 0.4,
        investor_weight: 0.2,
        public_leaderboard_at: "2026-05-29T00:00:00-07:00",
        rubric_version: "v1",
      },
    })
    .onConflictDoUpdate({
      target: events.slug,
      set: { updatedAt: new Date() },
    })
    .returning();

  if (codeCruise) {
    await db
      .insert(eventSponsors)
      .values([
        { eventId: codeCruise.id, sponsorId: nebius!.id, role: "host" },
        { eventId: codeCruise.id, sponsorId: composio!.id, role: "primary" },
        { eventId: codeCruise.id, sponsorId: tavily!.id, role: "primary" },
      ])
      .onConflictDoNothing();
  }

  console.log("Seeding office hours recurring slots…");
  const officeHoursSpec = [
    { slug: "office-hours-monday-zoom",      day: "MO", venueId: undefined, online: true,  start: "12:00", end: "13:00" },
    { slug: "office-hours-tuesday-frontier", day: "TU", venueId: frontier?.id, online: false, start: "12:00", end: "14:00" },
    { slug: "office-hours-wednesday-homebrew", day: "WE", venueId: homebrew?.id, online: false, start: "12:00", end: "14:00" },
    { slug: "office-hours-thursday-frontier", day: "TH", venueId: frontier?.id, online: false, start: "12:00", end: "14:00" },
    { slug: "office-hours-friday-zoom",      day: "FR", venueId: undefined, online: true,  start: "12:00", end: "13:00" },
  ] as const;

  for (const spec of officeHoursSpec) {
    await db
      .insert(events)
      .values({
        slug: spec.slug,
        title: `Office Hours · ${spec.day}`,
        format: "OFFICE_HOURS",
        state: "live",
        startsAt: new Date("2026-05-07T12:00:00-07:00"),
        endsAt: new Date("2026-05-30T14:00:00-07:00"),
        venueId: spec.venueId ?? undefined,
        capacity: spec.online ? 100 : 40,
        coverGradient: spec.online
          ? "from-lime-100 via-lime-200 to-lime-300"
          : "from-navy-300 via-navy-500 to-navy-700",
        partnersJson: ["Nebius", "Composio", "Tavily"],
        parentEventId: codeCruise?.id,
        rrule: `FREQ=WEEKLY;BYDAY=${spec.day};BYHOUR=12;BYMINUTE=0;UNTIL=20260530T235959Z`,
        scoringConfigJson: null,
      })
      .onConflictDoNothing({ target: events.slug });
  }

  // Run unused-var no-op to keep TS happy when sponsors come back null on re-runs
  void [southBeach, plank, bicycle, farmhouse];

  await db.execute(sql`select 1`);
  console.log("Seed complete.");
  await sqlClient.end();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
