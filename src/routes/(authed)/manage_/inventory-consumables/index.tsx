import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { InventoryConsumablesPage } from "@/features/inventory-consumables/pages/InventoryConsumablesPage"
import { consumableInventoryQueryOptions } from "@/features/inventory-consumables/api/options"
import { inventoryConsumablesSearchSchema } from "@/features/inventory-consumables/schemas/inventory-consumables-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"

export const Route = createFileRoute(
  "/(authed)/manage_/inventory-consumables/"
)({
  validateSearch: inventoryConsumablesSearchSchema,
  // No loaderDeps: filter/pagination navigation must not create a new route
  // match (that would re-trigger the loader and blank the outlet). The list is
  // read client-side via useQuery. `location.search` is router-validated at
  // runtime — re-parsing it is the type-safe way to recover the real shape
  // without an `as` cast.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.query({
        ...consumableInventoryQueryOptions(
          inventoryConsumablesSearchSchema.parse(location.search)
        ),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...supplierOptionsQueryOptions(),
        staleTime: "static",
      }),
    ]),
  component: InventoryConsumablesPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
