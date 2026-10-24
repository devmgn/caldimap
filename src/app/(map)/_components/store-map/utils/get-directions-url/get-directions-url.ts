import type { Store } from "../../../../../../types/stores-data";

const BRAND = "カルディコーヒーファーム";

/**
 * Builds a Google Maps directions link to a store. The destination is the
 * brand, store name, and address rather than the coordinates: those are
 * geocoded from the address and can sit a block away, while the search lands
 * on Google's listing for the store. Opens the Google Maps app on phones.
 *
 * @param store - The destination store
 * @returns The directions URL
 * @see https://developers.google.com/maps/documentation/urls/get-started#directions-action
 */
export function getDirectionsUrl(store: Store): string {
  const url = new URL("https://www.google.com/maps/dir/");

  url.searchParams.set("api", "1");
  url.searchParams.set(
    "destination",
    `${BRAND} ${store.name} ${store.address}`
  );

  return url.href;
}
