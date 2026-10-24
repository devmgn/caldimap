import { tz } from "@date-fns/tz";
import { format } from "date-fns";

/**
 * Formats a timestamp as `M/d HH:mm` in Japan time. The time zone is fixed
 * rather than the runtime's, so the prerendered HTML (built in UTC) and the
 * browser produce the same string.
 *
 * @param iso - An ISO 8601 timestamp
 * @returns The formatted time, e.g. `10/24 05:00`
 */
export function formatUpdatedAt(iso: string): string {
  return format(iso, "M/d HH:mm", { in: tz("Asia/Tokyo") });
}
