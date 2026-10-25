"use client";

import type { LatLng, Store } from "../../../../types/stores-data";
import type { Map as LeafletMap } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import { CurrentLocation } from "./components/current-location";
import { SelectedStorePopup } from "./components/selected-store-popup";
import { StoreClusters } from "./components/store-clusters";
import {
  DEFAULT_ZOOM,
  JAPAN_CENTER,
  JAPAN_ZOOM,
  MAX_ZOOM,
} from "./utils/map-config";

function getInitialView(selectedStore: Store | null, position: LatLng | null) {
  if (selectedStore !== null) {
    return { center: selectedStore, zoom: DEFAULT_ZOOM };
  }

  if (position !== null) {
    return { center: position, zoom: DEFAULT_ZOOM };
  }

  return { center: JAPAN_CENTER, zoom: JAPAN_ZOOM };
}

interface StoreMapProps {
  stores: Store[];
  /**
   * The store in `?store=`, looked up among all stores so filters can't hide
   * it.
   */
  selectedStore: Store | null;
  /** The user's position, or `null` while unknown. */
  position: LatLng | null;
  /** Receives the Leaflet map, so controls outside the map can move it. */
  onMapReady: (map: LeafletMap | null) => void;
}

/**
 * Leaflet map of the stores, clustered by proximity. Opens on the selected
 * store when the page loads with one (a shared link), otherwise on the user's
 * position if it is known yet, otherwise on Japan.
 *
 * @param props - The stores to show, the selected store, the user's position,
 *   and a callback for the Leaflet map
 * @returns The map
 */
export function StoreMap({
  stores,
  selectedStore,
  position,
  onMapReady,
}: StoreMapProps) {
  // Only read when the map is created; later selections move it explicitly
  const initialView = getInitialView(selectedStore, position);

  return (
    <MapContainer
      ref={onMapReady}
      center={[initialView.center.lat, initialView.center.lng]}
      zoom={initialView.zoom}
      maxZoom={MAX_ZOOM}
      zoomControl={false}
      attributionControl
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CurrentLocation position={position} selectedStore={selectedStore} />
      <StoreClusters stores={stores} />
      {selectedStore === null ? null : (
        <SelectedStorePopup key={selectedStore.id} store={selectedStore} />
      )}
    </MapContainer>
  );
}
