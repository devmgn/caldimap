import { describe, expect, it, vi } from "vitest";
import { buildStoresData } from "./scraper";

const ADDRESS = "東京都三鷹市下連雀3-46-1";

function storesPage(address: string) {
  return `<div class="cz_Resultclass articleList"><table class="cz_sp_table"><tbody><tr>
    <td itemprop="name"><a href="/kaldi/detailMap?account=kaldi&amp;bid=043">アトレヴィ三鷹店</a></td>
    <td itemprop="address">${address}</td>
  </tr></tbody></table></div>`;
}

// buildStoresData requests the store list, then the sale list, then GSI per
// uncached store
function stubFetch() {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new Response(storesPage(ADDRESS)))
    .mockResolvedValueOnce(
      new Response(
        '<div class="cz_Resultclass articleList">現在セール店舗はございません</div>'
      )
    )
    .mockResolvedValue(
      Response.json([{ geometry: { coordinates: [139.56, 35.7] } }])
    );
}

describe(buildStoresData, () => {
  it("reuses cached coordinates while the address is unchanged", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchSpy = stubFetch();

    const result = await buildStoresData(
      new Map([["043", { address: ADDRESS, lat: 35, lng: 139 }]])
    );

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result.data.stores[0]).toMatchObject({ lat: 35, lng: 139 });
  });

  it("geocodes again when the store's address changed", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchSpy = stubFetch();

    const result = await buildStoresData(
      new Map([
        ["043", { address: "東京都渋谷区神南1-2-3", lat: 35, lng: 139 }],
      ])
    );

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(fetchSpy.mock.calls[2]?.[0]).toContain("msearch.gsi.go.jp");
    expect(result.data.stores[0]).toMatchObject({ lat: 35.7, lng: 139.56 });
  });
});
