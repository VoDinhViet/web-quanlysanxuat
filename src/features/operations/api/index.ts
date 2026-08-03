// Public surface for other features: the only thing another feature may
// import from `operations` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` directly.
export { useGetOperationOptions } from "@/features/operations/api/use-get-operation-options"
