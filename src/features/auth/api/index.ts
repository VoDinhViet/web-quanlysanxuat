// Public surface for other features: the only thing another feature may
// import from `auth` (see .claude/rules/architecture.md's cross-feature
// import rule) — never reach into `api/server-functions/` or
// `api/options/` directly.
export { currentUserQueryOptions } from "@/features/auth/api/options"
export { currentPermissionsQueryOptions } from "@/features/auth/api/options"
export { useLogout } from "@/features/auth/api/use-logout"
