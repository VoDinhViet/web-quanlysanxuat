## Forms & state

- TanStack Form + Zod as the single schema source: `noValidate` on `<form>`, manual
  `preventDefault`/`stopPropagation` in the submit handler, derive form types with
  `z.infer<typeof schema>`, gate error styling on `field.state.meta.isTouched` (see
  `src/features/auth/components/LoginForm.tsx`).
- Form schemas mirror the backend DTO's shape, including nested optional objects
  (e.g. `credential: createCredentialSchema.optional()` in
  `create-user.schema.ts`) — a toggle-gated section stores the nested object or
  `undefined`, not parallel flat fields.
- Multi-section forms use `useAppForm`/`withForm` (`src/hooks/use-app-form.ts`) with
  the shared field components in `src/components/shared/AppFormFields.tsx`. In
  `withForm` `props` defaults, type empty arrays with `[] as X[]` — a bare `[]`
  infers `never[]` and breaks the caller (a justified cast).
- Select options come from label maps via `buildOptionsFromLabels` or from
  `{id, name}` reference rows fetched in the route loader (`Promise.all` for several
  lists) — see `src/routes/(authed)/manage_/users_/create.tsx`.
- Shareable state — filters, pagination, active tab — belongs in Zod-validated URL search
  params via a route's `validateSearch`, not `useState`. Give every optional search param
  a `.catch(...)` default so a malformed URL never crashes the route.
- TanStack Table `columns` are defined at module scope or memoized with `useMemo`, never
  recreated inline on every render.
- `useSearch`/`useLoaderData`'s `from` takes the file-based route id (e.g.
  `"/(authed)/manage_/users"`); `useNavigate`'s `from` takes the resolved URL path instead
  (e.g. `"/manage/users"`) — the two intentionally differ. Pass the literal strings
  directly at each call site (no intermediate constants) — see
  `src/features/users/pages/UsersPage.tsx`.
- List pages reuse the shared `TablePagination`
  (`src/components/shared/TablePagination.tsx`) — it patches the current route's
  `page`/`limit` search params itself via `navigate({ to: "." })`; callers only pass
  `pagination` and layout `className`.

## Styling & accessibility

- Compose class names with `cn()` (`src/lib/utils.ts`), and use semantic Tailwind tokens
  (`text-foreground`, `bg-card`, `text-sidebar-foreground`) rather than raw color
  utilities.
- Pass a class string straight into `cn()` instead of parking it in an intermediate
  `const` first — see the badge base classes in
  `src/features/products/components/ProductBadges.tsx`.
- Icon-only buttons need `aria-label`; invalid form inputs need `aria-invalid`; every
  `<label>` pairs `htmlFor` with the input's `id`; every `<button>` inside a `<form>` has
  an explicit `type` so it can't accidentally submit.
