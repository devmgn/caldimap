import { describe, expect, it } from "vitest";
import { mergeStoresAndSales } from "./merge-stores-and-sales";

const rawStore = {
  id: "043",
  name: "イオンモール津田沼North店",
  address: "千葉県習志野市津田沼1-23-1",
  url: "https://map.kaldi.co.jp/kaldi/detailMap?bid=043",
  services: ["酒類取扱"],
};

const sale = {
  storeId: "043",
  type: "お客様感謝セール",
  status: "開催中",
  startDate: "2026-10-20",
  endDate: "2026-10-25",
  detail: "10%OFF",
};

describe(mergeStoresAndSales, () => {
  it("attaches coordinates and the store's sales", () => {
    expect(
      mergeStoresAndSales(
        [rawStore],
        [sale, { ...sale, storeId: "999" }],
        new Map([["043", { lat: 35.68, lng: 140.02 }]])
      )
    ).toStrictEqual([
      {
        id: "043",
        name: "イオンモール津田沼North店",
        address: "千葉県習志野市津田沼1-23-1",
        lat: 35.68,
        lng: 140.02,
        url: "https://map.kaldi.co.jp/kaldi/detailMap?bid=043",
        services: ["酒類取扱"],
        sales: [
          {
            type: "お客様感謝セール",
            status: "開催中",
            startDate: "2026-10-20",
            endDate: "2026-10-25",
            detail: "10%OFF",
          },
        ],
      },
    ]);
  });

  it("gives stores without sales an empty list", () => {
    const [store] = mergeStoresAndSales(
      [rawStore],
      [],
      new Map([["043", { lat: 35.68, lng: 140.02 }]])
    );

    expect(store.sales).toStrictEqual([]);
  });

  it("drops stores without coordinates", () => {
    expect(mergeStoresAndSales([rawStore], [sale], new Map())).toStrictEqual(
      []
    );
  });
});
