# design-sync notes — web-qlsx-start

- This is an app repo, not a DS package: no dist/ library build, no Storybook. The
  bundle entry is the curated `.design-sync/ds-entry.ts` (all `src/components/ui/*`
  plus `IconButton` and `DatePickerField` from shared), passed via `cfg.entry`.
- Deliberately excluded from the bundle (crash-bait or server code — do NOT re-add
  without solving the coupling):
  - `PageTitleBar` — imports server functions (`getCurrentProfile`, `logout`);
    bundling would pull server-only session code into a public client bundle.
  - `AppSidebar`, `TablePagination` — call `useLocation`/`useNavigate`; throw
    outside the app's TanStack Router provider.
  - `AppFormFields` (TextField/PasswordField/SelectField/…) — `useFieldContext`
    throws outside the app's TanStack Form `useAppForm` context.
  - `ThemeProvider` — thin next-themes app wrapper; theme in the DS bundle is the
    `.dark` class + CSS variables, no provider needed.
- Styling is Tailwind v4 (source `src/styles.css` with `@theme` + oklch tokens).
  There is no compiled stylesheet in the repo — `cfg.buildCmd` compiles one with
  `@tailwindcss/cli` (installed in `.ds-sync/`, not a repo dep) into
  `.design-sync/.cache/ds-styles.css` (= `cfg.cssEntry`). The CLI's auto content
  detection scans the whole repo (gitignore-aware), so utility classes used in
  `src/**` AND `.design-sync/previews/**` are all included; `ds-bundle/`/`.ds-sync/`
  are gitignored and thus not scanned. Re-run buildCmd whenever previews add new
  utility classes.
- Fonts: Geist Variable via `@fontsource-variable/geist` (node_modules), imported
  from `src/styles.css`.
- Render check on this machine: no sudo available, so chromium's missing system
  libs (libnspr4, libnss3, libasound2) were extracted rootlessly from apt debs
  into `.design-sync/.cache/chromium-libs/`. Run validate/capture with
  `LD_LIBRARY_PATH=$PWD/.design-sync/.cache/chromium-libs`. Playwright pinned to
  1.61.1 (matches cached chromium build 1228 in ~/.cache/ms-playwright).
- Component cards = 56 family roots (one per shadcn ui file + 2 shared); all 310
  PascalCase exports remain available on `window.QlsxUI` for composition. Groups
  come from frontmatter-only regroup stubs in `.design-sync/docs/` (wired via
  `cfg.docsMap`) — a stub has no body, so `.prompt.md` synthesis stays intact.
- 23 components have authored previews in `.design-sync/previews/` (the original
  Button/Card/Input/Table plus 19 authored 2026-07-17 because their auto-render
  cards were blank or near-invisible — children-less primitives like
  Badge/Checkbox/Progress/Switch render invisibly small without composition).
  Calendar is the one deliberate auto-render (react-day-picker draws real
  content). The remaining 32 ship floor cards — standing offer for incremental
  authoring on any re-sync.
- `cfg.overrides.Card = {cardMode: "column"}` — Card's ProductSummary story is
  wider than a grid cell (`[GRID_OVERFLOW]`); column mode keeps full-width rows.
- Conventions header lives at `.design-sync/conventions.md` (`cfg.readmeHeader`).
  Its utility-class table is bounded by what the Tailwind CLI actually emitted:
  `rounded-2xl/3xl/4xl` are theme-defined but unused in src/previews, so they are
  NOT in the compiled CSS and were cut from the header. If a future change starts
  using them, re-add.

## Known render warns

- (none currently — after authoring the 13 previews on 2026-07-17, validate
  reports 0 bad / 0 thin; any warn on a future sync is new and needs triage)

## Re-sync risks

- The claude.ai/design project is ALSO used interactively by the user: it holds
  `templates/`, `uploads/`, `design_handoff_login/`, and app-generated
  `_ds_manifest.json` / `_adherence.oxlintrc.json`. Reconciliation deletes must
  stay inside the sync-owned trees (`components/`, `_preview/`, `tokens/`,
  `fonts/`, `_vendor/`, `guidelines/`) — never touch the rest.
- The compiled stylesheet only contains utilities used in `src/**` +
  `.design-sync/previews/**` (Tailwind auto-content scan). New previews that use
  new utility classes need a `cfg.buildCmd` re-run before the driver, or cards
  render partially unstyled.
- `.design-sync/.cache/` (compiled CSS, fonts copy, chromium libs, grades) is
  machine state — on a fresh clone re-run buildCmd, reinstall playwright 1.61.1,
  and re-extract the chromium libs before validate.
- Fonts are copied from `node_modules/@fontsource-variable/geist` at buildCmd
  time — a Geist major bump changes the woff2 set; re-check `[FONT_MISSING]`.
