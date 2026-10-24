"use client";

import type { Store } from "../../../../types/stores-data";
import type { Map as LeafletMap } from "leaflet";
import { useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { ClusterMarker } from "./cluster-marker";
import { StoreMarker } from "./store-marker";
import { createStoreIndex } from "./utils/create-store-index";
import { useToday } from "../../_hooks/use-today";

// Render a margin around the viewport so markers don't pop in while panning
const BOUNDS_PADDING = 0.2;

interface StoreClustersProps {
  stores: Store[];
}

function getViewport(map: LeafletMap) {
  const bounds = map.getBounds().pad(BOUNDS_PADDING);

  return {
    bbox: [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ] satisfies [number, number, number, number],
    zoom: map.getZoom(),
  };
}

/**
 * Store markers, with nearby stores grouped into numbered clusters that split
 * as the map zooms in.
 *
 * @param props - The stores to show
 * @returns The clusters and markers in the current viewport
 */
export function StoreClusters({ stores }: StoreClustersProps) {
  const map = useMap();
  const [viewport, setViewport] = useState(() => getViewport(map));

  useMapEvents({
    moveend: () => {
      setViewport(getViewport(map));
    },
  });

  const today = useToday();
  // Rebuilt when the day changes, so marker colors roll over with the popups
  // and the filter. The map renders only in the browser, so `today` is set
  const index = createStoreIndex(stores, today ?? undefined);
  const features = index.getClusters(viewport.bbox, viewport.zoom);

  return (
    <>
      {features.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const { properties } = feature;

        if ("cluster" in properties) {
          const id = properties.cluster_id;
          const expansionZoom = index.getClusterExpansionZoom(id);

          // A cluster that splits only past the map's deepest zoom can't be
          // zoomed apart, so list its stores instead
          const inseparableStores =
            expansionZoom > index.options.maxZoom
              ? index
                  .getLeaves(id, Infinity)
                  .map((leaf) => leaf.properties.store)
              : undefined;

          return (
            <ClusterMarker
              key={`cluster-${id}`}
              position={{ lat, lng }}
              count={properties.point_count}
              color={properties.color}
              expansionZoom={expansionZoom}
              inseparableStores={inseparableStores}
            />
          );
        }

        return (
          <StoreMarker
            key={properties.store.id}
            store={properties.store}
            color={properties.color}
          />
        );
      })}
    </>
  );
}
