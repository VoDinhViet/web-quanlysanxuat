// Public surface for other features: the only thing another feature may
// import from `outbound-orders` (see .claude/rules/architecture.md's
// cross-feature import rule) — never reach into `api/server-functions/` or
// `api/options/` directly.
export { outboundOrdersQueryOptions } from "@/features/outbound-orders/api/options"
