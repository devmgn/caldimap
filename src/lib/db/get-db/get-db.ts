import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Sql } from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sales } from "../schema/sales";
import { scrapeLogs } from "../schema/scrape-logs";
import { stores } from "../schema/stores";

const dbSchema = { stores, sales, scrapeLogs };

/** The app database's tables, as Drizzle types them. */
export type DbSchema = typeof dbSchema;

let client: Sql | null = null;
let instance: PostgresJsDatabase<DbSchema> | null = null;

/**
 * Returns the Drizzle client, connecting lazily on first use.
 *
 * @returns The Drizzle client
 */
export function getDb(): PostgresJsDatabase<DbSchema> {
  if (instance === null) {
    const url = process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL;

    if (url === undefined || url === "") {
      throw new Error("DATABASE_URL or DATABASE_URL_POOLED is required");
    }

    client = postgres(url);
    instance = drizzle({ client, schema: dbSchema });
  }

  return instance;
}

/**
 * Called from scripts/scrape-stores.ts via dynamic import
 *
 * @public
 */
export async function closeDb(): Promise<void> {
  if (client !== null) {
    await client.end();
    client = null;
    instance = null;
  }
}
