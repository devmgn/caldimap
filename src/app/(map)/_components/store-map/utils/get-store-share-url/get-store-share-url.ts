import { createSerializer } from "nuqs";
import { selectedStoreParsers } from "../../../../_hooks/use-selected-store";

const serialize = createSerializer(selectedStoreParsers);

/**
 * Builds the link that opens the map on a store's popup. Carries only the
 * store, not the sender's filters, so the recipient sees the full map.
 *
 * @param storeId - The store to open
 * @param origin - The site origin, e.g. `window.location.origin`
 * @returns The share URL
 */
export function getStoreShareUrl(storeId: string, origin: string): string {
  return serialize(new URL("/", origin), { store: storeId });
}
