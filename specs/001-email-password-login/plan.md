# Implementation Plan: Email/Password Login

**Branch**: `001-email-password-login` | **Date**: 2026-07-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-email-password-login/spec.md`

## Summary

Email/password login for the production-management ERP, backed by a sealed `httpOnly`
session cookie and a guarded `(authed)` route group. Most of the feature already exists
in `src/features/auth/`; this plan formalizes it and closes the remaining gaps: real
credential verification against the authentication service (today a stub accepts any
credentials), honoring the `keepSignedIn` choice (today collected but ignored), and the
documented-but-missing dev mock (`VITE_USE_MOCK_AUTH`). Design decisions in
[research.md](./research.md); backend contract in
[contracts/auth-api.md](./contracts/auth-api.md).

## Technical Context

**Language/Version**: TypeScript 5.x (strict, `verbatimModuleSyntax`), React 19

**Primary Dependencies**: TanStack Start (server functions, `useSession`), TanStack
Router / Form, Zod v4, Axios (`src/lib/http.ts`), shadcn/ui, Tailwind CSS v4

**Storage**: no database in this app. Session state lives in an h3 sealed `httpOnly`
cookie (`app-session`, signed with server-only `SESSION_SECRET`). Credentials are
verified by the external authentication service (`VITE_API_URL`).

**Testing**: Vitest (`src/lib/redirect.test.ts` exists; session/login logic gets unit
coverage where extractable)

**Target Platform**: web (internal ERP), server-rendered via TanStack Start on Node

**Project Type**: web application, single project, feature-module layout

**Performance Goals**: standard interactive web expectations; login round-trip well
under 30s including user typing (SC-001); no measurable overhead added by the guard

**Constraints**: tokens never readable by client JS; all user-facing text Vietnamese;
`redirectTo` restricted to internal paths; stub/mock code must be unshippable
(production-build guard)

**Scale/Scope**: internal employees of one company; one login screen, two server
functions, one route guard

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Tick every gate. Any unticked box MUST be justified in "Complexity Tracking" below, or the
design must change. Source: `.specify/memory/constitution.md` v2.0.0.

- [x] **I. Layer boundaries** — `(auth)/login.tsx` and `(authed)/route.tsx` only declare
      (`validateSearch`, `beforeLoad`) and point at `src/features/auth/`; no cross-feature
      imports; shared helpers (`redirect.ts`, `session.ts`, `http.ts`) live in `src/lib/`.
- [x] **II. Trust boundary** — `loginWithEmailPassword` has `.validator(loginSchema)`,
      returns `Promise<ActionResult>`, full `try/catch`, logs once via `logHttpError` with
      the action name. `getCurrentSession` follows the same envelope. Error mapping with a
      `default` branch happens inside the server function.
- [x] **III. Type safety** — types derived with `z.infer`; `import type` used; no `any`/
      `@ts-ignore`. Pre-existing exception noted: `process.env.SESSION_SECRET!` in
      `src/lib/session.ts` — plan replaces it with an explicit startup check (fail fast
      with a clear error instead of a non-null assertion).
- [x] **IV. Security** — tokens only in the `httpOnly` cookie (`AppSessionData`); client
      sees only `CurrentSession { userId }`; `SESSION_SECRET` is not `VITE_`-prefixed;
      `(authed)` has a `beforeLoad` guard; `redirectTo` goes through
      `resolveInternalRedirect`; no logging of secrets or raw responses.
- [x] **V. Accessibility** — labels bound via `htmlFor`/`id`, `aria-invalid` on invalid
      fields, `aria-label` on the password-visibility icon button, explicit `type` on both
      buttons, disabled states while pending.
- [x] **VI. Simplicity** — no new dependencies; no new abstractions (reuses `http.ts`,
      `session.ts`, `ActionResult`); mock is one small file replacing the current stub;
      components stay under limits (login-form.tsx ~228 lines is pre-existing and is a
      form with three fields — splitting is not required by this feature; converge may
      flag it separately).
- [x] **VII. Language boundaries** — UI text Vietnamese; code/identifiers English; error
      codes (`INVALID_CREDENTIALS`) language-neutral; errorCode→message map has a
      `default` branch.
- [x] **Quality gates** — quickstart.md runs `pnpm typecheck`, targeted lint,
      `pnpm format`, Vitest, and a 7-scenario manual pass under `pnpm dev`.

**Post-design re-check (after Phase 1)**: all gates still pass; no Complexity Tracking
entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-email-password-login/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions R1–R5
├── data-model.md        # Phase 1 — session/input/result shapes
├── quickstart.md        # Phase 1 — validation guide
├── contracts/
│   └── auth-api.md      # Phase 1 — auth service + client contracts
├── checklists/
│   └── requirements.md  # from /speckit-specify
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── routes/
│   ├── (auth)/login.tsx                 # route decl only (exists)
│   └── (authed)/route.tsx               # beforeLoad session guard (exists)
├── features/auth/
│   ├── components/
│   │   ├── login-form.tsx               # exists
│   │   └── industrial-brand-panel.tsx   # exists
│   ├── pages/
│   │   ├── auth-layout.tsx              # exists
│   │   └── login-page.tsx               # exists
│   ├── schemas/login.schema.ts          # exists
│   ├── server-functions/
│   │   ├── login-with-email-password.ts # exists — replace stub with real call (R2)
│   │   └── get-current-session.ts       # exists
│   ├── mocks/
│   │   └── auth.mock.ts                 # NEW — dev mock behind VITE_USE_MOCK_AUTH (R3)
│   └── types/login.type.ts              # exists
└── lib/
    ├── session.ts                       # CHANGE — keepSignedIn-aware maxAge (R1),
    │                                    #          drop non-null assertion on secret
    ├── redirect.ts + redirect.test.ts   # exists — add /login-as-unsafe case (R5)
    ├── http.ts                          # exists — reused server-side
    └── server-action.ts                 # exists
```

**Structure Decision**: single-project feature-module layout already mandated by the
constitution; this feature adds one file (`mocks/auth.mock.ts`) and modifies two
(`login-with-email-password.ts`, `session.ts`) plus a small `redirect.ts` follow-up.

## Gap Analysis (existing code → spec)

| Spec item | Status | Work |
| --------- | ------ | ---- |
| FR-001/002 form + validation | ✅ built | — |
| FR-003 real verification | ❌ stub | call `POST /auth/login` server-side (R2) |
| FR-004 httpOnly 7-day session | ✅ built | store real tokens on login (R2) |
| FR-005 guard + redirect capture | ✅ built | — |
| FR-006 safe redirectTo | ✅ built + tested | treat `/login` as unsafe (R5) |
| FR-007 Vietnamese messages | ✅ built | add errorCode→message map w/ default (R2) |
| FR-008 no secret logging | ✅ built | keep during R2 change |
| FR-009 keepSignedIn honored | ❌ ignored | session-cookie vs 7-day maxAge (R1) |
| FR-010 accessibility floor | ✅ built | — |
| Dev mock per .env.example | ❌ missing file | create `auth.mock.ts` + guard (R3) |

## Complexity Tracking

No constitution violations to justify — table intentionally empty.
