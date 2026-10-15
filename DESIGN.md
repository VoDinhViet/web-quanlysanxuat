---
name: Web QLSX
description: Dense internal ERP UI for a mechanical manufacturer, Vietnamese copy, shadcn/Tailwind v4.
colors:
  background: "oklch(0.975 0.005 250)"
  foreground: "oklch(0.22 0.035 262)"
  primary: "oklch(0.44 0.19 263)"
  primary-foreground: "oklch(0.99 0.005 250)"
  secondary: "oklch(0.955 0.01 255)"
  muted-foreground: "oklch(0.48 0.03 257)"
  accent: "oklch(0.945 0.03 258)"
  border: "oklch(0.92 0.012 255)"
  destructive: "oklch(0.58 0.22 25)"
  success: "oklch(0.62 0.15 162)"
  warning: "oklch(0.75 0.15 75)"
  info: "oklch(0.62 0.14 235)"
  sidebar: "oklch(0.3 0.03 255)"
  success-soft: "oklch(0.96 0.035 162)"
  success-ink: "oklch(0.44 0.11 162)"
  warning-soft: "oklch(0.965 0.05 85)"
  warning-ink: "oklch(0.48 0.11 65)"
  info-soft: "oklch(0.96 0.025 235)"
  info-ink: "oklch(0.42 0.12 245)"
  destructive-soft: "oklch(0.965 0.025 20)"
  destructive-ink: "oklch(0.5 0.19 27)"
  violet-soft: "oklch(0.96 0.03 305)"
  violet-ink: "oklch(0.45 0.17 305)"
  neutral-soft: "oklch(0.955 0.008 255)"
  neutral-ink: "oklch(0.42 0.03 257)"
typography:
  body:
    fontFamily: "Nunito Sans Variable, sans-serif"
  heading:
    fontFamily: "Nunito Sans Variable, sans-serif"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
rounded:
  sm: "0.27rem"
  md: "0.36rem"
  lg: "0.5rem"
  xl: "0.7rem"
---

# Design System: Web QLSX

Source of truth is `src/styles.css` (CSS variables in `:root` / `.dark`, mapped through Tailwind
`@theme inline`). This file documents the existing look so new work stays consistent; it is not a
redesign brief.

## Overview

Calm, high-density business UI: white surfaces on a light neutral background, a single saturated blue
primary, a dark navy sidebar, small type and compact controls. Status is communicated through tinted
badges with a leading dot. Copy is Vietnamese.

## Colors

- **Primary** blue (`--primary`, also `--ring`, sidebar primary) for the main action and focus.
- **Neutrals** are slightly blue-tinted (`--secondary`, `--muted`, `--border`, `--input`).
- **Semantic**: `--success`, `--warning`, `--info`, `--destructive`, each with a foreground token.
  Status tints use the soft/ink pairs (`bg-<tone>-soft text-<tone>-ink`, tones: success, warning,
  info, destructive, violet, neutral). Dark mode redefines the same names, so no `dark:` prefix.
- **Charts** `--chart-1…7`. Use semantic tokens (`text-foreground`, `bg-card`), not raw colours.

## Typography

- One style app-wide: Nunito Sans Variable (UI and headings, `font-heading`), IBM Plex Mono (`font-mono`,
  `tabular-nums` — codes and figures). No per-screen font themes.
- Scale: captions/labels `text-xs`, body/table/form `text-sm`, section titles `text-sm`/`text-base`
  `font-medium` (semibold only for page titles and key figures). No arbitrary sizes (`text-[11px]` etc.).

## Layout

Page = `PageTitleBar` (title + breadcrumbs) + content in a `p-4 sm:p-5 lg:p-6` column with `gap-4`.
Detail pages use a main column plus a ~320–340px side column (logs/timeline). Lists use filter bar,
table, then `Pagination`.

## Elevation & Depth

Page background is a faint cool grey (`--background`) so white cards lift; cards use a soft
`shadow-card`; popovers use `shadow-popover`. No heavy shadows,
no gradients on working screens.

## Shapes

Base radius `0.5rem` (`--radius`): cards `rounded-lg`, controls `rounded-md`, badges/pills
`rounded-full`. No bare `rounded`.

## Components

shadcn primitives in `src/components/ui/` (generated, do not hand-edit style), shared shells in
`src/components/shared/` (`PageTitleBar`, `Surface`, `TimelineCard`, `StatusNotice`, `Pagination`).
Badges: `Badge variant="success|warning|info|violet|neutral|destructive"` (soft tone tokens
`bg-{tone}-soft text-{tone}-ink`, same in dark mode); status → tone maps live in each feature.
Never use raw palette colours (`bg-amber-50 …`) for status tints.

## Do's and Don'ts

- Do reuse the existing tokens, badge pattern and page layout above.
- Do keep the Vietnamese copy and keep icon-only buttons labelled.
- Don't introduce new fonts, gradients, glow/neon effects or nested cards.
- Don't add per-screen themes; changes go through tokens in `src/styles.css`.
