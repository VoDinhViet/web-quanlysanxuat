// Public surface for other features: the only thing another feature may
// import from `directs` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or `api/options/`
// directly.
export { directsQueryOptions } from "@/features/directs/api/options"
