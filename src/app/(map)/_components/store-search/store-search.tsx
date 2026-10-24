"use client";

import type { Store } from "../../../../types/stores-data";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { useState } from "react";
import { createStoreSearch } from "./utils/create-store-search";

interface StoreSearchProps {
  stores: Store[];
  onSelect: (store: Store) => void;
}

/**
 * Search box over store names and addresses, built on Base UI's Autocomplete
 * (an ARIA combobox): typing highlights the first match, ↑↓ move the
 * highlight while focus stays in the input, Enter or a click picks it, and
 * Escape closes the list. Base UI holds the value back while an IME is still
 * composing, so unconverted kana doesn't search, and the keys an IME uses are
 * left to it. Picking a store hands it to
 * `onSelect`, which moves the map there, and clears the input.
 *
 * @param props - The stores to search and the selection handler
 * @returns The search box with its results
 */
export function StoreSearch({ stores, onSelect }: StoreSearchProps) {
  const [query, setQuery] = useState("");

  // Our own matching (width, case, kana folding and a result cap) replaces
  // Base UI's built-in filter
  const searchStores = createStoreSearch(stores);
  const results = searchStores(query);
  const hasQuery = query.trim() !== "";

  return (
    <Autocomplete.Root
      items={results}
      filter={null}
      value={query}
      onValueChange={(next, details) => {
        // Picking a store moves the map instead of filling in its name
        setQuery(details.reason === "item-press" ? "" : next);
      }}
      itemToStringValue={(store) => store.name}
      autoHighlight
    >
      <Autocomplete.Input
        aria-label="店舗名・住所で検索"
        placeholder="店舗名・住所で検索"
        spellCheck={false}
        enterKeyHint="search"
        onKeyDown={(event) => {
          // Base UI ignores only the Enter that confirms a conversion; while
          // an IME composes, the arrows pick its candidates, not our results
          if (event.nativeEvent.isComposing) {
            event.preventBaseUIHandler();
          }
        }}
        className="w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-blue-600"
      />
      <Autocomplete.Portal hidden={!hasQuery}>
        {/* Above Leaflet's panes and controls (z-index up to 1000) */}
        <Autocomplete.Positioner
          sideOffset={4}
          align="start"
          className="z-1100 outline-hidden"
        >
          <Autocomplete.Popup className="w-(--anchor-width) max-w-(--available-width) overflow-hidden rounded-lg border bg-white shadow-md">
            <Autocomplete.Status className="sr-only">
              {results.length > 0
                ? `${results.length}件の店舗が見つかりました`
                : null}
            </Autocomplete.Status>
            <Autocomplete.Empty className="px-3 py-2 text-xs text-gray-500 empty:hidden">
              {hasQuery ? "該当する店舗がありません" : null}
            </Autocomplete.Empty>
            <Autocomplete.List
              aria-label="検索結果"
              className="max-h-[min(18rem,var(--available-height))] overflow-y-auto overscroll-contain py-1 data-empty:p-0"
            >
              {(store: Store) => (
                <Autocomplete.Item
                  key={store.id}
                  value={store}
                  onClick={() => {
                    onSelect(store);
                  }}
                  className="cursor-pointer px-3 py-2 outline-hidden select-none data-highlighted:bg-gray-100"
                >
                  <span className="block text-sm">{store.name}</span>
                  <span className="block truncate text-xs text-gray-500">
                    {store.address}
                  </span>
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
