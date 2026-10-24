"use client";

import { parseAsString, useQueryState } from "nuqs";

/**
 * Parser of the `store` query parameter, the ID of the store whose popup is
 * open. Shared with the share-link builder so both read and write it alike.
 */
export const selectedStoreParsers = { store: parseAsString };

/**
 * The store whose popup is open, backed by the `store` query parameter so the
 * URL can be shared. Updates replace the history entry, so Back doesn't step
 * through every popup.
 *
 * @returns The selected store ID, a function to select a store, and one to
 *   close a store's popup
 */
export function useSelectedStore() {
  const [storeId, setStoreId] = useQueryState(
    "store",
    selectedStoreParsers.store
  );

  function selectStore(id: string) {
    void setStoreId(id);
  }

  // Leaflet removes the previous popup when another store is selected, so only
  // clear the parameter if it still points at the closing store
  function closeStore(id: string) {
    void setStoreId((current) => (current === id ? null : current));
  }

  return { storeId, selectStore, closeStore };
}
