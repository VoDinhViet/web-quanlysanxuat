// Public surface for other features: the only thing another feature may
// import from `units` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` directly.
export { unitOptionsQueryOptions } from "@/features/units/api/options"
