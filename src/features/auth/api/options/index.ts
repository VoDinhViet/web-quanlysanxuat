// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["auth"]` is the feature root.
export { currentPermissionsQueryOptions } from "@/features/auth/api/options/current-permissions.options"
export { currentUserQueryOptions } from "@/features/auth/api/options/current-user.options"
