import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import { parseStoresPage } from "./parse-stores-page";

function storeRow(options: { href?: string; name?: string; icons?: string[] }) {
  const {
    href = "/kaldi/detailMap?account=kaldi&amp;accmd=0&amp;bid=043&amp;pgret=2",
    name = "アトレヴィ三鷹店",
    icons = [],
  } = options;

  const images = icons
    .map((icon) => `<img src="../imagesDbConfig/kaldi/${icon}.svg" alt="" />`)
    .join("");

  return `<tr>
    <td scope="row" aria-label="店舗名" itemprop="name"><a href="${href}">${name}</a></td>
    <td aria-label="住所" itemprop="address"> 東京都三鷹市下連雀3-46-1　アトレヴィ三鷹 3F </td>
    <td aria-label="お取り扱い">${images}</td>
  </tr>`;
}

function page(rows: string[]) {
  return load(
    `<div class="cz_Resultclass articleList"><table class="cz_sp_table"><tbody>${rows.join("")}</tbody></table></div>`
  );
}

describe(parseStoresPage, () => {
  it("parses a store row", () => {
    expect(
      parseStoresPage(page([storeRow({ icons: ["icon_001"] })]))
    ).toStrictEqual([
      {
        id: "043",
        name: "アトレヴィ三鷹店",
        address: "東京都三鷹市下連雀3-46-1　アトレヴィ三鷹 3F",
        url: "https://map.kaldi.co.jp/kaldi/detailMap?account=kaldi&accmd=0&bid=043&pgret=2",
        services: ["酒類取扱"],
      },
    ]);
  });

  it("maps known service icons and ignores unknown ones", () => {
    const [store] = parseStoresPage(
      page([storeRow({ icons: ["icon_002", "icon_006", "icon_999"] })])
    );

    expect(store.services).toStrictEqual(["カフェ併設", "Tax Free"]);
  });

  it.each([
    ["without a store ID", { href: "/kaldi/detailMap?account=kaldi" }],
    ["without a name", { name: "" }],
  ])("skips rows %s", (_, options) => {
    expect(parseStoresPage(page([storeRow(options)]))).toStrictEqual([]);
  });
});
