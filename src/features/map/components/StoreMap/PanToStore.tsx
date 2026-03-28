"use client";

import type { Store } from "../../types";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

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
