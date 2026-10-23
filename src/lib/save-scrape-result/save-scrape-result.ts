import type { ScrapeResult } from "../scraper";
import { logScrape } from "../db/queries/log-scrape";
import { upsertStoresAndSales } from "../db/queries/upsert-stores-and-sales";

/**
 * Persists a scrape: upserts stores and sales, deletes stores that left the
 * KALDI store list, then records the run.
 *
 * @param result - The scrape result
 */
export async function saveScrapeResult(result: ScrapeResult): Promise<void> {
  await upsertStoresAndSales(result.data, result.listedStoreIds);
  await logScrape(result.data.stores.length);
}
