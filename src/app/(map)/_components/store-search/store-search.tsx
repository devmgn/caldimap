"use client";

import type { Store } from "../../../../types/stores-data";
import type { FocusEvent, KeyboardEvent, SubmitEvent } from "react";
import { useId, useRef, useState } from "react";
import { createStoreSearch } from "./utils/create-store-search";

interface StoreSearchProps {
  stores: Store[];
  onSelect: (store: Store) => void;
}

/**
 * Search box over store names and addresses. The results are plain buttons:
 * ↓ moves from the input into them, ↑↓ move between them, Enter or Space picks
 * one, and Escape clears the search. Text an IME is still composing doesn't
 * search until it's confirmed. Enter in the input submits the form and
 * takes the first result; browsers don't submit while Enter only confirms an
 * IME conversion. Picking a result hands the store to `onSelect`, which moves
 * the map there.
 *
 * @param props - The stores to search and the selection handler
 * @returns The search box with its results
 */
export function StoreSearch({ stores, onSelect }: StoreSearchProps) {
  // What the input shows, including text an IME is still composing
  const [query, setQuery] = useState("");
  // What the results follow: only confirmed text, so unconverted kana doesn't search
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const searchStores = createStoreSearch(stores);
  const results = searchStores(searchQuery);
  const showResults = isOpen && searchQuery.trim() !== "";

  function clear() {
    setQuery("");
    setSearchQuery("");
    inputRef.current?.focus();
  }

  function select(store: Store) {
    onSelect(store);
    clear();
  }

  // Moves focus by `step` among the result buttons, wrapping at both ends
  function moveFocus(step: number) {
    const buttons = [...(listRef.current?.querySelectorAll("button") ?? [])];

    if (buttons.length === 0) {
      return;
    }

    const focused = document.activeElement;

    const current =
      focused instanceof HTMLButtonElement ? buttons.indexOf(focused) : -1;

    // From the input (-1), ↓ lands on the first result and ↑ on the last
    const start = current === -1 && step < 0 ? 0 : current;
    const next = (start + step + buttons.length) % buttons.length;

    buttons[next]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    // While an IME composes (e.g. Japanese input), the arrows pick conversion
    // candidates and Escape cancels the conversion
    if (event.nativeEvent.isComposing) {
      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        moveFocus(1);
        break;
      }

      case "ArrowUp": {
        event.preventDefault();
        moveFocus(-1);
        break;
      }

      case "Escape": {
        clear();
        break;
      }

      default:
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const first = results.at(0);

    if (first !== undefined) {
      select(first);
    }
  }

  // Close once focus leaves the whole widget, not when it moves into a result
  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false);
    }
  }

  let status = "";

  if (showResults) {
    status =
      results.length > 0
        ? `${results.length}件の店舗が見つかりました`
        : "該当する店舗がありません";
  }

  return (
    <search
      className="relative"
      onFocus={() => {
        setIsOpen(true);
      }}
      onBlur={handleBlur}
    >
      <form onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="sr-only">
          店舗名・住所で検索
        </label>
        <input
          ref={inputRef}
          id={inputId}
          name="store-search"
          type="search"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder="店舗名・住所で検索"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);

            const native = event.nativeEvent;

            if (!(native instanceof InputEvent && native.isComposing)) {
              setSearchQuery(event.target.value);
            }
          }}
          // Browsers differ on whether the last input event comes before or
          // after compositionend, so confirming the text searches here too
          onCompositionEnd={(event) => {
            setSearchQuery(event.currentTarget.value);
          }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-blue-600"
        />
      </form>
      {showResults ? (
        <div className="absolute top-full right-0 left-0 mt-1 rounded-lg border bg-white shadow-md">
          {results.length > 0 ? (
            <ul
              ref={listRef}
              aria-label="検索結果"
              className="max-h-72 overflow-y-auto py-1"
            >
              {results.map((store) => (
                <li key={store.id}>
                  <button
                    type="button"
                    onClick={() => {
                      select(store);
                    }}
                    onKeyDown={handleKeyDown}
                    // Safari doesn't focus buttons on click, so keep focus in
                    // the widget and let the click land before blur closes it
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    className="block w-full cursor-pointer px-3 py-2 text-left hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <span className="block text-sm">{store.name}</span>
                    <span className="block truncate text-xs text-gray-500">
                      {store.address}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-xs text-gray-500">
              該当する店舗がありません
            </p>
          )}
        </div>
      ) : null}
      {/* Announces the result count; the visible list carries the content */}
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </search>
  );
}
