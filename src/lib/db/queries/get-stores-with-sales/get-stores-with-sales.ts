import type { StoresData } from "../../../../types/stores-data";
import { cacheLife, cacheTag } from "next/cache";
import { selectStoresWithSales } from "./utils/select-stores-with-sales";
import { getDb } from "../../get-db";

/** Cache tag of the stores data; revalidate it after a scrape is saved. */
export const STORES_CACHE_TAG = "stores";

/**
 * Loads every store with its sales. Cached and prerendered into the page; the
 * cache is refreshed daily and when `/api/scrape` revalidates
 * {@link STORES_CACHE_TAG}. `updatedAt` is the time of the latest recorded
 * scrape, not of the cache fill, so it stays put while scrapes are failing.
 *
 * @returns Stores with their sales, or `null` when the DB has no stores
 */
export async function getStoresWithSales(): Promise<StoresData | null> {
  "use cache";
  cacheTag(STORES_CACHE_TAG);
  cacheLife("days");

  // The query takes the database as an argument (so tests can hand it PGlite);
  // a cached function can't, since its arguments become the cache key
  return await selectStoresWithSales(getDb());
}
