import type { Store } from "../../../../types/stores-data";
import type { RawSale } from "../parse-sales-page";
import type { RawStore } from "../parse-stores-page";

/**
 * Attaches coordinates and sales to the listed stores. Stores without
 * coordinates are dropped, since they cannot be placed on the map.
 *
 * @param rawStores - Stores from the store list
 * @param sales - Sales from the sale list
 * @param coords - Coordinates keyed by store ID
 * @returns Stores with coordinates and their sales
 */
export function mergeStoresAndSales(
  rawStores: RawStore[],
  sales: RawSale[],
  coords: Map<string, { lat: number; lng: number }>
): Store[] {
  const salesByStore = new Map<string, RawSale[]>();

  for (const sale of sales) {
    const list = salesByStore.get(sale.storeId) ?? [];
    list.push(sale);
    salesByStore.set(sale.storeId, list);
  }

  return rawStores.flatMap((raw) => {
    const storeCoords = coords.get(raw.id);

    if (!storeCoords) {
      return [];
    }

    const storeSales = salesByStore.get(raw.id) ?? [];

    return {
      id: raw.id,
      name: raw.name,
      address: raw.address,
      lat: storeCoords.lat,
      lng: storeCoords.lng,
      url: raw.url,
      services: raw.services,
      sales: storeSales.map((s) => ({
        type: s.type,
        status: s.status,
        startDate: s.startDate,
        endDate: s.endDate,
        detail: s.detail,
      })),
    };
  });
}
