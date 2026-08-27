import { queryOptions } from "@tanstack/react-query"

import { getItemInventory } from "@/features/inventory-products/api/server-functions/get-item-inventory.api"

// Single-item stock overview backing the detail screen's "TỔNG QUAN TỒN KHO" tiles — distinct
// from `inventoryProductsQueryOptions`, the paginated list behind /manage/inventory-products.
export const itemInventoryQueryOptions = (itemId: string) =>
  queryOptions({
    queryKey: ["inventory-products", "detail", itemId],
    queryFn: () => getItemInventory({ data: { itemId } }),
  })
