// Public surface for other features: the only thing another feature may
// import from `purchase-quotations` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `api/options/` directly.
export { purchaseQuotationsQueryOptions } from "@/features/purchase-quotations/api/options"
export { purchaseQuotationQueryOptions } from "@/features/purchase-quotations/api/options"
