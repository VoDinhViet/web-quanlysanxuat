## Language boundaries

- Domain values are language-neutral in code (`"active"`, not `"Hoạt động"`) and mapped
  to Vietnamese labels at the display edge via a `Record<Enum, string>` — see
  `USER_STATUS_LABELS`-style maps in feature `types/*.type.ts` files.
- Server-function error messages are Vietnamese strings written directly in each
  `resolve<Thing>ErrorMessage` switch (see `login-with-email-password.ts`); never
  surface a raw backend/HTTP error string to the UI.
- "UI text is Vietnamese" covers every user-visible surface, not just feature pages:
  `<html lang="vi">`, the document `<title>`, and the root `notFoundComponent`
  (`src/routes/__root.tsx`) too. Don't leave template-default English in place.

## Simplicity

- Don't introduce an abstraction until the third use.
- Split components over ~150 lines and functions over ~40 lines or 3 levels of nesting.
- Delete dead code in the same change that makes it dead — don't leave unused drafts
  behind (e.g. an unused component superseded by one in `components/shared/`).
- No new dependency without approval. No inline `eslint-disable`.

## Definition of done

1. `pnpm typecheck` is clean.
2. `pnpm exec eslint <changed-files>` is clean.
3. `pnpm format` has been run.
4. Re-read the full `git diff` — no stray `console.log`, temp files, or out-of-scope
   edits.
5. Exercise the affected flow with `pnpm dev`. A green typecheck does not prove the
   feature works.

## Commits

Conventional Commits, scoped: `type(scope): imperative subject`, lowercase, no trailing
period — e.g. `feat(auth): add email/password login`, `chore(ui): update shadcn
primitives`. Don't commit or push unless asked.
