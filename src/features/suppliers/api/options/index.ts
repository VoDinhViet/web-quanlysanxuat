// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["suppliers"]` is the feature root, so
// `invalidateQueries({ queryKey: ["suppliers"] })` after a write refreshes list + stats +
// detail + the options dropdown in one call.
export { suppliersQueryOptions } from "@/features/suppliers/api/options/suppliers.options"
export { supplierStatsQueryOptions } from "@/features/suppliers/api/options/supplier-stats.options"
export { supplierQueryOptions } from "@/features/suppliers/api/options/supplier.options"
export { supplierGroupOptionsQueryOptions } from "@/features/suppliers/api/options/supplier-group-options.options"
export { supplierOptionsQueryOptions } from "@/features/suppliers/api/options/supplier-options.options"
