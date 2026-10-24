"use client";

import type { Sale, Store } from "../../../../types/stores-data";
import type { SalePeriod } from "../../_lib/get-sale-period";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { useDeferredValue } from "react";
import { getSalePeriod } from "../../_lib/get-sale-period";
import { useToday } from "../use-today";

/** Periods the filter can narrow to; `null` shows every store. */
export type PeriodFilter = Exclude<SalePeriod, "ended"> | null;

const PERIODS = ["active", "upcoming"] as const satisfies PeriodFilter[];

interface Criteria {
  selectedSales: string[];
  period: PeriodFilter;
  today: number | null;
}

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

function filterStores(
  stores: Store[],
  { selectedSales, period, today }: Criteria
) {
  // Before hydration there is no "today" to compare with, so the period waits
  const matchesPeriod =
    period === null || today === null
      ? null
      : (sale: Sale) => getSalePeriod(sale, today) === period;

  if (selectedSales.length === 0 && matchesPeriod === null) {
    return stores;
  }

  const selected = new Set(selectedSales);

  // A single sale has to match both the type and the period
  return stores.filter((store) =>
    store.sales.some(
      (sale) =>
        (selected.size === 0 || selected.has(sale.type)) &&
        (matchesPeriod?.(sale) ?? true)
    )
  );
}

/**
 * Sale filter backed by the `sales` and `period` query parameters. The inputs
 * follow the selection immediately, while the filtered stores follow a
 * deferred copy so re-rendering the markers doesn't block the input.
 *
 * @param stores - All stores
 * @returns The sale types, the selected types and period with their setters,
 *   the stores holding a sale that matches both, whether a store is hidden by
 *   the current selection, and a function that clears it
 */
export function useSaleFilter(stores: Store[]) {
  const [selectedSales, setSelectedSales] = useQueryState(
    "sales",
    parseAsArrayOf(parseAsString, ",").withDefault([])
  );

  const [period, setPeriod] = useQueryState(
    "period",
    parseAsStringLiteral(PERIODS)
  );

  const today = useToday();

  const saleTypes = getSaleTypes(stores);
  const deferredSales = useDeferredValue(selectedSales);
  const deferredPeriod = useDeferredValue(period);

  const filteredStores = filterStores(stores, {
    selectedSales: deferredSales,
    period: deferredPeriod,
    today,
  });

  function changeSales(next: string[]) {
    void setSelectedSales(next);
  }

  function changePeriod(next: PeriodFilter) {
    void setPeriod(next);
  }

  // Uses the current selection, not the deferred one the map is catching up to
  function hides(store: Store) {
    return filterStores([store], { selectedSales, period, today }).length === 0;
  }

  function clearFilters() {
    void setSelectedSales([]);
    void setPeriod(null);
  }

  return {
    saleTypes,
    selectedSales,
    changeSales,
    period,
    changePeriod,
    filteredStores,
    hides,
    clearFilters,
  };
}
