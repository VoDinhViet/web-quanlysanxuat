<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Bump rationale: MAJOR. Principle VII ("Vietnamese prose, neutral domain values") was
redefined and narrowed into Principle VII ("Language Boundaries"), and the governance
section's runtime-guidance pointer was repointed from AGENTS.md + docs/agents/ to
CLAUDE.md after those files were consolidated. Both are backward-incompatible changes
to previously ratified text, so MAJOR is required even though no principle was dropped.

Principles (7, unchanged in substance except VII):
  I.   Layer Boundaries Are Absolute
  II.  Server Functions Are the Only Trust Boundary
  III. Type Safety Is Not Negotiable
  IV.  Secure By Default
  V.   Accessibility Is a Requirement
  VI.  Simplicity Before Abstraction
  VII. Language Boundaries  (was: "Vietnamese prose, neutral domain values")

Language change: entire document translated from Vietnamese to English so that this
file, CLAUDE.md, and the plan-template gate share one language.

Sections: unchanged (Core Principles, Technology Constraints, Development Workflow &
Quality Gates, Governance).

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gate rewritten in English,
     still a 1:1 mapping onto Principles I–VII plus a quality gate
  ✅ CLAUDE.md — created; now the single runtime-guidance file, replacing AGENTS.md and
     docs/agents/*.md (deleted). No contradiction with this constitution.
  ✅ .specify/templates/spec-template.md — reviewed; no constitution references, no change
  ✅ .specify/templates/tasks-template.md — reviewed; no constitution references, no change
  ⚠ .specify/templates/commands/*.md — does not exist in spec-kit v0.12.9 (commands ship
    as .claude/skills/); nothing to reconcile

Removed references: AGENTS.md, docs/agents/project.md, docs/agents/code-standards.md,
docs/agents/frontend.md, docs/agents/server-actions.md, docs/agents/workflow.md — all
deleted and folded into CLAUDE.md.

Deferred TODOs: none. RATIFICATION_DATE preserved from v1.0.0 (2026-07-10); the original
adoption date does not change on amendment.
-->

# Web QLSX Constitution

This document sits above every other convention. It states the constraints that cannot be
traded away. Day-to-day operational guidance lives in `CLAUDE.md`.

## Core Principles

### I. Layer Boundaries Are Absolute (NON-NEGOTIABLE)

`src/routes/` MUST contain route declarations only (`createFileRoute`, `validateSearch`,
`beforeLoad`, `loader`) plus a `component` pointing at a page in `src/features/`.
`src/components/ui/` is shadcn-generated and MUST NOT hold business logic. A feature MUST NOT
import from another feature; shared code MUST be promoted to `src/lib/` or
`src/components/shared/`. `src/routeTree.gen.ts` is generated and MUST NOT be hand-edited.

*Rationale:* a boundary breached once cannot be restored by code review. Logic that leaks into
the declaration layer or the primitive layer replicates, and hand-edits to generated files are
destroyed on the next regeneration.

### II. Server Functions Are the Only Trust Boundary (NON-NEGOTIABLE)

Every server function MUST validate its input with `.validator(zodSchema)` — no exceptions.
Every server function MUST return `ActionResult<T>` and MUST NOT throw to the client; errors are
return values. The entire `.handler` body MUST sit inside `try/catch`, with an explicit
`Promise<ActionResult<T>>` return type. Errors MUST be logged exactly once, at the `catch`, with
the action name as context.

*Rationale:* client input is untrusted, and an exception crossing the server/client boundary
leaks infrastructure detail. A discriminated union forces the compiler to make callers handle
the failure branch.

### III. Type Safety Is Not Negotiable

`any`, `@ts-ignore`, `@ts-expect-error`, and `!` (non-null assertion) MUST NOT be used to make
the type checker pass. Every `as` MUST come with an answer to: if this assertion is wrong, where
does the system break? Domain types MUST be free of presentation detail — no CSS classes, image
paths, or display strings in a model. Type-only imports MUST use `import type`
(`verbatimModuleSyntax` is enabled).

*Rationale:* `!` and `any` do not remove risk. They move it from build time to run time, where
it costs far more.

### IV. Secure By Default (NON-NEGOTIABLE)

Tokens MUST live only in the `httpOnly` session cookie — never `localStorage`, `sessionStorage`,
React state, or props. Secrets MUST NOT sit behind a `VITE_` prefix; every `VITE_` variable ships
inside the browser bundle. Every route under `(authed)` MUST carry a `beforeLoad` session guard.
Tokens, passwords, and raw backend responses MUST NOT be logged. A `redirectTo` value MUST be
verified as an internal path before it is followed.

*Rationale:* this is an internal ERP holding personnel and production data. A route missing its
guard is a data leak, not a UI bug.

### V. Accessibility Is a Requirement, Not a Polish Task

Icon-only buttons MUST have an `aria-label`. Invalid inputs MUST have `aria-invalid`. Labels MUST
be bound to their control via `htmlFor` ↔ `id`. Every `<button>` inside a form MUST declare an
explicit `type`. Screen-reader-only content uses `.sr-only`.

*Rationale:* retrofitting accessibility always costs more than building it in, and it is never
the thing that gets prioritized once a deadline exists.

### VI. Simplicity Before Abstraction

An abstraction MUST NOT be extracted before its third use — two similar call sites may be a
coincidence. Components exceeding ~150 lines, and functions exceeding ~40 lines or three levels
of nesting, MUST be split. Dead code and duplicate files MUST be deleted in the same commit that
introduces their replacement. New dependencies MUST be approved beforehand; check `package.json`
first.

*Rationale:* dead code is code that will eventually be edited by mistake. Early abstraction locks
in a design before the problem is understood.

### VII. Language Boundaries

User-facing text MUST be Vietnamese. Code, identifiers, comments, and documentation MUST be
English. Domain values — enums, status codes, API keys — MUST be language-neutral (`"active"`,
never `"Hoạt động"`). Mapping a backend error code to a Vietnamese message MUST happen inside the
server function and MUST have a safe `default` branch. Enum-to-label maps MUST use
`Record<Enum, string>` so the compiler catches a missing case.

*Rationale:* using a display string as a domain value breaks i18n, filtering, and backend
integration simultaneously — and a `switch` with a `default` swallows the mistake instead of
reporting it.

## Technology Constraints

Fixed stack: TanStack Start (React 19 + Vite), TanStack Router / Form / Table, Zod v4, Axios,
shadcn/ui on Base UI + Radix, Tailwind CSS v4, Vitest. The package manager is `pnpm`.

- Forms MUST use TanStack Form with Zod as the single validation source (`noValidate` on the
  `<form>`). Types are derived with `z.infer`; they MUST NOT be declared twice.
- Styling MUST use semantic tokens (`text-foreground`, `bg-card`), never raw colors
  (`text-gray-900`), which break dark mode. Class composition MUST go through `cn()`.
- Shareable state — filters, pagination, tabs — MUST live in Zod-validated URL search params, not
  in `useState`.
- Formatting is decided by Prettier (no semicolons, double quotes). Style is not reviewed.

## Development Workflow & Quality Gates

A change is done only when every gate below is green:

1. `pnpm typecheck` is clean.
2. `pnpm exec eslint <changed-file>` is clean for every file touched.
3. `pnpm format` has been run.
4. The full `git diff` has been re-read: no temp files, no `console.log`, no out-of-scope edits.
5. The affected flow has been exercised for real with `pnpm dev`. A green typecheck does NOT
   prove the feature works.
6. No new dead code, no duplicate files.

ESLint rules MUST NOT be disabled inline to dodge an error — fix the cause. Changes MUST NOT be
committed or pushed unless explicitly requested.

## Governance

This constitution supersedes all other conventions on conflict. Where the constitution and
`CLAUDE.md` disagree, the constitution wins and `CLAUDE.md` MUST be corrected.

- **Amendments** MUST include: the updated file, a semver version bump, and a Sync Impact Report
  at the top listing every affected artifact.
- **Versioning**: MAJOR for backward-incompatible removal or redefinition of a principle; MINOR
  for a new principle/section or materially expanded guidance; PATCH for clarifications, wording,
  and typo fixes that do not change meaning.
- **Compliance**: every PR and every review MUST verify conformance with Principles I–VII. A
  violation MUST be justified in the "Complexity Tracking" table of `plan.md`, or rejected.
- **Runtime guidance**: `CLAUDE.md` is the entry point. Known technical debt is tracked in its
  "Known issues" table.

**Version**: 2.0.0 | **Ratified**: 2026-07-10 | **Last Amended**: 2026-07-10
