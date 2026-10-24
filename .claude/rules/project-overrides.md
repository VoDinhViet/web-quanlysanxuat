# Project overrides

`.claude/rules/ecc/` is the unmodified ECC 2.2.3 rule set (`common`, `typescript`, `react`), copied from the plugin.
Never edit it by hand. Every place this project departs from ECC is listed here, and this file plus the other files
in `.claude/rules/` win when they conflict. Re-copying `ecc/` from the plugin on an ECC upgrade is safe as long as
this file stays.

Each bullet replaces the matching part of the ECC file named in bold.

- **testing.md**, **development-workflow.md** (TDD step), **code-review.md** (test and coverage items),
  **react/testing.md**: do not write tests unless the user asks in that request. No 80% coverage gate, and
  `ecc:tdd-guide` is never used. Verification is the "Definition of done" in `workflow.md`.
- **development-workflow.md** (steps 0 and 1): no GitHub, registry or web search and no PRD/architecture docs
  before every change. Plan in the session, or with `ecc:planner` only for a change that spans several features.
- **agents.md** (Immediate Agent Usage), **code-review.md** (agent usage), **performance.md** (model table):
  the review agents, their order and the model tier for each are in `workflow.md` ("Review agents").
- **git-workflow.md**: commit format and the rule to commit or push only when asked are in `workflow.md`
  ("Commits"). `includeCoAuthoredBy` is `false`, so there is no `Co-Authored-By` trailer.
- **typescript/**, **react/**: `code-style.md`, `type-safety-and-security.md`, `architecture.md` and
  `forms-and-ui.md` win where they differ (naming, `type` vs `interface`, file layout, TanStack Start patterns).
