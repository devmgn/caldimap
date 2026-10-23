---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.test-d.ts"
---

# Testing Rules

## Stack

- **Vitest** (`globals: true` at runtime for Testing Library auto-cleanup; import `describe` / `it` / `expect` / `vi` explicitly from `"vitest"` — no global types)
- **@testing-library/react** for component and hook testing
- **@testing-library/jest-dom** matchers (runtime: `setupFiles`, types: `tsconfig.json` `types`, both via `@testing-library/jest-dom/vitest`)
- `mockReset: true` + `restoreMocks: true` — mock implementations reset and spies restored before each test
- `vitest.global-setup.ts` loads env vars via `@next/env`, sets `TZ=Asia/Tokyo`
- **Type tests**: `typecheck.enabled: true`. Write `expectTypeOf` / `assertType` in `*.test-d.ts` files to have type errors surface as test failures.

## Excluded from Coverage

`**/*.d.ts`, `**/*.test-d.{ts,tsx}`, `**/*.stories.tsx`, Next.js special files
