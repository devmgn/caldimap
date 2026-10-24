"use client";

import type { Store } from "../../../../../../types/stores-data";
import { DomEvent } from "leaflet";
import { CircleMarker, useMap } from "react-leaflet";
import { useSelectedStore } from "../../../../_hooks/use-selected-store";

interface StoreMarkerProps {
  store: Store;
  color: string;
}

/**
 * Store marker colored by its sales. Clicking it pans to the store and selects
 * it, which opens its popup through `?store=`.
 *
 * @param props - The store and its marker color
 * @returns The marker
 */
export function StoreMarker({ store, color }: StoreMarkerProps) {
  const map = useMap();
  const { selectStore } = useSelectedStore();

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
        // Leaflet closes an open popup on the map's synthetic preclick, and the
        // selected store's popup isn't bound to this marker to block it. Without
        // this, clicking the open store's marker would close its popup for good
        preclick: (event) => {
          DomEvent.stopPropagation(event);
        },
        click: () => {
          map.panTo([store.lat, store.lng]);
          selectStore(store.id);
        },
      }}
    />
  );
}
