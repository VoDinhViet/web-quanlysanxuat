---
paths:
  - "src/features/*/components/**"
  - "src/features/*/pages/**"
  - "src/features/*/schemas/**"
  - "src/routes/**"
  - "src/hooks/**"
---

## Forms & state

- TanStack Form + Zod is the schema source: `noValidate` on `<form>`, manual
  `preventDefault`/`stopPropagation` in the submit handler, form types via `z.infer<typeof
schema>`, error styling gated on `field.state.meta.isTouched` (see
  `src/components/shared/composites/AppFormFields.tsx`).
- Every TanStack Form uses `validationLogic: revalidateLogic()` with the schema on
  `validators.onDynamic` — never `validators.onSubmit`, which clears a field's error on the next
  keystroke even while the value is still invalid. `revalidateLogic()` validates on submit until
  the first attempt, then on every change.
- Form schemas mirror the backend DTO's shape, including nested optional objects
  (`credential: createCredentialSchema.optional()`); a toggle-gated section stores the nested
  object or `undefined`, not parallel flat fields.
- Multi-section forms use `useAppForm`/`withForm` (`src/hooks/use-app-form.ts`) with the shared
  fields in `AppFormFields.tsx`. In `withForm` `props` defaults, type empty arrays `[] as X[]`
  (a bare `[]` infers `never[]`). A form with styling the kit can't express (`LoginForm.tsx`'s
  `h-12` inputs, uppercase labels) binds a raw `<form.Field>` with `ui/field` primitives — don't
  "fix" it to use the kit.
- To read a sibling field's live value, call `useField({ form, name })` where needed instead of
  threading it as a prop or wrapping in `form.Subscribe`. Reserve `form.Subscribe` for
  form-level state (`canSubmit`, `isSubmitting`) or one render needing several fields — and
  return an **object** from its selector, not a tuple (a tuple unifies element types and forces
  a cast).
- **react-hook-form trial:** the `orders` feature (`CreateOrderForm`/`UpdateOrderForm`, 4-step
  wizards with `useFieldArray` line items, a localStorage draft on Create) and `users` use
  react-hook-form + `Field` (`src/components/ui/field.tsx`); it is not yet the pattern for a new
  form — the rest of the repo stays on TanStack Form. Fields bind with a plain inline
  `<Controller>`, no shared RHF field kit. `Create*`/`Update*` Section and Step trees stay
  separate per flow, same reasoning as their schemas. A wizard validating per-step with
  `form.trigger()` must set `useForm({mode: "onChange"})`, or a field fixed on an earlier step
  keeps its old error until "Tiếp theo" is hit again.
- Select options come from label maps via `buildOptionsFromLabels` or `{id, name}` reference
  rows from the route loader (see `src/routes/(authed)/manage_/users_/create.tsx`).
- Shareable state — filters, pagination, active tab — lives in Zod-validated URL search params
  via `validateSearch`, not `useState`. Give every optional param a `.catch(...)` default so a
  malformed URL never crashes the route.
- TanStack Table `columns` are module-scope or `useMemo`, never recreated per render.
- A presentational component's loading prop is `isPending`, whatever the caller binds:
  `query.isPending` for a first-load skeleton or disabled form, `query.isFetching` for dimming a
  table on filter/page change or a combobox's "Đang tìm...". `useMutation`'s own `isPending` is
  unrelated.
- `useSearch`/`useLoaderData` `from` takes the file-based route id (`"/(authed)/manage_/users"`);
  `useNavigate` `from` takes the resolved path (`"/manage/users"`). Pass literal strings at each
  call site, no intermediate constants (see `src/features/users/pages/UsersPage.tsx`).
- List pages reuse the presentational `Pagination`
  (`src/components/shared/composites/Pagination.tsx`: flat `page`/`pageSize`/`total`/
  `onPageChange`/`onPageSizeChange?` props). Route-backed lists bind the callbacks via
  `useRoutePagination` (`src/hooks/use-route-pagination.ts`).

## Styling & accessibility

- Compose classes with `cn()` (`src/lib/utils.ts`), passing the class string straight in rather
  than parking it in an intermediate `const` (see `ProductBadges.tsx`). Use semantic Tailwind
  tokens (`text-foreground`, `bg-card`), not raw color utilities.
- Icon-only buttons need `aria-label`; invalid inputs need `aria-invalid`; every `<button>`
  inside a `<form>` has an explicit `type`.
