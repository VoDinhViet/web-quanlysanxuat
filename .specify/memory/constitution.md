<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 1.2.0
Bump rationale: MAJOR is excluded — no principle was removed or redefined, and no
previously compliant code becomes non-compliant. PATCH is too weak — the UI-kit
workflow rules and the lint-gate error/warning distinction are new obligations, not
rewording. Materially expanded guidance → MINOR.

Modified sections:
  - Principle I (Layered Architecture): the canonical directory layout is now stated
    as an explicit tree — src/routes/ with (auth)/(authed) route groups, src/features/
    per-domain folders, src/components/{ui,shared}/, src/lib/ — per user request.
  - Technology and Code Standards: shadcn/ui (radix-vega preset, Radix primitives,
    Tabler icons, Geist font) added to the stack; a "UI components" block now states
    how components are added and what may be edited in generated files.
  - Development Workflow and Quality Gates: "lint is clean" is now defined as zero
    errors; warnings are tolerated only inside generated src/components/ui/ files and
    MUST NOT be introduced in hand-written code.

Added sections: none
Removed sections: none

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — "Constitution Check" uses a dynamic gate
     placeholder resolved per-plan; no edit needed, compatible as written.
  ✅ .specify/templates/spec-template.md — mandatory sections align; no constitution
     rule adds or removes a required section.
  ✅ .specify/templates/tasks-template.md — task phases align; no new task category
     is introduced by this amendment.
  ✅ .specify/templates/checklist-template.md — no principle-driven changes required.
  ✅ No .specify/templates/commands/ directory exists (skills-mode install); no
     agent-specific references found anywhere under .specify/templates/.
  ⚠ README.md — still the unmodified TanStack Start starter text. Does not contradict
     this constitution, but describes none of it. Rewrite when the app takes shape.

Known constitution-vs-reality gaps (not placeholders, tracked here):
  - Zod is named in the stack and required by Principle III, but is not yet in
    package.json. It is installed with the first feature that validates input; a plan
    whose feature touches forms or server functions MUST add it.
  - src/lib/server-action.ts (ActionResult) and src/lib/http.ts do not exist yet; they
    are created by the first feature that needs a server function, per Principle III.

Deferred / follow-up TODOs:
  - TODO(RATIFICATION_DATE): Recorded as the date this constitution was first written
    (2026-07-10). If the QLSX project formally adopted these rules earlier under
    web-qlsx-start, correct this date.
-->

# QLSX Frontend Constitution

Internal ERP for manufacturing management (Quản Lý Sản Xuất). UI text is Vietnamese;
code and identifiers are English.

## Core Principles

### I. Layered Architecture

Routes declare; features implement. A file under `src/routes/` MUST contain only
`createFileRoute`, `validateSearch`, `beforeLoad`, `loader`, and a `component` that points at a
page in `src/features/`. Business logic in a route file is a violation, not a shortcut.

The canonical layout:

```text
src/routes/       # Route declarations ONLY. No business logic.
  (auth)/         # Route group — login layout
  (authed)/       # Route group — sidebar layout
src/features/     # All business logic, one folder per domain
  <feature>/{components,pages,schemas,server-functions,types}/
src/components/ui/      # shadcn-generated. Do not add business logic.
src/components/shared/  # Cross-feature components
src/lib/          # http, session, utils
```

- Each domain owns one folder under `src/features/<feature>/`, internally organized as
  `{components,pages,schemas,server-functions,types}/`.
- A feature MUST NOT import from another feature. Shared code is promoted to `src/lib/` or
  `src/components/shared/` before the second consumer exists.
- Generated files (`src/routeTree.gen.ts`) MUST NOT be edited by hand.
- Generated UI primitives (`src/components/ui/`) MUST NOT acquire business logic.

Rationale: the import graph is the only thing preventing a feature-sliced codebase from
collapsing into a single implicit module. Once two features import each other, neither can be
deleted, tested, or reasoned about alone. This structure cannot be inferred from the code, so
it MUST be stated.

