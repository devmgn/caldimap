import type { Store } from "../../../../types/stores-data";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from "storybook/test";
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

// The results render in a portal outside the story's canvas
const page = within(document.body);

function getInput(canvasElement: HTMLElement) {
  return within(canvasElement).getByRole("combobox", { name: SEARCH_LABEL });
}

function optionNames() {
  return page
    .queryAllByRole("option")
    .map((option) => option.firstChild?.textContent);
}

function highlightedOption() {
  return document.querySelector("[role='option'][data-highlighted]");
}

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
  play: async ({ canvasElement }) => {
    await expect(getInput(canvasElement)).toBeVisible();
    await expect(page.queryByRole("listbox")).not.toBeInTheDocument();
  },
};

export const TypingListsMatches: Story = {
  play: async ({ canvasElement }) => {
    // Hiragana matches the katakana names
    await userEvent.type(getInput(canvasElement), "あとれ");

    await expect(
      await page.findByRole("listbox", { name: RESULTS_LABEL })
    ).toBeVisible();
    await expect(optionNames()).toStrictEqual([
      "アトレ吉祥寺店",
      "アトレヴィ三鷹店",
    ]);
    // Base UI briefly appends an invisible U+2060 to the first announcement
    // so VoiceOver notices it, hence the pattern instead of exact text
    await expect(
      await page.findByText(/2件の店舗が見つかりました/u)
    ).toBeInTheDocument();
  },
};

export const KeyboardSelection: Story = {
  play: async ({ args, canvasElement }) => {
    const input = getInput(canvasElement);

    await userEvent.type(input, "アトレ");
    await page.findByRole("listbox", { name: RESULTS_LABEL });

    // The first match is highlighted as you type; ↓ moves to the next
    await waitFor(async () => {
      await expect(highlightedOption()).toHaveTextContent("アトレ吉祥寺店");
    });
    await userEvent.keyboard("{ArrowDown}");
    await expect(highlightedOption()).toHaveTextContent("アトレヴィ三鷹店");
    await expect(input).toHaveFocus();

    await userEvent.keyboard("{Enter}");

    await expect(args.onSelect).toHaveBeenCalledWith(STORES[1]);
    await expect(input).toHaveValue("");
  },
};

export const EnterTakesFirstResult: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.type(getInput(canvasElement), "アトレ");
    await page.findByRole("listbox", { name: RESULTS_LABEL });
    await userEvent.keyboard("{Enter}");

    await expect(args.onSelect).toHaveBeenCalledWith(STORES[0]);
  },
};

export const SearchesOnlyConfirmedText: Story = {
  play: async ({ canvasElement }) => {
    const input = getInput(canvasElement);

    input.focus();
    await fireEvent.compositionStart(input);
    // Unconverted kana while the IME composes
    await fireEvent.input(input, {
      target: { value: "あと" },
      isComposing: true,
    });

    await expect(input).toHaveValue("あと");
    await expect(page.queryAllByRole("option")).toHaveLength(0);

    await fireEvent.compositionEnd(input);

    await waitFor(async () => {
      await expect(page.getAllByRole("option")).toHaveLength(2);
    });
  },
};

export const IgnoresArrowsWhileComposing: Story = {
  play: async ({ canvasElement }) => {
    const input = getInput(canvasElement);

    await userEvent.type(input, "アトレ");
    await waitFor(async () => {
      await expect(highlightedOption()).toHaveTextContent("アトレ吉祥寺店");
    });

    // During IME composition the arrows pick conversion candidates
    await fireEvent.keyDown(input, { key: "ArrowDown", isComposing: true });

    await expect(highlightedOption()).toHaveTextContent("アトレ吉祥寺店");
  },
};

export const HoldsBackComposingTextBaseUIPassesOn: Story = {
  play: async ({ canvasElement }) => {
    const input = getInput(canvasElement);

    // Android: Base UI skips composition tracking and hands composing text on
    input.focus();
    await fireEvent.input(input, {
      target: { value: "あと" },
      inputType: "insertCompositionText",
      isComposing: true,
    });

    await expect(input).toHaveValue("あと");
    await expect(page.queryAllByRole("option")).toHaveLength(0);

    await fireEvent.compositionEnd(input);

    await waitFor(async () => {
      await expect(page.getAllByRole("option")).toHaveLength(2);
    });
  },
};

export const DragSelection: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.type(getInput(canvasElement), "アトレ");
    await waitFor(async () => {
      await expect(highlightedOption()).toHaveTextContent("アトレ吉祥寺店");
    });

    // A press that starts on the input and is released over a result picks it
    // on mouseup, with no click on the item
    const option = highlightedOption();

    if (option === null) {
      throw new Error("No result is highlighted");
    }

    await fireEvent.mouseUp(option, { button: 0 });

    await expect(args.onSelect).toHaveBeenCalledWith(STORES[0]);
  },
};

export const EnterAfterClosingTakesFirstResult: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.type(getInput(canvasElement), "アトレ");
    await page.findByRole("listbox", { name: RESULTS_LABEL });
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => {
      await expect(page.queryByRole("listbox")).not.toBeInTheDocument();
    });

    await userEvent.keyboard("{Enter}");

    await expect(args.onSelect).toHaveBeenCalledWith(STORES[0]);
  },
};

export const PointerLeavingKeepsHighlight: Story = {
  play: async ({ args, canvasElement }) => {
    const input = getInput(canvasElement);

    await userEvent.type(input, "アトレ");

    const second = await page.findByRole("option", {
      name: /アトレヴィ三鷹店/u,
    });

    // Point at the second result, then leave the list for the input. Base UI
    // highlights on mousemove and only treats the leave as a pointer's after a
    // pointermove over the list
    await fireEvent.pointerMove(second, { pointerType: "mouse" });
    await fireEvent.mouseMove(second);
    await waitFor(async () => {
      await expect(highlightedOption()).toHaveTextContent("アトレヴィ三鷹店");
    });
    await fireEvent.pointerOut(second, {
      pointerType: "mouse",
      relatedTarget: input,
    });

    await expect(highlightedOption()).toHaveTextContent("アトレヴィ三鷹店");

    await userEvent.keyboard("{Enter}");

    await expect(args.onSelect).toHaveBeenCalledWith(STORES[1]);
  },
};

export const ClickSelection: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.type(getInput(canvasElement), "大宮");
    await userEvent.click(await page.findByRole("option", { name: /大宮店/u }));

    await expect(args.onSelect).toHaveBeenCalledWith(STORES[2]);
  },
};

export const EscapeCloses: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.type(getInput(canvasElement), "アトレ");
    await page.findByRole("listbox", { name: RESULTS_LABEL });

    await userEvent.keyboard("{Escape}");

    await waitFor(async () => {
      await expect(page.queryByRole("listbox")).not.toBeInTheDocument();
    });
  },
};

export const NoMatches: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.type(getInput(canvasElement), "札幌");

    await expect(
      await page.findByText("該当する店舗がありません")
    ).toBeVisible();

    // Enter with nothing to pick selects nothing
    await userEvent.keyboard("{Enter}");
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
};

export const OutsideClickCloses: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.type(getInput(canvasElement), "アトレ");
    await page.findByRole("listbox", { name: RESULTS_LABEL });

    await userEvent.click(document.body);

    await waitFor(async () => {
      await expect(page.queryByRole("listbox")).not.toBeInTheDocument();
    });
  },
};
