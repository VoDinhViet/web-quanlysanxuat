## Forms & state

- TanStack Form + Zod as the single schema source: `noValidate` on `<form>`, manual
  `preventDefault`/`stopPropagation` in the submit handler, derive form types with
  `z.infer<typeof schema>`, gate error styling on `field.state.meta.isTouched` (see
  `src/components/shared/composites/AppFormFields.tsx`). Deliberate react-hook-form + `Field`
  (`src/components/ui/field.tsx`) trial, not yet the pattern for a new form: the entire `orders`
  feature — `CreateOrderForm.tsx`/`UpdateOrderForm.tsx` (a 4-step wizard each, `useFieldArray` for
  the `items` line table — the first use of it in the repo — fully inline row editing with no
  per-row dialog, a file field whose `onChange` accepts an updater function, and, Create only, a
  localStorage draft; Update's tab strip is fully unlocked from mount instead of gated
  step-by-step, since an existing record is already valid where a blank Create form isn't). Every
  field binds with a plain inline `<Controller name="..." control={form.control}
render={({field, fieldState}) => ...}>` — no shared RHF field kit; each
  `Field`/`FieldLabel`/`FieldError` block is written out at the call site. `Create*Section.tsx`/
  `Create*Step.tsx` and `Update*Section.tsx`/`Update*Step.tsx` stay separate component trees per
  flow — same "create and update evolve independently" reasoning as their schemas (see "Server
  functions" in `architecture.md`) — even though most of their markup is copied 1:1 between the
  two; this is still not evidence either form library won: the rest of the repo (~47 forms) stays
  on TanStack Form until a conclusion is reached. `users` (`CreateUserForm.tsx`/
  `UpdateUserForm.tsx`, 17 fields, a nested optional object, dependent selects, file upload) has
  already migrated — see `CreateUserCredentialSection.tsx` for the nested-optional-object idiom
  (`form.AppField name="credential.username"` — TanStack Form infers the leaf as
  `string | undefined` through an optional parent without any workaround) and
  `CreateUserJobInfoSection.tsx` for a dependent-select pair kept hand-rolled (not the shared
  `SelectField`) to preserve its value-masking-while-loading behavior. **A wizard that validates
  per-step with `form.trigger()` (not `handleSubmit()`) must set
  `useForm({mode: "onChange"})`**: RHF's default `"onSubmit"` mode only re-validates a field on
  change after `formState.isSubmitted` is `true`, a flag only an actual `handleSubmit()` call
  sets — without `onChange`, a field fixed on an earlier step keeps showing its old error until
  the user hits "Tiếp theo" again and re-triggers validation for that step.
- Every TanStack Form form uses `validationLogic: revalidateLogic()` with the schema on
  `validators.onDynamic` (not `validators.onSubmit`): plain `onSubmit` validation clears a field's
  error on its very next keystroke even when the value is still invalid (TanStack Form wipes the
  `onSubmit` error map entry on any change), so a submit-invalid form re-opens its submit button
  without actually being valid. `revalidateLogic()` validates only on submit until the first
  submit attempt, then re-validates on every change — closer to RHF's default and to what users
  expect. `CreateClientForm.tsx`/`UpdateClientForm.tsx` were the first to use this; every other
  TanStack Form form (including `LoginForm.tsx`) now follows it too — `validators.onSubmit` is not
  used anywhere in the repo.
- Form schemas mirror the backend DTO's shape, including nested optional objects
  (e.g. `credential: createCredentialSchema.optional()` in
  `create-user.schema.ts`) — a toggle-gated section stores the nested object or
  `undefined`, not parallel flat fields.
- Multi-section forms use `useAppForm`/`withForm` (`src/hooks/use-app-form.ts`) with
  the shared field components in `src/components/shared/composites/AppFormFields.tsx`. In
  `withForm` `props` defaults, type empty arrays with `[] as X[]` — a bare `[]`
  infers `never[]` and breaks the caller (a justified cast). A form with styling the kit can't
  express — `LoginForm.tsx`'s taller `h-12` inputs and uppercase tracked labels — binds a raw
  `<form.Field name="...">{(field) => ...}</form.Field>` with `ui/field` primitives instead of
  the kit's field components; don't "fix" it to use the kit.
- To read another field's live value from within the same form — a sibling section
  needs `currency` to label its own input, a dialog needs the order's `currency` to
  pass down — call `useField({ form, name })` (from `@tanstack/react-form`) right
  where it's needed, rather than threading the value down as a prop or wrapping a
  render in `form.Subscribe`. It keeps the field's real type (no literal-widening
  surprises to work around) and avoids an extra render-prop layer. Reserve
  `form.Subscribe` for form-level state (`canSubmit`, `isSubmitting`, see
  `CreateOrderForm.tsx`) or when a single render genuinely needs several field values
  at once (`OrderTotalsPreview` in `CreateOrderTotalsSummary.tsx`/
  `UpdateOrderTotalsSummary.tsx`) — and there, have the selector return an **object**,
  not a tuple: a tuple's elements get unified to one type, forcing a cast to pull a
  specific field back out; an object keeps each field's own type.
- Select options come from label maps via `buildOptionsFromLabels` or from
  `{id, name}` reference rows fetched in the route loader (`Promise.all` for several
  lists) — see `src/routes/(authed)/manage_/users_/create.tsx`.
- Shareable state — filters, pagination, active tab — belongs in Zod-validated URL search
  params via a route's `validateSearch`, not `useState`. Give every optional search param
  a `.catch(...)` default so a malformed URL never crashes the route.
- TanStack Table `columns` are defined at module scope or memoized with `useMemo`, never
  recreated inline on every render.
- A presentational component's loading prop is always named `isPending` — it doesn't need to
  know whether the parent is on its first load or refetching, just whether to show the
  pending treatment. What the caller binds to it varies by situation: `query.isPending` for a
  first-load skeleton or disabling a form, `query.isFetching` for dimming a table on
  filter/page change or showing a combobox's "Đang tìm..." state while the user types (see
  `ComboboxField`, and any `<XTable isPending={xQuery.isFetching} />` next to
  `xQuery.isPending ? <TableQueryFallback /> : ...` on the same list page). `useMutation`'s own
  `isPending` ("request in flight") is unrelated and unaffected by this convention.