### II. Type Safety Without Escape Hatches

`any`, `@ts-ignore`, `@ts-expect-error`, and the non-null assertion `!` MUST NOT be used to
satisfy the type checker. Fix the cause.

- Type-only imports MUST use `import type` (`verbatimModuleSyntax` is enabled).
- Prefer `type` over `interface` unless declaration merging is genuinely required.
- A lint rule MUST NOT be disabled inline to silence an error.

Rationale: every escape hatch converts a compile-time failure into a runtime failure, and
relocates it away from the code that caused it. The type checker is the cheapest test suite the
project has.

### III. Server Functions Return, Never Throw

Every server function follows one contract, without exception: validate input with a Zod
schema via `.validator()`, declare an explicit `Promise<ActionResult>` return type, and convert
every error into a returned value.

- A server function MUST NOT throw to the client. Errors are return values, so the
  discriminated union forces callers to handle failure.
- Backend error codes MUST be mapped to Vietnamese user messages inside the server function,
  always with a `default` branch. Raw backend errors, stack traces, and infrastructure details
  MUST NOT reach the client.
- Errors are logged exactly once, at the `catch`.
- The shared `http` client MUST be used. Ad-hoc HTTP client instances MUST NOT be created.

Rationale: a thrown error crosses the network boundary as an opaque 500 and strands the caller
with no typed failure branch. Returning `ActionResult<T>` makes failure a case the compiler
insists on handling.

### IV. Server-Side Secrets and Sessions

Auth tokens live only in the `httpOnly` session cookie. They MUST NOT be placed in
`localStorage`, `sessionStorage`, React state, or props.

- A secret MUST NOT sit behind a `VITE_` prefix. Those variables are bundled into the browser.
  Server-only values (for example `SESSION_SECRET`) MUST stay unprefixed; only genuinely public
  values (for example `VITE_API_URL`) may carry it.
- Every authenticated route MUST have a `beforeLoad` session guard.
- Tokens, passwords, and raw backend responses MUST NOT be logged.
- A `redirectTo` value MUST be verified as an internal path (begins with `/`, not `//`) before
  redirecting, or the application has an open redirect.

Rationale: each of these is a single line of code away from a credential leak that no test will
catch and no type will reject. They are enumerated because they are invisible in review.

### V. Verification by Execution

A change is verified by running the affected flow, not by compiling it. A green typecheck does
not prove the feature works, and MUST NOT be reported as if it does.

- Test outcomes MUST be reported faithfully. A skipped step is stated as skipped; a failing
  test is stated as failing, with its output.
- The full diff MUST be re-read before a change is considered done: no stray `console.log`, no
  temp files, no out-of-scope edits.

Rationale: the type checker proves the code is consistent with itself, never that it does what
was asked. Only execution distinguishes the two.

## Technology and Code Standards

Stack: TanStack Start (React 19, TypeScript, Vite 8), Tailwind CSS v4, shadcn/ui
(radix-vega preset, Radix primitives, Tabler icons, Geist font), Zod for validation,
pnpm as the package manager, Vitest for tests, ESLint and Prettier for the toolchain.

- **UI components come from the shadcn registry.** Add one with
  `pnpm exec shadcn add <name> -y`, then run `pnpm exec eslint --fix` on the generated
  files. Manual edits to `src/components/ui/` are limited to lint compliance — never
  styling forks or business logic (Principle I). Do not hand-write a primitive the
  registry already provides.
- **Formatting is not a discussion.** Prettier owns it: no semicolons, double quotes,
  2-space indent, 80 columns, LF endings. Class ordering is handled by
  `prettier-plugin-tailwindcss`. Do not hand-format around it.
- **Language boundary.** UI text is Vietnamese. Code, identifiers, comments, and commit
  messages are English.
- **Domain types carry no presentation data.** No CSS classes, image URLs, or display strings
  in a model. Domain values are language-neutral (`"active"`, never `"Hoạt động"`). Vietnamese
  labels are mapped in the UI via `Record<Enum, string>` so the compiler catches a missing case.
