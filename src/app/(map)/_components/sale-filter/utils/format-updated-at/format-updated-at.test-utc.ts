import { describe, expect, it } from "vitest";
import { formatUpdatedAt } from "./format-updated-at";

describe(formatUpdatedAt, () => {
  it("runs where the runtime time zone is UTC", () => {
    // Without this, the check below would pass in Asia/Tokyo for any reason
    expect(new Date(2026, 9, 24).getTimezoneOffset()).toBe(0);
  });

  it("formats in Japan time regardless, like the UTC build server", () => {
    expect(formatUpdatedAt("2026-10-23T20:00:00.000Z")).toBe("10/24 05:00");
  });
});
