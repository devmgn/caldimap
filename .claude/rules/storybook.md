---
paths:
  - "**/*.stories.tsx"
  - ".storybook/**"
---

# Storybook Rules

## Stack

- **Storybook 10** with `@storybook/nextjs-vite` framework
- Addons: a11y, docs, vitest, MCP (`@storybook/addon-mcp`)
- a11y test mode: `"todo"` (shown in test UI only)
- Autodocs enabled via tags: `["autodocs"]`

## Story Pattern

```typescript
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { ComponentName } from "./component-name";

const meta = {
  component: ComponentName,
  args: { onClick: fn() },
} satisfies Meta<typeof ComponentName>;

export default meta; // default export allowed only in story files
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {};
```

## Assertions

A story without a `play` function passes even if it renders the wrong data, so assert on the rendered result. Scope queries to the component (e.g. `within(canvas.getByRole("list", { name: "Stores" }))`) rather than the whole document.

## MCP Integration

`@storybook/addon-mcp` serves the MCP endpoint at `http://localhost:6006/mcp`, registered as `storybook-mcp` in `.mcp.json`. Tools are grouped into toolsets, toggled via `toolsets` in `.storybook/main.ts` (each defaults to `true`).

| Toolset | Tool | Purpose |
| --- | --- | --- |
| dev | `stories-changed` | Stories affected by local file changes |
| dev | `stories-find-by-component` | Map component source files to the stories that render them |
| dev | `get-storybook-story-instructions` | Story authoring and interaction test conventions |
| dev | `stories-preview` | Render story previews / return preview URLs |
| dev | `review-create` | Publish a curated review page |
| docs | `docs-list` | Component index and documentation entries |
| docs | `docs-show` | Component documentation with props and story samples |
| docs | `docs-show-story` | A single story with its documentation |
| test | `test-run` | Run tests for the given stories, including a11y results |

`review-create` is registered for direct MCP clients only when `features.experimentalReview` is on; the `storybook ai` CLI channel gets it by default.

The docs toolset needs a components manifest. `@storybook/nextjs-vite` emits one automatically, so the `features.componentsManifest` flag from the install docs is not required here.

### Workflow

1. **Never hallucinate component properties.** Resolve the component with `docs-list`, then verify every prop via `docs-show`. Never read props from source or type definitions.
2. Run `get-storybook-story-instructions` before creating or updating stories.
3. After changing anything that affects how the UI looks, surface it with `stories-preview`. A shared file has no stories of its own — preview the stories of the components that consume it.
4. Validate with `test-run`. Typecheck and lint do not replace story tests.

## Key Points

- Import types from `@storybook/nextjs-vite` (NOT `@storybook/react`)
- Import test utils from `storybook/test` (NOT `@storybook/testing-library`)
