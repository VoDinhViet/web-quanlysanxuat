// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["clients"]` is the feature root, so
// `invalidateQueries({ queryKey: ["clients"] })` after a write refreshes the list + the
// options dropdown in one call.
export { clientsQueryOptions } from "@/features/clients/api/options/clients.options"
export { clientQueryOptions } from "@/features/clients/api/options/client.options"
export { clientGroupOptionsQueryOptions } from "@/features/clients/api/options/client-group-options.options"
export { clientOptionsQueryOptions } from "@/features/clients/api/options/client-options.options"
