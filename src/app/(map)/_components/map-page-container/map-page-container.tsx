import type { StoresData } from "../../../../types/stores-data";
import { getStoresWithSales } from "../../../../lib/db/queries/get-stores-with-sales";
import { MapPage } from "../map-page";

const EMPTY_DATA: StoresData = { updatedAt: "", stores: [] };

/**
 * Renders the map with the cached stores data, which is prerendered into the
 * page. A DB error is not caught on purpose: during the build it fails the
 * deployment instead of shipping an empty map, and a failed background
 * revalidation keeps serving the previous data.
 *
 * @returns The store map page
 */
export async function MapPageContainer() {
  const data = (await getStoresWithSales()) ?? EMPTY_DATA;

  return <MapPage data={data} />;
}
