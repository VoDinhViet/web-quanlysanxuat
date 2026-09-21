// Public surface for other features: the only thing another feature may import from
// `outsourcing-orders` (see .claude/rules/architecture.md's cross-feature import rule) — never
// reach into `api/server-functions/` or `api/options/` directly. `production-jobs` reads this to
// show "SL đã gửi" per công đoạn on ProductionJobOperationsTab.tsx. `manage` reads
// `outsourcingOrdersQueryOptions` for the dashboard's "Gia công ngoài trễ hạn" widget.
export { outsourceableOperationsQueryOptions } from "@/features/outsourcing-orders/api/options"
export { outsourcingOrdersQueryOptions } from "@/features/outsourcing-orders/api/options"
