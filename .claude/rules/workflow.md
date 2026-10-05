## Commands

Run `pnpm typecheck` after EVERY TypeScript change.

Prefer `pnpm exec eslint <changed-file>` over the full `pnpm lint` for your own change — a
repo-wide run also reports pre-existing issues in generated `src/components/ui/` files.

There are no test files yet. Vitest is wired up (`vite.config.ts`); colocate new tests as
`*.test.ts(x)` next to the code and run `pnpm exec vitest run`.

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
