import { differenceInCalendarDays } from "date-fns";

// The cron scrapes every other day (vercel.json), so fresh data is at most two
// calendar days old; anything older means at least one run failed
const MAX_FRESH_DAYS = 2;

/**
 * Tells whether the data is older than a healthy scrape schedule allows.
 *
 * @param updatedAt - When the data was last scraped (ISO 8601)
 * @param today - Start of today
 * @returns Whether the scrape is overdue
 */
export function isStale(updatedAt: string, today: Date | number): boolean {
  return differenceInCalendarDays(today, updatedAt) > MAX_FRESH_DAYS;
}
