"use client";

import type { PeriodFilter } from "../../_hooks/use-sale-filter";
import { useId } from "react";
import { formatUpdatedAt } from "./utils/format-updated-at";
import { isStale } from "./utils/is-stale";
import { useToday } from "../../_hooks/use-today";

const PERIOD_OPTIONS = [
  { value: null, label: "すべて" },
  { value: "active", label: "開催中" },
  { value: "upcoming", label: "開催予定" },
] as const satisfies { value: PeriodFilter; label: string }[];

interface SaleFilterProps {
  saleTypes: string[];
  selectedSales: string[];
  onToggle: (saleType: string) => void;
  period: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  totalCount: number;
  filteredCount: number;
  updatedAt: string | null;
}

/**
 * Panel that narrows the map to stores holding a sale of the selected types
 * and period, with the store counts and when the data was scraped. The scrape
 * time turns into a warning once it's older than the schedule allows.
 *
 * @param props - The sale types and period with their current selection and
 *   handlers, the store counts, and the scrape time
 * @returns The filter panel. Without any sales, only the counts and the scrape
 *   time
 */
export function SaleFilter({
  saleTypes,
  selectedSales,
  onToggle,
  period,
  onPeriodChange,
  totalCount,
  filteredCount,
  updatedAt,
}: SaleFilterProps) {
  // Radios group by name, so keep it unique per panel
  const periodName = useId();
  const selected = new Set(selectedSales);
  // Unknown until hydration: the prerendered "today" is the build date
  const today = useToday();

  const stale =
    updatedAt !== null && today !== null && isStale(updatedAt, today);

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm">
      {saleTypes.length > 0 && (
        <>
          <h2 className="text-sm font-semibold">セール絞り込み</h2>
          <fieldset>
            <legend className="sr-only">期間</legend>
            <div className="flex rounded-md bg-gray-100 p-0.5 text-xs">
              {PERIOD_OPTIONS.map((option) => (
                <label
                  key={option.label}
                  className="flex-1 cursor-pointer rounded px-1 py-1 text-center whitespace-nowrap text-gray-600 has-checked:bg-white has-checked:font-semibold has-checked:text-gray-900 has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-blue-600"
                >
                  <input
                    type="radio"
                    name={periodName}
                    checked={period === option.value}
                    onChange={() => {
                      onPeriodChange(option.value);
                    }}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-2">
            {saleTypes.map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(type)}
                  onChange={() => {
                    onToggle(type);
                  }}
                  className="rounded"
                />
                {type}
              </label>
            ))}
          </div>
        </>
      )}
      <div className="flex flex-col gap-1 text-xs text-gray-500">
        <p>
          {filteredCount} / {totalCount} 店舗表示中
        </p>
        {updatedAt !== null && (
          // Said in words too, not only by color
          <p className={stale ? "font-semibold text-amber-700" : undefined}>
            <time dateTime={updatedAt}>{formatUpdatedAt(updatedAt)}</time> 更新
            {stale ? "（情報が古い可能性があります）" : null}
          </p>
        )}
      </div>
    </div>
  );
}
