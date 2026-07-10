# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Tick every gate. Any unticked box MUST be justified in "Complexity Tracking" below, or the
design must change. Source: `.specify/memory/constitution.md` v2.0.0.

- [ ] **I. Layer boundaries** — New routes only declare and point at a page in `src/features/`.
      No business logic in `src/routes/` or `src/components/ui/`. No cross-feature imports.
      No hand-edits to `src/routeTree.gen.ts`.
- [ ] **II. Trust boundary** — Every server function has `.validator(zodSchema)`, returns
      `ActionResult<T>` with an explicit return type, wraps its body in `try/catch`, and logs
      exactly once at the `catch`. Nothing throws to the client.
- [ ] **III. Type safety** — No `any`, `@ts-ignore`, `@ts-expect-error`, or `!`. Domain types
      carry no CSS classes, image paths, or display strings. Type-only imports use `import type`.
- [ ] **IV. Security** — Tokens only in the `httpOnly` cookie. No secrets behind `VITE_`. New
      `(authed)` routes carry a `beforeLoad` guard. No logging of tokens, passwords, or raw
      responses. `redirectTo` is verified as an internal path.
- [ ] **V. Accessibility** — Icon buttons have `aria-label`; invalid inputs have `aria-invalid`;
      labels bind `htmlFor` ↔ `id`; form `<button>`s declare `type`.
- [ ] **VI. Simplicity** — No abstraction before the third use. Components ≤ 150 lines; functions
      ≤ 40 lines and ≤ 3 levels of nesting. No unapproved dependencies. Dead code deleted in the
      same commit.
- [ ] **VII. Language boundaries** — User-facing text in Vietnamese; code and identifiers in
      English; domain values language-neutral (`"active"`, not `"Hoạt động"`); error-code maps have
      a `default` branch; enum→label via `Record<Enum, string>`.
- [ ] **Quality gates** — The plan includes `pnpm typecheck`, targeted lint, `pnpm format`, and
      exercising the affected flow with `pnpm dev`.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
