"use client";

import type { Store, StoresData } from "../../../../types/stores-data";
import type { Map as LeafletMap } from "leaflet";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useSaleFilter } from "../../_hooks/use-sale-filter";
import { useSelectedStore } from "../../_hooks/use-selected-store";
import { toastManager } from "../../_lib/toast-manager";
import { ToastProvider } from "../../_providers/toast-provider";
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
    changeSales,
    period,
    changePeriod,
    filteredStores,
    hides,
    clearFilters,
  } = useSaleFilter(data.stores);

  const { storeId, selectStore, closeStore } = useSelectedStore();
  const [map, setMap] = useState<LeafletMap | null>(null);

  // Unknown IDs (e.g. a store that has since closed) select nothing
  const selectedStore =
    data.stores.find((store) => store.id === storeId) ?? null;

  // A popup over a store the filter hides has no marker under it, which reads
  // as a glitch. Search ignores the filter on purpose, so clear the filter
  // instead, and say so
  function revealStore(store: Store) {
    if (hides(store)) {
      clearFilters();
      toastManager.add({ description: "絞り込みを解除しました" });
    }
  }

  function handleSearchSelect(store: Store) {
    // setView jumps straight there (animating only short zooms); flyTo's
    // zoom-out-and-back takes seconds for a store across the country
    map?.setView([store.lat, store.lng], Math.max(map.getZoom(), DEFAULT_ZOOM));
    selectStore(store.id);
    revealStore(store);
  }

  // Runs once, with the URL the page opened with
  function handleMapLoad() {
    if (selectedStore !== null) {
      revealStore(selectedStore);

      return;
    }

    // A link to a store that no longer exists drops its dead ID
    if (storeId !== null) {
      closeStore(storeId);
    }
  }

  return (
    <ToastProvider>
      <div className="relative h-dvh w-full">
        <StoreMap
          stores={filteredStores}
          selectedStore={selectedStore}
          onMapReady={setMap}
          onLoad={handleMapLoad}
        />
        <div className="absolute top-4 left-4 z-1000 flex w-56 flex-col gap-2">
          <StoreSearch stores={data.stores} onSelect={handleSearchSelect} />
          <SaleFilter
            saleTypes={saleTypes}
            selectedSales={selectedSales}
            onSalesChange={changeSales}
            period={period}
            onPeriodChange={changePeriod}
            totalCount={data.stores.length}
            filteredCount={filteredStores.length}
            updatedAt={data.updatedAt}
          />
        </div>
      </div>
    </ToastProvider>
  );
}
