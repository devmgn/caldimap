import type { CachedCoords } from "../../../../types/stores-data";
import { getDb } from "../../get-db";
import { stores } from "../../schema/stores";

/**
 * Loads the coordinates already stored in the DB so that scraping can skip
 * geocoding them.
 *
 * @returns Coordinates and the address they belong to, keyed by store ID
 */
export async function getStoreCoordsCache(): Promise<
  Map<string, CachedCoords>
> {
  const db = getDb();

  const rows = await db
    .select({
      id: stores.id,
      address: stores.address,
      lat: stores.lat,
      lng: stores.lng,
    })
    .from(stores);

  const cache = new Map<string, CachedCoords>();

  for (const row of rows) {
    cache.set(row.id, { address: row.address, lat: row.lat, lng: row.lng });
  }

  return cache;
}