- **Styling.** Class names are composed with `cn()`. Semantic Tailwind tokens
  (`text-foreground`, `bg-card`) MUST be used instead of raw colors (`text-gray-900`), which
  break dark mode.
- **Accessibility.** Icon-only buttons need `aria-label`. Invalid inputs need `aria-invalid`.
  Labels need `htmlFor` matching an `id`. Every `<button>` inside a form needs an explicit
  `type`.
- **Forms.** Zod is the single validation source. Forms set `noValidate`, call
  `preventDefault()` and `stopPropagation()` explicitly, and derive types via `z.infer` rather
  than declaring them twice. Error styling is gated on `field.state.meta.isTouched`.
- **Shareable state** — filters, pagination, tabs — belongs in Zod-validated URL search params,
  not `useState`. Optional params use `.catch(undefined)` so a malformed URL cannot crash the
  route.
- **Restraint.** An abstraction is extracted on the third use, not the second. Components over
  ~150 lines and functions over ~40 lines are split. Dead code is deleted in the same change
  that replaces it.
- **Dependencies.** A dependency MUST NOT be added without approval. Check `package.json`
  first; what is needed is often already present.

## Development Workflow and Quality Gates

This project uses spec-kit (v0.12.9, pinned). Skills live in `.claude/skills/` and are invoked
as `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement` — the hyphen
form, not the dot form shown in upstream documentation.

Spec-driven development is used for new feature modules. A twenty-line bug fix does not get a
spec.

**Definition of done.** A change is complete when all of the following hold:

1. `pnpm typecheck` is clean.
2. `pnpm lint` is clean.
3. `pnpm format` has been run.
4. The full diff has been re-read (Principle V).
5. The affected flow has been exercised in a running app (Principle V).

Gates 1–3 are enforceable today and MUST NOT be reported as passing without being run. The
repo-wide `pnpm lint` is currently clean, so a scoped `pnpm exec eslint <file>` is a
convenience, never an excuse: a failure anywhere in the tree blocks the change.

"Lint is clean" means zero errors. Warnings are tolerated only inside generated
`src/components/ui/` files, where they arrive with the registry code; hand-written code
MUST NOT introduce new warnings. A warning that `eslint --fix` can resolve is resolved,
not tolerated.

Generated files are excluded from the gates by configuration, not by ignoring their output:
`src/routeTree.gen.ts` is listed in both `eslint.config.js` and `.prettierignore`.

**Never.** Do not commit or push unless explicitly asked. Do not create documentation or
summary files unless asked.

## Governance

This constitution supersedes all other practices. Where it conflicts with `CLAUDE.md`, agent
instructions, or established habit, this constitution wins, and the conflicting document is
corrected in the same change.

**Amendment procedure.** An amendment requires: a written statement of the rule being changed
and why; an updated version number per the policy below; a Sync Impact Report recorded at the
top of this file; and propagation to every affected template and guidance document in the same
change. A principle MUST NOT be weakened silently.

**Versioning policy.** Semantic versioning applies to governance:

- **MAJOR** — a principle is removed, or redefined in a way that makes previously compliant
  code non-compliant.
- **MINOR** — a principle or section is added, or existing guidance is materially expanded.
- **PATCH** — clarification, wording, or typo fixes carrying no semantic change.

**Compliance review.** Every plan produced by `/speckit-plan` is gated against these principles
before Phase 0 research and re-checked after Phase 1 design. A violation is either fixed or
recorded in the plan's Complexity Tracking table with the simpler alternative that was rejected
and why. Complexity MUST be justified, never assumed.

**Runtime guidance.** Day-to-day development guidance belongs in `CLAUDE.md` at the repository
root. That file elaborates; this file governs.

**Version**: 1.2.0 | **Ratified**: 2026-07-10 | **Last Amended**: 2026-07-10
