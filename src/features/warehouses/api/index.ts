// Public surface for other features: the only thing another feature may
// import from `warehouses` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` directly.
export { warehouseOptionsQueryOptions } from "@/features/warehouses/api/options"
