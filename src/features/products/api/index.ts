// Public surface for other features: the only thing another feature may
// import from `products` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `products.options.ts` directly.
export { productOptionsQueryOptions } from "@/features/products/api/products.options"
