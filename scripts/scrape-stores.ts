import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { storesDataSchema } from "./stores-data-schema";

const { loadEnvConfig } = await import("@next/env");

loadEnvConfig(path.resolve(import.meta.dirname, ".."));

const DATA_DIR = path.resolve(import.meta.dirname, "../data");
const OUTPUT_PATH = path.resolve(DATA_DIR, "stores.json");

const { values } = parseArgs({
  options: { "no-cache": { type: "boolean", default: false } },
});

function hasDbConfig(): boolean {
  const url = process.env.DATABASE_URL ?? process.env.DATABASE_URL_POOLED;

  return url !== undefined && url !== "";
}

async function loadCoordsCache(): Promise<
  Map<string, { lat: number; lng: number }>
> {
  if (hasDbConfig()) {
    try {
      const { getStoreCoordsCache } =
        await import("../src/lib/db/queries/get-store-coords-cache");

      const coords = await getStoreCoordsCache();
      console.warn(`Loaded ${coords.size} cached coordinates from database`);

      return coords;
    } catch {
      console.warn("Failed to load coordinates from DB, falling back to JSON");
    }
  }

  if (existsSync(OUTPUT_PATH)) {
    const existing = storesDataSchema.parse(
      JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"))
    );

    const coords = new Map<string, { lat: number; lng: number }>();

    for (const s of existing.stores) {
      coords.set(s.id, { lat: s.lat, lng: s.lng });
    }

    console.warn(`Loaded ${coords.size} cached coordinates from local JSON`);

    return coords;
  }

  return new Map();
}

async function main() {
  const { buildStoresData } = await import("../src/lib/scraper");

  const skipCache = values["no-cache"];

  const cachedCoords = skipCache
    ? new Map<string, { lat: number; lng: number }>()
    : await loadCoordsCache();

  if (skipCache) {
    console.warn("Cache skipped (--no-cache)");
  }

  const output = await buildStoresData(cachedCoords);

  // Save local JSON for development
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");
  console.warn(`Saved ${output.stores.length} stores to ${OUTPUT_PATH}`);

  // Write to database if configured
  if (hasDbConfig()) {
    const { upsertStoresAndSales } =
      await import("../src/lib/db/queries/upsert-stores-and-sales");

    const { logScrape } = await import("../src/lib/db/queries/log-scrape");

    await upsertStoresAndSales(output);
    await logScrape(output.stores.length);
    console.warn(`Upserted ${output.stores.length} stores to database`);

    const { closeDb } = await import("../src/lib/db/get-db");
    await closeDb();
  }
}

await main();
