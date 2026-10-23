import { describe, expect, it } from "vitest";
import { getMarkerColor } from "./get-marker-color";

// 2026-10-24 12:00 in Asia/Tokyo (vitest.global-setup.ts pins TZ)
const NOW = new Date(2026, 9, 24, 12);

function sale(type: string, startDate: string, endDate: string) {
  return { type, status: "", startDate, endDate, detail: "" };
}

const RUNNING = ["2026-10-20", "2026-10-26"] as const;
const UPCOMING = ["2026-10-30", "2026-11-03"] as const;
const PAST = ["2026-10-01", "2026-10-05"] as const;

describe(getMarkerColor, () => {
  it.each([
    ["running 感謝 sale", [sale("お客様感謝セール", ...RUNNING)], "#dc2626"],
    ["upcoming 感謝 sale", [sale("お客様感謝セール", ...UPCOMING)], "#fca5a5"],
    ["running オープン sale", [sale("オープンセール", ...RUNNING)], "#2563eb"],
    [
      "upcoming オープン sale",
      [sale("オープンセール", ...UPCOMING)],
      "#93c5fd",
    ],
    ["only past sales", [sale("お客様感謝セール", ...PAST)], "#9ca3af"],
    ["no sales", [], "#9ca3af"],
  ])("colors a store with %s", (_, sales, expected) => {
    expect(getMarkerColor(sales, NOW)).toBe(expected);
  });

  it("prefers a running sale over an upcoming one", () => {
    expect(
      getMarkerColor(
        [
          sale("オープンセール", ...UPCOMING),
          sale("お客様感謝セール", ...RUNNING),
        ],
        NOW
      )
    ).toBe("#dc2626");
  });

  it("treats the first and last day of a sale as running", () => {
    expect(
      getMarkerColor(
        [sale("お客様感謝セール", "2026-10-24", "2026-10-30")],
        NOW
      )
    ).toBe("#dc2626");
    expect(
      getMarkerColor(
        [sale("お客様感謝セール", "2026-10-20", "2026-10-24")],
        NOW
      )
    ).toBe("#dc2626");
  });
});
