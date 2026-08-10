// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["orders"]` is the feature root, so
// `invalidateQueries({ queryKey: ["orders"] })` after a write refreshes list + stats in one
// call.
export { ordersQueryOptions } from "@/features/orders/api/options/orders.options"
export { orderStatsQueryOptions } from "@/features/orders/api/options/order-stats.options"
export { orderQueryOptions } from "@/features/orders/api/options/order.options"
export { exchangeRateQueryOptions } from "@/features/orders/api/options/exchange-rate.options"
