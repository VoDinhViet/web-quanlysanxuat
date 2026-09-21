// Public surface for other features: the only thing another feature may
// import from `inventory-products` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `api/options/` directly. `itemInventoryQueryOptions`/`productLedgerQueryOptions` are this
// feature's own detail-page reads, not exported here — same as `products` keeping its
// bom/issues/operations tabs internal.
export { inventoryProductsQueryOptions } from "@/features/inventory-products/api/options"
