import { queryOptions } from "@tanstack/react-query"

import { getMaterialInventory } from "@/features/inventory-materials/api/server-functions/get-material-inventory.api"
import type { InventoryMaterialsSearchSchema } from "@/features/inventory-materials/schemas/inventory-materials-search.schema"

// Key root stays `["inventory-materials"]` (the feature name), not `["material-inventory"]`
// (the renamed function) — see .claude/rules/architecture.md: the key root tracks the feature,
// not any one factory inside it.
export const materialInventoryQueryOptions = (
  search: InventoryMaterialsSearchSchema
) =>
  queryOptions({
    queryKey: ["inventory-materials", "list", search],
    queryFn: () => getMaterialInventory({ data: search }),
  })
