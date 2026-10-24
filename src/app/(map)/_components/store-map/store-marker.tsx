"use client";

import type { Store } from "../../../../types/stores-data";
import { CircleMarker, Popup, useMap } from "react-leaflet";
import { StoreDetails } from "./store-details";

interface StoreMarkerProps {
  store: Store;
  color: string;
}

/**
 * Store marker colored by its sales. Clicking it pans to the store and opens a
 * popup with the details.
 *
 * @param props - The store and its marker color
 * @returns The marker
 */
export function StoreMarker({ store, color }: StoreMarkerProps) {
  const map = useMap();

  return (
    <CircleMarker
      center={[store.lat, store.lng]}
      radius={10}
      pathOptions={{
        color: "white",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      }}
      eventHandlers={{
        click: () => {
          map.panTo([store.lat, store.lng]);
        },
      }}
    >
      {/* Popup auto-pan would cancel the `panTo` above; centering the store keeps the popup in view anyway */}
      <Popup autoPan={false}>
        <div className="max-w-[250px] p-1">
          <StoreDetails store={store} />
        </div>
      </Popup>
    </CircleMarker>
  );
}
