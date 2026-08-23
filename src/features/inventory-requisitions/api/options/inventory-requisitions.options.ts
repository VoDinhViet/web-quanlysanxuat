import { queryOptions } from "@tanstack/react-query"

import { getInventoryRequisitions } from "@/features/inventory-requisitions/api/server-functions/get-inventory-requisitions.api"
import type { InventoryRequisitionsSearchSchema } from "@/features/inventory-requisitions/schemas/inventory-requisitions-search.schema"

export const inventoryRequisitionsQueryOptions = (
  search: InventoryRequisitionsSearchSchema
) =>
  queryOptions({
    queryKey: ["inventory-requisitions", "list", search],
    queryFn: () => getInventoryRequisitions({ data: search }),
  })
