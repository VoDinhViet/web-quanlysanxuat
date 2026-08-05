import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { InventoryMaterialsPage } from "@/features/inventory-materials/pages/InventoryMaterialsPage"
import { inventoryMaterialsQueryOptions } from "@/features/inventory-materials/api/options/inventory-materials.options"
import { inventoryMaterialsSearchSchema } from "@/features/inventory-materials/schemas/inventory-materials-search.schema"
import { materialGroupOptionsQueryOptions } from "@/features/materials/api/options"

export const Route = createFileRoute(
  "/(authed)/manage_/inventory-materials"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "materials:read"),
  validateSearch: inventoryMaterialsSearchSchema,
  // No loaderDeps: filter/pagination navigation must not create a new route
  // match (that would re-trigger the loader and blank the page). The list is
  // read client-side via useQuery. `location.search` is router-validated at
  // runtime — re-parsing it is the type-safe way to recover the real shape
  // without an `as` cast.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        inventoryMaterialsQueryOptions(
          inventoryMaterialsSearchSchema.parse(location.search)
        )
      ),
      context.queryClient.ensureQueryData(materialGroupOptionsQueryOptions()),
    ]),
  component: InventoryMaterialsPage,
  pendingComponent: PageLoading,
})
