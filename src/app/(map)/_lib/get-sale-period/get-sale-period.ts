import type { Sale } from "../../../../types/stores-data";
import {
  endOfDay,
  isAfter,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";

/** Where a sale is relative to today. */
export type SalePeriod = "active" | "upcoming" | "ended";

/**
 * Tells whether a sale is running today, starts on a later day, or is over.
 * Decided from the dates rather than KALDI's status label, which is only as
 * fresh as the last scrape.
 *
 * @param sale - The sale
 * @param now - The current time
 * @returns The sale's period
 */
export function getSalePeriod(sale: Sale, now: Date | number): SalePeriod {
  const start = startOfDay(parseISO(sale.startDate));

  if (isAfter(start, now)) {
    return "upcoming";
  }

  return isWithinInterval(startOfDay(now), {
    start,
    end: endOfDay(parseISO(sale.endDate)),
  })
    ? "active"
    : "ended";
}
