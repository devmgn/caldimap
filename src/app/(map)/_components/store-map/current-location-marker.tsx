"use client";

import type { LatLng } from "../../../../types/stores-data";
import { CircleMarker } from "react-leaflet";

function CurrentLocationMarker({ position }: { position: LatLng }) {
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

export { CurrentLocationMarker };
