// Public surface for other features: the only thing another feature may
// import from `outsourcing-receipts` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `api/options/` directly. `outsourcingReceiptItemsQueryOptions`/`pendingOrderItemsQueryOptions`
// are this feature's own detail/create-wizard reads, not exported here.
export { outsourcingReceiptsQueryOptions } from "@/features/outsourcing-receipts/api/options"
export { outsourcingReceiptQueryOptions } from "@/features/outsourcing-receipts/api/options"
