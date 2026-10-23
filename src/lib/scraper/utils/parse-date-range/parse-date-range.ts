/** A sale period as `YYYY-MM-DD` dates. */
export interface DateRange {
  startDate: string;
  endDate: string;
}

function padZero(n: string): string {
  return n.padStart(2, "0");
}

/**
 * Parses a KALDI sale period such as `2026年3月5日(木) ～ 2026年3月9日(月)`.
 *
 * @param text - The sale period text
 * @returns The period as `YYYY-MM-DD` dates, or `null` when the text has none
 */
export function parseDateRange(text: string): DateRange | null {
  const pattern =
    /(?<startYear>\d{4})年(?<startMonth>\d{1,2})月(?<startDay>\d{1,2})日.*?～\s*(?<endYear>\d{4})年(?<endMonth>\d{1,2})月(?<endDay>\d{1,2})日/u;

  const groups = pattern.exec(text)?.groups;

  if (groups === undefined) {
    return null;
  }

  const { startYear, startMonth, startDay, endYear, endMonth, endDay } = groups;

  return {
    startDate: `${startYear}-${padZero(startMonth)}-${padZero(startDay)}`,
    endDate: `${endYear}-${padZero(endMonth)}-${padZero(endDay)}`,
  };
}
