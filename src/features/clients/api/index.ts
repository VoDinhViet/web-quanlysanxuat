// Public surface for other features: the only thing another feature may
// import from `clients` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `clients.options.ts` directly.
export { clientOptionsQueryOptions } from "@/features/clients/api/clients.options"
export { useGetClientOptions } from "@/features/clients/api/use-get-client-options"
