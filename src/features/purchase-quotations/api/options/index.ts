// Every read in this feature — one queryOptions factory per file. Query key convention (see
// .claude/rules/architecture.md): ["purchase-quotations"] is the feature root, so
// invalidateQueries({ queryKey: ["purchase-quotations"] }) refreshes the whole feature.
export { purchaseQuotationsQueryOptions } from "@/features/purchase-quotations/api/options/purchase-quotations.options"
