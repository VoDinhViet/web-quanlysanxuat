// Every read in this feature — one queryOptions factory per file. Query key convention (see
// .claude/rules/architecture.md): ["outbound-orders"] is the feature root, so
// invalidateQueries({ queryKey: ["outbound-orders"] }) refreshes the whole feature.
export { outboundOrdersQueryOptions } from "@/features/outbound-orders/api/options/outbound-orders.options"
export { outboundOrderQueryOptions } from "@/features/outbound-orders/api/options/outbound-order.options"
export { outboundOrderItemsQueryOptions } from "@/features/outbound-orders/api/options/outbound-order-items.options"
export { unfulfilledOrderItemsQueryOptions } from "@/features/outbound-orders/api/options/unfulfilled-order-items.options"
