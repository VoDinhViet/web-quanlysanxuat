// Every read in this feature — one queryOptions factory per file. Query key convention (see
// .claude/rules/architecture.md): ["oqc"] is the feature root, so
// invalidateQueries({ queryKey: ["oqc"] }) refreshes the whole feature. No oqc-stats.options.ts —
// unlike IQC, the backend has no GET /oqc/stats.
export { oqcsQueryOptions } from "@/features/oqc/api/options/oqcs.options"
export { oqcQueryOptions } from "@/features/oqc/api/options/oqc.options"
