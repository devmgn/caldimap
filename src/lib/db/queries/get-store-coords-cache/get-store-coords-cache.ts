import { getDb } from "../../get-db";
import { stores } from "../../schema/stores";

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
