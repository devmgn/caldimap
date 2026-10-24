import { describe, expect, it } from "vitest";
import { getStoreShareUrl } from "./get-store-share-url";

describe(getStoreShareUrl, () => {
  it("links to the top page with only the store", () => {
    expect(getStoreShareUrl("572", "https://example.com")).toBe(
      "https://example.com/?store=572"
    );
  });
});
