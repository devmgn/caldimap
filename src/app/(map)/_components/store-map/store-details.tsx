"use client";

import type { Sale, Store } from "../../../../types/stores-data";
import { parseISO } from "date-fns";
import { useToday } from "../../_hooks/use-today";
import { getSalePeriod } from "../../_lib/get-sale-period";

function SalePeriodBadge({ sale }: { sale: Sale }) {
  const today = useToday();

  // The map renders only in the browser, so this is a fallback for hydration
  if (today === null) {
    return null;
  }

  const period = getSalePeriod(sale, today);

  if (period === "active") {
    return (
      <span className="rounded bg-[#dc2626] px-1 text-xs font-semibold text-white">
        開催中
      </span>
    );
  }

  if (period === "upcoming") {
    const start = parseISO(sale.startDate);

    return (
      <span className="rounded border border-[#dc2626] px-1 text-xs text-[#dc2626]">
        {start.getMonth() + 1}/{start.getDate()}から
      </span>
    );
  }

  return (
    <span className="rounded bg-gray-200 px-1 text-xs text-gray-600">終了</span>
  );
}

interface StoreDetailsProps {
  store: Store;
}

/**
 * A store's name, address, sales with their period and details, and official
 * page link, shown in a popup.
 *
 * @param props - The store
 * @returns The details
 */
export function StoreDetails({ store }: StoreDetailsProps) {
  return (
    <>
      <h3 className="mb-1 text-sm font-semibold">{store.name}</h3>
      {/* Leaflet's popup `p` margin and `a` color rules outrank utilities, hence `!` */}
      <p className="mt-0! mb-1! text-xs text-[#666]">{store.address}</p>
      {store.sales.map((sale) => (
        <div
          key={`${sale.type}-${sale.startDate}-${sale.endDate}`}
          className="mb-1 rounded bg-[#fef2f2] px-2 py-1 text-xs"
        >
          <div className="flex items-center gap-1">
            <strong>{sale.type}</strong>
            <SalePeriodBadge sale={sale} />
          </div>
          {sale.startDate} ~ {sale.endDate}
          {sale.detail !== "" && (
            <p className="mt-1! mb-0! text-[#444]">{sale.detail}</p>
          )}
        </div>
      ))}
      <a
        href={store.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-[#2563eb]!"
      >
        公式ページ →
      </a>
    </>
  );
}
