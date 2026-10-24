// 京都の通り名表記（例: 三条通寺町東入）を含む住所
// Longer addresses are skipped below, so the backtracking cost is bounded
// oxlint-disable-next-line sonarjs/super-linear-regex
const KYOTO_STREET_PATTERN = /.+[区郡].+[通り].*[入ル]/u;

// Real addresses are well under this; anything longer is not worth the
// pattern's backtracking
const MAX_ADDRESS_LENGTH = 100;

/**
 * Removes the Kyoto street-name notation (e.g. `三条通寺町東入`, `四条通烏丸東入ル`,
 * `烏丸通塩小路下ル`) so that geocoders can resolve the remaining town name.
 *
 * @param address - The address to simplify
 * @returns The address without the street-name part, or `null` when it has none
 *   or is too long to check
 */
export function simplifyAddress(address: string): string | null {
  if (
    address.length > MAX_ADDRESS_LENGTH ||
    !KYOTO_STREET_PATTERN.test(address)
  ) {
    return null;
  }

  // 「〇〇区」の後ろから「入」「入ル」「上ル」「下ル」までを除去し、残りの町名を直結
  return address.replace(/(?<ward>[区郡])[^区郡]+?(?:入ル?|ル)/u, "$<ward>");
}
