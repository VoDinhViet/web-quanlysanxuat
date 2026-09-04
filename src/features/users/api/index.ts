// Cross-feature read access to users (see .claude/rules/architecture.md "Layer boundaries") —
// only queryOptions factories and option hooks, never a raw server function, so a caller can't
// bypass the query cache. Currently the reads other features need (e.g. purchase-orders' and
// orders' "Người phụ trách"/"Nhân viên kinh doanh" pickers); the rest of this feature's reads
// (usersQueryOptions, userQueryOptions, ...) are consumed only within this feature's own pages
// and not exported here yet.
export { userOptionsQueryOptions } from "@/features/users/api/options"
export { useGetUserOptions } from "@/features/users/api/use-get-user-options"
