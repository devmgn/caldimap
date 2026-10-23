import type { NextRequest } from "next/server";
import {
  getStoreCoordsCache,
  logScrape,
  upsertStoresAndSales,
} from "../../../db/queries/stores";
import { buildStoresData } from "../../../lib/scraper";

/**
 * Cron endpoint that scrapes stores and sales and stores them in the DB.
 * Requires `Authorization: Bearer <CRON_SECRET>`.
 *
 * @param request - The incoming request
 * @returns The scrape result, or 401 / 500 on failure
 */
// Route handlers must be named after the HTTP method they handle
// oxlint-disable-next-line sonarjs/function-name
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (
    cronSecret === undefined ||
    cronSecret === "" ||
    authHeader !== `Bearer ${cronSecret}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const cachedCoords = await getStoreCoordsCache();
    const data = await buildStoresData(cachedCoords);
    await upsertStoresAndSales(data);
    await logScrape(data.stores.length);

    return Response.json({
      success: true,
      storeCount: data.stores.length,
    });
  } catch (error) {
    console.error("Scrape failed:", error);

    return Response.json({ error: "Scrape failed" }, { status: 500 });
  }
}
