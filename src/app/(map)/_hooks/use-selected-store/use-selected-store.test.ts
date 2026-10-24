import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it } from "vitest";
import { useSelectedStore } from "./use-selected-store";

function renderWithUrl(searchParams = "") {
  const urlStores: (string | null)[] = [];

  const { result } = renderHook(() => useSelectedStore(), {
    wrapper: withNuqsTestingAdapter({
      searchParams,
      hasMemory: true,
      onUrlUpdate: ({ searchParams: next }) => {
        urlStores.push(next.get("store"));
      },
    }),
  });

  return { result, urlStores };
}

describe(useSelectedStore, () => {
  it("reads the store from ?store=", () => {
    const { result } = renderWithUrl("?store=572");

    expect(result.current.storeId).toBe("572");
  });

  it("writes the selected store to the URL and clears it on close", async () => {
    const { result, urlStores } = renderWithUrl();

    act(() => {
      result.current.selectStore("572");
    });

    await waitFor(() => {
      expect(result.current.storeId).toBe("572");
    });

    act(() => {
      result.current.closeStore("572");
    });

    await waitFor(() => {
      expect(result.current.storeId).toBeNull();
    });
    expect(urlStores).toStrictEqual(["572", null]);
  });

  it("keeps a newly selected store when the previous popup closes", async () => {
    const { result } = renderWithUrl("?store=572");

    // Switching stores removes the old popup after the new one is selected
    act(() => {
      result.current.selectStore("197");
    });
    act(() => {
      result.current.closeStore("572");
    });

    await waitFor(() => {
      expect(result.current.storeId).toBe("197");
    });
  });
});
