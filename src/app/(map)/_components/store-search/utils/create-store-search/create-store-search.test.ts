import type { Store } from "../../../../../../types/stores-data";
import { describe, expect, it } from "vitest";
import { createStoreSearch } from "./create-store-search";

function store(id: string, name: string, address: string): Store {
  return {
    id,
    name,
    address,
    lat: 35,
    lng: 139,
    url: "",
    services: [],
    sales: [],
  };
}

const STORES = [
  store(
    "1",
    "アトレ吉祥寺店",
    "東京都武蔵野市吉祥寺南町1-1-24　アトレ吉祥寺 2F"
  ),
  store("2", "アトレヴィ三鷹店", "東京都三鷹市下連雀3-46-1　アトレヴィ三鷹 3F"),
  store("3", "LUMINE大宮店", "埼玉県さいたま市大宮区錦町630"),
];

describe(createStoreSearch, () => {
  const search = createStoreSearch(STORES);

  function ids(query: string) {
    return search(query).map((s) => s.id);
  }

  it("matches the name or the address", () => {
    expect(ids("三鷹")).toStrictEqual(["2"]);
    expect(ids("武蔵野市")).toStrictEqual(["1"]);
  });

  it("ignores hiragana/katakana, width, and case differences", () => {
    expect(ids("あとれ")).toStrictEqual(["1", "2"]);
    expect(ids("ｌｕｍｉｎｅ")).toStrictEqual(["3"]);
  });

  it("requires every whitespace-separated term, including full-width spaces", () => {
    expect(ids("アトレ　吉祥寺")).toStrictEqual(["1"]);
    expect(ids("アトレ 大宮")).toStrictEqual([]);
  });

  it("returns nothing for a blank query", () => {
    expect(ids("   ")).toStrictEqual([]);
  });

  it("stops at the limit", () => {
    expect(createStoreSearch(STORES, 1)("東京都")).toHaveLength(1);
  });
});
