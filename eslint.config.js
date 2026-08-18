//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"
import jsxA11y from "eslint-plugin-jsx-a11y"
import reactHooks from "eslint-plugin-react-hooks"

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
  {
    ignores: ["eslint.config.js", ".prettierrc"],
  },
]
