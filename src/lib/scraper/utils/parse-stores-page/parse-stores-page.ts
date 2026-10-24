import type { CheerioAPI } from "cheerio";

/** A store as listed on the KALDI store list, before geocoding. */
export interface RawStore {
  id: string;
  name: string;
  address: string;
  url: string;
  services: string[];
}

const KALDI_ORIGIN = "https://map.kaldi.co.jp";

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
 * Resolves a store link against the KALDI site and reads its store ID. Links
 * that leave the site are rejected, so a malformed href cannot point visitors
 * elsewhere.
 *
 * @param href - The store link from the list page
 * @returns The store ID and absolute URL, or `null` when either is invalid
 */
function parseStoreLink(href: string): { id: string; url: string } | null {
  const url = URL.parse(href, KALDI_ORIGIN);

  if (url?.origin !== KALDI_ORIGIN) {
    return null;
  }

  const id = url.searchParams.get("bid");

  return id !== null && /^\d+$/u.test(id) ? { id, url: url.href } : null;
}

/**
 * Parses the rows of the KALDI store list page. Rows without a store ID
 * (`bid`), a name, or a link on the KALDI site are skipped, as are repeats of
 * a store ID already listed.
 *
 * @param $ - The loaded store list page
 * @returns The listed stores
 */
export function parseStoresPage($: CheerioAPI): RawStore[] {
  const stores: RawStore[] = [];
  const seenIds = new Set<string>();

  $("table.cz_sp_table tbody tr").each((_, row) => {
    const nameEl = $(row).find('td[itemprop="name"] a');
    const addressEl = $(row).find('td[itemprop="address"]');

    const name = nameEl.text().trim();
    const href = nameEl.attr("href") ?? "";
    const address = addressEl.text().trim();

    const link = parseStoreLink(href);

    if (link === null || name === "" || seenIds.has(link.id)) {
      return;
    }

    seenIds.add(link.id);
    stores.push({
      id: link.id,
      name,
      address,
      url: link.url,
      services: parseServiceIcons($, $(row)),
    });
  });

  return stores;
}
