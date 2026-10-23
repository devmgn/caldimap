import type { Store, StoresData } from "../../../../types/stores-data";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { toSale } from "./utils/to-sale";
import { getDb } from "../../get-db";
import { sales } from "../../schema/sales";
import { stores } from "../../schema/stores";

/** Cache tag of the stores data; revalidate it after a scrape is saved. */
export const STORES_CACHE_TAG = "stores";

/**
 * Loads every store with its sales. Cached and prerendered into the page; the
 * cache is refreshed daily and when `/api/scrape` revalidates
 * {@link STORES_CACHE_TAG}. `updatedAt` is the time the cache entry was filled.
 *
 * @returns Stores with their sales, or `null` when the DB has no stores
 */
export async function getStoresWithSales(): Promise<StoresData | null> {
  "use cache";
  cacheTag(STORES_CACHE_TAG);
  cacheLife("days");

  const db = getDb();

  const rows = await db
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
    .leftJoin(sales, eq(stores.id, sales.storeId));

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
    updatedAt: new Date().toISOString(),
    stores: [...storeMap.values()],
  };
}
