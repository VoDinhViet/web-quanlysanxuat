// Public surface for other features: the only thing another feature may
// import from `suppliers` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `api/options/` directly.
export { supplierOptionsQueryOptions } from "@/features/suppliers/api/options"
