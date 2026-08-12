// Every read in this feature — one queryOptions factory per file. Query key convention (see
// .claude/rules/architecture.md): ["supplier-returns"] is the feature root, so
// invalidateQueries({ queryKey: ["supplier-returns"] }) refreshes the whole feature.
export { supplierReturnsQueryOptions } from "@/features/supplier-returns/api/options/supplier-returns.options"
export { supplierReturnQueryOptions } from "@/features/supplier-returns/api/options/supplier-return.options"
