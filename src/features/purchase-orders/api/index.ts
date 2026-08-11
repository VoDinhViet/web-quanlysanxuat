// Cross-feature read access to purchase-orders (see .claude/rules/architecture.md "Layer
// boundaries") — only queryOptions factories, never a raw server function, so a caller can't
// bypass the query cache. Currently just the one factory purchase-quotations' RFQ detail page
// needs; `purchaseOrdersQueryOptions` (the list page's own full-search read) isn't exported here
// — nothing outside this feature needs it yet.
export { purchaseOrdersByQuotationOptions } from "@/features/purchase-orders/api/options"
