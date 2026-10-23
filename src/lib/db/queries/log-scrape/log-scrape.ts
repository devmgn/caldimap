import { getDb } from "../../get-db";
import { scrapeLogs } from "../../schema/scrape-logs";

/**
 * Records a scrape run.
 *
 * @param storeCount - Number of stores scraped
 */
export async function logScrape(storeCount: number): Promise<void> {
  await getDb().insert(scrapeLogs).values({ storeCount });
}
