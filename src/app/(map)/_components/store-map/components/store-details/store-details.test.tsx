import type { Sale, Store } from "../../../../../../types/stores-data";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StoreDetails } from "./store-details";
import { ToastProvider } from "../../../../_providers/toast-provider";

function sale(startDate: string, endDate: string, detail = ""): Sale {
  return { type: "お客様感謝セール", status: "", startDate, endDate, detail };
}

function storeWith(sales: Sale[]): Store {
  return {
    id: "1",
    name: "テスト店",
    address: "東京都",
    lat: 35,
    lng: 139,
    url: "https://example.com",
    services: [],
    sales,
  };
}

describe(StoreDetails, () => {
  // 2026-10-24 12:00 in Asia/Tokyo (vitest.global-setup.ts pins TZ)
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(2026, 9, 24, 12), toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ["running", sale("2026-10-22", "2026-10-26"), "開催中"],
    ["upcoming", sale("2026-10-30", "2026-11-03"), "10/30から"],
    ["finished", sale("2026-10-01", "2026-10-05"), "終了"],
  ])("labels a %s sale", (_, s, label) => {
    render(<StoreDetails store={storeWith([s])} />, { wrapper: ToastProvider });

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("shows the sale details when present", () => {
    render(
      <StoreDetails
        store={storeWith([sale("2026-10-22", "2026-10-26", "10%OFF")])}
      />,
      { wrapper: ToastProvider }
    );

    expect(screen.getByText("10%OFF")).toBeInTheDocument();
  });

  it("omits the details paragraph when the details are empty", () => {
    const { container } = render(
      <StoreDetails store={storeWith([sale("2026-10-22", "2026-10-26")])} />,
      { wrapper: ToastProvider }
    );

    // The address is the only paragraph left
    expect(container.querySelectorAll("p")).toHaveLength(1);
  });
});
