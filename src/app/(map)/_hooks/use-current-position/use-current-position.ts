"use client";

import type { LatLng } from "../../../../types/stores-data";
import { useEffect, useState } from "react";

const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 10_000,
  maximumAge: 600_000,
};

// How long to hold the first view for a position the browser may already
// allow. A cached fix arrives in milliseconds; a fresh one can take longer,
// and past this the map opens on Japan
const INITIAL_WAIT_MS = 3000;

interface CurrentPosition {
  /** The user's position, or `null` until (or unless) geolocation resolves. */
  position: LatLng | null;
  /**
   * Whether the first view can be decided: the position arrived, it won't
   * come without a prompt (permission not granted), it failed, or the wait
   * ran out. `false` on the server.
   */
  settled: boolean;
}

/**
 * Requests the user's position once, after hydration.
 *
 * @returns The position and whether the first view can be decided
 */
export function useCurrentPosition(): CurrentPosition {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [waitOver, setWaitOver] = useState(false);

  useEffect(() => {
    // getCurrentPosition can't be cancelled, so ignore a result that arrives
    // after unmount
    let ignore = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function stopWaiting() {
      clearTimeout(timer);

      if (!ignore) {
        setWaitOver(true);
      }
    }

    // Waiting only pays off when no prompt stands in the way; otherwise open
    // on Japan right away and let the answer move the map. Browsers without
    // the Permissions API wait for the position or the timer
    async function stopWaitingUnlessGranted() {
      try {
        const status = await navigator.permissions.query({
          name: "geolocation",
        });

        if (status.state !== "granted") {
          stopWaiting();
        }
      } catch {
        stopWaiting();
      }
    }

    if ("geolocation" in navigator) {
      timer = setTimeout(stopWaiting, INITIAL_WAIT_MS);

      if ("permissions" in navigator) {
        void stopWaitingUnlessGranted();
      }

      // Denied, unavailable, or timed out: no position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);

          if (!ignore) {
            setPosition({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          }
        },
        stopWaiting,
        GEOLOCATION_OPTIONS
      );
    } else {
      stopWaiting();
    }

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, []);

  return { position, settled: position !== null || waitOver };
}
