import type { Sale, Store } from "../../../../types/stores-data";
import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

function sale(type: string, startDate: string, endDate: string): Sale {
  return { type, status: "", startDate, endDate, detail: "" };
}

function storeWith(id: string, sales: Sale[]): Store {
  return { ...store(id, []), sales };
}

function FilteredCount({ stores }: { stores: Store[] }) {
  return <span>{useSaleFilter(stores).filteredStores.length}</span>;
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

  it("writes the selected sale types to the URL and clears them", async () => {
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
      result.current.changeSales(["お客様感謝セール"]);
    });

    await waitFor(() => {
      expect(urlSales).toStrictEqual(["お客様感謝セール"]);
    });
    expect(result.current.filteredStores.map((s) => s.id)).toStrictEqual([
      "1",
      "2",
    ]);

    act(() => {
      result.current.changeSales([]);
    });

    await waitFor(() => {
      expect(urlSales).toStrictEqual(["お客様感謝セール", null]);
    });
    expect(result.current.selectedSales).toStrictEqual([]);
    expect(result.current.filteredStores).toBe(STORES);
  });

  describe("by period", () => {
    // 2026-10-24 12:00 in Asia/Tokyo (vitest.global-setup.ts pins TZ)
    beforeEach(() => {
      vi.useFakeTimers({ now: new Date(2026, 9, 24, 12), toFake: ["Date"] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const ACTIVE_KANSHA = sale("お客様感謝セール", "2026-10-22", "2026-10-26");
    const UPCOMING_OPEN = sale("オープンセール", "2026-10-30", "2026-11-03");

    const PERIOD_STORES = [
      storeWith("active", [ACTIVE_KANSHA]),
      storeWith("upcoming", [UPCOMING_OPEN]),
      storeWith("both", [ACTIVE_KANSHA, UPCOMING_OPEN]),
      storeWith("ended", [
        sale("お客様感謝セール", "2026-10-01", "2026-10-05"),
      ]),
      storeWith("none", []),
    ];

    function filteredIds(searchParams: string) {
      const { result } = renderHook(() => useSaleFilter(PERIOD_STORES), {
        wrapper: withNuqsTestingAdapter({ searchParams }),
      });

      return result.current.filteredStores.map((s) => s.id);
    }

    it.each([
      ["?period=active", ["active", "both"]],
      ["?period=upcoming", ["upcoming", "both"]],
    ])("keeps stores with a matching sale for %s", (searchParams, expected) => {
      expect(filteredIds(searchParams)).toStrictEqual(expected);
    });

    it("requires a single sale to match both the type and the period", () => {
      // "both" has a running 感謝 sale and an upcoming オープン sale, but no running オープン sale
      expect(filteredIds("?sales=オープンセール&period=active")).toStrictEqual(
        []
      );
    });

    it("leaves the period unapplied while rendering on the server", () => {
      // The prerendered "today" is the build date, so filtering by it would mismatch on hydration
      const Wrapper = withNuqsTestingAdapter({
        searchParams: "?period=active",
      });

      const html = renderToString(
        <Wrapper>
          <FilteredCount stores={PERIOD_STORES} />
        </Wrapper>
      );

      expect(html).toBe(`<span>${PERIOD_STORES.length}</span>`);
    });

    it("ignores an unknown period", () => {
      expect(filteredIds("?period=ended")).toHaveLength(PERIOD_STORES.length);
    });

    it("writes the period to the URL and clears it for every store", async () => {
      const urlPeriods: (string | null)[] = [];

      const { result } = renderHook(() => useSaleFilter(PERIOD_STORES), {
        wrapper: withNuqsTestingAdapter({
          hasMemory: true,
          onUrlUpdate: ({ searchParams }) => {
            urlPeriods.push(searchParams.get("period"));
          },
        }),
      });

      act(() => {
        result.current.changePeriod("upcoming");
      });

      await waitFor(() => {
        expect(urlPeriods).toStrictEqual(["upcoming"]);
      });

      act(() => {
        result.current.changePeriod(null);
      });

      await waitFor(() => {
        expect(urlPeriods).toStrictEqual(["upcoming", null]);
      });
      expect(result.current.filteredStores).toBe(PERIOD_STORES);
    });
  });
});
