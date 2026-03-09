import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import nextEnv from "@next/env";
import { putStoresData } from "../src/lib/blob";
import { buildStoresData } from "../src/lib/scraper";

nextEnv.loadEnvConfig(resolve(import.meta.dirname, ".."));

const DATA_DIR = resolve(import.meta.dirname, "../src/data");
const OUTPUT_PATH = resolve(DATA_DIR, "stores.json");

async function main() {
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GEOCODING_API_KEY is required");
  }

  // Load existing data if available (to reuse geocoded coordinates)
  const cachedCoords = new Map<string, { lat: number; lng: number }>();
  if (existsSync(OUTPUT_PATH)) {
    const existing = JSON.parse(readFileSync(OUTPUT_PATH, "utf8"));
    for (const s of existing.stores) {
      cachedCoords.set(s.id, { lat: s.lat, lng: s.lng });
    }
  }

  const output = await buildStoresData(cachedCoords, apiKey);

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf8");
  console.warn(`Saved ${output.stores.length} stores to ${OUTPUT_PATH}`);

  // Upload to Vercel Blob if token is available
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blobUrl = await putStoresData(output);
    console.warn(`Uploaded to Blob: ${blobUrl}`);
  }
}

await main();
