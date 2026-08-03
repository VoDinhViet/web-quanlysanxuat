// Public surface for other features: the only thing another feature may
// import from `products` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `api/options/` directly.
export { orderProductOptionsQueryOptions } from "@/features/products/api/options"
