import type { Sale, Store, StoresData } from "../../../../types/stores-data";
import { eq } from "drizzle-orm";
import { getDb } from "../../get-db";
import { sales } from "../../schema/sales";
import { stores } from "../../schema/stores";

/**
 * Sale columns of a store row left-joined with sales. All null when the store
 * has no sale.
 */
interface SaleColumns {
  saleId: number | null;
  saleType: string | null;
  saleStatus: string | null;
  saleStartDate: string | null;
  saleEndDate: string | null;
  saleDetail: string | null;
}

function toSale(row: SaleColumns): Sale | null {
  const {
    saleId,
    saleType,
    saleStatus,
    saleStartDate,
    saleEndDate,
    saleDetail,
  } = row;

  if (saleId === null || saleType === null || saleStatus === null) {
    return null;
  }

  if (saleStartDate === null || saleEndDate === null || saleDetail === null) {
    return null;
  }

  return {
    type: saleType,
    status: saleStatus,
    startDate: saleStartDate,
    endDate: saleEndDate,
    detail: saleDetail,
  };
}

/**
 * Loads every store with its sales.
 *
 * @returns Stores with their sales
 */
export async function getStoresWithSales(): Promise<StoresData | null> {
  const db = getDb();

  const rows = await db
    .select({
      id: stores.id,
      name: stores.name,
      address: stores.address,
      lat: stores.lat,
      lng: stores.lng,
      url: stores.url,
      services: stores.services,
      saleId: sales.id,
      saleType: sales.type,
      saleStatus: sales.status,
      saleStartDate: sales.startDate,
      saleEndDate: sales.endDate,
      saleDetail: sales.detail,
    })
    .from(stores)
    .leftJoin(sales, eq(stores.id, sales.storeId));

  if (rows.length === 0) {
    return null;
  }

  const storeMap = new Map<string, Store>();

  for (const row of rows) {
    const existing = storeMap.get(row.id);

    const store = existing ?? {
      id: row.id,
      name: row.name,
      address: row.address,
      lat: row.lat,
      lng: row.lng,
      url: row.url,
      services: row.services,
      sales: [],
    };

    if (!existing) {
      storeMap.set(row.id, store);
    }

    const sale = toSale(row);

    if (sale !== null) {
      store.sales.push(sale);
    }
  }

  return {
    updatedAt: new Date().toISOString(),
    stores: [...storeMap.values()],
  };
}
