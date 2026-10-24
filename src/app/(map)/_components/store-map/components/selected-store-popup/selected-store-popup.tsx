"use client";

import type { Store } from "../../../../../../types/stores-data";
import { Popup } from "react-leaflet";
import { useSelectedStore } from "../../../../_hooks/use-selected-store";
import { StoreDetails } from "../store-details";

// Lift the tip above the 10px store marker instead of covering its center
const POPUP_OFFSET: [number, number] = [0, -6];

interface SelectedStorePopupProps {
  store: Store;
}

/**
 * Popup of the store in `?store=`. It stands on its own at the store's
 * position rather than hanging off the marker, so it opens even when the store
 * is inside a cluster. (MapPage keeps the sale filter from hiding it.) Closing
 * it (×, Escape, or a click on the map) clears the parameter.
 *
 * @param props - The selected store
 * @returns The popup
 */
export function SelectedStorePopup({ store }: SelectedStorePopupProps) {
  const { closeStore } = useSelectedStore();

  return (
    <Popup
      // The store itself is a stable LatLng; a fresh tuple would re-run
      // react-leaflet's popup effect, removing the popup and closing the store
      position={store}
      offset={POPUP_OFFSET}
      // Selecting a store already centers it, and auto-pan would fight that move
      autoPan={false}
      eventHandlers={{
        remove: () => {
          closeStore(store.id);
        },
      }}
    >
      <div className="max-w-[250px] p-1">
        <StoreDetails store={store} />
      </div>
    </Popup>
  );
}
