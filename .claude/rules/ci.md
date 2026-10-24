---
paths:
  - ".github/**"
---

# CI/CD Rules

- `main` + feature branches. **ci.yml** triggers on `pull_request` (`opened` / `synchronize` / `reopened` / `ready_for_review`) and every job has `if: !github.event.pull_request.draft`, so draft PRs (e.g. Renovate PRs held as drafts and rebased) do not run CI; undrafting runs it. **actions-lint.yml** runs on `push` to every branch, **skills-update.yml** on a weekly `schedule` + `workflow_dispatch`
- **ci.yml**: jobs `Build` (Postgres service + `pnpm db:migrate` + `pnpm build`, since `/` prerenders DB data) / `Lint` (`pnpm check`) / `Test` (`pnpm test:unit` + `pnpm test:oxlint-rules`). Job IDs double as required status check names — do not rename
- Path-scoped: **actions-lint.yml** (`.github/**`, `mise.toml`, `mise.lock`)
- Shared setup (`.github/actions/setup`): `pnpm/action-setup`, `setup-node` with `node-version-file: mise.toml`
- actionlint / zizmor are installed by `jdx/mise-action` from `mise.toml` (`--locked` via `mise.lock`), matching the versions lefthook runs locally. skills-update.yml installs only `node` + `npm:skills` and runs `mise run --skip-tools skills:update`
- **skills-update.yml**: the `Update` job (read-only) runs the skills CLI and uploads a patch; the `PullRequest` job (write) only applies it and opens/updates a `chore/update-agent-skills` PR via `peter-evans/create-pull-request`. Keep third-party code out of the write job. It pushes and opens the PR with a GitHub App token (`vars.BOT_CLIENT_ID` / `secrets.BOT_PRIVATE_KEY` in the `bot` environment), because pushes with `GITHUB_TOKEN` do not trigger workflows and dispatched ci.yml runs do not satisfy the PR's required status checks. Do not use a PAT
- Action versions pinned by commit SHA
