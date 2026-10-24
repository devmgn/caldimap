import type { Store, StoresData } from "../../../../types/stores-data";
import { eq, max } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { toSale } from "./utils/to-sale";
import { getDb } from "../../get-db";
import { sales } from "../../schema/sales";
import { scrapeLogs } from "../../schema/scrape-logs";
import { stores } from "../../schema/stores";

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

  const db = getDb();

  const [rows, [latestScrape]] = await Promise.all([
    db
      .select({
        id: stores.id,
        name: stores.name,
        address: stores.address,
        lat: stores.lat,
        lng: stores.lng,
        url: stores.url,
        services: stores.services,
        saleId: sales.id,
        saleType: sales.type,
        saleStatus: sales.status,
        saleStartDate: sales.startDate,
        saleEndDate: sales.endDate,
        saleDetail: sales.detail,
      })
      .from(stores)
      .leftJoin(sales, eq(stores.id, sales.storeId)),
    db.select({ scrapedAt: max(scrapeLogs.scrapedAt) }).from(scrapeLogs),
  ]);

  if (rows.length === 0) {
    return null;
  }

  const storeMap = new Map<string, Store>();

  for (const row of rows) {
    const existing = storeMap.get(row.id);

    const store = existing ?? {
      id: row.id,
      name: row.name,
      address: row.address,
      lat: row.lat,
      lng: row.lng,
      url: row.url,
      services: row.services,
      sales: [],
    };

    if (!existing) {
      storeMap.set(row.id, store);
    }

    const sale = toSale(row);

    if (sale !== null) {
      store.sales.push(sale);
    }
  }

  return {
    updatedAt: latestScrape?.scrapedAt?.toISOString() ?? null,
    stores: [...storeMap.values()],
  };
}
