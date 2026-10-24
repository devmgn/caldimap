# caldimap

カルディコーヒーファームのセール情報を地図上に表示するWebアプリ。

## Tech Stack

| Category  | Technology                               |
| --------- | ---------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)       |
| UI        | React 19, Tailwind CSS v4, Leaflet       |
| State     | nuqs (URL state)                         |
| Data      | Drizzle ORM, Supabase Postgres, Zod v4   |
| Linting   | Ultracite (Oxlint + Oxfmt)               |
| Testing   | Vitest, Storybook 10                     |
| Language  | TypeScript (strict), Node.js 24, pnpm 12 |

## Getting Started

```bash
mise install
pnpm install
pnpm dev
```

## Scripts

```bash
pnpm dev              # Development server
pnpm build            # Production build
pnpm check            # All checks (Ultracite + fallow)
pnpm fix              # Auto-fix lint + format
pnpm test             # Run tests
pnpm test:coverage    # Tests with coverage report
pnpm storybook        # Storybook dev server
pnpm scrape           # Scrape store/sale data
pnpm db:migrate       # Run database migrations
```
