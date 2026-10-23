import { describe, expect, it } from "vitest";
import { shouldDeleteUnlistedStores } from "./should-delete-unlisted-stores";

describe(shouldDeleteUnlistedStores, () => {
  it.each([
    [518, 519],
    [519, 519],
    [530, 519],
    [468, 520],
  ])("deletes when %i of %i stores are listed", (listed, current) => {
    expect(shouldDeleteUnlistedStores(listed, current)).toBeTruthy();
  });

  it.each([
    [467, 520],
    [50, 519],
    [0, 519],
  ])("keeps stores when only %i of %i are listed", (listed, current) => {
    expect(shouldDeleteUnlistedStores(listed, current)).toBeFalsy();
  });

  it("has nothing to delete in an empty DB", () => {
    expect(shouldDeleteUnlistedStores(519, 0)).toBeFalsy();
  });
});
