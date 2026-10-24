"use client";

import type { LatLng } from "../../../../types/stores-data";
import { CircleMarker } from "react-leaflet";

interface CurrentLocationMarkerProps {
  position: LatLng;
}

/**
 * Blue dot marking the user's position.
 *
 * @param props - The user's position
 * @returns The marker
 */
export function CurrentLocationMarker({
  position,
}: CurrentLocationMarkerProps) {
  return (
    <CircleMarker
      center={[position.lat, position.lng]}
      radius={6}
      pathOptions={{
        color: "white",
        weight: 3,
        fillColor: "#4285F4",
        fillOpacity: 1,
      }}
    />
  );
}
