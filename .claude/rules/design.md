## UI design guardrails (Impeccable)

Impeccable is installed (`.claude/skills/impeccable/`, config in `.impeccable/config.json`). Product
context is in `PRODUCT.md`, the existing visual system in `DESIGN.md`.

- New or changed UI follows `DESIGN.md`: semantic tone tokens (`bg-warning-soft text-warning-ink`,
  `Badge variant`), `text-xs`/`text-sm` only, `rounded-lg` cards, no raw palette colours.
- Use `/impeccable critique|audit|polish` only on the files being changed. Don't run `bolder`,
  `typeset`, `colorize`, `overdrive` or `layout` across the app.
- Scan: `.claude/skills/impeccable/scripts/impeccable detect src/`
  should stay clean (exit 0). Add a scoped ignore with `impeccable ignores` rather than disabling the hook.
