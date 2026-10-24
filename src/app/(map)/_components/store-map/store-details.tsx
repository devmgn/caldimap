"use client";

import type { Store } from "../../../../types/stores-data";

interface StoreDetailsProps {
  store: Store;
}

/**
 * A store's name, address, sales, and official page link, shown in a popup.
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
          <strong>{sale.type}</strong>
          <br />
          {sale.startDate} ~ {sale.endDate}
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
