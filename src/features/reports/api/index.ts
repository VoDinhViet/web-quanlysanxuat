// Public surface for other features: the only thing another feature may
// import from `reports` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` directly.
export { reportStatsQueryOptions } from "@/features/reports/api/options"
export type { ReportStatsParams } from "@/features/reports/api/options"
