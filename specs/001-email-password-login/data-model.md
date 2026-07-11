# Data Model: Email/Password Login

**Feature**: [spec.md](./spec.md) | **Date**: 2026-07-11

## Entities

### LoginSchema (client input, validated at the trust boundary)

Source of truth: `src/features/auth/schemas/login.schema.ts` (Zod, types via `z.infer`).

| Field        | Type    | Rules                                            | Message (vi)               |
| ------------ | ------- | ------------------------------------------------ | -------------------------- |
| email        | string  | valid email format                               | "Email không hợp lệ"       |
| password     | string  | min length 1                                     | "Vui lòng nhập mật khẩu"   |
| keepSignedIn | boolean | required; controls cookie persistence (R1)      | —                          |

### LoginSearchSchema (URL search params on `/login`)

| Field      | Type              | Rules                                             |
| ---------- | ----------------- | ------------------------------------------------- |
| redirectTo | string, optional  | `.catch(undefined)` — malformed values are dropped |

### AppSessionData (server-side session, sealed httpOnly cookie)

Source of truth: `src/lib/types/session.type.ts`. All fields optional — an empty object
means "signed out".

| Field        | Type   | Notes                                             |
| ------------ | ------ | ------------------------------------------------- |
| userId       | string | employee identifier from the auth backend         |
| accessToken  | string | backend API token; never leaves the server        |
| refreshToken | string | reserved for future renewal; never leaves server  |
| tokenExpires | number | epoch ms; upper bound regardless of keepSignedIn  |

**States**: signed-out (no/empty/undecryptable cookie) → signed-in (userId present,
tokenExpires in the future) → expired (tokenExpires past, treated as signed-out).

### CurrentSession (what the client is allowed to see)

Source of truth: `src/features/auth/types/login.type.ts`. Deliberately a projection —
tokens MUST NOT appear here.

| Field  | Type   |
| ------ | ------ |
| userId | string |

### ActionResult<T> (server function envelope)

Source of truth: `src/lib/server-action.ts`. Discriminated union:
`{ success: true, data?: T } | { success: false, message: string }` — `message` is
always Vietnamese and user-safe.

## Validation & invariants

- All client input crosses the boundary only through `loginSchema` (Constitution II).
- Tokens exist only inside `AppSessionData` (httpOnly cookie) — never in
  `CurrentSession`, props, state, or logs (Constitution IV).
- `redirectTo` is used only after `resolveInternalRedirect` (Constitution IV).
- Domain values are language-neutral; Vietnamese exists only in messages (Constitution VII).
