// Every read in this feature — one queryOptions factory per file. Query key convention (see
// .claude/rules/architecture.md): ["reports"] is the feature root, so
// invalidateQueries({ queryKey: ["reports"] }) refreshes the whole feature.
export { reportAlertsQueryOptions } from "@/features/reports/api/options/report-alerts.options"
export { jobDueDateQueryOptions } from "@/features/reports/api/options/job-due-date.options"
export { outsourcingOrderDueDateQueryOptions } from "@/features/reports/api/options/outsourcing-order-due-date.options"
export { openNcrQueryOptions } from "@/features/reports/api/options/open-ncr.options"
export { qcPassRateQueryOptions } from "@/features/reports/api/options/qc-pass-rate.options"
export { reportStatsQueryOptions } from "@/features/reports/api/options/report-stats.options"
export type { ReportStatsParams } from "@/features/reports/api/options/report-stats.options"
export { productionProgressQueryOptions } from "@/features/reports/api/options/production-progress.options"
export type { ProductionProgressParams } from "@/features/reports/api/options/production-progress.options"
