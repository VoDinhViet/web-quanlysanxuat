// Public surface for other features: the only thing another feature may
// import from `supplier-returns` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `api/options/` directly.
export { supplierReturnsQueryOptions } from "@/features/supplier-returns/api/options"
export { supplierReturnQueryOptions } from "@/features/supplier-returns/api/options"
