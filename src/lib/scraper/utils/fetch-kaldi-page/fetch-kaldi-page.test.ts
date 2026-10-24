import { describe, expect, it, vi } from "vitest";
import { fetchKaldiPage } from "./fetch-kaldi-page";

const URL = "https://map.kaldi.co.jp/kaldi/articleList?account=kaldi";

describe(fetchKaldiPage, () => {
  it("returns the loaded page for a result page", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('<div class="cz_Resultclass articleList"><p>ok</p></div>')
    );

    const $ = await fetchKaldiPage(URL);

    expect($("p").text()).toBe("ok");
  });

  it("passes a timeout signal to fetch", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response('<div class="cz_Resultclass articleList"></div>')
      );

    await fetchKaldiPage(URL);

    expect(fetchSpy.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("throws on a non-2xx response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("error", { status: 503 })
    );

    await expect(fetchKaldiPage(URL)).rejects.toThrow(
      /KALDI request failed: 503/u
    );
  });

  it("throws when the response is not a result page", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<html><body>メンテナンス中</body></html>")
    );

    await expect(fetchKaldiPage(URL)).rejects.toThrow(/not a result page/u);
  });
});
