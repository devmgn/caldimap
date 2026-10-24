import type { Sale, Store } from "../../../../../../types/stores-data";
import { describe, expect, it } from "vitest";
import { createStoreIndex } from "./create-store-index";
import { MAX_ZOOM } from "../map-config";

// 2026-10-24 12:00 in Asia/Tokyo (vitest.global-setup.ts pins TZ)
const NOW = new Date(2026, 9, 24, 12);

const JAPAN = [122, 20, 154, 46] as const satisfies [
  number,
  number,
  number,
  number,
];

const RUNNING_SALE: Sale = {
  type: "お客様感謝セール",
  status: "開催中",
  startDate: "2026-10-20",
  endDate: "2026-10-26",
  detail: "",
};

function store(id: string, lat: number, lng: number, sales: Sale[]): Store {
  return {
    id,
    name: `店舗${id}`,
    address: "",
    lat,
    lng,
    url: "",
    services: [],
    sales,
  };
}

// Two stores ~100 m apart in Shinjuku and one in Osaka
const STORES = [
  store("1", 35.6905, 139.7005, []),
  store("2", 35.6914, 139.7005, [RUNNING_SALE]),
  store("3", 34.7025, 135.4959, []),
];

describe(createStoreIndex, () => {
  it("groups nearby stores into a cluster when zoomed out", () => {
    const features = createStoreIndex(STORES, NOW).getClusters(JAPAN, 5);

    const counts = features.map((f) =>
      "cluster" in f.properties ? f.properties.point_count : 1
    );

    expect(counts).toHaveLength(2);
    expect(counts).toContain(2);
  });

  it("returns every store individually when zoomed in", () => {
    const features = createStoreIndex(STORES, NOW).getClusters(JAPAN, 18);

    const ids = features.map((f) =>
      "store" in f.properties ? f.properties.store.id : null
    );

    expect(new Set(ids)).toStrictEqual(new Set(["1", "2", "3"]));
  });

  it("colors a cluster by its most relevant store", () => {
    const cluster = createStoreIndex(STORES, NOW)
      .getClusters(JAPAN, 5)
      .find((f) => "cluster" in f.properties);

    // The running 感謝 sale wins over the store without sales
    expect(cluster?.properties.color).toBe("#dc2626");
  });

  it("keeps stores sharing a location clustered at the deepest zoom", () => {
    const index = createStoreIndex(
      [store("1", 35.7033, 139.5797, []), store("2", 35.7033, 139.5797, [])],
      NOW
    );

    const clusterIds = index
      .getClusters(JAPAN, MAX_ZOOM)
      .flatMap((f) =>
        "cluster" in f.properties ? [f.properties.cluster_id] : []
      );

    expect(clusterIds).toHaveLength(1);
    expect(
      index.getClusterExpansionZoom(clusterIds[0] ?? Number.NaN)
    ).toBeGreaterThan(MAX_ZOOM);
  });
});
