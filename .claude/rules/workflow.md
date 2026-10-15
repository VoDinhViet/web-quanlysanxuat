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
4. UI change: `.claude/skills/impeccable/scripts/impeccable detect <changed UI files>` exits 0
   (see `design.md`).
5. Re-read the full `git diff` — no stray `console.log`, temp files, or out-of-scope
   edits.
6. Exercise the affected flow with `pnpm dev`. A green typecheck does not prove the
   feature works.

## Review agents

When a coding unit is finished (a feature, a fix touching code, a PH ticket), run these without
waiting to be asked, before the final typecheck and eslint and before any commit:

1. `ecc:code-simplifier` on the changed files.
2. In parallel, `ecc:code-reviewer` and `ecc:react-reviewer` on the diff.
3. `/impeccable audit <changed UI files>` when the change touches UI (a11y, responsive, theming);
   fix P0/P1 findings, list the rest. Run `critique` only if the user asks for a UX review.
4. `ecc:security-reviewer` when the change touches auth, permissions, user input sent to the
   API, or a server function that calls the backend.

Brief each agent with the changed paths and the ticket, and pass `model` per the backend repo's
`model-routing.md`. Reviewers are read-only: fix CRITICAL and HIGH findings, list the rest for the
user. Do not apply a simplifier rewrite that adds abstraction or breaks the rules in this folder.
Skip for typo, comment, doc, and config-only edits. This does not grant permission to commit.

## Commits

Conventional Commits, scoped: `type(scope): imperative subject`, lowercase, no trailing
period — e.g. `feat(auth): add email/password login`, `chore(ui): update shadcn
primitives`. Don't commit or push unless asked.
