## Core Technology Stack

- **Next.js 16** with App Router, React 19, Turbopack, React Compiler (see `next.config.ts`)
  - Node.js 24, pnpm 12 (exact versions in `package.json` / `mise.toml`)
- **TypeScript** with strict type checking
- **Tailwind CSS v4** via `@tailwindcss/turbopack` (Next.js) / `@tailwindcss/vite` (Storybook)
- **Zod v4** for runtime validation (scraped responses, `data/stores.json`)
- **nuqs** for URL state (`NuqsAdapter` in `src/app/layout.tsx`)
- **Drizzle ORM** with Neon Postgres (`src/lib/db/`, migrations in `drizzle/`)
- **Leaflet** (react-leaflet) for map rendering
- **Ultracite** (Oxlint + Oxfmt preset) for linting and formatting — entry points are `pnpm check` / `pnpm fix`
  - Presets (`oxlint.config.ts`): core, react, next, vitest, storybook, anti-slop + js-plugins (github, jsdoc-js, sonarjs, tsdoc, react-doctor)
  - jsPlugins: `eslint-plugin-storybook` (stories only), own rules in `tools/oxlint-rules/`
  - Type-aware lint + type check enabled (oxlint-tsgolint); TS compiler diagnostics surface as lint errors, so there is no separate `tsc --noEmit` script
  - Suppress comments: `// oxlint-disable-next-line <rule>` (`eslint-disable` is NOT honored; unused directives are errors)
  - Ignore lists live in `tools/lint-ignore/` and are shared by `oxlint.config.ts` / `oxfmt.config.ts` (`fallow.toml` cannot import them, so sync manually)
- **fallow** for dead code and import boundaries (`fallow.toml`)
- **Vitest** (coverage reported, no threshold enforced)
- **Storybook 10** with Vitest integration, a11y testing
- **Lefthook** for git hooks (see `lefthook.yml`)
  - Skip with `git commit --no-verify` or `LEFTHOOK=0 git ...`

## Key Patterns

- **State management**: Server Components pass data down as props, nuqs (URL state), no global client state. There is no client-side data fetching library; copy TanStack Query from nextjs-boilerplate if one becomes necessary
- **Data flow**: `pnpm scrape` and the `/api/scrape` cron route scrape the KALDI store map (`src/lib/scraper/`) into Postgres; `src/app/(map)/page.tsx` reads it via `src/lib/db/queries/`
- **Language**: write docs, code comments, test titles, and commit messages in English. User-facing UI copy is out of scope (`<html lang="ja">`)

## Project Rules

Topic-specific rules live in `.claude/rules/` (path-scoped ones load automatically in Claude Code; other agents should read the relevant file before editing):

| File | Covers |
| --- | --- |
| `commands.md` | Dev / lint / test / build commands |
| `directory-structure.md` | `src/` layout, naming, one feature per directory, colocation under `app/` |
| `app-router.md` | Convention files, data fetching |
| `components.md` | Component conventions |
| `testing.md` | Vitest setup |
| `storybook.md` | Story patterns, Storybook MCP |
| `ci.md` | GitHub Actions workflows |
| `git-pr.md` | Branches, commits, PRs |

## Skills Priority

Prefer skill instructions over rules files when they conflict. Always consult the relevant skill:

- **React/TSX components**: `modern-react-guidance`, `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-react-view-transitions`
- **UI/UX review**: `web-design-guidelines`
- **React diagnostics**: `react-doctor` (fix-it-now / pre-commit), `improve-react` (codebase-wide audit and plans)

## MCP Tool Usage

| Purpose | MCP Tool |
| --- | --- |
| **Next.js official docs** | `next-devtools` (`nextjs_docs`, `nextjs_index`, `nextjs_call`) |
| **Other libraries** (React, Zod, Tailwind, Drizzle, etc.) | `context7` (`resolve-library-id` → `query-docs`) |
| **Vitest docs** | `WebFetch` → `https://vitest.dev/llms-full.txt` |
| **Storybook UI dev** (stories, component docs) | `storybook-mcp` (see `.claude/rules/storybook.md` for full tool list) |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
