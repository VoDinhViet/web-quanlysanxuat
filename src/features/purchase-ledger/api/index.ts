// Public surface for other features: the only thing another feature may
// import from `purchase-ledger` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `api/options/` directly.
export { purchaseLedgerQueryOptions } from "@/features/purchase-ledger/api/options"
