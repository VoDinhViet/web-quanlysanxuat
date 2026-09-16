import { queryOptions } from "@tanstack/react-query"

import { getConsumableInventory } from "@/features/inventory-consumables/api/server-functions/get-consumable-inventory.api"
import type { InventoryConsumablesSearchSchema } from "@/features/inventory-consumables/schemas/inventory-consumables-search.schema"

// Key root stays `["inventory-consumables"]` (the feature name), not `["consumable-inventory"]`
// (the renamed function) — see .claude/rules/architecture.md: the key root tracks the feature,
// not any one factory inside it.
export const consumableInventoryQueryOptions = (
  search: InventoryConsumablesSearchSchema
) =>
  queryOptions({
    queryKey: ["inventory-consumables", "list", search],
    queryFn: () => getConsumableInventory({ data: search }),
  })
