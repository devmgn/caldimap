import type { Store } from "../../../../types/stores-data";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import { StoreSearch } from "./store-search";

function store(id: string, name: string, address: string): Store {
  return {
    id,
    name,
    address,
    lat: 35,
    lng: 139,
    url: "",
    services: [],
    sales: [],
  };
}

const SEARCH_LABEL = "店舗名・住所で検索";
const RESULTS_LABEL = "検索結果";

const STORES = [
  store("1", "アトレ吉祥寺店", "東京都武蔵野市吉祥寺南町1-1-24"),
  store("2", "アトレヴィ三鷹店", "東京都三鷹市下連雀3-46-1"),
  store("3", "大宮店", "埼玉県さいたま市大宮区錦町630"),
];

const meta = {
  component: StoreSearch,
  args: {
    stores: STORES,
    onSelect: fn<(selected: Store) => void>(),
  },
  decorators: [
    (Story) => (
      <div className="w-56 pb-60">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StoreSearch>;

export default meta;

type Story = StoryObj<typeof StoreSearch>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("searchbox", { name: SEARCH_LABEL })
    ).toBeVisible();
    await expect(
      canvas.queryByRole("list", { name: RESULTS_LABEL })
    ).not.toBeInTheDocument();
  },
};

export const TypingListsMatches: Story = {
  play: async ({ canvas }) => {
    // Hiragana matches the katakana names
    await userEvent.type(
      canvas.getByRole("searchbox", { name: SEARCH_LABEL }),
      "あとれ"
    );

    const results = within(canvas.getByRole("list", { name: RESULTS_LABEL }));
    await expect(
      results.getAllByRole("button").map((b) => b.firstChild?.textContent)
    ).toStrictEqual(["アトレ吉祥寺店", "アトレヴィ三鷹店"]);
    await expect(
      canvas.getByText("2件の店舗が見つかりました")
    ).toBeInTheDocument();
  },
};

export const KeyboardSelection: Story = {
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("searchbox", { name: SEARCH_LABEL });

    await userEvent.type(input, "アトレ");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");

    await expect(
      canvas.getByRole("button", { name: /アトレヴィ三鷹店/u })
    ).toHaveFocus();

    // Wraps from the last result back to the first
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      canvas.getByRole("button", { name: /アトレ吉祥寺店/u })
    ).toHaveFocus();

    // ...and from the first to the last
    await userEvent.keyboard("{ArrowUp}{Enter}");

    await expect(args.onSelect).toHaveBeenCalledWith(STORES[1]);
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
  },
};

export const EnterTakesFirstResult: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.type(
      canvas.getByRole("searchbox", { name: SEARCH_LABEL }),
      "アトレ{Enter}"
    );

    await expect(args.onSelect).toHaveBeenCalledWith(STORES[0]);
  },
};

export const IgnoresKeysWhileComposing: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("searchbox", { name: SEARCH_LABEL });

    await userEvent.type(input, "アトレ");
    // During IME composition the arrows pick conversion candidates
    await fireEvent.keyDown(input, { key: "ArrowDown", isComposing: true });

    await expect(input).toHaveFocus();
    await expect(input).toHaveValue("アトレ");
  },
};

export const SearchesOnlyConfirmedText: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("searchbox", { name: SEARCH_LABEL });

    input.focus();
    await fireEvent.compositionStart(input);
    // Unconverted kana while the IME composes
    await fireEvent.input(input, {
      target: { value: "あと" },
      isComposing: true,
    });

    await expect(input).toHaveValue("あと");
    await expect(
      canvas.queryByRole("list", { name: RESULTS_LABEL })
    ).not.toBeInTheDocument();

    await fireEvent.compositionEnd(input);

    await expect(
      within(canvas.getByRole("list", { name: RESULTS_LABEL })).getAllByRole(
        "button"
      )
    ).toHaveLength(2);
  },
};

export const ClickSelection: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.type(
      canvas.getByRole("searchbox", { name: SEARCH_LABEL }),
      "大宮"
    );
    await userEvent.click(canvas.getByRole("button", { name: /大宮店/u }));

    await expect(args.onSelect).toHaveBeenCalledWith(STORES[2]);
  },
};

export const EscapeClears: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("searchbox", { name: SEARCH_LABEL });

    await userEvent.type(input, "アトレ");
    await userEvent.keyboard("{ArrowDown}{Escape}");

    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
    await expect(
      canvas.queryByRole("list", { name: RESULTS_LABEL })
    ).not.toBeInTheDocument();
  },
};

export const NoMatches: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.type(
      canvas.getByRole("searchbox", { name: SEARCH_LABEL }),
      "札幌{Enter}"
    );

    await expect(
      canvas.queryByRole("list", { name: RESULTS_LABEL })
    ).not.toBeInTheDocument();
    // Shown visibly and announced through the live region
    await expect(canvas.getAllByText("該当する店舗がありません")).toHaveLength(
      2
    );
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
};

export const BlurHidesResults: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(
      canvas.getByRole("searchbox", { name: SEARCH_LABEL }),
      "アトレ"
    );
    // Focus moving into a result keeps the list open
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      canvas.getByRole("list", { name: RESULTS_LABEL })
    ).toBeVisible();

    await userEvent.click(document.body);

    await expect(
      canvas.queryByRole("list", { name: RESULTS_LABEL })
    ).not.toBeInTheDocument();
  },
};
