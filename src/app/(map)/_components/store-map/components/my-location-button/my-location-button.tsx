"use client";

import type { LatLng } from "../../../../../../types/stores-data";
import { Button } from "@base-ui/react/button";
import { useMap } from "react-leaflet";
import { DEFAULT_ZOOM } from "../../utils/map-config";

interface MyLocationButtonProps {
  position: LatLng;
}

/**
 * Button that re-centers the map on the user's position.
 *
 * @param props - The user's position
 * @returns The button
 */
export function MyLocationButton({ position }: MyLocationButtonProps) {
  const map = useMap();

  function handleClick() {
    map.setView(position, DEFAULT_ZOOM);
  }

  return (
    <Button
      onClick={handleClick}
      aria-label="現在位置に戻る"
      className="absolute right-3 bottom-6 z-1000 flex size-10 cursor-pointer items-center justify-center rounded-full border-none bg-white shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
    >
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4285F4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" fill="#4285F4" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      </svg>
    </Button>
  );
}
