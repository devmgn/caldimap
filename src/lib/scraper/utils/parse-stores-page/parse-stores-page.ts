import type { CheerioAPI } from "cheerio";

/** A store as listed on the KALDI store list, before geocoding. */
export interface RawStore {
  id: string;
  name: string;
  address: string;
  url: string;
  services: string[];
}

const ICON_TO_SERVICE = new Map([
  ["icon_001", "酒類取扱"],
  ["icon_002", "カフェ併設"],
  ["icon_006", "Tax Free"],
]);

function parseServiceIcons(
  $: CheerioAPI,
  $row: ReturnType<CheerioAPI>
): string[] {
  const services: string[] = [];
  $row.find('td[aria-label="お取り扱い"] img').each((_, img) => {
    const src = $(img).attr("src") ?? "";
    const icon = /(?<icon>icon_\d+)/u.exec(src)?.groups?.icon;
    const service = icon === undefined ? undefined : ICON_TO_SERVICE.get(icon);

    if (service !== undefined) {
      services.push(service);
    }
  });

  return services;
}

/**
 * Parses the rows of the KALDI store list page. Rows without a store ID
 * (`bid`) or name are skipped.
 *
 * @param $ - The loaded store list page
 * @returns The listed stores
 */
export function parseStoresPage($: CheerioAPI): RawStore[] {
  const stores: RawStore[] = [];

  $("table.cz_sp_table tbody tr").each((_, row) => {
    const nameEl = $(row).find('td[itemprop="name"] a');
    const addressEl = $(row).find('td[itemprop="address"]');

    const name = nameEl.text().trim();
    const href = nameEl.attr("href") ?? "";
    const address = addressEl.text().trim();

    const bid = /bid=(?<bid>\d+)/u.exec(href)?.groups?.bid;

    if (bid === undefined || !name) {
      return;
    }

    stores.push({
      id: bid,
      name,
      address,
      url: `https://map.kaldi.co.jp${href}`,
      services: parseServiceIcons($, $(row)),
    });
  });

  return stores;
}
