import type { Sale } from "../../../../../../types/stores-data";

/**
 * Sale columns of a store row left-joined with sales. All null when the store
 * has no sale.
 */
interface SaleColumns {
  saleId: number | null;
  saleType: string | null;
  saleStatus: string | null;
  saleStartDate: string | null;
  saleEndDate: string | null;
  saleDetail: string | null;
}

/**
 * Turns the sale columns of a left-joined store row into a sale.
 *
 * @param row - The row's sale columns
 * @returns The sale, or `null` when the store has no sale on this row
 */
export function toSale(row: SaleColumns): Sale | null {
  const {
    saleId,
    saleType,
    saleStatus,
    saleStartDate,
    saleEndDate,
    saleDetail,
  } = row;

  if (saleId === null || saleType === null || saleStatus === null) {
    return null;
  }

  if (saleStartDate === null || saleEndDate === null || saleDetail === null) {
    return null;
  }

  return {
    type: saleType,
    status: saleStatus,
    startDate: saleStartDate,
    endDate: saleEndDate,
    detail: saleDetail,
  };
}
