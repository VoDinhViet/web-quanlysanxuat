// Every read in this feature — one queryOptions factory per file. Query key convention
// (see .claude/rules/architecture.md): `["purchase-requests"]` is the feature root, so
// `invalidateQueries({ queryKey: ["purchase-requests"] })` refreshes the whole feature.
export { purchaseRequestsQueryOptions } from "@/features/purchase-requests/api/options/purchase-requests.options"
export { purchaseRequestQueryOptions } from "@/features/purchase-requests/api/options/purchase-request.options"
