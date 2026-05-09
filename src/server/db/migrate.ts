import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url =
    process.env.DATABASE_URL_DIRECT ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL or DATABASE_URL_DIRECT required");

  // Mask + log the URL we're using so build logs make the env clear
  // without leaking credentials.
  const masked = url.replace(/:\/\/[^@]+@/, "://***:***@");
  console.log(`migrate: using ${masked}`);

  // Neon free-tier compute auto-suspends; cold-start can take 10-20s.
  // Bump connect_timeout above the default 30s, and tell postgres-js
  // not to use prepared statements (Neon pooler doesn't like them).
  const sql = postgres(url, {
    max: 1,
    connect_timeout: 60,
    idle_timeout: 20,
    prepare: false,
  });

  try {
    console.log("Ensuring extension: citext");
    await sql`CREATE EXTENSION IF NOT EXISTS citext`;

    // Recover from a previous partially-applied migration run. If the
    // drizzle migrations journal exists but is empty, drop + recreate
    // public schema so CREATE TYPE / CREATE TABLE statements run cleanly.
    const journalExists = await sql`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
    `;
    if (journalExists.length > 0) {
      const applied = await sql`SELECT count(*)::int AS n FROM drizzle.__drizzle_migrations`;
      const n = (applied[0] as { n: number } | undefined)?.n ?? 0;
      if (n === 0) {
        console.log("Cleaning partial-migration state from public schema…");
        await sql`DROP SCHEMA IF EXISTS public CASCADE`;
        await sql`CREATE SCHEMA public`;
        await sql`CREATE EXTENSION IF NOT EXISTS citext`;
      }
    }

    console.log("Running migrations…");
    await migrate(drizzle(sql), { migrationsFolder: "./src/server/db/migrations" });
    console.log("Migrations applied.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
