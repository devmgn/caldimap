import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { storesDataSchema } from "./stores-data-schema";

const { loadEnvConfig } = await import("@next/env");

loadEnvConfig(path.resolve(import.meta.dirname, ".."));

const JSON_PATH = path.resolve(import.meta.dirname, "../data/stores.json");

async function main() {
  if (!existsSync(JSON_PATH)) {
    throw new Error(`JSON file not found: ${JSON_PATH}`);
  }

  const { upsertStoresAndSales } =
    await import("../src/lib/db/queries/upsert-stores-and-sales");

  const data = storesDataSchema.parse(
    JSON.parse(readFileSync(JSON_PATH, "utf-8"))
  );

  console.warn(`Seeding ${data.stores.length} stores from ${JSON_PATH}...`);

  await upsertStoresAndSales(data);

  console.warn("Seed completed successfully");
}

await main();
