import { queryOptions } from "@tanstack/react-query"

import { getItemInventory } from "@/features/inventory-products/api/server-functions/get-item-inventory.api"

// Single-item stock overview backing the detail screen's "TỔNG QUAN TỒN KHO" tiles — distinct
// from `inventoryProductsQueryOptions`, the paginated list behind /manage/inventory-products.
export const itemInventoryQueryOptions = (itemId: string) =>
  queryOptions({
    queryKey: ["inventory-products", "detail", itemId],
    // Fast-moving tier (see src/router.tsx): stock changes with every receipt/issue — always revalidate on mount.
    staleTime: 0,
    queryFn: () => getItemInventory({ data: { itemId } }),
  })
