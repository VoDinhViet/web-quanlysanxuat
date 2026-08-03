// Cross-feature read access to production orders (see .claude/rules/architecture.md "Layer
// boundaries") — only queryOptions factories, never a raw server function, so a
// caller can't bypass the query cache.
export { productionOrderQueryOptions } from "@/features/production-orders/api/options"
