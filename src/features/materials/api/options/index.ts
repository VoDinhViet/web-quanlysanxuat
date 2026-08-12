// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["materials"]` is the feature root, so
// `invalidateQueries({ queryKey: ["materials"] })` after a write refreshes list + detail +
// the options dropdown in one call.
export { materialsQueryOptions } from "@/features/materials/api/options/materials.options"
export { materialQueryOptions } from "@/features/materials/api/options/material.options"
