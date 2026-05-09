import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Enum types created by the initial migration. CREATE TYPE doesn't
// support IF NOT EXISTS, so when a previous migration attempt left
// these behind we drop them up-front to keep migrations idempotent.
const ENUM_TYPES = [
  "event_format",
  "event_sponsor_role",
  "event_state",
  "invitation_status",
  "judge_kind",
  "manifest_role",
  "office_hours_rsvp_status",
  "office_hours_session_status",
  "project_status",
  "registration_source",
  "registration_status",
  "sponsor_status",
  "submission_status",
  "team_role",
  "user_status",
];

async function main() {
  const url =
    process.env.DATABASE_URL_DIRECT ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL or DATABASE_URL_DIRECT required");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  // Required extensions
  console.log("Ensuring extensions (citext)…");
  await client.unsafe("CREATE EXTENSION IF NOT EXISTS citext;");

  // If a prior migration partially succeeded, the migration row may not
  // be recorded but the enums + some tables already exist. Fix up by
  // dropping anything Drizzle would re-create. CASCADE so dependent
  // columns get dropped (this is OK because the matching tables get
  // recreated by the migration immediately after).
  const journalRow = await client.unsafe(
    "SELECT 1 FROM information_schema.tables WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'",
  );
  if (Array.isArray(journalRow) && journalRow.length > 0) {
    const applied = await client.unsafe(
      "SELECT count(*) AS n FROM drizzle.__drizzle_migrations",
    );
    const appliedCount = Number((applied as Array<{ n: string }>)[0]?.n ?? 0);
    if (appliedCount === 0) {
      console.log("Cleaning partial state from failed migration…");
      // Drop any tables Drizzle owns (public schema, in dependency order via CASCADE)
      await client.unsafe(
        "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;",
      );
      // Then drop dangling enum types (which live in public, so they're already gone — but be safe)
      for (const t of ENUM_TYPES) {
        await client.unsafe(`DROP TYPE IF EXISTS "${t}" CASCADE;`);
      }
      // Re-enable citext after schema drop
      await client.unsafe("CREATE EXTENSION IF NOT EXISTS citext;");
    }
  }

  console.log("Running migrations…");
  await migrate(db, { migrationsFolder: "./src/server/db/migrations" });
  console.log("Migrations applied.");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
