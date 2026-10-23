"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

const DEFAULT_ZOOM = 16;

// sonarjs treats this as a function name because this side-effect-only component returns no JSX
// oxlint-disable-next-line sonarjs/function-name
function FlyToPosition({
  position,
}: {
  position: { lat: number; lng: number };
}) {
  const map = useMap();

  // `position` is set once when geolocation resolves, so this moves the map once
  useEffect(() => {
    map.setView(position, DEFAULT_ZOOM);
  }, [map, position]);

  return null;
}

export { FlyToPosition };
