// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["directs"]` is the feature root, so
// `invalidateQueries({ queryKey: ["directs"] })` after a write refreshes list + detail +
// the options dropdown in one call.
export { directsQueryOptions } from "@/features/directs/api/options/directs.options"
export { directQueryOptions } from "@/features/directs/api/options/direct.options"
