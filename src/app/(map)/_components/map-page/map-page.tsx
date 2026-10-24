"use client";

import type { Store, StoresData } from "../../../../types/stores-data";
import type { Map as LeafletMap } from "leaflet";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useSaleFilter } from "../../_hooks/use-sale-filter";
import { useSelectedStore } from "../../_hooks/use-selected-store";
import { SaleFilter } from "../sale-filter";
import { DEFAULT_ZOOM } from "../store-map/utils/map-config";
import { StoreSearch } from "../store-search";

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
 * Store map with the store search and the sale filter overlaid. The filters
 * and the selected store live in the URL.
 *
 * @param props - The stores data
 * @returns The map page
 */
export function MapPage({ data }: MapPageProps) {
  const {
    saleTypes,
    selectedSales,
    toggleSale,
    period,
    changePeriod,
    filteredStores,
  } = useSaleFilter(data.stores);

  const { storeId, selectStore } = useSelectedStore();
  const [map, setMap] = useState<LeafletMap | null>(null);

  // Unknown IDs (e.g. a store that has since closed) select nothing
  const selectedStore =
    data.stores.find((store) => store.id === storeId) ?? null;

  function handleSearchSelect(store: Store) {
    // setView jumps straight there (animating only short zooms); flyTo's
    // zoom-out-and-back takes seconds for a store across the country
    map?.setView([store.lat, store.lng], Math.max(map.getZoom(), DEFAULT_ZOOM));
    selectStore(store.id);
  }

  return (
    <div className="relative h-dvh w-full">
      <StoreMap
        stores={filteredStores}
        selectedStore={selectedStore}
        onMapReady={setMap}
      />
      <div className="absolute top-4 left-4 z-1000 flex w-56 flex-col gap-2">
        <StoreSearch stores={data.stores} onSelect={handleSearchSelect} />
        <SaleFilter
          saleTypes={saleTypes}
          selectedSales={selectedSales}
          onToggle={toggleSale}
          period={period}
          onPeriodChange={changePeriod}
          totalCount={data.stores.length}
          filteredCount={filteredStores.length}
          updatedAt={data.updatedAt}
        />
      </div>
    </div>
  );
}
