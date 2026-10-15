# Web QLSX

Internal ERP for manufacturing management ("Cơ khí Tiến Huy"): sales orders, production, purchasing,
inventory, quality (IQC/OQC/NCR) and delivery. TanStack Start, React, TypeScript, Tailwind CSS v4,
shadcn/ui. The backend is a separate NestJS service (`be-quanlysanxuat`).

## Getting started

```bash
pnpm install
cp .env.example .env   # then fill in the values
pnpm dev
```

Other commands: `pnpm typecheck`, `pnpm lint`, `pnpm format`, `pnpm build`.

## Docs

- `CLAUDE.md` and `.claude/rules/` — coding conventions and workflow.
- `PRODUCT.md` — users, purpose, principles. `DESIGN.md` — the visual system (source of truth is
  `src/styles.css`).
- `docs/ui-flow.md` — screen ↔ route ↔ status map.
