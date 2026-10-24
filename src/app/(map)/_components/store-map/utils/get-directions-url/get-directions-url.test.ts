import { describe, expect, it } from "vitest";
import { getDirectionsUrl } from "./get-directions-url";

describe(getDirectionsUrl, () => {
  it("points Google Maps directions at the store's name and address", () => {
    const url = new URL(
      getDirectionsUrl({
        id: "197",
        name: "アトレ吉祥寺店",
        address: "東京都武蔵野市吉祥寺南町1-1-24　アトレ吉祥寺 2F",
        lat: 35.7,
        lng: 139.58,
        url: "",
        services: [],
        sales: [],
      })
    );

    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/dir/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("destination")).toBe(
      "カルディコーヒーファーム アトレ吉祥寺店 東京都武蔵野市吉祥寺南町1-1-24　アトレ吉祥寺 2F"
    );
  });
});
