import type { Sale, Store, StoresData } from "../../features/map/types";
import { eq, inArray, sql } from "drizzle-orm";
import { getDb } from "..";
import { sales } from "../schema/sales";
import { scrapeLogs } from "../schema/scrape-logs";
import { stores } from "../schema/stores";

/**
 * Sale columns of a store row left-joined with sales. All null when the store
 * has no sale.
 */
interface SaleColumns {
  saleId: number | null;
  saleType: string | null;
  saleStatus: string | null;
  saleStartDate: string | null;
  saleEndDate: string | null;
  saleDetail: string | null;
}

function toSale(row: SaleColumns): Sale | null {
  const {
    saleId,
    saleType,
    saleStatus,
    saleStartDate,
    saleEndDate,
    saleDetail,
  } = row;

  if (saleId === null || saleType === null || saleStatus === null) {
    return null;
  }

  if (saleStartDate === null || saleEndDate === null || saleDetail === null) {
    return null;
  }

  return {
    type: saleType,
    status: saleStatus,
    startDate: saleStartDate,
    endDate: saleEndDate,
    detail: saleDetail,
  };
}

/**
 * Loads every store with its sales.
 *
 * @returns Stores with their sales
 */
export async function getStoresWithSales(): Promise<StoresData | null> {
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

/**
 * Loads the coordinates already stored in the DB so that scraping can skip
 * geocoding them.
 *
 * @returns Coordinates keyed by store ID
 */
export async function getStoreCoordsCache(): Promise<
  Map<string, { lat: number; lng: number }>
> {
  const db = getDb();

  const rows = await db
    .select({ id: stores.id, lat: stores.lat, lng: stores.lng })
    .from(stores);

  const cache = new Map<string, { lat: number; lng: number }>();

  for (const row of rows) {
    cache.set(row.id, { lat: row.lat, lng: row.lng });
  }

  return cache;
}

/**
 * Upserts stores and replaces their sales with the scraped ones.
 *
 * @param data - The scraped stores and sales
 */
export async function upsertStoresAndSales(data: StoresData): Promise<void> {
  const storeList = data.stores;

  // Flatten sales with storeId
  const saleList = storeList.flatMap((s) =>
    s.sales.map((sale) => ({ ...sale, storeId: s.id }))
  );

  const db = getDb();
  await db.transaction(async (tx) => {
    // Upsert stores
    if (storeList.length > 0) {
      await tx
        .insert(stores)
        .values(
          storeList.map((s) => ({
            id: s.id,
            name: s.name,
            address: s.address,
            lat: s.lat,
            lng: s.lng,
            url: s.url,
            services: s.services,
            updatedAt: new Date(),
          }))
        )
        .onConflictDoUpdate({
          target: stores.id,
          set: {
            name: sql`excluded.name`,
            address: sql`excluded.address`,
            lat: sql`excluded.lat`,
            lng: sql`excluded.lng`,
            url: sql`excluded.url`,
            services: sql`excluded.services`,
            updatedAt: new Date(),
          },
        });
    }

    // Delete existing sales for these stores, then insert fresh
    const storeIds = storeList.map((s) => s.id);

    if (storeIds.length > 0) {
      await tx.delete(sales).where(inArray(sales.storeId, storeIds));
    }

    if (saleList.length > 0) {
      await tx.insert(sales).values(
        saleList.map((s) => ({
          storeId: s.storeId,
          type: s.type,
          status: s.status,
          startDate: s.startDate,
          endDate: s.endDate,
          detail: s.detail,
        }))
      );
    }
  });
}

/**
 * Records a scrape run.
 *
 * @param storeCount - Number of stores scraped
 */
export async function logScrape(storeCount: number): Promise<void> {
  await getDb().insert(scrapeLogs).values({ storeCount });
}
