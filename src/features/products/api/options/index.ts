// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["items"]` is the feature root, so
// `invalidateQueries({ queryKey: ["items"] })` after a write refreshes list + detail + the
// options dropdown in one call.
export { itemsQueryOptions } from "@/features/products/api/options/items.options"
export { itemQueryOptions } from "@/features/products/api/options/item.options"
export { itemBomQueryOptions } from "@/features/products/api/options/item-bom.options"
export { itemIssuesQueryOptions } from "@/features/products/api/options/item-issues.options"
export { itemOperationsQueryOptions } from "@/features/products/api/options/item-operations.options"
export { itemOptionsQueryOptions } from "@/features/products/api/options/item-options.options"
export { orderItemOptionsQueryOptions } from "@/features/products/api/options/order-item-options.options"
