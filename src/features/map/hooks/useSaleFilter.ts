"use client";

import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import type { Store } from "../types";

function useSaleFilter(stores: Store[]) {
  const [selectedSales, setSelectedSales] = useQueryState(
    "sales",
    parseAsArrayOf(parseAsString, ",").withDefault([]),
  );

  const saleTypes = useMemo(() => {
    const types = new Set<string>();
    for (const store of stores) {
      for (const sale of store.sales) {
        types.add(sale.type);
      }
    }
    return Array.from(types).sort();
  }, [stores]);

  const filteredStores = useMemo(() => {
    if (selectedSales.length === 0) return stores;
    return stores.filter((store) =>
      store.sales.some((sale) => selectedSales.includes(sale.type)),
    );
  }, [stores, selectedSales]);

  function toggleSale(saleType: string) {
    setSelectedSales((prev) =>
      prev.includes(saleType)
        ? prev.filter((s) => s !== saleType)
        : [...prev, saleType],
    );
  }

  return { saleTypes, selectedSales, toggleSale, filteredStores };
}

export { useSaleFilter };
