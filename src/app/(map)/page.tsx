import type { StoresData } from "../../types/stores-data";
import { Suspense } from "react";
import { MapPage } from "./_components/map-page";
import { getStoresWithSales } from "../../lib/db/queries/get-stores-with-sales";

export const dynamic = "force-dynamic";

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
 * Top page. Loads stores and sales from the DB and renders the map.
 *
 * @returns The store map page
 */
export default async function Home() {
  const data = await loadStoresData();

  return (
    <Suspense>
      <MapPage data={data} />
    </Suspense>
  );
}
