"use client";

import type { Sale, Store } from "../../../../types/stores-data";
import type { SalePeriod } from "../../_lib/get-sale-period";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useDeferredValue } from "react";
import { getSalePeriod } from "../../_lib/get-sale-period";
import { useToday } from "../use-today";

/** Periods the filter can narrow to; `null` shows every store. */
export type PeriodFilter = Exclude<SalePeriod, "ended"> | null;

const PERIODS = ["active", "upcoming"] as const satisfies PeriodFilter[];

// Both criteria live in one URL state, so clearing them is a single write
const filterParsers = {
  sales: parseAsArrayOf(parseAsString, ",").withDefault([]),
  period: parseAsStringLiteral(PERIODS),
};

/** A change to the selection, as `hides` can check before applying it. */
type CriteriaChange = Partial<Pick<Criteria, "selectedSales" | "period">>;

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
 *   the selection (optionally with a change applied), and a function that
 *   clears what hides a store
 */
export function useSaleFilter(stores: Store[]) {
  const [{ sales: selectedSales, period }, setFilters] =
    useQueryStates(filterParsers);

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
    void setFilters({ sales: next });
  }

  function changePeriod(next: PeriodFilter) {
    void setFilters({ period: next });
  }

  // Uses the current selection (not the deferred one the map is catching up
  // to), with `change` applied, so callers can check a change before making it
  function hides(store: Store, change: CriteriaChange = {}) {
    const criteria = { selectedSales, period, today, ...change };

    return filterStores([store], criteria).length === 0;
  }

  // Clears only what hides the store: the period or the sale types if dropping
  // one is enough, both otherwise. Returns whether anything was cleared
  function revealStore(store: Store) {
    if (!hides(store)) {
      return false;
    }

    if (!hides(store, { period: null })) {
      void setFilters({ period: null });
    } else if (hides(store, { selectedSales: [] })) {
      void setFilters({ sales: [], period: null });
    } else {
      void setFilters({ sales: [] });
    }

    return true;
  }

  return {
    saleTypes,
    selectedSales,
    changeSales,
    period,
    changePeriod,
    filteredStores,
    hides,
    revealStore,
  };
}
