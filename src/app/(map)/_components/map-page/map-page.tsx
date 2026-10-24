"use client";

import type { Store, StoresData } from "../../../../types/stores-data";
import type { PeriodFilter } from "../../_hooks/use-sale-filter";
import type { Map as LeafletMap } from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useCurrentPosition } from "../../_hooks/use-current-position";
import { useSaleFilter } from "../../_hooks/use-sale-filter";
import { useSelectedStore } from "../../_hooks/use-selected-store";
import { useToday } from "../../_hooks/use-today";
import { toastManager } from "../../_lib/toast-manager";
import { ToastProvider } from "../../_providers/toast-provider";
import { SaleFilter } from "../sale-filter";
import { DEFAULT_ZOOM } from "../store-map/utils/map-config";
import { StoreSearch } from "../store-search";

// Leaflet's own container background, so the map's area isn't blank while it
// loads or waits for its first view
function MapPlaceholder() {
  return <div className="size-full bg-[#ddd]" />;
}

// Leaflet touches `window` on import, so load the map only in the browser
const StoreMap = dynamic(
  async () => {
    const mod = await import("../store-map");

    return { default: mod.StoreMap };
  },
  { ssr: false, loading: () => <MapPlaceholder /> }
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
    revealStore,
  } = useSaleFilter(data.stores);

  const { storeId, selectStore, closeStore } = useSelectedStore();
  const [map, setMap] = useState<LeafletMap | null>(null);

  // Unknown IDs (e.g. a store that has since closed) select nothing
  const selectedStore =
    data.stores.find((store) => store.id === storeId) ?? null;

  // Requested here rather than in the map, so the wait overlaps loading
  // Leaflet. The map opens once its first view is known: on the shared store,
  // or on the user's position instead of Japan followed by a jump. Once open
  // it stays, since hiding it again would rebuild it at another view
  const { position, settled } = useCurrentPosition();
  const [mapOpened, setMapOpened] = useState(false);

  if (!mapOpened && (selectedStore !== null || settled)) {
    setMapOpened(true);
  }

  // A popup over a store the filter hides has no marker under it, which reads
  // as a glitch. Search ignores the filter on purpose, so clear what hides the
  // store instead, and say so
  function showStore(store: Store) {
    if (revealStore(store)) {
      toastManager.add({ description: "絞り込みを解除しました" });
    }
  }

  function handleSearchSelect(store: Store) {
    // setView jumps straight there (animating only short zooms); flyTo's
    // zoom-out-and-back takes seconds for a store across the country
    map?.setView([store.lat, store.lng], Math.max(map.getZoom(), DEFAULT_ZOOM));
    selectStore(store.id);
    showStore(store);
  }

  // The user narrowed the map on purpose, so a popup their new filter hides
  // closes rather than undoing the filter
  function handleSalesChange(next: string[]) {
    changeSales(next);

    if (
      selectedStore !== null &&
      hides(selectedStore, { selectedSales: next })
    ) {
      closeStore(selectedStore.id);
    }
  }

  function handlePeriodChange(next: PeriodFilter) {
    changePeriod(next);

    if (selectedStore !== null && hides(selectedStore, { period: next })) {
      closeStore(selectedStore.id);
    }
  }

  // The URL the page opened with may select a store its filter hides, or one
  // that no longer exists. Settle that once, after hydration: the period check
  // needs the browser's "today", and the toast provider is listening by then
  const todayKnown = useToday() !== null;
  const openedUrlSettled = useRef(false);

  const settleOpenedUrl = useEffectEvent(() => {
    if (selectedStore !== null) {
      showStore(selectedStore);
    } else if (storeId !== null) {
      closeStore(storeId);
    }
  });

  useEffect(() => {
    if (!todayKnown || openedUrlSettled.current) {
      return;
    }

    openedUrlSettled.current = true;
    settleOpenedUrl();
  }, [todayKnown]);

  return (
    <ToastProvider>
      <div className="relative h-dvh w-full">
        {mapOpened ? (
          <StoreMap
            stores={filteredStores}
            selectedStore={selectedStore}
            position={position}
            onMapReady={setMap}
          />
        ) : (
          <MapPlaceholder />
        )}
        <div className="absolute top-4 left-4 z-1000 flex w-56 flex-col gap-2">
          <StoreSearch stores={data.stores} onSelect={handleSearchSelect} />
          <SaleFilter
            saleTypes={saleTypes}
            selectedSales={selectedSales}
            onSalesChange={handleSalesChange}
            period={period}
            onPeriodChange={handlePeriodChange}
            totalCount={data.stores.length}
            filteredCount={filteredStores.length}
            updatedAt={data.updatedAt}
          />
        </div>
      </div>
    </ToastProvider>
  );
}
