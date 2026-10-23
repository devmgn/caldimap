import { describe, expect, it, vi } from "vitest";
import { geocodeAddress } from "./geocode-address";

function gsiResponse(coordinates: [number, number][]) {
  return Response.json(
    coordinates.map((coordinate) => ({
      geometry: { coordinates: coordinate },
    }))
  );
}

describe(geocodeAddress, () => {
  it("returns the first match as lat / lng", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      gsiResponse([[139.56, 35.7]])
    );

    await expect(
      geocodeAddress("東京都三鷹市下連雀3-46-1")
    ).resolves.toStrictEqual({ lat: 35.7, lng: 139.56 });
  });

  it("retries a Kyoto address without the street-name notation", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(gsiResponse([]))
      .mockResolvedValueOnce(gsiResponse([[135.76, 35]]));

    await expect(
      geocodeAddress("京都府京都市中京区三条通寺町東入石橋町26")
    ).resolves.toStrictEqual({ lat: 35, lng: 135.76 });
    expect(fetchSpy.mock.calls[1]?.[0]).toContain(
      encodeURIComponent("京都府京都市中京区石橋町26")
    );
  });

  it("returns null when GSI responds with an error", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("rate limited", { status: 429 })
    );

    await expect(geocodeAddress("東京都渋谷区神南1-2-3")).resolves.toBeNull();
  });

  it("returns null when nothing matches", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue(gsiResponse([]));

    await expect(geocodeAddress("東京都渋谷区神南1-2-3")).resolves.toBeNull();
  });
});
