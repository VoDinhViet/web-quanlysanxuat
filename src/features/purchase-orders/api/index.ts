// Cross-feature read access to purchase-orders (see .claude/rules/architecture.md "Layer
// boundaries") — only queryOptions factories, never a raw server function, so a caller can't
// bypass the query cache.
export { purchaseOrdersByQuotationOptions } from "@/features/purchase-orders/api/options"
// inventory-receipts' create form needs both: pick an ORDERED PO (list) then read its committed
// lines (detail) for the "Từ PO" item-picker mode.
export { purchaseOrdersQueryOptions } from "@/features/purchase-orders/api/options"
export { purchaseOrderQueryOptions } from "@/features/purchase-orders/api/options"
