import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { InventoryMaterialsPage } from "@/features/inventory-materials/pages/InventoryMaterialsPage"
import { materialInventoryQueryOptions } from "@/features/inventory-materials/api/options/material-inventory.options"
import { inventoryMaterialsSearchSchema } from "@/features/inventory-materials/schemas/inventory-materials-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"

export const Route = createFileRoute("/(authed)/manage_/inventory-materials/")({
  validateSearch: inventoryMaterialsSearchSchema,
  // No loaderDeps: filter/pagination navigation must not create a new route
  // match (that would re-trigger the loader and blank the outlet). The list is
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
      context.queryClient.ensureQueryData(supplierOptionsQueryOptions()),
    ]),
  component: InventoryMaterialsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
