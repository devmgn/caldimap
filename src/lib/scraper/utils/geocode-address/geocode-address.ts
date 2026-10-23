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

async function fetchGsi(address: string): Promise<LatLng | null> {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`;
  const res = await fetch(url);

  // A failed lookup only skips this store; the caller retries or gives up on it
  if (!res.ok) {
    console.warn(`GSI request failed: ${res.status} for ${address}`);

    return null;
  }

  const parsed = gsiGeocodeResponseSchema.safeParse(await res.json());

  if (!parsed.success || parsed.data.length === 0) {
    return null;
  }

  const [lng, lat] = parsed.data[0].geometry.coordinates;

  return { lat, lng };
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
