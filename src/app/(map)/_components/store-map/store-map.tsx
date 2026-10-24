"use client";

import type { Store } from "../../../../types/stores-data";
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

interface StoreMapProps {
  stores: Store[];
  /**
   * The store in `?store=`, looked up among all stores so filters can't hide
   * it.
   */
  selectedStore: Store | null;
  /** Receives the Leaflet map, so controls outside the map can move it. */
  onMapReady: (map: LeafletMap | null) => void;
  /** Runs once, when the map is created, with the state the page opened with. */
  onLoad: () => void;
}

/**
 * Leaflet map of the stores, clustered by proximity. Opens on the selected
 * store when the page loads with one (a shared link), otherwise centers on the
 * user once geolocation resolves.
 *
 * @param props - The stores to show, the selected store, a callback for the
 *   Leaflet map, and one for when it loads
 * @returns The map
 */
export function StoreMap({
  stores,
  selectedStore,
  onMapReady,
  onLoad,
}: StoreMapProps) {
  // Only read when the map is created; later selections move it explicitly
  const initialView =
    selectedStore === null
      ? { center: JAPAN_CENTER, zoom: JAPAN_ZOOM }
      : { center: selectedStore, zoom: DEFAULT_ZOOM };

  return (
    <MapContainer
      ref={onMapReady}
      // Leaflet calls it once, when the map is created
      whenReady={onLoad}
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
      <CurrentLocation selectedStore={selectedStore} />
      <StoreClusters stores={stores} />
      {selectedStore === null ? null : (
        <SelectedStorePopup key={selectedStore.id} store={selectedStore} />
      )}
    </MapContainer>
  );
}
