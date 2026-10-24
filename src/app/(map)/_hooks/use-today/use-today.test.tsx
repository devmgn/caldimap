import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useToday } from "./use-today";

function TodayText() {
  return <>{String(useToday())}</>;
}

describe(useToday, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the start of today in the browser", () => {
    vi.useFakeTimers({ now: new Date(2026, 9, 24, 12), toFake: ["Date"] });

    const { result } = renderHook(() => useToday());

    expect(result.current).toBe(new Date(2026, 9, 24).getTime());
  });

  it("rolls over shortly after midnight", () => {
    vi.useFakeTimers({ now: new Date(2026, 9, 24, 23, 59, 30) });

    const { result } = renderHook(() => useToday());

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current).toBe(new Date(2026, 9, 25).getTime());
  });

  it("is null while rendering on the server", () => {
    expect(renderToString(<TodayText />)).toBe("null");
  });
});
