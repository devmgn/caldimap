import type { Store } from "../../../../types/stores-data";
import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it } from "vitest";
import { useSaleFilter } from "./use-sale-filter";

function store(id: string, saleTypes: string[]): Store {
  return {
    id,
    name: `店舗${id}`,
    address: "",
    lat: 35,
    lng: 139,
    url: "",
    services: [],
    sales: saleTypes.map((type) => ({
      type,
      status: "開催中",
      startDate: "2026-10-20",
      endDate: "2026-10-25",
      detail: "",
    })),
  };
}

const STORES = [
  store("1", ["お客様感謝セール"]),
  store("2", ["オープンセール", "お客様感謝セール"]),
  store("3", []),
];

describe(useSaleFilter, () => {
  it("lists the sale types sorted and de-duplicated", () => {
    const { result } = renderHook(() => useSaleFilter(STORES), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(result.current.saleTypes).toStrictEqual([
      "お客様感謝セール",
      "オープンセール",
    ]);
  });

  it("returns every store when nothing is selected", () => {
    const { result } = renderHook(() => useSaleFilter(STORES), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(result.current.filteredStores).toBe(STORES);
  });

  it("filters stores by the sale types in ?sales=", () => {
    const { result } = renderHook(() => useSaleFilter(STORES), {
      wrapper: withNuqsTestingAdapter({
        searchParams: "?sales=オープンセール",
      }),
    });

    expect(result.current.selectedSales).toStrictEqual(["オープンセール"]);
    expect(result.current.filteredStores.map((s) => s.id)).toStrictEqual(["2"]);
  });

  it("adds and removes a sale type in the URL when toggled", async () => {
    const urlSales: (string | null)[] = [];

    const { result } = renderHook(() => useSaleFilter(STORES), {
      wrapper: withNuqsTestingAdapter({
        hasMemory: true,
        onUrlUpdate: ({ searchParams }) => {
          urlSales.push(searchParams.get("sales"));
        },
      }),
    });

    act(() => {
      result.current.toggleSale("お客様感謝セール");
    });

    await waitFor(() => {
      expect(urlSales).toStrictEqual(["お客様感謝セール"]);
    });
    expect(result.current.filteredStores.map((s) => s.id)).toStrictEqual([
      "1",
      "2",
    ]);

    act(() => {
      result.current.toggleSale("お客様感謝セール");
    });

    await waitFor(() => {
      expect(urlSales).toStrictEqual(["お客様感謝セール", null]);
    });
    expect(result.current.selectedSales).toStrictEqual([]);
    expect(result.current.filteredStores).toBe(STORES);
  });
});
