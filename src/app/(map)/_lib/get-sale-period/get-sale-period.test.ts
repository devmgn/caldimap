import { describe, expect, it } from "vitest";
import { getSalePeriod } from "./get-sale-period";

// 2026-10-24 12:00 in Asia/Tokyo (vitest.global-setup.ts pins TZ)
const NOW = new Date(2026, 9, 24, 12);

function sale(startDate: string, endDate: string) {
  return { type: "", status: "", startDate, endDate, detail: "" };
}

describe(getSalePeriod, () => {
  it.each([
    ["spans today", "2026-10-20", "2026-10-26", "active"],
    ["starts today", "2026-10-24", "2026-10-26", "active"],
    ["ends today", "2026-10-20", "2026-10-24", "active"],
    ["starts tomorrow", "2026-10-25", "2026-10-28", "upcoming"],
    ["ended yesterday", "2026-10-20", "2026-10-23", "ended"],
  ] as const)("treats a sale that %s as %s", (_, start, end, expected) => {
    expect(getSalePeriod(sale(start, end), NOW)).toBe(expected);
  });
});
