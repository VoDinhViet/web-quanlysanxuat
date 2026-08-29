// Public surface for other features: the only thing another feature may
// import from `iqc` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `api/options/` directly. `iqcStatsQueryOptions`/`iqcAqlPlanQueryOptions` are this feature's
// own page-specific reads, not exported here.
export { iqcQueryOptions } from "@/features/iqc/api/options"
export { iqcsQueryOptions } from "@/features/iqc/api/options"
