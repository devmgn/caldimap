"use client";

import type { Store } from "../../../../types/stores-data";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useDeferredValue } from "react";

function getSaleTypes(stores: Store[]) {
  const types = new Set<string>();

  for (const store of stores) {
    for (const sale of store.sales) {
      if (sale.type) {
        types.add(sale.type);
      }
    }
  }

  return [...types].toSorted();
}

function filterBySales(stores: Store[], selectedSales: string[]) {
  if (selectedSales.length === 0) {
    return stores;
  }

  const selected = new Set(selectedSales);

  return stores.filter((store) =>
    store.sales.some((sale) => selected.has(sale.type))
  );
}

/**
 * Sale filter backed by the `sales` query parameter. The checkboxes follow the
 * selection immediately, while the filtered stores follow a deferred copy so
 * re-rendering the markers doesn't block the input.
 *
 * @param stores - All stores
 * @returns The sale types, the selection, a toggle function, and the stores
 *   holding a selected sale
 */
export function useSaleFilter(stores: Store[]) {
  const [selectedSales, setSelectedSales] = useQueryState(
    "sales",
    parseAsArrayOf(parseAsString, ",").withDefault([])
  );

  const saleTypes = getSaleTypes(stores);
  const deferredSales = useDeferredValue(selectedSales);
  const filteredStores = filterBySales(stores, deferredSales);

  function toggleSale(saleType: string) {
    void setSelectedSales((prev) =>
      prev.includes(saleType)
        ? prev.filter((s) => s !== saleType)
        : [...prev, saleType]
    );
  }

  return { saleTypes, selectedSales, toggleSale, filteredStores };
}
