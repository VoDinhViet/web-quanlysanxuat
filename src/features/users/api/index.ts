// Cross-feature read access to users (see .claude/rules/architecture.md "Layer boundaries") —
// only queryOptions factories, never a raw server function, so a caller can't bypass the query
// cache. Currently just the one factory other features need (e.g. purchase-orders' "Người phụ
// trách" picker); the rest of this feature's reads (usersQueryOptions, userQueryOptions, ...)
// are consumed only within this feature's own pages and not exported here yet.
export { userOptionsQueryOptions } from "@/features/users/api/options"
