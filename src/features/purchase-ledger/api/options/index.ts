// Every read in this feature — one queryOptions factory per file. Query key convention (see
// .claude/rules/architecture.md): ["purchase-ledger"] is the feature root, so
// invalidateQueries({ queryKey: ["purchase-ledger"] }) refreshes the whole feature.
export { purchaseLedgerQueryOptions } from "@/features/purchase-ledger/api/options/purchase-ledger.options"
