import type { Store, StoresData } from "../../../../../../types/stores-data";
import type { DbSchema } from "../../../../get-db";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { eq, max } from "drizzle-orm";
import { sales } from "../../../../schema/sales";
import { scrapeLogs } from "../../../../schema/scrape-logs";
import { stores } from "../../../../schema/stores";
import { toSale } from "../to-sale";

/** The app's database on any Postgres driver: postgres-js, or PGlite in tests. */
type AppDatabase = PgDatabase<PgQueryResultHKT, DbSchema>;

/**
 * Reads every store with its sales, and the time of the latest recorded scrape
 * as `updatedAt`.
 *
 * @param db - The database to read
 * @returns Stores with their sales, or `null` when the DB has no stores
 */
export async function selectStoresWithSales(
  db: AppDatabase
): Promise<StoresData | null> {
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
