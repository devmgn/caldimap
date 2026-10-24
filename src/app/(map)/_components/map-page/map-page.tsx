"use client";

import type { StoresData } from "../../../../types/stores-data";
import dynamic from "next/dynamic";
import { useSaleFilter } from "../../_hooks/use-sale-filter";
import { SaleFilter } from "../sale-filter";

// Leaflet touches `window` on import, so load the map only in the browser
const StoreMap = dynamic(
  async () => {
    const mod = await import("../store-map");

    return { default: mod.StoreMap };
  },
  { ssr: false }
);

interface MapPageProps {
  data: StoresData;
}

/**
 * Store map with the sale filter overlaid. The filter state lives in the URL.
 *
 * @param props - The stores data
 * @returns The map page
 */
export function MapPage({ data }: MapPageProps) {
  const { saleTypes, selectedSales, toggleSale, filteredStores } =
    useSaleFilter(data.stores);

  return (
    <div className="relative h-dvh w-full">
      <StoreMap stores={filteredStores} />
      <div className="absolute top-4 left-4 z-1000 w-56">
        <SaleFilter
          saleTypes={saleTypes}
          selectedSales={selectedSales}
          onToggle={toggleSale}
          totalCount={data.stores.length}
          filteredCount={filteredStores.length}
        />
      </div>
    </div>
  );
}
