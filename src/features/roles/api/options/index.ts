// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["roles"]` is the feature root.
export { roleQueryOptions } from "@/features/roles/api/options/role.options"
export { rolesQueryOptions } from "@/features/roles/api/options/roles.options"
