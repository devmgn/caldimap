---
description: Development, lint, test, and build commands
---

# Development Commands

```bash
pnpm dev                            # Dev server (Turbopack)
pnpm build                          # Production build
pnpm start                          # Start production server
pnpm check                          # All checks (ultracite check = Oxfmt + Oxlint, then lint:dead-code)
pnpm fix                            # Auto-fix lint + format (ultracite fix)
pnpm lint:dead-code                 # Dead code detection (fallow dead-code + --production)
pnpm lint:fallow                    # Full fallow scan: dead-code + dupes + health + security (advisory, not in check)
mise run lint:workflows             # GitHub Actions lint (actionlint + zizmor)
pnpm test                           # Run all tests
pnpm test:unit                      # Unit tests only (typecheck included)
pnpm test:oxlint-rules              # Tests for the custom oxlint rules in tools/
pnpm test:watch                     # Watch mode
pnpm test:coverage                  # Tests with coverage report
pnpm test:update                    # Update snapshots
pnpm vitest run path/to/test.test.ts  # Specific test file
pnpm storybook                      # Storybook dev server
pnpm build-storybook                # Storybook static build
pnpm analyze                        # Bundle analysis via Turbopack (no build artifacts; serves a UI)
pnpm scrape                         # Scrape stores and sales into data/stores.json (and the DB if configured)
pnpm db:generate                    # Generate Drizzle migrations
pnpm db:migrate                     # Run Drizzle migrations
pnpm db:studio                      # Open Drizzle Studio
```

## Lint / Format (Ultracite)

`pnpm check` / `pnpm fix` are the entry points. Use the CLI directly to scope a run:

```bash
pnpm ultracite check src/lib/scraper   # Check specific paths
pnpm ultracite fix src/lib/scraper     # Fix specific paths
pnpm ultracite doctor                        # Diagnose the lint/format setup
pnpm exec oxlint src/...                     # Lint only (skip the formatter pass)
```

Note: oxlint prints nothing when there are no violations — silence means clean.
