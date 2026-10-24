"use client";

import type { LatLng, Store } from "../../../../../../types/stores-data";
import { divIcon } from "leaflet";
import { Marker, Popup, useMap } from "react-leaflet";
import { StoreDetails } from "../store-details";

const ICON_SIZE = 36;

interface ClusterMarkerProps {
  position: LatLng;
  count: number;
  color: string;
  expansionZoom: number;
  /**
   * Set when the stores are too close to split even at the deepest zoom.
   * Clicking the cluster then lists them in a popup instead of zooming in.
   */
  inseparableStores?: Store[];
}

/**
 * Circle with the number of stores it groups. Clicking it zooms in until the
 * cluster splits, or lists the stores when they are too close to split.
 *
 * @param props - The cluster's position, store count, color, the zoom at which
 *   it splits, and the stores when they are too close to split
 * @returns The marker
 */
export function ClusterMarker({
  position,
  count,
  color,
  expansionZoom,
  inseparableStores,
}: ClusterMarkerProps) {
  const map = useMap();

  const icon = divIcon({
    // Replaces Leaflet's default `leaflet-div-icon` (white box with a border)
    className: "",
    // `count` is a number and `color` comes from MARKER_COLORS, so the HTML is safe
    html: `<div class="flex size-full items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-[0_1px_4px_rgba(0,0,0,0.3)]" style="background-color:${color}">${count}</div>`,
    iconSize: [ICON_SIZE, ICON_SIZE],
  });

  if (inseparableStores) {
    return (
      <Marker position={position} icon={icon} title={`${count}店舗`}>
        <Popup>
          <ul className="m-0 max-h-80 max-w-[250px] list-none divide-y divide-gray-200 overflow-y-auto p-1">
            {inseparableStores.map((store) => (
              <li key={store.id} className="py-2 first:pt-0 last:pb-0">
                <StoreDetails store={store} />
              </li>
            ))}
          </ul>
        </Popup>
      </Marker>
    );
  }

  return (
    <Marker
      position={position}
      icon={icon}
      title={`${count}店舗`}
      eventHandlers={{
        click: () => {
          map.setView(position, expansionZoom);
        },
      }}
    />
  );
}
