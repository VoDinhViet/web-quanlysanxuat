// Cross-feature read access to roles (see .claude/rules/architecture.md "Layer boundaries") —
// only queryOptions factories, never a raw server function, so a caller can't bypass the query
// cache. `users` reads `rolesQueryOptions` for the "Vai trò" select in the credential section.
export { rolesQueryOptions } from "@/features/roles/api/options"
