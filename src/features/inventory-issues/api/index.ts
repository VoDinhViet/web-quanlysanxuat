// Public surface for other features: the only thing another feature may
// import from `inventory-issues` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `api/options/` directly.
export { inventoryIssuesQueryOptions } from "@/features/inventory-issues/api/options"
