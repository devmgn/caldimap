"use client";

import type { LatLng } from "../../../../types/stores-data";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { DEFAULT_ZOOM } from "./utils/map-config";

// sonarjs treats this as a function name because this side-effect-only component returns no JSX
// oxlint-disable-next-line sonarjs/function-name
function FlyToPosition({ position }: { position: LatLng }) {
  const map = useMap();

  // `position` is set once when geolocation resolves, so this moves the map once
  useEffect(() => {
    map.setView(position, DEFAULT_ZOOM);
  }, [map, position]);

  return null;
}

export { FlyToPosition };
