import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { InventoryMaterialsPage } from "@/features/inventory-materials/pages/InventoryMaterialsPage"
import { materialInventoryQueryOptions } from "@/features/inventory-materials/api/options/material-inventory.options"
import { inventoryMaterialsSearchSchema } from "@/features/inventory-materials/schemas/inventory-materials-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { warehouseOptionsQueryOptions } from "@/features/warehouses/api"

export const Route = createFileRoute("/(authed)/manage_/inventory-materials")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "inventory:read"),
  validateSearch: inventoryMaterialsSearchSchema,
  // No loaderDeps: filter/pagination navigation must not create a new route
  // match (that would re-trigger the loader and blank the page). The list is
  // read client-side via useQuery. `location.search` is router-validated at
  // runtime — re-parsing it is the type-safe way to recover the real shape
  // without an `as` cast.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        materialInventoryQueryOptions(
          inventoryMaterialsSearchSchema.parse(location.search)
        )
      ),
      context.queryClient.ensureQueryData(warehouseOptionsQueryOptions()),
      context.queryClient.ensureQueryData(supplierOptionsQueryOptions()),
    ]),
  component: InventoryMaterialsPage,
  pendingComponent: PageLoading,
})
