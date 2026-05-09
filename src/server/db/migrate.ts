import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url =
    process.env.DATABASE_URL_DIRECT ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL or DATABASE_URL_DIRECT required");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  console.log("Running migrations…");
  await migrate(db, { migrationsFolder: "./src/server/db/migrations" });
  console.log("Migrations applied.");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
