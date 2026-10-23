import type { Store, StoresData } from "../features/map/types";
import type { CheerioAPI } from "cheerio";
import { load } from "cheerio";
import { z } from "zod";
import { simplifyAddress } from "./simplify-address";

const BASE_URL = "https://map.kaldi.co.jp/kaldi/articleList";

interface RawStore {
  id: string;
  name: string;
  address: string;
  url: string;
  services: string[];
}

interface RawSale {
  storeId: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  detail: string;
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

async function fetchStores(): Promise<RawStore[]> {
  const url = `${BASE_URL}?template=Ctrl/DispListArticle_g12&pageLimit=10000&pageSize=1000&account=kaldi&accmd=0&searchType=True&pg=1`;
  const res = await fetch(url);
  const html = await res.text();
  const $ = load(html);

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

    const services = parseServiceIcons($, $(row));

    stores.push({
      id: bid,
      name,
      address,
      url: `https://map.kaldi.co.jp${href}`,
      services,
    });
  });

  console.warn(`Fetched ${stores.length} stores`);

  return stores;
}

function padZero(n: string): string {
  return n.padStart(2, "0");
}

interface DateRange {
  startDate: string;
  endDate: string;
}

function parseDateRange(text: string): DateRange {
  // "2026年3月5日(木) ～ 2026年3月9日(月)"
  const pattern =
    /(?<startYear>\d{4})年(?<startMonth>\d{1,2})月(?<startDay>\d{1,2})日.*?～\s*(?<endYear>\d{4})年(?<endMonth>\d{1,2})月(?<endDay>\d{1,2})日/u;

  const groups = pattern.exec(text)?.groups;

  if (groups === undefined) {
    return { startDate: "", endDate: "" };
  }

  const { startYear, startMonth, startDay, endYear, endMonth, endDay } = groups;

  return {
    startDate: `${startYear}-${padZero(startMonth)}-${padZero(startDay)}`,
    endDate: `${endYear}-${padZero(endMonth)}-${padZero(endDay)}`,
  };
}

async function fetchSales(): Promise<RawSale[]> {
  const now = new Date().toISOString().slice(0, 19);
  const url = `${BASE_URL}?account=kaldi&accmd=1&ftop=1&kkw001=${encodeURIComponent(now)}`;
  const res = await fetch(url);
  const html = await res.text();
  const $ = load(html);

  const sales: RawSale[] = [];

  $("table.cz_sp_table tbody tr").each((_, row) => {
    const status = $(row).find("span.saleicon, span.saleicon_f").text().trim();
    const type = $(row).find("span.saletitle, span.saletitle_f").text().trim();
    const storeLink = $(row).find("span.salename a");
    const dateText = $(row).find("p.saledate, p.saledate_f").text().trim();
    const detail = $(row).find("p.saledetail").text().trim();

    const href = storeLink.attr("href") ?? "";
    const bid = /bid=(?<bid>\d+)/u.exec(href)?.groups?.bid;

    if (bid === undefined || !type) {
      return;
    }

    const { startDate, endDate } = parseDateRange(dateText);

    sales.push({
      storeId: bid,
      type,
      status,
      startDate,
      endDate,
      detail,
    });
  });

  console.warn(`Fetched ${sales.length} sales`);

  return sales;
}

const gsiGeocodeResponseSchema = z.array(
  z.object({
    geometry: z.object({
      // [lng, lat]
      coordinates: z.tuple([z.number(), z.number()]),
    }),
  })
);

async function fetchGsi(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`;
  const res = await fetch(url);
  const parsed = gsiGeocodeResponseSchema.safeParse(await res.json());

  if (!parsed.success || parsed.data.length === 0) {
    return null;
  }

  const [lng, lat] = parsed.data[0].geometry.coordinates;

  return { lat, lng };
}

async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const result = await fetchGsi(address);

  if (result) {
    return result;
  }

  const simplified = simplifyAddress(address);

  if (simplified !== null) {
    console.warn(`Retrying with simplified address: ${simplified}`);
    const retry = await fetchGsi(simplified);

    if (retry) {
      return retry;
    }
  }

  console.warn(`Geocoding failed for: ${address}`);

  return null;
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

  // Group sales by store ID
  const salesByStore = new Map<string, RawSale[]>();

  for (const sale of sales) {
    const list = salesByStore.get(sale.storeId) ?? [];
    list.push(sale);
    salesByStore.set(sale.storeId, list);
  }

  // Geocode uncached stores sequentially
  const resolvedCoords = await resolveAllCoords(rawStores, cachedCoords);

  // Merge
  const stores: Store[] = rawStores.flatMap((raw) => {
    const coords = resolvedCoords.get(raw.id);

    if (!coords) {
      return [];
    }

    const storeSales = salesByStore.get(raw.id) ?? [];

    return {
      id: raw.id,
      name: raw.name,
      address: raw.address,
      lat: coords.lat,
      lng: coords.lng,
      url: raw.url,
      services: raw.services,
      sales: storeSales.map((s) => ({
        type: s.type,
        status: s.status,
        startDate: s.startDate,
        endDate: s.endDate,
        detail: s.detail,
      })),
    };
  });

  return {
    updatedAt: new Date().toISOString(),
    stores,
  };
}
