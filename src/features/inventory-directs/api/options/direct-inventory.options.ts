import { queryOptions } from "@tanstack/react-query"

import { getDirectInventory } from "@/features/inventory-directs/api/server-functions/get-direct-inventory.api"
import type { InventoryDirectsSearchSchema } from "@/features/inventory-directs/schemas/inventory-directs-search.schema"

// Key root stays `["inventory-directs"]` (the feature name), not `["direct-inventory"]`
// (the renamed function) — see .claude/rules/architecture.md: the key root tracks the feature,
// not any one factory inside it.
export const directInventoryQueryOptions = (
  search: InventoryDirectsSearchSchema
) =>
  queryOptions({
    queryKey: ["inventory-directs", "list", search],
    queryFn: () => getDirectInventory({ data: search }),
  })
