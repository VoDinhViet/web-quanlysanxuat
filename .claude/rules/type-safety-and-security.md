## Type safety

- No `any`, `@ts-ignore`, `@ts-expect-error`, or non-null `!`. Every `as` cast must be
  justified by something the type checker genuinely cannot know.
- Type-only imports use `import type` (`verbatimModuleSyntax` is on).
- `type` vs `interface`: use `interface` for a named, object-shaped public contract meant to
  be read or extended (a hook's `UseXResult`, `declare`-merged globals); `type` for unions,
  intersections, mapped/utility types and aliases. When both fit, follow the surrounding code
  (most of the repo uses `type`).
- Name an object type and declare it above its use instead of inlining it in a generic or
  parameter annotation — `type StatusBadgeStyle = {...}` then
  `Record<ProductStatus, StatusBadgeStyle>`. Same for component props (`type FooProps = {...}`).
- Domain types carry no presentation data — see "Language boundaries" in `code-style.md`.
- Outside the shadcn-generated `src/components/ui/`, import named exports from `react`
  (`import { useState } from "react"`), not `import * as React from "react"`.

## Security (non-negotiable)

- Tokens live only in the httpOnly session cookie (`src/lib/session.ts`,
  `useAppSession`). Never in localStorage, sessionStorage, React state, or props.
- Never put secrets behind a `VITE_` prefix — `VITE_*` vars are bundled into the client.
  `SESSION_SECRET` is server-only; `VITE_API_URL` is intentionally public.
- Every route under `(authed)` must be reachable only through the `beforeLoad` session
  guard in `src/routes/(authed)/route.tsx` (calls `getCurrentSession`, redirects to
  `/login` on failure). Don't add a second, parallel auth check elsewhere.
- Any `redirectTo` value must go through `resolveInternalRedirect`
  (`src/lib/redirect.ts`) before use, to reject open redirects (protocol-relative URLs,
  absolute URLs, `javascript:` schemes, etc.).
- Never log tokens, passwords, or raw HTTP responses.
