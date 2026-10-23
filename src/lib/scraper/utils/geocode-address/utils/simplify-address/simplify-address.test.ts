import { describe, expect, it } from "vitest";
import { simplifyAddress } from "./simplify-address";

describe(simplifyAddress, () => {
  it.each([
    ["京都府京都市中京区三条通寺町東入石橋町26", "京都府京都市中京区石橋町26"],
    [
      "京都府京都市下京区四条通烏丸東入ル長刀鉾町",
      "京都府京都市下京区長刀鉾町",
    ],
    [
      "京都府京都市下京区烏丸通塩小路下ル東塩小路町901",
      "京都府京都市下京区東塩小路町901",
    ],
    [
      "京都府京都市中京区寺町通三条上ル天性寺前町",
      "京都府京都市中京区天性寺前町",
    ],
  ])("removes the street-name notation from %s", (address, expected) => {
    expect(simplifyAddress(address)).toBe(expected);
  });

  it("returns null for addresses without the street-name notation", () => {
    expect(simplifyAddress("東京都渋谷区神南1-2-3")).toBeNull();
  });
});
