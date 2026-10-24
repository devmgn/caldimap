import type { PeriodFilter } from "../../_hooks/use-sale-filter";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { SaleFilter } from "./sale-filter";
import { formatUpdatedAt } from "./utils/format-updated-at";

const HOUR_MS = 60 * 60 * 1000;

// Relative to now, since the panel compares the scrape time with today
const FRESH_SCRAPE = new Date(Date.now() - HOUR_MS).toISOString();
const OVERDUE_SCRAPE = new Date(Date.now() - 5 * 24 * HOUR_MS).toISOString();
const STALE_NOTE = /情報が古い可能性があります/u;

const meta = {
  component: SaleFilter,
  args: {
    saleTypes: ["お客様感謝セール", "オープンセール"],
    selectedSales: [],
    onSalesChange: fn<(saleTypes: string[]) => void>(),
    period: null,
    onPeriodChange: fn<(period: PeriodFilter) => void>(),
    totalCount: 519,
    filteredCount: 519,
    updatedAt: FRESH_SCRAPE,
  },
} satisfies Meta<typeof SaleFilter>;

export default meta;

type Story = StoryObj<typeof SaleFilter>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    await expect(canvas.getByText("519 / 519 店舗表示中")).toBeVisible();
    await expect(canvas.getByText(formatUpdatedAt(FRESH_SCRAPE))).toBeVisible();
    await expect(canvas.queryByText(STALE_NOTE)).not.toBeInTheDocument();
    await expect(canvas.getByRole("radio", { name: "すべて" })).toBeChecked();

    await userEvent.click(
      canvas.getByRole("checkbox", { name: "オープンセール" })
    );

    await expect(args.onSalesChange).toHaveBeenCalledWith(
      ["オープンセール"],
      expect.anything()
    );

    await userEvent.click(canvas.getByRole("radio", { name: "開催中" }));

    await expect(args.onPeriodChange).toHaveBeenCalledWith("active");
  },
};

export const WithSelection: Story = {
  args: {
    selectedSales: ["お客様感謝セール"],
    period: "active",
    filteredCount: 32,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("checkbox", { name: "お客様感謝セール" })
    ).toBeChecked();
    await expect(
      canvas.getByRole("checkbox", { name: "オープンセール" })
    ).not.toBeChecked();
    await expect(canvas.getByRole("radio", { name: "開催中" })).toBeChecked();
    await expect(canvas.getByText("32 / 519 店舗表示中")).toBeVisible();
  },
};

export const NoSaleTypes: Story = {
  args: {
    saleTypes: [],
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("checkbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("radio")).not.toBeInTheDocument();
    // The counts and the scrape time stay, so a quiet period doesn't look like stale data
    await expect(canvas.getByText("519 / 519 店舗表示中")).toBeVisible();
    await expect(canvas.getByText(formatUpdatedAt(FRESH_SCRAPE))).toBeVisible();
  },
};

export const NoScrapeRecorded: Story = {
  args: {
    updatedAt: null,
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/更新/u)).not.toBeInTheDocument();
  },
};

export const OverdueScrape: Story = {
  args: {
    updatedAt: OVERDUE_SCRAPE,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(formatUpdatedAt(OVERDUE_SCRAPE))
    ).toBeVisible();
    await expect(canvas.getByText(STALE_NOTE)).toBeVisible();
  },
};
