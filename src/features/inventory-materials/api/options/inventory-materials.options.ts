import { queryOptions } from "@tanstack/react-query"

import { getInventoryMaterials } from "@/features/inventory-materials/api/server-functions/get-inventory-materials.api"
import type { InventoryMaterialsSearchSchema } from "@/features/inventory-materials/schemas/inventory-materials-search.schema"

export const inventoryMaterialsQueryOptions = (
  search: InventoryMaterialsSearchSchema
) =>
  queryOptions({
    queryKey: ["inventory-materials", "list", search],
    queryFn: () => getInventoryMaterials({ data: search }),
  })
