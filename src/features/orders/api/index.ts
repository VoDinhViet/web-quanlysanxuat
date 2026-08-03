// Cross-feature read access to orders (see .claude/rules/architecture.md "Layer
// boundaries") — only queryOptions factories, never a raw server function, so a
// caller can't bypass the query cache.
export {
  orderQueryOptions,
  ordersQueryOptions,
} from "@/features/orders/api/options"
