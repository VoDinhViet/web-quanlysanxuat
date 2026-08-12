// Every read in this feature — one queryOptions factory per file. Query key convention (see
// .claude/rules/architecture.md): ["iqc"] is the feature root, so
// invalidateQueries({ queryKey: ["iqc"] }) refreshes the whole feature.
export { iqcQueryOptions } from "@/features/iqc/api/options/iqc.options"
export { iqcsQueryOptions } from "@/features/iqc/api/options/iqcs.options"
export { iqcStatsQueryOptions } from "@/features/iqc/api/options/iqc-stats.options"
