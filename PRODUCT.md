# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

TanStack Start (React, TypeScript), Tailwind CSS v4, shadcn/ui, TanStack Query/Form/Table. Backend is a
separate NestJS + Drizzle service (`be-quanlysanxuat`).

## Users

Staff of a mechanical / mould manufacturer ("Cơ khí Tiến Huy"): sales, production planners and
workshop operators, warehouse, purchasing, QC inspectors, accountants and the director (approvals).
Internal use only, desktop-first, used all day for data entry and review.

## Product Purpose

Internal ERP covering the order-to-delivery chain: sales orders, production orders and jobs,
material requisitions, purchasing, inventory, quality (IQC/OQC/NCR) and delivery. Success is fewer
mistakes and faster, traceable handoffs between departments.

## Positioning

A dense, trustworthy work tool, not a marketing surface. Information clarity and speed of entry beat
decoration.

## Operating Context

All user-visible text is Vietnamese. Long tables, filters, multi-step forms and approval flows.
Access is gated by role permissions (`PermissionGate`).

## Capabilities and Constraints

- Server functions are the only trust boundary; tokens live only in the httpOnly session cookie.
- Layout and components follow the existing shadcn kit and `src/components/shared/`.
- Light and dark themes both supported (`.dark`).

## Product Principles

- One consistent, modern style: extend the shared tokens and components rather than styling a screen on its own.
- Status must be readable at a glance (badge + colour tone), consistent across modules.
- Prefer clarity and density over novelty; no decorative effects on working screens.

## Accessibility & Inclusion

Vietnamese-first copy, sufficient contrast for status colours, `aria-label` on icon-only buttons,
`aria-invalid` on invalid inputs.
