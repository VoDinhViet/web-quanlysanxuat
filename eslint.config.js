//  @ts-check

import { readdirSync } from "node:fs"

import { tanstackConfig } from "@tanstack/eslint-config"
import jsxA11y from "eslint-plugin-jsx-a11y"
import reactHooks from "eslint-plugin-react-hooks"

// Layer boundaries (see .claude/rules/architecture.md "Layer boundaries") — previously
// "enforced by review", now machine-checked. Uses core `no-restricted-imports` rather than
// `import/no-restricted-paths`: the latter resolves the specifier to a filesystem path, and
// this project has no `import/resolver` configured for the `@/*` alias, so every `@/features/...`
// import would silently fail to resolve and the rule would never fire. `no-restricted-imports`
// matches the raw specifier string instead, which needs no resolution and works with the alias
// directly — verified `src` has exactly one relative import (`__root.tsx`'s `"../styles.css?url"`),
// so string matching sees the rest.

const featureNames = readdirSync("src/features", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

// One block per feature, scoped to that feature's own directory via `files` — every OTHER
// feature is off-limits except its `api` barrel. Each importer feature gets exactly one
// config object (not one per (importer, blocked-feature) pair): ESLint flat config doesn't
// merge `no-restricted-imports` options across multiple config objects that match the same
// file — a later object's options fully replace an earlier one's for that rule, so giving
// every feature the *same* `files` glob (e.g. "src/features/**") and relying on `ignores` to
// differentiate them would silently leave only the last-declared feature's restrictions
// active. Scoping `files` to the importer's own directory instead means each source file
// matches exactly one block, and that block's `patterns` array lists every other feature's
// restricted paths in one place. The groups deliberately never match the bare
// `@/features/<x>/api`, so no negation pattern is needed for the barrel itself to stay
// reachable.
const featureBoundaries = featureNames.map((feature) => {
  const otherFeatures = featureNames.filter((name) => name !== feature)

  return {
    name: `qlsx/feature-boundary/${feature}`,
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: otherFeatures.map((other) => ({
            group: [
              `@/features/${other}/api/*`,
              `@/features/${other}/api/*/**`,
              `@/features/${other}/components/**`,
              `@/features/${other}/hooks/**`,
              `@/features/${other}/logic/**`,
              `@/features/${other}/pages/**`,
              `@/features/${other}/schemas/**`,
            ],
            message: `Cross-feature import: read "${other}" only through @/features/${other}/api.`,
          })),
        },
      ],
    },
  }
})

const layerBoundaries = [
  {
    name: "qlsx/lib-is-feature-agnostic",
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/features/*/**"],
              message:
                "src/lib never imports a feature. Move the shared code into src/lib instead.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "qlsx/shared-reads-features-through-the-barrel",
    files: ["src/components/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // Deliberately never matches the bare `@/features/<x>/api` barrel itself —
              // `api/*` requires at least one more path segment after `api/`.
              group: [
                "@/features/*/api/*",
                "@/features/*/api/*/**",
                "@/features/*/components/**",
                "@/features/*/hooks/**",
                "@/features/*/logic/**",
                "@/features/*/pages/**",
                "@/features/*/schemas/**",
              ],
              message:
                "Shared chrome reads a feature only through @/features/<domain>/api — never its components, hooks, schemas, pages, or raw server functions.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "qlsx/routes-compose-pages",
    files: ["src/routes/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/components/**"],
              message:
                "A route composes a page, not components — put the JSX in src/features/<domain>/pages/.",
            },
            {
              group: ["@/features/*/api/server-functions/**"],
              message:
                "A route loader prefetches through a queryOptions factory (api/options), never a raw server function.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "qlsx/api-barrel-surface",
    files: ["src/features/*/api/index.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/api/server-functions/**"],
              message:
                "The api barrel never re-exports a raw server function — a cross-feature caller must not bypass the query cache.",
            },
            {
              group: [
                "@/features/*/components/**",
                "@/features/*/hooks/**",
                "@/features/*/pages/**",
                "@/features/*/schemas/**",
                "@/features/*/logic/**",
              ],
              message:
                "The api barrel exports queryOptions factories, owner-side option hooks and mutation hooks only.",
            },
          ],
        },
      ],
    },
  },
]

export default [
  ...tanstackConfig,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
      "jsx-a11y/label-has-associated-control": "off",
      // This codebase's one use of tabIndex on a non-interactive element is the
      // deliberate <span tabIndex={0}> + disabled Button + Tooltip idiom (see
      // DisabledAction.tsx) — it's what makes the tooltip keyboard-reachable
      // despite the disabled button swallowing focus/pointer events.
      "jsx-a11y/no-noninteractive-tabindex": "off",
    },
  },
  {
    // `useAppSession` (src/lib/session.ts) is a TanStack Start server session
    // helper, not a React hook — the `use` prefix is that API's own naming
    // convention, so rules-of-hooks misfires when it's called from a plain
    // async function here.
    files: ["src/lib/auth-token.ts"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
  ...featureBoundaries,
  ...layerBoundaries,
  {
    ignores: ["eslint.config.js", ".prettierrc"],
  },
]
