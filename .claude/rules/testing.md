---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.test-d.ts"
  - "**/*.test-utc.ts"
---

# Testing Rules

## Stack

- **Vitest** (`globals: true` at runtime for Testing Library auto-cleanup; import `describe` / `it` / `expect` / `vi` explicitly from `"vitest"` — no global types)
- **@testing-library/react** for component and hook testing
- **@testing-library/jest-dom** matchers (runtime: `setupFiles`, types: `tsconfig.json` `types`, both via `@testing-library/jest-dom/vitest`)
- `mockReset: true` + `restoreMocks: true` — mock implementations reset and spies restored before each test
- `vitest.global-setup.ts` loads env vars via `@next/env`, sets `TZ=Asia/Tokyo`
- **Type tests**: `typecheck.enabled: true`. Write `expectTypeOf` / `assertType` in `*.test-d.ts` files to have type errors surface as test failures.
- **Time zone independence**: code that must not depend on the runtime time zone (prerendered output is built in UTC) gets a `*.test-utc.ts` file. The `unit-utc` project runs those with `TZ=UTC` in forked processes; stubbing `TZ` inside a regular (threaded) test has no effect. Assert the offset is 0 first, so the test can't pass by accident. `pnpm test:unit` runs both projects.
- **Database queries**: test against an in-process Postgres (`@electric-sql/pglite` + `drizzle-orm/pglite`, migrated from `drizzle/migrations`), never the `DATABASE_URL` in `.env`. Queries take the database as an argument (see `select-stores-with-sales`); a `"use cache"` function can't, since its arguments become the cache key, so keep the cached wrapper thin. Add `// @vitest-environment node` to the file. Module mocking is not allowed (`anti-slop/no-module-mocking`)

## Excluded from Coverage

`**/*.d.ts`, `**/*.test-d.{ts,tsx}`, `**/*.stories.tsx`, Next.js special files
