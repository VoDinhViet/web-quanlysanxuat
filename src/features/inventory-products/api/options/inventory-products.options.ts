import { queryOptions } from "@tanstack/react-query"

import { getProductInventory } from "@/features/inventory-products/api/server-functions/get-product-inventory.api"
import type { InventoryProductsSearchSchema } from "@/features/inventory-products/schemas/inventory-products-search.schema"

export const inventoryProductsQueryOptions = (
  search: InventoryProductsSearchSchema
) =>
  queryOptions({
    queryKey: ["inventory-products", "list", search],
    queryFn: () => getProductInventory({ data: search }),
  })
