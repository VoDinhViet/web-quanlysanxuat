// Public surface for other features: the only thing another feature may
// import from `departments` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` directly.
export { departmentQueryOptions } from "@/features/departments/api/options"
