import type { CheerioAPI } from "cheerio";
import { load } from "cheerio";

// Both list pages render this container, with or without rows. Error pages and
// redirects (e.g. to the top page) do not
const RESULT_PAGE_SELECTOR = ".cz_Resultclass.articleList";

/**
 * Fetches a KALDI store map list page and loads it into Cheerio. Throws when
 * the response is not 2xx or is not a list result page.
 *
 * @param url - The list page URL
 * @returns The loaded page
 */
export async function fetchKaldiPage(url: string): Promise<CheerioAPI> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`KALDI request failed: ${res.status} ${url}`);
  }

  const $ = load(await res.text());

  if ($(RESULT_PAGE_SELECTOR).length === 0) {
    throw new Error(`KALDI response is not a result page: ${url}`);
  }

  return $;
}
