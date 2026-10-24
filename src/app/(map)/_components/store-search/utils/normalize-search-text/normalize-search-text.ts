// Hiragana that has a katakana counterpart exactly 0x60 code points later
const HIRAGANA = /[ぁ-ゖ]/gu;
const KATAKANA_OFFSET = 0x60;

function toKatakana(char: string) {
  return String.fromCodePoint((char.codePointAt(0) ?? 0) + KATAKANA_OFFSET);
}

/**
 * Folds the differences a user shouldn't have to match: full-width and
 * half-width forms (NFKC), letter case, and hiragana versus katakana.
 *
 * @param text - Text to normalize
 * @returns The normalized text
 */
export function normalizeSearchText(text: string): string {
  return text.normalize("NFKC").toLowerCase().replaceAll(HIRAGANA, toKatakana);
}
