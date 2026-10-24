"use client";

import type { LatLng } from "../../../../types/stores-data";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { CurrentLocationMarker } from "./current-location-marker";
import { MyLocationButton } from "./my-location-button";
import { DEFAULT_ZOOM } from "./utils/map-config";

const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 10_000,
  maximumAge: 600_000,
};

/**
 * Moves the map to the user's position once geolocation resolves, then marks it
 * and offers a button to return to it. Renders nothing while the position is
 * unknown.
 *
 * @returns The marker and button, or `null` before the position resolves
 */
export function CurrentLocation() {
  const map = useMap();
  const [position, setPosition] = useState<LatLng | null>(null);

  useEffect(() => {
    // getCurrentPosition can't be cancelled, so ignore a result that arrives
    // after unmount (the map may already be removed)
    let ignore = false;

    if ("geolocation" in navigator) {
      // Denied, unavailable, or timed out: keep the Japan view
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (ignore) {
            return;
          }

          const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };

          setPosition(next);
          map.setView(next, DEFAULT_ZOOM);
        },
        null,
        GEOLOCATION_OPTIONS
      );
    }

    return () => {
      ignore = true;
    };
  }, [map]);

  if (!position) {
    return null;
  }

  return (
    <>
      <CurrentLocationMarker position={position} />
      <MyLocationButton position={position} />
    </>
  );
}
