import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import next from "ultracite/oxlint/next";
import nextJsPlugins from "ultracite/oxlint/next/js-plugins";
import react from "ultracite/oxlint/react";
import storybook from "ultracite/oxlint/storybook";
import vitest from "ultracite/oxlint/vitest";
import {
  generatedSources,
  staticAssets,
  vendoredSources,
} from "./tools/lint-ignore/index.ts";

const jsPlugins = selectJsPlugins([
  "github",
  "jsdoc-js",
  "sonarjs",
  "tsdoc",
  "react-doctor",
]);

export default defineConfig({
  env: core.env,
  extends: [
    core,
    react,
    next,
    vitest,
    storybook,
    nextJsPlugins,
    antiSlop,
    jsPlugins,
  ],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    ...staticAssets,
    ...generatedSources,
    ...vendoredSources,
  ],
  jsPlugins: [...jsPlugins.jsPlugins, "./tools/oxlint-rules/index.ts"],
  settings: {
    ...jsPluginSettings,
    vitest: { typecheck: true },
  },
  options: {
    reportUnusedDisableDirectives: "error",
    respectEslintDisableDirectives: false,
    typeAware: true,
    typeCheck: true,
  },
  rules: {
    // Forbid console.log. Allow warn / error as intentional output
    "eslint/no-console": ["error", { allow: ["error", "warn"] }],

    // The Ultracite tanstack preset turned this off in nextjs-boilerplate; keep
    // the same behaviour now that the preset is gone
    "eslint/sort-keys": "off",

    // custom-rules/no-restricted-syntax forbids top-level arrows, which conflicts
    // with func-style enforcing expressions
    "eslint/func-style": "off",
    "react/function-component-definition": [
      "error",
      { namedComponents: "function-declaration" },
    ],

    // ── custom rules (jsPlugin: ./tools/oxlint-rules/) ──
    "custom-rules/no-index-tsx": "error",
    "custom-rules/no-restricted-syntax": [
      "error",
      {
        selector:
          "Program > VariableDeclaration > VariableDeclarator[init.type='ArrowFunctionExpression']",
        message: "Use function declarations at the top level",
      },
      {
        selector:
          "Program > ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[init.type='ArrowFunctionExpression']",
        message: "Use function declarations for exported functions",
      },
    ],
    "custom-rules/sort-hook-deps": "error",
  },
  overrides: [
    {
      // Storybook stories
      files: ["**/*.stories.*", "**/*.story.*"],
      jsPlugins: ["eslint-plugin-storybook"],
      rules: {
        "react/rules-of-hooks": "off",

        // eslint-plugin-storybook (jsPlugin)
        "storybook/await-interactions": "error",
        "storybook/context-in-play-function": "error",
        "storybook/csf-component": "error",
        "storybook/default-exports": "error",
        "storybook/hierarchy-separator": "error",
        "storybook/meta-inline-properties": "error",
        "storybook/meta-satisfies-type": "error",
        "storybook/no-redundant-story-name": "error",
        "storybook/no-renderer-packages": "error",
        "storybook/no-stories-of": "error",
        "storybook/no-title-property-in-meta": "error",
        "storybook/prefer-pascal-case": "error",
        "storybook/story-exports": "error",
        "storybook/use-storybook-expect": "error",
        "storybook/use-storybook-testing-library": "error",
      },
    },
    {
      // Storybook main config
      files: [".storybook/main.*"],
      rules: {
        "storybook/no-uninstalled-addons": "error",
      },
      jsPlugins: ["eslint-plugin-storybook"],
    },
  ],
});
