import type { Store } from "../../../../../../types/stores-data";
import type { MarkerColor } from "../get-marker-color";
import Supercluster from "supercluster";
import { getMarkerColor, MARKER_COLOR_PRIORITY } from "../get-marker-color";
import { MAX_ZOOM } from "../map-config";

interface StorePointProps {
  store: Store;
  color: MarkerColor;
}

interface StoreClusterProps {
  color: MarkerColor;
}

function rank(color: MarkerColor) {
  return MARKER_COLOR_PRIORITY.indexOf(color);
}

/**
 * Builds a spatial index that groups nearby stores into clusters per zoom
 * level. Each cluster carries the most relevant marker color among its stores,
 * so running sales stay visible when zoomed out.
 *
 * @param stores - The stores to index
 * @param now - The current time (injectable for tests)
 * @returns The loaded index
 */
export function createStoreIndex(stores: Store[], now = new Date()) {
  const index = new Supercluster<StorePointProps, StoreClusterProps>({
    // In pixels; wide enough that the 36px cluster icons don't overlap
    radius: 60,
    // Keep clustering up to the map's deepest zoom, so stores too close to
    // split stay one cluster instead of overlapping markers
    maxZoom: MAX_ZOOM,
    map: ({ color }) => ({ color }),
    reduce: (accumulated, { color }) => {
      if (rank(color) < rank(accumulated.color)) {
        accumulated.color = color;
      }
    },
  });

  return index.load(
    stores.map((store) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [store.lng, store.lat] },
      properties: { store, color: getMarkerColor(store.sales, now) },
    }))
  );
}
