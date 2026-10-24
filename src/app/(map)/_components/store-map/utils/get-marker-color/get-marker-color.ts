import type { Sale } from "../../../../../../types/stores-data";
import {
  endOfDay,
  isAfter,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";

type SaleCategory = "open" | "kansha";

const MARKER_COLORS = {
  // 赤: 通常セール開催中
  "kansha-active": "#dc2626",
  // 薄赤: 通常セール予定
  "kansha-upcoming": "#fca5a5",
  // 青: オープンセール開催中
  "open-active": "#2563eb",
  // 薄青: オープンセール予定
  "open-upcoming": "#93c5fd",
  // グレー: セールなし
  none: "#9ca3af",
} as const;

/** One of the marker fill colors. */
export type MarkerColor = (typeof MARKER_COLORS)[keyof typeof MARKER_COLORS];

/**
 * Marker colors from most to least relevant: running sales, then upcoming
 * ones, then none. A cluster takes the most relevant color among its stores.
 */
export const MARKER_COLOR_PRIORITY: readonly MarkerColor[] = [
  MARKER_COLORS["kansha-active"],
  MARKER_COLORS["open-active"],
  MARKER_COLORS["kansha-upcoming"],
  MARKER_COLORS["open-upcoming"],
  MARKER_COLORS.none,
];

function getSaleCategory(type: string): SaleCategory {
  return type.includes("オープン") ? "open" : "kansha";
}

/**
 * Resolves a store marker's fill color from its sales: a running sale wins
 * over an upcoming one, and "オープン" sales use the blue palette.
 *
 * @param sales - The store's sales
 * @param now - The current time (injectable for tests)
 * @returns A hex color
 */
export function getMarkerColor(sales: Sale[], now = new Date()): MarkerColor {
  const today = startOfDay(now);

  const active = sales.find((sale) =>
    isWithinInterval(today, {
      start: startOfDay(parseISO(sale.startDate)),
      end: endOfDay(parseISO(sale.endDate)),
    })
  );

  if (active) {
    return MARKER_COLORS[`${getSaleCategory(active.type)}-active`];
  }

  const upcoming = sales.find((sale) => isAfter(parseISO(sale.startDate), now));

  if (upcoming) {
    return MARKER_COLORS[`${getSaleCategory(upcoming.type)}-upcoming`];
  }

  return MARKER_COLORS.none;
}
