import { describe, expect, it } from "vitest";
import { parseDateRange } from "./parse-date-range";

describe(parseDateRange, () => {
  it.each([
    [
      "2026年3月5日(木) ～ 2026年3月9日(月)",
      { startDate: "2026-03-05", endDate: "2026-03-09" },
    ],
    [
      "2026年12月25日(金)～2027年1月3日(日)",
      { startDate: "2026-12-25", endDate: "2027-01-03" },
    ],
    [
      "2026年10月20日(火) ～　2026年10月25日(日)",
      { startDate: "2026-10-20", endDate: "2026-10-25" },
    ],
  ])("parses %s", (text, expected) => {
    expect(parseDateRange(text)).toStrictEqual(expected);
  });

  it.each(["", "未定", "2026年3月5日(木)"])("returns null for %j", (text) => {
    expect(parseDateRange(text)).toBeNull();
  });
});
