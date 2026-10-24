import type { Store } from "../../../../../../types/stores-data";
import { normalizeSearchText } from "../normalize-search-text";

const WHITESPACE = /\s+/u;

/**
 * Prepares a search over store names and addresses. The text is normalized
 * once here, so each query only normalizes itself.
 *
 * @param stores - The stores to search
 * @param limit - Maximum number of results
 * @returns A function returning the stores that contain every
 *   whitespace-separated term of the query, in their original order
 */
export function createStoreSearch(stores: Store[], limit = 10) {
  const entries = stores.map((store) => ({
    store,
    text: normalizeSearchText(`${store.name} ${store.address}`),
  }));

  return function searchStores(query: string): Store[] {
    const terms = normalizeSearchText(query).split(WHITESPACE).filter(Boolean);

    if (terms.length === 0) {
      return [];
    }

    const results: Store[] = [];

    for (const { store, text } of entries) {
      if (terms.every((term) => text.includes(term))) {
        results.push(store);

        if (results.length === limit) {
          break;
        }
      }
    }

    return results;
  };
}
