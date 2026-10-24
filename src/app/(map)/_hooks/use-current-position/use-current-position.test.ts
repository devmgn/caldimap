import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCurrentPosition } from "./use-current-position";

type PermissionState = "granted" | "prompt" | "denied";

const TOKYO = { lat: 35.6812, lng: 139.7671 };

type OnSuccess = (pos: {
  coords: Pick<GeolocationCoordinates, "latitude" | "longitude">;
}) => void;

function stubGeolocation(permission: PermissionState) {
  let succeed: OnSuccess | undefined;
  let fail: (() => void) | undefined;

  vi.stubGlobal("navigator", {
    geolocation: {
      getCurrentPosition: (onSuccess: OnSuccess, onError: () => void) => {
        succeed = onSuccess;
        fail = onError;
      },
    },
    permissions: {
      query: vi
        .fn<() => Promise<{ state: PermissionState }>>()
        .mockResolvedValue({ state: permission }),
    },
  });

  return {
    locate: () => {
      succeed?.({ coords: { latitude: TOKYO.lat, longitude: TOKYO.lng } });
    },
    fail: () => {
      fail?.();
    },
  };
}

// Lets the Permissions API query resolve
async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe(useCurrentPosition, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits for the position when permission is granted", async () => {
    vi.useFakeTimers();
    const geolocation = stubGeolocation("granted");
    const { result } = renderHook(() => useCurrentPosition());

    await flushPromises();

    expect(result.current).toStrictEqual({ position: null, settled: false });

    act(() => {
      geolocation.locate();
    });

    expect(result.current).toStrictEqual({ position: TOKYO, settled: true });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops waiting after 3 seconds, then still reports the position", async () => {
    vi.useFakeTimers();
    const geolocation = stubGeolocation("granted");
    const { result } = renderHook(() => useCurrentPosition());

    await flushPromises();

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(result.current.settled).toBeFalsy();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toStrictEqual({ position: null, settled: true });

    act(() => {
      geolocation.locate();
    });

    expect(result.current.position).toStrictEqual(TOKYO);
  });

  it.each<PermissionState>(["prompt", "denied"])(
    "does not wait when permission is %s",
    async (permission) => {
      stubGeolocation(permission);
      const { result } = renderHook(() => useCurrentPosition());

      await flushPromises();

      expect(result.current).toStrictEqual({ position: null, settled: true });
    }
  );

  it("stops waiting when geolocation fails", async () => {
    const geolocation = stubGeolocation("granted");
    const { result } = renderHook(() => useCurrentPosition());

    await flushPromises();

    act(() => {
      geolocation.fail();
    });

    expect(result.current).toStrictEqual({ position: null, settled: true });
  });

  it("does not wait without the Geolocation API", () => {
    vi.stubGlobal("navigator", {});
    const { result } = renderHook(() => useCurrentPosition());

    expect(result.current).toStrictEqual({ position: null, settled: true });
  });

  it("ignores a position that arrives after unmount", async () => {
    const geolocation = stubGeolocation("granted");
    const { result, unmount } = renderHook(() => useCurrentPosition());

    await flushPromises();
    unmount();
    geolocation.locate();

    expect(result.current.position).toBeNull();
  });
});
