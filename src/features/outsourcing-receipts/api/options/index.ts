// Every read in this feature — one queryOptions factory per file. Query key convention (see
// .claude/rules/architecture.md): ["outsourcing-receipts"] is the feature root, so
// invalidateQueries({ queryKey: ["outsourcing-receipts"] }) refreshes the whole feature.
export { outsourcingReceiptsQueryOptions } from "@/features/outsourcing-receipts/api/options/outsourcing-receipts.options"
export { outsourcingReceiptQueryOptions } from "@/features/outsourcing-receipts/api/options/outsourcing-receipt.options"
export { pendingOrderItemsQueryOptions } from "@/features/outsourcing-receipts/api/options/pending-order-items.options"