- `useSearch`/`useLoaderData`'s `from` takes the file-based route id (e.g.
  `"/(authed)/manage_/users"`); `useNavigate`'s `from` takes the resolved URL path instead
  (e.g. `"/manage/users"`) — the two intentionally differ. Pass the literal strings
  directly at each call site (no intermediate constants) — see
  `src/features/users/pages/UsersPage.tsx`.
- List pages reuse the shared `Pagination`
  (`src/components/shared/composites/Pagination.tsx`) — a pure presentational component taking
  flat `page`/`pageSize`/`total`/`onPageChange`/`onPageSizeChange?` props, no route logic of its
  own. Route-backed list pages bind those callbacks via `useRoutePagination`
  (`src/hooks/use-route-pagination.ts`), which patches the current route's `page`/`limit` search
  params via `navigate({ to: "." })`.

## Styling & accessibility

- Compose class names with `cn()` (`src/lib/utils.ts`), and use semantic Tailwind tokens
  (`text-foreground`, `bg-card`, `text-sidebar-foreground`) rather than raw color
  utilities.
- Pass a class string straight into `cn()` instead of parking it in an intermediate
  `const` first — see the badge base classes in
  `src/features/products/components/ProductBadges.tsx`.
- Icon-only buttons need `aria-label`; invalid form inputs need `aria-invalid`; every
  `<button>` inside a `<form>` has an explicit `type` so it can't accidentally submit.
  `jsx-a11y/label-has-associated-control` (pairing a `<label>`'s `htmlFor` with its
  control's `id`) is off in `eslint.config.js` — not enforced.
