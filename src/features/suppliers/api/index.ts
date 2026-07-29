// Public surface for other features: the only thing another feature may
// import from `suppliers` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `suppliers.options.ts` directly.
export { supplierOptionsQueryOptions } from "@/features/suppliers/api/suppliers.options"
