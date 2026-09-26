import { queryOptions } from "@tanstack/react-query"

import { getProductInventory } from "@/features/inventory-products/api/server-functions/get-product-inventory.api"
import type { InventoryProductsSearchSchema } from "@/features/inventory-products/schemas/inventory-products-search.schema"

export const inventoryProductsQueryOptions = (
  search: InventoryProductsSearchSchema
) =>
  queryOptions({
    queryKey: ["inventory-products", "list", search],
    // Fast-moving tier (see src/router.tsx): stock levels change with every receipt/issue — always revalidate on mount.
    staleTime: 0,
    queryFn: () => getProductInventory({ data: search }),
  })
