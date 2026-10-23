"use client";

import { useCallback } from "react";
import { useMap } from "react-leaflet";

const DEFAULT_ZOOM = 16;

function MyLocationButton({
  position,
}: {
  position: { lat: number; lng: number };
}) {
  const map = useMap();

  const handleClick = useCallback(() => {
    map.setView(position, DEFAULT_ZOOM);
  }, [map, position]);

  return (
    <button
      type="button"
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
    </button>
  );
}

export { MyLocationButton };
