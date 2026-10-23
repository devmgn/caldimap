import type { StoresData } from "../../../../types/stores-data";
import { inArray, sql } from "drizzle-orm";
import { getDb } from "../../get-db";
import { sales } from "../../schema/sales";
import { stores } from "../../schema/stores";

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
