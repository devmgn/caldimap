import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { SaleFilter } from "./sale-filter";

const meta = {
  component: SaleFilter,
  args: {
    saleTypes: ["お客様感謝セール", "オープンセール"],
    selectedSales: [],
    onToggle: fn<(saleType: string) => void>(),
    totalCount: 519,
    filteredCount: 519,
  },
} satisfies Meta<typeof SaleFilter>;

export default meta;

type Story = StoryObj<typeof SaleFilter>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    await expect(canvas.getByText("519 / 519 店舗表示中")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("checkbox", { name: "オープンセール" })
    );

    await expect(args.onToggle).toHaveBeenCalledWith("オープンセール");
  },
};

export const WithSelection: Story = {
  args: {
    selectedSales: ["お客様感謝セール"],
    filteredCount: 32,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("checkbox", { name: "お客様感謝セール" })
    ).toBeChecked();
    await expect(
      canvas.getByRole("checkbox", { name: "オープンセール" })
    ).not.toBeChecked();
    await expect(canvas.getByText("32 / 519 店舗表示中")).toBeVisible();
  },
};

export const NoSaleTypes: Story = {
  args: {
    saleTypes: [],
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("checkbox")).not.toBeInTheDocument();
  },
};
