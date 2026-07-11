# Contract: Authentication Service

**Feature**: [../spec.md](../spec.md) | **Date**: 2026-07-11

The web app is the client; the authentication service is external. Base URL comes from
`VITE_API_URL` (public, non-secret). Called **server-side only**, from the login server
function.

## POST /auth/login

Request (JSON):

```json
{
  "email": "user@example.com",
  "password": "••••••••"
}
```

Success — 200 (JSON):

```json
{
  "userId": "NV001",
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "expiresIn": 604800
}
```

Failure — non-2xx with the shared `ApiErrorResponse` envelope (`src/lib/http.ts`):

```json
{
  "timestamp": "2026-07-11T03:00:00Z",
  "statusCode": 401,
  "error": "Unauthorized",
  "errorCode": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

## Error mapping (server function, Constitution VII)

| Condition                        | User-facing message (vi)                     |
| -------------------------------- | -------------------------------------------- |
| 401 / `INVALID_CREDENTIALS`      | "Email hoặc mật khẩu không đúng."            |
| network error / timeout / 5xx    | "Đã có lỗi xảy ra. Vui lòng thử lại."        |
| **default** (anything else)      | "Đã có lỗi xảy ra. Vui lòng thử lại."        |

Raw backend messages are never surfaced or logged; only the action name and sanitized
error reach `logHttpError`.

## Client-side contract (web app ↔ user)

- `/login?redirectTo=<path>` — optional; honored only when internal
  (`resolveInternalRedirect`).
- Server functions involved:
  - `loginWithEmailPassword(LoginSchema) → ActionResult` (POST)
  - `getCurrentSession() → ActionResult<CurrentSession>` (GET)

## Mock mode (dev only)

`VITE_USE_MOCK_AUTH=true` short-circuits the HTTP call with
`src/features/auth/mocks/auth.mock.ts` (fixed dev account, stub payload shaped exactly
like the success response above). A module guard throws if mock mode is enabled in a
production build.

> ⚠ The success-response field names above are the plan's assumption pending the real
> backend spec. The server function is the single integration point, so a rename is a
> one-file change.
