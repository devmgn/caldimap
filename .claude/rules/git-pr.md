---
description: Branch naming, commit messages, PR workflow
---

# Git & Pull Request Rules

## Branch Naming

`feat/`, `fix/`, `chore/`, `refactor/` + short description. Branch from `main`.

## Commit Messages

Follow Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `chore(deps):`. Include PR number when squash-merging.

## PR Workflow

Branch from `main` → push → open PR (CI runs on the PR; draft PRs are skipped until marked ready) → all checks must pass before merge.
