# Quickstart Validation: Email/Password Login

**Feature**: [spec.md](./spec.md) | **Date**: 2026-07-11

## Prerequisites

```bash
cp .env.example .env   # then set a real SESSION_SECRET
pnpm install
```

For UI-only work set `VITE_USE_MOCK_AUTH=true`; for real verification set
`VITE_API_URL` to a running authentication service (contract:
[contracts/auth-api.md](./contracts/auth-api.md)).

## Automated gates

```bash
pnpm typecheck        # must be clean
pnpm test             # includes src/lib/redirect.test.ts (unsafe redirectTo cases)
pnpm format
```

## Manual end-to-end scenarios (`pnpm dev`)

1. **Happy path** — open `/login`, submit valid credentials → land on `/manage`
   (SC-001). Verify in devtools: cookie `app-session` is `HttpOnly`, and no token
   appears in `localStorage`/`sessionStorage`.
2. **Invalid credentials** (real backend or mock's reject case) — Vietnamese error
   "Email hoặc mật khẩu không đúng." shows on the form; still on `/login`; no cookie
   set.
3. **Client validation** — submit an empty form → per-field Vietnamese messages;
   nothing hits the network (`noValidate` + Zod).
4. **Guard + deep link** — while signed out visit `/manage/...` → redirected to
   `/login?redirectTo=...`; after login you land on the original page (SC-002).
5. **Unsafe redirect** — visit `/login?redirectTo=https://evil.example` and
   `/login?redirectTo=//evil.example`, sign in → both land on `/manage` (SC-003).
6. **Keep signed in** — sign in with the box checked, restart the browser → still
   signed in (SC-005). Repeat unchecked → session gone after browser close.
7. **Backend down** — stop the auth service, submit → generic Vietnamese error, no
   crash, nothing sensitive in the terminal running `pnpm dev` (SC-004).

## Expected log discipline

Only `logHttpError(error, "loginWithEmailPassword")` on failures — no passwords, no
tokens, no raw backend bodies (SC-004).
