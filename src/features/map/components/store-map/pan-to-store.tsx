"use client";

import type { Store } from "../../types";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

// sonarjs treats this as a function name because this side-effect-only component returns no JSX
// oxlint-disable-next-line sonarjs/function-name
function PanToStore({ store }: { store: Store | null }) {
  const map = useMap();

  useEffect(() => {
    if (store) {
      map.panTo([store.lat, store.lng]);
    }
  }, [map, store]);

  return null;
}

export { PanToStore };
