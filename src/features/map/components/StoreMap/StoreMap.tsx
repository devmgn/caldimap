"use client";

import type { Store } from "../../types";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { CurrentLocationMarker } from "./CurrentLocationMarker";
import { MyLocationButton } from "./MyLocationButton";
import { PanToStore } from "./PanToStore";
import { StoreMarker } from "./StoreMarker";

interface StoreMapProps {
  stores: Store[];
}

const JAPAN_CENTER = { lat: 36.5, lng: 137.5 } as const;
const DEFAULT_ZOOM = 16;
const FALLBACK_ZOOM = 14;

function useCurrentPosition() {
  const [position, setPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      queueMicrotask(() => {
        setResolved(true);
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setResolved(true);
      },
      () => {
        setResolved(true);
      },
    );
  }, []);

  return { position, resolved };
}

function StoreMap({ stores }: StoreMapProps) {
  const { position: currentPosition, resolved } = useCurrentPosition();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  if (!resolved) {
    return null;
  }

  const center = currentPosition ?? JAPAN_CENTER;
  const zoom = currentPosition ? DEFAULT_ZOOM : FALLBACK_ZOOM;

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
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
