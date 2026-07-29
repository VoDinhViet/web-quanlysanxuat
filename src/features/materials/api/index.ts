// Public surface for other features: the only thing another feature may
// import from `materials` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `materials.options.ts` directly.
export { materialOptionsQueryOptions } from "@/features/materials/api/materials.options"
