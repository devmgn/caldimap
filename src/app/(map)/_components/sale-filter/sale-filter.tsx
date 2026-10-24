"use client";

import type { PeriodFilter } from "../../_hooks/use-sale-filter";
import { Checkbox } from "@base-ui/react/checkbox";
import { CheckboxGroup } from "@base-ui/react/checkbox-group";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useId } from "react";
import { formatUpdatedAt } from "./utils/format-updated-at";
import { isStale } from "./utils/is-stale";
import { useToday } from "../../_hooks/use-today";

// Radio values must be non-null, so "every store" gets a value of its own
const ALL_PERIODS = "all";

const PERIOD_OPTIONS = [
  { value: ALL_PERIODS, label: "すべて" },
  { value: "active", label: "開催中" },
  { value: "upcoming", label: "開催予定" },
] as const satisfies {
  value: NonNullable<PeriodFilter> | typeof ALL_PERIODS;
  label: string;
}[];

interface SaleFilterProps {
  saleTypes: string[];
  selectedSales: string[];
  onSalesChange: (saleTypes: string[]) => void;
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
  onSalesChange,
  period,
  onPeriodChange,
  totalCount,
  filteredCount,
  updatedAt,
}: SaleFilterProps) {
  const periodLabelId = useId();
  const typesLabelId = useId();
  // Unknown until hydration: the prerendered "today" is the build date
  const today = useToday();

  const stale =
    updatedAt !== null && today !== null && isStale(updatedAt, today);

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm">
      {saleTypes.length > 0 ? (
        <>
          <h2 className="text-sm font-semibold">セール絞り込み</h2>
          <span id={periodLabelId} className="sr-only">
            期間
          </span>
          {/* A segmented control: each radio carries its own label */}
          <RadioGroup
            aria-labelledby={periodLabelId}
            value={period ?? ALL_PERIODS}
            onValueChange={(
              value: (typeof PERIOD_OPTIONS)[number]["value"]
            ) => {
              onPeriodChange(value === ALL_PERIODS ? null : value);
            }}
            className="flex rounded-md bg-gray-100 p-0.5 text-xs"
          >
            {PERIOD_OPTIONS.map((option) => (
              <Radio.Root
                key={option.value}
                value={option.value}
                className="flex-1 cursor-pointer rounded px-1 py-1 text-center whitespace-nowrap text-gray-600 focus-visible:outline-2 focus-visible:outline-blue-600 data-checked:bg-white data-checked:font-semibold data-checked:text-gray-900 data-checked:shadow-sm"
              >
                {option.label}
              </Radio.Root>
            ))}
          </RadioGroup>
          <span id={typesLabelId} className="sr-only">
            セールの種類
          </span>
          <CheckboxGroup
            aria-labelledby={typesLabelId}
            value={selectedSales}
            onValueChange={onSalesChange}
            className="flex flex-col gap-2"
          >
            {saleTypes.map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <Checkbox.Root
                  value={type}
                  // The ::after widens the hit area beyond the 16px box, short of
                  // the next row's
                  className="relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-gray-400 bg-white text-white after:absolute after:-inset-x-3 after:-inset-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 data-checked:border-gray-900 data-checked:bg-gray-900"
                >
                  <Checkbox.Indicator className="flex data-unchecked:hidden">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className="size-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3.5 8.5l3 3 6-7" />
                    </svg>
                  </Checkbox.Indicator>
                </Checkbox.Root>
                {type}
              </label>
            ))}
          </CheckboxGroup>
        </>
      ) : null}
      <div className="flex flex-col gap-1 text-xs text-gray-500">
        <p>
          {filteredCount} / {totalCount} 店舗表示中
        </p>
        {updatedAt === null ? null : (
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
