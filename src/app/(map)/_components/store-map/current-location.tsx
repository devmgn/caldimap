"use client";

import type { LatLng, Store } from "../../../../types/stores-data";
import { useEffect, useEffectEvent, useState } from "react";
import { useMap } from "react-leaflet";
import { CurrentLocationMarker } from "./current-location-marker";
import { MyLocationButton } from "./my-location-button";
import { DEFAULT_ZOOM } from "./utils/map-config";

const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 10_000,
  maximumAge: 600_000,
};

interface CurrentLocationProps {
  /** The open store, if any; an unknown `?store=` ID resolves to `null`. */
  selectedStore: Store | null;
}

/**
 * Moves the map to the user's position once geolocation resolves, unless a
 * store is open, then marks it and offers a button to return to it. Renders
 * nothing while the position is unknown.
 *
 * @param props - The open store, which keeps the view where it is
 * @returns The marker and button, or `null` before the position resolves
 */
export function CurrentLocation({ selectedStore }: CurrentLocationProps) {
  const map = useMap();
  const [position, setPosition] = useState<LatLng | null>(null);

  // Reads the selection when the position arrives, not when the effect starts:
  // a store opened from a shared link or picked meanwhile keeps the view
  const onLocated = useEffectEvent((next: LatLng) => {
    setPosition(next);

    if (selectedStore === null) {
      map.setView(next, DEFAULT_ZOOM);
    }
  });

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

          onLocated({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        null,
        GEOLOCATION_OPTIONS
      );
    }

    return () => {
      ignore = true;
    };
  }, []);

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
