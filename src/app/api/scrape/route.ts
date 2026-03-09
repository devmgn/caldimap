import type { NextRequest } from "next/server";
import { getStoresData, putStoresData } from "@/lib/blob";
import { buildStoresData } from "@/lib/scraper";

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

  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
  if (apiKey === undefined || apiKey === "") {
    return Response.json(
      { error: "GOOGLE_GEOCODING_API_KEY is not configured" },
      { status: 500 },
    );
  }

  try {
    // Load previous data for coordinate cache
    const cachedCoords = new Map<string, { lat: number; lng: number }>();
    const previous = await getStoresData();
    if (previous) {
      for (const s of previous.stores) {
        cachedCoords.set(s.id, { lat: s.lat, lng: s.lng });
      }
    }

    const data = await buildStoresData(cachedCoords, apiKey);
    const url = await putStoresData(data);

    return Response.json({
      success: true,
      storeCount: data.stores.length,
      url,
    });
  } catch (error) {
    console.error("Scrape failed:", error);
    return Response.json({ error: "Scrape failed" }, { status: 500 });
  }
}
