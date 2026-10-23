import { load } from "cheerio";
import { describe, expect, it, vi } from "vitest";
import { parseSalesPage } from "./parse-sales-page";

function saleRow(options: {
  upcoming?: boolean;
  bid?: string;
  type?: string;
  date?: string;
}) {
  const {
    upcoming = false,
    bid = "043",
    type = "お客様感謝セール",
    date = "2026年10月20日(火) ～ 2026年10月25日(日)",
  } = options;

  const suffix = upcoming ? "_f" : "";

  return `<tr>
    <td scope="row" itemprop="name">
      <div class="salerow">
        <span class="saleicon${suffix}">${upcoming ? "予告" : "開催中"}</span>
        <span class="saletitle${suffix}">${type}</span><br />
      </div>
      <span class="salename"><a href="/kaldi/detailMap?account=kaldi&amp;accmd=0&amp;bid=${bid}&amp;pgret=2">イオンモール津田沼North店</a></span>
    </td>
    <td itemprop="saledetail">
      <p class="saledate${suffix}">${date}</p>
      <p class="saledetail">オリジナルコーヒー豆 特別価格</p>
      <p class="saledetail_notes">※一部除外品があります。</p>
    </td>
  </tr>`;
}

function page(body: string) {
  return load(`<div class="cz_Resultclass articleList">${body}</div>`);
}

function table(rows: string[]) {
  return page(
    `<table class="cz_sp_table"><tbody>${rows.join("")}</tbody></table>`
  );
}

describe(parseSalesPage, () => {
  it("parses a running sale", () => {
    expect(parseSalesPage(table([saleRow({})]))).toStrictEqual([
      {
        storeId: "043",
        type: "お客様感謝セール",
        status: "開催中",
        startDate: "2026-10-20",
        endDate: "2026-10-25",
        detail: "オリジナルコーヒー豆 特別価格",
      },
    ]);
  });

  it("parses an upcoming sale from the _f class variants", () => {
    const [sale] = parseSalesPage(table([saleRow({ upcoming: true })]));

    expect(sale).toMatchObject({ status: "予告", type: "お客様感謝セール" });
  });

  it("skips sales with unparsable dates and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(parseSalesPage(table([saleRow({ date: "未定" })]))).toStrictEqual(
      []
    );
    expect(warn).toHaveBeenCalledOnce();
  });

  it.each([
    ["without a store ID", { bid: "" }],
    ["without a sale type", { type: "" }],
  ])("skips rows %s", (_, options) => {
    expect(parseSalesPage(table([saleRow(options)]))).toStrictEqual([]);
  });

  it("returns no sales when the page shows the no-sales message", () => {
    expect(
      parseSalesPage(
        page('<p class="cz_atten cz_detail">現在セール店舗はございません。</p>')
      )
    ).toStrictEqual([]);
  });

  it("throws when the page has neither rows nor the no-sales message", () => {
    expect(() => parseSalesPage(page("<p>メンテナンス中</p>"))).toThrow(
      /neither rows nor the no-sales message/u
    );
  });
});
