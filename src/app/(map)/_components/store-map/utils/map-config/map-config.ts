import type { LatLng } from "../../../../../../types/stores-data";

/**
 * Initial view showing all of Japan, used until (or unless) geolocation
 * resolves.
 */
export const JAPAN_CENTER = { lat: 36.5, lng: 137.5 } as const satisfies LatLng;

/** Zoom level of the initial whole-Japan view. */
export const JAPAN_ZOOM = 5;

/** Zoom level used when centering on the user's position. */
export const DEFAULT_ZOOM = 16;
