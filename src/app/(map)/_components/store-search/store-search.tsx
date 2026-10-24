"use client";

import type { Store } from "../../../../types/stores-data";
import type { SubmitEvent } from "react";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { useState } from "react";
import { createStoreSearch } from "./utils/create-store-search";

interface StoreSearchProps {
  stores: Store[];
  onSelect: (store: Store) => void;
}

/**
 * Search box over store names and addresses, built on Base UI's Autocomplete
 * (an ARIA combobox). Typing highlights the first match, ↑↓ move the highlight
 * while focus stays in the input, and Enter or a click picks it; Enter with
 * nothing highlighted, or with the list closed, takes the first match. Text an
 * IME is still composing doesn't search, and the keys an IME uses are left to
 * it. Picking a store hands it to `onSelect`, which moves the map there, and
 * clears the input.
 *
 * @param props - The stores to search and the selection handler
 * @returns The search box with its results
 */
export function StoreSearch({ stores, onSelect }: StoreSearchProps) {
  // What the input shows, including text an IME is still composing
  const [inputValue, setInputValue] = useState("");
  // What the results follow: confirmed text only. Base UI holds composing text
  // back on its own, except on Android, where it skips composition tracking
  const [query, setQuery] = useState("");

  // Our own matching (width, case, kana folding and a result cap) replaces
  // Base UI's built-in filter
  const searchStores = createStoreSearch(stores);
  const results = searchStores(query);

  function select(store: Store) {
    onSelect(store);
    setInputValue("");
    setQuery("");
  }

  // Base UI leaves Enter to the form when the list is closed or nothing is
  // highlighted, and browsers don't submit while Enter confirms an IME
  // conversion
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const first = results.at(0);

    if (first !== undefined) {
      select(first);
    }
  }

  return (
    <search>
      <form onSubmit={handleSubmit}>
        <Autocomplete.Root
          items={results}
          filter={null}
          value={inputValue}
          onValueChange={(next, details) => {
            // Picking a result, by click, Enter, or a press dragged onto it,
            // reports the item's string value: its store ID
            if (details.reason === "item-press") {
              const store = results.find((s) => s.id === next);

              if (store !== undefined) {
                select(store);
              }

              return;
            }

            setInputValue(next);
            const native = details.event;

            if (!(native instanceof InputEvent && native.isComposing)) {
              setQuery(next);
            }
          }}
          itemToStringValue={(store) => store.id}
          autoHighlight
          // Moving the pointer off the list keeps the highlight for Enter
          keepHighlight
        >
          <Autocomplete.Input
            type="search"
            name="store-search"
            aria-label="店舗名・住所で検索"
            placeholder="店舗名・住所で検索"
            spellCheck={false}
            enterKeyHint="search"
            onCompositionEnd={(event) => {
              setQuery(event.currentTarget.value);
            }}
            onKeyDown={(event) => {
              // Base UI ignores only the Enter that confirms a conversion;
              // while an IME composes, the arrows pick its candidates
              if (event.nativeEvent.isComposing) {
                event.preventBaseUIHandler();
              }
            }}
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-blue-600"
          />
          <Autocomplete.Portal hidden={query.trim() === ""}>
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
                {/* Base UI keeps this element mounted and fills it only when
                    nothing matches */}
                <Autocomplete.Empty className="px-3 py-2 text-xs text-gray-500 empty:hidden">
                  該当する店舗がありません
                </Autocomplete.Empty>
                <Autocomplete.List
                  aria-label="検索結果"
                  className="max-h-[min(18rem,var(--available-height))] overflow-y-auto overscroll-contain py-1 data-empty:p-0"
                >
                  {(store: Store) => (
                    <Autocomplete.Item
                      key={store.id}
                      value={store}
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
        {/* Base UI adds a hidden text input of its own, and with two text fields
            a form only submits on Enter if it has a submit button */}
        <button type="submit" hidden>
          検索
        </button>
      </form>
    </search>
  );
}
