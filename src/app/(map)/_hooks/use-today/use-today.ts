"use client";

import { startOfDay } from "date-fns";
import { useSyncExternalStore } from "react";

// Re-check every minute so the value rolls over shortly after midnight
const CHECK_INTERVAL_MS = 60_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, CHECK_INTERVAL_MS);

  return () => {
    clearInterval(id);
  };
}

// A primitive, so the snapshot only changes when the day does
function getSnapshot() {
  return startOfDay(new Date()).getTime();
}

function getServerSnapshot() {
  return null;
}

/**
 * Start of today in the browser's time zone. `null` on the server and during
 * hydration: the page is prerendered, so "today" there is the build date and
 * would not match the browser's.
 *
 * @returns Start of today as epoch milliseconds, or `null` before hydration
 */
export function useToday(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
