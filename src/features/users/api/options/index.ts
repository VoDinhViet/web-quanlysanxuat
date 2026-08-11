// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["users"]` is the feature root, so
// `invalidateQueries({ queryKey: ["users"] })` after a write refreshes list + detail in one
// call.
export { usersQueryOptions } from "@/features/users/api/options/users.options"
export { userQueryOptions } from "@/features/users/api/options/user.options"
export { positionsQueryOptions } from "@/features/users/api/options/positions.options"
export { rolesQueryOptions } from "@/features/users/api/options/roles.options"
export { userOptionsQueryOptions } from "@/features/users/api/options/user-options.options"
