import type { StoresData } from "../../../../types/stores-data";
import { connection } from "next/server";
import { getStoresWithSales } from "../../../../lib/db/queries/get-stores-with-sales";
import { MapPage } from "../map-page";

const EMPTY_DATA: StoresData = { updatedAt: "", stores: [] };

async function loadStoresData(): Promise<StoresData> {
  try {
    return (await getStoresWithSales()) ?? EMPTY_DATA;
  } catch {
    // Render an empty map instead of failing the page when the DB is unreachable
    return EMPTY_DATA;
  }
}

/**
 * Loads stores and sales from the DB at request time and renders the map.
 * `connection()` keeps the DB query out of the prerendered shell, so the page
 * always shows the latest scrape.
 *
 * @returns The store map page
 */
export async function MapPageContainer() {
  await connection();
  const data = await loadStoresData();

  return <MapPage data={data} />;
}
