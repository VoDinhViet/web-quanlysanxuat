## UI workflow (Impeccable)

Impeccable is installed (`.claude/skills/impeccable/`, config `.impeccable/config.json`). Its
detector hook runs from `.claude/settings.json`: a scan after each Edit/Write on UI files and a
deep pass on Stop. Context for every UI task:

- `PRODUCT.md` — users, purpose, principles. Already written; don't re-run `init`.
- `DESIGN.md` — the existing visual system. It documents `src/styles.css` (the token source); it
  is not a redesign brief. Changed tokens in `src/styles.css` → `/impeccable document`.
- `ui-kit.md` — shared components in `src/components/shared/`; reuse before writing new ones.

### Which command, when

Always pass the file or route being changed as the target; never run a command app-wide.

| Task                                   | Command                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| New screen or section                  | `/impeccable shape <route>`, then build from `DESIGN.md` + kit                           |
| Change to an existing screen           | Refinement: keep identity, copy and behaviour outside the scope                          |
| Review a finished UI change            | `audit` (a11y, responsive, theming); `critique` only on request                          |
| Fix what a review found                | `polish`, `harden`, `clarify` (Vietnamese copy), `distill`, `adapt`, `layout`, `quieter` |
| Do not use on this app                 | `bolder`, `colorize`, `typeset`, `overdrive`, `delight`, `animate`                       |
| Browser iteration (`live`, `generate`) | Only when the user asks                                                                  |

### Guardrails

- Semantic tone tokens (`bg-warning-soft text-warning-ink`, `Badge variant`), never raw palette
  colours; `text-xs`/`text-sm` only; `rounded-lg` cards.
- Compose classes with `cn()` (`src/lib/utils.ts`), passing the class string straight in rather
  than parking it in an intermediate `const`.
- Icon-only buttons need `aria-label`; invalid inputs need `aria-invalid`; every `<button>` inside
  a `<form>` has an explicit `type`.

### Detector findings

`.claude/skills/impeccable/scripts/impeccable detect <changed UI files>` must exit 0.

- Real problem → fix it.
- Confirmed false positive → narrowest ignore, with evidence:
  `impeccable hooks ignore-value <rule> "*" --file <path> --reason "<who decided: why>"`.
- `ignore-file` and `ignore-rule` silence too much — ask first. Never turn the hook off.
