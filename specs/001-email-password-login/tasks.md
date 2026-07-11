# Tasks: Email/Password Login

**Input**: Design documents from `/specs/001-email-password-login/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-api.md

**Tests**: only where the spec demands automated coverage (SC-003, redirect safety).
No TDD requested.

**Organization**: grouped by user story. This feature is a retroactive sync — tasks
already satisfied by the existing code are pre-checked `[x]` (verified against the
working tree on 2026-07-11). Unchecked tasks are the real remaining work; see the Gap
Analysis table in [plan.md](./plan.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 = sign in, US2 = protected areas, US3 = stay signed in

## Phase 1: Setup

**Purpose**: environment and configuration groundwork

- [x] T001 Document `SESSION_SECRET`, `VITE_API_URL`, `VITE_USE_MOCK_AUTH` in
      `.env.example` (exists)
- [X] T002 Replace the `process.env.SESSION_SECRET!` non-null assertion in
      `src/lib/session.ts` with an explicit fail-fast check that throws a clear error at
      startup when the secret is missing (Constitution III note in plan.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: shared plumbing every story depends on — all already built

- [x] T003 `ActionResult<T>` envelope in `src/lib/server-action.ts` (exists)
- [x] T004 Axios factory `createHttpClient` + `logHttpError` + `ApiErrorResponse` in
      `src/lib/http.ts` (exists)
- [x] T005 `useAppSession` sealed `httpOnly` cookie (`app-session`, `sameSite: lax`,
      `secure` in prod) in `src/lib/session.ts` (exists)
- [x] T006 `resolveInternalRedirect` + unit tests in `src/lib/redirect.ts` and
      `src/lib/redirect.test.ts` (exists)

**Checkpoint**: foundation ready — story work can proceed

---

## Phase 3: User Story 1 — Sign in with email and password (Priority: P1) 🎯 MVP

**Goal**: a real login — credentials verified by the authentication service, session
established, Vietnamese errors on failure.

**Independent Test**: quickstart.md scenarios 1–3 (happy path, invalid credentials,
client validation).

- [x] T007 [US1] `loginSchema` + `loginSearchSchema` (Zod, Vietnamese messages) in
      `src/features/auth/schemas/login.schema.ts` (exists)
- [x] T008 [US1] Route declaration `/login` with `validateSearch` in
      `src/routes/(auth)/login.tsx` (exists)
- [x] T009 [US1] `AuthLayout` + `LoginPage` in `src/features/auth/pages/auth-layout.tsx`
      and `src/features/auth/pages/login-page.tsx` (exists)
- [x] T010 [US1] `LoginForm` — TanStack Form + Zod, pending/disabled states, a11y floor,
      post-login `router.invalidate()` + safe redirect — in
      `src/features/auth/components/login-form.tsx` (exists)
- [X] T011 [P] [US1] Create dev mock `src/features/auth/mocks/auth.mock.ts`: fixed dev
      account, success payload shaped per `contracts/auth-api.md`, reject case for wrong
      credentials; used only when `VITE_USE_MOCK_AUTH=true` (research R3)
- [X] T012 [US1] Replace the accept-everything stub in
      `src/features/auth/server-functions/login-with-email-password.ts`: call
      `POST /auth/login` server-side via `createHttpClient`, store
      `userId`/`accessToken`/`refreshToken`/`tokenExpires` with `session.update`, map
      `errorCode`/`statusCode` → Vietnamese messages with a `default` branch
      ("Email hoặc mật khẩu không đúng." for 401; generic otherwise), keep the single
      `logHttpError` call with no secrets or raw bodies, and narrow the module PROD guard
      to "throw only if mock mode is enabled in a production build" (research R2, R3;
      depends on T011)

**Checkpoint**: login verifies real credentials; US1 fully functional

---

## Phase 4: User Story 2 — Protected areas require a session (Priority: P1)

**Goal**: no authenticated route reachable without a valid session; deep links survive
the login round-trip; unsafe destinations discarded.

**Independent Test**: quickstart.md scenarios 4–5 (guard + deep link, unsafe redirect).

- [x] T013 [US2] `getCurrentSession` server function in
      `src/features/auth/server-functions/get-current-session.ts` (exists)
- [x] T014 [US2] `beforeLoad` session guard with `redirectTo` capture in
      `src/routes/(authed)/route.tsx` (exists)
- [X] T015 [P] [US2] Treat `/login` itself as an unsafe destination in
      `src/lib/redirect.ts` and add the covering case to `src/lib/redirect.test.ts`
      (research R5; edge case in spec.md)

**Checkpoint**: US1 and US2 independently verifiable

---

## Phase 5: User Story 3 — Stay signed in (Priority: P2)

**Goal**: "duy trì đăng nhập" actually controls session persistence (research R1:
unchecked → browser-session cookie; checked → 7 days).

**Independent Test**: quickstart.md scenario 6 (browser restart with/without the box).

- [X] T016 [US3] Make the session cookie lifetime configurable in `src/lib/session.ts`:
      accept a persistence option so callers choose between no `maxAge`
      (browser-session) and 7 days; default stays 7 days for existing callers
      (research R1; coordinate with T002 which touches the same file)
- [X] T017 [US3] Wire `keepSignedIn` from the validated login payload through
      `src/features/auth/server-functions/login-with-email-password.ts` into the session
      persistence option (depends on T012 and T016)

**Checkpoint**: all three stories functional

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T018 Run quality gates over every touched file: `pnpm typecheck`,
      `pnpm exec eslint <changed files>`, `pnpm format`, `pnpm test` (constitution
      quality gates; files from T002, T011, T012, T015, T016, T017)
- [X] T019 Execute the 7 manual scenarios in
      `specs/001-email-password-login/quickstart.md` under `pnpm dev` and confirm
      SC-001…SC-005, including devtools checks (httpOnly cookie, no tokens in storage,
      no secrets in logs)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T002 can start immediately (T001 done)
- **Foundational (Phase 2)**: fully done — no blocker
- **User Stories (Phases 3–5)**: unblocked now; only intra-story dependencies below
- **Polish (Phase 6)**: after all open story tasks

### Task Dependencies

- T012 ← T011 (server function imports the mock)
- T017 ← T012, T016
- T016 coordinates with T002 (same file `src/lib/session.ts` — do sequentially)
- T015 is independent of everything else
- T018, T019 ← all of the above

### Parallel Opportunities

```text
Lane A: T011 → T012 → T017
Lane B: T002 → T016   (same-file sequence)
Lane C: T015
then:   T018 → T019
```

## Implementation Strategy

Remaining work is small (7 open tasks). Suggested order for a single developer:
T011 → T012 (MVP: real login works) → validate scenarios 1–3 → T015 → T002 → T016 →
T017 → T018 → T019. Stop-and-validate after T012 gives the earliest meaningful demo.

---

## Phase 7: Convergence

*Appended by `/speckit-converge` on 2026-07-11. Findings F1–F5 of that run were already
tracked by open tasks T002, T011, T012, T015, T016, T017 and were not re-appended; only
new findings become tasks below.*

- [X] T020 CRITICAL — Split `src/features/auth/components/login-form.tsx` (228 lines)
      to within the ~150-line component limit, e.g. extract the email/password field
      renderers or the form header into sibling components under
      `src/features/auth/components/`, with no behavior change per Constitution VI
      (contradicts)
- [X] T021 Enforce session expiry in
      `src/features/auth/server-functions/get-current-session.ts`: treat a session whose
      `tokenExpires` is absent or in the past as signed out (return the existing
      "Phiên đăng nhập không hợp lệ." failure) so the server-side 7-day bound holds even
      when the cookie outlives it, per US2/AC4 and data-model.md session states (partial)
