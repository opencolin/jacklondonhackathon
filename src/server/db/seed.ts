import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  sponsors,
  venues,
  events,
  eventSponsors,
  officeHoursSessions,
} from "./schema";
import { sql } from "drizzle-orm";

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

  // Per-row upserts below make the whole seed idempotent — safe to run
  // every deploy. Old guard removed so we can update existing rows
  // (e.g. fix office-hours dates, add new workshop entries).

  console.log("Seeding sponsors…");
  // onConflictDoNothing returns an empty array when every row already
  // exists, so we'd lose the sponsor IDs we need below. Re-fetch by
  // slug after the upsert to guarantee we have them either way.
  await db
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
    .onConflictDoNothing({ target: sponsors.slug });

  const allSponsors = await db.select().from(sponsors);
  const sponsorBySlug = (slug: string) =>
    allSponsors.find((s) => s.slug === slug);
  const nebius = sponsorBySlug("nebius");
  const composio = sponsorBySlug("composio");
  const tavily = sponsorBySlug("tavily");

  console.log("Seeding venues…");
  // Venues have no unique constraint — guard via a lookup so re-runs
  // don't duplicate. If any venue rows exist, skip the insert and use
  // them; otherwise insert the full set.
  const existingVenues = await db.select().from(venues).limit(1);
  const venueRows =
    existingVenues.length > 0
      ? await db.select().from(venues)
      : await db
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
  const venueByName = (n: string) => venueRows.find((v) => v.name === n);
  const southBeach = venueByName("South Beach Marina");
  const jackLondon = venueByName("Jack London Square Marina");
  const plank = venueByName("Plank");
  const bicycle = venueByName("Bicycle Coffee");
  const farmhouse = venueByName("Farmhouse Kitchen Thai");
  const frontier = venueByName("Frontier Tower");
  const homebrew = venueByName("Homebrew");

  console.log("Seeding BuilderShip event…");
  const [codeCruise] = await db
    .insert(events)
    .values({
      slug: "buildership",
      title: "BuilderShip",
      description:
        "Three-week remote hackathon culminating in a finals day on the bay, May 30. Top 40 builders earn the boat day. Compete for $50,000 and a DGX Spark.",
      format: "HACKATHON",
      state: "live",
      startsAt: new Date("2026-05-07T09:00:00-07:00"),
      endsAt: new Date("2026-05-30T23:59:00-07:00"),
      venueId: jackLondon?.id,
      capacity: 40,
      coverGradient: "from-navy-500 via-navy-600 to-navy-700",
      prizeSummary: "$50,000 in credits + a DGX Spark + a walk off the plank",
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

  if (codeCruise && nebius && composio && tavily) {
    await db
      .insert(eventSponsors)
      .values([
        { eventId: codeCruise.id, sponsorId: nebius.id, role: "host" },
        { eventId: codeCruise.id, sponsorId: composio.id, role: "primary" },
        { eventId: codeCruise.id, sponsorId: tavily.id, role: "primary" },
      ])
      .onConflictDoNothing();
  }

  console.log("Seeding office hours recurring slots…");
  const officeHoursSpec = [
    { slug: "office-hours-monday-zoom",        day: "MO", title: "Office Hours · Monday Zoom",         venueId: undefined,    online: true,  start: "2026-05-11T12:00:00-07:00", end: "2026-05-11T13:00:00-07:00" },
    { slug: "office-hours-tuesday-frontier",   day: "TU", title: "Office Hours · Tuesday at Frontier", venueId: frontier?.id, online: false, start: "2026-05-12T12:00:00-07:00", end: "2026-05-12T14:00:00-07:00" },
    { slug: "office-hours-wednesday-homebrew", day: "WE", title: "Office Hours · Wednesday at Homebrew", venueId: homebrew?.id, online: false, start: "2026-05-13T12:00:00-07:00", end: "2026-05-13T14:00:00-07:00" },
    { slug: "office-hours-thursday-frontier",  day: "TH", title: "Office Hours · Thursday at Frontier", venueId: frontier?.id, online: false, start: "2026-05-14T12:00:00-07:00", end: "2026-05-14T14:00:00-07:00" },
    { slug: "office-hours-friday-zoom",        day: "FR", title: "Office Hours · Friday Zoom",          venueId: undefined,    online: true,  start: "2026-05-15T12:00:00-07:00", end: "2026-05-15T13:00:00-07:00" },
  ] as const;

  for (const spec of officeHoursSpec) {
    await db
      .insert(events)
      .values({
        slug: spec.slug,
        title: spec.title,
        format: "OFFICE_HOURS",
        state: "live",
        startsAt: new Date(spec.start),
        endsAt: new Date(spec.end),
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
      .onConflictDoUpdate({
        target: events.slug,
        set: {
          title: spec.title,
          startsAt: new Date(spec.start),
          endsAt: new Date(spec.end),
          updatedAt: new Date(),
        },
      });
  }

  console.log("Seeding live workshops…");
  const workshopsSpec = [
    {
      slug: "workshop-nebius-ai-cloud",
      title: "Live Workshop · Nebius AI Cloud",
      description:
        "Hands-on workshop on Nebius AI Cloud. GPU instances, Token Factory inference, and Nebius Serverless deploys — bring your laptop and walk out with something deployed.",
      partner: "Nebius",
      start: "2026-05-13T17:00:00-07:00",
      end: "2026-05-13T19:00:00-07:00",
    },
    {
      slug: "workshop-openclaw",
      title: "Live Workshop · OpenClaw",
      description:
        "Build an agent with OpenClaw end-to-end — local install, sandboxed tool execution, and one-command deploy to Nebius Serverless. Live coding, sponsor engineers in the room.",
      partner: "OpenClaw",
      start: "2026-05-15T17:00:00-07:00",
      end: "2026-05-15T19:00:00-07:00",
    },
    {
      slug: "workshop-tavily",
      title: "Live Workshop · Tavily",
      description:
        "Build a research agent in 50 lines using Tavily's /search and /extract APIs. Citation patterns, sub-second retrieval, production agent loops.",
      partner: "Tavily",
      start: "2026-05-20T17:00:00-07:00",
      end: "2026-05-20T19:00:00-07:00",
    },
    {
      slug: "workshop-composio",
      title: "Live Workshop · Composio",
      description:
        "Connect your agent to Gmail, Slack, GitHub, Linear, and 250+ other apps in one session. Auth flow, tool schemas, and a working integration by the end of the hour.",
      partner: "Composio",
      start: "2026-05-22T17:00:00-07:00",
      end: "2026-05-22T19:00:00-07:00",
    },
  ] as const;

  for (const w of workshopsSpec) {
    await db
      .insert(events)
      .values({
        slug: w.slug,
        title: w.title,
        description: w.description,
        format: "MEETUP",
        state: "live",
        startsAt: new Date(w.start),
        endsAt: new Date(w.end),
        venueId: undefined,
        capacity: 100,
        coverGradient: "from-orange-200 via-orange-400 to-orange-600",
        partnersJson: [w.partner],
        parentEventId: codeCruise?.id,
        scoringConfigJson: null,
      })
      .onConflictDoUpdate({
        target: events.slug,
        set: {
          title: w.title,
          description: w.description,
          startsAt: new Date(w.start),
          endsAt: new Date(w.end),
          updatedAt: new Date(),
        },
      });
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
