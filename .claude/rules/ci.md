---
paths:
  - ".github/**"
---

# CI/CD Rules

- `main` + feature branches. Workflows trigger on `push` with `branches-ignore: main`, except **actions-lint.yml** (every branch)
- **ci.yml**: jobs `Build` (`pnpm build`) / `Lint` (`pnpm check`) / `Test` (`pnpm test:unit`). Job IDs double as required status check names — do not rename
- Path-scoped: **actions-lint.yml** (`.github/**`, `mise.toml`, `mise.lock`)
- Shared setup (`.github/actions/setup`): `pnpm/action-setup`, `setup-node` with `node-version-file: mise.toml`
- actionlint / zizmor are installed by `jdx/mise-action` from `mise.toml` (pinned via `mise.lock`). Run the same checks locally with `mise run lint:workflows`
- Action versions pinned by commit SHA
