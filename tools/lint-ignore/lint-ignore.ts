/**
 * Non-source paths shared by Oxlint / oxfmt. `cSpell.ignorePaths` in
 * `.vscode/settings.json` cannot reference this from JSON, so keep it in sync
 * manually.
 */

/** Output of `pnpm db:generate` / `mise lock`. */
export const generatedSources = [
  "drizzle/migrations/meta/**",
  ".mise/locks/**",
];

/** Served assets. */
export const staticAssets = ["public/**"];

/**
 * Vendored external content (agent skills). Formatting it would diverge from
 * upstream and be reverted on the next update.
 */
export const vendoredSources = [".agents/skills/**", ".claude/skills/**"];
