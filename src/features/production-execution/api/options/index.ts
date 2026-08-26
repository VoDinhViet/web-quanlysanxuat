// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): ["production-execution"] is the feature root, so
// `invalidateQueries({ queryKey: ["production-execution"] })` refreshes the whole feature.
export { productionOperationSummaryQueryOptions } from "@/features/production-execution/api/options/production-operation-summary.options"
export { productionJobsByOperationQueryOptions } from "@/features/production-execution/api/options/production-jobs-by-operation.options"
