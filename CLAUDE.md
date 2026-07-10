# Web QLSX

Internal ERP for manufacturing management. UI text is Vietnamese; code and identifiers are English.

## Commands

```bash
pnpm dev          # vite dev --port 3000
pnpm typecheck    # tsc --noEmit — run after EVERY TypeScript change
pnpm lint         # eslint (see caveat below)
pnpm format       # prettier --write
pnpm test         # vitest run
```

Run `pnpm exec eslint <changed-file>` rather than full `pnpm lint`: the repo-wide run reports
pre-existing issues in generated `src/components/ui/` files. If lint fails, confirm the failures
are outside the files you touched and say so.

## Architecture

```
src/routes/       # Route declarations ONLY. No business logic.
  (auth)/         # Route group — login layout
  (authed)/       # Route group — sidebar layout
src/features/     # All business logic, one folder per domain
  <feature>/{components,pages,schemas,server-functions,types}/
src/components/ui/      # shadcn-generated. Do not add business logic.
src/components/shared/  # Cross-feature components
src/lib/          # http, session, utils
```

**Layer rules (these are why the structure exists — you cannot infer them from the code):**

- A route file may only contain `createFileRoute`, `validateSearch`, `beforeLoad`, `loader`, and
  a `component` pointing at a page in `src/features/`. The one exception is
  `src/routes/(authed)/route.tsx`, which holds the provider shell.
- Features MUST NOT import from other features. Promote shared code to `src/lib/` or
  `src/components/shared/`.
- `src/routeTree.gen.ts` is generated. Never edit it.
- Trailing underscore in a route folder (`manage_/users.tsx`) means "nest the URL, do not inherit
  the parent layout".

## Server functions

Every server function follows this contract. There are no exceptions.

```ts
export const doThing = createServerFn({ method: "POST" })
  .validator(someZodSchema)                                // 1. Always validate input
  .handler(async ({ data }): Promise<ActionResult> => {    // 2. Explicit return type
    try {
      // ...
      return { success: true }
    } catch (error) {
      logHttpError(error, "doThing")                       // 3. Log once, at the catch
      return { success: false, message: toUserMessage(error) }
    }
  })
```

- Return `ActionResult<T>` (`src/lib/server-action.ts`). **Never throw to the client** — errors are
  return values, and the discriminated union forces callers to handle failure.
- Map backend error codes to Vietnamese messages inside the server function, always with a `default`
  branch. Never surface raw backend errors, stack traces, or infrastructure details.
- Use the shared `http` client from `src/lib/http.ts`. Do not create ad-hoc axios instances.

## Security

- **IMPORTANT: Auth tokens live only in the `httpOnly` session cookie.** Never `localStorage`,
  `sessionStorage`, React state, or props.
- **Never put a secret behind a `VITE_` prefix.** Those variables are bundled into the browser.
  `SESSION_SECRET` is server-only; `VITE_API_URL` is public.
- Every route under `(authed)` MUST have a `beforeLoad` session guard. **None currently do — see
  Known issues.**
- Never log tokens, passwords, or raw backend responses.
- Before redirecting to a `redirectTo` value, verify it is an internal path (starts with `/`, not
  `//`), or you have built an open redirect.

## Code style

Prettier owns formatting: no semicolons, double quotes, 2-space, 80 cols. Do not debate style.

- **Never use `any`, `@ts-ignore`, `@ts-expect-error`, or `!`** to satisfy the type checker. Fix the
  cause. `verbatimModuleSyntax` is on, so type-only imports MUST use `import type`.
- Domain types MUST NOT carry presentation data — no CSS classes, image URLs, or display strings in
  a model. Domain values are language-neutral (`"active"`, not `"Hoạt động"`); map to Vietnamese
  labels in the UI via `Record<Enum, string>` so the compiler catches a missing case.
- Use `type` over `interface` unless you need declaration merging.
- Compose class names with `cn()`. Use semantic Tailwind tokens (`text-foreground`, `bg-card`), not
  raw colors (`text-gray-900`) — raw colors break dark mode.
- Icon-only buttons need `aria-label`; invalid inputs need `aria-invalid`; labels need
  `htmlFor`↔`id`; every `<button>` in a form needs an explicit `type`.
- Extract an abstraction on the third use, not the second. Split components over ~150 lines and
  functions over ~40 lines. Delete dead code in the same commit that replaces it.

## Forms and state

Forms use TanStack Form with Zod as the single validation source: put `noValidate` on `<form>`,
call `event.preventDefault()` and `event.stopPropagation()` manually, and derive types with
`z.infer` rather than declaring them twice. Gate error styling on
`field.state.meta.isTouched` so untouched fields are not marked red.

Shareable state — filters, pagination, tabs — belongs in Zod-validated URL search params, not
`useState`. Use `.catch(undefined)` on optional params so a malformed URL cannot crash the route.

Define TanStack Table columns at module scope, or wrap them in `useMemo` if they depend on props.

## Known issues

Do not build on top of these without fixing them. Delete a row when you fix it.

| Issue | Location | Severity |
|---|---|---|
| `(authed)` has no `beforeLoad` guard — `/manage` and `/manage/users` load without a session | `src/routes/(authed)/route.tsx` | **Critical** |
| `redirectTo` is validated then discarded via `void redirectTo`; login never returns the user | `features/auth/server-functions/login-with-email-password.ts` | High |
| `keepSignedIn` is collected but `maxAge` is hardcoded to 7 days | `login-form.tsx`, `lib/session.ts` | Medium |
| `process.env.SESSION_SECRET!` — no env validation; fails at first request, not at boot | `src/lib/session.ts` | Medium |
| `User` type carries `avatarClassName`/`initials`; `UserStatus` uses Vietnamese display strings as domain values | `features/users/types/user.type.ts` | Medium |
| ~120 lines of mock data embedded in the page component | `features/users/pages/users-page.tsx` | Low |
| Filters and pagination are static UI, not wired to state | `features/users/components/users-table-filter.tsx` | Low |
| `session.update(response.data)` stores the raw backend response verbatim | `login-with-email-password.ts` | Low |
| `http.ts` fallback `"/api"` conflicts with call paths like `"/api/auth/login"` | `src/lib/http.ts` | Low |
| Vitest is installed; the repo has zero tests | — | Low |
| `src/routes/index.tsx` is still the starter placeholder | `src/routes/index.tsx` | Low |

## Definition of done

1. `pnpm typecheck` is clean.
2. `pnpm exec eslint <changed-files>` is clean.
3. `pnpm format` has been run.
4. You have re-read the full `git diff` — no stray `console.log`, temp files, or out-of-scope edits.
5. You ran the affected flow with `pnpm dev`. **A green typecheck does not prove the feature works.**

## Never

- Edit `src/routeTree.gen.ts`, or add business logic to `src/components/ui/`.
- Commit or push unless explicitly asked.
- Add a dependency without approval — check `package.json` first; what you need is often present.
- Disable an ESLint rule inline to avoid an error. Fix the cause.
- Create documentation or summary files unless asked.

## Spec-driven development

This repo uses [spec-kit](https://github.com/github/spec-kit) (v0.12.9), pinned. Skills live in
`.claude/skills/` and are invoked as `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`,
`/speckit-implement` (hyphen, not the dot form shown in upstream docs).

Project principles live in `.specify/memory/constitution.md`; `/speckit-plan` gates every plan
against them. Keep that file and this one consistent — the constitution wins on conflict.

Use spec-kit for new feature modules. Do not write a spec for a 20-line bug fix.
