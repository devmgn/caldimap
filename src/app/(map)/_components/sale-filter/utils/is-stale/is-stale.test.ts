import { describe, expect, it } from "vitest";
import { isStale } from "./is-stale";

// 2026-10-24 in Asia/Tokyo (vitest.global-setup.ts pins TZ)
const TODAY = new Date(2026, 9, 24);

describe(isStale, () => {
  it.each([
    ["scraped today", false, "2026-10-23T20:00:00.000Z"],
    ["scraped yesterday", false, "2026-10-22T20:00:00.000Z"],
    // The usual gap between two scheduled runs
    ["scraped two days ago", false, "2026-10-21T20:00:00.000Z"],
    // One scheduled run was missed
    ["scraped three days ago", true, "2026-10-20T20:00:00.000Z"],
  ])("says data %s is stale: %s", (_, expected, updatedAt) => {
    expect(isStale(updatedAt, TODAY)).toBe(expected);
  });
});
