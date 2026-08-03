// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["production-orders"]` is the feature root, so
// `invalidateQueries({ queryKey: ["production-orders"] })` refreshes list + detail in one
// call.
export { productionOrdersQueryOptions } from "@/features/production-orders/api/options/production-orders.options"
export { productionOrderQueryOptions } from "@/features/production-orders/api/options/production-order.options"
export { productionOrderLogsQueryOptions } from "@/features/production-orders/api/options/production-order-logs.options"
