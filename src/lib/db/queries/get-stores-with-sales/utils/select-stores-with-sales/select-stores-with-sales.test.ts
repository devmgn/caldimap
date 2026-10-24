// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { selectStoresWithSales } from "./select-stores-with-sales";
import { sales } from "../../../../schema/sales";
import { scrapeLogs } from "../../../../schema/scrape-logs";
import { stores } from "../../../../schema/stores";

// An in-process Postgres, so the test never reaches the DATABASE_URL in .env
const client = new PGlite();

// The same tables as the app database, so it type-checks as one
const db = drizzle({ client, schema: { stores, sales, scrapeLogs } });

const STORE = {
  name: "アトレ吉祥寺店",
  address: "東京都武蔵野市吉祥寺南町1-1-24",
  lat: 35.7033,
  lng: 139.5797,
  url: "https://example.com/197",
  services: ["酒類取扱"],
};

describe(selectStoresWithSales, () => {
  beforeAll(async () => {
    // The same migrations production runs
    await migrate(db, { migrationsFolder: "drizzle/migrations" });
  });

  beforeEach(async () => {
    await db.execute(
      "TRUNCATE stores, sales, scrape_logs RESTART IDENTITY CASCADE"
    );
  });

  afterAll(async () => {
    await client.close();
  });

  it("returns null when the database has no stores", async () => {
    await expect(selectStoresWithSales(db)).resolves.toBeNull();
  });

  it("groups each store's sales and keeps stores without any", async () => {
    await db.insert(stores).values([
      { id: "197", ...STORE },
      { id: "572", ...STORE, name: "アトレヴィ三鷹店", services: [] },
    ]);
    await db.insert(sales).values([
      {
        storeId: "197",
        type: "お客様感謝セール",
        status: "開催中",
        startDate: "2026-10-22",
        endDate: "2026-10-26",
        detail: "10%OFF",
      },
      {
        storeId: "197",
        type: "オープンセール",
        status: "予告",
        startDate: "2026-10-30",
        endDate: "2026-11-03",
      },
    ]);

    const data = await selectStoresWithSales(db);
    const byId = new Map(data?.stores.map((store) => [store.id, store]));

    expect(data?.stores).toHaveLength(2);
    expect(byId.get("197")).toStrictEqual({
      id: "197",
      ...STORE,
      sales: [
        {
          type: "お客様感謝セール",
          status: "開催中",
          startDate: "2026-10-22",
          endDate: "2026-10-26",
          detail: "10%OFF",
        },
        {
          type: "オープンセール",
          status: "予告",
          startDate: "2026-10-30",
          endDate: "2026-11-03",
          detail: "",
        },
      ],
    });
    expect(byId.get("572")?.sales).toStrictEqual([]);
  });

  it("has no update time when no scrape is recorded", async () => {
    await db.insert(stores).values({ id: "197", ...STORE });

    await expect(selectStoresWithSales(db)).resolves.toMatchObject({
      updatedAt: null,
    });
  });

  it("takes the update time from the latest recorded scrape", async () => {
    await db.insert(stores).values({ id: "197", ...STORE });
    await db.insert(scrapeLogs).values([
      { scrapedAt: new Date("2026-10-21T20:00:00.000Z"), storeCount: 519 },
      { scrapedAt: new Date("2026-10-23T20:00:00.000Z"), storeCount: 519 },
      { scrapedAt: new Date("2026-10-19T20:00:00.000Z"), storeCount: 518 },
    ]);

    await expect(selectStoresWithSales(db)).resolves.toMatchObject({
      updatedAt: "2026-10-23T20:00:00.000Z",
    });
  });
});
