import { describe, expect, it } from "vitest";
import { toSale } from "./to-sale";

const ROW = {
  saleId: 1,
  saleType: "お客様感謝セール",
  saleStatus: "開催中",
  saleStartDate: "2026-10-20",
  saleEndDate: "2026-10-25",
  saleDetail: "10%OFF",
};

describe(toSale, () => {
  it("maps the sale columns to a sale", () => {
    expect(toSale(ROW)).toStrictEqual({
      type: "お客様感謝セール",
      status: "開催中",
      startDate: "2026-10-20",
      endDate: "2026-10-25",
      detail: "10%OFF",
    });
  });

  it.each([
    "saleId",
    "saleType",
    "saleStatus",
    "saleStartDate",
    "saleEndDate",
    "saleDetail",
  ] as const)("returns null when %s is null", (column) => {
    expect(toSale({ ...ROW, [column]: null })).toBeNull();
  });
});
