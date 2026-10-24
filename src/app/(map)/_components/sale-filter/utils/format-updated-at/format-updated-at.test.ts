import { describe, expect, it } from "vitest";
import { formatUpdatedAt } from "./format-updated-at";

describe(formatUpdatedAt, () => {
  it.each([
    ["2026-10-23T20:00:00.000Z", "10/24 05:00"],
    ["2026-12-31T15:30:00.000Z", "1/1 00:30"],
    ["2026-03-05T03:07:00.000Z", "3/5 12:07"],
  ])("formats %s in Japan time as %s", (iso, expected) => {
    expect(formatUpdatedAt(iso)).toBe(expected);
  });
});
