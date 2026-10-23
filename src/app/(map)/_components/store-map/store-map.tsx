"use client";

import type { LatLng, Store } from "../../../../types/stores-data";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { CurrentLocationMarker } from "./current-location-marker";
import { FlyToPosition } from "./fly-to-position";
import { MyLocationButton } from "./my-location-button";
import { PanToStore } from "./pan-to-store";
import { StoreMarker } from "./store-marker";
import { JAPAN_CENTER, JAPAN_ZOOM } from "./utils/map-config";

interface StoreMapProps {
  stores: Store[];
}

const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 10_000,
  maximumAge: 600_000,
};

function useCurrentPosition() {
  const [position, setPosition] = useState<LatLng | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    // Denied, unavailable, or timed out: keep the Japan view
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      null,
      GEOLOCATION_OPTIONS
    );
  }, []);

  return position;
}

function StoreMap({ stores }: StoreMapProps) {
  const currentPosition = useCurrentPosition();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  return (
    <MapContainer
      center={[JAPAN_CENTER.lat, JAPAN_CENTER.lng]}
      zoom={JAPAN_ZOOM}
      zoomControl={false}
      attributionControl
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <PanToStore store={selectedStore} />
      {currentPosition && (
        <>
          <FlyToPosition position={currentPosition} />
          <CurrentLocationMarker position={currentPosition} />
          <MyLocationButton position={currentPosition} />
        </>
      )}
      {stores.map((store) => (
        <StoreMarker key={store.id} store={store} onSelect={setSelectedStore} />
      ))}
    </MapContainer>
  );
}

export { StoreMap };
