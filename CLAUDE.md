# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Web QLSX — an internal ERP for manufacturing management ("Cơ khí Tiến Huy"). All UI text
is Vietnamese; all code, identifiers, comments, and docs are English.

`docs/CODEMAPS/INDEX.md` is the entry point for tracing a screen: route, page, server function, BE endpoint,
permission and status flow, one file per domain group plus `architecture`, `routes` and the cross-stack
`system-flow`. Read it before opening a domain's code. A codemap is a map and the code is the source of truth:
when they disagree, trust the code and fix the codemap.

Detailed conventions live in `.claude/rules/` and load automatically: `project-structure`,
`workflow`, `architecture`, `code-style`, `type-safety-and-security`, `design` (UI workflow),
`forms-and-ui`, `ui-kit`, `data-layer`. UI work also reads `PRODUCT.md` and `DESIGN.md`
(Impeccable context). `ecc/` is the unmodified ECC 2.2.3 base (`common`, `typescript`, `react`);
`project-overrides` lists where this project departs from it and wins on conflict.
