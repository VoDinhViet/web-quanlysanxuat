// Public surface for other features: the only thing another feature may
// import from `inventory-requisitions` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `api/options/` directly. `requisitionLinesQueryOptions` is this feature's own detail-page
// sub-resource read, not exported here.
export { inventoryRequisitionsQueryOptions } from "@/features/inventory-requisitions/api/options"
export { inventoryRequisitionQueryOptions } from "@/features/inventory-requisitions/api/options"
