import type { StoresData } from "../../../../types/stores-data";
import { count, inArray, notInArray, sql } from "drizzle-orm";
import { shouldDeleteUnlistedStores } from "./utils/should-delete-unlisted-stores";
import { getDb } from "../../get-db";
import { sales } from "../../schema/sales";
import { stores } from "../../schema/stores";

/**
 * Upserts stores and replaces their sales with the scraped ones. When
 * `listedStoreIds` is given, stores missing from it are treated as closed and
 * deleted with their sales, unless the list looks incomplete.
 *
 * @param data - The scraped stores and sales
 * @param listedStoreIds - Every store ID on the scraped store list, including
 *   stores that could not be geocoded
 */
export async function upsertStoresAndSales(
  data: StoresData,
  listedStoreIds?: string[]
): Promise<void> {
  const storeList = data.stores;

  // Flatten sales with storeId
  const saleList = storeList.flatMap((s) =>
    s.sales.map((sale) => ({ ...sale, storeId: s.id }))
  );

  const db = getDb();
  await db.transaction(async (tx) => {
    if (listedStoreIds !== undefined) {
      const [{ value: currentCount }] = await tx
        .select({ value: count() })
        .from(stores);

      if (shouldDeleteUnlistedStores(listedStoreIds.length, currentCount)) {
        // Sales are removed by the foreign key's ON DELETE CASCADE
        const deleted = await tx
          .delete(stores)
          .where(notInArray(stores.id, listedStoreIds))
          .returning({ id: stores.id });

        if (deleted.length > 0) {
          console.warn(
            `Deleted ${deleted.length} closed stores: ${deleted.map((d) => d.id).join(", ")}`
          );
        }
      } else {
        console.warn(
          `Skipped deleting closed stores: only ${listedStoreIds.length} of ${currentCount} stores are listed`
        );
      }
    }

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
