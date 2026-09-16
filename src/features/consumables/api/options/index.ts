// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["consumables"]` is the feature root, so
// `invalidateQueries({ queryKey: ["consumables"] })` after a write refreshes list + detail +
// the options dropdown in one call.
export { consumablesQueryOptions } from "@/features/consumables/api/options/consumables.options"
export { consumableQueryOptions } from "@/features/consumables/api/options/consumable.options"
