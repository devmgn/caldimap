"use client";

import type { LatLng } from "../../../../types/stores-data";
import { CircleMarker, Pane } from "react-leaflet";

// Above the cluster markers (`markerPane`, 600) and below popups (`popupPane`, 700)
const PANE_Z_INDEX = 640;

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
    <Pane name="current-location" style={{ zIndex: PANE_Z_INDEX }}>
      <CircleMarker
        center={[position.lat, position.lng]}
        radius={6}
        // Lets clicks through to the cluster or store underneath
        interactive={false}
        pathOptions={{
          color: "white",
          weight: 3,
          fillColor: "#4285F4",
          fillOpacity: 1,
        }}
      />
    </Pane>
  );
}
