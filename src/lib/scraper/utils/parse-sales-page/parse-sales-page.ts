import type { CheerioAPI } from "cheerio";
import { parseDateRange } from "../parse-date-range";

/** A sale as listed on the KALDI sale list. */
export interface RawSale {
  storeId: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  detail: string;
}

// Shown instead of the list table when no store currently has a sale
const NO_SALES_MESSAGE = "現在セール店舗はございません";

/**
 * Parses the rows of the KALDI sale list page. Upcoming sales use `_f`
 * variants of the class names. Rows without a store ID or sale type are
 * skipped, and sales whose dates cannot be parsed are skipped with a warning:
 * an empty date cannot be stored and would roll back the whole upsert. Throws
 * when the page has neither rows nor the no-sales message.
 *
 * @param $ - The loaded sale list page
 * @returns The listed sales
 */
export function parseSalesPage($: CheerioAPI): RawSale[] {
  const rows = $("table.cz_sp_table tbody tr");

  // Zero sales is valid only when the page says so; otherwise the markup changed
  if (rows.length === 0 && !$.text().includes(NO_SALES_MESSAGE)) {
    throw new Error(
      "KALDI sale list has neither rows nor the no-sales message"
    );
  }

  const sales: RawSale[] = [];

  rows.each((_, row) => {
    const status = $(row).find("span.saleicon, span.saleicon_f").text().trim();
    const type = $(row).find("span.saletitle, span.saletitle_f").text().trim();
    const storeLink = $(row).find("span.salename a");
    const dateText = $(row).find("p.saledate, p.saledate_f").text().trim();
    const detail = $(row).find("p.saledetail").text().trim();

    const href = storeLink.attr("href") ?? "";
    const bid = /bid=(?<bid>\d+)/u.exec(href)?.groups?.bid;

    if (bid === undefined || !type) {
      return;
    }

    const dateRange = parseDateRange(dateText);

    if (dateRange === null) {
      console.warn(
        `Skipping sale with unparsable dates: ${type} "${dateText}" (bid=${bid})`
      );

      return;
    }

    sales.push({ storeId: bid, type, status, ...dateRange, detail });
  });

  return sales;
}
