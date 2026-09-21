// Public surface for other features: the only thing another feature may
// import from `inventory-receipts` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `api/options/` directly.
export { inventoryReceiptsQueryOptions } from "@/features/inventory-receipts/api/options"
export { inventoryReceiptQueryOptions } from "@/features/inventory-receipts/api/options"
