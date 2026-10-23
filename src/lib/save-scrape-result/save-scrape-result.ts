import type { StoresData } from "../../types/stores-data";
import { logScrape } from "../db/queries/log-scrape";
import { upsertStoresAndSales } from "../db/queries/upsert-stores-and-sales";

/**
 * Persists a scrape: upserts stores and sales, then records the run.
 *
 * @param data - The scraped stores and sales
 */
export async function saveScrapeResult(data: StoresData): Promise<void> {
  await upsertStoresAndSales(data);
  await logScrape(data.stores.length);
}
