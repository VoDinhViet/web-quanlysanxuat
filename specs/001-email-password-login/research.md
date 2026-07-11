# Phase 0 Research: Email/Password Login

**Feature**: [spec.md](./spec.md) | **Date**: 2026-07-11

## R1. Semantics of "duy trì đăng nhập" (resolves FR-009 NEEDS CLARIFICATION)

- **Decision**: standard "remember me" semantics. Unchecked → the session cookie carries
  no `maxAge` and expires when the browser closes. Checked → the cookie persists for
  7 days. Server-side expiry (`tokenExpires`) stays 7 days in both cases as an upper
  bound.
- **Rationale**: this is what the label promises and what every mainstream product does.
  It is also the safer default for a factory ERP where terminals are shared between
  shifts — an unchecked box must not leave a week-long session on a shared machine.
- **Alternatives considered**:
  - Fixed short lifetime (8h) when unchecked — adds a second policy constant with no
    user-visible label explaining it; rejected.
  - Remove the checkbox, always 7 days — matches today's stub behavior but silently
    keeps long sessions on shared terminals; rejected.
- **Implementation note**: `useAppSession()` in `src/lib/session.ts` currently hardcodes
  `maxAge`. It must accept a per-call option (or the login server function must set the
  cookie config at update time) so `keepSignedIn` controls cookie persistence.

## R2. Real credential verification (closes the stub gap)

- **Decision**: the login server function calls the authentication service at
  `POST {API_URL}/auth/login` server-side using the existing Axios factory
  (`createHttpClient` in `src/lib/http.ts`), sends `{ email, password }`, and on success
  stores `userId`, `accessToken`, `refreshToken`, `tokenExpires` into the session via
  `useAppSession().update(...)`. The `AppSessionData` type already reserves these fields.
- **Rationale**: verification must happen server-side so tokens never reach the browser
  (Constitution IV). The HTTP plumbing and the session shape already exist; this fills
  them in rather than adding new machinery (Constitution VI).
- **Error mapping**: backend failures arrive as `ApiErrorResponse` (`src/lib/http.ts`).
  Map `errorCode`/`statusCode` → Vietnamese message inside the server function with a
  safe `default` branch ("Đã có lỗi xảy ra. Vui lòng thử lại.") per Constitution VII.
  Invalid credentials (401) map to a dedicated message, e.g. "Email hoặc mật khẩu không
  đúng." Raw responses are never logged or returned.
- **Alternatives considered**: verifying in the browser and posting a token to the
  server — rejected, exposes credentials/tokens to client JS and violates Constitution IV.

## R3. Development mode without a backend

- **Decision**: honor the contract already documented in `.env.example`: when
  `VITE_USE_MOCK_AUTH=true`, login is served by `src/features/auth/mocks/auth.mock.ts`
  (accept a fixed dev account, return a stub token payload). The existing module-level
  PROD guard moves from "always throw" to "throw if mock mode is on in a production
  build". The mock file does not exist yet and must be created.
- **Rationale**: keeps the current DX (no backend needed to develop UI) while making the
  unsafe path impossible to ship — same guard pattern as today, narrower trigger.
- **Alternatives considered**: keep the accept-everything stub — rejected, it is the gap
  this feature closes; delete dev mode entirely — rejected, blocks UI work whenever the
  backend is down.

## R4. Session cookie mechanics (existing, verified)

- **Decision**: keep `useSession` from `@tanstack/react-start/server` (h3 sealed
  cookie), name `app-session`, `httpOnly`, `sameSite: lax`, `secure` in production,
  signed with server-only `SESSION_SECRET`. Tampered/undecryptable cookies already
  surface as an empty session → treated as signed out by `getCurrentSession`.
- **Rationale**: already implemented and constitution-compliant; no reason to change.

## R5. Redirect safety (existing, verified)

- **Decision**: keep `resolveInternalRedirect` (`src/lib/redirect.ts`): only paths
  starting with `/` and not `//` or `/\` are honored; everything else falls back to
  `/manage`. Unit tests exist in `src/lib/redirect.test.ts`.
- **Open sub-point folded into design**: `redirectTo=/login` self-redirect — the guard
  only fires on `(authed)` routes so a loop cannot occur, but landing back on `/login`
  is useless; treat `/login` as unsafe in `resolveInternalRedirect` (small follow-up).
