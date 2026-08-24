// Every read in this feature — one queryOptions factory per file. Query key convention (see
// .claude/rules/architecture.md): ["reports"] is the feature root, so
// invalidateQueries({ queryKey: ["reports"] }) refreshes the whole feature.
export { reportStatsQueryOptions } from "@/features/reports/api/options/report-stats.options"
export type { ReportStatsParams } from "@/features/reports/api/options/report-stats.options"
