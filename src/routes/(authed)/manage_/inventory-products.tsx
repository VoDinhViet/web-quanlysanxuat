import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { inventoryProductsQueryOptions } from "@/features/inventory-products/api/options"
import { InventoryProductsPage } from "@/features/inventory-products/pages/InventoryProductsPage"
import { inventoryProductsSearchSchema } from "@/features/inventory-products/schemas/inventory-products-search.schema"

export const Route = createFileRoute("/(authed)/manage_/inventory-products")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "inventory:read"),
  validateSearch: inventoryProductsSearchSchema,
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      inventoryProductsQueryOptions(
        inventoryProductsSearchSchema.parse(location.search)
      )
    ),
  component: InventoryProductsPage,
  pendingComponent: PageLoading,
})
