"use client";

import type { LatLng, Store } from "../../../../../../types/stores-data";
import { useEffect, useEffectEvent, useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { DEFAULT_ZOOM } from "../../utils/map-config";
import { CurrentLocationMarker } from "../current-location-marker";
import { MyLocationButton } from "../my-location-button";

interface CurrentLocationProps {
  /** The user's position, or `null` while unknown. */
  position: LatLng | null;
  /** The open store, if any; an unknown `?store=` ID resolves to `null`. */
  selectedStore: Store | null;
}

/**
 * Moves the map to the user's position when it arrives after the map opened on
 * Japan, as long as nothing has moved the map since, then marks it and offers a
 * button to return to it. Renders nothing while the position is unknown.
 *
 * @param props - The user's position, and the open store, which keeps the
 *   view where it is
 * @returns The marker and button, or `null` before the position resolves
 */
export function CurrentLocation({
  position,
  selectedStore,
}: CurrentLocationProps) {
  const map = useMap();
  // Mounts with the map, so this is the position the map opened on, if any
  const initialPosition = useRef(position);
  // A shared store the map opened on, or a drag, zoom, search, or popup since,
  // leaves a view the user chose, which a late position must not throw away
  const viewChosen = useRef(selectedStore !== null);

  useMapEvents({
    movestart() {
      viewChosen.current = true;
    },
  });

  // Reads the selection when the position arrives, not when the effect starts:
  // a store picked meanwhile keeps the view
  const onLocated = useEffectEvent((next: LatLng) => {
    if (
      next !== initialPosition.current &&
      !viewChosen.current &&
      selectedStore === null
    ) {
      map.setView(next, DEFAULT_ZOOM);
    }
  });

  useEffect(() => {
    if (position !== null) {
      onLocated(position);
    }
  }, [position]);

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
