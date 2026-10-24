import type { LatLng } from "../../../../types/stores-data";
import { z } from "zod";
import { simplifyAddress } from "./utils/simplify-address";

const gsiGeocodeResponseSchema = z.array(
  z.object({
    geometry: z.object({
      // [lng, lat]
      coordinates: z.tuple([z.number(), z.number()]),
    }),
  })
);

const TIMEOUT_MS = 10_000;

// Generous bounds around Japan, including remote islands; a match outside is a
// wrong hit, not the store
const JAPAN_BOUNDS = { minLat: 20, maxLat: 46, minLng: 122, maxLng: 154 };

function isInJapan({ lat, lng }: LatLng): boolean {
  return (
    lat >= JAPAN_BOUNDS.minLat &&
    lat <= JAPAN_BOUNDS.maxLat &&
    lng >= JAPAN_BOUNDS.minLng &&
    lng <= JAPAN_BOUNDS.maxLng
  );
}

async function fetchGsi(address: string): Promise<LatLng | null> {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`;
  let res: Response;

  // A failed lookup only skips this store; the caller retries or gives up on it
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    console.warn(`GSI request failed: ${String(error)} for ${address}`);

    return null;
  }

  if (!res.ok) {
    console.warn(`GSI request failed: ${res.status} for ${address}`);

    return null;
  }

  const parsed = gsiGeocodeResponseSchema.safeParse(await res.json());

  if (!parsed.success || parsed.data.length === 0) {
    return null;
  }

  const [lng, lat] = parsed.data[0].geometry.coordinates;
  const coords = { lat, lng };

  if (!isInJapan(coords)) {
    console.warn(`GSI returned coordinates outside Japan for ${address}`);

    return null;
  }

  return coords;
}

/**
 * Geocodes an address with the GSI address search API. When the lookup fails,
 * retries once without the Kyoto street-name notation.
 *
 * @param address - The store address
 * @returns The coordinates, or `null` when neither lookup matched
 */
export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const result = await fetchGsi(address);

  if (result) {
    return result;
  }

  const simplified = simplifyAddress(address);

  if (simplified !== null) {
    console.warn(`Retrying with simplified address: ${simplified}`);
    const retry = await fetchGsi(simplified);

    if (retry) {
      return retry;
    }
  }

  console.warn(`Geocoding failed for: ${address}`);

  return null;
}
