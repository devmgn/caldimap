"use client";

import type { Store } from "../../../../types/stores-data";
import { MapContainer, TileLayer } from "react-leaflet";
import { CurrentLocation } from "./current-location";
import { StoreClusters } from "./store-clusters";
import { JAPAN_CENTER, JAPAN_ZOOM, MAX_ZOOM } from "./utils/map-config";

interface StoreMapProps {
  stores: Store[];
}

/**
 * Leaflet map of the stores, clustered by proximity and centered on the user
 * once geolocation resolves.
 *
 * @param props - The stores to show
 * @returns The map
 */
export function StoreMap({ stores }: StoreMapProps) {
  return (
    <MapContainer
      center={[JAPAN_CENTER.lat, JAPAN_CENTER.lng]}
      zoom={JAPAN_ZOOM}
      maxZoom={MAX_ZOOM}
      zoomControl={false}
      attributionControl
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CurrentLocation />
      <StoreClusters stores={stores} />
    </MapContainer>
  );
}
