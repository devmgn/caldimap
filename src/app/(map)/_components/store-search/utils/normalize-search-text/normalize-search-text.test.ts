import { describe, expect, it } from "vitest";
import { normalizeSearchText } from "./normalize-search-text";

describe(normalizeSearchText, () => {
  it.each([
    ["full-width letters and digits", "ＬＵＭＩＮＥ１", "lumine1"],
    ["half-width katakana", "ｱﾄﾚ", "アトレ"],
    ["hiragana", "あとれ", "アトレ"],
    ["upper case", "Lumine", "lumine"],
  ])("folds %s", (_, input, expected) => {
    expect(normalizeSearchText(input)).toBe(expected);
  });
});
