import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/server/env";

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
};

export const client =
  globalForDb.client ?? postgres(env.DATABASE_URL, { prepare: false });

if (env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
export { schema };
export type Db = typeof db;
