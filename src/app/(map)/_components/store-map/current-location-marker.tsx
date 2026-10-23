"use client";

import { CircleMarker } from "react-leaflet";

function CurrentLocationMarker({
  position,
}: {
  position: { lat: number; lng: number };
}) {
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
