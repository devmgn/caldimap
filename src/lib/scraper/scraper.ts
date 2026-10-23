import type { StoresData } from "../../types/stores-data";
import type { RawSale } from "./utils/parse-sales-page";
import type { RawStore } from "./utils/parse-stores-page";
import { fetchKaldiPage } from "./utils/fetch-kaldi-page";
import { geocodeAddress } from "./utils/geocode-address";
import { mergeStoresAndSales } from "./utils/merge-stores-and-sales";
import { parseSalesPage } from "./utils/parse-sales-page";
import { parseStoresPage } from "./utils/parse-stores-page";

const BASE_URL = "https://map.kaldi.co.jp/kaldi/articleList";

async function fetchStores(): Promise<RawStore[]> {
  const url = `${BASE_URL}?template=Ctrl/DispListArticle_g12&pageLimit=10000&pageSize=1000&account=kaldi&accmd=0&searchType=True&pg=1`;
  const stores = parseStoresPage(await fetchKaldiPage(url));

  if (stores.length === 0) {
    throw new Error("KALDI store list returned no stores");
  }

  console.warn(`Fetched ${stores.length} stores`);

  return stores;
}

async function fetchSales(): Promise<RawSale[]> {
  const now = new Date().toISOString().slice(0, 19);
  const url = `${BASE_URL}?account=kaldi&accmd=1&ftop=1&kkw001=${encodeURIComponent(now)}`;
  const sales = parseSalesPage(await fetchKaldiPage(url));

  console.warn(`Fetched ${sales.length} sales`);

  return sales;
}

async function resolveAllCoords(
  rawStores: RawStore[],
  cachedCoords: Map<string, { lat: number; lng: number }>
): Promise<Map<string, { lat: number; lng: number }>> {
  const result = new Map(cachedCoords);

  const uncached = rawStores.filter((raw) => !cachedCoords.has(raw.id));

  for (const raw of uncached) {
    // Geocode one at a time to stay within the GSI API rate limit
    // oxlint-disable-next-line eslint/no-await-in-loop, react-doctor/async-await-in-loop
    const coords = await geocodeAddress(raw.address);

    if (coords) {
      result.set(raw.id, coords);
    }
  }

  return result;
}

/**
 * Scrapes stores and sales from the KALDI store map and merges them. Stores
 * without cached coordinates are geocoded with the GSI API.
 *
 * @param cachedCoords - Coordinates already stored in the DB, keyed by store ID
 * @returns Stores with coordinates and their sales
 */
export async function buildStoresData(
  cachedCoords: Map<string, { lat: number; lng: number }>
): Promise<StoresData> {
  const [rawStores, sales] = await Promise.all([fetchStores(), fetchSales()]);
  const resolvedCoords = await resolveAllCoords(rawStores, cachedCoords);

  return {
    updatedAt: new Date().toISOString(),
    stores: mergeStoresAndSales(rawStores, sales, resolvedCoords),
  };
}
