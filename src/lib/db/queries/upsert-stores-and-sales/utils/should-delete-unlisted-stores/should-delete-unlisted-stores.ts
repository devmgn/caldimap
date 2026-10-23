// A full store list never shrinks by more than a few closures at once; a
// larger drop means the page was cut short, so deleting would wipe live stores
const MIN_LISTED_RATIO = 0.9;

/**
 * Decides whether stores missing from the scraped list can be treated as
 * closed and deleted.
 *
 * @param listedCount - Number of stores on the scraped KALDI store list
 * @param currentCount - Number of stores currently in the DB
 * @returns `true` when the list looks complete enough to delete the rest
 */
export function shouldDeleteUnlistedStores(
  listedCount: number,
  currentCount: number
): boolean {
  return currentCount > 0 && listedCount >= currentCount * MIN_LISTED_RATIO;
}
